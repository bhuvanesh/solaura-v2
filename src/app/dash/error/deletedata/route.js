import getPSConnection from '@/lib/planetscaledb';

export async function DELETE(req) {
  const data = await req.json();

  try {
    const conn = await getPSConnection();

    // Begin transaction
    await conn.beginTransaction();

    // Prepare the DELETE statement
    const deleteStmt = `
      DELETE FROM ${process.env.MASTER_TABLE}
      WHERE \`Device ID\` = ? AND Month = ? AND Year = ?
    `;

    // Delete the rows from the inventory2 table
    for (const row of data) {
      const { 'Device ID': deviceId, Month, Year } = row;
      await conn.query(deleteStmt, [deviceId, Month, Year]);
    }

    // Commit transaction
    await conn.commit();

    return new Response(JSON.stringify({ message: 'Rows deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(error);

    // Rollback transaction in case of error
    if (conn) {
      await conn.rollback();
    }

    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
