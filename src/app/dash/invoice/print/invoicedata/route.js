// Import the getPSConnection function from the PlanetscaleDB library
import getPSConnection from '@/lib/planetscaledb';
import { revalidateTag } from 'next/cache';


// Define an asynchronous function to handle POST requests
export async function POST(req) {
  // Parse the JSON request body
  const data = await req.json();

  // Create a connection to the database
  const conn = await getPSConnection();

  // Define the SQL INSERT statement
  const insertQuery = `
  INSERT INTO ${process.env.INVOICE_DATA} (
    invoiceid, groupName, capacity, regNo, regdevice, issued, ISP,
    registrationFee, issuanceFee, USDExchange, EURExchange,
    invoicePeriodFrom, invoicePeriodTo, gross, regFeeINR, issuanceINR,
    netRevenue, successFee, finalRevenue, project, netRate, pan, gst,
    address, date, deviceIds, companyName
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

  // Convert the dates to the correct format
  const invoicePeriodFrom = data.invoicePeriodFrom.split('-').reverse().join('-');
  const invoicePeriodTo = data.invoicePeriodTo.split('-').reverse().join('-');
  const date = data.date.split('-').reverse().join('-');

  // Map the JSON fields to the SQL query parameters
  const values = [
    data.invoiceid, data.groupName, data.capacity, data.regNo, data.regdevice, data.issued, data.ISP,
    data.registrationFee, data.issuanceFee, data.USDExchange, data.EURExchange,
    invoicePeriodFrom, invoicePeriodTo, data.gross, data.regFeeINR, data.issuanceINR,
    data.netRevenue, data.successFee, data.finalRevenue, data.project, data.netRate, data.pan, data.gst,
    data.address, date, data.deviceIds, data.formData.companyName
  ];

  try {
    // Execute the batch insert query using the prepared values
    await conn.query(insertQuery, values);
    revalidateTag('invoice');

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
