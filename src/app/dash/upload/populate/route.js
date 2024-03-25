// Import the getPSConnection function from the PlanetscaleDB library
import getPSConnection from '@/lib/planetscaledb';

// Define an asynchronous function to handle POST requests
export async function POST(req) {
  // Parse the JSON request body into an array of rows

  try {
    // Get a connection to the PlanetscaleDB database
    const conn = await getPSConnection();

    // Get the current year
    const currentYear = new Date().getFullYear();

    // Define the table name
    const tableName = process.env.MASTER_TABLE;

    // Define the SQL query for inserting or updating rows in the inventory2 table
    const insertQuery = `
      INSERT INTO ${tableName} (
        \`Device ID\`, \`Group\`, \`company\`, \`project\`, \`Type\`, \`CoD\`, 
        \`Year\`, \`Capacity (MW)\`, \`Month\`, \`Estimated\`, \`Registered\`, \`PAN\`, \`GST\`
      )
      SELECT
        \`Device ID\`, \`Group\`, \`company\`, \`project\`, \`Type\`, \`CoD\`,
        ${currentYear + 1} AS \`Year\`, \`Capacity (MW)\`, \`Month\`, \`Estimated\`, \`Registered\`, \`PAN\`, \`GST\`
      FROM
        ${tableName}
      WHERE
        \`Year\` = ${currentYear}
    `;

    // Execute the insert query
    await conn.query(insertQuery);

    // Close the database connection
    await conn.end();
    
    // Return a successful response with a message indicating the data was updated
    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    // Log the error and return an error response with a message indicating there was an issue updating the data
    console.error("error",error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}