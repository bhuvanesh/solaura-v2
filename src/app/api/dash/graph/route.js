import getPSConnection from '@/lib/planetscaledb';

export async function GET(request) {
  console.log(request.url)
  try {
    const conn = await getPSConnection();

    const year = new Date().getFullYear(); 
    const sql = `
    SELECT 
      Month, 
      SUM(Actual) as actual, 
      SUM(Estimated) as estimate,
      SUM(COALESCE(Actual_used, 0) + COALESCE(Estimated_used, 0)) as usage,
      SUM(CASE WHEN Type = 'Solar' THEN Estimated ELSE 0 END) as solarEstimate,
      SUM(CASE WHEN Type = 'Wind' THEN Estimated ELSE 0 END) as windEstimate,
      SUM(CASE WHEN Type = 'Solar' THEN COALESCE(Actual_used, 0) + COALESCE(Estimated_used, 0) ELSE 0 END) as solarUsage,
      SUM(CASE WHEN Type = 'Wind' THEN COALESCE(Actual_used, 0) + COALESCE(Estimated_used, 0) ELSE 0 END) as windUsage
    FROM
      inventory2
    WHERE
      Year = ${year}
    GROUP BY
      Month
    `;

    const rows = await conn.query(sql);

    const monthData = rows[0].map(row => ({
      month: row.Month,
      actual: row.actual,
      estimate: row.estimate,
      usage: row.usage,
      solarEstimate: row.solarEstimate,
      windEstimate: row.windEstimate,
      solarUsage: row.solarUsage,
      windUsage: row.windUsage
    }));

    return new Response(JSON.stringify({ monthData }), {
      headers: { 'content-type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error querying the database' }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }
}