import getPSConnection from '@/lib/planetscaledb';

export async function POST(request) {
  const selectedMonths = await request.json();
  console.log('POST message body:', selectedMonths);

  try {
    const connection = await getPSConnection();

    // Loop through the selectedMonths object and update the database
    for (const deviceId in selectedMonths) {
      const deviceMonths = selectedMonths[deviceId];
      for (const month in deviceMonths) {
        const value = deviceMonths[month];

        // Get the current Actual and Estimated values
        const [[currentValues]] = await connection.query(`
          SELECT \`Actual\`, \`Estimated\`
          FROM \`table\`
          WHERE \`Device ID\` = ? AND \`Month\` = ?
        `, [deviceId, month]);

        // Update the database based on the retrieved values
        await connection.query(`
          UPDATE \`table\`
          SET
            \`Actual\` = GREATEST(\`Actual\` - ?, 0),
            \`Actual_used\` = \`Actual_used\` + (CASE WHEN ? > 0 THEN ? ELSE 0 END),
            \`Estimated\` = GREATEST(\`Estimated\` - (CASE WHEN ? = 0 THEN ? ELSE 0 END), 0),
            \`Estimated_used\` = \`Estimated_used\` + (CASE WHEN ? = 0 THEN ? ELSE 0 END)
          WHERE \`Device ID\` = ? AND \`Month\` = ?
        `, [value, currentValues.Actual, value, currentValues.Actual, value, currentValues.Actual, value, deviceId, month]);
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Database updated successfully' }), {
      headers: { 'content-type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ message: 'Error updating the database' }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }
}