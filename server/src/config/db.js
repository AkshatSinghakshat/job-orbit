const { Sequelize } = require("sequelize");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const requiredEnv = [
  "DB_NAME",
  "DB_USER",
  "DB_HOST",
];

const missingEnv = requiredEnv.filter(
  (key) => !process.env[key]
);

if (missingEnv.length > 0) {
  console.error(
    `❌ Missing database environment variables: ${missingEnv.join(", ")}`
  );
}

const sslEnabled =
  process.env.DB_SSL === "true";

const sequelize = new Sequelize(
  process.env.DB_NAME || "",
  process.env.DB_USER || "",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",

    logging: false,

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 1000,
    },

    retry: {
      max: 2,
    },

    define: {
      timestamps: true,
    },

    dialectOptions: sslEnabled
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: true,
          },
        }
      : {},

    timezone: "+00:00",
  }
);

module.exports = sequelize;