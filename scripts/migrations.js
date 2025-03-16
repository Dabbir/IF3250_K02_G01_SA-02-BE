require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "salman_sustainability",
};

// Migration tracking table
const MIGRATIONS_TABLE = "migrations";

async function runMigrations() {
  let connection;

  try {
    // Connect to MySQL server
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
    });

    console.log("Connected to database for migrations");

    // Create migrations table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of executed migrations
    const [executedMigrations] = await connection.query(
      `SELECT name FROM ${MIGRATIONS_TABLE}`
    );
    const executedMigrationNames = executedMigrations.map((m) => m.name);

    // Read migration files from migrations directory
    const migrationsDir = path.join(__dirname, "migrations");

    // Create migrations directory if it doesn't exist
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log("Created migrations directory");
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".js"))
      .sort(); // Ensure migrations run in alphabetical order

    // Run pending migrations
    for (const migrationFile of migrationFiles) {
      if (!executedMigrationNames.includes(migrationFile)) {
        console.log(`Running migration: ${migrationFile}`);

        // Import and execute the migration
        const migration = require(path.join(migrationsDir, migrationFile));

        // Start a transaction
        await connection.query("START TRANSACTION");

        try {
          // Execute the migration
          await migration.up(connection);

          // Record the migration
          await connection.query(
            `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES (?)`,
            [migrationFile]
          );

          // Commit the transaction
          await connection.query("COMMIT");
          console.log(`Migration ${migrationFile} completed successfully`);
        } catch (error) {
          // Rollback in case of error
          await connection.query("ROLLBACK");
          console.error(`Error executing migration ${migrationFile}:`, error);
          throw error; // Rethrow to stop migration process
        }
      } else {
        console.log(`Migration ${migrationFile} already executed, skipping`);
      }
    }

    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Helper function to create a new migration file
function createMigration(name) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const fileName = `${timestamp}_${name}.js`;
  const migrationsDir = path.join(__dirname, "migrations");

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const filePath = path.join(migrationsDir, fileName);

  const template = `
module.exports = {
  up: async (connection) => {
    // Add your migration code here
    // Example:
    // await connection.query(\`
    //   ALTER TABLE your_table
    //   ADD COLUMN new_column VARCHAR(255)
    // \`);
  },
  
  down: async (connection) => {
    // Add code to revert the migration
    // Example:
    // await connection.query(\`
    //   ALTER TABLE your_table
    //   DROP COLUMN new_column
    // \`);
  }
};
`;

  fs.writeFileSync(filePath, template.trim());
  console.log(`Created new migration: ${fileName}`);
}

// Determine whether to run migrations or create a new migration file
if (process.argv[2] === "create" && process.argv[3]) {
  createMigration(process.argv[3]);
} else {
  runMigrations();
}
