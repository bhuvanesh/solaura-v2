// pages/api/inv.js
import getPSConnection from '@/lib/planetscaledb';

async function getAllData(connection) {
  const [rows] = await connection.query('SELECT * FROM `inventory2`');
  return rows;
}

function processData(data) {
    const processedData = {};
  
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
  
      processedData[deviceId][month] = estimated;
    });
  
    return Object.values(processedData);
  }
export async function GET(request) {
  try {
    const connection = await getPSConnection();
    const data = await getAllData(connection);
    const processedData = processData(data);

    return new Response(JSON.stringify(processedData), { status: 200 });
  } catch (error) {
    return new Response(`Fetching data from the database failed: ${error.message}`, { status: 500 });
  }
}