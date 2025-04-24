require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require('bcryptjs');

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db",
};

async function initializeDatabase() {
  let connection;

  try {
    // Connect to MySQL server without specifying a database
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    console.log("Connected to MySQL server");

    // Create database if it doesn't exist
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`Database ${dbConfig.database} created or already exists`);

    // Use the database
    await connection.query(`USE ${dbConfig.database}`);
    console.log(`Using database ${dbConfig.database}`);

    // Create Masjid table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS masjid (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_masjid VARCHAR(255) NOT NULL,
        alamat TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Masjid table created or already exists");

    // Create Pengguna table
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
        auth_provider VARCHAR(255),
        auth_provider_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE SET NULL
      )
    `);
    console.log("Pengguna table created or already exists");

    // Create Program table
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
        masjid_id INT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE SET NULL
      )
    `);
    console.log("Program table created or already exists");

    // Create Aktivitas table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS aktivitas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_aktivitas VARCHAR(100) NOT NULL,
        deskripsi TEXT,
        dokumentasi TEXT,
        tanggal_mulai DATE,
        tanggal_selesai DATE,
        biaya_implementasi DECIMAL(15,2),
        status ENUM('Belum Mulai', 'Berjalan', 'Selesai') DEFAULT 'Berjalan',
        program_id INT,
        created_by INT,
        masjid_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (program_id) REFERENCES program(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE SET NULL,
        FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE CASCADE
      )
    `);
    console.log("Aktivitas table created or already exists");

    // Create Publikasi table
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
      )
    `);
    console.log("Publikasi table created or already exists");

    // Create Stakeholder table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stakeholder (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_stakeholder VARCHAR(100) NOT NULL,
        nama_kontak VARCHAR(100),
        telepon VARCHAR(20),
        email VARCHAR(100),
        foto VARCHAR(255),
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE SET NULL
      )
    `);
    console.log("Stakeholder table created or already exists");

    // Create Aktivitas_Stakeholder junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS aktivitas_stakeholder (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aktivitas_id INT NOT NULL,
        stakeholder_id INT NOT NULL,
        peran VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE CASCADE,
        FOREIGN KEY (stakeholder_id) REFERENCES stakeholder(id) ON DELETE CASCADE
      )
    `);
    console.log("Aktivitas_Stakeholder junction table created or already exists");

    // Create Beneficiaries table
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
      )
    `);
    console.log("Beneficiaries table created or already exists");

    // Create Aktivitas_Beneficiaries junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS aktivitas_beneficiaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aktivitas_id INT NOT NULL,
        beneficiary_id INT NOT NULL,
        jumlah_penerima INT,
        deskripsi_manfaat TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE CASCADE,
        FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE
      )
    `);
    console.log("Aktivitas_Beneficiaries junction table created or already exists");

    // Create Employee table
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
      )
    `);
    console.log("Employee table created or already exists");

    // Create Aktivitas_Employee junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS aktivitas_employee (
        id INT AUTO_INCREMENT PRIMARY KEY,
        aktivitas_id INT NOT NULL,
        employee_id INT NOT NULL,
        peran VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employee(id) ON DELETE CASCADE
      )
    `);
    console.log("Aktivitas_Employee junction table created or already exists");

    // Create Gallery table
    // await connection.query(`
    //   CREATE TABLE IF NOT EXISTS gallery (
    //     id INT AUTO_INCREMENT PRIMARY KEY,
    //     judul VARCHAR(100),
    //     deskripsi TEXT,
    //     file_path VARCHAR(255) NOT NULL,
    //     file_type ENUM('Image', 'Video', 'Document') DEFAULT 'Image',
    //     program_id INT,
    //     aktivitas_id INT,
    //     created_by INT,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    //     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    //     FOREIGN KEY (program_id) REFERENCES program(id) ON DELETE SET NULL,
    //     FOREIGN KEY (aktivitas_id) REFERENCES aktivitas(id) ON DELETE SET NULL,
    //     FOREIGN KEY (created_by) REFERENCES pengguna(id) ON DELETE SET NULL
    //   )
    // `);
    // console.log("Gallery table created or already exists");

    // Create Pelatihan table
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
      )
    `);
    console.log("Pelatihan table created or already exists");

    // Create Pendaftar_Pelatihan table
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
        FOREIGN KEY (masjid_id) REFERENCES masjid(id) ON DELETE SET NULL
      )
    `);
    console.log("Pendaftar_Pelatihan table created or already exists");

    // Create ViewerAccess table
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
        FOREIGN KEY (granted_by) REFERENCES pengguna(id) ON DELETE CASCADE
      )
    `);
    console.log("ViewerAccess table created or already exists");

    // SAMPLE DATA
    // Check if we need to create a sample admin user and masjid
    const [masjids] = await connection.query(
      "SELECT COUNT(*) as count FROM masjid"
    );

    if (masjids[0].count === 0) {
      // Insert sample masjid
      const [masjidResult] = await connection.query(`
        INSERT INTO masjid (nama_masjid, alamat) 
        VALUES ('Masjid Salman ITB', 'Jl. Ganesha No.10, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132')
      `);

      const masjidId = masjidResult.insertId;
      console.log(`Sample masjid created with ID: ${masjidId}`);

      // Insert admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
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
      console.log("Sample admin user created");
    }

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

initializeDatabase();
module.exports = initializeDatabase;