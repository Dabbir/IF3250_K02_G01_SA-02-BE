const userModel = require("../models/user.model");

class UserService {
  async getAllUsers() {
    return await userModel.findAll();
  }

  async getUserById(id) {
    return await userModel.findById(id);
  }

  async createUser(userData) {
    const existingUser = await userModel.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error("Email already in use");
      error.statusCode = 409;
      throw error;
    }

    return await userModel.create(userData);
  }

  async updateUser(id, userData) {
    const existingUser = await userModel.findById(id);
    if (!existingUser) {
      return false;
    }

    if (userData.email && userData.email !== existingUser.email) {
      const userWithEmail = await userModel.findByEmail(userData.email);
      if (userWithEmail) {
        const error = new Error("Email already in use");
        error.statusCode = 409;
        throw error;
      }
    }

    return await userModel.update(id, userData);
  }

  async deleteUser(id) {
    return await userModel.delete(id);
  }
}

module.exports = new UserService();
