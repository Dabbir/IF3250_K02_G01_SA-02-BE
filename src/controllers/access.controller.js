const accessService = require('../services/access.service');
const { logger } = require('../utils/logger');

exports.getPendingEditors = async (req, res) => {
  try {
    const pendingEditors = await accessService.getPendingEditors();
    
    return res.status(200).json({
      success: true,
      message: 'Pending editors retrieved successfully',
      data: pendingEditors
    });
  } catch (error) {
    logger.error('Get pending editors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.approveEditor = async (req, res) => {
  try {
    const { editorId } = req.params;
    
    if (!editorId) {
      return res.status(400).json({
        success: false,
        message: 'Editor ID is required'
      });
    }
    
    const editor = await accessService.approveEditor(editorId);
    
    return res.status(200).json({
      success: true,
      message: 'Editor approved successfully',
      data: editor
    });
  } catch (error) {
    logger.error('Approve editor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.rejectEditor = async (req, res) => {
  try {
    const { editorId } = req.params;
    
    if (!editorId) {
      return res.status(400).json({
        success: false,
        message: 'Editor ID is required'
      });
    }
    
    const editor = await accessService.rejectEditor(editorId);
    
    return res.status(200).json({
      success: true,
      message: 'Editor rejected successfully',
      data: editor
    });
  } catch (error) {
    logger.error('Reject editor error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.requestViewerAccess = async (req, res) => {
  try {
    const { masjidId } = req.body;
    
    if (!masjidId) {
      return res.status(400).json({
        success: false,
        message: 'Masjid ID is required'
      });
    }
    
    await accessService.requestViewerAccess(req.user.id, masjidId);
    
    return res.status(200).json({
      success: true,
      message: 'Viewer access request submitted successfully'
    });
  } catch (error) {
    logger.error('Request viewer access error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getPendingViewerRequests = async (req, res) => {
  try {
    const { masjidId } = req.params;
    
    if (!masjidId) {
      return res.status(400).json({
        success: false,
        message: 'Masjid ID is required'
      });
    }
    
    const requests = await accessService.getPendingViewerRequests(masjidId);
    
    return res.status(200).json({
      success: true,
      message: 'Pending viewer requests retrieved successfully',
      data: requests
    });
  } catch (error) {
    logger.error('Get pending viewer requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.approveViewerRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }
    
    const result = await accessService.approveViewerRequest(requestId, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'Viewer access request approved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Approve viewer request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.rejectViewerRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }
    
    const result = await accessService.rejectViewerRequest(requestId, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'Viewer access request rejected successfully',
      data: result
    });
  } catch (error) {
    logger.error('Reject viewer request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getApprovedViewers = async (req, res) => {
  try {
    const { masjidId } = req.params;
    
    if (!masjidId) {
      return res.status(400).json({
        success: false,
        message: 'Masjid ID is required'
      });
    }
    
    const viewers = await accessService.getApprovedViewers(masjidId);
    
    return res.status(200).json({
      success: true,
      message: 'Approved viewers retrieved successfully',
      data: viewers
    });
  } catch (error) {
    logger.error('Get approved viewers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.removeViewerAccess = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }
    
    const result = await accessService.removeViewerAccess(requestId);
    
    return res.status(200).json({
      success: true,
      message: 'Viewer access removed successfully',
      data: result
    });
  } catch (error) {
    logger.error('Remove viewer access error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getAccessibleMasjids = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const masjids = await accessService.getAccessibleMasjids(userId);
    
    return res.status(200).json({
      success: true,
      message: 'Accessible masjids retrieved successfully',
      data: masjids
    });
  } catch (error) {
    logger.error('Get accessible masjids error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.checkViewerAccess = async (req, res) => {
  try {
    const { masjidId } = req.params;
    
    if (!masjidId) {
      return res.status(400).json({
        success: false,
        message: 'Masjid ID is required'
      });
    }
    
    const hasAccess = await accessService.hasViewerAccess(req.user.id, masjidId);
    
    return res.status(200).json({
      success: true,
      hasAccess
    });
  } catch (error) {
    logger.error('Check viewer access error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.checkEditorAccess = async (req, res) => {
  try {
    const { masjidId } = req.params;
    
    if (!masjidId) {
      return res.status(400).json({
        success: false,
        message: 'Masjid ID is required'
      });
    }
    
    const hasAccess = await accessService.hasEditorAccess(req.user.id, masjidId);
    
    return res.status(200).json({
      success: true,
      hasAccess
    });
  } catch (error) {
    logger.error('Check editor access error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};