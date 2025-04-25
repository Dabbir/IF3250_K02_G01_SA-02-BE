const { pool } = require("../config/db.config");

class Program {
  static async getAll(limit, offset, masjid_id, search = "", sortBy = "created_at", sortOrder = "DESC", statuses = []) {
    let sql = `SELECT * FROM program WHERE masjid_id = ? AND nama_program LIKE ?`;
    const params = [masjid_id, `%${search}%`];

    if (statuses.length) {
      sql += ` AND status_program IN (${statuses.map(() => "?").join(",")})`;
      params.push(...statuses);
    }
    
    sql += ` ORDER BY \`${sortBy}\` ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
  
    return rows.map((row) => ({
      ...row,
      pilar_program: JSON.parse(row.pilar_program || "[]"),
      cover_image: row.cover_image || null,
    }));
  }
  
  static async countAll(masjid_id, search = "", statuses = []) {
    let sql = `SELECT COUNT(*) as count FROM program WHERE masjid_id = ? AND nama_program LIKE ?`;
    const params = [masjid_id, `%${search}%`];

    if (statuses.length) {
      sql += ` AND status_program IN (${statuses.map(() => "?").join(",")})`;
      params.push(...statuses);
    }

    const [[{ count }]] = await pool.query(sql, params);

    return count;
  }  

  static async getById(id, masjid_id) {
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
      program.cover_image,
      program.masjid_id,
      pengguna.nama AS created_by,
      program.created_at,
      program.updated_at
      FROM program LEFT JOIN pengguna ON program.created_by = pengguna.id 
      WHERE program.id = ? AND program.masjid_id = ?`, 
      [id, masjid_id]
    );
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
    const [result] = await pool.query(
      'INSERT INTO program SET ?', 
      [data]
    );
    return result.insertId;
  }

  static async update(id, data, masjid_id) {
    const { created_by, created_at, masjid_id: _ignoreMasjid, ...updateData } = data;

    console.log("pilar_program before: ", updateData.pilar_program);
  
    if (updateData.pilar_program && Array.isArray(updateData.pilar_program)) {
      updateData.pilar_program = JSON.stringify(updateData.pilar_program);
    }

    console.log("pilar_program after: ", updateData.pilar_program);
  
    delete updateData.updated_at;
  
    const [result] = await pool.query(
      'UPDATE program SET ? WHERE id = ? AND masjid_id = ?',
      [updateData, id, masjid_id]
    );
  
    return result.affectedRows > 0;
  }

  static async delete(id, masjid_id) {
    const [result] = await pool.query(
      'DELETE FROM program WHERE id = ? AND masjid_id = ?',
      [id, masjid_id]
    );
  
    return result.affectedRows > 0;
  }
}

module.exports = Program;