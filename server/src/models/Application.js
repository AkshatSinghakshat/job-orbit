
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Candidate details
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    linkedin: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    github: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    qualification: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    college: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    passingYear: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    percentage: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    experienceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    experienceYears: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    skills: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    projects: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    expectedSalary: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    availability: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Resume file path
    resume: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "applied",
        "shortlisted",
        "interview",
        "selected",
        "rejected"
      ),
      allowNull: false,
      defaultValue: "applied",
    },

    appliedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "applications",
    timestamps: true,
  }
);

module.exports = Application;
