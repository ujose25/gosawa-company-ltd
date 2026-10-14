
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const db = require("../db");

const router = express.Router();

// Verification codes zibikwa by'agateganyo muri memory.
const verificationCodes = new Map();
const verifiedEmails = new Set();

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const isStrongPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error(
      "EMAIL_USER cyangwa EMAIL_PASS ntibyuzuye muri .env"
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser.trim(),
      pass: emailPass.replace(/\s/g, ""),
    },
  });
};

// 1. Kohereza verification code kuri email y'umunyeshuri
router.post("/send-verification", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Andika email nyayo.",
      });
    }

    // Code y'imibare 6
    const code = crypto.randomInt(100000, 1000000).toString();

    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"GOSAWA COMPANY LTD" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "GOSAWA - Email Verification Code",
      text: `Verification code yawe ni ${code}. Izarangira mu minota 10.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
          <h2 style="color:#087443">GOSAWA COMPANY LTD</h2>
          <p>Muraho! Koresha iyi code kugira ngo wemeze email yawe:</p>
          <h1 style="letter-spacing:8px;color:#087443">${code}</h1>
          <p>Iyi code izarangira mu minota 10.</p>
          <p>Niba utasabye kwiyandikisha, ushobora kwirengagiza ubu butumwa.</p>
        </div>
      `,
    });

    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });

    verifiedEmails.delete(email);

    return res.json({
      success: true,
      message: "Verification code yoherejwe kuri email yawe.",
    });
  } catch (error) {
    // Reba impamvu nyayo muri terminal ya backend.
    console.error("GOSAWA email error:", error.message);

    return res.status(500).json({
      success: false,
      message:
        "Email ntiyoherejwe. Reba App Password na EMAIL_USER muri .env.",
    });
  }
});

// 2. Kwemeza verification code
router.post("/verify-code", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const code = String(req.body.code || "").trim();

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: "Shyiramo email na verification code.",
    });
  }

  const saved = verificationCodes.get(email);

  if (!saved) {
    return res.status(400).json({
      success: false,
      message: "Banza usabe verification code.",
    });
  }

  if (Date.now() > saved.expiresAt) {
    verificationCodes.delete(email);

    return res.status(400).json({
      success: false,
      message: "Verification code yarangiye. Ongera uyisabe.",
    });
  }

  if (saved.attempts >= 5) {
    verificationCodes.delete(email);

    return res.status(429).json({
      success: false,
      message: "Warengeje inshuro zo kugerageza. Saba code nshya.",
    });
  }

  saved.attempts += 1;

  if (saved.code !== code) {
    return res.status(400).json({
      success: false,
      message: "Verification code si yo.",
    });
  }

  verificationCodes.delete(email);
  verifiedEmails.add(email);

  return res.json({
    success: true,
    message: "Email yawe yemejwe neza.",
  });
});

// 3. Kwandikisha umunyeshuri
router.post("/register", async (req, res) => {
  try {
    const {
      nationalId,
      fullName,
      email: rawEmail,
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
      password,
    } = req.body;

    const email = normalizeEmail(rawEmail);

    if (!verifiedEmails.has(email)) {
      return res.status(400).json({
        success: false,
        message: "Banza wemeze email yawe.",
      });
    }

    if (
      !nationalId ||
      !fullName ||
      !email ||
      !telephone ||
      !location ||
      !fatherName ||
      !motherName ||
      !province ||
      !district ||
      !sector ||
      !cell ||
      !village ||
      !tvetSchool ||
      !qualification ||
      !opportunityInterest ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Uzuza amakuru yose asabwa.",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password igomba kugira inyuguti nto, inyuguti nkuru, umubare, ikimenyetso kandi ikagira nibura inyuguti 10.",
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
        message: "Iyi email cyangwa National ID isanzwe yanditse.",
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

    verifiedEmails.delete(email);

    return res.status(201).json({
      success: true,
      message: "Account yawe yakozwe neza. Ushobora kwinjira muri GOSAWA.",
    });
  } catch (error) {
    console.error("GOSAWA registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Kwiyandikisha byanze. Reba amakuru ya database.",
    });
  }
});

// 4. Kwinjira muri GOSAWA
router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password, role = "seeker" } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Shyiramo email na password.",
      });
    }

    const allowedTables = {
      seeker: "job_seekers",
      employer: "employers",
      admin: "admins",
    };

    const table = allowedTables[role];

    if (!table) {
      return res.status(400).json({
        success: false,
        message: "Role ntiyemewe.",
      });
    }

    const [users] = await db.query(
      `SELECT * FROM ${table} WHERE email = ? LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Email cyangwa password si byo.",
      });
    }

    const user = users[0];

    const passwordHash = user.password_hash;

    if (
      !passwordHash ||
      !(await bcrypt.compare(password, passwordHash))
    ) {
      return res.status(401).json({
        success: false,
        message: "Email cyangwa password si byo.",
      });
    }

    if (
      role === "employer" &&
      user.status &&
      user.status !== "approved"
    ) {
      return res.status(403).json({
        success: false,
        message: "Konti ya company iracyategereje kwemezwa na admin.",
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

    // Ntitwohereza password hash cyangwa amakuru y'ibanga.
    const safeUser = { ...user };
    delete safeUser.password_hash;
    delete safeUser.password;

    return res.json({
      success: true,
      message: "Winjiye muri GOSAWA neza.",
      token,
      user: {
        ...safeUser,
        role,
      },
    });
  } catch (error) {
    console.error("GOSAWA login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Kwinjira byanze. Ongera ugerageze.",
    });
  }
});

module.exports = router;
