const beneficiaryModel = require('../models/beneficiary.model');
const cloudinary = require('../config/cloudinary.config');

exports.getBeneficiaryById = async (id, userMasjidId) => {
  try {
    const beneficiary = await beneficiaryModel.findById(id);

    if (!beneficiary) {
      const error = new Error("Beneficiary not found");
      error.statusCode = 404;
      throw error;
    }

    if (beneficiary.masjid_id !== userMasjidId) {
      const error = new Error("You are not authorized to view this beneficiary");
      error.statusCode = 403;
      throw error;
    }

    return beneficiary;
  } catch (error) {
    throw error;
  }
};

exports.getAllBeneficiaries = async (params = {}, userMasjidId) => {
  try {
    if (!params.limit) params.limit = 10;
    
    params.masjid_id = userMasjidId;
    
    const beneficiaries = await beneficiaryModel.findAll(params);
    const total = await beneficiaryModel.getTotalCount(params);
    
    return {
      data: beneficiaries,
      pagination: {
        total,
        page: parseInt(params.page) || 1,
        limit: parseInt(params.limit),
        totalPages: Math.ceil(total / parseInt(params.limit))
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

exports.updateBeneficiary = async (id, beneficiaryData, userMasjidId) => {
  try {
    const beneficiary = await beneficiaryModel.findById(id);

    if (!beneficiary) {
      const error = new Error("Beneficiary not found");
      error.statusCode = 404;
      throw error;
    }

    if (beneficiary.masjid_id !== userMasjidId) {
      const error = new Error("You are not authorized to update this beneficiary");
      error.statusCode = 403;
      throw error;
    }

    if (beneficiaryData.foto && beneficiary.foto && beneficiaryData.foto !== beneficiary.foto) {
      try {
        const publicId = getPublicIdFromUrl(beneficiary.foto);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted old photo from Cloudinary: ${publicId}`);
        }
      } catch (err) {
        console.warn(`Failed to delete old photo from Cloudinary: ${err.message}`);
      }
    }

    const updatedBeneficiary = await beneficiaryModel.update(id, beneficiaryData);
    return updatedBeneficiary;
  } catch (error) {
    throw error;
  }
};

exports.deleteBeneficiary = async (id, userMasjidId) => {
  try {
    const beneficiary = await beneficiaryModel.findById(id);

    if (!beneficiary) {
      const error = new Error("Beneficiary not found");
      error.statusCode = 404;
      throw error;
    }

    if (beneficiary.masjid_id !== userMasjidId) {
      const error = new Error("You are not authorized to delete this beneficiary");
      error.statusCode = 403;
      throw error;
    }

    if (beneficiary.foto) {
      try {
        const publicId = getPublicIdFromUrl(beneficiary.foto);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted photo from Cloudinary: ${publicId}`);
        }
      } catch (err) {
        console.warn(`Failed to delete photo from Cloudinary: ${err.message}`);
      }
    }

    return await beneficiaryModel.delete(id);
  } catch (error) {
    throw error;
  }
};

exports.getBeneficiariesByAktivitas = async (aktivitasId, userMasjidId) => {
  try {
    const beneficiaries = await beneficiaryModel.getByActivities(aktivitasId);
    
    const filteredBeneficiaries = beneficiaries.filter(b => b.masjid_id === userMasjidId);
    
    return filteredBeneficiaries;
  } catch (error) {
    throw error;
  }
};

function getPublicIdFromUrl(url) {
  if (!url) return null;
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    
    const relevantParts = parts.slice(uploadIndex + 2);
    
    const publicId = relevantParts.join('/').replace(/\.\w+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
}