
const Resume = require("../models/Resume");

const getUserId = (req) =>
  req.user?.id ?? req.user?.userId ?? req.user?.user_id;

exports.createResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Please login first" });
    }

    const { title, data } = req.body;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return res.status(400).json({ message: "Valid resume data is required" });
    }

    const resume = await Resume.create({
      userId,
      title: title || "My Resume",
      data,
    });

    return res.status(201).json({ message: "Resume saved successfully", resume });
  } catch (error) {
    console.error("Create resume error:", error);
    return res.status(500).json({ message: "Unable to save resume" });
  }
};

exports.getResumes = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Please login first" });
    }

    const resumes = await Resume.findAll({
      where: { userId },
      order: [["updatedAt", "DESC"]],
    });

    return res.json({ resumes });
  } catch (error) {
    console.error("Get resumes error:", error);
    return res.status(500).json({ message: "Unable to fetch resumes" });
  }
};

exports.getResumeById = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Please login first" });
    }

    const resume = await Resume.findOne({
      where: { id: req.params.id, userId },
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.json({ resume });
  } catch (error) {
    console.error("Get resume error:", error);
    return res.status(500).json({ message: "Unable to fetch resume" });
  }
};

exports.updateResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Please login first" });
    }

    const resume = await Resume.findOne({
      where: { id: req.params.id, userId },
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    if (req.body.title !== undefined) {
      resume.title = req.body.title;
    }

    if (req.body.data !== undefined) {
      if (
        !req.body.data ||
        typeof req.body.data !== "object" ||
        Array.isArray(req.body.data)
      ) {
        return res.status(400).json({ message: "Invalid resume data" });
      }
      resume.data = req.body.data;
    }

    await resume.save();

    return res.json({ message: "Resume updated successfully", resume });
  } catch (error) {
    console.error("Update resume error:", error);
    return res.status(500).json({ message: "Unable to update resume" });
  }
};

exports.deleteResume = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Please login first" });
    }

    const deleted = await Resume.destroy({
      where: { id: req.params.id, userId },
    });

    if (!deleted) {
      return res.status(404).json({ message: "Resume not found" });
    }

    return res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Delete resume error:", error);
    return res.status(500).json({ message: "Unable to delete resume" });
  }
};
