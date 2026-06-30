const test = require("node:test");
const assert = require("node:assert");
const jwt = require("jsonwebtoken");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

// Set up process.env.JWT_SECRET for testing
process.env.JWT_SECRET = "testsecret123";

test("authMiddleware - no token provided returns 401", () => {
  const req = { headers: {} };
  let statusSet = null;
  let jsonSent = null;

  const res = {
    status(code) {
      statusSet = code;
      return {
        json(data) {
          jsonSent = data;
        },
      };
    },
  };

  const next = () => {
    assert.fail("next() should not be called when no token is provided");
  };

  authMiddleware(req, res, next);

  assert.strictEqual(statusSet, 401);
  assert.deepStrictEqual(jsonSent, { message: "No token provided" });
});

test("authMiddleware - invalid bearer format returns 401", () => {
  const req = { headers: { authorization: "InvalidFormat tokenhere" } };
  let statusSet = null;
  let jsonSent = null;

  const res = {
    status(code) {
      statusSet = code;
      return {
        json(data) {
          jsonSent = data;
        },
      };
    },
  };

  const next = () => {
    assert.fail("next() should not be called on invalid format");
  };

  authMiddleware(req, res, next);

  assert.strictEqual(statusSet, 401);
  assert.deepStrictEqual(jsonSent, { message: "No token provided" });
});

test("authMiddleware - invalid or expired token returns 401", () => {
  const req = { headers: { authorization: "Bearer invalidtoken" } };
  let statusSet = null;
  let jsonSent = null;

  const res = {
    status(code) {
      statusSet = code;
      return {
        json(data) {
          jsonSent = data;
        },
      };
    },
  };

  const next = () => {
    assert.fail("next() should not be called on invalid token");
  };

  authMiddleware(req, res, next);

  assert.strictEqual(statusSet, 401);
  assert.deepStrictEqual(jsonSent, { message: "Invalid or expired token" });
});

test("authMiddleware - valid token calls next and appends user to req", () => {
  const payload = { id: "user123", role: "admin", username: "adminuser" };
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  const req = { headers: { authorization: `Bearer ${token}` } };
  
  let nextCalled = false;
  const res = {};
  const next = () => {
    nextCalled = true;
  };

  authMiddleware(req, res, next);

  assert.strictEqual(nextCalled, true);
  assert.strictEqual(req.user.id, "user123");
  assert.strictEqual(req.user.role, "admin");
  assert.strictEqual(req.user.username, "adminuser");
});

test("requireRole - denies access if role does not match", () => {
  const req = { user: { id: "user123", role: "user" } };
  let statusSet = null;
  let jsonSent = null;

  const res = {
    status(code) {
      statusSet = code;
      return {
        json(data) {
          jsonSent = data;
        },
      };
    },
  };

  const next = () => {
    assert.fail("next() should not be called on mismatched role");
  };

  const middleware = requireRole("admin");
  middleware(req, res, next);

  assert.strictEqual(statusSet, 403);
  assert.deepStrictEqual(jsonSent, { message: "Access denied: Insufficient role" });
});

test("requireRole - allows access if role matches case-insensitively", () => {
  const req = { user: { id: "user123", role: "ADMIN" } };
  let nextCalled = false;
  const res = {};
  const next = () => {
    nextCalled = true;
  };

  const middleware = requireRole("admin");
  middleware(req, res, next);

  assert.strictEqual(nextCalled, true);
});
