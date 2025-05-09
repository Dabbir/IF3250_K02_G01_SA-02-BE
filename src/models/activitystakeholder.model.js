const { pool } = require('../config/db.config');

class ActivityStakeholderModel {
    async findStakeholder(idactivity) {
        try {
            const [rows] = await pool.query("SELECT * FROM aktivitas_stakeholder LEFT JOIN stakeholder ON aktivitas_stakeholder.stakeholder_id = stakeholder.id WHERE aktivitas_stakeholder.aktivitas_id = ?", [idactivity]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async create(activityId, listStakeholderId) {
        try {
            const values = listStakeholderId.map(stakeholderId => [activityId, stakeholderId]);
            if (values.length === 0) {
                return null;
            }
            const [result] = await pool.query("INSERT INTO aktivitas_stakeholder (aktivitas_id, stakeholder_id) VALUES ?", [values]);
            return result;
        } catch (error) {
            console.error("Error in create:", error);
            throw error;
        }
    }

    async createUpdate(activityId, listStakeholderId) {
        try {
            this.delete(activityId);
            const [result] = this.create(activityId, listStakeholderId)
            return result;
        } catch (error) {
            console.error("Error in create:", error);
            throw error;
        }
    }

    async delete(activityId) {
        try {
            const [result] = await pool.query("DELETE FROM aktivitas_stakeholder WHERE aktivitas_id = ?", [activityId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error in delete:", error);
            throw error;
        }
    }
}

module.exports = new ActivityStakeholderModel();