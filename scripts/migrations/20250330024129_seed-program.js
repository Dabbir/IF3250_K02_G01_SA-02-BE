const bcrypt = require('bcryptjs');

module.exports = {
  up: async (connection) => {
    const programs = [
      {
        nama_program: "Penyediaan Buka Puasa Gratis",
        deskripsi_program: "Program buka puasa bersama yang diselenggarakan selama bulan Ramadhan tahun 2025",
        pilar_program: JSON.stringify(["Kehidupan Sehat dan Sejahtera", "Tanpa Kelaparan"]),
        kriteria_program: "Program Penyejahteraan Umat",
        waktu_mulai: "2025-03-20",
        waktu_selesai: "2025-03-25",
        rancangan_anggaran: 5000000,
        aktualisasi_anggaran: 100000,
        status_program: "Berjalan",
        masjid_id: 1,
        created_by: 1,
      },
      {
        nama_program: "Pemberdayaan Ekonomi Jamaah",
        deskripsi_program: "Program untuk meningkatkan kesejahteraan ekonomi jamaah masjid melalui pelatihan keterampilan dan modal usaha",
        pilar_program: JSON.stringify(["Pekerjaan Layak dan Pertumbuhan Ekonomi"]),
        kriteria_program: "Program Pemberdayaan Ekonomi",
        waktu_mulai: "2025-04-01",
        waktu_selesai: "2025-12-31",
        rancangan_anggaran: 35000000,
        aktualisasi_anggaran: 0,
        status_program: "Berjalan",
        masjid_id: 1,
        created_by: 1,
      },
    ];

    const hashedPassword = await bcrypt.hash('program123', 10);
    
    await connection.query(`
      INSERT INTO pengguna (nama, email, password, peran, masjid_id, short_bio, alasan_bergabung)
      VALUES ('cek program', 'program@gmail.com', ?, 'Editor', 1, 'Test program', 'Test program')
    `, [hashedPassword]);

    for (const program of programs) {
      await connection.query(
        `INSERT INTO program 
        (nama_program, deskripsi_program, pilar_program, kriteria_program, waktu_mulai, waktu_selesai, 
        rancangan_anggaran, aktualisasi_anggaran, status_program, masjid_id, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          program.nama_program, program.deskripsi_program, program.pilar_program, program.kriteria_program, 
          program.waktu_mulai, program.waktu_selesai, program.rancangan_anggaran, program.aktualisasi_anggaran, 
          program.status_program, program.masjid_id, program.created_by
        ]
      );
    }
  },
};