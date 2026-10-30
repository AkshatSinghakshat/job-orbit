
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Resume = sequelize.define(
  "Resume",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: "My Resume",
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    tableName: "resumes",
    timestamps: true,
  }
);

module.exports = Resume;
