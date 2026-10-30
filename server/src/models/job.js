const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    jobType: {
      type: DataTypes.ENUM(
        "full-time",
        "part-time",
        "internship",
        "contract",
        "remote"
      ),
      allowNull: false,
      defaultValue: "full-time",
    },

    salaryMin: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    salaryMax: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },

    experience: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    skills: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    qualification: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    vacancies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    applicationDeadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("draft", "published", "closed"),
      allowNull: false,
      defaultValue: "published",
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
  }
);

module.exports = Job;
