const express = require("express");

const {
  recordProfileVisit,
  getProfileVisitors,
} = require("../controllers/profileVisitController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/:userId",
  authMiddleware,
  recordProfileVisit
);
router.get(
  "/:userId",
  authMiddleware,
  getProfileVisitors
);

module.exports = router;