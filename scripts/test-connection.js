require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  const config = {
    host: process.env.DB_HOST || "/cloudsql/salman-sustainability-re-41855:asia-southeast2:salman-db",
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "salmansr123",
    ssl: false,
    // Tidak include database dulu untuk test connection
    connectTimeout: 60000,
  };

  console.log('Testing connection with config:');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('User:', config.user);
  console.log('Password:', config.password ? '[PROVIDED]' : '[MISSING]');

  try {
    console.log('🔄 Attempting connection...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!');
    
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('📊 Test query result:', result);
    
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📁 Available databases:');
    databases.forEach(db => console.log(`  - ${Object.values(db)[0]}`));
    
    await connection.end();
    console.log('🔌 Connection closed');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
  }
}

testConnection();