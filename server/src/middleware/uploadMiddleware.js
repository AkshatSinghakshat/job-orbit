
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const resumeDirectory = path.join(
  process.cwd(),
  "uploads",
  "resumes"
);

if (!fs.existsSync(resumeDirectory)) {
  fs.mkdirSync(resumeDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumeDirectory);
  },

  filename: (req, file, cb) => {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return cb(new Error("Authenticated user ID is missing"));
    }

    const extension = path.extname(file.originalname).toLowerCase();

    cb(null, `resume-${userId}-${Date.now()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype !== "application/pdf" ||
    path.extname(file.originalname).toLowerCase() !== ".pdf"
  ) {
    return cb(new Error("Only PDF resume files are allowed"));
  }

  cb(null, true);
};

const uploadResume = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = { uploadResume };
