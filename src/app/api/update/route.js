import getPSConnection from '@/lib/planetscaledb';

export async function POST(request) {
  const selectedMonths = await request.json();
  console.log('POST message body:', selectedMonths);

  try {
    let connection = await getPSConnection();
    await connection.beginTransaction(); 

    let params = [];
    let placeholders = [];
    let deviceMonthYearTuples = [];

    for (const deviceId in selectedMonths) {
      if (deviceId === 'Year') continue; 

      const deviceMonths = selectedMonths[deviceId];
      for (const month in deviceMonths) {
        deviceMonthYearTuples.push([deviceId, month, selectedMonths['Year']]);
      }
    }

    // Fetch the 'Actual' values for the device id, month, and year tuples
    let [rows] = await connection.query(`SELECT \`Device ID\`, Month, Year, Actual FROM inventory2 WHERE (\`Device ID\`, Month, Year) IN (?)`, [deviceMonthYearTuples]);
    let actualValues = {};
    for (let row of rows) {
      let key = `${row['Device ID']}-${row.Month}-${row.Year}`;
      actualValues[key] = row.Actual;
    }

    for (const [deviceId, month, year] of deviceMonthYearTuples) {
      const value = selectedMonths[deviceId][month];
      let key = `${deviceId}-${month}-${year}`;
      let actual = actualValues[key] || null;

      if (actual > 0) {
        params.push(deviceId, month, year, value, 0);
      } else {
        params.push(deviceId, month, year, 0, value);
      }

      placeholders.push("(?, ?, ?, ?, ?)");
    }

    let sql = `INSERT INTO \`inventory2\` (\`Device ID\`, \`Month\`, \`Year\`, \`Actual_used\`, \`Estimated_used\`)
    VALUES ${placeholders.join(", ")}
    ON DUPLICATE KEY UPDATE
      \`Actual_used\` = COALESCE(\`Actual_used\`, 0) + VALUES(\`Actual_used\`),
      \`Estimated_used\` = COALESCE(\`Estimated_used\`, 0) + VALUES(\`Estimated_used\`);`

    // Execute the bulk insert statement
    await connection.query(sql, params);

    await connection.commit();

    return new Response(JSON.stringify({ success: true, message: 'Database updated successfully' }), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error:", error);
    if (connection) await connection.rollback();

    return new Response(JSON.stringify({ message: 'Error updating database' }), {
      headers: { 'content-type': 'application/json' },
      status: 500,
    });
  }
}