module.exports = {
  up: async (connection) => {
    // Delete all existing tables
    await connection.query('DROP TABLE IF EXISTS viewer_access');
    await connection.query('DROP TABLE IF EXISTS pendaftar_pelatihan');
    await connection.query('DROP TABLE IF EXISTS pelatihan');
    await connection.query('DROP TABLE IF EXISTS gallery');
    await connection.query('DROP TABLE IF EXISTS aktivitas_employee');
    await connection.query('DROP TABLE IF EXISTS employee');
    await connection.query('DROP TABLE IF EXISTS aktivitas_beneficiaries');
    await connection.query('DROP TABLE IF EXISTS beneficiaries');
    await connection.query('DROP TABLE IF EXISTS aktivitas_stakeholder');
    await connection.query('DROP TABLE IF EXISTS stakeholder');
    await connection.query('DROP TABLE IF EXISTS publikasi');
    await connection.query('DROP TABLE IF EXISTS aktivitas');
    await connection.query('DROP TABLE IF EXISTS program');
    await connection.query('DROP TABLE IF EXISTS pengguna');
    await connection.query('DROP TABLE IF EXISTS masjid');

    // Create Masjid Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS masjid (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_masjid VARCHAR(255) NOT NULL,
        alamat TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Pengguna (User) Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pengguna (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        peran ENUM('Viewer', 'Editor', 'Admin') DEFAULT 'Editor',
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        short_bio TEXT,
        alasan_bergabung TEXT,
        foto_profil VARCHAR(255),
        masjid_id INT,
        auth_provider_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Program Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS program (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_program VARCHAR(255) NOT NULL,
        deskripsi_program TEXT,
        pilar_program VARCHAR(255),
        kriteria_program TEXT,
        waktu_mulai DATE,
        waktu_selesai DATE,
        rancangan_anggaran DECIMAL(15,2),
        aktualisasi_anggaran DECIMAL(15,2),
        status_program ENUM('Berjalan', 'Selesai') DEFAULT 'Berjalan',
        masjid_id INT NOT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Aktivitas Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS aktivitas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_aktivitas VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        dokumentasi TEXT,
        tanggal_mulai DATE,
        tanggal_selesai DATE,
        biaya_implementasi DECIMAL(15,2),
        status ENUM('Unstarted', 'Ongoing', 'Finished') DEFAULT 'Unstarted',
        program_id INT NOT NULL,
        created_by INT NOT NULL,
        masjid_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (program_id) REFERENCES program(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE CASCADE,
        FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Publikasi Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS publikasi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        judul_publikasi VARCHAR(255) NOT NULL,
        media_publikasi ENUM('Televisi', 'Koran', 'Radio', 'Media Online', 'Sosial Media', 'Lainnya'),
        nama_perusahaan_media VARCHAR(255),
        url_publikasi VARCHAR(255),
        pr_value DECIMAL(15,2),
        program_id INT NOT NULL,
        aktivitas_id INT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (program_id) REFERENCES program(id) ON DELETE CASCADE,
        FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Stakeholder Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stakeholder (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_stakeholder VARCHAR(255) NOT NULL,
        nama_kontak VARCHAR(255),
        telepon VARCHAR(20),
        email VARCHAR(255),
        foto VARCHAR(255),
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Aktivitas_Stakeholder Junction Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS aktivitas_stakeholder (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aktivitas_id INT NOT NULL,
        stakeholder_id INT NOT NULL,
        peran VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE CASCADE,
        FOREIGN KEY (stakeholder_id) REFERENCES stakeholder(id) ON DELETE CASCADE,
        UNIQUE KEY unique_aktivitas_stakeholder (aktivitas_id, stakeholder_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Beneficiaries Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS beneficiaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_instansi VARCHAR(255) NOT NULL,
        nama_kontak VARCHAR(255),
        alamat TEXT,
        telepon VARCHAR(20),
        email VARCHAR(255),
        foto VARCHAR(255),
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Aktivitas_Beneficiaries Junction Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS aktivitas_beneficiaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aktivitas_id INT NOT NULL,
        beneficiary_id INT NOT NULL,
        jumlah_penerima INT,
        deskripsi_manfaat TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE CASCADE,
        FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE,
        UNIQUE KEY unique_aktivitas_beneficiary (aktivitas_id, beneficiary_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Employee Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS employee (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        telepon VARCHAR(20),
        alamat TEXT,
        email VARCHAR(255),
        foto VARCHAR(255),
        masjid_id INT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Aktivitas_Employee Junction Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS aktivitas_employee (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aktivitas_id INT NOT NULL,
        employee_id INT NOT NULL,
        peran VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
        UNIQUE KEY unique_aktivitas_employee (aktivitas_id, employee_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Gallery Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        file_path VARCHAR(255) NOT NULL,
        file_type ENUM('Image', 'Video', 'Document') NOT NULL,
        program_id INT,
        aktivitas_id INT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (program_id) REFERENCES program(id) ON DELETE CASCADE,
        FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Pelatihan Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pelatihan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_pelatihan VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        waktu_mulai DATETIME NOT NULL,
        waktu_akhir DATETIME NOT NULL,
        lokasi VARCHAR(255),
        kuota INT,
        status ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
        masjid_id INT NOT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create Pendaftar_Pelatihan Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pendaftar_pelatihan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pelatihan_id INT NOT NULL,
        pengguna_id INT NOT NULL,
        status_pendaftaran ENUM('Pending', 'Approved', 'Rejected', 'Attended') DEFAULT 'Pending',
        masjid_id INT,
        catatan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (pelatihan_id) REFERENCES pelatihan(id) ON DELETE CASCADE,
        FOREIGN KEY (pengguna_id) REFERENCES pengguna(id) ON DELETE CASCADE,
        FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE SET NULL,
        UNIQUE KEY unique_pendaftar_pelatihan (pelatihan_id, pengguna_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create ViewerAccess Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS viewer_access (
        id INT AUTO_INCREMENT PRIMARY KEY,
        viewer_id INT NOT NULL,
        masjid_id INT NOT NULL,
        granted_by INT NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        FOREIGN KEY (viewer_id) REFERENCES pengguna(id) ON DELETE CASCADE,
        FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE CASCADE,
        FOREIGN KEY (granted_by) REFERENCES pengguna(id) ON DELETE CASCADE,
        UNIQUE KEY unique_viewer_masjid (viewer_id, masjid_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  },
  
  down: async (connection) => {
    // Drop tables in reverse order to handle foreign key constraints
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
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS=1');
  }
};