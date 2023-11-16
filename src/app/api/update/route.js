import getPSConnection from '@/lib/planetscaledb';

export async function POST(request) {
  const selectedMonths = await request.json();
  console.log('POST message body:', selectedMonths);

  try {
    let connection = await getPSConnection();
    await connection.beginTransaction(); 

    let params = [];
    let placeholders = [];

    for (const deviceId in selectedMonths) {
      if (deviceId === 'Year') continue; 

      const deviceMonths = selectedMonths[deviceId];
      for (const month in deviceMonths) {
        const value = deviceMonths[month];

        params.push(deviceId, month, selectedMonths['Year'], value, value);
        placeholders.push("(?, ?, ?, ?, ?)");
      }
    }

    let sql = `INSERT INTO \`inventory2beta\` (\`Device ID\`, \`Month\`, \`Year\`, \`Actual_used\`, \`Estimated_used\`)
               VALUES ${placeholders.join(", ")}
               ON DUPLICATE KEY UPDATE
                 \`Actual_used\` = VALUES(\`Actual_used\`),
                 \`Estimated_used\` = VALUES(\`Estimated_used\`);`

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