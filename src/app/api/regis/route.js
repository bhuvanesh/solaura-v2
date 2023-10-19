import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  const rows = await req.json();
  console.log(rows);

  try {
    const connection = await getPSConnection();

    // Get the maximum 'S.No' value in the formtest table
    const [maxSNoResult] = await connection.query('SELECT MAX(`S.No`) as maxSNo FROM formtest');
    let maxSNo = maxSNoResult[0].maxSNo;
    maxSNo++;

    // Check if the device ID exists in the table
    const [deviceExistsResult] = await connection.query('SELECT COUNT(*) as count FROM formtest WHERE `Device ID` = ?', [rows[0]['Device Id']]);
    const deviceExists = deviceExistsResult[0].count > 0;

    if (!deviceExists) {
      // Prepare the query and values for batch insert
      const query = `
        INSERT INTO formtest (
          \`S.No\`, \`Device ID\`, \`Group\`, company, project, \`Type\`, \`CoD\`, \`Capacity (MW)\`, \`Month\`, Estimated, Registered
        ) VALUES ?;
      `;
      const values = [];

      // Add rows to the values array with the same 'S.No'
      for (const row of rows) {
          const rowValues = [
            maxSNo,
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
          ];
          values.push(rowValues);
      }

      // Perform batch insert using the prepared query and values
      if (values.length > 0) {
        await connection.query(query, [values]);
      }
      maxSNo++; // Increment 'S.No' after the batch insertion
    } else {
      // Update the 'Estimated' value for the corresponding month for each row
      for (const row of rows) {
        await connection.query('UPDATE formtest SET Estimated = ? WHERE `Device ID` = ? AND `Month` = ?', [row.Estimated, row['Device Id'], row.month]);
      }
    }

    await connection.end();
    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}