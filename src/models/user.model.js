const { pool } = require("../config/db.config");
const bcrypt = require("bcryptjs");

class UserModel {
  async findAll() {
    try {
      const [rows] = await pool.query("SELECT * FROM pengguna");
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.query(
        "SELECT p.*, m.nama_masjid, m.alamat FROM pengguna p LEFT JOIN masjid m ON p.masjid_id = m.id WHERE p.id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error in getUserById:", error);
      throw error;
    }
  }

  async findMasjidUser(id) {
    try {
      const [rows] = await pool.query(
        "SELECT masjid_id FROM pengguna WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error in getUserById:", error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM pengguna WHERE email = ?",
        [email]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async findByAuthProvider(provider, providerId) {
    try {
      const [rows] = await pool.query(
        "SELECT p.*, m.nama_masjid FROM pengguna p LEFT JOIN masjid m ON p.masjid_id = m.id WHERE p.auth_provider = ? AND p.auth_provider_id = ?",
        [provider, providerId]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error in findByAuthProvider:", error);
      throw error;
    }
  }

  async create(userData) {
    try {
      const {
        nama,
        email,
        password,
        masjid_id,
        nama_masjid,
        short_bio,
        alasan_bergabung,
        foto_profil,
        auth_provider,
        auth_provider_id,
      } = userData;

      const [result] = await pool.query(
        `INSERT INTO pengguna 
        (nama, email, password, masjid_id, nama_masjid, short_bio, alasan_bergabung, foto_profil, auth_provider, auth_provider_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nama,
          email,
          password,
          masjid_id,
          nama_masjid,
          short_bio,
          alasan_bergabung,
          foto_profil,
          auth_provider,
          auth_provider_id,
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  async createAgain(userData) {
    try {
      const {
        nama,
        email,
        password,
        masjid_id,
        nama_masjid,
        short_bio,
        alasan_bergabung,
        foto_profil,
        auth_provider,
        auth_provider_id,
      } = userData;
  
      // First update the user data
      const [updateResult] = await pool.query(
        `UPDATE pengguna 
        SET nama = ?, 
            password = COALESCE(?, password), 
            short_bio = ?, 
            alasan_bergabung = ?, 
            foto_profil = ?, 
            masjid_id = ?, 
            nama_masjid = ?, 
            auth_provider = ?, 
            auth_provider_id = ?
        WHERE email = ?`,
        [
          nama,
          password,
          short_bio,
          alasan_bergabung,
          foto_profil,
          masjid_id,
          nama_masjid,
          auth_provider,
          auth_provider_id,
          email,
        ]
      );
  
      if (updateResult.affectedRows === 0) {
        throw new Error("User with this email not found");
      }
  
      // Then get the user ID
      const [rows] = await pool.query(
        `SELECT id FROM pengguna WHERE email = ?`,
        [email]
      );
  
      // Return just the ID value from the first row
      if (rows.length > 0) {
        return rows[0].id;
      } else {
        throw new Error("Failed to retrieve user ID after update");
      }
    } catch (error) {
      throw error;
    }
  }

  async update(id, userData) {
    try {
        console.log(userData);
        const { nama, email, short_bio, alasan_bergabung, foto_profil, nama_masjid, masjid_id, auth_provider, auth_provider_id, deleteProfileImage } = userData;

        let updates = [];
        let params = [];

        if (nama) {
            updates.push(`nama = ?`);
            params.push(nama);
        }
        if (email) {
            updates.push(`email = ?`);
            params.push(email);
        }
        if (short_bio) {
            updates.push(`short_bio = ?`);
            params.push(short_bio);
        }
        if (alasan_bergabung) {
            updates.push(`alasan_bergabung = ?`);
            params.push(alasan_bergabung);
        }
        if (nama_masjid) {
            updates.push(`nama_masjid = ?`);
            params.push(nama_masjid);
        }
        if (masjid_id) {
            updates.push(`masjid_id = ?`);
            params.push(masjid_id);
        }
        if (auth_provider) {
            updates.push(`auth_provider = ?`);
            params.push(auth_provider);
        }
        if (auth_provider_id) {
            updates.push(`auth_provider_id = ?`);
            params.push(auth_provider_id);
        }
        if (foto_profil) {
            updates.push(`foto_profil = ?`);
            params.push(foto_profil);
        } else if (deleteProfileImage == 'true') {
            updates.push(`foto_profil = ?`);
            params.push(null);
        }

        // updates.push(`status = 'Approved'`) //sementara langsung di approve

        if (updates.length === 0) {
            throw new Error("No fields provided to update.");
        }

        let query = `UPDATE pengguna SET ${updates.join(", ")} WHERE id = ?`;
        params.push(id);

        await pool.query(query, params);
        return true;
    } catch (error) {
        throw error;
    }
}

  async delete(id) {
    try {
      const [result] = await pool.query("DELETE FROM pengguna WHERE id = ?", [
        id,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await pool.query("UPDATE pengguna SET password = ? WHERE id = ?", [
        hashedPassword,
        id,
      ]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = new UserModel();
