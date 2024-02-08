// Import the getPSConnection function from the PlanetscaleDB library
import getPSConnection from '@/lib/planetscaledb';

// Define an asynchronous function to handle POST requests
export async function POST(req) {
  // Parse the JSON request body
  const data = await req.json();
  const { Transaction_ID } = data;

  try {
    // Get a connection to the PlanetscaleDB database
    const conn = await getPSConnection();
    const tableName = process.env.DRAFT;

    // Define the SQL query for updating the Status column
    const updateQuery = `
      UPDATE ${tableName}
      SET Status = 0
      WHERE Transaction_ID = ?
    `;

    // Execute the update query with the Transaction_ID
    await conn.query(updateQuery, [Transaction_ID]);

    // Close the database connection
    await conn.end();
    
    // Return a successful response with a message indicating the data was updated
    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    // Log the error and return an error response with a message indicating there was an issue updating the data
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}