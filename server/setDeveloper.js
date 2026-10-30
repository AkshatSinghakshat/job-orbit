
require("dotenv").config();

const readline = require("readline");
const bcrypt = require("bcryptjs");
const sequelize = require("./src/config/db");

require("./src/models");

const User = sequelize.models.User;

const EMAIL = "joborebit2003@gmail.com";
const NAME = "Akshat Singh";

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;

    rl.question(question, (answer) => {
      if (stdin.isTTY) {
        stdin.setRawMode(wasRaw || false);
      }
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });

    if (stdin.isTTY) {
      rl.close();
      process.stdout.write(question);
      let password = "";

      const onData = (key) => {
        if (key === "\u0003") {
          process.stdout.write("\n");
          process.exit(1);
        }

        if (key === "\r" || key === "\n") {
          stdin.setRawMode(wasRaw || false);
          stdin.pause();
          stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(password);
          return;
        }

        if (key === "\u007f" || key === "\b") {
          password = password.slice(0, -1);
        } else if (key >= " ") {
          password += key;
        }
      };

      stdin.setRawMode(true);
      stdin.resume();
      stdin.on("data", (buffer) => {
        onData(buffer.toString());
      });
    }
  });
}

async function main() {
  try {
    if (!User) {
      throw new Error("User model was not registered.");
    }

    await sequelize.authenticate();

    const existingUser = await User.findOne({
      where: { email: EMAIL },
    });

    if (existingUser) {
      console.log("This email already has an account.");
      console.log("No account was created or changed.");
      return;
    }

    const password = await askHidden("Enter a strong password: ");

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: NAME,
      email: EMAIL,
      password: hashedPassword,
      role: "developer",
      isActive: true,
      isEmailVerified: false,
    });

    console.log("\nDeveloper account created successfully.");
    console.log("Email:", EMAIL);
    console.log("Role: developer");
    console.log("Account active: yes");
    console.log("Email verification: pending");
    console.log("Password saved as a bcrypt hash.");
  } catch (error) {
    console.error("\nAccount creation failed:", error.message);

    if (error.name === "SequelizeValidationError") {
      console.error("Check the User model fields and role options.");
    }
  } finally {
    await sequelize.close().catch(() => {});
  }
}

main();
