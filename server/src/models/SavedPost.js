const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SavedPost = sequelize.define(
  "SavedPost",
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
    tableName: "saved_posts",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "postId"],
      },
    ],
  }
);

module.exports = SavedPost;