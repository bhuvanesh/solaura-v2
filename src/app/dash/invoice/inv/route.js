import getPSConnection from '@/lib/planetscaledb';

// Function to get all months between two months
function getMonthsBetween(from, to) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const startMonthIndex = monthNames.indexOf(from);
  const endMonthIndex = monthNames.indexOf(to);
  return monthNames.slice(startMonthIndex, endMonthIndex + 1);
}

export async function POST(request) {
  const {
    groupName,
    companyName,
    year,
    invoicePeriodFrom,
    invoicePeriodTo,
    pan
  } = await request.json();
  
  console.log('POST message body:', { groupName, companyName, year, invoicePeriodFrom, invoicePeriodTo });

  // Get all months between invoicePeriodFrom and invoicePeriodTo
  const months = getMonthsBetween(invoicePeriodFrom, invoicePeriodTo);

  // Generate dynamic SQL for each month's issued sum
  const monthSums = months.map(month => `SUM(CASE WHEN Month = '${month}' THEN Issued ELSE 0 END) AS \`${month}Issued\``).join(', ');

  // SQL query to fetch sum of Issued for each month and distinct Device IDs
  const query = `
    SELECT 
      \`Device ID\`,
      \`Project\`,
      MIN(\`Capacity (MW)\`) AS Capacity,
      SUM(Issued) AS TotalIssued,
      ${monthSums}
    FROM ${process.env.MASTER_TABLE}
    WHERE 
      PAN = ? AND 
      Year = ? AND 
      Month IN (${months.map(() => '?').join(',')}) AND
      Issued = Actual_used AND
      invoice_status = 'False'
    GROUP BY \`Device ID\`, \`Project\`
  `;

  try {
    const db = await getPSConnection();
    const inven = await db.query(query, [pan, year, ...months]);

    // Return response with status 200 and data
    return new Response(JSON.stringify(inven[0]), { status: 200 });
  } catch (error) {
    // Return error response with status 500
    return new Response(`Fetching data from the database failed: ${error.message}`, { status: 500 });
  }
}