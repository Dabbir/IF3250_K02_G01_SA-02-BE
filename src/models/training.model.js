const { pool } = require('../config/db.config');

class TrainingModel {
  static async getAllTrainings(page = 1, limit = 10, search = '', status = '', masjidId = null, userId = null, trainingRegistration = false) {
    try {
      let offset = (page - 1) * limit;
      let params = [];
      let whereClause = 'WHERE 1=1';
      
      if (search) {
        whereClause += ' AND (nama_pelatihan LIKE ? OR deskripsi LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }
      
      
      if (trainingRegistration) {
        console.log("Masuk true")
        if (userId) {
          whereClause += ' AND created_by != ?';
          params.push(userId); 
        }

        if (status) {
          whereClause += ' AND status = ?';
          params.push(status);
        } else {
          whereClause += " AND status IN ('Ongoing', 'Upcoming') ";
        }
      } else {
        console.log("Masuk false")
        if (userId) {
          whereClause += ' AND created_by = ?';
          params.push(userId);
        }
        if (masjidId) {
          whereClause += ' AND masjid_id = ?';
          params.push(masjidId);
        }
        if (status) {
          whereClause += ' AND status = ?';
          params.push(status);
        }
      }
      
      console.log(params);
      const countQuery = `SELECT COUNT(*) as total FROM pelatihan ${whereClause}`;
      const [countResult] = await pool.query(countQuery, params);
      const total = countResult[0].total;
      
      const query = `
        SELECT p.*, m.nama_masjid 
        FROM pelatihan p
        LEFT JOIN masjid m ON p.masjid_id = m.id
        ${whereClause}
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      params.push(parseInt(limit), parseInt(offset));
      const [rows] = await pool.query(query, params);
      
      return {
        data: rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async getTrainingById(id) {
    try {
      const query = `
        SELECT p.*, m.nama_masjid, u.nama AS created_by_name
        FROM pelatihan p
        LEFT JOIN masjid m ON p.masjid_id = m.id
        LEFT JOIN pengguna u ON p.created_by = u.id
        WHERE p.id = ?
      `;
      const [rows] = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async createTraining(trainingData) {
    try {
      const query = `
        INSERT INTO pelatihan (
          nama_pelatihan, deskripsi, waktu_mulai, waktu_akhir, 
          lokasi, kuota, status, masjid_id, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        trainingData.nama_pelatihan,
        trainingData.deskripsi,
        trainingData.waktu_mulai,
        trainingData.waktu_akhir,
        trainingData.lokasi,
        trainingData.kuota,
        trainingData.status || 'Upcoming',
        trainingData.masjid_id,
        trainingData.created_by
      ];
      
      const [result] = await pool.query(query, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async updateTraining(id, trainingData) {
    try {
      const query = `
        UPDATE pelatihan SET
          nama_pelatihan = ?,
          deskripsi = ?,
          waktu_mulai = ?,
          waktu_akhir = ?,
          lokasi = ?,
          kuota = ?,
          status = ?,
          masjid_id = ?
        WHERE id = ?
      `;
      
      const values = [
        trainingData.nama_pelatihan,
        trainingData.deskripsi,
        trainingData.waktu_mulai,
        trainingData.waktu_akhir,
        trainingData.lokasi,
        trainingData.kuota,
        trainingData.status,
        trainingData.masjid_id,
        id
      ];
      
      const [result] = await pool.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async deleteTraining(id) {
    try {
      const query = 'DELETE FROM pelatihan WHERE id = ?';
      const [result] = await pool.query(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getTrainingParticipants(trainingId, page = 1, limit = 10, status = '') {
    try {
      let offset = (page - 1) * limit;
      let params = [trainingId];
      let whereClause = 'WHERE pp.pelatihan_id = ?';
      
      if (status) {
        whereClause += ' AND pp.status_pendaftaran = ?';
        params.push(status);
      }
      
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM pendaftar_pelatihan pp
        ${whereClause}
      `;
      const [countResult] = await pool.query(countQuery, params);
      const total = countResult[0].total;
      
      const query = `
        SELECT pp.*, p.nama AS nama_peserta, p.email
        FROM pendaftar_pelatihan pp
        JOIN pengguna p ON pp.pengguna_id = p.id
        ${whereClause}
        ORDER BY pp.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      params.push(parseInt(limit), parseInt(offset));
      const [rows] = await pool.query(query, params);
      
      return {
        data: rows,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async registerParticipant(registrationData) {
    try {
      const checkQuery = `
        SELECT * FROM pendaftar_pelatihan
        WHERE pelatihan_id = ? AND pengguna_id = ?
      `;
      const [existingReg] = await pool.query(checkQuery, [
        registrationData.pelatihan_id,
        registrationData.pengguna_id
      ]);
      
      if (existingReg.length > 0) {
        throw new Error('User is already registered for this training');
      }
      
      const trainingQuery = 'SELECT kuota FROM pelatihan WHERE id = ?';
      const [trainingData] = await pool.query(trainingQuery, [registrationData.pelatihan_id]);
      
      if (!trainingData.length) {
        throw new Error('Training not found');
      }
      
      const countQuery = `
        SELECT COUNT(*) as count 
        FROM pendaftar_pelatihan 
        WHERE pelatihan_id = ? AND status_pendaftaran IN ('Approved', 'Pending')
      `;
      const [countData] = await pool.query(countQuery, [registrationData.pelatihan_id]);
      
      if (countData[0].count >= trainingData[0].kuota) {
        throw new Error('Training quota has been reached');
      }
      
      const query = `
        INSERT INTO pendaftar_pelatihan (
          pelatihan_id, pengguna_id, status_pendaftaran, masjid_id, catatan
        ) VALUES (?, ?, ?, ?, ?)
      `;
      
      const values = [
        registrationData.pelatihan_id,
        registrationData.pengguna_id,
        registrationData.status_pendaftaran || 'Pending',
        registrationData.masjid_id,
        registrationData.catatan || null
      ];
      
      const [result] = await pool.query(query, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async updateParticipantStatus(id, status, catatan) {
    try {
      const query = `
        UPDATE pendaftar_pelatihan
        SET status_pendaftaran = ?, catatan = ?
        WHERE id = ?
      `;
      
      const [result] = await pool.query(query, [status, catatan, id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getTrainingAvailability(trainingId) {
    try {
      const query = `
        SELECT 
          p.kuota as total_kuota,
          COUNT(CASE WHEN pp.status_pendaftaran IN ('Approved', 'Pending') THEN 1 END) as used_slots,
          p.kuota - COUNT(CASE WHEN pp.status_pendaftaran IN ('Approved', 'Pending') THEN 1 END) as available_slots
        FROM pelatihan p
        LEFT JOIN pendaftar_pelatihan pp ON p.id = pp.pelatihan_id
        WHERE p.id = ?
        GROUP BY p.id
      `;
      
      const [result] = await pool.query(query, [trainingId]);
      return result[0] || { total_kuota: 0, used_slots: 0, available_slots: 0 };
    } catch (error) {
      throw error;
    }
  }

  static async getUserRegistrations(userId) {
    try {
      const query = `
        SELECT
          pp.id,
          pp.pelatihan_id,
          pp.status_pendaftaran,
          pp.catatan,
          pp.created_at,
          p.nama_pelatihan,
          p.waktu_mulai,
          p.waktu_akhir,
          p.lokasi,
          p.status as pelatihan_status,
          m.nama_masjid,
          m.id as masjid_id
        FROM pendaftar_pelatihan pp
        JOIN pelatihan p ON pp.pelatihan_id = p.id
        LEFT JOIN masjid m ON p.masjid_id = m.id
        WHERE pp.pengguna_id  = ?
        ORDER BY pp.created_at DESC
      `;

      const [rows] = await pool.query(query, [userId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TrainingModel;