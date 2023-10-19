// pages/api/updateIssued.js

// Import the getPSConnection function from the PlanetscaleDB library
import getPSConnection from '@/lib/planetscaledb';

// Define an asynchronous function to handle POST requests
export async function POST(req) {
  // Parse the JSON request body into an array of devices
  const devices = await req.json();

  try {
    // Get a connection to the PlanetscaleDB database
    const connection = await getPSConnection();

    // Filter the devices with a status of 'Issued' and map them to an array of [device, Month, Year] tuples
    const devicesToUpdate = devices
      .filter(({ status }) => status === 'Issued')
      .map(({ device, Month, Year }) => [device, Month, Year]);

    // If there are devices to update, execute the update queries
    if (devicesToUpdate.length > 0) {
      // Map each device to an update query promise and execute them in parallel
      const updatePromises = devicesToUpdate.map(async ([device, Month, Year]) => {
        const updateQuery = `
          UPDATE inventory2
          SET Issued = Actual
          WHERE \`Device ID\` = ? AND Month = ? AND Year = ?;
        `;
        await connection.query(updateQuery, [device, Month, Year]);
      });

      // Wait for all update queries to complete
      await Promise.all(updatePromises);
    }

    // Close the database connection
    await connection.end();
    
    // Return a successful response with a message indicating the data was updated
    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    // Log the error and return an error response with a message indicating there was an issue updating the data
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}