const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TrainingInstitute = sequelize.define(
  "TrainingInstitute",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    name: { type: DataTypes.STRING(160), allowNull: true },
    slug: { type: DataTypes.STRING(180), allowNull: true },
    logo: { type: DataTypes.STRING(500), allowNull: true },
    verifiedStatus: {
      type: DataTypes.ENUM("pending", "verified", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    contactEmail: { type: DataTypes.STRING(150), allowNull: true, validate: { isEmail: true } },
    contactPhone: { type: DataTypes.STRING(30), allowNull: true },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    categories: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "training_institutes",
    timestamps: true,
    indexes: [{ fields: ["userId"] }, { fields: ["verifiedStatus"] }],
  }
);

module.exports = TrainingInstitute;
