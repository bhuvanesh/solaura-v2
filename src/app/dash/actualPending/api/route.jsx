import getPSConnection from "@/lib/planetscaledb";
import { NextResponse } from "next/server";

export async function POST(req) {
    const { month, year } = await req.json();
    

    try {
        const conn = await getPSConnection();
        const data = await conn.query(`
            SELECT \`Device ID\` , \`Group\`,company,Actual
            FROM \`${process.env.MASTER_TABLE}\` 
            WHERE Month = ? AND Year = ? 
            AND (Actual = 0 OR Actual IS NULL OR Actual = '')
        `, [month, year]);
        return NextResponse.json(data[0]);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}