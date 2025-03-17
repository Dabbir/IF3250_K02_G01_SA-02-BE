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
        "SELECT p.*, m.nama_masjid FROM pengguna p LEFT JOIN masjid m ON p.masjid_id = m.id WHERE p.id = ?",
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

  async update(id, userData) {
    try {
      const sets = [];
      const params = [];
      
      if (userData.nama !== undefined) {
        sets.push('nama = ?');
        params.push(userData.nama);
      }
      
      if (userData.email !== undefined) {
        sets.push('email = ?');
        params.push(userData.email);
      }
      
      if (userData.short_bio !== undefined) {
        sets.push('short_bio = ?');
        params.push(userData.short_bio);
      }
      
      if (userData.alasan_bergabung !== undefined) {
        sets.push('alasan_bergabung = ?');
        params.push(userData.alasan_bergabung);
      }
      
      if (userData.foto_profil !== undefined) {
        sets.push('foto_profil = ?');
        params.push(userData.foto_profil);
      }
      
      if (userData.masjid_id !== undefined) {
        sets.push('masjid_id = ?');
        params.push(userData.masjid_id);
      }
      
      if (userData.nama_masjid !== undefined) {
        sets.push('nama_masjid = ?');
        params.push(userData.nama_masjid);
      }
      
      if (userData.auth_provider !== undefined) {
        sets.push('auth_provider = ?');
        params.push(userData.auth_provider);
      }
      
      if (userData.auth_provider_id !== undefined) {
        sets.push('auth_provider_id = ?');
        params.push(userData.auth_provider_id);
      }
      
      if (sets.length === 0) {
        return true;
      }
      
      params.push(id);
      
      const query = `UPDATE pengguna SET ${sets.join(', ')} WHERE id = ?`;
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
