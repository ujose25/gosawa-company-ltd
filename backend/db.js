
require("dotenv").config();

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

// Load the Aiven CA certificate in production.
let ssl;

if (isProduction) {
  const caPath =
    process.env.DB_CA_PATH || path.join(__dirname, "ca.pem");

  if (!fs.existsSync(caPath)) {
    throw new Error(
      `Aiven CA certificate not found at ${caPath}. ` +
      "Please add ca.pem to the backend deployment."
    );
  }

  ssl = {
    ca: fs.readFileSync(caPath, "utf8"),
    rejectUnauthorized: true
  };
}

const db = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || "localhost",

  port: Number(
    process.env.DB_PORT || process.env.MYSQLPORT || 3306
  ),

  user: process.env.DB_USER || process.env.MYSQLUSER || "root",

  password:
    process.env.DB_PASSWORD ||
    process.env.MYSQLPASSWORD ||
    "",

  database:
    process.env.DB_NAME ||
    process.env.MYSQLDATABASE ||
    (isProduction ? "defaultdb" : "gosawa_db"),

  ssl,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the database connection when the application starts.
db.getConnection()
  .then((connection) => {
    console.log("✅ MySQL database connected successfully.");

    connection.release();
  })
  .catch((error) => {
    console.error("❌ MySQL connection failed:", error.message);
  });

module.exports = db;
