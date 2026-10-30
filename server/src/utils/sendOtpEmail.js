const nodemailer = require("nodemailer");

// Read SMTP configuration from .env
const smtpEmail = process.env.SMTP_EMAIL?.trim();
const smtpPassword = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, "");

if (!smtpEmail || !smtpPassword) {
  console.error(
    "SMTP configuration missing: check SMTP_EMAIL and SMTP_APP_PASSWORD in .env"
  );
}

// Create Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
});

// Verify SMTP connection
transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection verification failed:", {
      code: error.code,
      responseCode: error.responseCode,
      message: error.message,
    });
  } else {
    console.log("SMTP server is ready to send emails.");
  }
});

// Send OTP email
async function sendOtpEmail(email, otp) {
  if (!smtpEmail || !smtpPassword) {
    throw new Error(
      "SMTP_EMAIL or SMTP_APP_PASSWORD is missing in environment."
    );
  }

  // Validate recipient email
  if (
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    throw new Error("Invalid recipient email address.");
  }

  // Validate OTP
  if (!/^\d{4}$/.test(String(otp))) {
    throw new Error("OTP must contain exactly 4 digits.");
  }

  const verificationOtp = String(otp);
  const recipientEmail = email.trim();

  try {
    const info = await transporter.sendMail({
      from: {
        name: "JobOrbit",
        address: smtpEmail,
      },

      to: recipientEmail,

      subject: "Your JobOrbit Email Verification OTP",

      text: [
        `Your JobOrbit verification OTP is: ${verificationOtp}`,
        "This OTP expires in 5 minutes.",
        "Do not share this code with anyone.",
        "If you did not request this code, you can ignore this email.",
      ].join("\n"),

      html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>JobOrbit Email Verification</title>
          </head>

          <body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
            <div style="max-width:520px;margin:30px auto;padding:28px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;">

              <h2 style="margin-top:0;color:#2563eb;">
                JobOrbit Email Verification
              </h2>

              <p style="color:#374151;font-size:15px;line-height:1.6;">
                Use the OTP below to verify your email address.
              </p>

              <div style="margin:24px 0;padding:20px;background:#eff6ff;text-align:center;border-radius:10px;">
                <span style="font-size:34px;font-weight:bold;letter-spacing:8px;color:#1d4ed8;">
                  ${verificationOtp}
                </span>
              </div>

              <p style="color:#4b5563;font-size:14px;">
                This OTP expires in <strong>5 minutes</strong>.
              </p>

              <p style="color:#dc2626;font-size:14px;">
                Do not share this code with anyone.
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

              <p style="color:#6b7280;font-size:12px;line-height:1.5;">
                If you did not request this code, you can safely ignore this email.
              </p>

              <p style="color:#9ca3af;font-size:12px;">
                &copy; ${new Date().getFullYear()} JobOrbit
              </p>

            </div>
          </body>
        </html>
      `,
    });

    console.log("JobOrbit OTP email sent successfully:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    });

    return info;
  } catch (error) {
    // Never log passwords or OTP values.
    console.error("SMTP email delivery failed:", {
      code: error.code,
      responseCode: error.responseCode,
      message: error.message,
    });

    throw error;
  }
}

module.exports = sendOtpEmail;
