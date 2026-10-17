const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const db = require("../db");

const enabled = process.env.RUN_DB_INTEGRATION === "1";

async function createLogin(email, role, password) {
  const response = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, role, password }),
  });

  return {
    response,
    cookie: (response.headers.get("set-cookie") || "").split(";")[0],
  };
}

test("employers can message admins about only their own applicants", {
  skip: !enabled,
}, async () => {
  const suffix = crypto.randomUUID();
  const password = "Integration9!Password";
  const employerIds = [];
  const studentIds = [];
  let adminId;

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [employer] = await db.query(
      `INSERT INTO employers (company_name, email, password_hash, status)
       VALUES (?, ?, ?, 'approved')`,
      [`Integration ${suffix}`, `${suffix}@employer.test`, passwordHash]
    );
    employerIds.push(employer.insertId);

    const [otherEmployer] = await db.query(
      `INSERT INTO employers (company_name, email, password_hash, status)
       VALUES (?, ?, ?, 'approved')`,
      [`Other ${suffix}`, `other-${suffix}@employer.test`, passwordHash]
    );
    employerIds.push(otherEmployer.insertId);

    const [student] = await db.query(
      `INSERT INTO job_seekers (national_id, full_name, email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [`${suffix}-1`, "Selected Integration Student", `${suffix}@student.test`, passwordHash]
    );
    studentIds.push(student.insertId);

    const [otherStudent] = await db.query(
      `INSERT INTO job_seekers (national_id, full_name, email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [`${suffix}-2`, "Other Integration Student", `other-${suffix}@student.test`, passwordHash]
    );
    studentIds.push(otherStudent.insertId);

    const [opportunity] = await db.query(
      "INSERT INTO opportunities (employer_id, title) VALUES (?, ?)",
      [employer.insertId, `Role ${suffix}`]
    );
    const [otherOpportunity] = await db.query(
      "INSERT INTO opportunities (employer_id, title) VALUES (?, ?)",
      [otherEmployer.insertId, `Other role ${suffix}`]
    );

    const [application] = await db.query(
      "INSERT INTO applications (student_id, opportunity_id) VALUES (?, ?)",
      [student.insertId, opportunity.insertId]
    );
    const [otherApplication] = await db.query(
      "INSERT INTO applications (student_id, opportunity_id) VALUES (?, ?)",
      [otherStudent.insertId, otherOpportunity.insertId]
    );

    const [admin] = await db.query(
      "INSERT INTO admins (email, password_hash) VALUES (?, ?)",
      [`${suffix}@admin.test`, passwordHash]
    );
    adminId = admin.insertId;

    const employerLogin = await createLogin(`${suffix}@employer.test`, "employer", password);
    assert.equal(employerLogin.response.status, 200);

    const sent = await fetch("http://localhost:5000/api/employer/admin-messages", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: employerLogin.cookie },
      body: JSON.stringify({
        applicationIds: [application.insertId],
        message: "Please review this selected applicant.",
      }),
    });
    const sentData = await sent.json();
    assert.equal(sent.status, 201);

    const forbidden = await fetch("http://localhost:5000/api/employer/admin-messages", {
      method: "POST",
      headers: { "content-type": "application/json", cookie: employerLogin.cookie },
      body: JSON.stringify({
        applicationIds: [otherApplication.insertId],
        message: "This application belongs to another company.",
      }),
    });
    assert.equal(forbidden.status, 403);

    const adminLogin = await createLogin(`${suffix}@admin.test`, "admin", password);
    assert.equal(adminLogin.response.status, 200);

    const inbox = await fetch("http://localhost:5000/api/admin/employer-messages", {
      headers: { cookie: adminLogin.cookie },
    });
    const inboxData = await inbox.json();
    assert.equal(inbox.status, 200);
    assert.ok(inboxData.messages.some((message) =>
      message.id === sentData.messageId &&
      message.students.some((recipient) => recipient.applicationId === application.insertId)
    ));
  } finally {
    for (const id of employerIds) {
      await db.query("DELETE FROM employers WHERE id = ?", [id]);
    }
    for (const id of studentIds) {
      await db.query("DELETE FROM job_seekers WHERE id = ?", [id]);
    }
    if (adminId) {
      await db.query("DELETE FROM admins WHERE id = ?", [adminId]);
    }
    await db.end();
  }
});