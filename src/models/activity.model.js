const { pool } = require("../config/db.config");

class ActivityModel {
    async findAll() {
        try {
            const [rows] = await pool.query("SELECT * FROM aktivitas");
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async findByIdActivity(id) {
        try {
            const [rows] = await pool.query(
                "SELECT * FROM aktivitas WHERE id = ?",
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error in getUserById:", error);
            throw error;
        }
    }

    async findByIdProgram(id) {
        try {
            const [rows] = await pool.query(
                "SELECT id, nama_aktivitas, tanggal_mulai, tanggal_selesai, status, biaya_implementasi, program_id FROM aktivitas WHERE program_id = ?",
                [id]
            );
            return rows.length > 0 ? rows : null;
        } catch (error) {
            console.error("Error in getUserById:", error);
            throw error;
        }
    }

    async findByName(nama_aktivitas) {
        try {
            const [rows] = await pool.query(
                "SELECT * FROM aktivitas WHERE nama_aktivitas = ?",
                [nama_aktivitas]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    async findByStatus(status) {
        try {
            const [rows] = await pool.query(
                "SELECT * FROM aktivitas WHERE status = ?",
                [status]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    async create(activityData) {
        try {
            const {
                nama_aktivitas,
                deskripsi,
                dokumentasi,
                tanggal_mulai,
                tanggal_selesai,
                biaya_implementasi,
                status,
                program_id,
                created_by
            } = activityData;

            const dokumentasiJson = JSON.stringify(dokumentasi);

            const [result] = await pool.query(
                `INSERT INTO aktivitas 
                    (nama_aktivitas, deskripsi, dokumentasi, tanggal_mulai, tanggal_selesai, biaya_implementasi, status, program_id, created_by)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    nama_aktivitas,
                    deskripsi,
                    dokumentasiJson,
                    tanggal_mulai,
                    tanggal_selesai,
                    biaya_implementasi,
                    status,
                    program_id,
                    created_by
                ]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    async update(id, activityData) {
        try {
            // TODO: implement query
            return true;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const [result] = await pool.query("DELETE FROM aktivitas WHERE id = ?", [
                id,
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ActivityModel();
