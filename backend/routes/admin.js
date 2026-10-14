
const express = require("express");
const db = require("../db");
const { requireAuth, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, allowRoles("admin"));

router.get("/overview", async (req, res) => {
  try {
    const [[students]] = await db.query(
      "SELECT COUNT(*) AS total FROM job_seekers"
    );
    const [[employers]] = await db.query(
      "SELECT COUNT(*) AS total FROM employers"
    );
    const [[opportunities]] = await db.query(
      "SELECT COUNT(*) AS total FROM opportunities"
    );
    const [[applications]] = await db.query(
      "SELECT COUNT(*) AS total FROM applications"
    );

    res.json({
      success: true,
      totals: {
        students: students.total,
        employers: employers.total,
        opportunities: opportunities.total,
        applications: applications.total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Could not load overview." });
  }
});

router.get("/students", async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT id, national_id, full_name, email, telephone,
       province, district, tvet_school, qualification, created_at
       FROM job_seekers ORDER BY created_at DESC`
    );

    res.json({ success: true, students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Could not load students." });
  }
});

router.get("/employers", async (req, res) => {
  try {
    const [employers] = await db.query(
      `SELECT id, company_name, email, sector, description,
       location, logo_url, status, created_at
       FROM employers ORDER BY created_at DESC`
    );

    res.json({ success: true, employers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Could not load employers." });
  }
});

router.patch("/employers/:id/status", async (req, res) => {
  const { status } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid company status."
    });
  }

  try {
    const [result] = await db.query(
      "UPDATE employers SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Company not found."
      });
    }

    res.json({ success: true, message: "Company status updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Could not update company." });
  }
});

router.get("/opportunities", async (req, res) => {
  try {
    const [opportunities] = await db.query(
      `SELECT o.*, e.company_name
       FROM opportunities o
       JOIN employers e ON e.id = o.employer_id
       ORDER BY o.created_at DESC`
    );

    res.json({ success: true, opportunities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Could not load opportunities." });
  }
});

router.get("/applications", async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT a.*, s.full_name, s.email,
       o.title, e.company_name
       FROM applications a
       JOIN job_seekers s ON s.id = a.student_id
       JOIN opportunities o ON o.id = a.opportunity_id
       JOIN employers e ON e.id = o.employer_id
       ORDER BY a.created_at DESC`
    );

    res.json({ success: true, applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Could not load applications." });
  }
});

router.patch("/applications/:id/status", async (req, res) => {
  const { status } = req.body;

  if (!["pending", "reviewing", "accepted", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid application status."
    });
  }

  try {
    const [result] = await db.query(
      "UPDATE applications SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Application not found."
      });
    }

    res.json({ success: true, message: "Application status updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Could not update application." });
  }
});

module.exports = router;
