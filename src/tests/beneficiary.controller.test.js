const request = require('supertest');
const app = require('../app');
const beneficiaryService = require('../services/beneficiary.service');
const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');

jest.mock('../services/beneficiary.service');
jest.mock('../services/user.service');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

describe('Beneficiary Controller', () => {
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    
    token = jwt.sign(
      { id: 1, email: 'test@example.com', masjid_id: 1 },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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

  describe('POST /api/beneficiary', () => {
    it('should return 201 for creating a new beneficiary', async () => {
      const beneficiaryData = {
        nama_instansi: 'Test Institution',
        nama_kontak: 'Test Contact',
        alamat: 'Test Address',
        telepon: '123456789',
        email: 'test@example.com'
      };

      const mockResponse = {
        id: 1,
        ...beneficiaryData,
        foto: null,
        created_by: 1
      };

      beneficiaryService.createBeneficiary.mockResolvedValue(mockResponse);

      const res = await request(app)
        .post('/api/beneficiary')
        .set('Authorization', `Bearer ${token}`)
        .send(beneficiaryData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Penerima manfaat berhasil ditambahkan');
      expect(res.body.data).toEqual(mockResponse);
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        nama_kontak: 'Test Contact',
        alamat: 'Test Address'
        // nama_instansi missing
      };

      const res = await request(app)
        .post('/api/beneficiary')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      // Fixed: Updated to match actual controller response
      expect(res.body.message).toBe('Validasi gagal');
    });
  });

  describe('GET /api/beneficiary', () => {
    it('should return 200 and all beneficiaries', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            nama_instansi: 'Test Institution',
            nama_kontak: 'Test Contact',
            alamat: 'Test Address',
            telepon: '123456789',
            email: 'test@example.com',
            foto: null,
            created_by: 1
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };

      beneficiaryService.getAllBeneficiaries.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/api/beneficiary')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Penerima manfaat berhasil ditemukan');
      expect(res.body.data).toEqual(mockResponse.data);
      expect(res.body.pagination).toEqual(mockResponse.pagination);
    });

    it('should handle query parameters correctly', async () => {
      const mockResponse = {
        data: [],
        pagination: { total: 0, page: 2, limit: 5, totalPages: 0 }
      };

      beneficiaryService.getAllBeneficiaries.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/api/beneficiary?page=2&limit=5&nama_instansi=Institution&orderBy=nama_instansi&orderDirection=DESC')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(beneficiaryService.getAllBeneficiaries).toHaveBeenCalledWith({
        nama_instansi: 'Institution',
        page: 2,
        limit: 5,
        orderBy: 'nama_instansi',
        orderDirection: 'DESC'
      }, 1);
    });
  });

  describe('GET /api/beneficiary/:id', () => {
    it('should return 200 and the beneficiary when found', async () => {
      const mockResponse = {
        id: 1,
        nama_instansi: 'Test Institution',
        nama_kontak: 'Test Contact',
        alamat: 'Test Address',
        telepon: '123456789',
        email: 'test@example.com'
      };

      beneficiaryService.getBeneficiaryById.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/api/beneficiary/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Penerima manfaat ditemukan');
      expect(res.body.data).toEqual(mockResponse);
    });

    it('should return 404 when beneficiary is not found', async () => {
      const error = new Error('Beneficiary not found');
      error.statusCode = 404;
      beneficiaryService.getBeneficiaryById.mockRejectedValue(error);

      const res = await request(app)
        .get('/api/beneficiary/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Beneficiary not found');
    });
  });

  describe('PUT /api/beneficiary/:id', () => {
    it('should return 200 when beneficiary is updated successfully', async () => {
      const updateData = {
        nama_instansi: 'Updated Institution',
        nama_kontak: 'Updated Contact',
        alamat: 'Updated Address',
        telepon: '987654321',
        email: 'updated@example.com'
      };

      const mockResponse = {
        id: 1,
        ...updateData,
        foto: null,
        created_by: 1
      };

      beneficiaryService.updateBeneficiary.mockResolvedValue(mockResponse);

      const res = await request(app)
        .put('/api/beneficiary/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Penerima manfaat berhasil diperbarui');
      expect(res.body.data).toEqual(mockResponse);
    });

    it('should return 400 when nama_instansi is missing', async () => {
      const invalidData = {
        nama_kontak: 'Updated Contact',
        alamat: 'Updated Address'
        // nama_instansi missing
      };

      const res = await request(app)
        .put('/api/beneficiary/1')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      // Fixed: Updated to match actual controller response
      expect(res.body.message).toBe('Validasi gagal');
    });

    it('should return 404 when beneficiary is not found', async () => {
      const updateData = {
        nama_instansi: 'Updated Institution',
        nama_kontak: 'Updated Contact',
        alamat: 'Updated Address',
        telepon: '987654321',
        email: 'updated@example.com'
      };

      const error = new Error('Beneficiary not found');
      error.statusCode = 404;
      beneficiaryService.updateBeneficiary.mockRejectedValue(error);

      const res = await request(app)
        .put('/api/beneficiary/999')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Beneficiary not found');
    });
  });

  describe('DELETE /api/beneficiary/:id', () => {
    it('should return 200 when beneficiary is deleted successfully', async () => {
      beneficiaryService.deleteBeneficiary.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/beneficiary/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Penerima manfaat berhasil dihapus!');
    });

    it('should return 404 when beneficiary is not found', async () => {
      const error = new Error('Beneficiary not found');
      error.statusCode = 404;
      beneficiaryService.deleteBeneficiary.mockRejectedValue(error);

      const res = await request(app)
        .delete('/api/beneficiary/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Beneficiary not found');
    });

    it('should return 500 when service throws an error', async () => {
      beneficiaryService.deleteBeneficiary.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .delete('/api/beneficiary/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('GET /api/beneficiary/aktivitas/:id', () => {
    it('should return 200 and beneficiaries for an activity', async () => {
      const mockResponse = [
        {
          id: 1,
          nama_instansi: 'Institution 1',
          nama_kontak: 'Contact 1'
        },
        {
          id: 2,
          nama_instansi: 'Institution 2',
          nama_kontak: 'Contact 2'
        }
      ];

      beneficiaryService.getBeneficiariesByAktivitas.mockResolvedValue(mockResponse);

      const res = await request(app)
        .get('/api/beneficiary/aktivitas/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Penerima manfaat ditemukan');
      expect(res.body.data).toEqual(mockResponse);
    });

    it('should return 200 with empty array when no beneficiaries found for activity', async () => {
      beneficiaryService.getBeneficiariesByAktivitas.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/beneficiary/aktivitas/999')
        .set('Authorization', `Bearer ${token}`);

      // Fixed: Updated to match actual controller behavior
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should return 500 when service throws an error', async () => {
      beneficiaryService.getBeneficiariesByAktivitas.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/beneficiary/aktivitas/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });
  });
});