import getPSConnection from '@/lib/planetscaledb';

export async function POST(request) {
  const {selectedMonths, organisation, uniqueId} = await request.json();
  console.log('POST message body1:', selectedMonths);
  console.log('POST message body2:', organisation);
  console.log('POST message body3:', uniqueId);

  try {
    const connection = await getPSConnection();

    // Start a transaction
    await connection.beginTransaction();

    // Loop through the selectedMonths object and update the database
    for (const deviceId in selectedMonths) {
      const deviceMonths = selectedMonths[deviceId];

      for (const month in deviceMonths) {
        const value = deviceMonths[month];

        // Update the database
        await connection.query(`
        INSERT INTO buyers (\`Transaction ID\`, \`Device ID\`, organisation, ${month})
        VALUES(?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        organisation = VALUES(organisation),
        ${month} = VALUES(${month});
      `, [uniqueId, deviceId, organisation, value]);

        // Update the Status column to 'succeeded'
        await connection.query(`
        UPDATE buyers
        SET Status = 'succeeded'
        WHERE \`Transaction ID\` = ? AND \`Device ID\` = ? AND organisation = ?;
        `, [uniqueId, deviceId, organisation]);
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