const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { requireAuth, allowRoles } = require("../middleware/auth");

const secret = "test-only-secret-that-is-at-least-32-characters";
process.env.JWT_SECRET = secret;

function responseRecorder() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("requires an HttpOnly session cookie", () => {
  const res = responseRecorder();
  let nextCalled = false;

  requireAuth({ headers: {}, cookies: {} }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
});

test("verifies the session cookie and attaches claims", () => {
  const req = {
    headers: {},
    cookies: { gosawa_session: jwt.sign({ id: 7, role: "admin" }, secret) },
  };
  const res = responseRecorder();
  let nextCalled = false;

  requireAuth(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.auth.id, 7);
  assert.equal(req.auth.role, "admin");
});

test("allows only configured roles", () => {
  const res = responseRecorder();
  let nextCalled = false;

  allowRoles("admin")({ auth: { role: "seeker" } }, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
});