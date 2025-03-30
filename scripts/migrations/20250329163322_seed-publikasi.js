module.exports = {
  up: async (connection) => {
    //
    await connection.query(`
      INSERT INTO publikasi 
        (judul_publikasi, media_publikasi, nama_perusahaan_media, tanggal_publikasi, url_publikasi, pr_value, program_id, aktivitas_id, created_by, nama_program, nama_aktivitas, tone) 
      VALUES
        ('Masjid Salman ITB Resmikan Program Pengolahan Sampah Organik', 'Media Online', 'Kompas.com', '2025-01-15', 'https://kompas.com/berita/masjid-salman-program-sampah', 5000000.00, 1, 1, 1, 'Salman Sustainability Initiative', 'Peresmian Program Daur Ulang', 'Positif'),
        ('Pelatihan Pengelolaan Air Hujan untuk DKM se-Bandung Raya', 'Koran', 'Pikiran Rakyat', '2025-02-01', 'https://pikiran-rakyat.com/bandung/masjid-salman-pelatihan', 3500000.00, 1, 3, 1, 'Eco-Mosque Training', 'Pelatihan Pengelolaan Air', 'Positif'),
        ('Masjid Salman ITB Jadi Percontohan Masjid Ramah Lingkungan', 'Televisi', 'TVOne', '2025-02-20', 'https://tvone.co.id/program/masjid-ramah-lingkungan', 7500000.00, 1, 2, 1, 'Salman Sustainability Initiative', 'Kunjungan Media', 'Positif'),
        ('Program Panel Surya Masjid Salman Hemat 30% Energi', 'Radio', 'Radio Republik Indonesia', '2025-03-05', 'https://rri.co.id/bandung/program-panel-surya', 2800000.00, 1, 4, 1, 'Green Energy Mosque', 'Implementasi Panel Surya', 'Positif'),
        ('Kritik untuk Program Eco-Waste Masjid Salman yang Belum Maksimal', 'Media Online', 'Detik.com', '2025-03-15', 'https://detik.com/jabar/kritik-program-eco-waste', 1500000.00, 1, 5, 1, 'Eco-Waste Management', 'Evaluasi Program', 'Negatif'),
        ('Kolaborasi Masjid Salman dan Pemkot Bandung dalam Penghijauan Kota', 'Sosial Media', 'Instagram @PemkotBandung', '2025-03-28', 'https://instagram.com/pemkotbandung/post/12345', 4200000.00, 1, 7, 1, 'Bandung Green Mosque Movement', 'Penandatanganan MoU', 'Positif'),
        ('Masjid Salman Gelar Workshop Pemanfaatan Air Wudhu', 'Media Online', 'Tribunnews.com', '2025-04-10', 'https://tribunnews.com/jabar/masjid-salman-workshop', 2900000.00, 1, 8, 1, 'Eco-Mosque Training', 'Workshop Pemanfaatan Air Wudhu', 'Netral'),
        ('Program Pemilahan Sampah Masjid Salman Diapresiasi Kementerian LHK', 'Koran', 'Republika', '2025-04-22', 'https://republika.co.id/berita/program-pemilahan-sampah', 5500000.00, 1, 9, 1, 'Eco-Waste Management', 'Kunjungan Kementerian LHK', 'Positif'),
        ('Inisiatif Masjid Hijau Salman ITB Diminati Masjid Lain', 'Media Online', 'Liputan6.com', '2025-05-05', 'https://liputan6.com/jabar/inisiatif-masjid-hijau', 4800000.00, 1, 10, 1, 'Salman Sustainability Initiative', 'Sharing Knowledge', 'Positif'),
        ('Kebun Vertikal Masjid Salman Hasilkan Sayuran untuk Dapur Umum', 'Sosial Media', 'Facebook Masjid Salman', '2025-05-20', 'https://facebook.com/masjidsalman/posts/67890', 3200000.00, 1, 11, 1, 'Urban Farming Mosque', 'Panen Perdana', 'Positif');
    `);
  },

  down: async (connection) => {
    // Remove all records from publikasi table
    await connection.query(`
      DELETE FROM publikasi
    `);

    // Optionally, you can truncate the table if needed
    await connection.query(`
      TRUNCATE TABLE publikasi
    `);
  },
};
