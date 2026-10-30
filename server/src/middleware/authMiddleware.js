const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check Authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn(
      `[AUTH] Missing Bearer token: ${req.method} ${req.originalUrl}`
    );

    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in again.",
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token is missing.",
    });
  }

  // 2. Check JWT_SECRET configuration
  if (!process.env.JWT_SECRET) {
    console.error("[AUTH] JWT_SECRET is missing in backend environment.");

    return res.status(500).json({
      success: false,
      message: "Authentication server configuration error.",
    });
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach decoded user data
    req.user = decoded;

    return next();
  } catch (error) {
    console.warn(
      `[AUTH] Token verification failed: ${error.name} on ${req.method} ${req.originalUrl}`
    );

    let message = "Invalid or expired token.";

    if (error.name === "TokenExpiredError") {
      message = "Your session has expired. Please log in again.";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid authentication token. Please log in again.";
    }

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

module.exports = authMiddleware;
