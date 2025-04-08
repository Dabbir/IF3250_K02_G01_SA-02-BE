module.exports = {
    up: async (connection) => {
      await connection.query(`
        ALTER TABLE aktivitas 
        MODIFY COLUMN program_id INT NULL;
      `);
    },
  
    down: async (connection) => {
      await connection.query(`
        ALTER TABLE aktivitas 
        MODIFY COLUMN program_id INT NOT NULL;
      `);
    }
  };
  