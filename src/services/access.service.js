const accessModel = require('../models/access.model');
const userService = require('./user.service');
const logger = require('../utils/logger');

exports.getPendingEditors = async () => {
  try {
    return await accessModel.getPendingEditors();
  } catch (error) {
    logger.error('Error in getPendingEditors:', error);
    throw error;
  }
};

exports.approveEditor = async (editorId) => {
  try {
    const success = await accessModel.updateUserStatus(editorId, 'Approved');
    if (!success) {
      throw new Error('Failed to approve editor or editor not found');
    }
    
    const editor = await userService.getById(editorId);
    return editor;
  } catch (error) {
    logger.error('Error in approveEditor:', error);
    throw error;
  }
};

exports.rejectEditor = async (editorId) => {
  try {
    const success = await accessModel.updateUserStatus(editorId, 'Rejected');
    if (!success) {
      throw new Error('Failed to reject editor or editor not found');
    }
    
    const editor = await userService.getById(editorId);
    return editor;
  } catch (error) {
    logger.error('Error in rejectEditor:', error);
    throw error;
  }
};

exports.requestViewerAccess = async (viewerId, masjidId) => {
  try {
    const user = await userService.getById(viewerId);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.peran !== 'Editor' || user.status !== 'Approved') {
      throw new Error('Only approved editors can request viewer access');
    }
    
    if (user.masjid_id === parseInt(masjidId)) {
      throw new Error('You already have editor access to this masjid');
    }
    
    return await accessModel.requestViewerAccess(viewerId, masjidId);
  } catch (error) {
    logger.error('Error in requestViewerAccess:', error);
    throw error;
  }
};

exports.getPendingViewerRequests = async (masjidId) => {
  try {
    return await accessModel.getPendingViewerRequests(masjidId);
  } catch (error) {
    logger.error('Error in getPendingViewerRequests:', error);
    throw error;
  }
};

exports.approveViewerRequest = async (requestId, editorId) => {
  try {
    const success = await accessModel.updateViewerAccessStatus(requestId, editorId, 'Approved');
    if (!success) {
      throw new Error('Failed to approve viewer request or request not found');
    }
    
    return { success: true, message: 'Viewer access request approved successfully' };
  } catch (error) {
    logger.error('Error in approveViewerRequest:', error);
    throw error;
  }
};

exports.rejectViewerRequest = async (requestId, editorId) => {
  try {
    const success = await accessModel.updateViewerAccessStatus(requestId, editorId, 'Rejected');
    if (!success) {
      throw new Error('Failed to reject viewer request or request not found');
    }
    
    return { success: true, message: 'Viewer access request rejected successfully' };
  } catch (error) {
    logger.error('Error in rejectViewerRequest:', error);
    throw error;
  }
};

exports.getApprovedViewers = async (masjidId) => {
  try {
    return await accessModel.getApprovedViewers(masjidId);
  } catch (error) {
    logger.error('Error in getApprovedViewers:', error);
    throw error;
  }
};

exports.removeViewerAccess = async (requestId) => {
  try {
    const success = await accessModel.removeViewerAccess(requestId);
    if (!success) {
      throw new Error('Failed to remove viewer access or access record not found');
    }
    
    return { success: true, message: 'Viewer access removed successfully' };
  } catch (error) {
    logger.error('Error in removeViewerAccess:', error);
    throw error;
  }
};

exports.hasViewerAccess = async (userId, masjidId) => {
  try {
    return await accessModel.hasViewerAccess(userId, masjidId);
  } catch (error) {
    logger.error('Error in hasViewerAccess:', error);
    throw error;
  }
};

exports.hasEditorAccess = async (userId, masjidId) => {
  try {
    return await accessModel.hasEditorAccess(userId, masjidId);
  } catch (error) {
    logger.error('Error in hasEditorAccess:', error);
    throw error;
  }
};

exports.getAccessibleMasjids = async (userId) => {
  try {
    return await accessModel.getAccessibleMasjids(userId);
  } catch (error) {
    logger.error('Error in getAccessibleMasjids:', error);
    throw error;
  }
};