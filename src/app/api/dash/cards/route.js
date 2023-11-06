import getPSConnection from '@/lib/planetscaledb';

export async function GET(request) {
  console.log(request.url)
  try {
    const conn = await getPSConnection();

    const year = new Date().getFullYear(); 
    const sql = `
      SELECT 
        (SELECT SUM(Estimated) FROM inventory2 WHERE Registered = 'Registered' AND Estimated IS NOT NULL AND Year = ${year}) AS total_estimated_registered,
        (SELECT SUM(Estimated) FROM inventory2 WHERE Registered = 'Pending' AND Estimated IS NOT NULL AND Year = ${year}) AS total_estimated_pending,
        (SELECT SUM(Estimated) FROM inventory2 WHERE Registered = 'Pipeline' AND Estimated IS NOT NULL AND Year = ${year}) AS total_estimated_pipeline,
        (SELECT SUM(Actual_used) + SUM(Estimated_used) FROM inventory2 WHERE Registered = 'Registered' AND Year = ${year}) AS total_committed_registered,
        (SELECT SUM(Actual) FROM inventory2 WHERE Year = ${year}) AS total_actual_generation
      `;

    const resultSet = await conn.query(sql);
    await conn.end();

    // Create the desired JSON structure
    const data = resultSet[0]['0'];
    const result = {
      registered: data.total_estimated_registered,
      pending: data.total_estimated_pending,
      pipeline: data.total_estimated_pipeline,
      actual: data.total_actual_generation,
      usage: data.total_committed_registered,
    }

    return new Response(JSON.stringify(result), {
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