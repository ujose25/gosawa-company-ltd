
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const seekerRoutes = require("./routes/seeker");
const employerRoutes = require("./routes/employer");
const adminRoutes = require("./routes/admin");

// Komeza iyi route niba file ya companies.js igihari.
let companyRoutes;
try {
  companyRoutes = require("./routes/companies");
} catch (error) {
  console.log("Optional companies route not loaded.");
}

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GOSAWA COMPANY LTD Backend is running"
  });
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
