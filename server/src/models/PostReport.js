const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PostReport = sequelize.define(
  "PostReport",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    reason: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("pending", "reviewed", "resolved", "dismissed"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "post_reports",
    timestamps: true,
  }
);

module.exports = PostReport;