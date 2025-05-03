const { pool } = require("../config/db.config");

class ActivityBeneficiaryModel {
    async findBeneficiary(idactivity) {
        try {
            const [rows] = await pool.query("SELECT * FROM aktivitas_beneficiaries LEFT JOIN beneficiaries ON aktivitas_beneficiaries.beneficiary_id = beneficiaries.id WHERE aktivitas_beneficiaries.aktivitas_id = ?", [idactivity]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async create(data) {
        try {
            const [result] = await pool.query("INSERT INTO aktivitas_beneficiaries SET ?", [data]);
            return result.insertId;
        } catch (error) {
            console.error("Error in create:", error);
            throw error;
        }
    }

    async delete(activityId, beneficiaryId) {
        try {
            const [result] = await pool.query("DELETE FROM aktivitas_beneficiaries WHERE aktivitas_id = ? AND beneficiary_id = ?", [activityId, beneficiaryId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error in delete:", error);
            throw error;
        }
    }
}

module.exports = new ActivityBeneficiaryModel();