const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

module.exports = sequelize.define("TrainingInvoice", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  enrollmentId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  instituteId: { type: DataTypes.INTEGER, allowNull: false },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  invoiceNumber: { type: DataTypes.STRING(40), allowNull: false, unique: true },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  tax: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM("pending", "paid", "refunded"), allowNull: false, defaultValue: "pending" },
}, { tableName: "training_invoices", indexes: [{ fields: ["instituteId", "status"] }] });
