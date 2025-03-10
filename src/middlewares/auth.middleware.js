const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/auth.config");
const { logger } = require("../utils/logger");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.id;
    next();
  } catch (error) {
    logger.error("Token verification failed:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// // Check admin role middleware
// exports.isAdmin = async (req, res, next) => {
//   try {
//     const isAdmin = await checkIfUserIsAdmin(req.userId);

//     if (!isAdmin) {
//       return res.status(403).json({ message: "Require Admin Role!" });
//     }

//     next();
//   } catch (error) {
//     logger.error("Admin check failed:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// async function checkIfUserIsAdmin(userId) {
//   // This is just a placeholder, implement actual database check
//   return true;
// }
