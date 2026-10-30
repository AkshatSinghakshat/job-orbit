const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    attachmentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    attachmentName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    attachmentType: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    attachmentSize: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "messages",
    timestamps: true,
  }
);

module.exports = Message;
