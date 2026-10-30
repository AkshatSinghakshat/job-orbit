const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

module.exports = sequelize.define("TrainingInstructor", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  instituteId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(150), allowNull: false, validate: { isEmail: true } },
  specialization: { type: DataTypes.STRING(180), allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  availabilityJson: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
}, { tableName: "training_instructors", indexes: [{ fields: ["instituteId", "status"] }] });
