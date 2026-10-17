
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { requireAuth, allowRoles } = require("../middleware/auth");
const authLimiter = require("../middleware/authLimiter");
const { normalizeEmail, isStrongPassword } = require("../utils/authValidation");

const router = express.Router();

router.post("/register", authLimiter, async (req, res) => {
  const {
    companyName, email, password,
    sector, description, location, logoUrl
  } = req.body;

  const normalizedEmail = normalizeEmail(email);

  if (!companyName || !normalizedEmail || !password) {
    return res.status(400).json({
      success: false,
      message: "Company name, email and password are required."
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address."
    });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 10 characters and include uppercase, lowercase, a number, and a symbol."
    });
  }

  try {
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

    const passwordHash = await bcrypt.hash(password, 12);

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
       o.title, s.full_name, s.email, s.telephone, s.qualification,
       s.location, s.tvet_school
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

router.patch("/applications/:id/status", async (req, res) => {
  const { status } = req.body;

  if (!["pending", "reviewing", "accepted", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid application status.",
    });
  }

  try {
    const [result] = await db.query(
      `UPDATE applications a
       JOIN opportunities o ON o.id = a.opportunity_id
       SET a.status = ?
       WHERE a.id = ? AND o.employer_id = ?`,
      [status, req.params.id, req.auth.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.json({ success: true, message: "Application status updated." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not update application status.",
    });
  }
});

router.post("/admin-messages", async (req, res) => {
  const message = String(req.body.message || "").trim();
  const rawApplicationIds = req.body.applicationIds;

  if (!message || message.length > 2000) {
    return res.status(400).json({
      success: false,
      message: "Enter a message of no more than 2,000 characters.",
    });
  }

  if (
    !Array.isArray(rawApplicationIds) ||
    rawApplicationIds.length < 1 ||
    rawApplicationIds.length > 30 ||
    rawApplicationIds.some((id) => !Number.isSafeInteger(Number(id)) || Number(id) < 1)
  ) {
    return res.status(400).json({
      success: false,
      message: "Select between 1 and 30 valid applications.",
    });
  }

  const applicationIds = [...new Set(rawApplicationIds.map(Number))];
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const placeholders = applicationIds.map(() => "?").join(", ");
    const [ownedApplications] = await connection.query(
      `SELECT a.id
       FROM applications a
       JOIN opportunities o ON o.id = a.opportunity_id
       WHERE o.employer_id = ? AND a.id IN (${placeholders})
       FOR UPDATE`,
      [req.auth.id, ...applicationIds]
    );

    if (ownedApplications.length !== applicationIds.length) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: "One or more selected applications do not belong to your company.",
      });
    }

    const [result] = await connection.query(
      "INSERT INTO employer_admin_messages (employer_id, message) VALUES (?, ?)",
      [req.auth.id, message]
    );
    const recipientValues = applicationIds
      .map((applicationId) => [result.insertId, applicationId]);
    const recipientPlaceholders = recipientValues.map(() => "(?, ?)").join(", ");

    await connection.query(
      `INSERT INTO employer_admin_message_recipients (message_id, application_id)
       VALUES ${recipientPlaceholders}`,
      recipientValues.flat()
    );
    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Your message was sent to the admin.",
      messageId: result.insertId,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Employer admin message error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not send your message to the admin.",
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
