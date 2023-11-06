import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  const rows = await req.json();

  try {
    const connection = await getPSConnection();

    const query = `
    INSERT INTO inventory2 (
        \`Device ID\`, \`Group\`, company, project, \`Type\`, \`CoD\`, \`Capacity (MW)\`, \`Month\`, Estimated, Registered, \`Year\`
    ) VALUES ? ON DUPLICATE KEY UPDATE
        \`Device ID\` = VALUES(\`Device ID\`),
        \`Group\` = VALUES(\`Group\`),
        company = VALUES(company),
        \`Type\` = VALUES(\`Type\`),
        \`CoD\` = VALUES(\`CoD\`),
        \`Capacity (MW)\` = VALUES(\`Capacity (MW)\`),
        Estimated = VALUES(Estimated),
        Registered = VALUES(Registered);
    `;
    const insertValues = [];
    for (const row of rows) {
        const rowValues = [
          row['Device ID'],
          row['Group'],
          row['Company'],
          row['project'],
          row['Type'],
          row['CoD'] ? row['CoD'] : null,
          row['Capacity (MW)'],
          row['month'],
          row['Estimated'],
          row['Registered'],
          row['Year'],
        ];
        insertValues.push(rowValues);
    }

    if (insertValues.length > 0) {
      await connection.query(query, [insertValues]);
    }

    await connection.end();
    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}