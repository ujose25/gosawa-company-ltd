
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("node:crypto");
const db = require("../db");
const authLimiter = require("../middleware/authLimiter");
const { requireAuth } = require("../middleware/auth");
const { normalizeEmail, isStrongPassword } = require("../utils/authValidation");

const router = express.Router();
const accountTables = {
  seeker: "job_seekers",
  employer: "employers",
  admin: "admins",
};
function publicAccount(user, role) {
  const safeUser = {
    id: user.id,
    email: user.email,
    role,
  };

  if (role === "seeker") safeUser.full_name = user.full_name;
  if (role === "employer") {
    safeUser.company_name = user.company_name;
    safeUser.status = user.status;
  }

  return safeUser;
}

const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production" || process.env.COOKIE_SAME_SITE === "none",
  sameSite: process.env.COOKIE_SAME_SITE || "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
});

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set in .env.");
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const transport = process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST,
        port,
        secure: process.env.SMTP_SECURE === "true" || port === 465,
      }
    : { service: "gmail" };

  return nodemailer.createTransport({
    ...transport,
    auth: {
      user: emailUser.trim(),
      pass: emailPass.replace(/\s/g, ""),
    },
  });
};

// Register a student account.
router.post("/register", authLimiter, async (req, res) => {
  try {
    const {
      nationalId,
      fullName,
      email: rawEmail,
      telephone,
      location,
      fatherName = "",
      motherName = "",
      province,
      district,
      sector,
      cell,
      village = "",
      tvetSchool,
      qualification,
      opportunityInterest,
      password,
    } = req.body;

    const email = normalizeEmail(rawEmail);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (
      !nationalId ||
      !fullName ||
      !email ||
      !telephone ||
      !location ||
      !province ||
      !district ||
      !sector ||
      !cell ||
      !tvetSchool ||
      !qualification ||
      !opportunityInterest ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete all required fields.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 10 characters and include uppercase, lowercase, a number, and a symbol.",
      });
    }

    const [existing] = await db.query(
      `SELECT id FROM job_seekers
       WHERE email = ? OR national_id = ?
       LIMIT 1`,
      [email, nationalId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This email or National ID is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await db.query(
      `INSERT INTO job_seekers (
        national_id, full_name, email, telephone, location,
        father_name, mother_name, province, district, sector,
        cell, village, tvet_school, qualification,
        opportunity_interest, password_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nationalId,
        fullName.trim(),
        email,
        telephone,
        location,
        fatherName,
        motherName,
        province,
        district,
        sector,
        cell,
        village,
        tvetSchool,
        qualification,
        opportunityInterest,
        passwordHash,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Your account was created successfully. You can now log in.",
    });
  } catch (error) {
    console.error("GOSAWA registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Check the server logs for details.",
    });
  }
});

router.post("/forgot-password", authLimiter, async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const role = req.body.role;
  const table = accountTables[role];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !table) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address and account type.",
    });
  }

  try {
    const [accounts] = await db.query(
      `SELECT id FROM ${table} WHERE email = ? LIMIT 1`,
      [email]
    );

    if (accounts.length) {
      const accountId = accounts[0].id;
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      await db.query(
        "DELETE FROM password_resets WHERE account_type = ? AND account_id = ?",
        [role, accountId]
      );
      await db.query(
        `INSERT INTO password_resets (account_type, account_id, token_hash, expires_at)
         VALUES (?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE))`,
        [role, accountId, tokenHash]
      );

      const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173")
        .split(",")[0]
        .trim()
        .replace(/\/$/, "");
      const resetUrl = `${frontendUrl}/reset-password?role=${encodeURIComponent(role)}&token=${token}`;
      try {
        const transporter = createTransporter();

        await transporter.sendMail({
          from: `"GOSAWA COMPANY LTD" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Reset your GOSAWA password",
          text: `Use this one-time link to reset your password. It expires in 15 minutes: ${resetUrl}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
              <h2 style="color:#087443">GOSAWA COMPANY LTD</h2>
              <p>Use the link below to reset your password. It expires in 15 minutes and can only be used once.</p>
              <p><a href="${resetUrl}">Reset password</a></p>
              <p>If you did not request this, ignore this email.</p>
            </div>
          `,
        });
      } catch (mailError) {
        await db.query("DELETE FROM password_resets WHERE token_hash = ?", [tokenHash]);
        console.error("Password reset email error:", mailError.message);
      }
    }

    return res.json({
      success: true,
      message: "If an account matches those details, a password reset link will be sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not process the password reset request.",
    });
  }
});

router.post("/reset-password", authLimiter, async (req, res) => {
  const { token, password, role } = req.body;
  const table = accountTables[role];

  if (!table || !/^[a-f0-9]{64}$/i.test(String(token || ""))) {
    return res.status(400).json({
      success: false,
      message: "This password reset link is invalid or expired.",
    });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 10 characters and include uppercase, lowercase, a number, and a symbol.",
    });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const [resets] = await connection.query(
      `SELECT id, account_id FROM password_resets
       WHERE account_type = ? AND token_hash = ?
       AND expires_at > CURRENT_TIMESTAMP()
       LIMIT 1 FOR UPDATE`,
      [role, tokenHash]
    );

    if (!resets.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "This password reset link is invalid or expired.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [updated] = await connection.query(
      `UPDATE ${table} SET password_hash = ? WHERE id = ?`,
      [passwordHash, resets[0].account_id]
    );

    if (!updated.affectedRows) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "This password reset link is invalid or expired.",
      });
    }

    await connection.query(
      "DELETE FROM password_resets WHERE account_type = ? AND account_id = ?",
      [role, resets[0].account_id]
    );
    await connection.commit();

    const { maxAge, ...clearOptions } = sessionCookieOptions();
    res.clearCookie("gosawa_session", clearOptions);
    return res.json({
      success: true,
      message: "Your password has been reset. You can now log in.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Password reset error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not reset your password.",
    });
  } finally {
    connection.release();
  }
});

// Log in to GOSAWA.
router.post("/login", authLimiter, async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password, role = "seeker" } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter your email and password.",
      });
    }

    const table = accountTables[role];

    if (!table) {
      return res.status(400).json({
        success: false,
        message: "Invalid account type.",
      });
    }

    const [users] = await db.query(
      `SELECT * FROM ${table} WHERE email = ? LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect.",
      });
    }

    const user = users[0];
    const passwordHash = user.password_hash;
    const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(passwordHash || "");
    const passwordMatches = isBcryptHash
      ? await bcrypt.compare(password, passwordHash)
      : password === passwordHash;

    if (!passwordHash || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect.",
      });
    }

    if (!isBcryptHash) {
      const upgradedHash = await bcrypt.hash(password, 12);
      await db.query(
        `UPDATE ${table} SET password_hash = ? WHERE id = ?`,
        [upgradedHash, user.id]
      );
      user.password_hash = upgradedHash;
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Authentication is not configured on the server.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const safeUser = publicAccount(user, role);

    res.cookie("gosawa_session", token, sessionCookieOptions());

    return res.json({
      success: true,
      message: "Login successful.",
      user: {
        ...safeUser,
      },
    });
  } catch (error) {
    console.error("GOSAWA login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed. Check the server logs for details.",
    });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const role = req.auth.role;
  const table = accountTables[role];

  if (!table) {
    return res.status(401).json({
      success: false,
      message: "Please log in first.",
    });
  }

  try {
    const [users] = await db.query(
      `SELECT * FROM ${table} WHERE id = ? LIMIT 1`,
      [req.auth.id]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "Please log in first.",
      });
    }

    return res.json({
      success: true,
      user: publicAccount(users[0], role),
    });
  } catch (error) {
    console.error("Session lookup error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load your session.",
    });
  }
});

router.post("/logout", (req, res) => {
  const { maxAge, ...clearOptions } = sessionCookieOptions();
  res.clearCookie("gosawa_session", clearOptions);
  return res.json({ success: true, message: "Logged out successfully." });
});

module.exports = router;
