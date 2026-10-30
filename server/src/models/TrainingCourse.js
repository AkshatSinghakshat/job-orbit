module.exports = (sequelize, DataTypes) => {
  const TrainingCourse = sequelize.define("TrainingCourse", {
    title: { type: DataTypes.STRING(180), allowNull: false },
    slug: { type: DataTypes.STRING(200), allowNull: true },
    category: { type: DataTypes.STRING(100), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    level: { type: DataTypes.ENUM("Beginner", "Intermediate", "Advanced", "All levels"), allowNull: false, defaultValue: "All levels" },
    duration: { type: DataTypes.STRING(80), allowNull: true },
    durationWeeks: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    fee: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
    mode: { type: DataTypes.ENUM("Online","Offline","Hybrid"), allowNull: false, defaultValue: "Online" },
    status: { type: DataTypes.ENUM("Draft","Published","Archived"), allowNull: false, defaultValue: "Draft" },
    instituteId: { type: DataTypes.INTEGER, allowNull: true }
  }, { tableName: "training_courses", timestamps: true, indexes: [{ fields: ["instituteId", "status"] }, { fields: ["instituteId", "slug"], unique: true }, { fields: ["category"] }] });
  return TrainingCourse;
};
