const beneficiaryModel = require('../models/beneficiary.model');
const fs = require("fs");
const path = require("path");

exports.getBeneficiaryById = async (id) => {
  try {
    const beneficiary = await beneficiaryModel.findById(id);

    if (!beneficiary) {
      const error = new Error("Beneficiary not found");
      error.statusCode = 404;
      throw error;
    }

    return beneficiary;
  } catch (error) {
    throw error;
  }
};

exports.getAllBeneficiaries = async (params = {}) => {
  try {
    const beneficiaries = await beneficiaryModel.findAll(params);
    const total = await beneficiaryModel.getTotalCount(params);
    
    return {
      data: beneficiaries,
      pagination: {
        total,
        page: parseInt(params.page) || 1,
        limit: parseInt(params.limit) || 10,
        totalPages: Math.ceil(total / (parseInt(params.limit) || 10))
      }
    };
  } catch (error) {
    throw error;
  }
};

exports.createBeneficiary = async (beneficiaryData) => {
  try {
    return await beneficiaryModel.create(beneficiaryData);
  } catch (error) {
    throw error;
  }
};

exports.updateBeneficiary = async (id, beneficiaryData) => {
  try {
    const beneficiary = await beneficiaryModel.findById(id);

    if (!beneficiary) {
      const error = new Error("Beneficiary not found");
      error.statusCode = 404;
      throw error;
    }

    // If there's a new photo and an old one exists, delete the old one
    if (beneficiaryData.foto && beneficiary.foto && beneficiaryData.foto !== beneficiary.foto) {
      try {
        const oldPhotoFilename = beneficiary.foto.split("/").pop();
        const oldPhotoPath = path.join(__dirname, "../uploads/", oldPhotoFilename);
        
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
          console.log(`Deleted old photo: ${oldPhotoPath}`);
        }
      } catch (err) {
        console.warn(`Failed to delete old photo: ${err.message}`);
      }
    }

    const updatedBeneficiary = await beneficiaryModel.update(id, beneficiaryData);
    return updatedBeneficiary;
  } catch (error) {
    throw error;
  }
};

exports.deleteBeneficiary = async (id) => {
  try {
    const beneficiary = await beneficiaryModel.findById(id);

    if (!beneficiary) {
      const error = new Error("Beneficiary not found");
      error.statusCode = 404;
      throw error;
    }

    // Delete the beneficiary's photo if it exists
    if (beneficiary.foto) {
      try {
        const photoFilename = beneficiary.foto.split("/").pop();
        const photoPath = path.join(__dirname, "../uploads/", photoFilename);
        
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
          console.log(`Deleted photo: ${photoPath}`);
        }
      } catch (err) {
        console.warn(`Failed to delete photo: ${err.message}`);
      }
    }

    return await beneficiaryModel.delete(id);
  } catch (error) {
    throw error;
  }
};

exports.getBeneficiariesByAktivitas = async (aktivitasId) => {
  try {
    return await beneficiaryModel.getByActivities(aktivitasId);
  } catch (error) {
    throw error;
  }
};