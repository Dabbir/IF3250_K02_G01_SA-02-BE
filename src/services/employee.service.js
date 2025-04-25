const Employee = require("../models/employee.model");

class EmployeeService {
  static async getAllEmployees(limit, offset, masjid_id, search, sortBy, sortOrder, working) {
    return Employee.getAll(limit, offset, masjid_id, search, sortBy, sortOrder, working);
  }

  static async countAllEmployees(masjid_id, search, working) {
    return Employee.countAll(masjid_id, search, working);
  }

  static async getEmployeeById(id, masjid_id) {
    return Employee.getById(id, masjid_id);
  }

  static async createEmployee(data) {
    return Employee.create(data);
  }

  static async updateEmployee(id, data, masjid_id) {
    return Employee.update(id, data, masjid_id);
  }

  static async deleteEmployee(id, masjid_id) {
    return Employee.delete(id, masjid_id);
  }
}

module.exports = EmployeeService;