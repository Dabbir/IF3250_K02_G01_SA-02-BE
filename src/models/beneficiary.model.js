const db = require('../config/db.config');

class Beneficiary {
  constructor(beneficiary) {
    this.nama_instansi = beneficiary.nama_instansi;
    this.nama_kontak = beneficiary.nama_kontak;
    this.alamat = beneficiary.alamat;
    this.telepon = beneficiary.telepon;
    this.email = beneficiary.email;
    this.foto = beneficiary.foto;
    this.created_by = beneficiary.created_by;
  }

  static create(newBeneficiary) {
    return new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO beneficiaries SET ?',
        newBeneficiary,
        (err, res) => {
          if (err) {
            console.log("Error: ", err);
            reject(err);
            return;
          }
          resolve({ id: res.insertId, ...newBeneficiary });
        }
      );
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM beneficiaries WHERE id = ?',
        id,
        (err, res) => {
          if (err) {
            console.log("Error: ", err);
            reject(err);
            return;
          }
          if (res.length) {
            resolve(res[0]);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  static getAll(params = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM beneficiaries';
      
      // Add WHERE clause if there are filtering parameters
      const conditions = [];
      const values = [];
      
      if (params.nama_instansi) {
        conditions.push('nama_instansi LIKE ?');
        values.push(`%${params.nama_instansi}%`);
      }
      
      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      // Add ORDER BY if specified
      if (params.orderBy) {
        query += ` ORDER BY ${params.orderBy} ${params.orderDirection || 'ASC'}`;
      }
      
      // Add pagination
      if (params.limit && params.page) {
        const offset = (params.page - 1) * params.limit;
        query += ' LIMIT ? OFFSET ?';
        values.push(parseInt(params.limit), offset);
      }
      
      db.query(query, values, (err, res) => {
        if (err) {
          console.log("Error: ", err);
          reject(err);
          return;
        }
        resolve(res);
      });
    });
  }

  static getTotalCount(params = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT COUNT(*) as total FROM beneficiaries';
      
      // Add WHERE clause if there are filtering parameters
      const conditions = [];
      const values = [];
      
      if (params.nama_instansi) {
        conditions.push('nama_instansi LIKE ?');
        values.push(`%${params.nama_instansi}%`);
      }
      
      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      db.query(query, values, (err, res) => {
        if (err) {
          console.log("Error: ", err);
          reject(err);
          return;
        }
        resolve(res[0].total);
      });
    });
  }

  static update(id, beneficiary) {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE beneficiaries SET ? WHERE id = ?',
        [beneficiary, id],
        (err, res) => {
          if (err) {
            console.log("Error: ", err);
            reject(err);
            return;
          }
          if (res.affectedRows === 0) {
            // If no rows were affected, then the ID doesn't exist
            resolve({ kind: "not_found" });
            return;
          }
          resolve({ id: id, ...beneficiary });
        }
      );
    });
  }

  static remove(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'DELETE FROM beneficiaries WHERE id = ?',
        id,
        (err, res) => {
          if (err) {
            console.log("Error: ", err);
            reject(err);
            return;
          }
          if (res.affectedRows === 0) {
            // If no rows were deleted, then the ID doesn't exist
            resolve({ kind: "not_found" });
            return;
          }
          resolve(res);
        }
      );
    });
  }

  static getByActivities(aktivitasId) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT b.*, ab.jumlah_penerima, ab.deskripsi_manfaat 
         FROM beneficiaries b
         JOIN aktivitas_beneficiaries ab ON b.id = ab.beneficiary_id
         WHERE ab.aktivitas_id = ?`,
        aktivitasId,
        (err, res) => {
          if (err) {
            console.log("Error: ", err);
            reject(err);
            return;
          }
          resolve(res);
        }
      );
    });
  }
}

module.exports = Beneficiary;