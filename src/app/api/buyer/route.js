import getPSConnection from '@/lib/planetscaledb';

export async function POST(request) {
  const {selectedMonths, organisation, uniqueId, year} = await request.json();

  try {
    const connection = await getPSConnection();
    let rows = [];

    // Loop through the selectedMonths object and prepare the row data
    for (const deviceId in selectedMonths) {
      if (deviceId === 'Year') continue; // Skip if the key is 'Year'

      const deviceMonths = selectedMonths[deviceId];
      const row = [`'${uniqueId}'`, `'${deviceId}'`, `'${organisation}'`, `${year}`];

      // Columns from January to December
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      for (const month of months) {
        row.push(deviceMonths[month.toLowerCase()] || 'NULL'); // Append the month value or NULL if not present
      }

      row.push("'succeeded'");

      rows.push(`(${row.join(', ')})`);
    }

    const query = `
      INSERT INTO buyersbeta (\`Transaction ID\`, \`Device ID\`, organisation, year, January, February, March, April, May, June, July, August, September, October, November, December, Status)
      VALUES ${rows.join(', ')}
    `;

    await connection.query(query);

    return new Response(JSON.stringify({ success: true, message: 'Buyer Database updated successfully!' }), { status: 200, headers: { 'Content-Type': 'application/json' }});
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ message: 'Error updating the buyer database' }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}