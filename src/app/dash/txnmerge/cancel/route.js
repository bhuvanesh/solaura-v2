import getPSConnection from '@/lib/planetscaledb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  const { transactionIds, organisationName } = await req.json();
  console.log(transactionIds);
  console.log(organisationName);

  try {
    const dbConnection = await getPSConnection();

    const newTransactionId = uuidv4();

    for(const oldTransactionId of transactionIds) {
      const sql = `UPDATE ${process.env.BUYERS_TABLE} SET \`Transaction ID\`='${newTransactionId}', \`Organisation\`='${organisationName}' WHERE \`Transaction ID\`='${oldTransactionId}'`;
      const [rows, fields] = await dbConnection.execute(sql);
      console.log(`Updated transaction ID ${oldTransactionId} to ${newTransactionId} and Organisation to ${organisationName}`);
    }
    return new Response(JSON.stringify({ message: 'Orders Merged successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch(error) {
    console.error(error);

    // Rollback transaction in case of error
    if (conn) {
      await conn.rollback();
    }

    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}