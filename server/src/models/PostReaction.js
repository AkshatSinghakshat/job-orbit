const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PostReaction = sequelize.define(
  "PostReaction",
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

    reaction: {
      type: DataTypes.ENUM(
        "like",
        "love",
        "haha",
        "wow",
        "sad",
        "angry"
      ),
      allowNull: false,
      defaultValue: "like",
    },
  },
  {
    tableName: "post_reactions",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "postId"],
      },
    ],
  }
);

module.exports = PostReaction;