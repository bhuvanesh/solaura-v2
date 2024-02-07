import getPSConnection from "@/lib/planetscaledb";

export async function GET(req) {
    console.log(req.url);
    try {
        const conn = await getPSConnection();
        const query = `
            SELECT * FROM draft WHERE Status = 1;
        `;
        const [rows] = await conn.query(query);
        await conn.end();
        return new Response(JSON.stringify(rows), { status: 200 });
        
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ message: 'Error retrieving data' }), { status: 500 });
    }
}