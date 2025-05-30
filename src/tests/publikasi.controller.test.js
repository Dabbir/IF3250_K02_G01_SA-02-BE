const request = require('supertest');
const app = require('../app');
const PublicationService = require('../services/publication.service');
const userService = require('../services/user.service');
const jwt = require('jsonwebtoken');

jest.mock('../services/publication.service');
jest.mock('../services/user.service');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

describe('Publication Controller', () => {
  let token;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
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
  });

  describe('GET /api/publication', () => {
    it('should return paginated publication list', async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            title: 'Publication 1',
            content: 'Content 1',
            tanggal_publikasi: '2025-01-01',
            tone: 'Informative'
          },
          {
            id: 2,
            title: 'Publication 2',
            content: 'Content 2',
            tanggal_publikasi: '2025-02-01',
            tone: 'Persuasive'
          }
        ],
        total: 2,
        page: 1,
        totalPages: 1,
        limit: 20
      };

      PublicationService.getPaginatedPublications.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/publication');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
      expect(PublicationService.getPaginatedPublications).toHaveBeenCalledWith(
        1, 20, '', 'tanggal_publikasi', 'desc', {}
      );
    });

    it('should handle query parameters correctly', async () => {
      const mockResult = {
        data: [
          {
            id: 1,
            title: 'Publication 1',
            tone: 'Informative'
          }
        ],
        total: 1,
        page: 2,
        totalPages: 3,
        limit: 5
      };

      PublicationService.getPaginatedPublications.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/publication?page=2&limit=5&search=Info&sortBy=tanggal_publikasi&sortOrder=desc&toneFilters=Informative,Persuasive');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
      
      expect(PublicationService.getPaginatedPublications).toHaveBeenCalledWith(
        2, 5, 'Info', 'tanggal_publikasi', 'desc', 
        expect.objectContaining({
          tone: ['Informative', 'Persuasive']
        })
      );
    });

    it('should return 500 when service throws an error', async () => {
      PublicationService.getPaginatedPublications.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/publication');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/publication/filter-options', () => {
    it('should return filter options', async () => {
      const mockFilterOptions = {
        tones: ['Informative', 'Persuasive', 'Narrative'],
        years: [2024, 2025]
      };

      PublicationService.getFilterOptions.mockResolvedValue(mockFilterOptions);

      const res = await request(app)
        .get('/api/publication/filter-options');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockFilterOptions);
    });

    it('should return 500 when service throws an error', async () => {
      PublicationService.getFilterOptions.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/publication/filter-options');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/publication/:id', () => {
    it('should return 200 and the publication when found', async () => {
      const mockPublication = {
        id: 1,
        title: 'Test Publication',
        content: 'Test Content',
        tanggal_publikasi: '2025-01-01',
        tone: 'Informative',
        created_by: 1
      };

      PublicationService.getPublicationById.mockResolvedValue(mockPublication);

      const res = await request(app)
        .get('/api/publication/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPublication);
    });

    it('should return 404 when publication is not found', async () => {
      PublicationService.getPublicationById.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/publication/999');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Publication not found');
    });

    it('should return 500 when service throws an error', async () => {
      PublicationService.getPublicationById.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .get('/api/publication/1');

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/publication', () => {
    it('should return 201 for creating a new publication', async () => {
      const publicationData = {
        judul_publikasi: 'New Publication',
        media_publikasi: 'New Content',
        tanggal_publikasi: '2025-03-01',
        tone: 'Persuasive'
      };

      const mockCreatedId = 5;
      PublicationService.createPublication.mockResolvedValue(mockCreatedId);

      const res = await request(app)
        .post('/api/publication')
        .set('Authorization', `Bearer ${token}`)
        .send(publicationData);

      expect(res.status).toBe(201);
      expect(res.body.id).toBe(mockCreatedId);
      
      expect(PublicationService.createPublication).toHaveBeenCalledWith({
        ...publicationData,
        created_by: 1
      });
    });

    it('should return 400 when validation fails', async () => {
      const invalidData = {};

      const res = await request(app)
        .post('/api/publication')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);

      expect(res.status).toBe(400);
    });

    it('should return 401 when no authorization token provided', async () => {
      const publicationData = {
        judul_publikasi: 'New Publication',
        media_publikasi: 'New Content',
        tanggal_publikasi: '2025-03-01',
        tone: 'Persuasive'
      };

      const res = await request(app)
        .post('/api/publication')
        .send(publicationData);

      expect(res.status).toBe(401);
    });

    it('should return 500 when service throws an error', async () => {
      const publicationData = {
        judul_publikasi: 'New Publication',
        media_publikasi: 'New Content',
        tanggal_publikasi: '2025-03-01',
        tone: 'Persuasive'
      };

      PublicationService.createPublication.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .post('/api/publication')
        .set('Authorization', `Bearer ${token}`)
        .send(publicationData);

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/publication/:id', () => {
    it('should return 200 when publication is updated successfully', async () => {
      const updateData = {
        judul_publikasi: 'Updated Publication',
        media_publikasi: 'Updated Content',
        tone: 'Informative'
      };

      PublicationService.updatePublication.mockResolvedValue(true);

      const res = await request(app)
        .put('/api/publication/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Publication updated');
      
      expect(PublicationService.updatePublication).toHaveBeenCalledWith('1', updateData);
    });

    it('should return 400 when validation fails', async () => {
      const invalidData = {
        judul_publikasi: '',
        media_publikasi: 'Some content'
      };

      const res = await request(app)
        .put('/api/publication/1')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);

      expect(res.status).toBe(400);
    });

    it('should return 404 when publication is not found', async () => {
      const updateData = {
        judul_publikasi: 'Updated Publication',
        media_publikasi: 'Updated Content',
        tone: 'Informative'
      };

      const error = new Error('Publication not found');
      error.statusCode = 404;
      PublicationService.updatePublication.mockRejectedValue(error);

      const res = await request(app)
        .put('/api/publication/999')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(404);
    });

    it('should return 500 when service throws an error', async () => {
      const updateData = {
        judul_publikasi: 'Updated Publication',
        media_publikasi: 'Updated Content',
        tone: 'Informative'
      };

      PublicationService.updatePublication.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/publication/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/publication/:id', () => {
    it('should return 200 when publication is deleted successfully', async () => {
      PublicationService.deletePublication.mockResolvedValue(true);

      const res = await request(app)
        .delete('/api/publication/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Publication deleted');
      
      expect(PublicationService.deletePublication).toHaveBeenCalledWith('1');
    });

    it('should return 404 when publication is not found', async () => {
      const error = new Error('Publication not found');
      error.statusCode = 404;
      PublicationService.deletePublication.mockRejectedValue(error);

      const res = await request(app)
        .delete('/api/publication/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 401 when no authorization token provided', async () => {
      const res = await request(app)
        .delete('/api/publication/1');

      expect(res.status).toBe(401);
    });

    it('should return 500 when service throws an error', async () => {
      PublicationService.deletePublication.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .delete('/api/publication/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
    });
  });

  describe('Complex filter scenarios', () => {
    it('should handle all filter parameters correctly', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
        limit: 10
      };

      PublicationService.getPaginatedPublications.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/publication')
        .query({
          page: 1,
          limit: 10,
          search: 'test',
          sortBy: 'title',
          sortOrder: 'asc',
          toneFilters: 'Informative,Persuasive',
          mediaFilters: 'Website,Social Media',
          programFilters: 'Program1,Program2',
          activityFilters: 'Activity1,Activity2',
          dateFrom: '2025-01-01',
          dateTo: '2025-12-31',
          prValueMin: 100,
          prValueMax: 1000
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockResult);
      
      expect(PublicationService.getPaginatedPublications).toHaveBeenCalledWith(
        1, 10, 'test', 'title', 'asc',
        expect.objectContaining({
          tone: ['Informative', 'Persuasive'],
          media: ['Website', 'Social Media'],
          program: ['Program1', 'Program2'],
          activity: ['Activity1', 'Activity2'],
          dateFrom: '2025-01-01',
          dateTo: '2025-12-31',
          prValueMin: 100,
          prValueMax: 1000
        })
      );
    });

    it('should handle partial filter parameters', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
        limit: 20
      };

      PublicationService.getPaginatedPublications.mockResolvedValue(mockResult);

      const res = await request(app)
        .get('/api/publication')
        .query({
          toneFilters: 'Informative',
          dateFrom: '2025-01-01'
        });

      expect(res.status).toBe(200);
      expect(PublicationService.getPaginatedPublications).toHaveBeenCalledWith(
        1, 20, '', 'tanggal_publikasi', 'desc',
        expect.objectContaining({
          tone: ['Informative'],
          dateFrom: '2025-01-01'
        })
      );
    });
  });
});