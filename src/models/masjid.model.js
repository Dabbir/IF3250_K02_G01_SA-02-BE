const { pool } = require("../config/db.config");

class MasjidModel {
  async findAll() {
    try {
      const [rows] = await pool.query("SELECT * FROM masjid");
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.query(
        "SELECT * FROM masjid WHERE id = ?",
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
        "SELECT * FROM masjid WHERE nama_masjid LIKE ?",
        [`%${nama}%`]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async create(masjidData) {
    try {
      const {
        nama_masjid,
        alamat,
        kota,
        provinsi,
        kode_pos,
        latitude,
        longitude,
        foto
      } = masjidData;

      const [result] = await pool.query(
        `INSERT INTO masjid 
        (nama_masjid, alamat, kota, provinsi, kode_pos, latitude, longitude, foto) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nama_masjid,
          alamat,
          kota,
          provinsi,
          kode_pos,
          latitude,
          longitude,
          foto
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  async update(id, masjidData) {
    try {
      const {
        nama_masjid,
        alamat,
        kota,
        provinsi,
        kode_pos,
        latitude,
        longitude,
        foto
      } = masjidData;

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
      if (kota) {
        updates.push(`kota = ?`);
        params.push(kota);
      }
      if (provinsi) {
        updates.push(`provinsi = ?`);
        params.push(provinsi);
      }
      if (kode_pos) {
        updates.push(`kode_pos = ?`);
        params.push(kode_pos);
      }
      if (latitude) {
        updates.push(`latitude = ?`);
        params.push(latitude);
      }
      if (longitude) {
        updates.push(`longitude = ?`);
        params.push(longitude);
      }
      if (foto) {
        updates.push(`foto = ?`);
        params.push(foto);
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
}

module.exports = new MasjidModel();