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
                return;
            }
            await pool.query("INSERT INTO aktivitas_stakeholder (aktivitas_id, stakeholder_id) VALUES ?", [values]);
        } catch (error) {
            console.error("Error in create:", error);
            throw error;
        }
    }

    async createUpdate(activityId, listStakeholderId) {
        try {
            await this.delete(activityId); 
            await this.create(activityId, listStakeholderId); 
        } catch (error) {
            console.error("Error in createUpdate:", error);
            throw error;
        }
    }

    async delete(activityId) {
        try {
            await pool.query("DELETE FROM aktivitas_stakeholder WHERE aktivitas_id = ?", [activityId]);
        } catch (error) {
            console.error("Error in delete:", error);
            throw error;
        }
    }

}

module.exports = new ActivityStakeholderModel();