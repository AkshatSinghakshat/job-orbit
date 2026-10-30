
const sequelize = require("../config/db");
require("../models");

const User = sequelize.models.User;
const Job = sequelize.models.Job;

const sendError = (res, error, message) => {
  console.error(`Developer API error: ${message}`, error);

  return res.status(500).json({
    success: false,
    message,
  });
};

// Dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({
      where: { isActive: true },
    });

    const totalJobs = Job ? await Job.count() : 0;

    return res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalJobs,
      },
    });
  } catch (error) {
    return sendError(res, error, "Unable to load dashboard statistics.");
  }
};

// Get users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "isActive",
        "isEmailVerified",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    return sendError(res, error, "Unable to fetch users.");
  }
};

// Activate or deactivate a user
exports.updateUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { isActive } = req.body;

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Do not let the endpoint disable a developer account.
    if (user.role === "developer") {
      return res.status(403).json({
        success: false,
        message: "Developer accounts cannot be changed here.",
      });
    }

    await user.update({ isActive });

    return res.json({
      success: true,
      message: isActive ? "User activated." : "User deactivated.",
    });
  } catch (error) {
    return sendError(res, error, "Unable to update user status.");
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (
      user.role === "developer" ||
      Number(user.id) === Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "This account cannot be deleted through this endpoint.",
      });
    }

    await user.destroy();

    return res.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    return sendError(res, error, "Unable to delete user.");
  }
};

// Get jobs
exports.getJobs = async (req, res) => {
  try {
    if (!Job) {
      return res.status(501).json({
        success: false,
        message: "Job model was not found. Check the model registration.",
      });
    }

    const jobs = await Job.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      jobs,
    });
  } catch (error) {
    return sendError(res, error, "Unable to fetch jobs.");
  }
};

// Delete a job
exports.deleteJob = async (req, res) => {
  try {
    if (!Job) {
      return res.status(501).json({
        success: false,
        message: "Job model was not found. Check the model registration.",
      });
    }

    const jobId = Number(req.params.id);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID.",
      });
    }

    const job = await Job.findByPk(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    await job.destroy();

    return res.json({
      success: true,
      message: "Job deleted successfully.",
    });
  } catch (error) {
    return sendError(res, error, "Unable to delete job.");
  }
};
