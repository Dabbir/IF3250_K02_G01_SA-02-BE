module.exports = {
  jwtSecret: process.env.JWT_SECRET || "", // secret key for JWT
  jwtExpiration: process.env.JWT_EXPIRES_IN || "1d", // 1 day
};
