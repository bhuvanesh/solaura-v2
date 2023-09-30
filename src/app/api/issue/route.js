// pages/api/updateIssued.js
import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  const devices = await req.json();

  try {
    const connection = await getPSConnection();

    const devicesToUpdate = devices
      .filter(({ status }) => status === 'Issued')
      .map(({ device, Month, Year }) => [device, Month, Year]);

    if (devicesToUpdate.length > 0) {
      const updatePromises = devicesToUpdate.map(async ([device, Month, Year]) => {
        const updateQuery = `
          UPDATE inventory2
          SET Issued = Actual
          WHERE \`Device ID\` = ? AND Month = ? AND Year = ?;
        `;
        await connection.query(updateQuery, [device, Month, Year]);
      });

      await Promise.all(updatePromises);
    }

    await connection.end();
    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}