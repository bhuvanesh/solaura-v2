import getPSConnection from '@/lib/planetscaledb';
export const dynamic = 'force-dynamic'


export async function POST(req) {
  const { year } = await req.json(); 
  console.log(year);
  try {
    const conn = await getPSConnection();

    const sql = `
      SELECT 
        (SELECT SUM(Estimated) FROM ${process.env.MASTER_TABLE} WHERE Registered = 'Registered' AND Estimated IS NOT NULL AND Year = ${year}) AS total_estimated_registered,
        (SELECT COUNT(DISTINCT \`device id\`) FROM ${process.env.MASTER_TABLE} WHERE Registered = 'Pending' AND Year = ${year}) AS pending_no,
        (SELECT SUM(minCapacity) FROM (SELECT MIN(\`Capacity (MW)\`) as minCapacity FROM ${process.env.MASTER_TABLE} WHERE Registered = 'Pending' AND Year = ${year} GROUP BY \`device id\`) as minCapacityPerDevice) AS pending_capacity,
        (SELECT SUM(Actual_used) + SUM(Estimated_used) FROM ${process.env.MASTER_TABLE} WHERE Registered = 'Registered' AND Year = ${year}) AS total_committed_registered,
        (SELECT SUM(Actual) FROM ${process.env.MASTER_TABLE} WHERE Year = ${year}) AS total_actual_generation
      `;

    const resultSet = await conn.query(sql);
    await conn.end();

    // Create the desired JSON structure
    const data = resultSet[0]['0'];
    const result = {
      registered: data.total_estimated_registered,
      pending: data.pending_no,
      pendingcap: data.pending_capacity,
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