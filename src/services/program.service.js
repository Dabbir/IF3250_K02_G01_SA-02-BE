const Program = require('../models/program.model');

class ProgramService {
  static async getAllProgram() {
    return await Program.getAll();
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