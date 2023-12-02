import getPSConnection from '@/lib/planetscaledb';

function generateSQLQuery(deviceMonths) {
  const tuples = deviceMonths.map(() => '(?, ?, ?)').join(', ');
  return `SELECT \`Device ID\`, \`month\`, \`Year\`, \`Actual_used\`, \`Estimated_used\`, IFNULL(\`Actual_used\`, 0) AS \`Actual_used\`, IFNULL(\`Estimated_used\`, 0) AS \`Estimated_used\` FROM ${process.env.MASTER_TABLE} WHERE (\`Device ID\`, \`month\`, \`Year\`) IN (${tuples})`;
}

export async function DELETE(req) {
  const { transactionId, deviceData, year } = await req.json();
  console.log(transactionId);
  console.log(deviceData);
  console.log(year);

  const conn = await getPSConnection();

  try {
    // Begin transaction
    await conn.beginTransaction();

    // Delete the row from the buyers table
    await conn.execute(`UPDATE ${process.env.BUYERS_TABLE} SET \`Status\` = "Revoked" WHERE \`Transaction ID\` = ?`, [transactionId]);
    // Prepare a list of device IDs and months
    const deviceMonths = [];
    for (const device of deviceData) {
      const deviceId = device.deviceId;
      for (const month of Object.keys(device.monthData)) {
        deviceMonths.push([deviceId, month.toLowerCase(), year]);
      }
    }

    // Fetch data for all devices and months in a single query
    if (deviceMonths.length > 0) {
      const sqlQuery = generateSQLQuery(deviceMonths);
      const flattenedDeviceMonths = deviceMonths.flat();
      const [inventory2Rows] = await conn.execute(sqlQuery, flattenedDeviceMonths);

      // Prepare data for batch update
      let actualUsedData = [];
      let estimatedUsedData = [];

      for (const inventory2Row of inventory2Rows) {
        const deviceId = inventory2Row['Device ID'];
        const month = inventory2Row['month'];
        const actualUsed = parseFloat(inventory2Row['Actual_used']);
        const estimatedUsed = parseFloat(inventory2Row['Estimated_used']);

        // Capitalize the first letter of the month variable
        const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

        const valueToSubtract = parseFloat(deviceData.find(device => device.deviceId === deviceId).monthData[capitalizedMonth]);

        let newValue;

        if (!isNaN(actualUsed) && actualUsed > 0) {
          console.log(`Subtracting: (${actualUsed} - ${valueToSubtract})`);
          newValue = parseFloat((actualUsed - valueToSubtract).toFixed(4));
          actualUsedData.push([deviceId, month, year, newValue]);
        } else if (!isNaN(estimatedUsed)) {
          console.log(`Subtracting: (${estimatedUsed} - ${valueToSubtract})`);
          newValue = parseFloat((estimatedUsed - valueToSubtract).toFixed(4));
          estimatedUsedData.push([deviceId, month, year, newValue]);
        }
      }

      // Perform batch update for Actual_used
      if (actualUsedData.length > 0) {
        console.log('actualUsedData:', actualUsedData);
        const placeholders = actualUsedData.map(() => '(?, ?, ?, ?)').join(', ');
        const actualUsedQuery = `INSERT INTO ${process.env.MASTER_TABLE} (\`Device ID\`, \`month\`, \`Year\`, \`Actual_used\`) VALUES ${placeholders} ON DUPLICATE KEY UPDATE \`Actual_used\` = VALUES(\`Actual_used\`)`;
        await conn.query(actualUsedQuery, actualUsedData.flat());
      }

      // Perform batch update for Estimated_used
      if (estimatedUsedData.length > 0) {
        console.log('estimatedUsedData:', estimatedUsedData);
        const placeholders = estimatedUsedData.map(() => '(?, ?, ?, ?)').join(', ');
        const estimatedUsedQuery = `INSERT INTO ${process.env.MASTER_TABLE} (\`Device ID\`, \`month\`, \`Year\`, \`Estimated_used\`) VALUES ${placeholders} ON DUPLICATE KEY UPDATE \`Estimated_used\` = VALUES(\`Estimated_used\`)`;
        await conn.query(estimatedUsedQuery, estimatedUsedData.flat()); 
      }
    } else {
      console.log('No device months to process');
    }

    // Commit transaction
    await conn.commit();

    return new Response(JSON.stringify({ message: 'Row deleted successfully' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error(error);

    // Rollback transaction in case of error
    if (conn) {
      await conn.rollback();
    }

    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}