const request = require('supertest');
const app = require('../app');
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');

jest.mock('../services/auth.service');
jest.mock('../services/user.service');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    userService.getById.mockImplementation(id => {
      if (id === 1) {
        return Promise.resolve({
          id: 1,
          email: 'test@example.com',
          peran: 'Editor',
          masjid_id: 1
        });
      }
      return Promise.resolve(null);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 201 for successful registration', async () => {
      const userData = {
        nama: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        password_confirmation: 'Password123!'
      };

      const mockResponse = {
        user: {
          id: 1,
          nama: 'Test User',
          email: 'test@example.com',
          peran: 'Editor'
        },
        token: 'mock-jwt-token'
      };

      authService.register.mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.token).toBe(mockResponse.token);
      expect(res.body.user).toEqual(mockResponse.user);
    });

    it('should return 400 for validation errors', async () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'short'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('should return 500 when service throws an error', async () => {
      const userData = {
        nama: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        password_confirmation: 'Password123!'
      };

      authService.register.mockRejectedValue(new Error('Registration failed'));

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Registration failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 and token for valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Password123!'
      };

      const mockResponse = {
        user: {
          id: 1,
          nama: 'Test User',
          email: 'test@example.com',
          peran: 'Editor'
        },
        token: 'mock-jwt-token'
      };

      authService.login.mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User logged in successfully');
      expect(res.body.token).toBe(mockResponse.token);
      expect(res.body.user).toEqual(mockResponse.user);
    });

    it('should return 500 for invalid credentials', async () => {
      const invalidCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      const res = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 200 and user data for authenticated user', async () => {
      const mockUser = {
        id: 1,
        nama: 'Test User',
        email: 'test@example.com',
        peran: 'Editor',
        masjid_id: 1
      };

      const token = jwt.sign(
        mockUser,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe(mockUser.id);
      expect(res.body.user.email).toBe(mockUser.email);
    });

    it('should return 401 for unauthenticated request', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 200 for successful logout', async () => {
      const token = jwt.sign(
        { id: 1, email: 'test@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User logged out successfully');
    });

    it('should return 401 if no token provided', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Access denied. No token provided');
    });
  });
});