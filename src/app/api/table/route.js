// Import the getPSConnection function from the PlanetscaleDB library
import getPSConnection from '@/lib/planetscaledb';

// Define an asynchronous function to handle POST requests
export async function POST(request) {
  const { requirement, CoDYear, productionPeriodFrom, productionPeriodTo, type, year } = await request.json();

  console.log(requirement, CoDYear, productionPeriodFrom, productionPeriodTo, type, year);

  const monthColumns = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const selectedMonths = monthColumns.slice(productionPeriodFrom - 1, productionPeriodTo);

  if (!selectedMonths.length) {
    return new Response(JSON.stringify({ message: 'Invalid month range' }), { status: 400 });
  }

  // In this map function, we compare `Actual` with null instead of 0
  const monthSums = selectedMonths.map(month => `SUM(CASE WHEN \`Month\` = '${month}' THEN (CASE WHEN \`Actual\` IS null THEN COALESCE(\`Estimated\`, 0) - COALESCE(\`Estimated_used\`, 0) ELSE COALESCE(\`Actual\`, null) - COALESCE(\`Actual_used\`, 0) END) ELSE 0 END) as \`${month}\``).join(', ');

  try {
    const connection = await getPSConnection();

    // If CoDYear is 0, we consider all the years. If not, we consider >= `CoDYear`.
    const CoDYearCondition = CoDYear === 0 ? '' : `YEAR(CoD) >= ${CoDYear}`;
    const typeCondition = type === 'Both' ? "(`Type` = 'Solar' OR `Type` = 'Wind')" : "`Type` = ?";

    const [rows] = await connection.query(`
  SELECT \`Device ID\`, \`Group\`, \`Year\`, \`Type\`, \`CoD\`, ${monthSums},  SUM(CASE WHEN \`Actual\` IS null THEN COALESCE(\`Estimated\`, 0) - COALESCE(\`Estimated_used\`, 0) ELSE COALESCE(\`Actual\`, null) - COALESCE(\`Actual_used\`, 0) END) as Total_Production
  FROM \`${process.env.MASTER_TABLE}\`
  WHERE ${CoDYearCondition !== '' ? `${CoDYearCondition} AND` : ''} ${typeCondition} AND \`Month\` IN (?) AND \`Year\` = ?
  GROUP BY \`Device ID\`, \`Group\`, \`Year\`, \`Type\`, \`CoD\`
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