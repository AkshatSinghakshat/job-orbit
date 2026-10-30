const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Share = sequelize.define(
  "Share",
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
  },
  {
    tableName: "shares",
    timestamps: true,
  }
);

module.exports = Share;