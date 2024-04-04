const mysql = require('mysql2/promise');

async function getPSConnection() {
  const url = new URL(process.env.DATABASE_AWS_URL);

  // Extract the connection details
  const host = url.hostname;
  const user = url.username;
  const password = url.password;
  const database = url.pathname.replace(/^\//, ''); // Remove the leading slash

  // Create a new MySQL connection
  const connection = await mysql.createConnection({
    host,
    user,
    password,
    database,
  });

  return connection;
}

export default getPSConnection;