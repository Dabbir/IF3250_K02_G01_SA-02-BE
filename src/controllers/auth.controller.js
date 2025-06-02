const e = require("cors");
const jwt = require("jsonwebtoken");
const authService = require("../services/auth.service");
const { validationResult } = require("express-validator");

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      })
    }

    const userData = req.body;
    if (req.file && req.file.fieldname === 'fotoProfil') {
      userData.foto_profil = req.file.path;
    }

    if (req.file && req.file.fieldname === 'dokumenPendaftaran') {
      userData.dokumen_pendaftaran = req.file.path;
      userData.dokumen_public_id = req.file.filename || req.file.public_id;
    }
    
    const { user, token } = await authService.register(userData);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    })
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.callback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.ORIGIN}/login?error=auth_failed`);
    }

    const token = jwt.sign(
      { 
        id: req.user.id, 
        email: req.user.email,
        peran: req.user.peran || 'Editor',
        masjid_id: req.user.masjid_id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    const redirectUrl = new URL('/auth/google/callback', process.env.ORIGIN);
    redirectUrl.searchParams.append('token', token);
    console.log("redirectUrl", redirectUrl.toString());
    
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Error during Google callback:', error);
    res.redirect(`${process.env.ORIGIN}/login?error=auth_failed`);
  }
}

exports.me = async (req, res) => {
  try {
    const user = { ...req.user };
    delete user.password;
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("authHeader", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await authService.verifyToken(userId);

    res.status(200).json({
      success: true,
      message: "Token verified",
      user,
    });
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
