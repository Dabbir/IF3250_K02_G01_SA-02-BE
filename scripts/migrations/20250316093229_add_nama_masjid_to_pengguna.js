module.exports = {
  up: async (connection) => {
    // Tambahkan kolom nama_masjid 
    await connection.query(`
      ALTER TABLE pengguna
      ADD COLUMN nama_masjid VARCHAR(100) NULL
    `);
    
    // Update nilai nama_masjid dari tabel masjid berdasarkan foreign key
    await connection.query(`
      UPDATE pengguna p
      JOIN masjid m ON p.masjid_id = m.id
      SET p.nama_masjid = m.nama_masjid
    `);
    
    console.log('Successfully added nama_masjid column and populated data');
  },
  
  down: async (connection) => {
    // Hapus kolom nama_masjid jika perlu rollback
    await connection.query(`
      ALTER TABLE pengguna
      DROP COLUMN nama_masjid
    `);
    
    console.log('Successfully dropped nama_masjid column');
  }
};