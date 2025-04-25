const { pool } = require("../config/db.config");

class BeneficiaryModel {
  async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM beneficiaries WHERE id = ?',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error in findById:", error);
      throw error;
    }
  }

  async findAll(params = {}) {
    try {
      let query = 'SELECT * FROM beneficiaries';
      
      const conditions = [];
      const values = [];
      
      if (params.nama_instansi) {
        conditions.push('nama_instansi LIKE ?');
        values.push(`%${params.nama_instansi}%`);
      }
      
      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      if (params.orderBy) {
        query += ` ORDER BY ${params.orderBy} ${params.orderDirection || 'ASC'}`;
      } else {
        query += ` ORDER BY created_at DESC`;
      }
      
      if (params.limit && params.page) {
        const offset = (params.page - 1) * params.limit;
        query += ' LIMIT ? OFFSET ?';
        values.push(parseInt(params.limit), offset);
      }
      
      const [rows] = await pool.query(query, values);
      return rows;
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }

  async getTotalCount(params = {}) {
    try {
      let query = 'SELECT COUNT(*) as total FROM beneficiaries';
      
      const conditions = [];
      const values = [];
      
      if (params.nama_instansi) {
        conditions.push('nama_instansi LIKE ?');
        values.push(`%${params.nama_instansi}%`);
      }
      
      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      const [rows] = await pool.query(query, values);
      return rows[0].total;
    } catch (error) {
      console.error("Error in getTotalCount:", error);
      throw error;
    }
  }

  async create(beneficiaryData) {
    try {
      const {
        nama_instansi,
        nama_kontak,
        alamat,
        telepon,
        email,
        foto,
        created_by
      } = beneficiaryData;

      const [result] = await pool.query(
        `INSERT INTO beneficiaries 
          (nama_instansi, nama_kontak, alamat, telepon, email, foto, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          nama_instansi,
          nama_kontak || null,
          alamat || null,
          telepon || null,
          email || null,
          foto || null,
          created_by || null
        ]
      );

      return {
        id: result.insertId,
        ...beneficiaryData
      };
    } catch (error) {
      console.error("Error in create:", error);
      throw error;
    }
  }

  async update(id, beneficiaryData) {
    try {
      const {
        nama_instansi,
        nama_kontak,
        alamat,
        telepon,
        email,
        foto
      } = beneficiaryData;

      const updateFields = [];
      const values = [];

      if (nama_instansi !== undefined) {
        updateFields.push("nama_instansi = ?");
        values.push(nama_instansi);
      }
      
      if (nama_kontak !== undefined) {
        updateFields.push("nama_kontak = ?");
        values.push(nama_kontak);
      }
      
      if (alamat !== undefined) {
        updateFields.push("alamat = ?");
        values.push(alamat);
      }
      
      if (telepon !== undefined) {
        updateFields.push("telepon = ?");
        values.push(telepon);
      }
      
      if (email !== undefined) {
        updateFields.push("email = ?");
        values.push(email);
      }
      
      if (foto !== undefined) {
        updateFields.push("foto = ?");
        values.push(foto);
      }

      updateFields.push("updated_at = CURRENT_TIMESTAMP()");

      if (updateFields.length === 1) {
        const [rows] = await pool.query("SELECT * FROM beneficiaries WHERE id = ?", [id]);
        return rows.length > 0 ? rows[0] : null;
      }

      const query = `UPDATE beneficiaries SET ${updateFields.join(", ")} WHERE id = ?`;
      values.push(id);

      const [result] = await pool.query(query, values);

      if (result.affectedRows === 0) {
        return { kind: "not_found" };
      }

      return {
        id: id,
        ...beneficiaryData
      };
    } catch (error) {
      console.error("Error in update:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const [result] = await pool.query("DELETE FROM beneficiaries WHERE id = ?", [id]);
      
      if (result.affectedRows === 0) {
        return { kind: "not_found" };
      }
      
      return { kind: "deleted" };
    } catch (error) {
      console.error("Error in delete:", error);
      throw error;
    }
  }

  async getByActivities(aktivitasId) {
    try {
      const [rows] = await pool.query(
        `SELECT b.*, ab.jumlah_penerima, ab.deskripsi_manfaat 
         FROM beneficiaries b
         JOIN aktivitas_beneficiaries ab ON b.id = ab.beneficiary_id
         WHERE ab.aktivitas_id = ?`,
        [aktivitasId]
      );
      return rows;
    } catch (error) {
      console.error("Error in getByActivities:", error);
      throw error;
    }
  }
}

module.exports = new BeneficiaryModel();