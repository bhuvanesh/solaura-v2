import getPSConnection from '@/lib/planetscaledb';

// Function to fetch all groups or a specific group from the database
async function getAllGroups(connection, groupName) {
  const sql = `
    SELECT
      \`Group\`,
      COUNT(DISTINCT \`Device ID\`) as no_of_devices,
      SUM(\`Estimated\`) as estimated_generation,
      SUM(\`Actual\`) as actual_generation,
      SUM(\`Issued\`) as total_issuance,
      SUM(IF(\`Issued\` IS NULL OR \`Issued\` = 0, \`Actual_used\` + \`Estimated_used\`, 0)) as future_commitment
    FROM
      \`inventory2\`
    ${groupName ? `WHERE \`Group\` = ?` : ''}
    GROUP BY
      \`Group\`;
  `;
  const [rows] = await connection.query(sql, groupName ? [groupName] : []);
  return rows;
}

// Function to fetch distinct group names from the database
async function getGroupNames(connection) {
  const [rows] = await connection.query(`
    SELECT
      DISTINCT \`Group\`
    FROM
      \`inventory2\`;
  `);
  return rows;
}


export async function POST(request) {
  try {
    const connection = await getPSConnection();
    const requestBody = await request.json();
    const groupName = requestBody.group;
    const groups = groupName
      ? await getAllGroups(connection, groupName)
      : await getGroupNames(connection);

    // Return response with status 200 and data
    return new Response(JSON.stringify(groups), { status: 200 });
  } catch (error) {
    return new Response(`Fetching data from the database failed: ${error.message}`, { status: 500 });
  }
}