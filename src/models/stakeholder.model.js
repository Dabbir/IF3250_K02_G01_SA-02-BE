const { pool } = require("../config/db.config");

class StakeholderModel {
    async findAll(masjidId, params = {}) {
        try {
            let baseQuery = "FROM stakeholder WHERE masjid_id = ?";
            const values = [masjidId];

            if (params.nama_stakeholder) {
                baseQuery += " AND nama_stakeholder LIKE ?";
                values.push(`%${params.nama_stakeholder}%`);
            }

            if (params.jenis && params.jenis.length > 0) {
                baseQuery += " AND jenis IN (?)";
                values.push(params.jenis);
            }

            const countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;
            const [countRows] = await pool.query(countQuery, values);
            const totalItems = countRows[0].total;

            const sortColumn = params.sortColumn || "nama_stakeholder";
            const sortOrder = params.sortOrder || "ASC";
            const page = params.page || 1;
            const limit = params.limit || 20;
            const offset = (page - 1) * limit;

            const dataQuery = `SELECT * ${baseQuery} ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
            const dataValues = [...values, limit, offset];

            const [dataRows] = await pool.query(dataQuery, dataValues);

            return {
                data: dataRows,
                total: totalItems,
                page,
                limit,
            };
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