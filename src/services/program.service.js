const Program = require('../models/program.model');

class ProgramService {
  static async getAllPrograms(limit, offset, masjid_id, search, sortBy, sortOrder, statuses) {
    return await Program.getAll(limit, offset, masjid_id, search, sortBy, sortOrder, statuses);
  }
  
  static async countAllPrograms(masjid_id, search, statuses) {
    return await Program.countAll(masjid_id, search, statuses);
  }

  static async getProgramById(id, masjid_id) {
    return await Program.getById(id, masjid_id);
  }

  static async getProgramByIdAdmin(id) {
    return await Program.getByIdAdmin(id);
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

  static async hasViewerAccess(userId, masjidId) {
    return await Program.hasViewerAccess(userId, masjidId);
  }
}

module.exports = ProgramService;