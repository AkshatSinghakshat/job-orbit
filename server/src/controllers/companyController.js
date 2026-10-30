
const {
  Company,
  User,
  Job,
  Application,
  Student,
} = require("../models");

const { Op } = require("sequelize");

// ======================================================
// GET ALL COMPANIES
// ======================================================

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error("Get Companies Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch companies",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ======================================================
// COMPANY DASHBOARD
// ======================================================

exports.getCompanyDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login again",
      });
    }

    const company = await Company.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    const jobs = await Job.findAll({
      where: { companyId: company.id },
      order: [["createdAt", "DESC"]],
    });

    const jobIds = jobs.map((job) => job.id);

    let applications = [];

    if (jobIds.length > 0) {
      applications = await Application.findAll({
        where: {
          jobId: { [Op.in]: jobIds },
        },
        include: [
          {
            model: Student,
            include: [
              {
                model: User,
                attributes: ["id", "name", "email"],
              },
            ],
          },
          {
            model: Job,
            attributes: [
              "id",
              "title",
              "location",
              "jobType",
              "status",
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }

    const plainApplications = applications.map((application) =>
      application.toJSON()
    );

    const activeJobs = jobs.filter(
      (job) => job.status === "published"
    ).length;

    const countStatus = (status) =>
      plainApplications.filter(
        (application) =>
          String(application.status).toLowerCase() ===
          status.toLowerCase()
      ).length;

    const recentJobs = jobs.slice(0, 5).map((job) => {
      const jobData = job.toJSON();

      return {
        ...jobData,
        applicationCount: plainApplications.filter(
          (application) =>
            Number(application.jobId) === Number(job.id)
        ).length,
      };
    });

    return res.status(200).json({
      success: true,
      company: {
        id: company.id,
        userId: company.userId,
        companyName: company.companyName,
        officialEmail: company.officialEmail,
        phone: company.phone,
        website: company.website,
        industry: company.industry,
        companySize: company.companySize,
        location: company.location,
        description: company.description,
        logo: company.logo,
      },
      stats: {
        activeJobs,
        totalJobs: jobs.length,
        totalApplications: plainApplications.length,
        shortlisted: countStatus("Shortlisted"),
        selected: countStatus("Selected"),
        rejected: countStatus("Rejected"),
      },
      recentJobs,
      recentApplications: plainApplications.slice(0, 10),
    });
  } catch (error) {
    console.error("Company Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load company dashboard",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// ======================================================
// UPDATE APPLICATION STATUS
// ======================================================

exports.updateApplicationStatus = async (req, res) => {
  try {
    const userId = req.user?.id;
    const applicationId = Number(req.params.id);
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login again",
      });
    }

    const allowedStatuses = [
      "Applied",
      "Shortlisted",
      "Rejected",
      "Selected",
    ];

    if (
      !Number.isInteger(applicationId) ||
      applicationId < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const company = await Company.findOne({
      where: { userId },
      attributes: ["id"],
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const application = await Application.findByPk(
      applicationId,
      {
        include: [
          {
            model: Job,
            attributes: ["id", "companyId"],
          },
        ],
      }
    );

    if (!application || !application.Job) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    if (
      Number(application.Job.companyId) !== Number(company.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot manage this application",
      });
    }

    await application.update({ status });

    return res.status(200).json({
      success: true,
      message: "Application status updated",
      application: {
        id: application.id,
        status: application.status,
      },
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update application status",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};
