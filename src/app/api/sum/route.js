import getPSConnection from '@/lib/planetscaledb';

export async function GET(request) {
  const connection = await getPSConnection();
  const query = `
SELECT
\`Device ID\`, \`Company Name\`, \`Group Name\`, Type, CoD, Year,
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
    \`Device ID\`, \`Company Name\`, \`Group Name\`, Type, CoD, Year, Month,
    CASE
      WHEN Actual = Sold AND Actual != 0 THEN 'Sold'
      WHEN Actual != 0 AND Actual = Actual_used THEN 'Reserved'
      WHEN Actual = 0 AND Estimated = Estimated_used THEN 'Reserved'
      WHEN Actual != 0 THEN Actual - Actual_used
      ELSE Estimated - Estimated_used
    END AS Sold
  FROM
    \`table\`
) AS subquery
GROUP BY \`Device ID\`, \`Company Name\`, \`Group Name\`, Type, CoD, Year;
`;

  const [rows] = await connection.query(query);
  connection.end();

  // Return the data as a JSON object
  return new Response(JSON.stringify(rows), {
    headers: { 'Content-Type': 'application/json' },
  });
}