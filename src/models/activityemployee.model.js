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

    async create(data) {
        try {
            const [result] = await pool.query("INSERT INTO aktivitas_employee SET ?", [data]);
            return result.insertId;
        } catch (error) {
            console.error("Error in create:", error);
            throw error;
        }
    }

    async delete(activityId, employeeId) {
        try {
            const [result] = await pool.query("DELETE FROM aktivitas_employee WHERE aktivitas_id = ? AND employee_id = ?", [activityId, employeeId]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error("Error in delete:", error);
            throw error;
        }
    }
}

module.exports = new ActivityEmployeeModel();