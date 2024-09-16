import { NextResponse } from 'next/server';
import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  try {
    const { name, type } = await req.json();
    const conn = await getPSConnection();



    const result = await conn.query({
      sql: 'INSERT INTO BUYER_ORGS (CODE, TYPE) VALUES (?, ?)',
      values: [name, type],
    });


      return NextResponse.json({ message: 'Organisation added successfully' });
    
  } catch (error) {
    console.error('Error adding organisation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
