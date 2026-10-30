const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Repost = sequelize.define(
  "Repost",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "reposts",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "postId"],
      },
    ],
  }
);

module.exports = Repost;