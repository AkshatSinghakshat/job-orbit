
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Post = sequelize.define(
  "Post",
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

    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    mediaUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    mediaType: {
      type: DataTypes.ENUM("image", "video"),
      allowNull: true,
    },

    postType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "post",
    },

    visibility: {
      type: DataTypes.ENUM("public", "followers"),
      allowNull: false,
      defaultValue: "public",
    },
  },
  {
    tableName: "posts",
    timestamps: true,
  }
);

module.exports = Post;
