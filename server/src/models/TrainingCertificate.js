const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

module.exports = sequelize.define("TrainingCertificate", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  instituteId: { type: DataTypes.INTEGER, allowNull: false },
  certificateCode: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  issueDate: { type: DataTypes.DATEONLY, allowNull: false },
  verificationUrl: { type: DataTypes.STRING(500), allowNull: true },
  status: { type: DataTypes.ENUM("issued", "revoked"), allowNull: false, defaultValue: "issued" },
}, { tableName: "training_certificates", indexes: [{ fields: ["instituteId", "issueDate"] }] });
