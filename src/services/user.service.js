const crypto = require('crypto');
const userModels = require('../models/user.model');
const path = require("path");
const fs = require("fs");
const { console } = require('inspector/promises');

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
  try {
    const existingUser = await userModels.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error("Email already in use");
      error.statusCode = 409;
      throw error;
    }

    return await userModels.create(userData);
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

exports.createUserAgain = async (userData) => {
  try {
    return await userModels.createAgain(userData);
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

exports.updateUser = async (id, userData) => {
  try {
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

    if (existingUser.foto_profil) {
      filePath = existingUser.foto_profil.split("/").pop();
      if (userData.foto_profil || userData.deleteProfileImage == 'true') {
        const oldPhotoPath = path.join(__dirname, "../uploads/", filePath);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
    }

    return await userModels.update(id, userData);
  } catch (error) {
    console.error('Error in updateing user:', error);
    throw error;
  }
}

exports.deleteUser = async (id) => {
  return await userModels.delete(id);
}

exports.getByAuthProvider = async (provider, providerId) => {
  try {
    const user = await userModels.findByAuthProvider(provider, providerId);
    return user;
  } catch (error) {
    console.error('Error in getByAuthProvider:', error);
    throw error;
  }
}

exports.findOrCreateByOAuth = async (oauthData) => {
  try {
    let user = await userModels.findByAuthProvider(oauthData.provider, oauthData.providerId);
    
    if (user) {
      return user;
    }
    
    user = await userModels.findByEmail(oauthData.email);
    if (user) {      
      return await userModels.findById(user.id);
    }
    
    const randomPassword = crypto.randomBytes(20).toString('hex');
    
    const userId = await userModels.create({
      nama: oauthData.nama,
      email: oauthData.email,
      password: randomPassword,
      peran: 'Editor',
      masjid_id: null,
      nama_masjid: null,
      short_bio: null,
      alasan_bergabung: null,
      foto_profil: oauthData.picture,
      auth_provider: oauthData.provider,
      auth_provider_id: oauthData.providerId
    });
    
    return await userModels.findById(userId);
  } catch (error) {
    console.error('Error in findOrCreateByOAuth:', error);
    throw error;
  }
}
