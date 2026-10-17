
const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res) => {
  try {
    const [companies] = await db.query(
      `SELECT id, company_name, sector, description,
              location, logo_url, jobs
       FROM employers
       WHERE status = 'approved'
       ORDER BY created_at DESC`
    );

    const results = companies.map((company) => ({
      ...company,
      jobs:
        typeof company.jobs === "string"
          ? JSON.parse(company.jobs || "[]")
          : company.jobs || [],
    }));

    res.json({
      success: true,
      companies: results,
    });
  } catch (error) {
    console.error("COMPANIES ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Could not load companies.",
    });
  }
});

module.exports = router;