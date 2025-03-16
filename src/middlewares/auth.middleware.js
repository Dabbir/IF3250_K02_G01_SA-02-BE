const jwt = require("jsonwebtoken");
const db = require("../config/db.config");
const userService = require("../services/user.service");
const passport = require("../config/passport.config");

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userService.getById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. User not found",
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

exports.destroyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await userService.getById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token. User not found",
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during authentication",
    });
  }
};

exports.redirectIfAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userService.getById(decoded.id);

      if (user) {
        return res.status(200).json({
          success: true,
          redirect: true,
          message: "User already logged in",
          redirectTo: "/dashboard",
        });
      } else {
        return next();
      }
    } catch (error) {
      return next();
    }
  } catch (error) {
    console.error("Redirect authentication check error:", error);
    return next();
  }
};

exports.googleAuth = (req, res, next) => {
  return passport.authenticate("google", { 
    scope: ["profile", "email"], 
    session: false 
  })(req, res, next);
};

exports.googleAuthCallback = (req, res, next) => {
  return passport.authenticate("google", { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`, 
    session: false 
  })(req, res, next);
};

exports.hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.peran)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions",
      });
    }

    next();
  };
};

exports.belongsToMasjid = (masjidIdParam = "masjid_id") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (req.user.peran === "Admin") {
      return next();
    }

    const requestedMasjidId = parseInt(
      req.params[masjidIdParam] || req.body[masjidIdParam]
    );

    if (!requestedMasjidId) {
      return next();
    }

    if (req.user.masjid_id !== requestedMasjidId) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You do not have permission to access this masjid",
      });
    }

    next();
  };
};

exports.isViewer = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const masjidId = parseInt(req.params.masjid_id || req.body.masjid_id);

    if (!masjidId) {
      return res.status(400).json({
        success: false,
        message: "Masjid ID is required",
      });
    }

    if (req.user.peran === "Admin" || req.user.masjid_id === masjidId) {
      return next();
    }

    const [rows] = await db.query(
      `SELECT * FROM viewer_access 
       WHERE viewer_id = ? AND masjid_id = ? AND status = 'Approved'`,
      [req.user.id, masjidId]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have viewer access to this masjid",
      });
    }

    next();
  } catch (error) {
    console.error("Viewer check error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during permission check",
    });
  }
};
