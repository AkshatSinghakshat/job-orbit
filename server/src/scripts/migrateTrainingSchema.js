require("dotenv").config();
const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const models = require("../models");

const additions = {
  training_institutes: {
    name: { type: DataTypes.STRING(160), allowNull: true },
    slug: { type: DataTypes.STRING(180), allowNull: true },
    logo: { type: DataTypes.STRING(500), allowNull: true },
    verifiedStatus: { type: DataTypes.ENUM("pending", "verified", "rejected"), allowNull: false, defaultValue: "pending" },
    contactEmail: { type: DataTypes.STRING(150), allowNull: true },
    contactPhone: { type: DataTypes.STRING(30), allowNull: true },
  },
  training_courses: {
    slug: { type: DataTypes.STRING(200), allowNull: true },
    level: { type: DataTypes.ENUM("Beginner", "Intermediate", "Advanced", "All levels"), allowNull: false, defaultValue: "All levels" },
    duration: { type: DataTypes.STRING(80), allowNull: true },
  },
  training_reviews: {
    status: { type: DataTypes.ENUM("pending", "approved", "rejected"), allowNull: false, defaultValue: "pending" },
  },
};

const indexes = [
  { table: "training_institutes", name: "training_institutes_verified_status", fields: ["verifiedStatus"] },
  { table: "training_institutes", name: "training_institutes_slug_unique", fields: ["slug"], unique: true },
  { table: "training_courses", name: "training_courses_institute_slug_unique", fields: ["instituteId", "slug"], unique: true },
  { table: "training_courses", name: "training_courses_institute_status", fields: ["instituteId", "status"] },
  { table: "training_courses", name: "training_courses_category", fields: ["category"] },
];

const foreignKeys = [
  { table: "training_institutes", column: "userId", parent: "users", name: "training_institutes_user_fk" },
  { table: "training_courses", column: "instituteId", parent: "training_institutes", name: "training_courses_institute_fk" },
];

async function migrate({ authenticate = true, log = true } = {}) {
  if (authenticate) await sequelize.authenticate();
  const query = sequelize.getQueryInterface();

  for (const [table, columns] of Object.entries(additions)) {
    if (!(await query.tableExists(table))) {
      if (table === "training_reviews") continue;
      throw new Error(`Required table ${table} does not exist. Run the project's baseline migrations first.`);
    }
    let present = await query.describeTable(table);
    if (table === "training_institutes" && !present.verifiedStatus) {
      const legacyStatus = ["verified_status", "verificationStatus", "verification_status"].find((name) => present[name]);
      if (legacyStatus) {
        await query.renameColumn(table, legacyStatus, "verifiedStatus");
        present = await query.describeTable(table);
      }
    }
    for (const [name, definition] of Object.entries(columns)) {
      if (!present[name]) {
        await query.addColumn(table, name, definition);
        if (table === "training_reviews" && name === "status") {
          await sequelize.query("UPDATE training_reviews SET status = CASE WHEN isApproved = 1 THEN 'approved' ELSE 'pending' END");
        }
      }
    }
  }

  for (const index of indexes) {
    const present = await query.showIndex(index.table);
    const fieldsMatch = (item) => item.fields?.map((field) => field.attribute || field.name).join(",") === index.fields.join(",");
    if (!present.some((item) => fieldsMatch(item) && Boolean(item.unique) === Boolean(index.unique))) {
      await query.addIndex(index.table, index.fields, { name: index.name, unique: Boolean(index.unique) });
    }
  }

  for (const relation of foreignKeys) {
    const [existing] = await sequelize.query(
      "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column AND REFERENCED_TABLE_NAME = :parent LIMIT 1",
      { replacements: { table: relation.table, column: relation.column, parent: relation.parent } }
    );
    if (existing.length) continue;
    const [orphans] = await sequelize.query(
      `SELECT COUNT(*) AS count FROM \`${relation.table}\` child LEFT JOIN \`${relation.parent}\` parent ON parent.id = child.\`${relation.column}\` WHERE child.\`${relation.column}\` IS NOT NULL AND parent.id IS NULL`
    );
    if (Number(orphans[0]?.count) > 0) {
      throw new Error(`Cannot add ${relation.name}: orphan references exist in ${relation.table}.${relation.column}. Resolve those rows before retrying.`);
    }
    await query.addConstraint(relation.table, {
      fields: [relation.column],
      type: "foreign key",
      name: relation.name,
      references: { table: relation.parent, field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }

  // Create only newly introduced training tables that are absent. Existing
  // tables are never synchronized or altered by this step.
  const newTrainingModels = [
    models.CourseCurriculum,
    models.TrainingInstructor,
    models.TrainingBatch,
    models.TrainingEnrollment,
    models.TrainingInvoice,
    models.TrainingCertificate,
    models.TrainingReview,
    models.TrainingCareerSupportRequest,
  ];
  for (const model of newTrainingModels) {
    const table = model.getTableName();
    if (!(await query.tableExists(table))) await model.sync();
  }

  if (log) console.log("Training schema migration completed. Existing rows were preserved.");
}

module.exports = migrate;

if (require.main === module) migrate()
  .catch((error) => {
    console.error("Training schema migration failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => sequelize.close());
