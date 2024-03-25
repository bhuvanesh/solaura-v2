import getPSConnection from "@/lib/planetscaledb";
export const dynamic = 'force-dynamic'


export async function GET(req) {
    console.log(req.url);
    const tableName = process.env.MASTER_TABLE;
    try {
        const conn = await getPSConnection();
        const query = `
            SELECT DISTINCT \`Group\`, company, PAN, GST 
            FROM ${tableName};
        `;
        const [rows] = await conn.query(query);
        await conn.end();
        return new Response(JSON.stringify(rows), { status: 200 });
        
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Error retrieving data' }), { status: 500 });
    }
}