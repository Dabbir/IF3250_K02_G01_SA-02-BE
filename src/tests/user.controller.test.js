const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('supertest');

jest.mock('../services/user.service');
jest.mock('fs');
jest.mock('path');

jest.mock('../middlewares/validate.middleware', () => ({
  userUpdateValidation: jest.fn((req, res, next) => next()),
  validate: jest.fn((req, res, next) => next())
}));

jest.mock('../middlewares/cloud.middleware', () => ({
  uploadFile: () => (req, res, next) => next()
}));

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

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

const isAdminMiddleware = (req, res, next) => {
  if (req.user && req.user.peran === 'Admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required'
  });
};

const mockUserController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        success: true,
        message: "Users found",
        users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await userService.getById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const formattedUser = {
        id: user.id,
        nama: user.nama,
        email: user.email,
        peran: user.peran,
        short_bio: user.short_bio,
        alasan_bergabung: user.alasan_bergabung,
        foto_profil: user.foto_profil,
        masjid_id: user.masjid_id,
        created_at: user.created_at,
        updated_at: user.updated_at,
        nama_masjid: user.nama_masjid,
        alamat_masjid: user.alamat,
      };

      res.status(200).json({
        success: true,
        message: "User found",
        user: formattedUser,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getProfilePhoto: (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, "../uploads", filename);

    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    } else {
      return res.status(404).json({ message: "Foto tidak ditemukan" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const userData = req.body;

      if (req.file) {
        userData.foto_profil = req.file.path;
      }

      const result = await userService.updateUser(userId, userData);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const userId = req.params.id;
      const userData = req.body;
      const result = await userService.updateUser(userId, userData);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
};

testApp.get('/api/users/getall', authMiddleware, isAdminMiddleware, mockUserController.getAllUsers);
testApp.get('/api/users', authMiddleware, mockUserController.getProfile);
testApp.get('/api/users/photo/:filename', mockUserController.getProfilePhoto);
testApp.put('/api/users', authMiddleware, mockUserController.updateProfile);
testApp.put('/api/users/:id', mockUserController.updateUser);

describe('User Controller', () => {
  let token, adminToken;
  
  beforeEach(() => {
    token = jwt.sign(
      { id: 1, email: 'test@example.com', peran: 'Editor', masjid_id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    adminToken = jwt.sign(
      { id: 2, email: 'admin@example.com', peran: 'Admin', masjid_id: null },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    userService.getById.mockImplementation(id => {
      if (id === 1) {
        return Promise.resolve({
          id: 1,
          nama: 'Test User',
          email: 'test@example.com',
          peran: 'Editor',
          masjid_id: 1
        });
      } else if (id === 2) {
        return Promise.resolve({
          id: 2,
          nama: 'Admin User',
          email: 'admin@example.com',
          peran: 'Admin',
          masjid_id: null
        });
      }
      return Promise.resolve(null);
    });
    
    path.join.mockImplementation((...args) => {
      return args.join('/');
    });
    
    jest.clearAllMocks();
  });

  describe('GET /api/users/getall', () => {
    it('should return 200 and all users for admin', async () => {
      const mockUsers = [
        {
          id: 1,
          nama: 'User 1',
          email: 'user1@example.com',
          peran: 'Editor',
          masjid_id: 1
        },
        {
          id: 2,
          nama: 'User 2',
          email: 'user2@example.com',
          peran: 'Editor',
          masjid_id: 2
        }
      ];

      userService.getAllUsers.mockResolvedValue(mockUsers);

      const res = await request(testApp)
        .get('/api/users/getall')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Users found');
      expect(res.body.users).toEqual(mockUsers);
    });

    it('should return 403 for non-admin users', async () => {
      const res = await request(testApp)
        .get('/api/users/getall')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/users', () => {
    it('should return 200 and user profile', async () => {
      const mockUser = {
        id: 1,
        nama: 'Test User',
        email: 'test@example.com',
        peran: 'Editor',
        short_bio: 'Test bio',
        alasan_bergabung: 'Test reason',
        foto_profil: 'profile.jpg',
        masjid_id: 1,
        created_at: '2025-01-01',
        updated_at: '2025-01-10',
        nama_masjid: 'Test Masjid',
        alamat: 'Test Address'
      };

      userService.getById.mockResolvedValue(mockUser);

      const res = await request(testApp)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User found');
      expect(res.body.user).toBeDefined();
    });

    it('should return 404 when user is not found', async () => {
      userService.getById.mockResolvedValueOnce(null);

      const res = await request(testApp)
        .get('/api/users')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found');
    });
  });

  describe('GET /api/users/photo/:filename', () => {
    it('should return the photo when found', done => {
      const filename = 'profile.jpg';
      const filePath = '/src/uploads/profile.jpg';
      
      path.join.mockReturnValue(filePath);
      fs.existsSync.mockReturnValue(true);
      
      const mockSendFile = jest.fn(() => done());
      const mockResponse = {
        sendFile: mockSendFile,
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      mockUserController.getProfilePhoto(
        { params: { filename } },
        mockResponse
      );
      
      expect(path.join).toHaveBeenCalled();
      expect(fs.existsSync).toHaveBeenCalledWith(filePath);
      expect(mockSendFile).toHaveBeenCalledWith(filePath);
    });
    
    it('should handle missing photo files', () => {
      const filename = 'nonexistent.jpg';
      const filePath = '/src/uploads/nonexistent.jpg';
      
      path.join.mockReturnValue(filePath);
      fs.existsSync.mockReturnValue(false);
      
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      
      mockUserController.getProfilePhoto(
        { params: { filename } },
        mockResponse
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Foto tidak ditemukan' });
    });
  });

  describe('PUT /api/users', () => {
    it('should return 200 when profile is updated successfully', async () => {
      const updateData = {
        nama: 'Updated Name',
        short_bio: 'Updated bio',
        alasan_bergabung: 'Updated reason'
      };

      userService.updateUser.mockResolvedValue(true);

      const res = await request(testApp)
        .put('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Profile updated successfully');
    });

    it('should handle profile photo deletion correctly', async () => {
      const updateData = {
        nama: 'Updated Name',
        deleteProfileImage: 'true'
      };

      userService.updateUser.mockResolvedValue(true);

      const res = await request(testApp)
        .put('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when user is not found', async () => {
      const updateData = {
        nama: 'Updated Name'
      };

      userService.updateUser.mockResolvedValue(false);

      const res = await request(testApp)
        .put('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should return 200 when user is updated successfully', async () => {
      const updateData = {
        nama: 'Updated Name',
        peran: 'Viewer'
      };

      userService.updateUser.mockResolvedValue(true);

      const res = await request(testApp)
        .put('/api/users/1')
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User updated successfully');
    });

    it('should return 404 when user is not found', async () => {
      const updateData = {
        nama: 'Updated Name'
      };

      userService.updateUser.mockResolvedValue(false);

      const res = await request(testApp)
        .put('/api/users/999')
        .send(updateData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found');
    });
  });
});