module.exports = {
  up: async (connection) => {
    const aktivitas = [
      {
        nama_aktivitas: "Persiapan Logistik Buka Puasa",
        deskripsi: "Mempersiapkan bahan makanan, alat makan, dan perlengkapan lainnya untuk buka puasa.",
        dokumentasi: "persiapan-logistik.jpg",
        tanggal_mulai: "2025-03-18",
        tanggal_selesai: "2025-03-19",
        biaya_implementasi: 1500000.00,
        status: "Finished",
        program_id: 15,
        created_by: 1,
        masjid_id: 1,
      },
      {
        nama_aktivitas: "Koordinasi dengan Relawan",
        deskripsi: "Mengadakan pertemuan dengan para relawan untuk membagi tugas selama acara.",
        dokumentasi: "koordinasi-relawan.jpg",
        tanggal_mulai: "2025-03-19",
        tanggal_selesai: "2025-03-19",
        biaya_implementasi: 500000.00,
        status: "Finished",
        program_id: 15,
        created_by: 1,
        masjid_id: 1,
      },
    ];

    for (const aktivitasItem of aktivitas) {
      await connection.query(
        `INSERT INTO aktivitas 
        (nama_aktivitas, deskripsi, dokumentasi, tanggal_mulai, tanggal_selesai, 
        biaya_implementasi, status, program_id, created_by, masjid_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          aktivitasItem.nama_aktivitas, aktivitasItem.deskripsi, aktivitasItem.dokumentasi, 
          aktivitasItem.tanggal_mulai, aktivitasItem.tanggal_selesai, aktivitasItem.biaya_implementasi, 
          aktivitasItem.status, aktivitasItem.program_id, aktivitasItem.created_by, aktivitasItem.masjid_id
        ]
      );
    }
  },
};