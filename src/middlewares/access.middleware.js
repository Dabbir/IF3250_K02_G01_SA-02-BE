const accessService = require('../services/access.service');
const userService = require('../services/user.service');
const { logger } = require('../utils/logger');

exports.isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.peran !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required'
      });
    }

    next();
  } catch (error) {
    logger.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during permission check'
    });
  }
};

exports.isEditorOfMasjid = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const masjidId = parseInt(req.params.masjidId || req.body.masjidId || req.query.masjidId);
    
    if (!masjidId) {
      return res.status(400).json({
        success: false,
        message: 'Masjid ID is required'
      });
    }

    const hasAccess = await accessService.hasEditorAccess(req.user.id, masjidId);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have editor rights for this masjid'
      });
    }

    next();
  } catch (error) {
    logger.error('Editor check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during permission check'
    });
  }
};

exports.hasViewerAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const masjidId = parseInt(req.params.masjidId || req.body.masjidId || req.query.masjidId);
    
    if (!masjidId) {
      return res.status(400).json({
        success: false,
        message: 'Masjid ID is required'
      });
    }

    const hasAccess = await accessService.hasViewerAccess(req.user.id, masjidId);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have viewer access to this masjid'
      });
    }

    next();
  } catch (error) {
    logger.error('Viewer access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during permission check'
    });
  }
};

exports.hasAnyAccessToMasjid = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const masjidId = parseInt(req.params.masjidId || req.body.masjidId || req.query.masjidId);
    
    if (!masjidId) {
      return res.status(400).json({
        success: false,
        message: 'Masjid ID is required'
      });
    }

    const hasAccess = await accessService.hasViewerAccess(req.user.id, masjidId);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have access to this masjid'
      });
    }

    next();
  } catch (error) {
    logger.error('Masjid access check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during permission check'
    });
  }
};

exports.isPendingEditor = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await userService.getById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.peran === 'Editor' && user.status === 'Pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval by an administrator'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Pending editor check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during permission check'
    });
  }
};

exports.isApprovedEditor = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await userService.getById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.peran !== 'Editor' || user.status !== 'Approved') {
      return res.status(403).json({
        success: false,
        message: 'Only approved editors can perform this action'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Approved editor check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during permission check'
    });
  }
};