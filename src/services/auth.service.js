const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const { jwtSecret, jwtExpiration } = require('../config/auth.config');

class AuthService {
  async register(userData) {
    const existingUser = await userModel.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error('Email already in use');
      error.statusCode = 409;
      throw error;
    }
    
    const user = await userModel.create(userData);
    const token = this.generateToken(user);
    
    return {
      message: 'User registered successfully',
      user,
      token
    };
  }
  
  async login(email, password) {
    const user = await userModel.findByEmail(email);
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
    
    const passwordIsValid = await userModel.verifyPassword(password, user.password);
    
    if (!passwordIsValid) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }
    const token = this.generateToken(user);
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token
    };
  }
  
  async getProfile(userId) {
    return await userModel.findById(userId);
  }
  
  generateToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role },
      jwtSecret,
      { expiresIn: jwtExpiration }
    );
  }
}

module.exports = new AuthService();