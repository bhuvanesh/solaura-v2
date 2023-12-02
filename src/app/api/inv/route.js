// pages/api/inv.js

// Import the getPSConnection function from the PlanetscaleDB library
import getPSConnection from '@/lib/planetscaledb';

// Define an asynchronous function to fetch all data from the inventory2 table
async function getAllData(connection) {
  const [rows] = await connection.query(`SELECT * FROM ${process.env.MASTER_TABLE}`);
  return rows;
}

// Define a function to process the raw data fetched from the inventory2 table
function processData(data) {
  const processedData = {};

  // Iterate through each row in the data
  data.forEach((row) => {
    const deviceId = row['Device ID'];
    const month = row['Month'];
    const estimated = row['Estimated'];
    const group = row['Group'];
    const company = row['company'];
    const project = row['project'];
    const type = row['Type'];
    const cod = row['CoD'];
    const capacity = row['Capacity (MW)'];
    const registered = row['Registered'];

    // Create a new object for the device if it doesn't exist in processedData
    if (!processedData[deviceId]) {
      processedData[deviceId] = {
        'Device ID': deviceId,
        Group: group,
        company: company,
        project: project,
        Type: type,
        CoD: cod,
        'Capacity (MW)': capacity,
        Registered: registered,
      };
    }

    // Add the estimated value for the current month to the device object
    processedData[deviceId][month] = estimated;
  });

  // Convert the processedData object to an array of device objects
  return Object.values(processedData);
}

// Define an asynchronous function to handle GET requests
export async function GET(request) {
  try {
    // Get a connection to the PlanetscaleDB database
    const connection = await getPSConnection();
    
    // Fetch all data from the inventory2 table and process it
    const data = await getAllData(connection);
    const processedData = processData(data);

    // Return a successful response with the processed data as JSON
    return new Response(JSON.stringify(processedData), { status: 200 });
  } catch (error) {
    // Return an error response with a message indicating there was an issue fetching data from the database
    return new Response(`Fetching data from the database failed: ${error.message}`, { status: 500 });
  }
}