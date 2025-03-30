const Program = require('../models/program.model');

class ProgramService {
  static async getAllProgram(masjid_id) {
    return await Program.getAll(masjid_id);
  }

  static async getProgramsPaginated(limit, offset, masjid_id) {
    return await Program.getPaginated(limit, offset, masjid_id);
  }
  
  static async countAllPrograms(masjid_id) {
    return await Program.countAll(masjid_id);
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