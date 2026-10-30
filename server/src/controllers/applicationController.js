
const {
  Application,
  Job,
  Company,
  Student,
  
  Notification,
} = require("../models");
// Get logged-in user's ID from JWT
const getUserId = (req) =>
  req.user?.id || req.user?.userId || req.user?.user_id;

// Find student profile belonging to logged-in user
const getStudent = async (req) => {
  const userId = getUserId(req);

  if (!userId) {
    return null;
  }

  return Student.findOne({
    where: { userId },
  });
};

// Create a new job application
const createApplication = async (req, res) => {
  try {
    const student = await getStudent(req);

    if (!student) {
      return res.status(403).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const jobId = Number(req.body?.jobId);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid jobId is required",
      });
    }

    const job = await Job.findByPk(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const existingApplication = await Application.findOne({
      where: {
        jobId,
        studentId: student.id,
      },
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    const fields = [
      "fullName",
      "email",
      "phone",
      "city",
      "linkedin",
      "github",
      "qualification",
      "college",
      "passingYear",
      "percentage",
      "experienceType",
      "experienceYears",
      "skills",
      "projects",
      "expectedSalary",
      "availability",
      "coverLetter",
    ];

    const data = {
      jobId,
      studentId: student.id,
      resume: req.file
        ? `uploads/resumes/${req.file.filename}`
        : null,
    };

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
      }
    }

    const application = await Application.create(data);

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Create Application Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
    });
  }
};

// Get logged-in student's applications
const getMyApplications = async (req, res) => {
  try {
    const student = await getStudent(req);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const applications = await Application.findAll({
      where: {
        studentId: student.id,
      },
      include: [
        {
          model: Job,
          required: false,
        },
      ],
      order: [["appliedAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Get My Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
    });
  }
};


const getCompanyApplicationStats = async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in first",
      });
    }

    const company = await Company.findOne({
      where: { userId },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    const jobs = await Job.findAll({
      where: { companyId: company.id },
      attributes: ["id"],
    });

    const jobIds = jobs.map((job) => job.id);

    if (jobIds.length === 0) {
      return res.json({
        success: true,
        stats: {
          total: 0,
          applied: 0,
          shortlisted: 0,
          interview: 0,
          selected: 0,
          rejected: 0,
        },
      });
    }

    const applications = await Application.findAll({
      where: { jobId: jobIds },
      attributes: ["id", "status"],
    });

    const stats = {
      total: applications.length,
      applied: 0,
      shortlisted: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
    };

    applications.forEach((application) => {
      const status = String(application.status || "").toLowerCase();

      if (Object.prototype.hasOwnProperty.call(stats, status)) {
        stats[status] += 1;
      }
    });

    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Company Application Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application statistics",
    });
  }
};


// Get applications for the logged-in company

const getCompanyApplications = async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in first",
      });
    }

    const company = await Company.findOne({
      where: { userId },
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    const jobs = await Job.findAll({
      where: { companyId: company.id },
      attributes: ["id", "title"],
    });

    const jobIds = jobs.map((job) => job.id);

    if (jobIds.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        applications: [],
      });
    }

    const applications = await Application.findAll({
      where: {
        jobId: jobIds,
      },
      include: [
        {
          model: Job,
          attributes: [
            "id",
            "title",
            "location",
            "jobType",
          ],
          required: true,
        },
        {
          model: Student,
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      total: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get Company Applications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applicants",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};


// Update application status — company only

const updateApplicationStatus = async (req, res) => {
  try {
    const userId = getUserId(req);
    const applicationId = Number(req.params.id);

    const status = String(req.body?.status || "")
      .trim()
      .toLowerCase();

    // Check login
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in first",
      });
    }

    // Validate application ID
    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    // Allowed application statuses
    const allowedStatuses = [
      "applied",
      "shortlisted",
      "interview",
      "selected",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
        allowedStatuses,
      });
    }

    // Find logged-in company
    const company = await Company.findOne({
      where: { userId },
    });

    if (!company) {
      return res.status(403).json({
        success: false,
        message: "Company profile not found",
      });
    }

    // Find application and its job
    const application = await Application.findByPk(
      applicationId,
      {
        include: [
          {
            model: Job,
            attributes: ["id", "companyId", "title"],
            required: true,
          },
        ],
      }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Verify that this job belongs to the logged-in company
    if (
      Number(application.Job.companyId) !== Number(company.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this application",
      });
    }

    // IMPORTANT: Save old status before updating
    const previousStatus = String(application.status || "")
      .trim()
      .toLowerCase();

    // Update the application only once
    await application.update({ status });

    // Create notification only if the status changed
    if (previousStatus !== status) {
      try {
        const student = await Student.findByPk(
          application.studentId,
          {
            attributes: ["id", "userId"],
          }
        );

        if (student?.userId) {
          const statusMessages = {
            applied: "Your application has been marked as Applied.",
            shortlisted: "Congratulations! You have been shortlisted.",
            interview: "Your application has moved to the Interview stage.",
            selected: "Congratulations! You have been selected.",
            rejected: "Your application status has been updated to Rejected.",
          };

          await Notification.create({
            recipientId: student.userId,
            senderId: userId,
            type: "application_status",
            message: `${application.Job.title}: ${
              statusMessages[status] ||
              "Your application status was updated."
            }`,
            jobId: application.jobId,
            applicationId: application.id,
            isRead: false,
          });
        } else {
          console.warn(
            "Application updated, but student user was not found.",
            application.studentId
          );
        }
      } catch (notificationError) {
        // Do not fail the status update if notification creation fails
        console.error(
          "Application Notification Error:",
          notificationError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application: {
        id: application.id,
        jobId: application.jobId,
        studentId: application.studentId,
        status: application.status,
        updatedAt: application.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// Get one application — student owner or owning company
const getApplicationById = async (req, res) => {
  try {
    const userId = getUserId(req);
    const applicationId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please log in first",
      });
    }

    if (
      !Number.isInteger(applicationId) ||
      applicationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application = await Application.findByPk(
      applicationId,
      {
        include: [
          { model: Job, required: false },
          { model: Student, required: false },
        ],
      }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const student = await Student.findOne({
      where: { userId },
    });

    const company = await Company.findOne({
      where: { userId },
    });

    const isStudentOwner =
      student &&
      Number(application.studentId) === Number(student.id);

    const isCompanyOwner =
      company &&
      application.Job &&
      Number(application.Job.companyId) === Number(company.id);

    if (!isStudentOwner && !isCompanyOwner) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this application",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get Application By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application",
    });
  }
};

module.exports = {
  createApplication,
  getMyApplications,
  getCompanyApplicationStats,
  getCompanyApplications,
  updateApplicationStatus,
  getApplicationById,
};
