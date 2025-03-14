const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userService = require("../services/user.service");

exports.register = async (userData) => {
  const { name, username, email, password, masjid_id } = userData;

  const existingUser = await userService.getByUsernameOrEmail(username, email);
  if (existingUser) {
    const error = new Error("Username or email already in use");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userDataWithHash = {
    ...userData,
    password: hashedPassword,
  };

  const userId = await userService.createUser(userDataWithHash);

  const token = jwt.sign(
    { id: userId, username, email, masjid_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: userId,
      name,
      username,
      email,
      masjid_id,
    },
  }
}

exports.login = async (username, password) => {
  const user = await userService.getByUsername(username);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    const error = new Error("Invalid password");
    error.statusCode = 401;
    throw error
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, masjid_id: user.masjid_id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      masjid_id: user.masjid_id,
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