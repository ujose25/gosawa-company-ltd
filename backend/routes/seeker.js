
const express = require("express");
const db = require("../db");
const { requireAuth, allowRoles } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, allowRoles("student", "seeker"));

router.get("/me", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, national_id, full_name, email, telephone,
       location, province, district, sector, cell, village,
       father_name, mother_name, tvet_school, qualification,
       opportunity_interest, created_at
       FROM job_seekers WHERE id = ?`,
      [req.auth.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Could not load profile." });
  }
});

router.get("/opportunities", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.id, o.title, o.description, o.location,
       o.type, o.salary, o.requirements, o.deadline,
       o.created_at, e.company_name
       FROM opportunities o
       JOIN employers e ON e.id = o.employer_id
       WHERE o.status = 'open'
       AND e.status = 'approved'
       ORDER BY o.created_at DESC`
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
       o.title, o.type, o.location
       FROM applications a
       JOIN opportunities o ON o.id = a.opportunity_id
       WHERE a.student_id = ?
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

router.post("/applications", async (req, res) => {
  const { opportunityId, coverLetter } = req.body;

  if (!Number.isInteger(Number(opportunityId))) {
    return res.status(400).json({
      success: false,
      message: "Valid opportunity ID is required."
    });
  }

  try {
    const [opportunities] = await db.query(
      `SELECT o.id FROM opportunities o
       JOIN employers e ON e.id = o.employer_id
       WHERE o.id = ?
       AND o.status = 'open'
       AND e.status = 'approved'`,
      [Number(opportunityId)]
    );

    if (!opportunities.length) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found or closed."
      });
    }

    await db.query(
      `INSERT INTO applications
       (student_id, opportunity_id, cover_letter)
       VALUES (?, ?, ?)`,
      [req.auth.id, Number(opportunityId), coverLetter || null]
    );

    res.status(201).json({
      success: true,
      message: "Application submitted successfully."
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "You already applied for this opportunity."
      });
    }

    console.error(error);
    res.status(500).json({
      success: false,
      message: "Could not submit application."
    });
  }
});

module.exports = router;
