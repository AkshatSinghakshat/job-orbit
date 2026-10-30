
const authMiddleware = require("./authMiddleware");

const developerAuth = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (!req.user || req.user.role !== "developer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Developer account required.",
      });
    }

    next();
  });
};

module.exports = developerAuth;
