import getPSConnection from '@/lib/planetscaledb';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic'
// Function to fetch all buyers from database
async function getAllBuyers(connection) {
  const [rows] = await connection.query(`SELECT * FROM invoicedata`);
  return rows;
}

// Route handler
export async function GET(request) {
  try {
    const connection = await getPSConnection();
    const invoice = await getAllBuyers(connection);
    // const path = request.nextUrl.searchParams.get('path')
    const path = request.nextUrl.pathname
    revalidatePath(path);

    // Return response with status 200 and data
    return new Response(JSON.stringify(invoice), { status: 200 });
  } catch (error) {
    return new Response(`Fetching data from the database failed: ${error.message}`, { status: 500 });
  }
}