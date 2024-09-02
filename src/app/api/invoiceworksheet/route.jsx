import getPSConnection from '@/lib/planetscaledb';

export async function POST(request) {
    // Receiving the Device IDs and date range from the request
    const { deviceIds, invoicePeriodFrom, invoicePeriodTo } = await request.json();
    const tableName = process.env.MASTER_TABLE;

    try {
        const connection = await getPSConnection();
        
        // Parse the date strings to Date objects
        const startDate = new Date(invoicePeriodFrom);
        const endDate = new Date(invoicePeriodTo);
        
        // Generate an array of month names between the start and end dates
        const months = [];
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            months.push(monthNames[currentDate.getMonth()]);
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // Construct the SQL query
        const query = `
            SELECT \`Device ID\`, \`Month\`, \`Year\`, \`Issued\`
            FROM ${tableName}
            WHERE \`Device ID\` IN (${deviceIds.split(',').map(id => `'${id.trim()}'`).join(',')})
            AND \`Month\` IN (${months.map(month => `'${month}'`).join(',')})
            AND CONCAT(\`Year\`, '-', LPAD(FIELD(\`Month\`, ${monthNames.map(m => `'${m}'`).join(',')}), 2, '0'), '-01') 
                BETWEEN ? AND ?
        `;

        // Execute the query
        const invoiceData = await connection.query(query, [invoicePeriodFrom, invoicePeriodTo]);

        // Return the invoice data
        return new Response(JSON.stringify(invoiceData), { status: 200 });
    } catch (error) {
        console.error('Error fetching invoice data:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
