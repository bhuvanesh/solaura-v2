import getPSConnection from '@/lib/planetscaledb';

// Function to fetch all groups details or a certain group's details from the database
async function getGroupsData(connection, groupName) {
  const query = groupName
    ? `
    SELECT 
      \`Device ID\`, \`company\`, \`Group\`, Type, CoD, Year,\`project\`,
      MAX(CASE WHEN Month = 'January' THEN Sold ELSE NULL END) AS January,
      MAX(CASE WHEN Month = 'February' THEN Sold ELSE NULL END) AS February,
      MAX(CASE WHEN Month = 'March' THEN Sold ELSE NULL END) AS March,
      MAX(CASE WHEN Month = 'April' THEN Sold ELSE NULL END) AS April,
      MAX(CASE WHEN Month = 'May' THEN Sold ELSE NULL END) AS May,
      MAX(CASE WHEN Month = 'June' THEN Sold ELSE NULL END) AS June,
      MAX(CASE WHEN Month = 'July' THEN Sold ELSE NULL END) AS July,
      MAX(CASE WHEN Month = 'August' THEN Sold ELSE NULL END) AS August,
      MAX(CASE WHEN Month = 'September' THEN Sold ELSE NULL END) AS September,
      MAX(CASE WHEN Month = 'October' THEN Sold ELSE NULL END) AS October,
      MAX(CASE WHEN Month = 'November' THEN Sold ELSE NULL END) AS November,
      MAX(CASE WHEN Month = 'December' THEN Sold ELSE NULL END) AS December
    FROM (
      SELECT 
        \`Device ID\`, \`company\`, \`Group\`, Type, CoD, Year, Month,\`project\`,
        CASE
          WHEN Actual = Sold AND Actual != 0 THEN 'Sold'
          WHEN Actual != 0 AND Actual = Actual_used THEN 'Reserved'
          WHEN Actual = 0 AND Estimated = Estimated_used THEN 'Reserved'
          WHEN Actual != 0 THEN Actual - Actual_used
          ELSE Estimated - Estimated_used
        END AS Sold
      FROM \`inventory\`
      WHERE \`Group\` = ?
    ) AS subquery
    GROUP BY \`Device ID\`, \`company\`, \`Group\`, Type, CoD, Year,\`project\`;`
    : `
    SELECT DISTINCT \`Group\` 
    FROM \`inventory2\`;`;

  const [rows] = await connection.query(query, groupName ? [groupName] : []);
  return rows;
}

// Define an asynchronous function to handle GET requests
export async function POST(request) {
  // Get a connection to the PlanetscaleDB database
  const connection = await getPSConnection();

  const requestBody = await request.json();
  const groupName = requestBody.group;

  const groupsData = await getGroupsData(connection, groupName);

  // Close the database connection
  connection.end();

  // Return the data as a JSON object
  return new Response(JSON.stringify(groupsData), {
    headers: { 'Content-Type': 'application/json' },
  });
}