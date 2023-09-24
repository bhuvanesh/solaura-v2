import getPSConnection from '@/lib/planetscaledb';

export async function POST(request) {
  const {selectedMonths, organisation, uniqueId,year} = await request.json();
  console.log('POST message body1:', selectedMonths);
  console.log('POST message body2:', organisation);
  console.log('POST message body3:', uniqueId);
  console.log('POST message body4:', year);


  try {
    const connection = await getPSConnection();

    // Start a transaction
    await connection.beginTransaction();

    // Loop through the selectedMonths object and update the database
    // Loop through the selectedMonths object and update the database
for (const deviceId in selectedMonths) {
  const deviceMonths = selectedMonths[deviceId];

  for (const month in deviceMonths) {
    const value = deviceMonths[month];

    // Skip the month if the value is zero
    if (value === 0) {
      continue;
    }

    // Try to update the existing row
    const [updateResult] = await connection.query(`
    UPDATE buyers
    SET ${month} = ?, Status = 'succeeded'
    WHERE \`Transaction ID\` = ? AND \`Device ID\` = ? AND organisation = ?;
    `, [value, uniqueId, deviceId, organisation]);

    // If no row was updated, insert a new row
    if (updateResult.affectedRows === 0) {
      await connection.query(`
      INSERT INTO buyers (\`Transaction ID\`, \`Device ID\`, organisation, year, ${month}, Status)
      VALUES(?, ?, ?, ?, ?, 'succeeded');
      `, [uniqueId, deviceId, organisation, year, value]);
    }
  }
}

    // Commit the transaction
    await connection.commit();

    return new Response(JSON.stringify({ success: true, message: 'Buyer Database updated successfully!' }), { status: 200, headers: { 'Content-Type': 'application/json' }});
  } catch (error) {
    console.error("Error:", error);

    // Rollback the transaction and set the Status column to 'failed'
    await connection.rollback();
    await connection.query(` 
    UPDATE buyers
    SET Status = 'failed'
    WHERE \`Transaction ID\` = ?;
    `, [uniqueId]);

    return new Response(JSON.stringify({ message: 'Error updating the buyer database' }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}