import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  const devices = await req.json();
  const connection = await getPSConnection();

  try {
    // Start transaction
    await connection.beginTransaction();

    // Insert devices into issued_process table, ignoring duplicates
    const insertQuery = `
      INSERT IGNORE INTO issued_process (device_id, start_date, end_date, period_production)
      VALUES ${devices.map(device => {
        const startDate = device.startDate.split('-').reverse().join('-');
        const endDate = device.endDate.split('-').reverse().join('-');
        return `('${device.device.split('-')[0].trim()}', '${startDate}', '${endDate}', ${parseFloat(device.periodProduction)})`;
      }).join(',')}
    `;
    await connection.execute(insertQuery);

    // Query unprocessed devices with traceback
    const [unprocessedDevices] = await connection.execute(`
      WITH previous_processed AS (
        SELECT
          ip.device_id,
          ip.end_date,
          ip.start_date AS prev_start_date,
          ROW_NUMBER() OVER (
            PARTITION BY ip.device_id, YEAR(ip.end_date), MONTH(ip.end_date)
            ORDER BY ip.end_date ASC
          ) AS rn
        FROM issued_process ip
        WHERE ip.is_processed = TRUE
      )
      SELECT
        ip.device_id,
        COALESCE(
          CASE
            WHEN DAY(ip.start_date) != 1 THEN pp.prev_start_date
            ELSE ip.start_date
          END,
          ip.start_date
        ) AS start_date,
        ip.end_date,
        ip.period_production,
        ip.is_processed,
        CASE
          WHEN DAY(ip.start_date) = 1 AND
               DAY(ip.end_date) = DAY(LAST_DAY(ip.end_date)) THEN 'Issued'
          ELSE 'P_Issued'
        END AS Status
      FROM issued_process ip
      LEFT JOIN previous_processed pp
        ON ip.device_id = pp.device_id
        AND YEAR(ip.start_date) = YEAR(pp.end_date)
        AND MONTH(ip.start_date) = MONTH(pp.end_date)
        AND pp.rn = 1
      WHERE ip.is_processed = FALSE
    `);

    console.log(unprocessedDevices);

    // Helper functions
    const getMonthName = (date) => {
      return new Date(date).toLocaleString('default', { month: 'long' }).toLowerCase();
    };

    // Process devices
    const processedDevices = unprocessedDevices.map(device => ({
      device: device.device_id,
      startDate: device.start_date,
      endDate: device.end_date,
      status: device.Status,
      periodProduction: parseFloat(device.period_production)
    }));

    const issuedDevices = processedDevices.filter(device => device.status === 'Issued');
    const pIssuedDevices = processedDevices.filter(device => device.status === 'P_Issued');

    // Handle Issued devices (full month)
    if (issuedDevices.length > 0) {
      const issuedValues = issuedDevices.map(device => {
        const month = getMonthName(device.startDate);
        const year = new Date(device.startDate).getFullYear();
        return `('${device.device}', '${month}', ${year})`;
      }).join(',');

      const updateIssuedQuery = `
        INSERT INTO inventory2 (\`Device ID\`, Month, Year)
        VALUES ${issuedValues}
        ON DUPLICATE KEY UPDATE Issued = Actual, issue_process = JSON_ARRAY(Actual);
      `;
      await connection.execute(updateIssuedQuery);
    }

    let calculatedData = [];

    // Handle P_Issued devices (partial month)
    if (pIssuedDevices.length > 0) {
      const earliestStart = new Date(Math.min(...pIssuedDevices.map(d => new Date(d.startDate))));
      const latestEnd = new Date(Math.max(...pIssuedDevices.map(d => new Date(d.endDate))));

      const deviceIds = pIssuedDevices.map(device => device.device);
      const placeholders = deviceIds.map(() => '?').join(',');
      const startYear = earliestStart.getFullYear();
      const endYear = latestEnd.getFullYear();
      const startMonth = getMonthName(earliestStart);
      const endMonth = getMonthName(latestEnd);

      let query, queryParams;

      if (startYear === endYear) {
        query = `
          SELECT \`Device ID\`, Month, Year, Actual
          FROM inventory2
          WHERE \`Device ID\` IN (${placeholders})
          AND Year = ?
          AND FIELD(Month, 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december')
          BETWEEN FIELD(?, 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december')
          AND FIELD(?, 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december')
          ORDER BY \`Device ID\`, FIELD(Month, 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december')
        `;
        queryParams = [...deviceIds, startYear, startMonth, endMonth];
      } else {
        query = `
          SELECT \`Device ID\`, Month, Year, Actual
          FROM inventory2
          WHERE \`Device ID\` IN (${placeholders})
          AND ((Year = ? AND FIELD(Month, 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december') >= FIELD(?, 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'))
          OR (Year > ? AND Year < ?)
          OR (Year = ? AND FIELD(Month, 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december') <= FIELD(?, 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december')))
          ORDER BY \`Device ID\`, Year, FIELD(Month, 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december')
        `;
        queryParams = [...deviceIds, startYear, startMonth, startYear, endYear, endYear, endMonth];
      }

      const [rows] = await connection.execute(query, queryParams);

      calculatedData = pIssuedDevices.flatMap(device => {
        const deviceRows = rows.filter(row =>
          row['Device ID'] === device.device &&
          new Date(`${row.Year}-${row.Month}-01`) >= new Date(device.startDate) &&
          new Date(`${row.Year}-${row.Month}-01`) <= new Date(device.endDate)
        );

        const totalActual = deviceRows.reduce((sum, row) => sum + parseFloat(row.Actual), 0);

        return deviceRows.map(row => {
          const actual = parseFloat(row.Actual);
          const p_value = totalActual !== 0 ? actual / totalActual : 0;
          const calculatedProduction = p_value * device.periodProduction;

          return {
            device: row['Device ID'],
            month: row.Month,
            year: row.Year,
            status: 'P_Issued',
            periodProduction: isNaN(calculatedProduction) ? '0.0000' : calculatedProduction.toFixed(4)
          };
        });
      });

      // Batch update for P_Issued devices
      if (calculatedData.length > 0) {
        const batchUpdateQuery = `
          INSERT INTO inventory2 (\`Device ID\`, Month, Year, Issued, issue_process)
          VALUES ${calculatedData.map(record =>
            `('${record.device}', '${record.month}', ${record.year}, ${record.periodProduction}, JSON_ARRAY(${record.periodProduction}))`
          ).join(',')}
          ON DUPLICATE KEY UPDATE
          Issued = COALESCE(Issued, 0) + VALUES(Issued),
          issue_process = CASE
          WHEN issue_process IS NULL THEN JSON_ARRAY(VALUES(Issued))
          ELSE JSON_ARRAY_INSERT(issue_process, '$[0]', VALUES(Issued))
          END;
        `;

        await connection.execute(batchUpdateQuery);
      }
    }

    // Mark processed devices as processed
    await connection.execute(
      'UPDATE issued_process SET is_processed = TRUE WHERE is_processed = FALSE'
    );

    // Commit transaction
    await connection.commit();

    await connection.end();

    return new Response(JSON.stringify({
      message: 'Data processed and updated successfully',
      issuedCount: issuedDevices.length,
      pIssuedCount: pIssuedDevices.length,
      calculatedData: calculatedData
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    await connection.end();
    return new Response(JSON.stringify({
      message: 'Error processing data',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}