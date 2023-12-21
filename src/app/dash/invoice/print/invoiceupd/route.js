import getPSConnection from '@/lib/planetscaledb';

// Function to insert device IDs
async function insertDeviceIds(connection, deviceIds) {
  for (const deviceId of deviceIds) {
    await connection.query(`INSERT INTO \`${process.env.INVOICE_REG}\` (\`Device ID\`) VALUES (?) ON DUPLICATE KEY UPDATE \`Device ID\` = VALUES(\`Device ID\`)`, [deviceId]);  }
}

// Route handler
export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body);
    // Split the deviceIds and filter out empty strings
    const deviceIds = body.deviceIds.split(',').filter(id => id.trim() !== '');

    // Check if there are any device IDs to insert
    if (deviceIds.length === 0) {
      // Return a response indicating no device IDs to insert
      return new Response(JSON.stringify({ message: 'No device IDs to insert' }), { status: 400 });
    }

    const connection = await getPSConnection();
    await insertDeviceIds(connection, deviceIds);

    // Return response with status 200
    return new Response(JSON.stringify({ message: 'Device IDs inserted successfully' }), { status: 200 });
  } catch (error) {
    return new Response(`Operation failed: ${error.message}`, { status: 500 });
  }
}
