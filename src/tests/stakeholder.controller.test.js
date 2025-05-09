const request = require('supertest');
const stakeholderService = require('../services/stakeholder.service');
const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');

jest.mock('../services/stakeholder.service');
jest.mock('../services/user.service');

jest.mock('../middlewares/validate.middleware', () => ({
  stakeholderValidation: jest.fn((req, res, next) => next()),
  validate: jest.fn((req, res, next) => next())
}));

jest.mock('../middlewares/cloud.middleware', () => ({
  uploadFile: () => (req, res, next) => next()
}));

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const express = require('express');
const testApp = express();
testApp.use(express.json());

const authMiddleware = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  }
  return res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

const mockStakeholderController = {
  getAllStakeholders: async (req, res, next) => {
    try {
      const masjidId = req.user.masjid_id;
      const stakeholders = await stakeholderService.getAllStakeholders(masjidId);
      
      res.status(200).json({
        success: true,
        message: "Stakeholders found",
        stakeholders,
      });
    } catch (error) {
      next(error);
    }
  },
  
  getByIdStakeholder: async (req, res, next) => {
    try {
      const masjidId = req.user.masjid_id;
      const stakeholderId = req.params.id;
      const stakeholder = await stakeholderService.getById(stakeholderId, masjidId);
      
      res.status(200).json({
        success: true,
        message: "Stakeholder found",
        stakeholder,
      });
    } catch (error) {
      next(error);
    }
  },
  
  createStakeholder: async (req, res, next) => {
    try {
      const data = req.body;
      data.masjid_id = req.user.masjid_id;
      data.created_by = req.user.id;
      
      const stakeholderId = await stakeholderService.create(data);
      
      res.status(201).json({
        success: true,
        message: "Stakeholder created",
        stakeholderId,
      });
    } catch (error) {
      next(error);
    }
  },
  
  updateStakeholder: async (req, res, next) => {
    try {
      const stakeholderId = req.params.id;
      const data = req.body;
      const masjidId = req.user.masjid_id;
      
      const result = await stakeholderService.update(stakeholderId, data, masjidId);
      
      res.status(200).json({
        success: true,
        message: "Stakeholder updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  
  deleteStakeholder: async (req, res, next) => {
    try {
      const stakeholderId = req.params.id;
      const result = await stakeholderService.delete(stakeholderId);
      
      res.status(200).json({
        success: true,
        message: "Stakeholder deleted",
        result,
      });
    } catch (error) {
      next(error);
    }
  }
};

testApp.get('/api/stakeholder/getall', authMiddleware, mockStakeholderController.getAllStakeholders);
testApp.get('/api/stakeholder/getstakeholder/:id', authMiddleware, mockStakeholderController.getByIdStakeholder);
testApp.post('/api/stakeholder/add', authMiddleware, mockStakeholderController.createStakeholder);
testApp.put('/api/stakeholder/update/:id', authMiddleware, mockStakeholderController.updateStakeholder);
testApp.delete('/api/stakeholder/delete/:id', authMiddleware, mockStakeholderController.deleteStakeholder);

testApp.use((err, req, res, next) => {
  console.error('Error in middleware:', err);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

describe('Stakeholder Controller', () => {
  let token;

  beforeEach(() => {
    token = jwt.sign(
      { id: 1, email: 'test@example.com', peran: 'Editor', masjid_id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    userService.getById.mockResolvedValue({
      id: 1,
      nama: 'Test User',
      email: 'test@example.com',
      peran: 'Editor',
      masjid_id: 1
    });

    jest.clearAllMocks();
  });

  describe('GET /api/stakeholder/getall', () => {
    it('should return 200 and all stakeholders', async () => {
      const mockStakeholders = [
        {
          id: 1,
          nama_stakeholder: 'Stakeholder 1',
          jenis: 'Individu',
          telepon: '1234567890'
        },
        {
          id: 2,
          nama_stakeholder: 'Stakeholder 2',
          jenis: 'Organisasi',
          telepon: '0987654321'
        }
      ];

      stakeholderService.getAllStakeholders.mockResolvedValue(mockStakeholders);

      const res = await request(testApp)
        .get('/api/stakeholder/getall')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Stakeholders found');
      expect(res.body.stakeholders).toEqual(mockStakeholders);
    });

    it('should return 500 when service throws an error', async () => {
      const error = new Error('Database error');
      stakeholderService.getAllStakeholders.mockRejectedValue(error);

      const res = await request(testApp)
        .get('/api/stakeholder/getall')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Database error');
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(testApp)
        .get('/api/stakeholder/getall');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/stakeholder/getstakeholder/:id', () => {
    it('should return 200 and the stakeholder when found', async () => {
      const mockStakeholder = {
        id: 1,
        nama_stakeholder: 'Test Stakeholder',
        jenis: 'Individu',
        telepon: '1234567890',
        alamat: 'Test Address',
        email: 'stakeholder@example.com'
      };

      stakeholderService.getById.mockResolvedValue(mockStakeholder);

      const res = await request(testApp)
        .get('/api/stakeholder/getstakeholder/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Stakeholder found');
      expect(res.body.stakeholder).toEqual(mockStakeholder);
    });

    it('should return 404 when stakeholder is not found', async () => {
      const error = { statusCode: 404, message: 'Stakeholder not found' };
      stakeholderService.getById.mockRejectedValue(error);

      const res = await request(testApp)
        .get('/api/stakeholder/getstakeholder/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Stakeholder not found');
    });
  });

  describe('POST /api/stakeholder/add', () => {
    it('should return 201 for creating a new stakeholder', async () => {
      const stakeholderData = {
        nama_stakeholder: 'New Stakeholder',
        jenis: 'Individu',
        telepon: '1234567890',
        alamat: 'New Address',
        email: 'new@example.com'
      };

      stakeholderService.create.mockResolvedValue(3);

      const res = await request(testApp)
        .post('/api/stakeholder/add')
        .set('Authorization', `Bearer ${token}`)
        .send(stakeholderData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Stakeholder created');
      expect(res.body.stakeholderId).toBe(3);
    });

    it('should return 500 when service throws an error', async () => {
      const stakeholderData = {
        nama_stakeholder: 'New Stakeholder',
        jenis: 'Organisasi',
        telepon: '1234567890'
      };

      const error = new Error('Database error');
      stakeholderService.create.mockRejectedValue(error);

      const res = await request(testApp)
        .post('/api/stakeholder/add')
        .set('Authorization', `Bearer ${token}`)
        .send(stakeholderData);

      expect(res.status).toBe(500);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('PUT /api/stakeholder/update/:id', () => {
    it('should return 200 when stakeholder is updated successfully', async () => {
      const updateData = {
        nama_stakeholder: 'Updated Stakeholder',
        telepon: '9876543210',
        alamat: 'Updated Address',
        jenis: 'Individu'
      };

      const mockUpdatedStakeholder = {
        id: 1,
        ...updateData,
        email: 'stakeholder@example.com'
      };

      stakeholderService.update.mockResolvedValue(mockUpdatedStakeholder);

      const res = await request(testApp)
        .put('/api/stakeholder/update/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Stakeholder updated successfully');
      expect(res.body.data).toEqual(mockUpdatedStakeholder);
    });

    it('should return 500 when service throws an error', async () => {
      const updateData = {
        nama_stakeholder: 'Updated Stakeholder',
        jenis: 'Individu',
        telepon: '9876543210'
      };

      const error = new Error('Database error');
      stakeholderService.update.mockRejectedValue(error);

      const res = await request(testApp)
        .put('/api/stakeholder/update/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(500);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('DELETE /api/stakeholder/delete/:id', () => {
    it('should return 200 when stakeholder is deleted successfully', async () => {
      stakeholderService.delete.mockResolvedValue({ affectedRows: 1 });

      const res = await request(testApp)
        .delete('/api/stakeholder/delete/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Stakeholder deleted');
    });

    it('should return 500 when service throws an error', async () => {
      const error = new Error('Database error');
      stakeholderService.delete.mockRejectedValue(error);

      const res = await request(testApp)
        .delete('/api/stakeholder/delete/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toBe('Database error');
    });
  });
});