const TrainingModel = require('../models/training.model');

class TrainingService {
  async getAllTrainings(page = 1, limit = 10, search = '', status = '', masjidId = null, userId = null, trainingRegistration = false) {
    try {
      return await TrainingModel.getAllTrainings(page, limit, search, status, masjidId, userId, trainingRegistration);
    } catch (error) {
      throw error;
    }
  }

  async getTrainingById(id) {
    try {
      return await TrainingModel.getTrainingById(id);
    } catch (error) {
      throw error;
    }
  }

  async createTraining(trainingData) {
    try {
      return await TrainingModel.createTraining(trainingData);
    } catch (error) {
      throw error;
    }
  }

  async updateTraining(id, trainingData) {
    try {
      return await TrainingModel.updateTraining(id, trainingData);
    } catch (error) {
      throw error;
    }
  }

  async deleteTraining(id) {
    try {
      return await TrainingModel.deleteTraining(id);
    } catch (error) {
      throw error;
    }
  }

  async getTrainingParticipants(trainingId, page = 1, limit = 10, status = '') {
    try {
      return await TrainingModel.getTrainingParticipants(trainingId, page, limit, status);
    } catch (error) {
      throw error;
    }
  }

  async registerParticipant(registrationData) {
    try {
      return await TrainingModel.registerParticipant(registrationData);
    } catch (error) {
      throw error;
    }
  }

  async updateParticipantStatus(id, status, catatan) {
    try {
      return await TrainingModel.updateParticipantStatus(id, status, catatan);
    } catch (error) {
      throw error;
    }
  }

  async getTrainingAvailability(trainingId) {
    try {
      return await TrainingModel.getTrainingAvailability(trainingId);
    } catch (error) {
      throw error;
    }
  }

  async getUserRegistrations(userId) {
    try {
      return await TrainingModel.getUserRegistrations(userId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TrainingService();