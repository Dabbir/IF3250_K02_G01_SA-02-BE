const Beneficiary = require('../models/beneficiary.model');

class BeneficiaryService {
  static async createBeneficiary(beneficiaryData) {
    try {
      return await Beneficiary.create(beneficiaryData);
    } catch (error) {
      throw error;
    }
  }

  static async getAllBeneficiaries(params) {
    try {
      const beneficiaries = await Beneficiary.getAll(params);
      const total = await Beneficiary.getTotalCount(params);
      
      const totalPages = Math.ceil(total / params.limit);
      
      return {
        data: beneficiaries,
        pagination: {
          total,
          page: params.page,
          limit: params.limit,
          totalPages
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async getBeneficiaryById(id) {
    try {
      return await Beneficiary.findById(id);
    } catch (error) {
      throw error;
    }
  }

  static async updateBeneficiary(id, beneficiaryData) {
    try {
      return await Beneficiary.update(id, beneficiaryData);
    } catch (error) {
      throw error;
    }
  }

  static async deleteBeneficiary(id) {
    try {
      return await Beneficiary.remove(id);
    } catch (error) {
      throw error;
    }
  }

  static async getBeneficiariesByAktivitas(aktivitasId) {
    try {
      return await Beneficiary.getByActivities(aktivitasId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BeneficiaryService;