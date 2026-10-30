const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

module.exports = sequelize.define("TrainingBatch", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  instituteId: { type: DataTypes.INTEGER, allowNull: false },
  instructorId: { type: DataTypes.INTEGER, allowNull: true },
  name: { type: DataTypes.STRING(160), allowNull: false },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  capacity: { type: DataTypes.INTEGER, allowNull: false },
  enrolledCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  status: { type: DataTypes.ENUM("upcoming", "active", "completed", "cancelled"), allowNull: false, defaultValue: "upcoming" },
}, { tableName: "training_batches", indexes: [{ fields: ["instituteId", "startDate"] }] });
