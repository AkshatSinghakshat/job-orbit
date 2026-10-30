const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    senderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    type: {
      type: DataTypes.ENUM(
        "follow",
        "like",
        "comment",
        "share",
        "application",
        "application_status"
      ),
      allowNull: false,
    },

    message: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    postId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    jobId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
  }
);

module.exports = Notification;