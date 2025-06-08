const path = require('path');
const envFile = '.env.development';
require('dotenv').config({ path: path.resolve(__dirname, envFile) });

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

console.log('⏳ Testing database connection...');

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL successfully!');
    connection.end();
  }
});
