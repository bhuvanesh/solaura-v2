import getPSConnection from '@/lib/planetscaledb';

export async function POST(request) {
  const { requirement, CoDYear, productionPeriodFrom, productionPeriodTo, type,year } = await request.json();
  const monthColumns = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const selectedMonths = monthColumns.slice(productionPeriodFrom - 1, productionPeriodTo);

  if (!selectedMonths.length) {
    return new Response(JSON.stringify({ message: 'Invalid month range' }), { status: 400 });
  }

  const monthSums = selectedMonths.map(month => `SUM(CASE WHEN \`Month\` = '${month}' THEN (CASE WHEN \`Actual\` - \`Actual_used\` = 0 THEN \`Estimated\` - \`Estimated_used\` ELSE \`Actual\` - \`Actual_used\` END) ELSE 0 END) as \`${month}\``).join(', ');

  try {
    const connection = await getPSConnection();
    const CoDYearCondition = CoDYear === 0 ? 'YEAR(CoD) < YEAR(CURDATE()) - 10' : `YEAR(CoD) >= ${CoDYear}`;

    const typeCondition = type === 'Both' ? "(`Type` = 'Solar' OR `Type` = 'Wind')" : "`Type` = ?";

    const [rows] = await connection.query(`
      SELECT \`Device ID\`, \`Year\`, \`Type\`, \`CoD\`, ${monthSums}, SUM(CASE WHEN \`Actual\` = 0 THEN \`Estimated\` - \`Estimated_used\` ELSE \`Actual\` - \`Actual_used\` END) as Total_Production
      FROM \`inventory\`
      WHERE ${CoDYearCondition} AND ${typeCondition} AND \`Month\` IN (?) AND \`Year\` = ?
      GROUP BY \`Device ID\`, \`Year\`, \`Type\`, \`CoD\`
      HAVING Total_Production >= 0
      ORDER BY Total_Production DESC
    `, type === 'Both' ? [selectedMonths, year] : [type, selectedMonths, year]);
  

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