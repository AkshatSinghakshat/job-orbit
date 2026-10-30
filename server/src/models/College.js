const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const College = sequelize.define(
  "College",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    university: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "colleges",
    timestamps: true,
  }
);

module.exports = College;