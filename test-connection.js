// test-db-connection.js

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'mysql-19069af5-ahmadmudabbir03-3bf2.g.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_nMOA-WxvDdw2ZYwsl3A',
  database: 'defaultdb',
  port: 28717,
  ssl: process.env.DB_SSL
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

console.log('⏳ Testing database connection...');

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to AivenCloud MySQL successfully!');
    connection.end();
  }
});
