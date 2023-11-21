// pages/api/updateIssued.js

// Import the getPSConnection function from the PlanetscaleDB library
import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  const devices = await req.json();

  try {
    const connection = await getPSConnection();

    const devicesToUpdate = devices
      .filter(({ status }) => status === 'Issued')
      .map(({ device, Month, Year }) => [device.replace(/\s+/g, ''), Month, Year]);

    if (devicesToUpdate.length > 0) {

      // Prepare Batch insertion
      const values = devicesToUpdate.map(([device, Month, Year]) => "(?,?,?)").join(",");
      const flattenedDevices = [].concat.apply([], devicesToUpdate);

      const updateQuery = `
        INSERT INTO inventory2 (\`Device ID\`, Month, Year)
        VALUES ${values}
        ON DUPLICATE KEY UPDATE Issued = Actual;
      `;
      await connection.query(updateQuery, flattenedDevices);
    }

    await connection.end();

    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}