import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  const requestBody = await req.json();

  try {
    const conn = await getPSConnection();

    const { organisation, selectedMonths, uniqueId: transactionId, requirement, productionPeriodFrom, productionPeriodTo, CoDYear, type } = requestBody;
    const tableName = process.env.DRAFT;
    const insertQuery = `
      INSERT INTO ${tableName} (Transaction_ID, Draft_Data, Organisation, requirement, productionPeriodFrom, productionPeriodTo, CoDYear, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      Draft_Data = VALUES(Draft_Data),
      Organisation = VALUES(Organisation),
      requirement = VALUES(requirement),
      productionPeriodFrom = VALUES(productionPeriodFrom),
      productionPeriodTo = VALUES(productionPeriodTo),
      CoDYear = VALUES(CoDYear),
      type = VALUES(type);
    `;

    await conn.query(insertQuery, [transactionId, JSON.stringify(selectedMonths), organisation, requirement, productionPeriodFrom, productionPeriodTo, CoDYear, type]);

    await conn.end();

    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}
