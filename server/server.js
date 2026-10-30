require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ==========================================
// ROUTES
// ==========================================

const emailOtpRoutes = require("./src/routes/emailOtpRoutes");
const applicationRoutes = require("./src/routes/applicationRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const commentRoutes = require("./src/routes/commentRoutes");
const likeRoutes = require("./src/routes/likeRoutes");
const jobRoutes = require("./src/routes/jobRoutes");
const authRoutes = require("./src/routes/authRoutes");
const companyRoutes = require("./src/routes/companyRoutes");
const trainingRoutes = require("./src/routes/trainingRoutes");

const studentRoutes = require("./src/routes/studentRoutes");
const postRoutes = require("./src/routes/postRoutes");
const shareRoutes = require("./src/routes/shareRoutes");
const followRoutes = require("./src/routes/followRoutes");
const userRoutes = require("./src/routes/userRoutes");
const resumeRoutes = require("./src/routes/resumeRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const codeArenaRoutes = require("./src/routes/codeArenaRoutes");
const profileVisitRoutes = require("./src/routes/profileVisitRoutes");
const developerRoutes = require("./src/routes/developerRoutes");
const companySettingsRoutes = require(
  "./src/routes/companySettingsRoutes"
);

// ==========================================
// DATABASE & MODELS
// ==========================================

const sequelize = require("./src/config/db");
const migrateTrainingSchema = require(
  "./src/scripts/migrateTrainingSchema"
);

// Register existing models and associations.
require("./src/models");

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5176",
  process.env.FRONTEND_URL,
]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/+$/, ""));

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header may include health checks.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn("Blocked CORS origin:", origin);

      return callback(
        new Error(`CORS origin not allowed: ${origin}`)
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);

// ==========================================
// GLOBAL MIDDLEWARE
// ==========================================

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ==========================================
// STATIC UPLOADS
// ==========================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ==========================================
// AUTHENTICATION & EMAIL OTP
// ==========================================

app.use("/api/auth", emailOtpRoutes);
app.use("/api/auth", authRoutes);

// ==========================================
// OTHER API ROUTES
// ==========================================

app.use("/api/resumes", resumeRoutes);
app.use("/api/messages", messageRoutes);

app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/training", trainingRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/profile-visits", profileVisitRoutes);
app.use("/api/codearena", codeArenaRoutes);

app.use("/api/developer", developerRoutes);
app.use("/api/company-settings", companySettingsRoutes);

// ==========================================
// ROOT ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JobOrbit API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

// ==========================================
// LIVENESS CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JobOrbit backend is running",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// DATABASE READINESS CHECK
// ==========================================

app.get("/api/ready", async (req, res) => {
  try {
    await sequelize.authenticate();

    return res.status(200).json({
      success: true,
      message: "Database connection is ready",
    });
  } catch (error) {
    console.error("Readiness check failed:", error.message);

    return res.status(503).json({
      success: false,
      message: "Database is unavailable",
    });
  }
});

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ==========================================
// SERVER STARTUP
// ==========================================

const PORT = Number(process.env.PORT) || 5000;

let httpServer;

const startServer = async () => {
  // Start listening before connecting to the database.
  // This lets Render detect the open HTTP port even if
  // the database is temporarily unavailable.

  httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 JobOrbit Server listening on port ${PORT}`);
  });

  httpServer.on("error", (error) => {
    console.error("❌ HTTP Server Error:", error.message);
    process.exit(1);
  });

  try {
    // Validate the database connection.
    await sequelize.authenticate();

    console.log("✅ MySQL Connected Successfully");

    // Run the existing additive training schema migration.
    await migrateTrainingSchema({
      authenticate: false,
    });

    console.log("✅ Training schema migration completed");
  } catch (error) {
    // Keep the HTTP server alive so Render can reach the
    // health endpoint. Database-dependent requests may fail
    // until the connection or migration problem is resolved.
    console.error(
      "❌ Database/Startup Failed:",
      error.message
    );
  }
};

// ==========================================
// PROCESS ERROR HANDLING
// ==========================================

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);

  if (httpServer) {
    httpServer.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

startServer();