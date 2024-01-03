// Import the getPSConnection function from the PlanetscaleDB library
import getPSConnection from '@/lib/planetscaledb';

// Define an asynchronous function to handle GET requests
export async function POST(req) {
  const { year } = await req.json(); // Extract year from incoming JSON
  console.log(year);
  try {
    // Get a connection to the database
    const conn = await getPSConnection();

    // Define the SQL query
    const sql = `
    SELECT 
      SUM(CASE WHEN Month = MONTHNAME(DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH)) AND Year = IF(MONTH(CURRENT_DATE) = 1, ${year} - 2, ${year} - 1) THEN Actual ELSE 0 END) AS prev_month_actual_generation_previous_year,
      SUM(CASE WHEN Month = MONTHNAME(DATE_SUB(CURRENT_DATE, INTERVAL 2 MONTH)) AND Year = IF(MONTH(CURRENT_DATE) = 1, ${year} - 1, ${year}) THEN Actual ELSE 0 END) AS prev_month_actual_generation,
      SUM(CASE WHEN Month = MONTHNAME(DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)) AND Year = IF(MONTH(CURRENT_DATE) = 1, ${year} - 1, ${year}) THEN Actual ELSE 0 END) AS previous_of_previous_month_actual_generation,
      SUM(CASE WHEN Year = ${year} THEN Actual ELSE 0 END) AS total_actual_generation,
      SUM(CASE WHEN Year = ${year} - 1 THEN Actual ELSE 0 END) AS total_actual_previous_year
    FROM ${process.env.MASTER_TABLE}
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