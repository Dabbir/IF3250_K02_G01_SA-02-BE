require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db",
};

async function seedDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
    });

    console.log("Connected to MySQL server");

    await connection.query(`
      INSERT INTO masjid (nama_masjid, alamat) 
      VALUES 
      ('Masjid Al-Huda', 'Jl. Cisitu Lama No.10, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132'),
      ('Masjid Al-Ikhlas', 'Jl. Dago Asri No.10, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132'),
      ('Masjid At-Taqwa', 'Jl. Tubagus Ismail No.10, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132'),
      ('Masjid Muhajirin', 'Jl. Sadang Serang Ismail No.10, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132')
    `);

    console.log("Masjid seeded successfully!");

    const editorPassword = await bcrypt.hash('editor123', 10);
    const query = `
    INSERT INTO pengguna 
      (nama, email, password, peran, status, short_bio, alasan_bergabung, masjid_id)
    VALUES
      ('Ahmad Fauzi', 'ahmad@example.com', ?, 'Editor', 'Approved', 'Penggiat teknologi islami.', 'Ingin membantu digitalisasi masjid.', 1),
      ('Siti Aminah', 'siti@example.com', ?, 'Editor', 'Pending', 'Aktivis remaja masjid.', 'Mau ikut aktif dalam program dakwah online.', 2),
      ('Budi Santoso', 'budi@example.com', ?, 'Editor', 'Pending', 'Suka ikut pengajian online.', 'Pengen tau kegiatan masjid lebih lanjut.', 3),
      ('Mirwan Maizonni', 'mirwan@example.com', ?, 'Editor', 'Rejected', 'Suka ikut pengajian online.', 'Pengen tau kegiatan masjid lebih lanjut.', 4),
      ('Arif Budi', 'arif@example.com', ?, 'Editor', 'Rejected', 'Suka ikut pengajian online.', 'Pengen tau kegiatan masjid lebih lanjut.', 5)
  `;

    await connection.query(query, [
      editorPassword,
      editorPassword,
      editorPassword,
      editorPassword,
      editorPassword
    ]);

    console.log("Users seeded successfully!");

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
        status_program: "Selesai",
        masjid_id: 1,
        created_by: 2,
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
        created_by: 2,
      },
    ];

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

    console.log("Programs seeded successfully!");

    const today = new Date();

    const aktivitasList = [
      { nama: 'Kajian Mingguan', deskripsi: 'Kajian rutin setiap hari Minggu pagi setelah shalat Subuh', biaya: 2400000 },
      { nama: 'Pembagian Sembako', deskripsi: 'Pembagian sembako untuk warga kurang mampu di sekitar masjid', biaya: 5000000 },
      { nama: 'Pelatihan Manajemen Masjid', deskripsi: 'Pelatihan pengelolaan dan manajemen masjid untuk pengurus', biaya: 7500000 },
      { nama: 'Tahsin Al-Quran', deskripsi: 'Kelas perbaikan bacaan Al-Quran untuk jamaah masjid', biaya: 3600000 },
      { nama: 'Santunan Anak Yatim', deskripsi: 'Program santunan bulanan untuk anak yatim di sekitar masjid', biaya: 4000000 },
      { nama: 'Buka Puasa Bersama Ramadhan', deskripsi: 'Program buka puasa bersama selama bulan Ramadhan', biaya: 15000000 },
      { nama: 'Renovasi Tempat Wudhu', deskripsi: 'Perbaikan dan perluasan area tempat wudhu masjid', biaya: 20000000 },
      { nama: 'Tadarus Al-Quran Ramadhan', deskripsi: 'Program tadarus Al-Quran bersama selama Ramadhan', biaya: 1000000 },
      { nama: 'Pelatihan Da\'i Muda', deskripsi: 'Program pelatihan untuk da\'i muda di lingkungan masjid', biaya: 6000000 },
      { nama: 'Lomba Adzan dan Hafalan', deskripsi: 'Perlombaan adzan dan hafalan Al-Quran untuk anak-anak', biaya: 3500000 },
      { nama: 'Kuliah Subuh Ramadhan', deskripsi: 'Program kuliah subuh setiap hari selama Ramadhan', biaya: 3000000 },
      { nama: 'Donor Darah', deskripsi: 'Program donor darah bekerja sama dengan PMI', biaya: 2500000 },
      { nama: 'Festival Anak Sholeh', deskripsi: 'Festival dengan berbagai lomba islami untuk anak-anak', biaya: 7500000 },
      { nama: 'Pemeriksaan Kesehatan Gratis', deskripsi: 'Program pemeriksaan kesehatan gratis untuk masyarakat', biaya: 8000000 },
      { nama: 'Tahajud Bersama', deskripsi: 'Program sholat tahajud bersama untuk jamaah masjid', biaya: 500000 },
      { nama: 'Pelatihan Pengurusan Jenazah', deskripsi: 'Pelatihan tata cara pengurusan jenazah sesuai syariat', biaya: 3000000 },
      { nama: 'Perpustakaan Masjid', deskripsi: 'Pengadaan buku dan pengelolaan perpustakaan masjid', biaya: 12000000 },
      { nama: 'Pelatihan Keuangan Masjid', deskripsi: 'Pelatihan sistem pengelolaan keuangan masjid yang transparan', biaya: 4500000 },
      { nama: 'Pemberdayaan Ekonomi Jamaah', deskripsi: 'Program pemberdayaan ekonomi untuk jamaah masjid', biaya: 15000000 },
      { nama: 'Persiapan Idul Adha', deskripsi: 'Persiapan kegiatan Idul Adha dan penyembelihan hewan kurban', biaya: 2500000 },
      { nama: 'Itikaf Ramadhan', deskripsi: 'Program itikaf 10 hari terakhir Ramadhan', biaya: 2500000 },
      { nama: 'Outing Remaja Masjid', deskripsi: 'Kegiatan outdoor untuk remaja masjid', biaya: 7500000 },
      { nama: 'Rumah Tahfidz', deskripsi: 'Pembentukan rumah tahfidz untuk belajar menghafal Al-Quran', biaya: 10000000 },
      { nama: 'Sholat Istisqa', deskripsi: 'Pelaksanaan sholat minta hujan bersama jamaah', biaya: 500000 },
      { nama: 'Seminar Keluarga Sakinah', deskripsi: 'Seminar tentang membentuk keluarga sakinah dalam Islam', biaya: 5000000 },
      { nama: 'Majelis Taklim Ibu-ibu', deskripsi: 'Pengajian rutin khusus untuk ibu-ibu', biaya: 3600000 },
      { nama: 'Bank Sampah Masjid', deskripsi: 'Program pengelolaan sampah berbasis masjid', biaya: 4000000 },
      { nama: 'Pawai Tahun Baru Islam', deskripsi: 'Kegiatan pawai menyambut tahun baru Hijriyah', biaya: 3500000 },
      { nama: 'Pelatihan Khatib dan Imam', deskripsi: 'Pelatihan untuk khatib dan imam masjid', biaya: 4000000 },
      { nama: 'Festival Ramadhan', deskripsi: 'Festival dengan berbagai kegiatan selama bulan Ramadhan', biaya: 12000000 }
    ];

    const values = aktivitasList.map((item, index) => {
      let startDate = new Date(today);
      let endDate = new Date(today);

      const programId = index < 15 ? 1 : 2;

      let status;
      if (index % 3 === 0) {
        startDate.setMonth(startDate.getMonth() - 3);
        endDate.setMonth(endDate.getMonth() - 2);
        status = 'Selesai';
      } else if (index % 3 === 1) {
        startDate.setDate(startDate.getDate() - 5);
        endDate.setDate(endDate.getDate() + 20);
        status = 'Berjalan';
      } else {
        startDate.setDate(startDate.getDate() + 10);
        endDate.setDate(endDate.getDate() + 20);
        status = 'Belum Mulai';
      }

      const formatDate = d => d.toISOString().slice(0, 10);
      return [
        item.nama,
        item.deskripsi,
        null,
        formatDate(startDate),
        formatDate(endDate),
        item.biaya,
        status,
        programId,
        1,
        1
      ];
    });

    const placeholders = values.map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(", ");

    await connection.query(
      `
      INSERT INTO aktivitas (
        nama_aktivitas, deskripsi, dokumentasi, tanggal_mulai, tanggal_selesai,
        biaya_implementasi, status, program_id, created_by, masjid_id
      ) VALUES ${placeholders}
      `,
      values.flat()
    );

    console.log("Acitivities seeded successfully!");

    await connection.query(`
      INSERT INTO publikasi 
        (judul_publikasi, media_publikasi, nama_perusahaan_media, tanggal_publikasi, url_publikasi, pr_value, program_id, aktivitas_id, created_by, tone) 
      VALUES
        ('Masjid Salman ITB Resmikan Program Pengolahan Sampah Organik', 'Media Online', 'Kompas.com', '2025-01-15', 'https://kompas.com/berita/masjid-salman-program-sampah', 5000000.00, 1, 1, 1, 'Positif'),
        ('Pelatihan Pengelolaan Air Hujan untuk DKM se-Bandung Raya', 'Koran', 'Pikiran Rakyat', '2025-02-01', 'https://pikiran-rakyat.com/bandung/masjid-salman-pelatihan', 3500000.00, 1, 3, 1, 'Positif'),
        ('Masjid Salman ITB Jadi Percontohan Masjid Ramah Lingkungan', 'Televisi', 'TVOne', '2025-02-20', 'https://tvone.co.id/program/masjid-ramah-lingkungan', 7500000.00, 1, 2, 1, 'Positif'),
        ('Program Panel Surya Masjid Salman Hemat 30% Energi', 'Radio', 'Radio Republik Indonesia', '2025-03-05', 'https://rri.co.id/bandung/program-panel-surya', 2800000.00, 1, 4, 1, 'Positif'),
        ('Kritik untuk Program Eco-Waste Masjid Salman yang Belum Maksimal', 'Media Online', 'Detik.com', '2025-03-15', 'https://detik.com/jabar/kritik-program-eco-waste', 1500000.00, 1, 5, 1, 'Negatif'),
        ('Kolaborasi Masjid Salman dan Pemkot Bandung dalam Penghijauan Kota', 'Sosial Media', 'Instagram @PemkotBandung', '2025-03-28', 'https://instagram.com/pemkotbandung/post/12345', 4200000.00, 1, 7, 1, 'Positif'),
        ('Masjid Salman Gelar Workshop Pemanfaatan Air Wudhu', 'Media Online', 'Tribunnews.com', '2025-04-10', 'https://tribunnews.com/jabar/masjid-salman-workshop', 2900000.00, 1, 8, 1, 'Netral'),
        ('Program Pemilahan Sampah Masjid Salman Diapresiasi Kementerian LHK', 'Koran', 'Republika', '2025-04-22', 'https://republika.co.id/berita/program-pemilahan-sampah', 5500000.00, 1, 9, 1, 'Positif'),
        ('Inisiatif Masjid Hijau Salman ITB Diminati Masjid Lain', 'Media Online', 'Liputan6.com', '2025-05-05', 'https://liputan6.com/jabar/inisiatif-masjid-hijau', 4800000.00, 1, 10, 1, 'Positif'),
        ('Kebun Vertikal Masjid Salman Hasilkan Sayuran untuk Dapur Umum', 'Sosial Media', 'Facebook Masjid Salman', '2025-05-20', 'https://facebook.com/masjidsalman/posts/67890', 3200000.00, 1, 11, 1, 'Positif');
    `);

    console.log("Publication seeded successfully!");

    await connection.query(`
      INSERT INTO viewer_access (viewer_id, masjid_id, granted_by, status, expires_at)
      VALUES
        (2, 2, NULL, 'Pending', '2025-12-31 23:59:59'),
        (2, 3, 3, 'Approved', NULL),
        (2, 4, NULL, 'Pending', '2025-12-31 23:59:59'),
        (2, 5, NULL, 'Pending', '2025-12-31 23:59:59'),
        (3, 1, 1, 'Approved', NULL),
        (4, 1, NULL, 'Pending', '2025-12-31 23:59:59'),
        (5, 1, 1, 'Approved', NULL),
        (6, 1, NULL, 'Pending', '2025-12-31 23:59:59')
    `);

    console.log("Viewer access seeded successfully!");

    await connection.query(`
      INSERT INTO stakeholder (nama_stakeholder, jenis, telepon, email, foto, masjid_id, created_by)
      VALUES
        ('Dinas Lingkungan Hidup', 'Individu', '081234567890', 'dinasLH@example.com', 'https://example.com/foto1.jpg', 1, 2),
        ('Dinas Kesehatan', 'Perusahaan', '082345678901', 'dinasKes@example.com', 'https://example.com/foto2.jpg', 1, 2),
        ('Dinas Pendidikan', 'Organisasi', '083456789012', 'dinasPend@example.com', 'https://example.com/foto3.jpg', 1, 2),
        ('Dinas Adadeh', 'Organisasi', '083456789012', 'dinasadadeh@example.com', 'https://example.com/foto3.jpg', 2, 3),
        ('Dinas Hihihihi', 'Perusahaan', '083456789012', 'dinashihihi@example.com', 'https://example.com/foto3.jpg', 2, 3),
        ('Dinas WLeoeoe', 'Individu', '083456789012', 'dinaswlelel@example.com', 'https://example.com/foto3.jpg', 2, 3)
      `);

    

    console.log("Seeding training data...");

    const trainings = [
      {
        nama_pelatihan: 'Dasar-dasar Tajwid dan Tahsin',
        deskripsi: 'Pelatihan membaca Al-Quran dengan tajwid yang benar untuk pemula. Peserta akan mempelajari hukum-hukum tajwid dasar dan praktik membaca dengan benar.',
        waktu_mulai: '2025-06-01 09:00:00',
        waktu_akhir: '2025-06-01 12:00:00',
        lokasi: 'Aula Masjid Al-Huda Lantai 2',
        kuota: 30,
        status: 'Upcoming',
        masjid_id: 1,
        created_by: 2
      },
      {
        nama_pelatihan: 'Manajemen Keuangan Masjid',
        deskripsi: 'Pelatihan pengelolaan keuangan masjid yang transparan dan akuntabel, menggunakan sistem digital dan pelaporan keuangan modern.',
        waktu_mulai: '2025-05-15 08:00:00',
        waktu_akhir: '2025-05-15 16:00:00',
        lokasi: 'Ruang Pertemuan Masjid Al-Huda',
        kuota: 20,
        status: 'Upcoming',
        masjid_id: 1,
        created_by: 2
      },
      {
        nama_pelatihan: 'Kursus Bahasa Arab untuk Pemula',
        deskripsi: 'Kursus bahasa Arab dasar untuk memahami Al-Quran dan literatur Islam. Metode pembelajaran interaktif dengan fokus pada percakapan sehari-hari.',
        waktu_mulai: '2025-04-20 13:00:00',
        waktu_akhir: '2025-04-20 15:00:00',
        lokasi: 'Kelas 1 Masjid Al-Huda',
        kuota: 25,
        status: 'Ongoing',
        masjid_id: 1,
        created_by: 2
      },
      {
        nama_pelatihan: 'Pelatihan Pengurusan Jenazah',
        deskripsi: 'Pelatihan komprehensif tentang tata cara pengurusan jenazah sesuai syariat Islam, dari memandikan hingga menguburkan.',
        waktu_mulai: '2025-03-10 08:00:00',
        waktu_akhir: '2025-03-10 17:00:00',
        lokasi: 'Aula Utama Masjid Al-Huda',
        kuota: 40,
        status: 'Completed',
        masjid_id: 1,
        created_by: 2
      },
      {
        nama_pelatihan: 'Workshop Dakwah Media Sosial',
        deskripsi: 'Workshop tentang cara berdakwah efektif melalui media sosial dengan konten yang menarik dan sesuai nilai-nilai Islam.',
        waktu_mulai: '2025-02-25 09:00:00',
        waktu_akhir: '2025-02-25 16:00:00',
        lokasi: 'Ruang Multimedia Masjid Al-Huda',
        kuota: 35,
        status: 'Cancelled',
        masjid_id: 1,
        created_by: 2
      },

      {
        nama_pelatihan: 'Kelas Tahfidz Al-Quran',
        deskripsi: 'Program tahfidz Al-Quran untuk anak-anak dan remaja dengan metode mutqin dan muraja\'ah intensif.',
        waktu_mulai: '2025-06-05 16:00:00',
        waktu_akhir: '2025-06-05 18:00:00',
        lokasi: 'Ruang Tahfidz Masjid Al-Ikhlas',
        kuota: 20,
        status: 'Upcoming',
        masjid_id: 2,
        created_by: 3
      },
      {
        nama_pelatihan: 'Pelatihan Khatib Jumat',
        deskripsi: 'Pelatihan untuk calon khatib Jumat meliputi adab khutbah, penyusunan materi, dan teknik penyampaian yang efektif.',
        waktu_mulai: '2025-05-20 13:30:00',
        waktu_akhir: '2025-05-20 16:30:00',
        lokasi: 'Aula Masjid Al-Ikhlas',
        kuota: 15,
        status: 'Upcoming',
        masjid_id: 2,
        created_by: 3
      },
      {
        nama_pelatihan: 'Workshop Keluarga Sakinah',
        deskripsi: 'Workshop membangun keluarga sakinah, mawaddah, warahmah dengan pembahasan fiqh keluarga dan tips praktis rumah tangga Islami.',
        waktu_mulai: '2025-04-12 09:00:00',
        waktu_akhir: '2025-04-12 15:00:00',
        lokasi: 'Ruang Pertemuan Masjid Al-Ikhlas',
        kuota: 50,
        status: 'Ongoing',
        masjid_id: 2,
        created_by: 3
      },

      {
        nama_pelatihan: 'Kursus Haji dan Umrah',
        deskripsi: 'Persiapan ibadah haji dan umrah meliputi manasik, doa-doa, dan tips perjalanan ke tanah suci.',
        waktu_mulai: '2025-07-01 08:00:00',
        waktu_akhir: '2025-07-01 17:00:00',
        lokasi: 'Aula Utama Masjid At-Taqwa',
        kuota: 60,
        status: 'Upcoming',
        masjid_id: 3,
        created_by: 4
      },
      {
        nama_pelatihan: 'Pelatihan Zakat dan Wakaf',
        deskripsi: 'Pemahaman mendalam tentang zakat dan wakaf, perhitungan zakat, dan pengelolaan wakaf produktif.',
        waktu_mulai: '2025-05-25 09:00:00',
        waktu_akhir: '2025-05-25 12:00:00',
        lokasi: 'Ruang Kelas Masjid At-Taqwa',
        kuota: 30,
        status: 'Upcoming',
        masjid_id: 3,
        created_by: 4
      },

      {
        nama_pelatihan: 'Sekolah Pra-Nikah',
        deskripsi: 'Program persiapan pernikahan untuk calon pengantin, meliputi fiqh nikah, psikologi keluarga, dan manajemen keuangan rumah tangga.',
        waktu_mulai: '2025-06-10 08:00:00',
        waktu_akhir: '2025-06-11 17:00:00',
        lokasi: 'Gedung Pertemuan Masjid Muhajirin',
        kuota: 40,
        status: 'Upcoming',
        masjid_id: 4,
        created_by: 5
      },
      {
        nama_pelatihan: 'Pelatihan Mubaligh Muda',
        deskripsi: 'Program pembinaan da\'i muda dengan materi retorika, public speaking, dan metodologi dakwah kontemporer.',
        waktu_mulai: '2025-04-05 13:00:00',
        waktu_akhir: '2025-04-05 17:00:00',
        lokasi: 'Aula Masjid Muhajirin',
        kuota: 25,
        status: 'Completed',
        masjid_id: 4,
        created_by: 5
      }
    ];

    for (const training of trainings) {
      await connection.query(
        `INSERT INTO pelatihan 
        (nama_pelatihan, deskripsi, waktu_mulai, waktu_akhir, lokasi, kuota, status, masjid_id, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          training.nama_pelatihan,
          training.deskripsi,
          training.waktu_mulai,
          training.waktu_akhir,
          training.lokasi,
          training.kuota,
          training.status,
          training.masjid_id,
          training.created_by
        ]
      );
    }

    console.log("Trainings seeded successfully!");

    console.log("Seeding training participants...");

    const participants = [
      { pelatihan_id: 1, pengguna_id: 3, status_pendaftaran: 'Approved', masjid_id: 1, catatan: 'Saya pemula, ingin belajar dari dasar' },
      { pelatihan_id: 1, pengguna_id: 4, status_pendaftaran: 'Pending', masjid_id: 1, catatan: 'Tertarik untuk meningkatkan bacaan Al-Quran' },
      { pelatihan_id: 1, pengguna_id: 5, status_pendaftaran: 'Approved', masjid_id: 1, catatan: null },
      
      { pelatihan_id: 2, pengguna_id: 6, status_pendaftaran: 'Approved', masjid_id: 1, catatan: 'Saya bendahara masjid, ingin belajar sistem digital' },
      { pelatihan_id: 2, pengguna_id: 3, status_pendaftaran: 'Rejected', masjid_id: 1, catatan: 'Kuota sudah penuh' },
      
      { pelatihan_id: 3, pengguna_id: 4, status_pendaftaran: 'Approved', masjid_id: 1, catatan: 'Sudah mulai mengikuti kelas' },
      { pelatihan_id: 3, pengguna_id: 5, status_pendaftaran: 'Approved', masjid_id: 1, catatan: null },
      { pelatihan_id: 3, pengguna_id: 6, status_pendaftaran: 'Approved', masjid_id: 1, catatan: 'Antusias belajar bahasa Arab' },
      
      { pelatihan_id: 4, pengguna_id: 3, status_pendaftaran: 'Attended', masjid_id: 1, catatan: 'Hadir penuh dan lulus ujian praktik' },
      { pelatihan_id: 4, pengguna_id: 4, status_pendaftaran: 'Attended', masjid_id: 1, catatan: 'Sangat bermanfaat' },
      { pelatihan_id: 4, pengguna_id: 5, status_pendaftaran: 'Approved', masjid_id: 1, catatan: 'Berhalangan hadir karena sakit' },
      
      { pelatihan_id: 6, pengguna_id: 3, status_pendaftaran: 'Pending', masjid_id: 2, catatan: 'Ingin menghafal juz 30' },
      
      { pelatihan_id: 12, pengguna_id: 3, status_pendaftaran: 'Attended', masjid_id: 4, catatan: 'Mendapat sertifikat kelulusan' },
      { pelatihan_id: 12, pengguna_id: 4, status_pendaftaran: 'Attended', masjid_id: 4, catatan: 'Materi sangat aplikatif' }
    ];

    for (const participant of participants) {
      await connection.query(
        `INSERT INTO pendaftar_pelatihan 
        (pelatihan_id, pengguna_id, status_pendaftaran, masjid_id, catatan) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          participant.pelatihan_id,
          participant.pengguna_id,
          participant.status_pendaftaran,
          participant.masjid_id,
          participant.catatan
        ]
      );
    }

    console.log("Training participants seeded successfully!");

    await connection.commit();
    console.log("DB seeded successfully!");

  } catch (error) {
    console.error("Error seeding data:", error);
    await connection.rollback();
    console.log("Rolled back changes due to error.");

  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
};

seedDatabase();
module.exports = seedDatabase;