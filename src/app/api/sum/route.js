import getPSConnection from '@/lib/planetscaledb';

async function getGroupsData(connection, groupName) {
  let query = '';
  if(groupName === 'All groups') {
    query = `
    SELECT 
      \`Device ID\`, \`company\`, \`Group\`, Type, CoD, Year,\`project\`,
      COALESCE(MAX(CASE WHEN Month = 'January' THEN Sold ELSE NULL END), 0) AS January,
      COALESCE(MAX(CASE WHEN Month = 'February' THEN Sold ELSE NULL END), 0) AS February,
      COALESCE(MAX(CASE WHEN Month = 'March' THEN Sold ELSE NULL END), 0) AS March,
      COALESCE(MAX(CASE WHEN Month = 'April' THEN Sold ELSE NULL END), 0) AS April,
      COALESCE(MAX(CASE WHEN Month = 'May' THEN Sold ELSE NULL END), 0) AS May,
      COALESCE(MAX(CASE WHEN Month = 'June' THEN Sold ELSE NULL END), 0) AS June,
      COALESCE(MAX(CASE WHEN Month = 'July' THEN Sold ELSE NULL END), 0) AS July,
      COALESCE(MAX(CASE WHEN Month = 'August' THEN Sold ELSE NULL END), 0) AS August,
      COALESCE(MAX(CASE WHEN Month = 'September' THEN Sold ELSE NULL END), 0) AS September,
      COALESCE(MAX(CASE WHEN Month = 'October' THEN Sold ELSE NULL END), 0) AS October,
      COALESCE(MAX(CASE WHEN Month = 'November' THEN Sold ELSE NULL END), 0) AS November,
      COALESCE(MAX(CASE WHEN Month = 'December' THEN Sold ELSE NULL END), 0) AS December
    FROM (
      SELECT 
        \`Device ID\`, \`company\`, \`Group\`, Type, CoD, Year, Month,\`project\`,
        CASE 
          WHEN COALESCE(\`Actual_used\`, 0) = COALESCE(\`Issued\`, 0) AND COALESCE(\`Actual_used\`, 0) != 0 THEN 'Sold'
          WHEN COALESCE(\`Actual\`, 0) != 0 AND COALESCE(\`Actual\`, 0) = COALESCE(\`Actual_used\`, 0 ) THEN 'Reserved'
          WHEN COALESCE(\`Actual\`, 0) = 0 AND \`Estimated\` = \`Estimated_used\` THEN 'Reserved'
          WHEN COALESCE(\`Actual\`, 0) != 0 THEN COALESCE(\`Actual\`, 0) - COALESCE(\`Actual_used\`, 0)
          ELSE COALESCE(\`Estimated\`, 0) - COALESCE(\`Estimated_used\`, 0)
        END AS Sold
      FROM \`inventory2\`
    ) AS subquery
    GROUP BY \`Device ID\`, \`company\`, \`Group\`, Type, CoD, Year,\`project\`;`
  } else if (groupName) {
    query = `
    SELECT 
      \`Device ID\`, \`company\`, \`Group\`, Type, CoD, Year,\`project\`,
      COALESCE(MAX(CASE WHEN Month = 'January' THEN Sold ELSE NULL END), 0) AS January,
      COALESCE(MAX(CASE WHEN Month = 'February' THEN Sold ELSE NULL END), 0) AS February,
      COALESCE(MAX(CASE WHEN Month = 'March' THEN Sold ELSE NULL END), 0) AS March,
      COALESCE(MAX(CASE WHEN Month = 'April' THEN Sold ELSE NULL END), 0) AS April,
      COALESCE(MAX(CASE WHEN Month = 'May' THEN Sold ELSE NULL END), 0) AS May,
      COALESCE(MAX(CASE WHEN Month = 'June' THEN Sold ELSE NULL END), 0) AS June,
      COALESCE(MAX(CASE WHEN Month = 'July' THEN Sold ELSE NULL END), 0) AS July,
      COALESCE(MAX(CASE WHEN Month = 'August' THEN Sold ELSE NULL END), 0) AS August,
      COALESCE(MAX(CASE WHEN Month = 'September' THEN Sold ELSE NULL END), 0) AS September,
      COALESCE(MAX(CASE WHEN Month = 'October' THEN Sold ELSE NULL END), 0) AS October,
      COALESCE(MAX(CASE WHEN Month = 'November' THEN Sold ELSE NULL END), 0) AS November,
      COALESCE(MAX(CASE WHEN Month = 'December' THEN Sold ELSE NULL END), 0) AS December
    FROM (
      SELECT 
        \`Device ID\`, \`company\`, \`Group\`, Type, CoD, Year, Month,\`project\`,
        CASE
          WHEN COALESCE(\`Actual_used\`, 0) = COALESCE(\`Issued\`, 0) AND COALESCE(\`Actual_used\`, 0) != 0 THEN 'Sold'
          WHEN COALESCE(\`Actual\`, 0) != 0 AND COALESCE(\`Actual\`, 0) = COALESCE(\`Actual_used\`, 0 ) THEN 'Reserved'
          WHEN COALESCE(\`Actual\`, 0) = 0 AND \`Estimated\` = \`Estimated_used\` THEN 'Reserved'
          WHEN COALESCE(\`Actual\`, 0) != 0 THEN COALESCE(\`Actual\`, 0) - COALESCE(\`Actual_used\`, 0)
          ELSE COALESCE(\`Estimated\`, 0) - COALESCE(\`Estimated_used\`, 0)
        END AS Sold
      FROM \`inventory2\`
      WHERE \`Group\` = ?
    ) AS subquery
    GROUP BY \`Device ID\`, \`company\`, \`Group\`, Type, CoD, Year,\`project\`;`;
  } else {
    query = `
    SELECT DISTINCT \`Group\`, Year
    FROM \`inventory2\`;`;
  }

  const [rows] = await connection.query(query, groupName ? [groupName] : []);
  return rows;
}

export async function POST(request) {
  const connection = await getPSConnection();

  const requestBody = await request.json();
  const groupName = requestBody.group;

  const groupsData = await getGroupsData(connection, groupName);

  connection.end();

  return new Response(JSON.stringify(groupsData), {
    headers: { 'Content-Type': 'application/json' },
  });
}