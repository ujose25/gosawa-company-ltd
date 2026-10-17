const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const db = require("../db");

const enabled = process.env.RUN_DB_INTEGRATION === "1";
const accountTables = {
  seeker: "job_seekers",
  employer: "employers",
  admin: "admins",
};

test("password reset works for all roles without changing email and tokens are one-time", {
  skip: !enabled,
}, async () => {
  const suffix = crypto.randomUUID();
  const oldPassword = "OldSecure9!Password";
  const newPassword = "NewSecure8!Password";
  const accountIds = [];
  const initialHash = await bcrypt.hash(oldPassword, 10);

  try {
    for (const role of Object.keys(accountTables)) {
      const email = `${suffix}-${role}@reset.test`;
      let result;

      if (role === "seeker") {
        [result] = await db.query(
          `INSERT INTO job_seekers (national_id, full_name, email, password_hash)
           VALUES (?, ?, ?, ?)`,
          [`${suffix}-seeker`, "Reset Test Student", email, initialHash]
        );
      } else if (role === "employer") {
        [result] = await db.query(
          `INSERT INTO employers (company_name, email, password_hash)
           VALUES (?, ?, ?)`,
          ["Reset Test Company", email, initialHash]
        );
      } else {
        [result] = await db.query(
          "INSERT INTO admins (email, password_hash) VALUES (?, ?)",
          [email, initialHash]
        );
      }

      accountIds.push({ role, id: result.insertId, email });
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      await db.query(
        `INSERT INTO password_resets (account_type, account_id, token_hash, expires_at)
         VALUES (?, ?, ?, DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE))`,
        [role, result.insertId, tokenHash]
      );

      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, token, password: newPassword }),
      });
      assert.equal(response.status, 200, `${role} reset failed`);

      const [account] = await db.query(
        `SELECT email, password_hash FROM ${accountTables[role]} WHERE id = ?`,
        [result.insertId]
      );
      assert.equal(account[0].email, email);
      assert.equal(await bcrypt.compare(newPassword, account[0].password_hash), true);

      if (role === "admin") {
        const replay = await fetch("http://localhost:5000/api/auth/reset-password", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ role, token, password: "AnotherSecure7!Password" }),
        });
        assert.equal(replay.status, 400);
      }
    }
  } finally {
    for (const account of accountIds) {
      await db.query(
        "DELETE FROM password_resets WHERE account_type = ? AND account_id = ?",
        [account.role, account.id]
      );
      await db.query(`DELETE FROM ${accountTables[account.role]} WHERE id = ?`, [account.id]);
    }
    await db.end();
  }
});