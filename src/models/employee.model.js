const { pool } = require("../config/db.config");

class Employee {
  static async getAll(limit, offset, masjid_id, search = "", sortBy = "created_at", sortOrder = "DESC", working = null) {
    const searchParam = `%${search}%`;
    let where = `e.masjid_id = ? AND e.nama LIKE ?`;

    if (working === true) {
      where += ` AND EXISTS (
        SELECT 1
        FROM aktivitas_employee ae JOIN aktivitas a ON ae.aktivitas_id = a.id
        WHERE ae.employee_id = e.id AND a.status = 'Berjalan'
      )`;
    } else if (working === false) {
      where += ` AND NOT EXISTS (
        SELECT 1
        FROM aktivitas_employee ae JOIN aktivitas a ON ae.aktivitas_id = a.id
        WHERE ae.employee_id = e.id AND a.status = 'Berjalan'
      )`;
    }

    const orderClause = `ORDER BY \`${sortBy}\` ${sortOrder}`;
    const sql = `SELECT e.*, p.nama AS created_by FROM employee eLEFT JOIN pengguna p ON e.created_by = p.id WHERE ${where} ${orderClause}LIMIT ? OFFSET ?`;

    const [rows] = await pool.query(sql, [masjid_id, searchParam, limit, offset]);
    return rows;
  }

  static async countAll(masjid_id, search = "", working = null) {
    const searchParam = `%${search}%`;
    let where = `masjid_id = ? AND nama LIKE ?`;

    if (working === true) {
      where += ` AND EXISTS (
        SELECT 1
        FROM aktivitas_employee ae JOIN aktivitas a ON ae.aktivitas_id = a.id
        WHERE ae.employee_id = e.id AND a.status = 'Berjalan'
      )`;
    } else if (working === false) {
      where += ` AND NOT EXISTS (
        SELECT 1
        FROM aktivitas_employee ae JOIN aktivitas a ON ae.aktivitas_id = a.id
        WHERE ae.employee_id = e.id AND a.status = 'Berjalan'
      )`;
    }

    const sql = `SELECT COUNT(*) AS count FROM employee WHERE ${where}`;
    const [[{ count }]] = await pool.query(sql, [masjid_id, searchParam]);
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