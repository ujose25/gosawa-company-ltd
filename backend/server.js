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

// SECURITY WORKFLOW: Production and development domains for GOSAWA
const allowedOrigins = [
  "http://localhost:3000",                                // Local Next.js / React development
  "http://localhost:5173",                                // Local Vite development
  "https://gosawa-company-ltd2.onrender.com"              // YOUR PRODUCTION FRONTEND
];

// FIXED: Secure dynamic CORS configuration matching specific credentials requirements
app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server requests (like Postman or internal tasks)
    if (!origin) return callback(null, true);
    
    // Check if the incoming request origin is explicitly permitted
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, origin); // Reflect back the exact domain string safely
    } else {
      callback(new Error(`CORS policy blockage: Origin ${origin} unauthorized.`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// HELPER MIDDLEWARE: Standardizes outgoing authentication cookie behaviors for modern browsers
app.use((req, res, next) => {
  const originalCookie = res.cookie;
  res.cookie = function (name, value, options = {}) {
    const isProduction = process.env.NODE_ENV === "production" || req.secure || req.headers["x-forwarded-proto"] === "https";
    const mergedOptions = {
      httpOnly: true,
      secure: isProduction, // Requires HTTPS layout strictly on live environments
      sameSite: isProduction ? "none" : "lax", // Cross-site allowance on production, local allowance on dev
      ...options
    };
    return originalCookie.call(this, name, value, mergedOptions);
  };
  next();
});

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
    message: err.message || "Server error."
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`GOSAWA server running on port ${PORT}`);
});
