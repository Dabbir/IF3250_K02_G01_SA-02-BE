const Employee = require('../models/employee.model');

class EmployeeService {
  static async getAllEmployee(masjid_id) {
    return await Employee.getAll(masjid_id);
  }

  static async getEmployeesPaginated(limit, offset, masjid_id) {
    return await Employee.getPaginated(limit, offset, masjid_id);
  }

  static async countAllEmployees(masjid_id) {
    return await Employee.countAll(masjid_id);
  }

  static async getEmployeeById(id, masjid_id) {
    return await Employee.getById(id, masjid_id);
  }

  static async createEmployee(data) {
    return await Employee.create(data);
  }

  static async updateEmployee(id, data, masjid_id) {
    return await Employee.update(id, data, masjid_id);
  }

  static async deleteEmployee(id, masjid_id) {
    return await Employee.delete(id, masjid_id);
  }
}

module.exports = EmployeeService;
