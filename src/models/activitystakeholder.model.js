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

    async create(data) {
        try {
            const [result] = await pool.query("INSERT INTO aktivitas_stakeholder SET ?", [data]);
            return result.insertId;
        } catch (error) {
            console.error("Error in create:", error);
            throw error;
        }
    }

    async delete(activityId, stakeholderId) {
        try {
            const [result] = await pool.query("DELETE FROM aktivitas_stakeholder WHERE aktivitas_id = ? AND stakeholder_id = ?", [activityId, stakeholderId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error in delete:", error);
            throw error;
        }
    }
}

module.exports = new ActivityStakeholderModel();