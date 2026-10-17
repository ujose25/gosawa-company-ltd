const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const isStrongPassword = (password) =>
  typeof password === "string" &&
  password.length >= 10 &&
  /[a-z]/.test(password) &&
  /[A-Z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

module.exports = { normalizeEmail, isStrongPassword };