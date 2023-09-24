import getPSConnection from '@/lib/planetscaledb';

export async function DELETE(req) {
  const { transactionId, deviceId, monthData } = await req.json();
  console.log(transactionId);
  console.log(deviceId);
  console.log(monthData);

  try {
    const conn = await getPSConnection();

    // Begin transaction
    await conn.beginTransaction();

    // Delete the row from the buyers table
    await conn.query('UPDATE buyers SET `Status` = "Revoked" WHERE `Transaction ID` = ?', [transactionId]);

    // Loop through monthData and update the inventory table for each month
    for (const [month, valueToSubtract] of Object.entries(monthData)) {
      const [inventoryRow] = await conn.query('SELECT * FROM inventory WHERE `Device ID` = ? AND `month` = ?', [deviceId, month]);
      if (inventoryRow) {
        const actualUsed = inventoryRow['Actual_used'];
        const estimatedUsed = inventoryRow['Estimated_used'];

        if (actualUsed > 0) {
          await conn.query('UPDATE inventory SET `Actual_used` = `Actual_used` - ? WHERE `Device ID` = ? AND `month` = ?', [valueToSubtract, deviceId, month]);
        } else {
          await conn.query('UPDATE inventory SET `Estimated_used` = `Estimated_used` - ? WHERE `Device ID` = ? AND `month` = ?', [valueToSubtract, deviceId, month]);
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