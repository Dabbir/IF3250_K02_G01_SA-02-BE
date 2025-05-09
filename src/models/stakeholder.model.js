const { pool } = require("../config/db.config");

class StakeholderModel {
    async findAll(masjidId) {
        try {
            const [rows] = await pool.query(
                "SELECT * FROM stakeholder WHERE masjid_id = ?",
                [masjidId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            const [rows] = await pool.query(
                "SELECT * FROM stakeholder WHERE id = ?",
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error in findById:", error);
            throw error;
        }
    }

    async create(data) {
        try {
            const [result] = await pool.query(
                "INSERT INTO stakeholder SET ?",
                [data]
            );
            return result.insertId;
        } catch (error) {
            console.error("Error in create:", error);
            throw error;
        }
    }

    async update(id, data) {
        try {
            const [result] = await pool.query(
                "UPDATE stakeholder SET ? WHERE id = ?",
                [data, id]
            )

            if (result.affectedRows === 0) {
                return null;
            }

            const [rows] = await pool.query("SELECT * FROM stakeholder WHERE id = ?", [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error in update:", error);
            throw error;
        }
    }

    async delete(id) {
        try {
            return await pool.query(
                "DELETE FROM stakeholder WHERE id = ?",
                [id]
            )
        } catch (error) {
            console.error("Error in delete:", error);
            throw error;
        }
    }
}

module.exports = new StakeholderModel();