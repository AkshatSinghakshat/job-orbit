const {
  User,
  Student,
  College,
  Company,
  TrainingInstitute,
} = require("../models");

/* =====================================================
   GET USER PROFILE
===================================================== */

const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Basic user information
    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "isActive",
        "createdAt",
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Student profile
    let student = null;

    if (user.role === "student") {
      student = await Student.findOne({
        where: {
          userId: user.id,
        },
       attributes: [
  "id",
  "userId",
  "phone",
  "college",
  "course",
  "branch",
  "passingYear",
  "profilePhoto",
  "bio",
  "skills",
  "education",
  "experience",
  "resume",
  "linkedin",
  "github",
  "projects",
  "achievements",
],
      });
    }

    // College profile
    let college = null;

    if (user.role === "college") {
      college = await College.findOne({
        where: {
          userId: user.id,
        },
        attributes: [
          "id",
          "userId",
          "phone",
          "university",
          "website",
          "address",
        ],
      });
    }

    // Company profile
    let company = null;

    if (user.role === "company") {
      company = await Company.findOne({
        where: {
          userId: user.id,
        },
        attributes: [
          "id",
          "userId",
          "phone",
          "website",
          "industry",
          "companySize",
          "location",
        ],
      });
    }

    // Training institute profile
    let trainingInstitute = null;

    if (user.role === "training") {
      trainingInstitute =
        await TrainingInstitute.findOne({
          where: {
            userId: user.id,
          },
          attributes: [
            "id",
            "userId",
            "phone",
            "website",
            "address",
            "categories",
          ],
        });
    }

    return res.status(200).json({
      success: true,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,

        Student: student,
        College: college,
        Company: company,
        TrainingInstitute: trainingInstitute,
      },
    });
  } catch (error) {
    console.error(
      "Get User Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load user profile",
    });
  }
};

module.exports = {
  getUserProfile,
};