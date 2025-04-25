const crypto = require('crypto');
const userModels = require('../models/user.model');
const path = require("path");
const fs = require("fs");
const { console } = require('inspector/promises');
const { deleteCloudinaryImage } = require('../utils/upload.utils');

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
      if (userData.foto_profil || userData.deleteProfileImage === 'true') {
        if (existingUser.foto_profil.includes('cloudinary.com')) {
          await deleteCloudinaryImage(existingUser.foto_profil);
        } else {
          try {
            const filePath = existingUser.foto_profil.split("/").pop();
            const oldPhotoPath = path.join(__dirname, "../uploads/", filePath);
            if (fs.existsSync(oldPhotoPath)) {
              fs.unlinkSync(oldPhotoPath);
            }
          } catch (error) {
            console.error('Error deleting local file:', error);
          }
        }
      }
    }

    if (existingUser.dokumen_pendaftaran && existingUser.dokumen_public_id) {
      if (userData.dokumen_pendaftaran || userData.deleteDocument === 'true') {
        if (existingUser.dokumen_pendaftaran.includes('cloudinary.com')) {
          await deleteCloudinaryImage(existingUser.dokumen_pendaftaran);
        }
      }
    }

    return await userModels.update(id, userData);
  } catch (error) {
    console.error('Error in updating user:', error);
    throw error;
  }
}

exports.deleteUser = async (id) => {
  try {
    const user = await userModels.findById(id);
    if (!user) {
      return false;
    }

    if (user.foto_profil) {
      if (user.foto_profil.includes('cloudinary.com')) {
        await deleteCloudinaryImage(user.foto_profil);
      } else {
        try {
          const filePath = user.foto_profil.split("/").pop();
          const oldPhotoPath = path.join(__dirname, "../uploads/", filePath);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        } catch (error) {
          console.error('Error deleting local file during user deletion:', error);
        }
      }
    }

    return await userModels.delete(id);
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
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
