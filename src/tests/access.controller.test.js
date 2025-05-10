const accessService = require('../services/access.service');
const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const express = require('express');
const request = require('supertest');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

jest.mock('../services/access.service');
jest.mock('../services/user.service');

const testApp = express();
testApp.use(express.json());

const authMiddleware = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
};

const isAdminMiddleware = (req, res, next) => {
  if (req.user && req.user.peran === 'Admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required'
    });
  }
};

const isEditorOfMasjidMiddleware = (req, res, next) => {
  const masjidId = parseInt(req.params.masjidId);
  if (req.user && (req.user.peran === 'Admin' || 
    (req.user.peran === 'Editor' && req.user.masjid_id === masjidId))) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. You do not have editor rights for this masjid'
    });
  }
};

const isApprovedEditorMiddleware = (req, res, next) => {
  if (req.user && req.user.peran === 'Editor' && 
      (!req.user.status || req.user.status === 'Approved')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Only approved editors can perform this action'
    });
  }
};

const mockAccessController = {
  getPendingEditors: async (req, res) => {
    try {
      const pendingEditors = await accessService.getPendingEditors();
      
      return res.status(200).json({
        success: true,
        message: 'Pending editors retrieved successfully',
        data: pendingEditors
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  approveEditor: async (req, res) => {
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
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  rejectEditor: async (req, res) => {
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
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  getApprovedViewers: async (req, res) => {
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
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  getPendingViewerRequests: async (req, res) => {
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
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  approveViewerRequest: async (req, res) => {
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
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  rejectViewerRequest: async (req, res) => {
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
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  removeViewerAccess: async (req, res) => {
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
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  requestViewerAccess: async (req, res) => {
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
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  getAccessibleMasjids: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const masjids = await accessService.getAccessibleMasjids(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Accessible masjids retrieved successfully',
        data: masjids
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  checkViewerAccess: async (req, res) => {
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
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  checkEditorAccess: async (req, res) => {
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
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  }
};

testApp.get('/api/access/editors/pending', authMiddleware, isAdminMiddleware, mockAccessController.getPendingEditors);
testApp.put('/api/access/editors/:editorId/approve', authMiddleware, isAdminMiddleware, mockAccessController.approveEditor);
testApp.put('/api/access/editors/:editorId/reject', authMiddleware, isAdminMiddleware, mockAccessController.rejectEditor);
testApp.get('/api/access/viewers/masjid/:masjidId', authMiddleware, isEditorOfMasjidMiddleware, mockAccessController.getApprovedViewers);
testApp.get('/api/access/viewers/pending/masjid/:masjidId', authMiddleware, isEditorOfMasjidMiddleware, mockAccessController.getPendingViewerRequests);
testApp.put('/api/access/viewers/:requestId/approve', authMiddleware, mockAccessController.approveViewerRequest);
testApp.put('/api/access/viewers/:requestId/reject', authMiddleware, mockAccessController.rejectViewerRequest);
testApp.delete('/api/access/viewers/:requestId', authMiddleware, mockAccessController.removeViewerAccess);
testApp.post('/api/access/viewers/request', authMiddleware, isApprovedEditorMiddleware, mockAccessController.requestViewerAccess);
testApp.get('/api/access/masjids', authMiddleware, mockAccessController.getAccessibleMasjids);
testApp.get('/api/access/check/viewer/:masjidId', authMiddleware, mockAccessController.checkViewerAccess);
testApp.get('/api/access/check/editor/:masjidId', authMiddleware, mockAccessController.checkEditorAccess);

describe('Access Controller', () => {
  let adminToken, editorToken, viewerToken;
  
  beforeEach(() => {
    adminToken = jwt.sign(
      { id: 1, email: 'admin@example.com', peran: 'Admin', masjid_id: null },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    editorToken = jwt.sign(
      { id: 2, email: 'editor@example.com', peran: 'Editor', masjid_id: 1, status: 'Approved' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    viewerToken = jwt.sign(
      { id: 3, email: 'viewer@example.com', peran: 'Viewer', masjid_id: null },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    userService.getById.mockImplementation(id => {
      const users = {
        1: {
          id: 1,
          nama: 'Admin User',
          email: 'admin@example.com',
          peran: 'Admin',
          masjid_id: null
        },
        2: {
          id: 2,
          nama: 'Editor User',
          email: 'editor@example.com',
          peran: 'Editor',
          masjid_id: 1,
          status: 'Approved'
        },
        3: {
          id: 3,
          nama: 'Viewer User',
          email: 'viewer@example.com',
          peran: 'Viewer',
          masjid_id: null
        }
      };
      
      return Promise.resolve(users[id] || null);
    });
    
    jest.clearAllMocks();
  });

  describe('GET /api/access/editors/pending', () => {
    it('should return 200 and pending editors for admin', async () => {
      const mockPendingEditors = [
        {
          id: 4,
          nama: 'Pending Editor 1',
          email: 'pending1@example.com',
          peran: 'Editor',
          status: 'Pending',
          masjid_id: 1,
          nama_masjid: 'Masjid 1'
        },
        {
          id: 5,
          nama: 'Pending Editor 2',
          email: 'pending2@example.com',
          peran: 'Editor',
          status: 'Pending',
          masjid_id: 2,
          nama_masjid: 'Masjid 2'
        }
      ];

      accessService.getPendingEditors.mockResolvedValue(mockPendingEditors);

      const res = await request(testApp)
        .get('/api/access/editors/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Pending editors retrieved successfully');
      expect(res.body.data).toEqual(mockPendingEditors);
    });

    it('should return 403 for non-admin users', async () => {
      const res = await request(testApp)
        .get('/api/access/editors/pending')
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Access denied. Admin privileges required');
    });
  });

  describe('PUT /api/access/editors/:editorId/approve', () => {
    it('should return 200 when editor is approved successfully', async () => {
      const mockEditor = {
        id: 4,
        nama: 'Approved Editor',
        status: 'Approved'
      };

      accessService.approveEditor.mockResolvedValue(mockEditor);

      const res = await request(testApp)
        .put('/api/access/editors/4/approve')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Editor approved successfully');
      expect(res.body.data).toEqual(mockEditor);
    });

    it('should return 403 for non-admin users', async () => {
      const res = await request(testApp)
        .put('/api/access/editors/4/approve')
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/access/editors/:editorId/reject', () => {
    it('should return 200 when editor is rejected successfully', async () => {
      const mockEditor = {
        id: 4,
        nama: 'Rejected Editor',
        status: 'Rejected'
      };

      accessService.rejectEditor.mockResolvedValue(mockEditor);

      const res = await request(testApp)
        .put('/api/access/editors/4/reject')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Editor rejected successfully');
      expect(res.body.data).toEqual(mockEditor);
    });
  });

  describe('GET /api/access/viewers/masjid/:masjidId', () => {
    it('should return 200 and approved viewers for a masjid', async () => {
      const mockViewers = [
        {
          id: 1,
          viewer_nama: 'Viewer 1',
          viewer_email: 'viewer1@example.com',
          status: 'Approved',
          expires_at: '2026-01-01'
        },
        {
          id: 2,
          viewer_nama: 'Viewer 2',
          viewer_email: 'viewer2@example.com',
          status: 'Approved',
          expires_at: '2026-02-01'
        }
      ];

      accessService.getApprovedViewers.mockResolvedValue(mockViewers);

      const res = await request(testApp)
        .get('/api/access/viewers/masjid/1')
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Approved viewers retrieved successfully');
      expect(res.body.data).toEqual(mockViewers);
    });
  });

  describe('POST /api/access/viewers/request', () => {
    it('should return 200 when viewer access request is submitted successfully', async () => {
      const requestData = {
        masjidId: 2
      };

      accessService.requestViewerAccess.mockResolvedValue(true);

      const res = await request(testApp)
        .post('/api/access/viewers/request')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(requestData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Viewer access request submitted successfully');
    });

    it('should return 400 when masjid ID is not provided', async () => {
      const invalidData = {
      };

      const res = await request(testApp)
        .post('/api/access/viewers/request')
        .set('Authorization', `Bearer ${editorToken}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Masjid ID is required');
    });
  });

  describe('GET /api/access/masjids', () => {
    it('should return 200 and accessible masjids for a user', async () => {
      const mockMasjids = [
        {
          id: 1,
          nama_masjid: 'Masjid 1',
          alamat: 'Address 1',
          access_type: 'Editor'
        },
        {
          id: 2,
          nama_masjid: 'Masjid 2',
          alamat: 'Address 2',
          access_type: 'Viewer'
        }
      ];

      accessService.getAccessibleMasjids.mockResolvedValue(mockMasjids);

      const res = await request(testApp)
        .get('/api/access/masjids')
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Accessible masjids retrieved successfully');
      expect(res.body.data).toEqual(mockMasjids);
    });
  });

  describe('GET /api/access/check/viewer/:masjidId', () => {
    it('should return 200 and true when user has viewer access', async () => {
      accessService.hasViewerAccess.mockResolvedValue(true);

      const res = await request(testApp)
        .get('/api/access/check/viewer/2')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.hasAccess).toBe(true);
    });

    it('should return 200 and false when user does not have viewer access', async () => {
      accessService.hasViewerAccess.mockResolvedValue(false);

      const res = await request(testApp)
        .get('/api/access/check/viewer/3')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.hasAccess).toBe(false);
    });
  });

  describe('GET /api/access/check/editor/:masjidId', () => {
    it('should return 200 and true when user has editor access', async () => {
      accessService.hasEditorAccess.mockResolvedValue(true);

      const res = await request(testApp)
        .get('/api/access/check/editor/1')
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.hasAccess).toBe(true);
    });

    it('should return 200 and false when user does not have editor access', async () => {
      accessService.hasEditorAccess.mockResolvedValue(false);

      const res = await request(testApp)
        .get('/api/access/check/editor/2')
        .set('Authorization', `Bearer ${editorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.hasAccess).toBe(false);
    });
  });
});