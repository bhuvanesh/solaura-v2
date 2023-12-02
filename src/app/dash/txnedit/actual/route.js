import getPSConnection from '@/lib/planetscaledb';  

export async function POST(req) {
  const rows = await req.json();
  console.log('rows',rows);

  const { deviceId, month, year } = rows;

  const conn = await getPSConnection();

 try {
    const [rows, fields] = await conn.execute(
      `SELECT CASE
                WHEN IFNULL(Actual, 0) = 0 THEN Estimated
                ELSE Actual
              END AS Actual
       FROM ${process.env.MASTER_TABLE}
       WHERE \`Device ID\` = ? AND Month = ? AND Year = ?`,
      [deviceId, month, year]
    );


    console.log('Query Results:', rows, fields);
  
    if (rows.length > 0) {
      // Return response with status 200 and data
      return new Response(JSON.stringify({ actual: rows[0].Actual }), { status: 200 });
    } else {
      return new Response('No matching record found', { status: 404 });
    }
  } catch (err) {
    console.error(err);
    return new Response(`An error occurred while processing your request: ${err.message}`, { status: 500 });
  } finally {
    if (conn) {
      conn.end();
    }
  }
}