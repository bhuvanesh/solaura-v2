import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  const rows = await req.json();

  try {
    const connection = await getPSConnection();

    // Start transaction
    await connection.beginTransaction();

    for (let row of rows) {
      const { seller, group, gst, pan, address, 'indicative unit sale price': indicative_price, 'success fee': success_fee } = row;

      // Prepare SQL query
      const sql = `INSERT INTO sellers (seller, \`group\`, gst, pan, address, indicative_price, success_fee) VALUES (?, ?, ?, ?, ?, ?, ?)
                   ON DUPLICATE KEY UPDATE seller = VALUES(seller), \`group\` = VALUES(\`group\`), address = VALUES(address), indicative_price = VALUES(indicative_price), success_fee = VALUES(success_fee)`;

      // Execute SQL query
      await connection.execute(sql, [seller, group, gst, pan, address, indicative_price, success_fee]);
    }

    // Commit transaction
    await connection.commit();

    connection.close();

    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}