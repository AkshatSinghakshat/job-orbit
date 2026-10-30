const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    parentId: {
  type: DataTypes.INTEGER,
  allowNull: true,
},

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    tableName: "comments",
    timestamps: true,
  }
);

module.exports = Comment;