import { defineRailway, github, mysql, project, service } from "railway/iac";
import dotenv from "dotenv";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const localEnv = dotenv.config({
  path: resolve(repoRoot, "backend", ".env"),
  quiet: true,
}).parsed || {};
const railwayJwtSecret = createHash("sha256")
  .update(`gosawa-railway-jwt:${requiredEnv("JWT_SECRET")}`)
  .digest("hex");

function requiredEnv(name: string): string {
  const value = localEnv[name];
  if (!value) {
    throw new Error(`Set ${name} in backend/.env before planning Railway infrastructure.`);
  }
  return value;
}

const source = (rootDirectory: string) => github("ujose25/gosawa-company-ltd", {
  branch: "main",
  rootDirectory,
});

export default defineRailway(() => {
  const database = mysql("gosawa-mysql");

  const api = service("gosawa-api", {
    source: source("backend"),
    start: "npm start",
    preDeploy: "npm run migrate && npm run create-admin",
    healthcheck: "/health",
    healthcheckTimeout: 300,
    domains: [{ domain: "api.gosawa.org", port: 5000 }],
    env: {
      NODE_ENV: "production",
      JWT_SECRET: railwayJwtSecret,
      DB_HOST: database.env.MYSQLHOST,
      DB_PORT: database.env.MYSQLPORT,
      DB_USER: database.env.MYSQLUSER,
      DB_PASSWORD: database.env.MYSQLPASSWORD,
      DB_NAME: database.env.MYSQLDATABASE,
      CLIENT_URL: "https://gosawa.org",
      FRONTEND_URL: "https://gosawa.org",
      COOKIE_SAME_SITE: "lax",
      ADMIN_EMAIL: "ntamaherezojmv@gmail.com",
      EMAIL_USER: requiredEnv("EMAIL_USER"),
      EMAIL_PASS: requiredEnv("EMAIL_PASS"),
      SMTP_HOST: localEnv.SMTP_HOST || "smtp.gmail.com",
      SMTP_PORT: localEnv.SMTP_PORT || "587",
      SMTP_SECURE: localEnv.SMTP_SECURE || "false",
    },
  });

  const web = service("gosawa-web", {
    source: source("frontend-project"),
    build: "npm ci --include=dev && npm run build",
    start: "npm start",
    healthcheck: "/",
    domains: ["gosawa.org"],
    env: {
      VITE_API_URL: "https://api.gosawa.org/api",
    },
  });

  return project("gosawa-company-ltd", {
    resources: [database, api, web],
  });
});