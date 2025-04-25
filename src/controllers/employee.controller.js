const EmployeeService = require("../services/employee.service");
const ActivityService = require("../services/activity.service");

const ALLOWED_SORT_FIELDS = [
  "nama",
  "created_at",
];

exports.getAllEmployees = async (req, res, next) => {
  try {
    const masjidID = req.user.masjid_id;
    const page     = parseInt(req.query.page  || 1,  10);
    const limit    = parseInt(req.query.limit || 10, 10);
    const offset   = (page - 1) * limit;
    const search   = req.query.search   || "";
    const sortBy   = ALLOWED_SORT_FIELDS.includes(req.query.sortBy) ? req.query.sortBy : "created_at";
    const sortOrder = req.query.sortOrder === "ASC" ? "ASC" : "DESC";
    let working = null;
    if (req.query.working === "true")  working = true;
    if (req.query.working === "false") working = false;

    const [employees, total] = await Promise.all([
      EmployeeService.getAllEmployees(limit, offset, masjidID, search, sortBy, sortOrder, working),
      EmployeeService.countAllEmployees(masjidID, search, working),
    ]);

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      data: employees,
      total,
    });
  } catch (error) {
    next(error);
  }
};

exports.getEmployeeById = async (req, res, next) => {
  try {
    const masjidID   = req.user.masjid_id;
    const employeeId = req.params.id;
    const employee   = await EmployeeService.getEmployeeById(employeeId, masjidID);

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
    next(error);
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const { created_by: _cb, masjid_id: _mid, ...rest } = req.body;
    const payload = {
      ...rest,
      created_by: req.user.id,
      masjid_id:  req.user.masjid_id,
    };
    const id = await EmployeeService.createEmployee(payload);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Employee creation failed",
      });
    }

    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      id,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const employee_id    = req.params.id;
    const masjid_id = req.user.masjid_id;
    const allowed  = ["nama","telepon","alamat","email","foto"];
    const update_payload = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const response = await EmployeeService.updateEmployee(employee_id, update_payload, masjid_id);
    res.status(200).json({
      success: true,
      message: response ? "Employee updated successfully" : "No changes made",
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee_id    = req.params.id;
    const masjid_id = req.user.masjid_id;
    const response = await EmployeeService.deleteEmployee(employee_id, masjid_id);

    if (!response) {
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
    next(error);
  }
};

exports.getActivityByEmployeeId = async (req, res, next) => {
  try {
    const employee_id    = req.params.id;
    const masjid_id = req.user.masjid_id;
    const activities = await ActivityService.getActivityByEmployeeId(employee_id, masjid_id);

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
    next(error);
  }
};