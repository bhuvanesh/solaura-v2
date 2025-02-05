import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  const devices = await req.json();

  // Helper function to check if a date is the last day of the month
  const isEndOfMonth = (date) => {
    const d = new Date(date);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return d.getDate() === lastDay;
  };

  // Helper function to check if a date is the first day of the month
  const isStartOfMonth = (date) => {
    const d = new Date(date);
    return d.getDate() === 1;
  };

  // Helper function to get month name in lowercase
  const getMonthName = (date) => {
    return new Date(date).toLocaleString('default', { month: 'long' }).toLowerCase();
  };

  // Process and transform input devices data
  const processedDevices = devices.map(device => {
    // Convert date format from DD-MM-YYYY to YYYY-MM-DD
    const startDate = device.startDate.split('-').reverse().join('-');
    const endDate = device.endDate.split('-').reverse().join('-');

    // Determine if the device spans a full month
    const isFullMonth = isStartOfMonth(startDate) && isEndOfMonth(endDate);

    return {
      device: device.device.split('-')[0].trim(),
      startDate,
      endDate,
      status: isFullMonth ? 'Issued' : 'P_Issued',
      periodProduction: parseFloat(device.periodProduction)
    };
  });

  // Separate devices into full month and partial month issues
  const issuedDevices = processedDevices.filter(device => device.status === 'Issued');
  const pIssuedDevices = processedDevices.filter(device => device.status === 'P_Issued');

  const connection = await getPSConnection();

  try {
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
        ON DUPLICATE KEY UPDATE Issued = Actual;
      `;
      await connection.execute(updateIssuedQuery);
    }

    let calculatedData = [];

    // Handle P_Issued devices (partial month)
    if (pIssuedDevices.length > 0) {
      // Find date range for partial issued devices
      const earliestStart = new Date(Math.min(...pIssuedDevices.map(d => new Date(d.startDate))));
      const latestEnd = new Date(Math.max(...pIssuedDevices.map(d => new Date(d.endDate))));

      // Prepare query parameters
      const deviceIds = pIssuedDevices.map(device => device.device);
      const placeholders = deviceIds.map(() => '?').join(',');
      const startYear = earliestStart.getFullYear();
      const endYear = latestEnd.getFullYear();
      const startMonth = getMonthName(earliestStart);
      const endMonth = getMonthName(latestEnd);

      // Construct appropriate query based on whether dates span multiple years
      let query;
      let queryParams;

      if (startYear === endYear) {
        // Query for same year
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
        // Query for multiple years
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

      // Calculate production values for each device
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
          INSERT INTO inventory2 (\`Device ID\`, Month, Year, Issued)
          VALUES ${calculatedData.map(record => 
            `('${record.device}', '${record.month}', ${record.year}, ${record.periodProduction})`
          ).join(',')}
          ON DUPLICATE KEY UPDATE Issued = VALUES(Issued);
        `;
        
        await connection.execute(batchUpdateQuery);
      }
    }

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
