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

  describe('POST /api/beneficiary', () => {
    it('should return 201 for creating a new beneficiary', async () => {
      const beneficiaryData = {
        nama_instansi: 'Test Institution',
        nama_kontak: 'Test Contact',
        alamat: 'Test Address',
        telepon: '1234567890',
        email: 'institution@example.com'
      };

      const mockResponse = {
        id: 1,
        ...beneficiaryData,
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
      };

      const res = await request(app)
        .post('/api/beneficiary')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Nama instansi tidak boleh kosong');
    });

    it('should return 500 when service throws an error', async () => {
      const beneficiaryData = {
        nama_instansi: 'Test Institution',
        nama_kontak: 'Test Contact',
        alamat: 'Test Address'
      };

      beneficiaryService.createBeneficiary.mockRejectedValue({
        statusCode: 500,
        message: 'Database error'
      });

      const res = await request(app)
        .post('/api/beneficiary')
        .set('Authorization', `Bearer ${token}`)
        .send(beneficiaryData);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('GET /api/beneficiary', () => {
    it('should return 200 and all beneficiaries', async () => {
      const mockBeneficiaries = {
        data: [
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
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      beneficiaryService.getAllBeneficiaries.mockResolvedValue(mockBeneficiaries);

      const res = await request(app)
        .get('/api/beneficiary')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Penerima manfaat berhasil ditemukan');
      expect(res.body.data).toEqual(mockBeneficiaries.data);
      expect(res.body.total).toBe(mockBeneficiaries.total);
    });

    it('should handle query parameters correctly', async () => {
      const mockBeneficiaries = {
        data: [{ id: 1, nama_instansi: 'Institution 1' }],
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 3
      };

      beneficiaryService.getAllBeneficiaries.mockResolvedValue(mockBeneficiaries);

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
      });
    });
  });

  describe('GET /api/beneficiary/:id', () => {
    it('should return 200 and the beneficiary when found', async () => {
      const mockBeneficiary = {
        id: 1,
        nama_instansi: 'Test Institution',
        nama_kontak: 'Test Contact',
        alamat: 'Test Address',
        telepon: '1234567890',
        email: 'institution@example.com'
      };

      beneficiaryService.getBeneficiaryById.mockResolvedValue(mockBeneficiary);

      const res = await request(app)
        .get('/api/beneficiary/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Penerima manfaat ditemukan');
      expect(res.body.data).toEqual(mockBeneficiary);
    });

    it('should return 404 when beneficiary is not found', async () => {
      beneficiaryService.getBeneficiaryById.mockRejectedValue({
        statusCode: 404,
        message: 'Penerima manfaat tidak ditemukan'
      });

      const res = await request(app)
        .get('/api/beneficiary/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Penerima manfaat tidak ditemukan');
    });
  });

  describe('PUT /api/beneficiary/:id', () => {
    it('should return 200 when beneficiary is updated successfully', async () => {
      const updateData = {
        nama_instansi: 'Updated Institution',
        alamat: 'Updated Address'
      };

      const mockResponse = {
        id: 1,
        ...updateData,
        nama_kontak: 'Test Contact',
        telepon: '1234567890',
        email: 'institution@example.com'
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
        alamat: 'Updated Address',
        telepon: '9876543210'
      };

      const res = await request(app)
        .put('/api/beneficiary/1')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Nama instansi tidak boleh kosong');
    });

    it('should return 404 when beneficiary is not found', async () => {
      const updateData = {
        nama_instansi: 'Updated Institution',
        alamat: 'Updated Address'
      };

      beneficiaryService.updateBeneficiary.mockRejectedValue({
        statusCode: 404,
        message: 'Penerima manfaat tidak ditemukan'
      });

      const res = await request(app)
        .put('/api/beneficiary/999')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Penerima manfaat tidak ditemukan');
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
      beneficiaryService.deleteBeneficiary.mockRejectedValue({
        statusCode: 404,
        message: 'Penerima manfaat tidak ditemukan'
      });

      const res = await request(app)
        .delete('/api/beneficiary/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Penerima manfaat tidak ditemukan');
    });

    it('should return 500 when service throws an error', async () => {
      beneficiaryService.deleteBeneficiary.mockRejectedValue({
        statusCode: 500,
        message: 'Database error'
      });

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
      const mockBeneficiaries = [
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

      beneficiaryService.getBeneficiariesByAktivitas.mockResolvedValue(mockBeneficiaries);

      const res = await request(app)
        .get('/api/beneficiary/aktivitas/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Penerima manfaat ditemukan');
      expect(res.body.data).toEqual(mockBeneficiaries);
    });

    it('should return 404 when no beneficiaries found for activity', async () => {
      beneficiaryService.getBeneficiariesByAktivitas.mockRejectedValue({
        statusCode: 404,
        message: 'Penerima manfaat tidak ditemukan'
      });

      const res = await request(app)
        .get('/api/beneficiary/aktivitas/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Penerima manfaat tidak ditemukan');
    });

    it('should return 500 when service throws an error', async () => {
      beneficiaryService.getBeneficiariesByAktivitas.mockRejectedValue({
        statusCode: 500,
        message: 'Database error'
      });

      const res = await request(app)
        .get('/api/beneficiary/aktivitas/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });
  });
});