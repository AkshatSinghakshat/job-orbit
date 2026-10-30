const { Op } = require("sequelize");

const {
  User,
  Student,
  Job,
  Company,
  Application,
} = require("../models");

// =====================================================
// GET STUDENT DASHBOARD
// =====================================================

const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // =================================================
    // STUDENT + USER
    // =================================================

    const student = await Student.findOne({
      where: {
        userId,
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // =================================================
    // TOTAL AVAILABLE JOBS
    // =================================================

    const totalJobs = await Job.count({
      where: {
        status: "published",
        [Op.or]: [
          {
            applicationDeadline: {
              [Op.gte]: new Date(),
            },
          },
          {
            applicationDeadline: null,
          },
        ],
      },
    });

    // =================================================
    // TOTAL APPLICATIONS
    // =================================================

    const totalApplications = await Application.count({
      where: {
        studentId: student.id,
      },
    });

    // =================================================
    // SHORTLISTED APPLICATIONS
    // =================================================

    const shortlistedApplications = await Application.count({
      where: {
        studentId: student.id,
        status: "shortlisted",
      },
    });

    // =================================================
    // LATEST JOBS
    // =================================================

    const latestJobs = await Job.findAll({
      where: {
        status: "published",
      },

      include: [
        {
          model: Company,
          attributes: [
            "id",
            "companyName",
            "website",
            "industry",
            "companySize",
            "location",
            "logo",
          ],

          include: [
            {
              model: User,
              attributes: ["id", "name"],
            },
          ],
        },
      ],

      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    // =================================================
    // STUDENT APPLICATIONS
    // =================================================

    const applications = await Application.findAll({
      where: {
        studentId: student.id,
      },

      include: [
        {
          model: Job,

          attributes: [
            "id",
            "title",
            "location",
            "jobType",
            "salaryMin",
            "salaryMax",
          ],

          include: [
            {
              model: Company,

              attributes: [
                "id",
                "companyName",
                "location",
                "logo",
              ],

              include: [
                {
                  model: User,
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
      ],

      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    // =================================================
    // PROFILE COMPLETION
    // =================================================

    const profileFields = [
      student.phone,
      student.college,
      student.course,
      student.branch,
      student.passingYear,
      student.profilePhoto,
      student.bio,
      student.skills,
      student.education,
      student.experience,
      student.resume,
      student.linkedin,
      student.github,
      student.projects,
      student.achievements,
    ];

    const completedFields = profileFields.filter(
      (field) =>
        field !== null &&
        field !== undefined &&
        String(field).trim() !== ""
    ).length;

    const profileCompletion = Math.round(
      (completedFields / profileFields.length) * 100
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      student: {
        id: student.id,
        userId: student.userId,

        name: student.User?.name || "",
        email: student.User?.email || "",
        role: student.User?.role || "student",

        phone: student.phone,
        college: student.college,
        course: student.course,
        branch: student.branch,
        passingYear: student.passingYear,

        profilePhoto: student.profilePhoto,
        bio: student.bio,
        skills: student.skills,
        education: student.education,
        experience: student.experience,
        resume: student.resume,
        linkedin: student.linkedin,
        github: student.github,
        projects: student.projects,
        achievements: student.achievements,
      },

      statistics: {
        totalJobs,
        totalApplications,
        shortlistedApplications,
        profileCompletion,
      },

      latestJobs,
      applications,
    });
  } catch (error) {
    console.error("Student Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load student dashboard",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =====================================================
// UPDATE STUDENT PROFILE
// =====================================================

const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      email,
      phone,
      college,
      course,
      branch,
      passingYear,
      bio,
      skills,
      education,
      experience,
      linkedin,
      github,
      projects,
      achievements,
    } = req.body;

    // =================================================
    // USER
    // =================================================

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // =================================================
    // STUDENT
    // =================================================

    const student = await Student.findOne({
      where: {
        userId,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // =================================================
    // EMAIL
    // =================================================

    const newEmail =
      typeof email === "string"
        ? email.trim()
        : user.email;

    if (newEmail !== user.email) {
      const existingUser = await User.findOne({
        where: {
          email: newEmail,

          id: {
            [Op.ne]: userId,
          },
        },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // =================================================
    // UPDATE USER
    // =================================================

    await user.update({
      name:
        typeof name === "string" && name.trim() !== ""
          ? name.trim()
          : user.name,

      email: newEmail,
    });

    // =================================================
    // UPDATE STUDENT
    // =================================================

    const studentData = {};

    if (phone !== undefined) {
      studentData.phone =
        typeof phone === "string"
          ? phone.trim()
          : phone;
    }

    if (college !== undefined) {
      studentData.college =
        typeof college === "string"
          ? college.trim()
          : college;
    }

    if (course !== undefined) {
      studentData.course =
        typeof course === "string"
          ? course.trim()
          : course;
    }

    if (branch !== undefined) {
      studentData.branch =
        typeof branch === "string"
          ? branch.trim()
          : branch;
    }

    if (
      passingYear !== undefined &&
      passingYear !== ""
    ) {
      const year = Number(passingYear);

      if (!Number.isNaN(year)) {
        studentData.passingYear = year;
      }
    }

    if (bio !== undefined) {
      studentData.bio =
        typeof bio === "string"
          ? bio.trim()
          : bio;
    }

    if (skills !== undefined) {
      studentData.skills =
        typeof skills === "string"
          ? skills.trim()
          : skills;
    }

    if (education !== undefined) {
      studentData.education =
        typeof education === "string"
          ? education.trim()
          : education;
    }

    if (experience !== undefined) {
      studentData.experience =
        typeof experience === "string"
          ? experience.trim()
          : experience;
    }

    if (linkedin !== undefined) {
      studentData.linkedin =
        typeof linkedin === "string"
          ? linkedin.trim()
          : linkedin;
    }

    if (github !== undefined) {
      studentData.github =
        typeof github === "string"
          ? github.trim()
          : github;
    }

    if (projects !== undefined) {
      studentData.projects =
        typeof projects === "string"
          ? projects.trim()
          : projects;
    }

    if (achievements !== undefined) {
      studentData.achievements =
        typeof achievements === "string"
          ? achievements.trim()
          : achievements;
    }

    // =================================================
    // RESUME
    // =================================================

    if (req.file) {
      studentData.resume =
        `/uploads/resumes/${req.file.filename}`;
    }

    // =================================================
    // SAVE STUDENT
    // =================================================

    await student.update(studentData);

    // =================================================
    // GET UPDATED PROFILE
    // =================================================

    const updatedStudent = await Student.findOne({
      where: {
        userId,
      },

      include: [
        {
          model: User,
          attributes: [
            "id",
            "name",
            "email",
            "role",
          ],
        },
      ],
    });

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      student: {
        id: updatedStudent.id,
        userId: updatedStudent.userId,

        name: updatedStudent.User?.name || "",
        email: updatedStudent.User?.email || "",
        role:
          updatedStudent.User?.role || "student",

        phone: updatedStudent.phone,
        college: updatedStudent.college,
        course: updatedStudent.course,
        branch: updatedStudent.branch,
        passingYear: updatedStudent.passingYear,

        profilePhoto:
          updatedStudent.profilePhoto,

        bio: updatedStudent.bio,
        skills: updatedStudent.skills,
        education: updatedStudent.education,
        experience: updatedStudent.experience,
        resume: updatedStudent.resume,
        linkedin: updatedStudent.linkedin,
        github: updatedStudent.github,
        projects: updatedStudent.projects,
        achievements:
          updatedStudent.achievements,
      },
    });
  } catch (error) {
    console.error(
      "Update Student Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getStudentDashboard,
  updateStudentProfile,
};