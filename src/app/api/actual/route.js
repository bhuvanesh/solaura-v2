import getPSConnection from '@/lib/planetscaledb';

export async function POST(req) {
  const rows = await req.json();

  try {
    const conn = await getPSConnection();

    // Prepare the batch insert query
    const values = rows.flatMap(row => [row.project, row.Month, row.Year, row.Actual]);
    const placeholders = rows.map(() => '(?, ?, ?, ?)').join(', ');
    const insertQuery = `
      INSERT INTO inventory2 (project, Month, Year, Actual)
      VALUES ${placeholders}
      ON DUPLICATE KEY UPDATE
        Actual = VALUES(Actual),
        Actual_used = COALESCE(Actual_used, 0) + COALESCE(Estimated_used, 0),
        Estimated_used = 0,
        \`Production Status\` = IF(VALUES(Actual) < COALESCE(Actual_used, 0) + COALESCE(Estimated_used, 0), 'mismatch', \`Production Status\`)

    `;

    // Execute the batch insert query
    await conn.query(insertQuery, values);

    await conn.end();
    return new Response(JSON.stringify({ message: 'Data updated successfully' }), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Error updating data' }), { status: 500 });
  }
}