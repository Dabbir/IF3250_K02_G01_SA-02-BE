const request = require('supertest');
const app = require('../app');
const ProgramService = require('../services/program.service');
const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');

jest.mock('../services/program.service');
jest.mock('../services/user.service');
jest.mock('cloudinary').v2;

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

describe('Program Controller', () => {
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

  describe('GET /api/program', () => {
    it('should return 200 and all programs with pagination', async () => {
      const mockPrograms = [
        {
          id: 1,
          nama_program: 'Program 1',
          deskripsi_program: 'Description 1',
          pilar_program: 'Tanpa Kelaparan',
          waktu_mulai: '2025-01-01',
          waktu_selesai: '2025-12-31',
          status_program: 'Berjalan'
        },
        {
          id: 2,
          nama_program: 'Program 2',
          deskripsi_program: 'Description 2',
          pilar_program: 'Tanpa Kelaparan',
          waktu_mulai: '2025-02-01',
          waktu_selesai: '2025-11-30',
          status_program: 'Belum Mulai'
        }
      ];

      const mockTotal = 2;

      ProgramService.getAllPrograms.mockResolvedValue(mockPrograms);
      ProgramService.countAllPrograms.mockResolvedValue(mockTotal);

      const res = await request(app)
        .get('/api/program')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockPrograms);
      expect(res.body.total).toBe(mockTotal);
    });

    it('should handle query parameters correctly', async () => {
      const mockPrograms = [
        {
          id: 1,
          nama_program: 'Program 1',
          status_program: 'Berjalan'
        }
      ];

      ProgramService.getAllPrograms.mockResolvedValue(mockPrograms);
      ProgramService.countAllPrograms.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/program?page=2&limit=5&search=Program&sortBy=nama_program&sortOrder=ASC&status=Ongoing,Finished')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(mockPrograms);
      
      expect(ProgramService.getAllPrograms).toHaveBeenCalledWith(
        5, 5, 1, 'Program', 'nama_program', 'ASC', ['Ongoing', 'Finished']
      );
    });

    it('should return 500 when service throws an error', async () => {
      ProgramService.getAllPrograms.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/program')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/program/:id', () => {
    it('should return 200 and the program when found', async () => {
      const mockProgram = {
        id: 1,
        nama_program: 'Test Program',
        deskripsi_program: 'Test Description',
        pilar_program: 'Tanpa Kelaparan',
        waktu_mulai: '2025-01-01',
        waktu_selesai: '2025-12-31',
        rancangan_anggaran: 50000000,
        aktualisasi_anggaran: 48000000,
        status_program: 'Berjalan',
        cover_image: 'http://example.com/image.jpg'
      };

      ProgramService.getProgramById.mockResolvedValue(mockProgram);

      const res = await request(app)
        .get('/api/program/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProgram);
    });

    it('should return 404 when program is not found', async () => {
      ProgramService.getProgramById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/program/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Program not found');
    });
  });

  describe('POST /api/program', () => {
    it('should return 201 for creating a new program', async () => {
      const programData = {
        nama_program: 'New Program',
        deskripsi_program: 'New Description',
        pilar_program: 'Tanpa Kelaparan',
        waktu_mulai: '2025-03-01',
        waktu_selesai: '2025-10-31',
        rancangan_anggaran: 30000000,
        status_program: 'Belum Mulai'
      };

      ProgramService.createProgram.mockResolvedValue(5);

      const res = await request(app)
        .post('/api/program')
        .set('Authorization', `Bearer ${token}`)
        .send(programData);

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(5);
    });

    it('should return 500 when service throws an error', async () => {
      const programData = {
        nama_program: 'New Program',
        deskripsi_program: 'New Description',
        pilar_program: 'Tanpa Kelaparan',
        waktu_mulai: '2025-03-01',
        waktu_selesai: '2025-10-31'
      };

      ProgramService.createProgram.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/program')
        .set('Authorization', `Bearer ${token}`)
        .send(programData);

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/program/:id', () => {
    it('should return 200 when program is updated successfully', async () => {
      const updateData = {
        nama_program: 'Updated Program',
        deskripsi_program: 'Updated Description',
        status_program: 'Selesai',
        aktualisasi_anggaran: 47500000
      };

      const mockCurrentProgram = {
        id: 1,
        nama_program: 'Test Program',
        deskripsi_program: 'Test Description',
        pilar_program: 'Tanpa Kelaparan',
        status_program: 'Berjalan',
        cover_image: null
      };

      const mockUpdatedProgram = {
        ...mockCurrentProgram,
        ...updateData
      };

      ProgramService.getProgramById.mockResolvedValue(mockCurrentProgram);
      ProgramService.updateProgram.mockResolvedValue(true);
      ProgramService.getProgramById.mockResolvedValueOnce(mockUpdatedProgram);

      const res = await request(app)
        .put('/api/program/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUpdatedProgram);
    });

    it('should handle cover image update correctly', async () => {
      const updateData = {
        nama_program: 'Updated Program',
        cover_image: '' 
      };

      const mockCurrentProgram = {
        id: 1,
        nama_program: 'Test Program',
        cover_image: 'http://example.com/old-image.jpg'
      };

      const mockUpdatedProgram = {
        id: 1,
        nama_program: 'Updated Program',
        cover_image: null
      };

      ProgramService.getProgramById.mockResolvedValue(mockCurrentProgram);
      ProgramService.updateProgram.mockResolvedValue(true);
      ProgramService.getProgramById.mockResolvedValueOnce(mockUpdatedProgram);

      const res = await request(app)
        .put('/api/program/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUpdatedProgram);
    });

    it('should return 200 when program is not found', async () => {
      const updateData = {
        nama_program: 'Updated Program'
      };

      ProgramService.getProgramById.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/program/999')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/program/:id', () => {
    it('should return 200 when program is deleted successfully', async () => {
      const mockProgram = {
        id: 1,
        nama_program: 'Test Program',
        cover_image: null
      };

      ProgramService.getProgramById.mockResolvedValue(mockProgram);
      ProgramService.deleteProgram.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/program/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Program deleted');
    });

    it('should handle cover image deletion correctly', async () => {
      const mockProgram = {
        id: 1,
        nama_program: 'Test Program',
        cover_image: 'http://example.com/image.jpg'
      };

      ProgramService.getProgramById.mockResolvedValue(mockProgram);
      ProgramService.deleteProgram.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/program/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Program deleted');
    });

    it('should return 400 when program deletion fails', async () => {
      const mockProgram = {
        id: 1,
        nama_program: 'Test Program'
      };

      ProgramService.getProgramById.mockResolvedValue(mockProgram);
      ProgramService.deleteProgram.mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/program/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Program deletion failed');
    });
  });
});