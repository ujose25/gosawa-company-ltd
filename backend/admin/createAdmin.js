
require("dotenv").config();

const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const db = require("../db");

const email = String(process.env.ADMIN_EMAIL || "")
  .trim()
  .toLowerCase();

async function createAdmin() {
  if (
    !email ||
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    throw new Error(
      "Set ADMIN_EMAIL, EMAIL_USER, and EMAIL_PASS before bootstrapping the admin account."
    );
  }

  // Check whether admin already exists
  const existing = await db.query(
    "SELECT id FROM admins WHERE email = $1 LIMIT 1",
    [email]
  );

  if (existing.rows.length > 0) {
    console.log("Admin account already exists; no changes made.");
    return;
  }

  // Generate a temporary unusable password
  const unusablePassword = crypto
    .randomBytes(48)
    .toString("base64url");

  // Generate password reset token
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const frontendUrl = (
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173"
  )
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");

  const resetUrl =
    `${frontendUrl}/reset-password?role=admin&token=${token}`;

  const passwordHash = await bcrypt.hash(
    unusablePassword,
    12
  );

  // Create admin in PostgreSQL
  const result = await db.query(
    `INSERT INTO admins (email, password_hash)
     VALUES ($1, $2)
     RETURNING id`,
    [email, passwordHash]
  );

  const adminId = result.rows[0].id;

  // Save password reset token
  await db.query(
    `INSERT INTO password_resets
      (account_type, account_id, token_hash, expires_at)
     VALUES (
       'admin',
       $1,
       $2,
       NOW() + INTERVAL '15 minutes'
     )`,
    [adminId, tokenHash]
  );

  try {
    const port = Number(process.env.SMTP_PORT || 587);

    const transport = process.env.SMTP_HOST
      ? {
          host: process.env.SMTP_HOST,
          port,
          secure:
            process.env.SMTP_SECURE === "true" ||
            port === 465,
        }
      : {
          service: "gmail",
        };

    const transporter = nodemailer.createTransport({
      ...transport,
      auth: {
        user: process.env.EMAIL_USER.trim(),
        pass: process.env.EMAIL_PASS.replace(/\s/g, ""),
      },
    });

    await transporter.sendMail({
      from: `"GOSAWA COMPANY LTD" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Set up your GOSAWA admin password",

      text: `Use this one-time link to set your admin password. It expires in 15 minutes: ${resetUrl}`,

      html: `
        <p>Use this one-time link to set your GOSAWA admin password.</p>
        <p>This link expires in 15 minutes.</p>
        <p>
          <a href="${resetUrl}">Set admin password</a>
        </p>
      `,
    });

    console.log(
      "Admin account created and setup link sent."
    );
  } catch (error) {
    // Roll back admin if email fails
    await db.query(
      `DELETE FROM password_resets
       WHERE account_type = $1 AND account_id = $2`,
      ["admin", adminId]
    );

    await db.query(
      "DELETE FROM admins WHERE id = $1",
      [adminId]
    );

    throw error;
  }
}

createAdmin()
  .catch((error) => {
    console.error(
      "Could not create admin account:",
      error.message
    );

    process.exitCode = 1;
  })
  .finally(() => db.end());
