const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Follow = sequelize.define(
  "Follow",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "follows",
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ["followerId", "followingId"],
      },
    ],
  }
);

module.exports = Follow;