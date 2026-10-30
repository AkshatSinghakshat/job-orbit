
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CodingSubmission = sequelize.define("CodingSubmission", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  problemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  code: {
    type: DataTypes.TEXT("long"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM(
      "Pending",
      "Accepted",
      "Wrong Answer",
      "Runtime Error",
      "Compilation Error"
    ),
    allowNull: false,
    defaultValue: "Pending",
  },
  passedTests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalTests: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  executionTimeMs: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: "coding_submissions",
  timestamps: true,
});

module.exports = CodingSubmission;

