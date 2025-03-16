const userModels = require('../models/user.model');

exports.getAllUsers = async () => {
  try {
    const users = await userModels.findAll();
    return users;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
}

exports.getById = async (id) => {
  try {
    const user = await userModels.findById(id);
    return user;
  } catch (error) {
    console.error('Error in getById:', error);
    throw error;
  }
}

exports.getByEmail = async (email) => {
  try {
    const user = await userModels.findByEmail(email);
    return user;
  } catch (error) {
    console.error('Error in getByEmail:', error);
    throw error;
  }
}

exports.createUser = async (userData) => {
  const existingUser = await userModels.findByEmail(userData.email);
  if (existingUser) {
    const error = new Error("Email already in use");
    error.statusCode = 409;
    throw error;
  }

  return await userModels.create(userData);
}

exports.updateUser = async (id, userData) => {
  const existingUser = await userModels.findById(id);
  if (!existingUser) { 
    return false;
  }

  if (userData.email && userData.email !== existingUser.email) {
    const userWithEmail = await userModels.findByEmail(userData.email);
    if (userWithEmail) {
      const error = new Error("Email already in use");
      error.statusCode = 409;
      throw error;
    }
  }

  return await userModels.update(id, userData);
}

exports.deleteUser = async (id) => {
  return await userModels.delete(id);
}
