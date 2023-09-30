import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  const rows = await req.json();

  try {
    const connection = await getPSConnection();

    // Get the maximum 'S.No' value in the inventory2 table
    const [maxSNoResult] = await connection.query('SELECT MAX(`S.No`) as maxSNo FROM inventory2');
    const maxSNo = maxSNoResult[0].maxSNo;

    // Prepare the query and values for batch insert
    const query = `
      INSERT INTO inventory2 (
        \`S.No\`, \`Device ID\`, \`Group\`, company, project, \`Type\`, \`CoD\`, \`Capacity (MW)\`, \`Month\`, Estimated, Registered
      ) VALUES ? ON DUPLICATE KEY UPDATE
        \`Group\` = VALUES(\`Group\`),
        company = VALUES(company),
        project = VALUES(project),
        \`Type\` = VALUES(\`Type\`),
        \`CoD\` = VALUES(\`CoD\`),
        \`Capacity (MW)\` = VALUES(\`Capacity (MW)\`),
        \`Month\` = VALUES(\`Month\`),
        Estimated = VALUES(Estimated),
        Registered = VALUES(Registered);
    `;
    const values = [];

    // Add rows to the values array if 'S.No' is greater than the maximum value
    for (const row of rows) {
      if (row['S.No'] > maxSNo) {
        const rowValues = [
          row['S.No'],
          row['Device ID'],
          row['Group'],
          row['Company'],
          row['project'],
          row['Type'],
          row['CoD'] ? row['CoD'] : null, // Set 'CoD' to NULL if empty or not provided
          row['Capacity (MW)'],
          row['month'],
          row['Estimated'],
          row['Registered'],
        ];
        values.push(rowValues);
      }
    }

    // Perform batch insert using the prepared query and values
    if (values.length > 0) {
      await connection.query(query, [values]);
    }

    await connection.end();
    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}