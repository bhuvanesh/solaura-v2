import getPSConnection from "@/lib/planetscaledb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const conn = await getPSConnection();
        const Organisations = await conn.query(`
            SELECT id, CODE, NAME, TYPE
            FROM BUYER_ORGS 
        `);
        const TransferTypes = await conn.query(`
            SELECT id, status
            FROM ALLOCATION_STATUS
        `);


        return NextResponse.json({Organisations: Organisations[0], TransferTypes: TransferTypes[0]});
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

