
require("dotenv").config();

const crypto = require("node:crypto");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./db");

if (!process.env.JWT_SECRET) {
  const secretSource = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD;
  if (secretSource) {
    process.env.JWT_SECRET = crypto
      .createHash("sha256")
      .update(`gosawa-session-secret:${secretSource}`)
      .digest("hex");
  }
}

const authRoutes = require("./routes/auth");
const seekerRoutes = require("./routes/seeker");
const employerRoutes = require("./routes/employer");
const adminRoutes = require("./routes/admin");

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set to at least 32 characters.");
}

// Komeza iyi route niba file ya companies.js igihari.
let companyRoutes;
try {
  companyRoutes = require("./routes/companies");
} catch (error) {
  console.log("Optional companies route not loaded.");
}

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin is not allowed by CORS."));
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GOSAWA COMPANY LTD Backend is running"
  });
});

app.get("/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    return res.json({ success: true, status: "healthy" });
  } catch (error) {
    console.error("Health check failed:", error.message);
    return res.status(503).json({ success: false, status: "unavailable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/seeker", seekerRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/admin", adminRoutes);

if (companyRoutes) {
  app.use("/api/companies", companyRoutes);
}

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: "Server error."
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`GOSAWA server running on http://localhost:${PORT}`);
});
