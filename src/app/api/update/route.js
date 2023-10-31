import getPSConnection from '@/lib/planetscaledb';

export async function POST(request) {
  const selectedMonths = await request.json();
  console.log('POST message body1:', selectedMonths);

  try {
    const connection = await getPSConnection();
    await connection.beginTransaction(); // Start the transaction

    // Loop through the selectedMonths object and update the database
    for (const deviceId in selectedMonths) {
      const deviceMonths = selectedMonths[deviceId];
      for (const month in deviceMonths) {
        const value = deviceMonths[month];

        // Get the current Actual and Estimated values
        const [[currentValues]] = await connection.query(`
          SELECT COALESCE(\`Actual\`, 0) as \`Actual\`, COALESCE(\`Estimated\`, 0) as \`Estimated\`
          FROM \`inventory2\`
          WHERE \`Device ID\` = ? AND \`Month\` = ?
        `, [deviceId, month]);
        console.log('CurrentValues:', currentValues);

        // Update the database based on the retrieved values
        const [updateResults] = await connection.query(`
        UPDATE \`inventory2\`
        SET
          \`Actual_used\` = COALESCE(\`Actual_used\`, 0) + (CASE WHEN COALESCE(\`Actual\`, 0) > 0 AND ? > 0 THEN ? ELSE 0 END),
          \`Estimated_used\` = COALESCE(\`Estimated_used\`, 0) + (CASE WHEN COALESCE(\`Actual\`, 0) = 0 THEN ? ELSE 0 END)
        WHERE \`Device ID\` = ? AND \`Month\` = ?
      `, [value, value, value, deviceId, month]);

        console.log('UpdateResults:', updateResults); 
      }
    }

    await connection.commit(); // Commit the transaction

    return new Response(JSON.stringify({ success: true, message: 'Database updated successfully' }), {
      headers: { 'content-type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error("Error:", error);
    await connection.rollback(); // Rollback the transaction in case of error
    return new Response(JSON.stringify({ message: 'Error updating the database' }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }
}