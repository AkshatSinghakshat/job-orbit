const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ProfileVisit = sequelize.define(
  "ProfileVisit",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    profileUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    visitorUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    visitCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    lastVisitedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "profile_visits",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["profileUserId", "visitorUserId"],
      },
    ],
  }
);

module.exports = ProfileVisit;