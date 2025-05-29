const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "development";

dotenv.config({
  path: env === "production" ? ".env.production" : ".env.development",
});

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: env === "production" ? { rejectUnauthorized: false } : undefined,
};

const pool = mysql.createPool(dbConfig);

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[${env.toUpperCase()}] Database connected successfully`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`[${env.toUpperCase()}] Database connection failed:`, error);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
};