module.exports = {
  jwtSecret: process.env.JWT_SECRET || "your-secret-key", // secret key for JWT
  jwtExpiration: process.env.JWT_EXPIRES_IN || "1d", // 1 day
};
