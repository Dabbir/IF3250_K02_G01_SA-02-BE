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

    async findById(id) {
        try {
            const [rows] = await pool.query(
                "SELECT a.*, p.nama_masjid FROM aktivitas a LEFT JOIN program p ON a.program_id = p.id WHERE a.id = ?",
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
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

    async create(userData) {
        try {
            const {
                nama_aktivitas,
                program_id,
                tanggal_mulai,
                tanggal_selesai,
                biaya_implementasi,
                status,
                deskripsi,
                dokumentasi,
            } = userData;

            const [result] = await pool.query(
                `INSERT INTO aktivitas 
                (nama_aktivitas, program_id, tanggal_mulai, tanggal_selesai, biaya_implementasi, status, deskripsi, dokumentasi)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    nama_aktivitas,
                    program_id,
                    tanggal_mulai,
                    tanggal_selesai,
                    biaya_implementasi,
                    status,
                    deskripsi,
                    dokumentasi,
                ]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    async update(id, userData) {
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
