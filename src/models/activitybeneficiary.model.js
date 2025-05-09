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

    async create(activityId, listBeneficiaryId) {
        try {
            const values = listBeneficiaryId.map(beneficiaryId => [activityId, beneficiaryId]);
            if (values.length === 0) {
                return null;
            }
            const [result] = await pool.query("INSERT INTO aktivitas_beneficiaries (aktivitas_id, beneficiary_id) VALUES ?", [values]);
            return result;
        } catch (error) {
            console.error("Error in create:", error);
            throw error;
        }
    }

    async createUpdate(activityId, listBeneficiaryId) {
        try {
            this.delete(activityId);
            const [result] = this.create(activityId, listBeneficiaryId)
            return result;
        } catch (error) {
            console.error("Error in create:", error);
            throw error;
        }
    }

    async delete(activityId) {
        try {
            const [result] = await pool.query("DELETE FROM aktivitas_beneficiaries WHERE aktivitas_id = ?", [activityId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error in delete:", error);
            throw error;
        }
    }
}

module.exports = new ActivityBeneficiaryModel();