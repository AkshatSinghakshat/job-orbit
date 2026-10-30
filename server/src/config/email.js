
const nodemailer = require("nodemailer");

const smtpEmail = process.env.SMTP_EMAIL;
const smtpPassword = process.env.SMTP_APP_PASSWORD?.replace(/\s+/g, "");

if (!smtpEmail || !smtpPassword) {
  console.error(
    "❌ SMTP configuration missing: check SMTP_EMAIL and SMTP_APP_PASSWORD in .env"
  );
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || "true") === "true",
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
});

async function sendOtpEmail(email, otp) {
  if (!smtpEmail || !smtpPassword) {
    throw new Error("Gmail SMTP credentials are not configured");
  }

  if (!email || !otp) {
    throw new Error("Recipient email and OTP are required");
  }

  return transporter.sendMail({
    from: {
      name: "JobOrbit",
      address: smtpEmail,
    },
    to: email,
    subject: "Your JobOrbit Verification OTP",
    text: `Your JobOrbit verification OTP is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #ddd;border-radius:12px">
        <h2 style="color:#2563eb">Welcome to JobOrbit!</h2>
        <p>Use the following OTP to verify your email address.</p>
        <div style="font-size:30px;font-weight:bold;letter-spacing:6px;padding:18px;background:#f3f4f6;text-align:center;border-radius:8px">
          ${String(otp).replace(/[&<>"']/g, "")}
        </div>
        <p>This OTP expires in 5 minutes.</p>
        <p style="color:#666;font-size:13px">If you did not request this code, you can ignore this email.</p>
      </div>
    `,
  });
}

async function verifyEmailConnection() {
  if (!smtpEmail || !smtpPassword) {
    throw new Error("SMTP credentials are missing");
  }

  await transporter.verify();
  console.log("✅ Gmail SMTP connection verified");
}

module.exports = {
  sendOtpEmail,
  verifyEmailConnection,
};
