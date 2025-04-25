const Publikasi = require('../models/publikasi.model');

class PublikasiService {
  static async getAllPublikasi() {
    return await Publikasi.getAll();
  }

  static async getPaginatedPublikasi(page, limit, search, sortBy, sortOrder, toneFilters) {
    const offset = (page - 1) * limit;
    
    return await Publikasi.getPaginated(
      page, 
      limit, 
      offset, 
      search, 
      sortBy, 
      sortOrder, 
      toneFilters
    );
  }

  static async getPublikasiById(id) {
    return await Publikasi.getById(id);
  }

  static async createPublikasi(data) {
    return await Publikasi.create(data);
  }

  static async updatePublikasi(id, data) {
    return await Publikasi.update(id, data);
  }

  static async deletePublikasi(id) {
    return await Publikasi.delete(id);
  }
}

module.exports = PublikasiService;