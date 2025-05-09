const Publication = require('../models/publication.model');

class PublicationService {
  static async getAllPublications() {
    return await Publication.getAll();
  }

  static async getPaginatedPublications(page, limit, search, sortBy, sortOrder, filters) {
    const offset = (page - 1) * limit;
    
    return await Publication.getPaginated(
      page, 
      limit, 
      offset, 
      search, 
      sortBy, 
      sortOrder, 
      filters
    );
  }

  static async getPublicationById(id) {
    return await Publication.getById(id);
  }

  static async createPublication(data) {
    return await Publication.create(data);
  }

  static async updatePublication(id, data) {
    return await Publication.update(id, data);
  }

  static async deletePublication(id) {
    return await Publication.delete(id);
  }
  
  static async getFilterOptions() {
    return await Publication.getFilterOptions();
  }
}

module.exports = PublicationService;