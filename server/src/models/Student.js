const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Student = sequelize.define(
  "Student",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    // ================= BASIC INFORMATION =================

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    college: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    course: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    branch: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    passingYear: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    // ================= PROFILE =================

    profilePhoto: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    skills: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ================= EDUCATION =================

    education: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ================= EXPERIENCE =================

    experience: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ================= RESUME =================

    resume: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    // ================= SOCIAL LINKS =================

    linkedin: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    github: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    // ================= PROJECTS =================

    projects: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ================= ACHIEVEMENTS =================

    achievements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "students",
    timestamps: true,
  }
);

module.exports = Student;