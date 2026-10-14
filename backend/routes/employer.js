
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { requireAuth, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const {
    companyName, email, password,
    sector, description, location, logoUrl
  } = req.body;

  if (!companyName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Company name, email and password are required."
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const [existing] = await db.query(
      "SELECT id FROM employers WHERE email = ?",
      [normalizedEmail]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO employers
       (company_name, email, password_hash, sector,
        description, location, logo_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        companyName.trim(), normalizedEmail, passwordHash,
        sector || null, description || null,
        location || null, logoUrl || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Company registered. Waiting for admin approval.",
      employerId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Company registration failed."
    });
  }
});

router.use(requireAuth, allowRoles("employer"));

router.get("/me", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, company_name, email, sector, description,
       location, logo_url, status, created_at
       FROM employers WHERE id = ?`,
      [req.auth.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Company not found."
      });
    }

    res.json({ success: true, employer: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Could not load company." });
  }
});

router.post("/opportunities", async (req, res) => {
  const {
    title, description, location,
    type, salary, requirements, deadline
  } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Opportunity title is required."
    });
  }

  const safeType = ["Internship", "Job", "Training"].includes(type)
    ? type
    : "Internship";

  try {
    const [companies] = await db.query(
      "SELECT id FROM employers WHERE id = ? AND status = 'approved'",
      [req.auth.id]
    );

    if (!companies.length) {
      return res.status(403).json({
        success: false,
        message: "Your company is not approved."
      });
    }

    const [result] = await db.query(
      `INSERT INTO opportunities
       (employer_id, title, description, location,
        type, salary, requirements, deadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.auth.id, title.trim(), description || null,
        location || null, safeType, salary || null,
        requirements || null, deadline || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Opportunity created.",
      opportunityId: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Could not create opportunity."
    });
  }
});

router.get("/opportunities", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM opportunities
       WHERE employer_id = ?
       ORDER BY created_at DESC`,
      [req.auth.id]
    );

    res.json({ success: true, opportunities: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Could not load opportunities."
    });
  }
});

router.get("/applications", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.id, a.status, a.cover_letter, a.created_at,
       o.title, s.full_name, s.qualification
       FROM applications a
       JOIN opportunities o ON o.id = a.opportunity_id
       JOIN job_seekers s ON s.id = a.student_id
       WHERE o.employer_id = ?
       ORDER BY a.created_at DESC`,
      [req.auth.id]
    );

    res.json({ success: true, applications: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Could not load applications."
    });
  }
});

module.exports = router;
