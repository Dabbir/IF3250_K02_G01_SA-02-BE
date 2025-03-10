const { pool } = require("../config/db.config");
const bcrypt = require("bcryptjs");

class UserModel {
  async findAll() {
    try {
      const [rows] = await pool.query(
        "SELECT id, username, email, role, created_at FROM users"
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.query(
        "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }

  async create(userData) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const [result] = await pool.query(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        [
          userData.username,
          userData.email,
          hashedPassword,
          userData.role || "user",
        ]
      );

      const [rows] = await pool.query(
        "SELECT id, username, email, role, created_at FROM users WHERE id = ?",
        [result.insertId]
      );

      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  async update(id, userData) {
    try {
      let query = "UPDATE users SET";
      const values = [];

      if (userData.username) {
        query += " username = ?,";
        values.push(userData.username);
      }

      if (userData.email) {
        query += " email = ?,";
        values.push(userData.email);
      }

      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        query += " password = ?,";
        values.push(hashedPassword);
      }

      if (userData.role) {
        query += " role = ?,";
        values.push(userData.role);
      }

      query = query.slice(0, -1);

      query += " WHERE id = ?";
      values.push(id);

      const [result] = await pool.query(query, values);

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = new UserModel();
