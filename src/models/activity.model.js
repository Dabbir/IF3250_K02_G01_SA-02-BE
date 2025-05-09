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
                "SELECT a.*, p.nama_program FROM aktivitas a LEFT JOIN program p ON a.program_id = p.id WHERE a.id = ?",
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error("Error in findByIdActivity:", error);
            throw error;
        }
    }

    async findAll(masjidId, params = {}) {
        try {
            let baseQuery = "FROM aktivitas WHERE masjid_id = ?";
            const values = [masjidId];

            if (params.nama_aktivitas) {
                baseQuery += " AND nama_aktivitas LIKE ?";
                values.push(`%${params.nama_aktivitas}%`);
            }

            if (params.jenis && params.jenis.length > 0) {
                baseQuery += " AND jenis IN (?)";
                values.push(params.jenis);
            }

            const countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;
            const [countRows] = await pool.query(countQuery, values);
            const totalItems = countRows[0].total;

            const sortColumn = params.sortColumn || "nama_aktivitas";
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

    // async findAllActivity(id) {
    //     try {
    //         const [rows] = await pool.query(
    //             "SELECT a.*, p.nama_program FROM aktivitas a LEFT JOIN program p ON a.program_id = p.id WHERE a.masjid_id = ?",
    //             [id]
    //         );
    //         return rows;
    //     } catch (error) {
    //         console.error("Error in findAllActivity:", error);
    //         throw error;
    //     }
    // }

    async getIdProgram(id) {
        try {
            const [rows] = await pool.query(
                "SELECT id, nama_program FROM program WHERE masjid_id = ?",
                [id]
            );
            return rows;
        } catch (error) {
            console.error("Error in getIdProgram:", error);
            throw error;
        }
    }

    async getIdAktivitas(id) {
        try {
            const [rows] = await pool.query(
                "SELECT id, nama_aktivitas FROM aktivitas WHERE masjid_id = ?",
                [id]
            );
            return rows;
        } catch (error) {
            console.error("Error in getIdAktivitas:", error);
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
                created_by,
                masjid_id
            } = activityData;

            const dokumentasiJson = JSON.stringify(dokumentasi);

            const [result] = await pool.query(
                `INSERT INTO aktivitas 
                    (nama_aktivitas, deskripsi, dokumentasi, tanggal_mulai, tanggal_selesai, biaya_implementasi, status, program_id, created_by, masjid_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                    created_by,
                    masjid_id
                ]
            );

            return result.insertId;
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

    async update(id, activityData) {
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
                prev_dokumentasi,
                deleted_images
            } = activityData;

            const updateFields = [];
            const values = [];

            if (nama_aktivitas !== undefined) {
                updateFields.push("nama_aktivitas = ?");
                values.push(nama_aktivitas);
            }
            if (deskripsi !== undefined) {
                updateFields.push("deskripsi = ?");
                values.push(deskripsi);
            }
            if (dokumentasi !== undefined || deleted_images !== undefined) {
                let dokumentasiJson;
                if (prev_dokumentasi !== undefined && dokumentasi !== undefined) {
                    const mergedDokumentasi = prev_dokumentasi.concat(dokumentasi);
                    dokumentasiJson = JSON.stringify(mergedDokumentasi);
                } else if (prev_dokumentasi !== undefined) {
                    dokumentasiJson = JSON.stringify(prev_dokumentasi);
                } else if (prev_dokumentasi === undefined && dokumentasi !== undefined) {
                    dokumentasiJson = JSON.stringify(dokumentasi);
                } else {
                    dokumentasiJson = null;
                }
                updateFields.push("dokumentasi = ?");
                values.push(dokumentasiJson);
            }
            if (tanggal_mulai !== undefined) {
                updateFields.push("tanggal_mulai = ?");
                values.push(tanggal_mulai);
            }
            if (tanggal_selesai !== undefined) {
                updateFields.push("tanggal_selesai = ?");
                values.push(tanggal_selesai);
            }
            if (biaya_implementasi !== undefined) {
                updateFields.push("biaya_implementasi = ?");
                values.push(biaya_implementasi);
            }
            if (status !== undefined) {
                updateFields.push("status = ?");
                values.push(status);
            }
            if (program_id !== undefined) {
                updateFields.push("program_id = ?");
                values.push(program_id);
            }

            updateFields.push("updated_at = CURRENT_TIMESTAMP()");

            if (updateFields.length === 1) {
                const [rows] = await pool.query("SELECT * FROM aktivitas WHERE id = ?", [id]);
                return rows.length > 0 ? rows[0] : null;
            }

            const query = `UPDATE aktivitas SET ${updateFields.join(", ")} WHERE id = ?`;
            values.push(id);

            const [result] = await pool.query(query, values);

            if (result.affectedRows === 0) {
                return null;
            }

            const [rows] = await pool.query("SELECT * FROM aktivitas WHERE id = ?", [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    async createSheet(activityData) {
        try {
            const placeholders = activityData.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");

            const sql = `
            INSERT INTO aktivitas 
            (nama_aktivitas, deskripsi, dokumentasi, tanggal_mulai, tanggal_selesai, 
             biaya_implementasi, status, program_id, created_by, masjid_id)
            VALUES ${placeholders}
            `;

            const flatValues = activityData.flatMap(activity => [
                activity.nama_aktivitas,
                activity.deskripsi,
                activity.dokumentasi || null,
                activity.tanggal_mulai,
                activity.tanggal_selesai,
                activity.biaya_implementasi,
                activity.status,
                activity.program_id || null,
                activity.created_by,
                activity.masjid_id
            ]);

            const [result] = await pool.query(sql, flatValues);
            return result.insertId;
        } catch (error) {
            console.error("Error inserting data:", error);
            throw error;
        }
    }

    async findActivityByEmployeeId(employeeId, masjidID) {
        try {
            const [rows] = await pool.query(
                "SELECT a.* FROM aktivitas a JOIN aktivitas_employee ae ON a.id = ae.aktivitas_id WHERE a.masjid_id = ? AND ae.employee_id = ?",
                [masjidID, employeeId]
            );
            return rows;
        } catch (error) {
            console.error("Error in findActivityByEmployeeId:", error);
            throw error;
        }
    }
}

module.exports = new ActivityModel();
