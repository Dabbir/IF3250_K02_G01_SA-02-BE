const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publication.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { validate, publicationValidation } = require('../middlewares/publication.middleware');
const upload = require("../middlewares/upload.middleware");

/**
 * @swagger
 * /api/publication:
 *   get:
 *     summary: Get list of publications with pagination, search, and filtering
 *     tags: [Publication]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title only
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: tanggal_publikasi
 *         description: Column to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: toneFilters
 *         schema:
 *           type: string
 *         description: Comma-separated tone values (Positif,Netral,Negatif)
 *       - in: query
 *         name: mediaFilters
 *         schema:
 *           type: string
 *         description: Comma-separated media types
 *       - in: query
 *         name: programFilters
 *         schema:
 *           type: string
 *         description: Comma-separated program IDs
 *       - in: query
 *         name: activityFilters
 *         schema:
 *           type: string
 *         description: Comma-separated activity IDs
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for date range filter
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for date range filter
 *       - in: query
 *         name: prValueMin
 *         schema:
 *           type: number
 *         description: Minimum PR value
 *       - in: query
 *         name: prValueMax
 *         schema:
 *           type: number
 *         description: Maximum PR value
 *     responses:
 *       200:
 *         description: List of publications
 *       500:
 *         description: Internal Server Error
 *
 *   post:
 *     summary: Create new publication
 *     tags: [Publication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               judul_publikasi:
 *                 type: string
 *               media_publikasi:
 *                 type: string
 *               nama_perusahaan_media:
 *                 type: string
 *               tanggal_publikasi:
 *                 type: string
 *                 format: date
 *               url_publikasi:
 *                 type: string
 *               pr_value:
 *                 type: number
 *               nama_program:
 *                 type: string
 *               nama_aktivitas:
 *                 type: string
 *               tone:
 *                 type: string
 *                 enum: [Positif, Netral, Negatif]
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Publication created successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get('/', publicationController.getAllPublications);
router.post('/', [verifyToken, upload.single("file"), publicationValidation, validate], publicationController.createPublication);

/**
 * @swagger
 * /api/publication/filter-options:
 *   get:
 *     summary: Get available filter options
 *     tags: [Publication]
 *     responses:
 *       200:
 *         description: Filter options retrieved successfully
 *       500:
 *         description: Internal Server Error
 */
router.get('/filter-options', publicationController.getFilterOptions);

/**
 * @swagger
 * /api/publication/{id}:
 *   get:
 *     summary: Get publication by ID
 *     tags: [Publication]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Publication found
 *       404:
 *         description: Publication not found
 *       500:
 *         description: Internal Server Error
 *
 *   put:
 *     summary: Update publication by ID
 *     tags: [Publication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               judul_publikasi:
 *                 type: string
 *               media_publikasi:
 *                 type: string
 *               nama_perusahaan_media:
 *                 type: string
 *               tanggal_publikasi:
 *                 type: string
 *                 format: date
 *               url_publikasi:
 *                 type: string
 *               pr_value:
 *                 type: number
 *               nama_program:
 *                 type: string
 *               nama_aktivitas:
 *                 type: string
 *               tone:
 *                 type: string
 *                 enum: [Positif, Netral, Negatif]
 *     responses:
 *       200:
 *         description: Publication updated successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Publication not found
 *       500:
 *         description: Internal Server Error
 *
 *   delete:
 *     summary: Delete publication by ID
 *     tags: [Publication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Publication deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Publication not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', publicationController.getPublicationById);
router.put('/:id', [verifyToken, publicationValidation, validate], publicationController.updatePublication);
router.delete('/:id', [verifyToken], publicationController.deletePublication);

module.exports = router;