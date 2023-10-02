import getPSConnection from '@/lib/planetscaledb';

// Function to fetch all groups from the database
async function getAllGroups(connection) {
  const [rows] = await connection.query(`
    SELECT
      \`Group\`,
      COUNT(DISTINCT \`Device ID\`) as no_of_devices,
      SUM(\`Estimated\`) as estimated_generation,
      SUM(\`Actual\`) as actual_generation,
      SUM(\`Issued\`) as total_issuance,
      SUM(IF(\`Issued\` IS NULL OR \`Issued\` = 0, \`Actual_used\` + \`Estimated_used\`, 0)) as future_commitment
    FROM
      \`inventory2\`
    GROUP BY
      \`Group\`;
  `);
  return rows;
}

// Route handler
export async function GET(request) {
  try {
    const connection = await getPSConnection();
    const groups = await getAllGroups(connection);

    // Return response with status 200 and data
    return new Response(JSON.stringify(groups), { status: 200 });
  } catch (error) {
    return new Response(`Fetching data from the database failed: ${error.message}`, { status: 500 });
  }
}