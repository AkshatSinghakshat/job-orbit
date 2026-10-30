
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Company = sequelize.define(
  "Company",
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

    companyName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    officialEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    industry: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    companySize: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    location: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "companies",
    timestamps: true,
  }
);

module.exports = Company;
