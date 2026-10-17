require("dotenv").config();

const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const db = require("../db");

const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();

async function createAdmin() {
	if (!email || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
		throw new Error("Set ADMIN_EMAIL, EMAIL_USER, and EMAIL_PASS before bootstrapping the admin account.");
	}

	const [existing] = await db.query(
		"SELECT id FROM admins WHERE email = ? LIMIT 1",
		[email]
	);

	if (existing.length) {
		console.log("Admin account already exists; no changes made.");
		return;
	}

	const unusablePassword = crypto.randomBytes(48).toString("base64url");
	const token = crypto.randomBytes(32).toString("hex");
	const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
	const frontendUrl = (process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173")
		.split(",")[0]
		.trim()
		.replace(/\/$/, "");
	const resetUrl = `${frontendUrl}/reset-password?role=admin&token=${token}`;
	const passwordHash = await bcrypt.hash(unusablePassword, 12);

	const [result] = await db.query(
		"INSERT INTO admins (email, password_hash) VALUES (?, ?)",
		[email, passwordHash]
	);
	await db.query(
		`INSERT INTO password_resets (account_type, account_id, token_hash, expires_at)
		 VALUES ('admin', ?, ?, DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE))`,
		[result.insertId, tokenHash]
	);

	try {
		const port = Number(process.env.SMTP_PORT || 587);
		const transport = process.env.SMTP_HOST
			? {
					host: process.env.SMTP_HOST,
					port,
					secure: process.env.SMTP_SECURE === "true" || port === 465,
				}
			: { service: "gmail" };
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
			html: `<p>Use this one-time link to set your GOSAWA admin password. It expires in 15 minutes.</p><p><a href="${resetUrl}">Set admin password</a></p>`,
		});
	} catch (error) {
		await db.query(
			"DELETE FROM password_resets WHERE account_type = 'admin' AND account_id = ?",
			[result.insertId]
		);
		await db.query("DELETE FROM admins WHERE id = ?", [result.insertId]);
		throw error;
	}

	console.log("Admin account created and setup link sent.");
}

createAdmin()
	.catch((error) => {
		console.error("Could not create admin account:", error.message);
		process.exitCode = 1;
	})
	.finally(() => db.end());
