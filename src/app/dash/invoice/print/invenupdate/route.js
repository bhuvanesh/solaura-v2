import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  // Parse the JSON request body
  const data = await req.json();
  console.log('to be modified',data);

  // Create a connection to the database
  const conn = await getPSConnection();

  // Extract the device IDs, invoice period from and to from the request data
  const deviceIds = data.deviceIds.split(',');
  const invoicePeriodFrom = data.formData.invoicePeriodFrom;
  const invoicePeriodTo = data.formData.invoicePeriodTo;
  const year = data.formData.year;

  // Define the list of months
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Get the range of months for the invoice period
  const monthRange = months.slice(months.indexOf(invoicePeriodFrom), months.indexOf(invoicePeriodTo) + 1);

  // Initialize an array to hold the query values
  let queryValues = [];

  // Loop through each device ID and month to construct the query values
  for (let deviceId of deviceIds) {
    for (let month of monthRange) {
      // Add the device ID, month, year, and invoice_status to the query values
      queryValues.push(`('${deviceId}', '${month}', ${year}, 'True')`);
    }
  }

  try {
    // Define the batch update query
    const updateQuery = `
      INSERT INTO inventory2beta (\`Device ID\`, Month, Year, invoice_status)
      VALUES ${queryValues.join(', ')}
      ON DUPLICATE KEY UPDATE invoice_status = VALUES(invoice_status)
    `;

    // Execute the batch update query
    await conn.query(updateQuery);

    // Close the database connection
    await conn.end();
    
    // Return a successful response with a message indicating the data was updated
    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    // Log the error and return an error response with a message indicating there was an issue updating the data
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}