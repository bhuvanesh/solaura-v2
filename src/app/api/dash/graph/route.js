// Import the getPSConnection function from the PlanetscaleDB library
import getPSConnection from '@/lib/planetscaledb';

// Define an asynchronous function to handle GET requests
export async function GET(request) {
  try {
    // Get a connection to the database
    const conn = await getPSConnection();

    // Define the SQL query
    const sql = `
    SELECT 
    Month, 
    SUM(Actual) as actual, 
    SUM(Estimated) as estimate, 
    SUM(COALESCE(Actual_used, 0) + COALESCE(Estimated_used, 0)) as usage 
FROM 
    inventory2 
GROUP BY 
    Month
    `;

// Execute the SQL query
const rows = await conn.query(sql);

// Format the rows[0] into the desired JSON format
const monthData = rows[0].map(row => ({
  month: row.Month,
  actual: row.actual,
  estimate: row.estimate,
  usage: row.usage
}));

// Return the data as a JSON object
return new Response(JSON.stringify({ monthData }), {
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