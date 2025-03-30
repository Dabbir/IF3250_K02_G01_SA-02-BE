const bcrypt = require('bcryptjs');

module.exports = {
  up: async (connection) => {
    const [masjidResult] = await connection.query(`
      INSERT INTO masjid (nama_masjid, alamat) 
      VALUES ('Masjid Salman ITB', 'Jl. Ganesha No.10, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132')
      ,('Masjid 2 ITB', 'Gaada yang tau alamat masjid 2')
    `);
    
    const masjidId = masjidResult.insertId;
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await connection.query(`
      INSERT INTO pengguna (
        nama, 
        email, 
        password, 
        peran, 
        masjid_id,
        short_bio,
        alasan_bergabung
      ) 
      VALUES (
        'Admin Salman', 
        'admin@salman.org', 
        ?, 
        'Admin', 
        ?,
        'Administrator Sistem Sustainability Report Salman',
        'Mengelola platform pelaporan sustainability Masjid Salman ITB'
      )
    `, [hashedPassword, masjidId]);
  },
  
  down: async (connection) => {
    // Remove all data
    await connection.query('SET FOREIGN_KEY_CHECKS=0');
    
    const tables = [
      'viewer_access',
      'pendaftar_pelatihan',
      'pelatihan',
      'gallery',
      'aktivitas_employee',
      'employee',
      'aktivitas_beneficiaries',
      'beneficiaries',
      'aktivitas_stakeholder',
      'stakeholder',
      'publikasi',
      'aktivitas',
      'program',
      'pengguna',
      'masjid'
    ];
    
    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS=1');
  }
};