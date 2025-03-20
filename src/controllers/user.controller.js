const userService = require("../services/user.service");
const userModels = require('../models/user.model');
const { logger } = require("../utils/logger");
const fs = require("fs");
const path = require("path");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Users found",
      users,
    });
  } catch (error) {
    logger.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userService.getById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User found",
      user,
    });
  } catch (error) {
    logger.error("Get user by id error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userService.getById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const formattedUser = {
      id: user.id,
      nama: user.nama,
      email: user.email,
      peran: user.peran,
      short_bio: user.short_bio,
      alasan_bergabung: user.alasan_bergabung,
      foto_profil: user.foto_profil,
      masjid_id: user.masjid_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      nama_masjid: user.nama_masjid,
      alamat_masjid: user.nama_masjid,
    };

    res.status(200).json({
      success: true,
      message: "User found",
      user: formattedUser,
    });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getProfilePhoto = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../uploads", filename);

  if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
  } else {
      res.status(404).json({ message: "Foto tidak ditemukan" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = req.body;

    if (req.file) {
      userData.foto_profil = req.fileUrl;
    }

    const result = await userService.updateUser(userId, userData);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    logger.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const userData = req.body;
    const user = await userService.createUser(userData);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    logger.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const userData = req.body;
    const result = await userService.updateUser(userId, userData);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    logger.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await userService.deleteUser(userId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    logger.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
