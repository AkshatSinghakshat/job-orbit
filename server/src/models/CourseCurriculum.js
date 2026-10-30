const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

module.exports = sequelize.define("CourseCurriculum", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(180), allowNull: false },
  lessons: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  duration: { type: DataTypes.STRING(80), allowNull: true },
  orderIndex: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, { tableName: "course_curriculum", indexes: [{ fields: ["courseId", "orderIndex"] }] });
