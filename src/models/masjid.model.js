const { pool } = require("../config/db.config");

class MasjidModel {
  async findAll() {
    try {
      const [rows] = await pool.query("SELECT id, nama_masjid, alamat FROM masjid");
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.query(
        "SELECT id, nama_masjid, alamat FROM masjid WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error in getMasjidById:", error);
      throw error;
    }
  }

  async findByNama(nama) {
    try {
      const [rows] = await pool.query(
        "SELECT id, nama_masjid, alamat FROM masjid WHERE nama_masjid LIKE ?",
        [`%${nama}%`]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async create(masjidData) {
    try {
      const { nama_masjid, alamat } = masjidData;

      const [result] = await pool.query(
        `INSERT INTO masjid (nama_masjid, alamat) VALUES (?, ?)`,
        [nama_masjid, alamat]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  async update(id, masjidData) {
    try {
      const { nama_masjid, alamat } = masjidData;

      let updates = [];
      let params = [];

      if (nama_masjid) {
        updates.push(`nama_masjid = ?`);
        params.push(nama_masjid);
      }
      if (alamat) {
        updates.push(`alamat = ?`);
        params.push(alamat);
      }

      if (updates.length === 0) {
        throw new Error("No fields provided to update.");
      }

      let query = `UPDATE masjid SET ${updates.join(", ")} WHERE id = ?`;
      params.push(id);

      const [result] = await pool.query(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const [result] = await pool.query("DELETE FROM masjid WHERE id = ?", [
        id,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  async getEditorsByMasjidId(masjidId) {
    try {
      const [rows] = await pool.query(`
        SELECT u.id, u.nama, u.email, u.peran, u.status, u.short_bio, 
               u.alasan_bergabung, u.foto_profil, u.created_at
        FROM pengguna u
        WHERE u.masjid_id = ? AND u.peran = 'Editor'
        ORDER BY u.created_at DESC
      `, [masjidId]);
      
      return rows;
    } catch (error) {
      console.error("Error in getEditorsByMasjidId:", error);
      throw error;
    }
  }
}

module.exports = new MasjidModel();