const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeEmail, isStrongPassword } = require("../utils/authValidation");

test("normalizes emails before lookup", () => {
  assert.equal(normalizeEmail("  Person@Example.COM "), "person@example.com");
  assert.equal(normalizeEmail(null), "");
});

test("accepts strong passwords and rejects weak values", () => {
  assert.equal(isStrongPassword("SecurePass9!"), true);
  assert.equal(isStrongPassword("weakpass"), false);
  assert.equal(isStrongPassword("NoNumber!Pass"), false);
  assert.equal(isStrongPassword(null), false);
});