import getPSConnection from '@/lib/planetscaledb';


export async function GET(request) {
  console.log(request.url)
  try {
    const connection = await getPSConnection();
    const [rows] = await connection.execute(`
    SELECT
      \`Device ID\`,
      \`Month\`,
      \`Year\`,
      CASE
        WHEN \`Estimated\` IS NULL THEN
          CASE
            WHEN \`Actual\` IS NOT NULL THEN 'Actual'
            ELSE 'Issued'
          END
      END AS \`Status\`
    FROM
      \`inventory2\`
    WHERE
      \`Estimated\` IS NULL;
  `);
  
// New query for counting distinct devices
const [countRows] = await connection.execute(`
  SELECT
    COUNT(DISTINCT CASE WHEN \`Actual\` IS NOT NULL THEN \`Device ID\` END) AS \`ActualDistinctDevices\`,
    COUNT(DISTINCT CASE WHEN \`Actual\` IS NULL THEN \`Device ID\` END) AS \`IssuedDistinctDevices\`
  FROM
    \`inventory2\`
  WHERE
    \`Estimated\` IS NULL;
`);

console.log(rows);
console.log(countRows);

return new Response(JSON.stringify({ rows, countRows }), { status: 200 });

  } catch (error) {
    return new Response(`Fetching data from the database failed: ${error.message}`, { status: 500 });
  }
}
