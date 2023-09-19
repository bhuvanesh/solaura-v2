import getPSConnection from '@/lib/planetscaledb';

export async function POST(request) {
  const { requirement, CoDYear, productionPeriodFrom, productionPeriodTo, type } = await request.json();

  const monthColumns = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const selectedMonths = monthColumns.slice(productionPeriodFrom - 1, productionPeriodTo);

  if (!selectedMonths.length) {
    return new Response(JSON.stringify({ message: 'Invalid month range' }), { status: 400 });
  }

  const monthSums = selectedMonths.map(month => `SUM(CASE WHEN \`Month\` = '${month}' THEN (CASE WHEN \`Actual\` = 0 AND \`Actual_used\` = 0 THEN \`Estimated\` ELSE \`Actual\` END) ELSE 0 END) as \`${month}\``).join(', ');

  try {
    const connection = await getPSConnection();
    const [rows] = await connection.query(`
      SELECT \`Device ID\`, \`Year\`, \`Type\`, \`CoD\`, ${monthSums}, SUM(CASE WHEN \`Actual\` = 0 AND \`Actual_used\` = 0 THEN \`Estimated\` ELSE \`Actual\` END) as Total_Production
      FROM \`table\`
      WHERE \`Year\` >= ? AND \`Type\` = ? AND \`CoD\` >= ? AND \`Month\` IN (?)
      GROUP BY \`Device ID\`, \`Year\`, \`Type\`, \`CoD\`
      HAVING Total_Production >= 0
      ORDER BY Total_Production DESC
    `, [CoDYear, type, `${CoDYear}-12-31`, selectedMonths]);
    
    return new Response(JSON.stringify(rows), {
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