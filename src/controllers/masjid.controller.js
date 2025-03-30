const masjidService = require('../services/masjid.service');
const { logger } = require('../utils/logger');

exports.getAllMasjids = async (req, res) => {
  try {
    const masjids = await masjidService.getAllMasjids();
    
    return res.status(200).json({
      success: true,
      message: 'Masjids retrieved successfully',
      data: masjids
    });
  } catch (error) {
    logger.error('Get all masjids error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getMasjidById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Masjid ID is required'
      });
    }
    
    const masjid = await masjidService.getMasjidById(id);
    
    return res.status(200).json({
      success: true,
      message: 'Masjid retrieved successfully',
      data: masjid
    });
  } catch (error) {
    logger.error('Get masjid by id error:', error);
    
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.searchMasjids = async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name parameter is required for search'
      });
    }
    
    const masjids = await masjidService.searchMasjidsByName(name);
    
    return res.status(200).json({
      success: true,
      message: 'Masjids search completed successfully',
      data: masjids
    });
  } catch (error) {
    logger.error('Search masjids error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.createMasjid = async (req, res) => {
  try {
    const masjidData = req.body;
    
    if (!masjidData.nama_masjid || !masjidData.alamat) {
      return res.status(400).json({
        success: false,
        message: 'Nama masjid and alamat are required'
      });
    }
    
    const masjid = await masjidService.createMasjid(masjidData);
    
    return res.status(201).json({
      success: true,
      message: 'Masjid created successfully',
      data: masjid
    });
  } catch (error) {
    logger.error('Create masjid error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.updateMasjid = async (req, res) => {
  try {
    const { id } = req.params;
    const masjidData = req.body;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Masjid ID is required'
      });
    }
    
    const masjid = await masjidService.updateMasjid(id, masjidData);
    
    return res.status(200).json({
      success: true,
      message: 'Masjid updated successfully',
      data: masjid
    });
  } catch (error) {
    logger.error('Update masjid error:', error);
    
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.deleteMasjid = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Masjid ID is required'
      });
    }
    
    await masjidService.deleteMasjid(id);
    
    return res.status(200).json({
      success: true,
      message: 'Masjid deleted successfully'
    });
  } catch (error) {
    logger.error('Delete masjid error:', error);
    
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};