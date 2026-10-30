
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CodingProblem = sequelize.define("CodingProblem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT("long"),
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM("Easy", "Medium", "Hard"),
    allowNull: false,
    defaultValue: "Easy",
  },
  topic: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  sampleInput: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sampleOutput: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: "coding_problems",
  timestamps: true,
});

module.exports = CodingProblem;
