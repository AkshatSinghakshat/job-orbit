const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

module.exports = sequelize.define("TrainingCareerSupportRequest", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  instituteId: { type: DataTypes.INTEGER, allowNull: false },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  subject: { type: DataTypes.STRING(160), allowNull: false },
  courseName: { type: DataTypes.STRING(180), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  resumeUrl: { type: DataTypes.STRING(500), allowNull: true },
  status: {
    type: DataTypes.ENUM("pending", "in_progress", "resolved", "rejected"),
    allowNull: false,
    defaultValue: "pending",
  },
}, {
  tableName: "training_career_support_requests",
  indexes: [
    { fields: ["instituteId", "status", "createdAt"] },
    { fields: ["studentId", "createdAt"] },
  ],
});
