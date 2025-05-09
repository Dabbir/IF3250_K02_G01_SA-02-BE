const trainingService = require('../services/training.service');

class TrainingController {
  // Get all trainings with pagination
  static async getAllTrainings(req, res) {
    try {
      const { page = 1, limit = 10, search = '', status = '', trainingRegistration = "false"} = req.query;
      const user_id = req.user.id;
      const masjid_id = req.user.masjid_id;
      const isTrainingRegistration = trainingRegistration === "true" || trainingRegistration === true;
      
      const result = await trainingService.getAllTrainings(
        page, 
        limit, 
        search, 
        status, 
        masjid_id,
        user_id,
        isTrainingRegistration
      );
      
      res.status(200).json({
        success: true,
        message: 'Trainings retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error('Error retrieving trainings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve trainings',
        error: error.message
      });
    }
  }

  // Get training by ID
  static async getTrainingById(req, res) {
    try {
      const { id } = req.params;
      
      const training = await trainingService.getTrainingById(id);
      
      if (!training) {
        return res.status(404).json({
          success: false,
          message: 'Training not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Training retrieved successfully',
        data: training
      });
    } catch (error) {
      console.error('Error retrieving training:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve training',
        error: error.message
      });
    }
  }

  // Create new training
  static async createTraining(req, res) {
    try {
      const trainingData = {
        ...req.body,
        masjid_id: req.user.masjid_id,
        created_by: req.user.id
      };
      
      const trainingId = await trainingService.createTraining(trainingData);
      
      res.status(201).json({
        success: true,
        message: 'Training created successfully',
        data: { id: trainingId }
      });
    } catch (error) {
      console.error('Error creating training:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create training',
        error: error.message
      });
    }
  }

  // Update training
  static async updateTraining(req, res) {
    try {
      const { id } = req.params;
      
      // Check if training exists
      const existingTraining = await trainingService.getTrainingById(id);
      if (!existingTraining) {
        return res.status(404).json({
          success: false,
          message: 'Training not found'
        });
      }
      
      const success = await trainingService.updateTraining(id, req.body);
      
      if (success) {
        res.status(200).json({
          success: true,
          message: 'Training updated successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to update training'
        });
      }
    } catch (error) {
      console.error('Error updating training:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update training',
        error: error.message
      });
    }
  }

  // Delete training
  static async deleteTraining(req, res) {
    try {
      const { id } = req.params;
      
      // Check if training exists
      const existingTraining = await trainingService.getTrainingById(id);
      if (!existingTraining) {
        return res.status(404).json({
          success: false,
          message: 'Training not found'
        });
      }
      
      const success = await trainingService.deleteTraining(id);
      
      if (success) {
        res.status(200).json({
          success: true,
          message: 'Training deleted successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to delete training'
        });
      }
    } catch (error) {
      console.error('Error deleting training:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete training',
        error: error.message
      });
    }
  }

  // Get participants for a training
  static async getTrainingParticipants(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10, status = '' } = req.query;
      
      // Check if training exists
      const existingTraining = await trainingService.getTrainingById(id);
      if (!existingTraining) {
        return res.status(404).json({
          success: false,
          message: 'Training not found'
        });
      }
      
      const result = await trainingService.getTrainingParticipants(id, page, limit, status);
      
      res.status(200).json({
        success: true,
        message: 'Participants retrieved successfully',
        training: {
          id: existingTraining.id,
          nama_pelatihan: existingTraining.nama_pelatihan
        },
        ...result
      });
    } catch (error) {
      console.error('Error retrieving participants:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve participants',
        error: error.message
      });
    }
  }

  // Register for a training
  static async registerForTraining(req, res) {
    try {
      const { id } = req.params;
      
      // Check if training exists
      const existingTraining = await trainingService.getTrainingById(id);
      if (!existingTraining) {
        return res.status(404).json({
          success: false,
          message: 'Training not found'
        });
      }
      
      // Check if training is in the past
      const trainingStartDate = new Date(existingTraining.waktu_mulai);
      if (trainingStartDate < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot register for past trainings'
        });
      }
      
      // Check if training is cancelled
      if (existingTraining.status === 'Cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot register for cancelled trainings'
        });
      }
      
      // Check availability
      const availability = await trainingService.getTrainingAvailability(id);
      if (availability.available_slots <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Training is fully booked'
        });
      }
      
      const registrationData = {
        pelatihan_id: id,
        pengguna_id: req.user.id,
        status_pendaftaran: 'Pending',
        masjid_id: existingTraining.masjid_id,
        catatan: req.body.catatan
      };
      
      const registrationId = await trainingService.registerParticipant(registrationData);
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: { id: registrationId }
      });
    } catch (error) {
      console.error('Error registering for training:', error);
      
      // Handle specific errors
      if (error.message === 'User is already registered for this training') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message === 'Training quota has been reached') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to register for training',
        error: error.message
      });
    }
  }

  // Update participant status
  static async updateParticipantStatus(req, res) {
    try {
      const { id, participantId } = req.params;
      const { status, catatan } = req.body;
      
      if (!['Pending', 'Approved', 'Rejected', 'Attended'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      
      // Check if training exists
      const existingTraining = await trainingService.getTrainingById(id);
      if (!existingTraining) {
        return res.status(404).json({
          success: false,
          message: 'Training not found'
        });
      }
      
      const success = await trainingService.updateParticipantStatus(
        participantId, 
        status, 
        catatan || null
      );
      
      if (success) {
        res.status(200).json({
          success: true,
          message: 'Participant status updated successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Participant not found'
        });
      }
    } catch (error) {
      console.error('Error updating participant status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update participant status',
        error: error.message
      });
    }
  }

  // Get training availability
  static async getTrainingAvailability(req, res) {
    try {
      const { id } = req.params;
      
      // Check if training exists
      const existingTraining = await trainingService.getTrainingById(id);
      if (!existingTraining) {
        return res.status(404).json({
          success: false,
          message: 'Training not found'
        });
      }
      
      const availability = await trainingService.getTrainingAvailability(id);
      
      res.status(200).json({
        success: true,
        message: 'Training availability retrieved successfully',
        data: availability
      });
    } catch (error) {
      console.error('Error retrieving training availability:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve training availability',
        error: error.message
      });
    }
  }
}

module.exports = TrainingController;