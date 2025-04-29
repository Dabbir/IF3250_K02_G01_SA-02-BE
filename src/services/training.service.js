const TrainingModel = require('../models/training.model');

class TrainingService {
  /**
   * Get all trainings with pagination and filtering
   */
  async getAllTrainings(page = 1, limit = 10, search = '', status = '', masjidId = null) {
    try {
      // Use the model to fetch data
      return await TrainingModel.getAllTrainings(page, limit, search, status, masjidId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a single training by ID
   */
  async getTrainingById(id) {
    try {
      return await TrainingModel.getTrainingById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new training
   */
  async createTraining(trainingData) {
    try {
      return await TrainingModel.createTraining(trainingData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update an existing training
   */
  async updateTraining(id, trainingData) {
    try {
      return await TrainingModel.updateTraining(id, trainingData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a training
   */
  async deleteTraining(id) {
    try {
      return await TrainingModel.deleteTraining(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get participants for a training
   */
  async getTrainingParticipants(trainingId, page = 1, limit = 10, status = '') {
    try {
      return await TrainingModel.getTrainingParticipants(trainingId, page, limit, status);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register a participant for a training
   */
  async registerParticipant(registrationData) {
    try {
      return await TrainingModel.registerParticipant(registrationData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update participant status
   */
  async updateParticipantStatus(id, status, catatan) {
    try {
      return await TrainingModel.updateParticipantStatus(id, status, catatan);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get training availability information
   */
  async getTrainingAvailability(trainingId) {
    try {
      return await TrainingModel.getTrainingAvailability(trainingId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TrainingService();