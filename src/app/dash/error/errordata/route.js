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

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    return new Response(`Fetching data from the database failed: ${error.message}`, { status: 500 });
  }
}
