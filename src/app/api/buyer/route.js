import getPSConnection from '@/lib/planetscaledb';

export async function POST(request) {
  const {selectedMonths, organisation, uniqueId, year, transferType, finalBuyer} = await request.json();

  try {
    const connection = await getPSConnection();
    let rows = [];

    // Determine the organisation value based on transferType
    let organisationValue = '';
    if (transferType == 1 || transferType == 2) {
      organisationValue = organisation;
    } else if (transferType == 3) {
      organisationValue = ''; // Leave it empty for type 3
    }

    // Loop through the selectedMonths object and prepare the row data
    for (const deviceId in selectedMonths) {
      if (deviceId === 'Year') continue; // Skip if the key is 'Year'

      const deviceMonths = selectedMonths[deviceId];
      const row = [
        `'${uniqueId}'`,
        `'${deviceId}'`,
        `'${organisationValue}'`,
        `${year}`,
      ];

      // Columns from January to December
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      for (const month of months) {
        row.push(deviceMonths[month.toLowerCase()] || 'NULL'); // Append the month value or NULL if not present
      }

      row.push("'succeeded'");
      row.push(`${transferType}`); // Add transferType as txn_type
      row.push(`'${finalBuyer}'`); // Add finalBuyer

      rows.push(`(${row.join(', ')})`);
    }

    const query = `
      INSERT INTO ${process.env.BUYERS_TABLE} (
        \`Transaction ID\`, \`Device ID\`, Organisation, year, 
        January, February, March, April, May, June, July, August, September, October, November, December, 
        Status, txn_type, final_buyer
      )
      VALUES ${rows.join(', ')}
    `;

    await connection.query(query);

    return new Response(JSON.stringify({ success: true, message: 'Buyer Database updated successfully!' }), { status: 200, headers: { 'Content-Type': 'application/json' }});
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ message: 'Error updating the buyer database' }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}