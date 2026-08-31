const express = require("express");
const User = require("./src/models/User");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
require("dotenv").config();

const sequelize = require("./src/config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JobOrbit API is running",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log("✅ MySQL Connected Successfully");

    await sequelize.sync();

    console.log("✅ Database Synced Successfully");

    app.listen(PORT, () => {
      console.log(`🚀 JobOrbit Server Running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error.message);
  }
};

startServer();