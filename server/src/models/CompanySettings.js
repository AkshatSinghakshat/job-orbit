const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CompanySettings = sequelize.define(
  "CompanySettings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    companyName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      defaultValue: "",
    },

    companyEmail: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    companyWebsite: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    applicationAlerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    messageNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    publicProfile: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    showCompanyEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    showCompanyWebsite: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    allowRecruiterMessages: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    darkMode: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    compactLayout: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    loginAlerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "company_settings",
    timestamps: true,
  }
);

module.exports = CompanySettings;