const { pool } = require("../config/db.config");

class Employee {
  static async getAll(masjid_id) {
    const [rows] = await pool.query(
        `SELECT * FROM employee WHERE masjid_id = ? ORDER BY created_at DESC`,
        [masjid_id]
    );
    return rows;
  }

  static async getPaginated(limit, offset, masjid_id) {
    const [rows] = await pool.query(
        `SELECT * FROM employee WHERE masjid_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [masjid_id, limit, offset]
    );
    return rows;
  }

  static async countAll(masjid_id) {
    const [[{ count }]] = await pool.query(
        `SELECT COUNT(*) AS count FROM employee WHERE masjid_id = ?`,
        [masjid_id]
    );
    return count;
  }

  static async getById(id, masjid_id) {
    const [rows] = await pool.query(
        `SELECT 
            e.id,
            e.nama,
            e.telepon,
            e.alamat,
            e.email,
            e.foto,
            e.masjid_id,
            p.nama AS created_by,
            e.created_at,
            e.updated_at
        FROM employee e LEFT JOIN pengguna p ON e.created_by = p.id 
        WHERE e.id = ? AND e.masjid_id = ?`,
        [id, masjid_id]
    );
    return rows[0] || null;
  }

  static async create(data) {
    const [result] = await pool.query(
        `INSERT INTO employee SET ?`,
        [data]
    );
    return result.insertId;
  }

  static async update(id, data, masjid_id) {
    const { created_by, created_at, masjid_id: _ignore, ...updateData } = data;
    delete updateData.updated_at;

    const [result] = await pool.query(
        `UPDATE employee SET ? WHERE id = ? AND masjid_id = ?`,
        [updateData, id, masjid_id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id, masjid_id) {
    const [result] = await pool.query(
        `DELETE FROM employee WHERE id = ? AND masjid_id = ?`,
        [id, masjid_id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Employee;