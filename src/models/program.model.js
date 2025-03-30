const { pool } = require("../config/db.config");

class Program {
  static async getAll() {
    const [rows] = await pool.query('SELECT * FROM program');
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.query('SELECT * FROM program WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const [result] = await pool.query('INSERT INTO program SET ?', [data]);
    return result.insertId;
  }

  static async update(id, data) {
    console.log("Updating program with ID:", id, "and data:", data);
    await pool.query('UPDATE program SET ? WHERE id = ?', [data, id]);
  }

  static async delete(id) {
    await pool.query('DELETE FROM program WHERE id = ?', [id]);
  }
}

module.exports = Program;