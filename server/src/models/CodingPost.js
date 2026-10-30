
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CodingPost = sequelize.define("CodingPost", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  problemTitle: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  code: {
    type: DataTypes.TEXT("long"),
    allowNull: false,
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  difficulty: {
    type: DataTypes.ENUM("Easy", "Medium", "Hard"),
    allowNull: true,
  },
  visibility: {
    type: DataTypes.ENUM("public", "private"),
    allowNull: false,
    defaultValue: "public",
  },
}, {
  tableName: "coding_posts",
  timestamps: true,
});

module.exports = CodingPost;
