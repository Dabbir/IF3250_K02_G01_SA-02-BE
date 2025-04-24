const EmployeeService = require('../services/employee.service');
const ActivityService = require('../services/activity.service');

exports.getAllEmployee = async (req, res) => {
    try {
        const masjidID = req.user.masjid_id;
        const employees = await EmployeeService.getAllEmployee(masjidID);

        res.status(200).json({
            success: true,
            message: "Employees fetched successfully",
            data: employees,
        });
    } catch (error) {
        console.error(error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

exports.getEmployeesPaginated = async (req, res) => {
    try {
        const masjidID = req.user.masjid_id;
        const page   = parseInt(req.query.page || 1, 10);
        const limit  = parseInt(req.query.limit || 10, 10);
        const offset = (page - 1) * limit;

        const [employees, total] = await Promise.all([
            EmployeeService.getEmployeesPaginated(limit, offset, masjidID),
            EmployeeService.countAllEmployees(masjidID),
        ]);

        res.status(200).json({
            success: true,
            message: "Employees fetched successfully",
            data: employees,
            total,
        });
    } catch (error) {
        console.error(error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const masjidID   = req.user.masjid_id;
        const employeeId = req.params.id;

        const employee = await EmployeeService.getEmployeeById(employeeId, masjidID);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Employee found",
            data: employee,
        });
    } catch (error) {
        console.error(error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const { created_by: _ignore1, masjid_id: _ignore2, ...rest } = req.body;
        const payload = {
            ...rest,
            created_by: req.user.id,
            masjid_id:  req.user.masjid_id,
        };

        const id = await EmployeeService.createEmployee(payload);
        res.status(201).json({
            success: true,
            message: "Employee created successfully",
            id,
        });
    } catch (error) {
        console.error(error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const masjidID   = req.user.masjid_id;

        const allowedFields = ['nama', 'telepon', 'alamat', 'email', 'foto'];
        const updatePayload = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
        );

        const result = await EmployeeService.updateEmployee(employeeId, updatePayload, masjidID);
        res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const masjidID   = req.user.masjid_id;

        const result = await EmployeeService.deleteEmployee(employeeId, masjidID);
        if (!result) {
        return res.status(400).json({
            success: false,
            message: "Employee deletion failed",
        });
        }

        res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
        });
    } catch (error) {
        console.error(error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};

exports.getActivityByEmployeeId = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const masjidID   = req.user.masjid_id;

        const activities = await ActivityService.getActivityByEmployeeId(employeeId, masjidID);
        if (!activities) {
            return res.status(404).json({
                success: false,
                message: "Activities not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Activities fetched successfully",
            data: activities,
        });
    } catch (error) {
        console.error(error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
};