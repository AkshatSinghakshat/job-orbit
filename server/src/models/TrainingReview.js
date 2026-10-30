const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

module.exports = sequelize.define("TrainingReview", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT, allowNull: true },
  isApproved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  status: { type: DataTypes.ENUM("pending", "approved", "rejected"), allowNull: false, defaultValue: "pending" },
}, { tableName: "training_reviews", indexes: [{ unique: true, fields: ["studentId", "courseId"] }] });
