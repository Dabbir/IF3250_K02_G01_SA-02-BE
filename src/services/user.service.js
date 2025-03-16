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
      await userModels.update(user.id, {
        auth_provider: oauthData.provider,
        auth_provider_id: oauthData.providerId
      });
      
      return await userModels.findById(user.id);
    }
    
    const userId = await userModels.create({
      nama: oauthData.name,
      email: oauthData.email,
      password: null,
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