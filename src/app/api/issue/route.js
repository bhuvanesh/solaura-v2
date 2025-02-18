import getPSConnection from '@/lib/planetscaledb';

// Month mapping for efficient comparison
const MONTH_MAP = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12
};

export async function POST(req) {
  const devices = await req.json();
  const connection = await getPSConnection();

  try {
    // Start transaction
    await connection.beginTransaction();

    // Insert devices into issued_process table, ignoring duplicates
    const deviceValues = devices.map(device => {
      const startDate = device.startDate.split('-').reverse().join('-');
      const endDate = device.endDate.split('-').reverse().join('-');
      return [device.device.split('-')[0].trim(), startDate, endDate, parseFloat(device.periodProduction)];
    });

    const insertQuery = `
      INSERT IGNORE INTO issued_process (device_id, start_date, end_date, period_production)
      VALUES ?
    `;
    await connection.execute(insertQuery, [deviceValues]);

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
          AND CASE 
            WHEN Month = 'january' THEN 1
            WHEN Month = 'february' THEN 2
            WHEN Month = 'march' THEN 3
            WHEN Month = 'april' THEN 4
            WHEN Month = 'may' THEN 5
            WHEN Month = 'june' THEN 6
            WHEN Month = 'july' THEN 7
            WHEN Month = 'august' THEN 8
            WHEN Month = 'september' THEN 9
            WHEN Month = 'october' THEN 10
            WHEN Month = 'november' THEN 11
            WHEN Month = 'december' THEN 12
          END
          BETWEEN ? AND ?
          ORDER BY \`Device ID\`, 
          CASE 
            WHEN Month = 'january' THEN 1
            WHEN Month = 'february' THEN 2
            WHEN Month = 'march' THEN 3
            WHEN Month = 'april' THEN 4
            WHEN Month = 'may' THEN 5
            WHEN Month = 'june' THEN 6
            WHEN Month = 'july' THEN 7
            WHEN Month = 'august' THEN 8
            WHEN Month = 'september' THEN 9
            WHEN Month = 'october' THEN 10
            WHEN Month = 'november' THEN 11
            WHEN Month = 'december' THEN 12
          END
        `;
        queryParams = [...deviceIds, startYear, MONTH_MAP[startMonth], MONTH_MAP[endMonth]];
      } else {
        query = `
          SELECT \`Device ID\`, Month, Year, Actual
          FROM inventory2
          WHERE \`Device ID\` IN (${placeholders})
          AND (
            (Year = ? AND 
              CASE 
                WHEN Month = 'january' THEN 1
                WHEN Month = 'february' THEN 2
                WHEN Month = 'march' THEN 3
                WHEN Month = 'april' THEN 4
                WHEN Month = 'may' THEN 5
                WHEN Month = 'june' THEN 6
                WHEN Month = 'july' THEN 7
                WHEN Month = 'august' THEN 8
                WHEN Month = 'september' THEN 9
                WHEN Month = 'october' THEN 10
                WHEN Month = 'november' THEN 11
                WHEN Month = 'december' THEN 12
              END >= ?
            )
            OR (Year > ? AND Year < ?)
            OR (Year = ? AND 
              CASE 
                WHEN Month = 'january' THEN 1
                WHEN Month = 'february' THEN 2
                WHEN Month = 'march' THEN 3
                WHEN Month = 'april' THEN 4
                WHEN Month = 'may' THEN 5
                WHEN Month = 'june' THEN 6
                WHEN Month = 'july' THEN 7
                WHEN Month = 'august' THEN 8
                WHEN Month = 'september' THEN 9
                WHEN Month = 'october' THEN 10
                WHEN Month = 'november' THEN 11
                WHEN Month = 'december' THEN 12
              END <= ?
            )
          )
          ORDER BY \`Device ID\`, Year, 
          CASE 
            WHEN Month = 'january' THEN 1
            WHEN Month = 'february' THEN 2
            WHEN Month = 'march' THEN 3
            WHEN Month = 'april' THEN 4
            WHEN Month = 'may' THEN 5
            WHEN Month = 'june' THEN 6
            WHEN Month = 'july' THEN 7
            WHEN Month = 'august' THEN 8
            WHEN Month = 'september' THEN 9
            WHEN Month = 'october' THEN 10
            WHEN Month = 'november' THEN 11
            WHEN Month = 'december' THEN 12
          END
        `;
        queryParams = [...deviceIds, startYear, MONTH_MAP[startMonth], startYear, endYear, endYear, MONTH_MAP[endMonth]];
      }

      const [rows] = await connection.execute(query, queryParams);

      calculatedData = pIssuedDevices.flatMap(device => {
        const deviceRows = rows.filter(row =>
          row['Device ID'] === device.device &&
          new Date(`${row.Year}-${row.Month}-01`) >= new Date(device.startDate) &&
          new Date(`${row.Year}-${row.Month}-01`) <= new Date(device.endDate)
        );

        const totalActual = deviceRows.reduce((sum, row) => {
          const actual = isNaN(parseFloat(row.Actual)) ? 0 : parseFloat(row.Actual);
          return sum + actual;
        }, 0);

        return deviceRows.map(row => {
          const actual = isNaN(parseFloat(row.Actual)) ? 0 : parseFloat(row.Actual);
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
        try {
          await connection.beginTransaction();
          
          const batchUpdateQuery = `
            INSERT INTO inventory2 (\`Device ID\`, Month, Year, Issued, issue_process)
            VALUES (?, ?, ?, ?, JSON_ARRAY(?))
            ON DUPLICATE KEY UPDATE
            Issued = COALESCE(Issued, 0) + VALUES(Issued),
            issue_process = CASE
              WHEN issue_process IS NULL OR JSON_LENGTH(issue_process) = 0 
              THEN JSON_ARRAY(VALUES(Issued))
              ELSE JSON_MERGE_PRESERVE(issue_process, JSON_ARRAY(VALUES(Issued)))
            END
          `;

          for (const record of calculatedData) {
            await connection.execute(batchUpdateQuery, [
              record.device,
              record.month,
              record.year,
              record.periodProduction,
              record.periodProduction
            ]);
          }

          await connection.commit();
        } catch (error) {
          await connection.rollback();
          throw error;
        }
      }
    }

    // Mark processed devices as processed - only for affected devices
    const deviceIdsToUpdate = [...new Set([
      ...issuedDevices.map(d => d.device),
      ...pIssuedDevices.map(d => d.device)
    ])];
    
    if (deviceIdsToUpdate.length > 0) {
      const updateQuery = `
        UPDATE issued_process 
        SET is_processed = TRUE 
        WHERE is_processed = FALSE 
        AND device_id IN (${deviceIdsToUpdate.map(() => '?').join(',')})
      `;
      await connection.execute(updateQuery, deviceIdsToUpdate);
    }

    // Commit main transaction
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