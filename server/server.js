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

// Company Settings Route
const companySettingsRoutes = require(
  "./src/routes/companySettingsRoutes"
);

// ==========================================
// DATABASE
// ==========================================

const sequelize = require("./src/config/db");
const migrateTrainingSchema = require("./src/scripts/migrateTrainingSchema");

// Register existing models and associations
require("./src/models");

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5176",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

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

// Developer Dashboard API
app.use("/api/developer", developerRoutes);

// Company Settings API
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
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "JobOrbit backend is healthy",
    timestamp: new Date().toISOString(),
  });
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

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MySQL
    await sequelize.authenticate();

    console.log("✅ MySQL Connected Successfully");

    await migrateTrainingSchema({ authenticate: false });
    // Schema changes are applied through explicit additive migrations. Global sync can
    // alter every table and race legacy schema repairs.
    // Start listening only after the database connection is ready.
    await new Promise((resolve, reject) => {
      const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`JobOrbit Server Running on Port ${PORT}`);
        resolve(server);
      });
      server.once("error", reject);
    });
  } catch (error) {
    console.error("Database/Startup Failed:", error.message);
    if (process.env.NODE_ENV !== "production") console.error(error.stack);

    process.exitCode = 1;
  }
};

startServer();
