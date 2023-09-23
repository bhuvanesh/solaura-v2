const mysql = require('mysql2/promise');
const fs = require('fs')

async function getPSConnection() {
  const url = new URL(process.env.DATABASE_URL2);
  

  // Extract the connection details
  const host = url.hostname;
  const user = url.username;
  const password = url.password;
  const database = url.pathname.replace(/^\//, ''); // Remove the leading slash

  // Get the certificate from the environment variable
  // const certificate = process.env.PLANETSCALE_CA_CERT;
  let certificate =''
  if(process.env.NODE_ENV == 'production'){
    certificate='/etc/pki/tls/certs/ca-bundle.crt'
  }
  else{
    certificate ='/etc/ssl/cert.pem'
  }



  // Create a new MySQL connection with SSL
  const connection = await mysql.createConnection({
    host,
    user,
    password,
    database,
    ssl: {
      // Convert the certificate string to a Buffer
      // ca: Buffer.from(certificate, 'utf-8'),
      ca: fs.readFileSync(certificate)
    },
  });
  

  return connection;
}

export default getPSConnection;