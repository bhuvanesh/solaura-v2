import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  const rows = await req.json();

  try {
    const connection = await getPSConnection();

    // Start transaction
    await connection.beginTransaction();

    const values = rows
      .filter(row => row['indicative unit sale price'] !== undefined && row['success fee'] !== undefined)
      .map(row => {
        const { seller, group, gst, pan, address, 'indicative unit sale price': indicative_price, 'success fee': success_fee } = row;
        return `("${seller}", '${group}', "${gst}", "${pan}", "${address}", "${indicative_price}", "${success_fee}")`;
      }).join(',');

    // Prepare SQL query
    const sql = `INSERT INTO sellers (seller, \`group\`, gst, pan, address, indicative_price, success_fee) VALUES ${values}
                 ON DUPLICATE KEY UPDATE seller = VALUES(seller), \`group\` = VALUES(\`group\`), address = VALUES(address), indicative_price = VALUES(indicative_price), success_fee = VALUES(success_fee)`;

    // Execute SQL query
    await connection.execute(sql);

    // Commit transaction
    await connection.commit();

    connection.close();

    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}