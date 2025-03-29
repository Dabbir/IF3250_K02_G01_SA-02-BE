const masjidModel = require('../models/masjid.model');
const { logger } = require('../utils/logger');

exports.getAllMasjids = async () => {
  try {
    const masjids = await masjidModel.findAll();
    return masjids;
  } catch (error) {
    logger.error('Error in getAllMasjids:', error);
    throw error;
  }
};

exports.getMasjidById = async (id) => {
  try {
    const masjid = await masjidModel.findById(id);
    if (!masjid) {
      const error = new Error("Masjid not found");
      error.statusCode = 404;
      throw error;
    }
    return masjid;
  } catch (error) {
    logger.error('Error in getMasjidById:', error);
    throw error;
  }
};

exports.searchMasjidsByName = async (name) => {
  try {
    const masjids = await masjidModel.findByNama(name);
    return masjids;
  } catch (error) {
    logger.error('Error in searchMasjidsByName:', error);
    throw error;
  }
};

exports.createMasjid = async (masjidData) => {
  try {
    const id = await masjidModel.create(masjidData);
    const masjid = await masjidModel.findById(id);
    return masjid;
  } catch (error) {
    logger.error('Error in createMasjid:', error);
    throw error;
  }
};

exports.updateMasjid = async (id, masjidData) => {
  try {
    const success = await masjidModel.update(id, masjidData);
    if (!success) {
      const error = new Error("Masjid not found or no changes made");
      error.statusCode = 404;
      throw error;
    }
    const masjid = await masjidModel.findById(id);
    return masjid;
  } catch (error) {
    logger.error('Error in updateMasjid:', error);
    throw error;
  }
};

exports.deleteMasjid = async (id) => {
  try {
    const success = await masjidModel.delete(id);
    if (!success) {
      const error = new Error("Masjid not found");
      error.statusCode = 404;
      throw error;
    }
    return { success: true };
  } catch (error) {
    logger.error('Error in deleteMasjid:', error);
    throw error;
  }
};