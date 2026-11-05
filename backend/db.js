
require("dotenv").config();

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";

// Load a CA certificate when the production database requires TLS.
let ssl;

if (isProduction) {
  const configuredCaPath = process.env.DB_CA_PATH;
  const caPath = configuredCaPath || path.join(__dirname, "ca.pem");
  const ca = process.env.DB_CA_CERT;

  if (ca) {
    ssl = { ca, rejectUnauthorized: true };
  } else if (fs.existsSync(caPath)) {
    ssl = {
      ca: fs.readFileSync(caPath, "utf8"),
      rejectUnauthorized: true
    };
  } else if (configuredCaPath) {
    throw new Error(
      `Database CA certificate not found at ${caPath}. ` +
      "Provide a valid DB_CA_PATH or set DB_CA_CERT."
    );
  } else if ((process.env.DB_HOST || process.env.MYSQLHOST || "").includes("aivencloud.com")) {
    throw new Error(
      "Aiven production databases require their CA certificate. " +
      "Set DB_CA_CERT or DB_CA_PATH."
    );
  }
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
