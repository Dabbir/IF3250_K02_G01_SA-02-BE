const express = require('express');
const router = express.Router();
const masjidController = require('../controllers/masjid.controller');
const { verifyToken, hasRole } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /api/masjid:
 *   get:
 *     summary: Get all masjids
 *     tags: [Masjid]
 *     responses:
 *       200:
 *         description: Successfully retrieved all masjids
 *       500:
 *         description: Server error
 */
router.get('/', masjidController.getAllMasjids);

/**
 * @swagger
 * /api/masjid/search:
 *   get:
 *     summary: Search masjids by name
 *     tags: [Masjid]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Name of the masjid to search for
 *     responses:
 *       200:
 *         description: Successfully retrieved masjids
 *       400:
 *         description: Name parameter is required
 *       500:
 *         description: Server error
 */
router.get('/search', masjidController.searchMasjids);

/**
 * @swagger
 * /api/masjid/{id}:
 *   get:
 *     summary: Get a masjid by ID
 *     tags: [Masjid]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the masjid
 *     responses:
 *       200:
 *         description: Successfully retrieved masjid
 *       404:
 *         description: Masjid not found
 *       500:
 *         description: Server error
 */
router.get('/:id', masjidController.getMasjidById);

/**
 * @swagger
 * /api/masjid/{id}/editors:
 *   get:
 *     summary: Get all editors of a masjid
 *     tags: [Masjid]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the masjid
 *     responses:
 *       200:
 *         description: Successfully retrieved editors
 *       400:
 *         description: Masjid ID is required
 *       500:
 *         description: Server error
 */
router.get('/:id/editors', verifyToken, hasRole(['Admin']), masjidController.getEditorsByMasjidId);

/**
 * @swagger
 * /api/masjid:
 *   post:
 *     summary: Create a new masjid
 *     tags: [Masjid]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama_masjid
 *               - alamat
 *             properties:
 *               nama_masjid:
 *                 type: string
 *               alamat:
 *                 type: string
 *     responses:
 *       201:
 *         description: Masjid created successfully
 *       400:
 *         description: Required fields missing
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, hasRole(['Admin']), masjidController.createMasjid);

/**
 * @swagger
 * /api/masjid/{id}:
 *   put:
 *     summary: Update a masjid
 *     tags: [Masjid]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the masjid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama_masjid:
 *                 type: string
 *               alamat:
 *                 type: string
 *     responses:
 *       200:
 *         description: Masjid updated successfully
 *       400:
 *         description: Masjid ID is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Masjid not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, hasRole(['Admin']), masjidController.updateMasjid);

/**
 * @swagger
 * /api/masjid/{id}:
 *   delete:
 *     summary: Delete a masjid
 *     tags: [Masjid]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the masjid
 *     responses:
 *       200:
 *         description: Masjid deleted successfully
 *       400:
 *         description: Masjid ID is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Masjid not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, hasRole(['Admin']), masjidController.deleteMasjid);

module.exports = router;