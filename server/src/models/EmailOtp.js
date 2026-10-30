const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const EmailOtp = sequelize.define(
  "EmailOtp",
  {
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      primaryKey: true,
    },

    otpHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },

    registrationData: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    lastSentAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "email_otps",
    timestamps: true,
  }
);

module.exports = EmailOtp;