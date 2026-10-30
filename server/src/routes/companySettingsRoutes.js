const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getSettings,
  updateSettings,
} = require("../controllers/companySettingsController");

router.get("/", authMiddleware, getSettings);
router.put("/", authMiddleware, updateSettings);

module.exports = router;