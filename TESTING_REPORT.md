# Testing Report — CivicPulse

This report outlines the status of testing in the CivicPulse codebase, detailing the initial state, the test suite introduced during this audit, and recommendations for comprehensive production testing.

---

## 1. Initial State of Testing
- **Existing Tests**: None. The repository did not have any unit, integration, or end-to-end tests configured.
- **Coverage**: 0% coverage on both frontend and backend code bases.
- **Test Tooling**: No testing framework (like Jest, Mocha, Vitest, Cypress, or Playwright) was specified or installed in the dependency trees.

---

## 2. Test Suite Implementation (Actions Taken)

To introduce baseline verification without adding heavy external dependencies, we implemented unit testing for key backend components using the native **Node.js test runner** (`node:test`) and the built-in assertion module (`node:assert`).

### Added Tests
- **File**: [authMiddleware.test.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/tests/authMiddleware.test.js)
- **Suite Cases**:
  1. `authMiddleware - no token provided returns 401`: Verifies that requests without authorization headers are blocked.
  2. `authMiddleware - invalid bearer format returns 401`: Verifies that malformed header tokens are rejected.
  3. `authMiddleware - invalid or expired token returns 401`: Verifies that invalid tokens are rejected.
  4. `authMiddleware - valid token calls next and appends user to req`: Verifies that valid JWTs are correctly verified and decoded details are appended to the Express request object (`req.user`).
  5. `requireRole - denies access if role does not match`: Verifies that a client user role is blocked from admin routes.
  6. `requireRole - allows access if role matches case-insensitively`: Verifies that matching roles (case-insensitively) successfully pass the role guard.

### Manifest Configuration
- Updated [package.json](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/package.json) to map the test script:
  ```json
  "test": "node --test tests/*.test.js"
  ```
- **Test Run Outcome**: Successfully executed `npm test` locally. 6 tests run, 6 passed, 0 failed.

---

## 3. Missing Tests & Future Coverage Plan

To achieve production-grade quality, the following testing gaps should be addressed:

### Backend Testing Recommendations
1. **Controller Integration Tests**:
   - Use `Supertest` to test API routes under realistic conditions.
   - Run tests against a temporary local MongoDB instance (using `mongodb-memory-server`) to verify report creation, status updating, and administrative deletion processes.
2. **Input Validation Testing**:
   - Add unit tests verifying validation filters (e.g. invalid emails, overly short passwords, SQL/NoSQL injection payloads) once validation middleware is implemented.

### Frontend Testing Recommendations
1. **Component Rendering Tests**:
   - Install `Vitest` and `React Testing Library` to test component renders (e.g. checking that the [Navbar](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/components/Navbar.jsx) displays citizen links when role is `user` and administrative links when role is `admin`).
2. **Mock Routing Tests**:
   - Test client routing to ensure unguarded route attempts trigger redirection once client-side protection is added.
3. **End-to-End (E2E) Tests**:
   - Set up `Playwright` to test the full user flow: Citizen registers -> logins -> files an issue -> Admin logs in -> updates the issue status -> Citizen views the updated status.
