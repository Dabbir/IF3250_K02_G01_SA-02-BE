const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userService = require("../services/user.service");

exports.register = async (userData) => {
  const { name, email, password, masjid_id, nama_masjid } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userDataWithHash = {
    ...userData,
    password: hashedPassword,
  };
  const existingUser = await userService.getByEmail(email);
  if (existingUser) {
    if(!existingUser.short_bio){
      const userId = await userService.createUserAgain(userDataWithHash);
      const token = jwt.sign(
        { id: userId, email, masjid_id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      return {
        token,
        user: {
          id: userId,
          name,
          email,
          masjid_id,
          // nama_masjid,
        },
      }
    } else{
      const error = new Error("Email already in use");
      error.statusCode = 409;
      throw error;
    }
  } else {
    const userId = await userService.createUser(userDataWithHash);
    const token = jwt.sign(
      { id: userId, email, masjid_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    return {
      token,
      user: {
        id: userId,
        name,
        email,
        masjid_id,
        // nama_masjid,
      },
    }
  }


}

exports.login = async (email, password) => {
  const user = await userService.getByEmail(email);
  if (!user) {
    const error = new Error("Invalid email/password");
    error.statusCode = 404;
    throw error;
  }

  if (user.auth_provider && !user.password) {
    const error = new Error(`Please sign in with ${user.auth_provider}`);
    error.statusCode = 401;
    throw error;
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    const error = new Error("Invalid email/password");
    error.statusCode = 401;
    throw error
  }

  if (user.status != 'Approved'){
    const error = new Error("Account belum diverifikasi");
    error.statusCode = 401;
    throw error
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, masjid_id: user.masjid_id, peran: user.peran },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      masjid_id: user.masjid_id,
      peran: user.peran,
    },
  }
}

exports.verifyToken = async (userId) => {
  const user = await userService.getById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error
  }

  const userCopy = { ...user };
  delete userCopy.password;

  return userCopy;
}

exports.googleAuth = async (tokenPayload) => {
  try {
    const { name, email, sub: googleId, picture } = tokenPayload;
    
    const oauthData = {
      name: name,
      email: email,
      provider: 'google',
      providerId: googleId,
      foto_profil: picture
    };
    
    const user = await userService.findOrCreateByOAuth(oauthData);
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        masjid_id: user.masjid_id,
        peran: user.peran
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    return {
      token,
      user: {
        id: user.id,
        name: user.nama,
        email: user.email,
        masjid_id: user.masjid_id,
        nama_masjid: user.nama_masjid,
        peran: user.peran
      }
    };
  } catch (error) {
    console.error('Error in googleAuth:', error);
    throw error;
  }
}