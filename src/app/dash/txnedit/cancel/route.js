import getPSConnection from '@/lib/planetscaledb';

export async function DELETE(req) {
  const { transactionId, deviceId, monthData, year} = await req.json();
  console.log(transactionId);
  console.log(deviceId);
  console.log(monthData);
  console.log(year);

  try {
    const conn = await getPSConnection();

    // Begin transaction
    await conn.beginTransaction();

    // Delete the row from the buyers table
    await conn.query('UPDATE buyers SET `Status` = "Revoked" WHERE `Transaction ID` = ?', [transactionId]);

    // Loop through monthData and update the inventory2 table for each month
    for (const [month, valueToSubtract] of Object.entries(monthData)) {
      const lowercaseMonth = month.toLowerCase(); // Convert month name to lowercase
      const [[inventory2Row]] = await conn.query('SELECT `Actual_used`, `Estimated_used`, COALESCE(`Actual_used`, 0) AS `Actual_used`, COALESCE(`Estimated_used`, 0) AS `Estimated_used` FROM inventory2 WHERE `Device ID` = ? AND `month` = ? AND `Year` = ?', [deviceId, lowercaseMonth, year]);

      if (inventory2Row) {
        const actualUsed = inventory2Row['Actual_used'];
        const estimatedUsed = inventory2Row['Estimated_used'];

        if (actualUsed > 0) {
          await conn.query('UPDATE inventory2 SET `Actual_used` = COALESCE(`Actual_used`, 0) - ? WHERE `Device ID` = ? AND `month` = ? AND `Year` = ?', [valueToSubtract, deviceId, lowercaseMonth, year]);
        } else {
          await conn.query('UPDATE inventory2 SET `Estimated_used` = COALESCE(`Estimated_used`, 0) - ? WHERE `Device ID` = ? AND `month` = ? AND `Year` = ?', [valueToSubtract, deviceId, lowercaseMonth, year]);
        }
      }
    }

    // Commit transaction
    await conn.commit();

    return new Response(JSON.stringify({ message: 'Row deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(error);

    // Rollback transaction in case of error
    if (conn) {
      await conn.rollback();
    }

    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}