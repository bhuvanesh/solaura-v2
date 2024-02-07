// Import the getPSConnection function from the PlanetscaleDB library
import getPSConnection from '@/lib/planetscaledb';

// Define an asynchronous function to handle POST requests
export async function POST(req) {
  // Parse the JSON request body
  const requestBody = await req.json();

  try {
    // Get a connection to the PlanetscaleDB database
    const conn = await getPSConnection();

    // Extract data from the request body
    const organisation = requestBody.organisation;
    const selectedMonths = JSON.stringify(requestBody.selectedMonths); // Convert the selectedMonths object to a JSON string
    const transactionId = requestBody.uniqueId;
    const requirement = requestBody.requirement; // Extract the requirement from the request body
    const productionPeriodFrom = requestBody.productionPeriodFrom;
    const productionPeriodTo = requestBody.productionPeriodTo;
    const CoDYear = requestBody.CoDYear;
    const type = requestBody.type;

    // Define the SQL query for inserting a row into the draft table
    const insertQuery = `
      INSERT INTO draft (Transaction_ID, Draft_Data, Organisation, requirement, productionPeriodFrom, productionPeriodTo, CoDYear, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the insert query with the extracted values
    await conn.query(insertQuery, [transactionId, selectedMonths, organisation, requirement, productionPeriodFrom, productionPeriodTo, CoDYear, type]);

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