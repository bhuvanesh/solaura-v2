import getPSConnection from '@/lib/planetscaledb';

// Function to check and insert device IDs
async function checkAndInsertDeviceIds(connection, deviceIds) {
  let existingIds = [];
  let newIds = [];

  for (const deviceId of deviceIds) {
const [rows] = await connection.query(`SELECT \`Device ID\` FROM \`${process.env.INVOICE_REG}\` WHERE \`Device ID\` = ?`, [deviceId]);
    if (rows.length > 0) {
      // Device ID exists in the database
      existingIds.push(deviceId);
    } else {
      // Device ID does not exist in the database
      newIds.push(deviceId);
    }
  }

  // If a deviceId doesn't exist, it's already included in newIds
  return { yes: existingIds.join(','), no: newIds.join(',') };
}

// Route handler
export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body);
    const deviceIds = body.deviceIds.split(',');
  
    const connection = await getPSConnection();
    const result = await checkAndInsertDeviceIds(connection, deviceIds);
  
    // Return response with status 200 and data
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(`Operation failed: ${error.message}`, { status: 500 });
  }
}
