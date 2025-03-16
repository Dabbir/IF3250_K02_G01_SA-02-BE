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
      } = userData;

      const [result] = await pool.query(
        `INSERT INTO pengguna 
        (nama, email, password, masjid_id, nama_masjid, short_bio, alasan_bergabung, foto_profil) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nama,
          email,
          password,
          masjid_id,
          nama_masjid,
          short_bio,
          alasan_bergabung,
          foto_profil,
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  async update(id, userData) {
    try {
      const { nama, email, short_bio, alasan_bergabung, foto_profil } =
        userData;

      let query = `UPDATE pengguna SET
        nama = ?,
        email = ?,
        short_bio = ?,
        alasan_bergabung = ?`;

      let params = [nama, email, short_bio, alasan_bergabung];

      // Only update foto_profil if provided
      if (foto_profil) {
        query += `, foto_profil = ?`;
        params.push(foto_profil);
      }

      query += ` WHERE id = ?`;
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
