import getPSConnection from '@/lib/planetscaledb';

export async function POST(request) {
  const selectedMonths = await request.json();
  console.log('POST message body1:', selectedMonths);

  try {
    const connection = await getPSConnection();
    await connection.beginTransaction(); 

    let updateStatements = [];

    for (const deviceId in selectedMonths) {
      if (deviceId === 'Year') continue; 
    
      const deviceMonths = selectedMonths[deviceId];
      for (const month in deviceMonths) {
        const value = deviceMonths[month];
    
        // Include the Year in the UPDATE statement and the parameters array
        updateStatements.push([
          `UPDATE \`inventory2\`
           SET
             \`Actual_used\` = COALESCE(\`Actual_used\`, 0) + (CASE WHEN COALESCE(\`Actual\`, 0) > 0 AND ? > 0 THEN ? ELSE 0 END),
             \`Estimated_used\` = COALESCE(\`Estimated_used\`, 0) + (CASE WHEN COALESCE(\`Actual\`, 0) = 0 THEN ? ELSE 0 END)
           WHERE \`Device ID\` = ? AND \`Month\` = ? AND \`Year\` = ?;`, 
          [value, value, value, deviceId, month, selectedMonths['Year']]
        ]);
      }
    }

    // Execute all update statements concurrently
    await Promise.all(updateStatements.map(param => connection.query(...param)));

    await connection.commit();

    return new Response(JSON.stringify({ success: true, message: 'Database updated successfully' }), {
      headers: { 'content-type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error:", error);
    await connection.rollback();

    return new Response(JSON.stringify({ message: 'Error updating database' }), {
      headers: { 'content-type': 'application/json' },
      status: 500,
    });
  }
}