const Program = require('../models/program.model');

class ProgramService {
  static async getAllProgram() {
    return await Program.getAll();
  }

  static async getProgramsPaginated(limit, offset) {
    return await Program.getPaginated(limit, offset);
  }
  
  static async countAllPrograms() {
    return await Program.countAll();
  }

  static async getProgramById(id) {
    return await Program.getById(id);
  }

  static async createProgram(data) {
    return await Program.create(data);
  }

  static async updateProgram(id, data) {
    return await Program.update(id, data);
  }

  static async deleteProgram(id) {
    return await Program.delete(id);
  }
}

module.exports = ProgramService;