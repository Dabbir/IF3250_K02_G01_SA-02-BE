const { pool } = require("../config/db.config");

class ActivityEmployeeModel {
    async findEmployee(idactivity) {
        try {
            const [rows] = await pool.query("SELECT * FROM aktivitas_employee LEFT JOIN employee ON aktivitas_employee.employee_id = employee.id WHERE aktivitas_employee.aktivitas_id = ?", [idactivity]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async create(activityId, listEmployeeId) {
        try {
            const values = listEmployeeId.map(employeeId => [activityId, employeeId]);
            if (values.length === 0) {
                return null;
            }
            const [result] = await pool.query("INSERT INTO aktivitas_employee (aktivitas_id, employee_id) VALUES ?", [values]);
            return result;
        } catch (error) {
            console.error("Error in create:", error);
            throw error;
        }
    }

    async createUpdate(activityId, listEmployeeId) {
        try {
            await this.delete(activityId);
            await this.create(activityId, listEmployeeId)
        } catch (error) {
            console.error("Error in create:", error);
            throw error;
        }
    }

    async delete(activityId) {
        try {
            await pool.query("DELETE FROM aktivitas_employee WHERE aktivitas_id = ?", [activityId]);
        } catch (error) {
            console.error("Error in delete:", error);
            throw error;
        }
    }
}

module.exports = new ActivityEmployeeModel();