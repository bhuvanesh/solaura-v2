// Import the getPSConnection function from the PlanetscaleDB library
import getPSConnection from '@/lib/planetscaledb';

// Define an asynchronous function to handle POST requests
export async function POST(request) {
  // Parse the JSON request body into an object with requirement, CoDYear, productionPeriodFrom, productionPeriodTo, type, and year properties
  const { requirement, CoDYear, productionPeriodFrom, productionPeriodTo, type, year } = await request.json();

  // Define an array of month column names
  const monthColumns = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  // Select the months within the specified production period
  const selectedMonths = monthColumns.slice(productionPeriodFrom - 1, productionPeriodTo);

  // Return an error response if the month range is invalid
  if (!selectedMonths.length) {
    return new Response(JSON.stringify({ message: 'Invalid month range' }), { status: 400 });
  }

  // Generate the SQL query string for summing the production values for each selected month
const monthSums = selectedMonths.map(month => `SUM(CASE WHEN \`Month\` = '${month}' THEN (CASE WHEN COALESCE(\`Actual\`, 0) - COALESCE(\`Actual_used\`, 0) = 0 THEN COALESCE(\`Estimated\`, 0) - COALESCE(\`Estimated_used\`, 0) ELSE COALESCE(\`Actual\`, 0) - COALESCE(\`Actual_used\`, 0) END) ELSE 0 END) as \`${month}\``).join(', ');
  try {
    // Get a connection to the PlanetscaleDB database
    const connection = await getPSConnection();

    // Define the SQL query conditions for CoDYear and type
    const CoDYearCondition = CoDYear === 0 ? 'YEAR(CoD) < YEAR(CURDATE()) - 10' : `YEAR(CoD) >= ${CoDYear}`;
    const typeCondition = type === 'Both' ? "(`Type` = 'Solar' OR `Type` = 'Wind')" : "`Type` = ?";

// Your SQL statement to fetch the aggregated data would change to handle null conditions in Actual_used and Estimated_used
const [rows] = await connection.query(`
      SELECT \`Device ID\`, \`Year\`, \`Type\`, \`CoD\`, ${monthSums}, SUM(CASE WHEN COALESCE(\`Actual\`, 0) = 0 THEN COALESCE(\`Estimated\`, 0) - COALESCE(\`Estimated_used\`, 0) ELSE COALESCE(\`Actual\`, 0) - COALESCE(\`Actual_used\`, 0) END) as Total_Production
      FROM \`inventory2\`
      WHERE ${CoDYearCondition} AND ${typeCondition} AND \`Month\` IN (?) AND \`Year\` = ?
      GROUP BY \`Device ID\`, \`Year\`, \`Type\`, \`CoD\`
      HAVING Total_Production >= 0
      ORDER BY Total_Production DESC
`, type === 'Both' ? [selectedMonths, year] : [type, selectedMonths, year]);
    // Return the data as a JSON object
    return new Response(JSON.stringify(rows), {
      headers: { 'content-type': 'application/json' },
      status: 200
    });
  } catch (error) {
    // Log the error and return an error response with a message indicating there was an issue querying the database
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error querying the database' }), {
      headers: { 'content-type': 'application/json' },
      status: 500
    });
  }
}