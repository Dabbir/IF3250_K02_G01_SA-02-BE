const { pool } = require("../config/db.config");

class Publikasi {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM publikasi');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM publikasi WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const [result] = await pool.query('INSERT INTO publikasi SET ?', [data]);
    return result.insertId;
  }

  static async update(id, data) {
    await pool.query('UPDATE publikasi SET ? WHERE id = ?', [data, id]);
  }

  static async delete(id) {
    await pool.query('DELETE FROM publikasi WHERE id = ?', [id]);
  }
}

module.exports = Publikasi;