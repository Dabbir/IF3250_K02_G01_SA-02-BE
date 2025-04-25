const EmployeeService = require("../services/employee.service");
const ActivityService = require("../services/activity.service");
const cloudinary = require('cloudinary').v2;

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

    if (req.fileUrl) {
      payload.foto = req.fileUrl;
    }

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

    const currentEmployee = await EmployeeService.getEmployeeById(employee_id, masjid_id);

    if (!currentEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const update_payload = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    if (req.body.deletePhoto === 'true' && currentEmployee.foto) {
      console.log("Deleting photo:", currentEmployee.foto);
      
      await deleteCloudinaryImage(currentEmployee.foto);
      
      update_payload.foto = null;
    } 
    else if (req.fileUrl) {
      update_payload.foto = req.fileUrl;
      
      if (currentEmployee && currentEmployee.foto) {
        await deleteCloudinaryImage(currentEmployee.foto);
      }
    }

    const response = await EmployeeService.updateEmployee(employee_id, update_payload, masjid_id);
    res.status(200).json({
      success: true,
      message: response ? "Employee updated successfully" : "No changes made",
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    next(error);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee_id    = req.params.id;
    const masjid_id = req.user.masjid_id;

    const employee = await EmployeeService.getEmployeeById(employee_id, masjid_id);

    const response = await EmployeeService.deleteEmployee(employee_id, masjid_id);

    if (!response) {
      return res.status(400).json({
        success: false,
        message: "Employee deletion failed",
      });
    }

    if (employee && employee.foto) {
      await deleteCloudinaryImage(employee.foto);
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

const getPublicIdFromUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    try {
      const regex = /\/(?:image|raw|video)\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
      const match = url.match(regex);
      
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting public_id from URL:', error);
      return null;
    }
};

const deleteCloudinaryImage = async (imageUrl) => {
    try {
      if (!imageUrl) return false;
      
      const publicId = getPublicIdFromUrl(imageUrl);
      if (!publicId) {
        console.warn(`Could not extract public_id from URL: ${imageUrl}`);
        return false;
      }
      
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted image from Cloudinary: ${publicId}`, result);
      return result.result === 'ok';
    } catch (error) {
      console.error(`Error deleting image from Cloudinary: ${imageUrl}`, error);
      return false;
    }
};