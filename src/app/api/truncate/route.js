import getPSConnection from '@/lib/planetscaledb';

export async function DELETE(req) {
  try {
    const conn = await getPSConnection();
    await conn.query(`TRUNCATE TABLE ${process.env.BUYERS_TABLE};`);
    await conn.query(`TRUNCATE TABLE ${process.env.MASTER_TABLE};`);
    await conn.end();

    return new Response(JSON.stringify({ message: 'Data deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}