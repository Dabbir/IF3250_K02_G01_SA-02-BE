const { pool } = require("../config/db.config");

class Program {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM program');
    return rows.map((row) => ({
      ...row,
      pilar_program: JSON.parse(row.pilar_program || "[]"),
    }));
  }

  static async getById(id) {
    const [rows] = await pool.query(`
      SELECT 
      program.id,
      program.nama_program,
      program.deskripsi_program,
      program.pilar_program,
      program.kriteria_program,
      program.waktu_mulai,
      program.waktu_selesai,
      program.rancangan_anggaran,
      program.aktualisasi_anggaran,
      program.status_program,
      program.masjid_id,
      pengguna.nama AS created_by,
      program.created_at,
      program.updated_at
      FROM program LEFT JOIN pengguna ON program.created_by = pengguna.id 
      WHERE program.id = ?
    `, [id]);
    const row = rows[0];

    if (row) {
      if (row.waktu_mulai) {
        const date = new Date(row.waktu_mulai);
        row.waktu_mulai = date.toISOString().split('T')[0];
      }
      if (row.waktu_selesai) {
        const date = new Date(row.waktu_selesai);
        row.waktu_selesai = date.toISOString().split('T')[0];
      }
    }
    
    return {
      ...row,
      pilar_program: JSON.parse(row.pilar_program || "[]"),
    };
  }

  static async create(data) {
    if (data.pilar_program && Array.isArray(data.pilar_program)) {
      data.pilar_program = JSON.stringify(data.pilar_program);
    }
    const [result] = await pool.query('INSERT INTO program SET ?', [data]);
    return result.insertId;
  }

  static async update(id, data) {
    if (data.pilar_program && Array.isArray(data.pilar_program)) {
      data.pilar_program = JSON.stringify(data.pilar_program);
    }
    await pool.query('UPDATE program SET ? WHERE id = ?', [data, id]);
  }

  static async delete(id) {
    await pool.query('DELETE FROM program WHERE id = ?', [id]);
  }
}

module.exports = Program;