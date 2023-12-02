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
  } = await request.json();
  
  console.log('POST message body:', { groupName, companyName, year, invoicePeriodFrom, invoicePeriodTo });

  // Get all months between invoicePeriodFrom and invoicePeriodTo
  const months = getMonthsBetween(invoicePeriodFrom, invoicePeriodTo);

  // Generate placeholders for the IN clause
  const placeholders = months.map(() => '?').join(',');

  // SQL query to fetch sum of Issued and distinct Device IDs
  const query = `
  SELECT 
    \`Device ID\`,
    \`Project\`,
    MIN(\`Capacity (MW)\`) AS Capacity,
    SUM(Issued) AS TotalIssued
  FROM ${process.env.MASTER_TABLE}
  WHERE 
    company = ? AND 
    \`Group\` = ? AND 
    Year = ? AND 
    Month IN (${placeholders}) AND
    Issued = Actual_used
  GROUP BY \`Device ID\`, \`Project\`
`;

  try {
    const db = await getPSConnection();
    const inven = await db.query(query, [companyName, groupName, year, ...months]);

    // Return response with status 200 and data
    return new Response(JSON.stringify(inven[0]), { status: 200 });
  } catch (error) {
    // Return error response with status 500
    return new Response(`Fetching data from the database failed: ${error.message}`, { status: 500 });
  }
}