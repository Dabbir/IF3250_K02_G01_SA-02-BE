module.exports = {
  up: async (connection) => {
    await connection.query(`
      ALTER TABLE masjid
      DROP COLUMN kode_pos,
      DROP COLUMN kota,
      DROP COLUMN provinsi,
      DROP COLUMN negara,
      DROP COLUMN telepon,
      DROP COLUMN email
    `);
    
    console.log('Columns dropped successfully');
  },
  
  down: async (connection) => {
    await connection.query(`
      ALTER TABLE masjid
      ADD COLUMN kode_pos VARCHAR(20),
      ADD COLUMN kota VARCHAR(50),
      ADD COLUMN provinsi VARCHAR(50),
      ADD COLUMN negara VARCHAR(50),
      ADD COLUMN telepon VARCHAR(20),
      ADD COLUMN email VARCHAR(100)
    `);
    
    console.log('Columns recreated successfully');
  }
};