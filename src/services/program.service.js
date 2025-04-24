const Program = require('../models/program.model');

class ProgramService {
  static async getAllPrograms(limit, offset, masjid_id, search, sortBy, sortOrder) {
    return await Program.getAll(limit, offset, masjid_id, search, sortBy, sortOrder);
  }
  
  static async countAllPrograms(masjid_id, search) {
    return await Program.countAll(masjid_id, search);
  }

  static async getProgramById(id, masjid_id) {
    return await Program.getById(id, masjid_id);
  }

  static async createProgram(data) {
    return await Program.create(data);
  }

  static async updateProgram(id, data, masjid_id) {
    return await Program.update(id, data, masjid_id);
  }

  static async deleteProgram(id, masjid_id) {
    return await Program.delete(id, masjid_id);
  }
}

module.exports = ProgramService;