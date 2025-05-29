require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || 'mysql-19069af5-ahmadmudabbir03-3bf2.g.aivencloud.com', // mysql-xxx.aivencloud.com
  user: process.env.DB_USER || 'avnadmin', // avnadmin
  password: process.env.DB_PASSWORD || 'AVNS_nMOA-WxvDdw2ZYwsl3A', // aiven password
  database: process.env.DB_NAME || "defaultdb", // defaultdb
  port: process.env.DB_PORT || 28717,
  ssl: {
    rejectUnauthorized: false // Required for Aiven SSL
  },
  timeout: 60000,
  acquireTimeout: 60000,
  reconnect: true
};

async function initializeAivenDatabase() {
  let connection;

  try {
    console.log("Connecting to Aiven MySQL...");
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to Aiven MySQL server");

    // Check if tables already exist
    const [existingTables] = await connection.query("SHOW TABLES");
    if (existingTables.length > 0) {
      console.log("⚠️  Tables already exist. This will recreate them.");
      console.log("Existing tables:", existingTables.map(t => Object.values(t)[0]));
      
      // Uncomment if you want to drop existing tables
      // await dropExistingTables(connection);
    }

    // Create tables with proper order (respecting foreign key constraints)
    await createMasjidTable(connection);
    await createPenggunaTable(connection);
    await createProgramTable(connection);
    await createAktivitasTable(connection);
    await createPublikasiTable(connection);
    await createStakeholderTable(connection);
    await createAktivitasStakeholderTable(connection);
    await createBeneficiariesTable(connection);
    await createAktivitasBeneficiariesTable(connection);
    await createEmployeeTable(connection);
    await createAktivitasEmployeeTable(connection);
    await createPelatihanTable(connection);
    await createPendaftarPelatihanTable(connection);
    await createViewerAccessTable(connection);

    // Insert sample data
    await insertSampleData(connection);

    console.log("✅ Aiven database initialization completed successfully");
  } catch (error) {
    console.error("❌ Error initializing Aiven database:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

async function dropExistingTables(connection) {
  const tables = [
    'viewer_access', 'pendaftar_pelatihan', 'pelatihan',
    'aktivitas_employee', 'employee', 'aktivitas_beneficiaries',
    'beneficiaries', 'aktivitas_stakeholder', 'stakeholder',
    'publikasi', 'aktivitas', 'program', 'pengguna', 'masjid'
  ];

  for (const table of tables) {
    try {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
      console.log(`🗑️  Dropped table: ${table}`);
    } catch (error) {
      console.log(`⚠️  Could not drop table ${table}:`, error.message);
    }
  }
}

async function createMasjidTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS masjid (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_masjid VARCHAR(255) NOT NULL,
      alamat TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Masjid table created");
}

async function createPenggunaTable(connection) {
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
      dokumen_pendaftaran VARCHAR(255) NULL,
      dokumen_file_id VARCHAR(255) NULL,
      dokumen_file_name VARCHAR(255) NULL,
      dokumen_file_type VARCHAR(255) NULL,
      masjid_id INT,
      auth_provider VARCHAR(255),
      auth_provider_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Pengguna table created");
}

async function createProgramTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS program (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_program VARCHAR(100) NOT NULL,
      deskripsi_program TEXT,
      pilar_program TEXT,
      kriteria_program TEXT,
      waktu_mulai DATE,
      waktu_selesai DATE,
      rancangan_anggaran DECIMAL(15,2),
      aktualisasi_anggaran DECIMAL(15,2),
      status_program ENUM('Belum Mulai', 'Berjalan', 'Selesai') DEFAULT 'Berjalan',
      cover_image VARCHAR(255),
      masjid_id INT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Program table created");
}

async function createAktivitasTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS aktivitas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_aktivitas VARCHAR(100) NOT NULL,
      deskripsi TEXT,
      dokumentasi TEXT,
      tanggal_mulai DATE,
      tanggal_selesai DATE,
      biaya_implementasi DECIMAL(15,2),
      status ENUM('Belum Mulai', 'Berjalan', 'Selesai') DEFAULT 'Belum Mulai',
      program_id INT,
      created_by INT,
      masjid_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (program_id) REFERENCES program(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE SET NULL,
      FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Aktivitas table created");
}

async function createPublikasiTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS publikasi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      judul_publikasi VARCHAR(255) NOT NULL,
      media_publikasi ENUM('Televisi', 'Koran', 'Radio', 'Media Online', 'Sosial Media', 'Lainnya'),
      nama_perusahaan_media VARCHAR(100),
      tanggal_publikasi DATE,
      url_publikasi VARCHAR(255),
      pr_value DECIMAL(15,2),
      program_id INT,
      aktivitas_id INT,
      created_by INT,
      tone ENUM('Positif', 'Negatif', 'Netral'),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (program_id) REFERENCES program(id) ON DELETE CASCADE,
      FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Publikasi table created");
}

async function createStakeholderTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS stakeholder (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_stakeholder VARCHAR(100) NOT NULL,
      jenis ENUM('Individu', 'Organisasi', 'Perusahaan') DEFAULT 'Individu',
      telepon VARCHAR(20),
      email VARCHAR(100),
      masjid_id INT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Stakeholder table created");
}

async function createAktivitasStakeholderTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS aktivitas_stakeholder (
      id INT AUTO_INCREMENT PRIMARY KEY,
      aktivitas_id INT NOT NULL,
      stakeholder_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE CASCADE,
      FOREIGN KEY (stakeholder_id) REFERENCES stakeholder(id) ON DELETE CASCADE,
      UNIQUE KEY unique_aktivitas_stakeholder (aktivitas_id, stakeholder_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Aktivitas_Stakeholder table created");
}

async function createBeneficiariesTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS beneficiaries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_instansi VARCHAR(100) NOT NULL,
      nama_kontak VARCHAR(100),
      alamat TEXT,
      telepon VARCHAR(20),
      email VARCHAR(100),
      foto VARCHAR(255),
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Beneficiaries table created");
}

async function createAktivitasBeneficiariesTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS aktivitas_beneficiaries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      aktivitas_id INT NOT NULL,
      beneficiary_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE CASCADE,
      FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE,
      UNIQUE KEY unique_aktivitas_beneficiary (aktivitas_id, beneficiary_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Aktivitas_Beneficiaries table created");
}

async function createEmployeeTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS employee (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      telepon VARCHAR(20),
      alamat TEXT,
      email VARCHAR(100),
      foto VARCHAR(255),
      masjid_id INT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Employee table created");
}

async function createAktivitasEmployeeTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS aktivitas_employee (
      id INT AUTO_INCREMENT PRIMARY KEY,
      aktivitas_id INT NOT NULL,
      employee_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE,
      UNIQUE KEY unique_aktivitas_employee (aktivitas_id, employee_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Aktivitas_Employee table created");
}

async function createPelatihanTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS pelatihan (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_pelatihan VARCHAR(100) NOT NULL,
      deskripsi TEXT,
      waktu_mulai DATETIME,
      waktu_akhir DATETIME,
      lokasi VARCHAR(255),
      kuota INT,
      status ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
      masjid_id INT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Pelatihan table created");
}

async function createPendaftarPelatihanTable(connection) {
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
      UNIQUE KEY unique_pelatihan_pengguna (pelatihan_id, pengguna_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("✅ Pendaftar_Pelatihan table created");
}

async function createViewerAccessTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS viewer_access (
      id INT AUTO_INCREMENT PRIMARY KEY,
      viewer_id INT NOT NULL,
      masjid_id INT NOT NULL,
      granted_by INT,
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
  console.log("✅ ViewerAccess table created");
}

async function insertSampleData(connection) {
  try {
    // Check if sample data already exists
    const [masjids] = await connection.query("SELECT COUNT(*) as count FROM masjid");
    
    if (masjids[0].count === 0) {
      // Insert sample masjid
      const [masjidResult] = await connection.query(`
        INSERT INTO masjid (nama_masjid, alamat) 
        VALUES ('Masjid Salman ITB', 'Jl. Ganesha No.10, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132')
      `);

      const masjidId = masjidResult.insertId;
      console.log(`✅ Sample masjid created with ID: ${masjidId}`);

      // Insert sample admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const [userResult] = await connection.query(`
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
          'Admin Salman', 
          'admin@salman.org', 
          ?, 
          'Admin', 
          'Approved',
          ?,
          'Administrator Sistem Sustainability Report Salman',
          'Mengelola platform pelaporan sustainability Masjid Salman ITB'
        )
      `, [hashedPassword, masjidId]);
      
      console.log(`✅ Sample admin user created with ID: ${userResult.insertId}`);
      console.log(`🔑 Admin credentials: admin@salman.org / admin123`);
    } else {
      console.log("ℹ️  Sample data already exists, skipping insertion");
    }
  } catch (error) {
    console.error("❌ Error inserting sample data:", error);
  }
}

// Execute if run directly
if (require.main === module) {
  initializeAivenDatabase()
    .then(() => {
      console.log("🎉 Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Script failed:", error);
      process.exit(1);
    });
}

module.exports = { initializeAivenDatabase };