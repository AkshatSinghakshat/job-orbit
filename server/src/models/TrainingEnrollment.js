const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

module.exports = sequelize.define("TrainingEnrollment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  batchId: { type: DataTypes.INTEGER, allowNull: false },
  instituteId: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM("pending", "approved", "rejected", "completed"), allowNull: false, defaultValue: "pending" },
  paymentStatus: { type: DataTypes.ENUM("pending", "paid", "refunded"), allowNull: false, defaultValue: "pending" },
}, { tableName: "training_enrollments", indexes: [{ unique: true, fields: ["studentId", "batchId"] }, { fields: ["instituteId", "status"] }] });
