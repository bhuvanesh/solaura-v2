import getPSConnection from '@/lib/planetscaledb';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// Function to fetch all buyers from database
async function getAllBuyers(connection, tableName) {
  const [rows] = await connection.query(`SELECT * FROM ${tableName}`);
  return rows;
}

// Route handler
export async function GET(request) {
  try {
    const connection = await getPSConnection();
    const tableName = process.env.INVOICE_DATA;
    const invoice = await getAllBuyers(connection, tableName);
    const path = request.nextUrl.pathname;
    revalidatePath(path);

    // Return response with status 200 and data
    return new Response(JSON.stringify(invoice), { status: 200 });
  } catch (error) {
    return new Response(`Fetching data from the database failed: ${error.message}`, { status: 500 });
  }
}