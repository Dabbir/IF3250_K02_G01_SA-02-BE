const express = require('express');
const router = express.Router();
const TrainingController = require('../controllers/training.controller');
const { verifyToken, hasRole } = require('../middlewares/auth.middleware');
const trainingMiddleware = require('../middlewares/training.middleware');

/**
 * @swagger
 * tags:
 *   name: Trainings
 *   description: API endpoints for managing trainings
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Training:
 *       type: object
 *       required:
 *         - nama_pelatihan
 *         - waktu_mulai
 *         - waktu_akhir
 *         - lokasi
 *         - kuota
 *         - masjid_id
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the training
 *         nama_pelatihan:
 *           type: string
 *           description: Name of the training
 *         deskripsi:
 *           type: string
 *           description: Description of the training
 *         waktu_mulai:
 *           type: string
 *           format: date-time
 *           description: Start time of the training
 *         waktu_akhir:
 *           type: string
 *           format: date-time
 *           description: End time of the training
 *         lokasi:
 *           type: string
 *           description: Location of the training
 *         kuota:
 *           type: integer
 *           description: Maximum number of participants
 *         status:
 *           type: string
 *           enum: [Upcoming, Ongoing, Completed, Cancelled]
 *           description: Status of the training
 *         masjid_id:
 *           type: integer
 *           description: ID of the associated mosque
 *         created_by:
 *           type: integer
 *           description: ID of the user who created the training
 *       example:
 *         nama_pelatihan: Basic Quran Recitation
 *         deskripsi: Learn the basics of Quran recitation
 *         waktu_mulai: 2023-06-01T09:00:00Z
 *         waktu_akhir: 2023-06-01T12:00:00Z
 *         lokasi: Main Hall
 *         kuota: 30
 *         status: Upcoming
 *         masjid_id: 1
 *     TrainingRegistration:
 *       type: object
 *       properties:
 *         catatan:
 *           type: string
 *           description: Notes for the registration
 *       example:
 *         catatan: I have basic knowledge of tajweed
 *     ParticipantStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [Pending, Approved, Rejected, Attended]
 *           description: Status of the participant's registration
 *         catatan:
 *           type: string
 *           description: Notes regarding the status update
 *       example:
 *         status: Approved
 *         catatan: Welcome to the training!
 */

/**
 * @swagger
 * /api/trainings:
 *   get:
 *     summary: Get all trainings with pagination
 *     tags: [Trainings]
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for training name or description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Upcoming, Ongoing, Completed, Cancelled]
 *         description: Filter by training status
 *       - in: query
 *         name: masjid_id
 *         schema:
 *           type: integer
 *         description: Filter by mosque ID
 *     responses:
 *       200:
 *         description: List of trainings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Training'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, TrainingController.getAllTrainings);

/**
 * @swagger
 * /api/trainings/{id}:
 *   get:
 *     summary: Get a training by ID
 *     tags: [Trainings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Training ID
 *     responses:
 *       200:
 *         description: Training details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Training'
 *       404:
 *         description: Training not found
 *       500:
 *         description: Server error
 */
router.get('/:id', trainingMiddleware.idValidation, trainingMiddleware.validate, TrainingController.getTrainingById);

/**
 * @swagger
 * /api/trainings:
 *   post:
 *     summary: Create a new training
 *     tags: [Trainings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Training'
 *     responses:
 *       201:
 *         description: Training created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', 
  verifyToken, 
  trainingMiddleware.trainingValidation, 
  trainingMiddleware.validate, 
  TrainingController.createTraining
);

/**
 * @swagger
 * /api/trainings/{id}:
 *   put:
 *     summary: Update a training
 *     tags: [Trainings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Training ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Training'
 *     responses:
 *       200:
 *         description: Training updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Training not found
 *       500:
 *         description: Server error
 */
router.put('/:id', 
  verifyToken, 
  trainingMiddleware.idValidation,
  trainingMiddleware.trainingValidation, 
  trainingMiddleware.validate, 
  trainingMiddleware.belongsToTrainingMasjid,
  TrainingController.updateTraining
);

/**
 * @swagger
 * /api/trainings/{id}:
 *   delete:
 *     summary: Delete a training
 *     tags: [Trainings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Training ID
 *     responses:
 *       200:
 *         description: Training deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Training not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', 
  verifyToken, 
  trainingMiddleware.idValidation, 
  trainingMiddleware.validate, 
  trainingMiddleware.belongsToTrainingMasjid,
  TrainingController.deleteTraining
);

/**
 * @swagger
 * /api/trainings/{id}/participants:
 *   get:
 *     summary: Get participants for a training
 *     tags: [Trainings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Training ID
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected, Attended]
 *         description: Filter by participant status
 *     responses:
 *       200:
 *         description: List of participants
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Training not found
 *       500:
 *         description: Server error
 */
router.get('/:id/participants', 
  verifyToken, 
  trainingMiddleware.idValidation, 
  trainingMiddleware.validate, 
  trainingMiddleware.belongsToTrainingMasjid,
  TrainingController.getTrainingParticipants
);

/**
 * @swagger
 * /api/trainings/{id}/register:
 *   post:
 *     summary: Register for a training
 *     tags: [Trainings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Training ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrainingRegistration'
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error or training is not available
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Training not found
 *       500:
 *         description: Server error
 */
router.post('/:id/register', 
  verifyToken, 
  trainingMiddleware.idValidation,
  trainingMiddleware.registrationValidation,
  trainingMiddleware.validate,
  TrainingController.registerForTraining
);

/**
 * @swagger
 * /api/trainings/{id}/participants/{participantId}:
 *   put:
 *     summary: Update participant status
 *     tags: [Trainings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Training ID
 *       - in: path
 *         name: participantId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Participant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParticipantStatusUpdate'
 *     responses:
 *       200:
 *         description: Participant status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Training or participant not found
 *       500:
 *         description: Server error
 */
router.put('/:id/participants/:participantId', 
  verifyToken, 
  trainingMiddleware.participantIdValidation, 
  trainingMiddleware.statusUpdateValidation,
  trainingMiddleware.validate,
  trainingMiddleware.belongsToTrainingMasjid,
  TrainingController.updateParticipantStatus
);

/**
 * @swagger
 * /api/trainings/{id}/availability:
 *   get:
 *     summary: Get availability information for a training
 *     tags: [Trainings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Training ID
 *     responses:
 *       200:
 *         description: Training availability information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_kuota:
 *                       type: integer
 *                     used_slots:
 *                       type: integer
 *                     available_slots:
 *                       type: integer
 *       404:
 *         description: Training not found
 *       500:
 *         description: Server error
 */
router.get('/:id/availability', 
  trainingMiddleware.idValidation, 
  trainingMiddleware.validate, 
  TrainingController.getTrainingAvailability
);

module.exports = router;