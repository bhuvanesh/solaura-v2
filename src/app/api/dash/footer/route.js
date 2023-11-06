// Import the getPSConnection function from the PlanetscaleDB library
import getPSConnection from '@/lib/planetscaledb';

// Define an asynchronous function to handle GET requests
export async function GET(request) {
  console.log(request.url)
  try {
    // Get a connection to the database
    const conn = await getPSConnection();

    // Define the SQL query
const sql = `
      SELECT 
        SUM(CASE WHEN Month = MONTHNAME(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)) AND Year = YEAR(CURRENT_DATE) - 1 THEN Actual ELSE 0 END) AS prev_month_actual_generation_previous_year,
        SUM(CASE WHEN Month = MONTHNAME(DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)) AND Year = YEAR(CURRENT_DATE) THEN Actual ELSE 0 END) AS prev_month_actual_generation,
        SUM(CASE WHEN Month = MONTHNAME(DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH)) AND Year = YEAR(CURRENT_DATE) THEN Actual ELSE 0 END) AS previous_of_previous_month_actual_generation,
        SUM(CASE WHEN Year = YEAR(CURRENT_DATE) THEN Actual ELSE 0 END) AS total_actual_generation,
        SUM(CASE WHEN Year = YEAR(CURRENT_DATE) - 1 THEN Actual ELSE 0 END) AS total_actual_previous_year
      FROM inventory2
    `;

    // Execute the SQL query
    const [rows] = await conn.query(sql);

    // Close the database connection
    await conn.end();

    // Return the data as a JSON object
    return new Response(JSON.stringify(rows), { headers: { 'content-type': 'application/json' }, status: 200 });
  } catch (error) {
    // Log the error and return an error response with a message indicating there was an issue querying the database
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error querying the database' }), { headers: { 'content-type': 'application/json' }, status: 500 });
  }
}