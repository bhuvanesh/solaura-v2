import getPSConnection from '@/lib/planetscaledb';  

export async function POST(req, res) {
  try {
    const rows = await req.json();
    console.log('rows',rows);

    const conn = await getPSConnection();

    // Subtract oldactual and add newactual in buyers
    let query = `UPDATE buyers SET \`${rows.month}\` = \`${rows.month}\` - ${rows.oldactual} + ${rows.newactual} WHERE \`Transaction ID\` = '${rows.transactionId}' AND \`Device ID\` = '${rows.deviceId}' AND year = ${rows.year}`;
    await conn.query(query);

    // Update inventory2
    query = `UPDATE inventory2 SET Actual_used = IF(Actual_used != 0 AND Actual_used IS NOT NULL, Actual_used - ${rows.oldactual} + ${rows.newactual}, Actual_used), Estimated_used = IF(Actual_used = 0 OR Actual_used IS NULL, Estimated_used - ${rows.oldactual} + ${rows.newactual}, Estimated_used) WHERE \`Device ID\` = '${rows.deviceId}' AND Month = '${rows.month}' AND Year = ${rows.year}`;    await conn.query(query);

    conn.end();

return new Response(JSON.stringify({ message: 'Transaction updated successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(error);


    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}