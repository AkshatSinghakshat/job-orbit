
const {
  Job,
  Company,
  Application,
  Student,
  User,
} = require("../models");

const { Op } = require("sequelize");

// Allowed values
const ALLOWED_JOB_TYPES = [
  "full-time",
  "part-time",
  "internship",
  "contract",
  "remote",
];

const ALLOWED_STATUSES = ["draft", "published", "closed"];

const sendError = (res, status, message) =>
  res.status(status).json({ success: false, message });

const getCompanyByUser = async (userId) => {
  return Company.findOne({ where: { userId } });
};

const companyAttributes = [
  "id",
  "companyName",
  "location",
  "industry",
  "logo",
];

const parseNullableNumber = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

const validateJobData = (data, isUpdate = false) => {
  if (!isUpdate && (!data.title?.trim() || !data.description?.trim())) {
    return "Job title and description are required.";
  }

  if (
    data.title !== undefined &&
    (typeof data.title !== "string" || !data.title.trim())
  ) {
    return "Job title cannot be empty.";
  }

  if (
    data.description !== undefined &&
    (typeof data.description !== "string" || !data.description.trim())
  ) {
    return "Job description cannot be empty.";
  }

  if (
    data.jobType !== undefined &&
    data.jobType !== null &&
    data.jobType !== "" &&
    !ALLOWED_JOB_TYPES.includes(data.jobType)
  ) {
    return "Invalid job type.";
  }

  if (
    data.status !== undefined &&
    !ALLOWED_STATUSES.includes(data.status)
  ) {
    return "Invalid job status.";
  }

  const min = parseNullableNumber(data.salaryMin);
  const max = parseNullableNumber(data.salaryMax);
  const vacancies = parseNullableNumber(data.vacancies);

  if (Number.isNaN(min) || Number.isNaN(max)) {
    return "Salary must be a valid number.";
  }

  if (
    min !== undefined &&
    min !== null &&
    min < 0
  ) {
    return "Minimum salary cannot be negative.";
  }

  if (
    max !== undefined &&
    max !== null &&
    max < 0
  ) {
    return "Maximum salary cannot be negative.";
  }

  if (
    min !== undefined &&
    min !== null &&
    max !== undefined &&
    max !== null &&
    min > max
  ) {
    return "Minimum salary cannot exceed maximum salary.";
  }

  if (
    vacancies !== undefined &&
    (
      Number.isNaN(vacancies) ||
      !Number.isInteger(vacancies) ||
      vacancies < 1
    )
  ) {
    return "Vacancies must be a positive whole number.";
  }

  if (
    data.applicationDeadline &&
    Number.isNaN(Date.parse(data.applicationDeadline))
  ) {
    return "Invalid application deadline.";
  }

  return null;
};

const buildJobPayload = (body, existingJob = null) => {
  const fields = [
    "title",
    "description",
    "location",
    "jobType",
    "experience",
    "skills",
    "qualification",
    "applicationDeadline",
    "status",
    "vacancies",
  ];

  const payload = {};

  for (const field of fields) {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  }

  for (const field of ["location", "experience", "skills", "qualification"]) {
    if (payload[field] === "") payload[field] = null;
  }

  if (payload.title !== undefined) {
    payload.title = payload.title.trim();
  }

  if (payload.description !== undefined) {
    payload.description = payload.description.trim();
  }

  for (const field of ["salaryMin", "salaryMax"]) {
    if (body[field] !== undefined) {
      payload[field] = parseNullableNumber(body[field]);
    }
  }

  if (body.vacancies !== undefined) {
    payload.vacancies =
      body.vacancies === "" ? 1 : Number(body.vacancies);
  } else if (!existingJob) {
    payload.vacancies = 1;
  }

  if (body.applicationDeadline !== undefined) {
    payload.applicationDeadline = body.applicationDeadline || null;
  }

  return payload;
};

// ======================================================
// GET ALL PUBLISHED JOBS
// ======================================================

const getJobs = async (req, res) => {
  try {
    const where = { status: "published" };

    // Optional search and filters
    const { search, location, jobType } = req.query;

    if (search?.trim()) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search.trim()}%` } },
        { description: { [Op.like]: `%${search.trim()}%` } },
        { skills: { [Op.like]: `%${search.trim()}%` } },
      ];
    }

    if (location?.trim()) {
      where.location = { [Op.like]: `%${location.trim()}%` };
    }

    if (jobType && ALLOWED_JOB_TYPES.includes(jobType)) {
      where.jobType = jobType;
    }

    const jobs = await Job.findAll({
      where,
      include: [
        {
          model: Company,
          attributes: companyAttributes,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get Jobs Error:", error);
    return sendError(res, 500, "Failed to fetch jobs.");
  }
};

// ======================================================
// GET SINGLE JOB
// ======================================================

const getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        {
          model: Company,
          attributes: [
            "id",
            "companyName",
            "officialEmail",
            "phone",
            "website",
            "industry",
            "companySize",
            "location",
            "description",
            "logo",
          ],
        },
      ],
    });

    if (!job) {
      return sendError(res, 404, "Job not found.");
    }

    // Drafts and closed jobs should not be publicly accessible.
    if (job.status !== "published") {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 404, "Job not found.");
      }

      const company = await getCompanyByUser(userId);
      if (!company || company.id !== job.companyId) {
        return sendError(res, 404, "Job not found.");
      }
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error("Get Job By ID Error:", error);
    return sendError(res, 500, "Failed to fetch job.");
  }
};

// ======================================================
// CREATE JOB
// ======================================================

const createJob = async (req, res) => {
  try {
    const company = await getCompanyByUser(req.user.id);

    if (!company) {
      return sendError(res, 404, "Company profile not found.");
    }

    const validationError = validateJobData(req.body);
    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const payload = buildJobPayload(req.body);

    const job = await Job.create({
      ...payload,
      companyId: company.id,
      status: payload.status || "published",
    });

    const createdJob = await Job.findByPk(job.id, {
      include: [
        {
          model: Company,
          attributes: companyAttributes,
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Job created successfully.",
      job: createdJob,
    });
  } catch (error) {
    console.error("Create Job Error:", error);
    return sendError(res, 500, "Failed to create job.");
  }
};

// ======================================================
// GET LOGGED-IN COMPANY JOBS
// ======================================================

const getMyJobs = async (req, res) => {
  try {
    const company = await getCompanyByUser(req.user.id);

    if (!company) {
      return sendError(res, 404, "Company profile not found.");
    }

    const jobs = await Job.findAll({
      where: { companyId: company.id },
      include: [
        {
          model: Application,
          attributes: ["id", "studentId", "status", "appliedAt"],
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formattedJobs = jobs.map((job) => {
      const data = job.toJSON();
      const applications = data.Applications || [];

      return {
        ...data,
        applicationCount: applications.length,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedJobs.length,
      jobs: formattedJobs,
    });
  } catch (error) {
    console.error("Get My Jobs Error:", error);
    return sendError(res, 500, "Failed to fetch company jobs.");
  }
};

// ======================================================
// UPDATE JOB
// ======================================================

const updateJob = async (req, res) => {
  try {
    const company = await getCompanyByUser(req.user.id);

    if (!company) {
      return sendError(res, 404, "Company profile not found.");
    }

    const job = await Job.findOne({
      where: {
        id: req.params.id,
        companyId: company.id,
      },
    });

    if (!job) {
      return sendError(
        res,
        404,
        "Job not found or you are not authorized."
      );
    }

    const validationError = validateJobData(req.body, true);
    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const payload = buildJobPayload(req.body, job);

    await job.update(payload);

    const updatedJob = await Job.findByPk(job.id, {
      include: [
        {
          model: Company,
          attributes: companyAttributes,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Update Job Error:", error);
    return sendError(res, 500, "Failed to update job.");
  }
};

// ======================================================
// DELETE JOB
// ======================================================

const deleteJob = async (req, res) => {
  try {
    const company = await getCompanyByUser(req.user.id);

    if (!company) {
      return sendError(res, 404, "Company profile not found.");
    }

    const job = await Job.findOne({
      where: {
        id: req.params.id,
        companyId: company.id,
      },
    });

    if (!job) {
      return sendError(
        res,
        404,
        "Job not found or you are not authorized."
      );
    }

    const applicationCount = await Application.count({
      where: { jobId: job.id },
    });

    if (applicationCount > 0) {
      return sendError(
        res,
        409,
        "This job has applications. Close the job instead of deleting it."
      );
    }

    await job.destroy();

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Job Error:", error);
    return sendError(res, 500, "Failed to delete job.");
  }
};

// ======================================================
// GET APPLICATIONS FOR ONE JOB
// ======================================================

const getJobApplications = async (req, res) => {
  try {
    const company = await getCompanyByUser(req.user.id);

    if (!company) {
      return sendError(res, 404, "Company profile not found.");
    }

    const job = await Job.findOne({
      where: {
        id: req.params.id,
        companyId: company.id,
      },
    });

    if (!job) {
      return sendError(
        res,
        404,
        "Job not found or you are not authorized."
      );
    }

    const applications = await Application.findAll({
      where: { jobId: job.id },
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
            "salaryMin",
            "salaryMax",
            "applicationDeadline",
            "status",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get Job Applications Error:", error);
    return sendError(res, 500, "Failed to fetch job applications.");
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  getMyJobs,
  updateJob,
  deleteJob,
  getJobApplications,
};
