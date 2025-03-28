module.exports = {
  up: async (connection) => {
    // Add your migration code here
    // Example:
    await connection.query(`
      ALTER TABLE aktivitas
      DROP COLUMN target_tercapai
    `);
  },
  
  down: async (connection) => {
    // Add code to revert the migration
    // Example:
    await connection.query(`
      ALTER TABLE aktivitas
      ADD COLUMN target_tercapai TEXT
    `);
  }
};