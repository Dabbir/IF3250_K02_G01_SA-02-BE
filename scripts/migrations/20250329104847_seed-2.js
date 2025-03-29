const bcrypt = require('bcryptjs');

module.exports = {
  up: async (connection) => {
    // Create program record
    const [programResult] = await connection.query(`
      INSERT INTO program (
        nama_program, 
        deskripsi_program, 
        pilar_program, 
        kriteria_program, 
        waktu_mulai, 
        waktu_selesai, 
        rancangan_anggaran, 
        aktualisasi_anggaran, 
        status_program, 
        masjid_id, 
        created_by
      ) 
      VALUES (
        'Program Pemberdayaan Masjid', 
        'Program untuk meningkatkan kualitas dan fungsi masjid sebagai pusat kegiatan umat', 
        'Pemberdayaan', 
        'Masjid dengan jamaah aktif minimal 50 orang', 
        '2024-01-01', 
        '2024-12-31', 
        100000000.00, 
        85000000.00, 
        'Berjalan', 
        1, 
        1
      )
    `);

    const hashedPassword = await bcrypt.hash('aktivitas', 10);
        
    await connection.query(`
      INSERT INTO pengguna (
        nama, 
        email, 
        password, 
        peran, 
        status,
        masjid_id,
        short_bio,
        alasan_bergabung
      ) 
      VALUES (
        'cek aktivitas', 
        'aktivitas@gmail.com', 
        ?, 
        'Editor', 
        'Approved',
        1,
        'Test Aktivitasssss',
        'Test Aktivitasssss'
      )
    `, [hashedPassword]);

    // Create 30 aktivitas records
    await connection.query(`
      INSERT INTO aktivitas (
        nama_aktivitas, 
        deskripsi, 
        dokumentasi, 
        tanggal_mulai, 
        tanggal_selesai, 
        biaya_implementasi, 
        status, 
        program_id, 
        created_by, 
        masjid_id
      ) VALUES
      ('Kajian Mingguan', 'Kajian rutin setiap hari Minggu pagi setelah shalat Subuh', 'https://example.com/docs/kajian-mingguan', '2024-01-07', '2024-12-29', 2400000.00, 'Ongoing', 1, 1, 1),
      ('Pembagian Sembako', 'Pembagian sembako untuk warga kurang mampu di sekitar masjid', 'https://example.com/docs/sembako-jan', '2024-01-15', '2024-01-15', 5000000.00, 'Finished', 1, 1, 1),
      ('Pelatihan Manajemen Masjid', 'Pelatihan pengelolaan dan manajemen masjid untuk pengurus', 'https://example.com/docs/pelatihan-manajemen', '2024-02-05', '2024-02-07', 7500000.00, 'Finished', 1, 1, 1),
      ('Tahsin Al-Quran', 'Kelas perbaikan bacaan Al-Quran untuk jamaah masjid', 'https://example.com/docs/tahsin-2024', '2024-01-10', '2024-12-20', 3600000.00, 'Ongoing', 1, 1, 1),
      ('Santunan Anak Yatim', 'Program santunan bulanan untuk anak yatim di sekitar masjid', 'https://example.com/docs/santunan-feb', '2024-02-15', '2024-02-15', 4000000.00, 'Finished', 1, 1, 1),
      ('Buka Puasa Bersama Ramadhan', 'Program buka puasa bersama selama bulan Ramadhan', 'https://example.com/docs/bukber-ramadhan', '2024-03-12', '2024-04-10', 15000000.00, 'Finished', 1, 1, 1),
      ('Renovasi Tempat Wudhu', 'Perbaikan dan perluasan area tempat wudhu masjid', 'https://example.com/docs/renovasi-wudhu', '2024-05-10', '2024-06-10', 20000000.00, 'Ongoing', 1, 1, 1),
      ('Tadarus Al-Quran Ramadhan', 'Program tadarus Al-Quran bersama selama Ramadhan', 'https://example.com/docs/tadarus-ramadhan', '2024-03-12', '2024-04-10', 1000000.00, 'Finished', 1, 1, 1),
      ('Pelatihan Da\\'i Muda', 'Program pelatihan untuk da\\'i muda di lingkungan masjid', 'https://example.com/docs/dai-muda', '2024-06-15', '2024-06-30', 6000000.00, 'Unstarted', 1, 1, 1),
      ('Lomba Adzan dan Hafalan', 'Perlombaan adzan dan hafalan Al-Quran untuk anak-anak', 'https://example.com/docs/lomba-adzan', '2024-07-20', '2024-07-21', 3500000.00, 'Unstarted', 1, 1, 1),
      ('Kuliah Subuh Ramadhan', 'Program kuliah subuh setiap hari selama Ramadhan', 'https://example.com/docs/kuliah-subuh', '2024-03-12', '2024-04-10', 3000000.00, 'Finished', 1, 1, 1),
      ('Donor Darah', 'Program donor darah bekerja sama dengan PMI', 'https://example.com/docs/donor-darah', '2024-08-10', '2024-08-10', 2500000.00, 'Unstarted', 1, 1, 1),
      ('Festival Anak Sholeh', 'Festival dengan berbagai lomba islami untuk anak-anak', 'https://example.com/docs/festival-anak', '2024-09-15', '2024-09-16', 7500000.00, 'Unstarted', 1, 1, 1),
      ('Pemeriksaan Kesehatan Gratis', 'Program pemeriksaan kesehatan gratis untuk masyarakat', 'https://example.com/docs/cek-kesehatan', '2024-10-25', '2024-10-25', 8000000.00, 'Unstarted', 1, 1, 1),
      ('Tahajud Bersama', 'Program sholat tahajud bersama untuk jamaah masjid', 'https://example.com/docs/tahajud', '2024-02-15', '2024-02-16', 500000.00, 'Finished', 1, 1, 1),
      ('Pelatihan Pengurusan Jenazah', 'Pelatihan tata cara pengurusan jenazah sesuai syariat', 'https://example.com/docs/jenazah', '2024-04-20', '2024-04-21', 3000000.00, 'Finished', 1, 1, 1),
      ('Perpustakaan Masjid', 'Pengadaan buku dan pengelolaan perpustakaan masjid', 'https://example.com/docs/perpustakaan', '2024-05-01', '2024-05-31', 12000000.00, 'Ongoing', 1, 1, 1),
      ('Pelatihan Keuangan Masjid', 'Pelatihan sistem pengelolaan keuangan masjid yang transparan', 'https://example.com/docs/keuangan', '2024-07-10', '2024-07-12', 4500000.00, 'Unstarted', 1, 1, 1),
      ('Pemberdayaan Ekonomi Jamaah', 'Program pemberdayaan ekonomi untuk jamaah masjid', 'https://example.com/docs/ekonomi', '2024-06-01', '2024-11-30', 15000000.00, 'Ongoing', 1, 1, 1),
      ('Persiapan Idul Adha', 'Persiapan kegiatan Idul Adha dan penyembelihan hewan kurban', 'https://example.com/docs/idul-adha', '2024-06-10', '2024-06-17', 2500000.00, 'Unstarted', 1, 1, 1),
      ('Itikaf Ramadhan', 'Program itikaf 10 hari terakhir Ramadhan', 'https://example.com/docs/itikaf', '2024-04-01', '2024-04-10', 2500000.00, 'Finished', 1, 1, 1),
      ('Outing Remaja Masjid', 'Kegiatan outdoor untuk remaja masjid', 'https://example.com/docs/outing', '2024-08-18', '2024-08-19', 7500000.00, 'Unstarted', 1, 1, 1),
      ('Rumah Tahfidz', 'Pembentukan rumah tahfidz untuk belajar menghafal Al-Quran', 'https://example.com/docs/tahfidz', '2024-07-01', '2024-12-31', 10000000.00, 'Unstarted', 1, 1, 1),
      ('Sholat Istisqa', 'Pelaksanaan sholat minta hujan bersama jamaah', 'https://example.com/docs/istisqa', '2024-10-10', '2024-10-10', 500000.00, 'Unstarted', 1, 1, 1),
      ('Seminar Keluarga Sakinah', 'Seminar tentang membentuk keluarga sakinah dalam Islam', 'https://example.com/docs/sakinah', '2024-11-15', '2024-11-15', 5000000.00, 'Unstarted', 1, 1, 1),
      ('Majelis Taklim Ibu-ibu', 'Pengajian rutin khusus untuk ibu-ibu', 'https://example.com/docs/majelis-ibu', '2024-01-05', '2024-12-28', 3600000.00, 'Ongoing', 1, 1, 1),
      ('Bank Sampah Masjid', 'Program pengelolaan sampah berbasis masjid', 'https://example.com/docs/bank-sampah', '2024-06-01', '2024-12-31', 4000000.00, 'Unstarted', 1, 1, 1),
      ('Pawai Tahun Baru Islam', 'Kegiatan pawai menyambut tahun baru Hijriyah', 'https://example.com/docs/pawai', '2024-07-07', '2024-07-07', 3500000.00, 'Unstarted', 1, 1, 1),
      ('Pelatihan Khatib dan Imam', 'Pelatihan untuk khatib dan imam masjid', 'https://example.com/docs/khatib', '2024-09-14', '2024-09-15', 4000000.00, 'Unstarted', 1, 1, 1),
      ('Festival Ramadhan', 'Festival dengan berbagai kegiatan selama bulan Ramadhan', 'https://example.com/docs/festival-ramadhan', '2024-03-12', '2024-04-10', 12000000.00, 'Finished', 1, 1, 1)
    `);
  },
  
  down: async (connection) => {
    // Remove inserted data
    await connection.query('DELETE FROM aktivitas WHERE program_id = 1');
    await connection.query('DELETE FROM pengguna WHERE nama = cek aktivitas');
    await connection.query('DELETE FROM program WHERE id = 1');
  }
};