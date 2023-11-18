import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  const rows = await req.json();
  console.log(rows);

  try {
    const connection = await getPSConnection();

    // Check if the device ID, month, and year exist in the table
    const [deviceExistsResult] = await connection.query('SELECT COUNT(*) as count FROM formtest WHERE `Device ID` = ? AND `Month` = ? AND `Year` = ?', [rows[0]['Device Id'], rows[0].month, rows[0].year]);
    const deviceExists = deviceExistsResult[0].count > 0;

    if (!deviceExists) {
      // Prepare the query and values for batch insert
      const query = `
        INSERT INTO formtest (
          \`Device ID\`, \`Group\`, company, project, \`Type\`, \`CoD\`, \`Capacity (MW)\`, \`Month\`, Estimated, Registered, \`Year\`
        ) VALUES ?;
      `;
      const values = [];

      // Add rows to the values array
      for (const row of rows) {
        const rowValues = [
          row['Device Id'],
          row.groupName,
          row.companyName,
          row.projectName,
          row.Type,
          row.CoD,
          row.capacity,
          row.month,
          row.Estimated,
          row.registered,
          row.year,
        ];
        values.push(rowValues);
      }

      // Perform batch insert using the prepared query and values
      if (values.length > 0) {
        await connection.query(query, [values]);
      }

      await connection.end();
      return new Response(JSON.stringify({ message: 'Data inserted successfully' }), { status: 200 });
    } else {
      await connection.end();
      return new Response(JSON.stringify({ message: 'Data already exists' }), { status: 409 });
    }
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error inserting data' }), { status: 500 });
  }
}