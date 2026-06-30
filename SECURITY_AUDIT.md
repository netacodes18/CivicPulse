# Security Audit — CivicPulse

This document lists security concerns identified across the CivicPulse code base, organized by severity levels (Critical, High, Medium, Low), and includes remediation steps.

---

## 1. Vulnerability Registry by Severity

### 🔴 CRITICAL SEVERITY

#### A. Exposed Database Credentials in Version Control
- **Location**: [backend/.env](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/.env)
- **Description**: The MongoDB Atlas Connection string contains raw, hardcoded credentials (`civicpulse_user:Netaji%402023`). Because `.env` is checked into the Git repository, these credentials are exposed to anyone with access to the source code history.
- **Impact**: Rogue actors can gain access to the database cluster, leading to data exfiltration, tampering, or deletion.
- **Remediation**:
  1. Revoke the database credentials immediately in the MongoDB Atlas console.
  2. Add `.env` to the root and backend `.gitignore` files.
  3. Rotate password keys and inject them at run time via environment variables on the hosting platform (e.g., Render dashboard).

#### B. Weak, Hardcoded JWT Secret
- **Location**: [backend/.env](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/.env)
- **Description**: The JWT signing key is hardcoded to a weak value: `yourVerySecretKey123`.
- **Impact**: Attackers can forge valid admin tokens locally, bypass security checks, and execute admin actions (like deleting reports or changing statuses).
- **Remediation**: Rotate the JWT secret to a cryptographically strong, randomly generated 256-bit key stored outside the codebase.

---

### 🟡 HIGH SEVERITY

#### A. NoSQL Injection Vulnerability
- **Location**: [authController.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/controllers/authController.js) (login, signup) and [userController.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/controllers/userController.js)
- **Description**: Request body inputs (e.g., `req.body.username` or `req.body.email`) are fed directly into MongoDB Mongoose queries (`User.findOne({ email })`) without type validation. If an attacker submits a JSON object containing query operators (like `{ "email": { "$ne": "" } }`), they can bypass auth validation.
- **Impact**: Potential login bypasses and extraction of user list hashes.
- **Remediation**: Use middleware like `express-mongo-sanitize` or validate that all incoming fields are strings of expected lengths before querying the database.

#### B. Ephemeral Upload Storage and Lack of Size Limits
- **Location**: [upload.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/middleware/upload.js)
- **Description**: Image uploads are saved on the local filesystem. Multer has no limits on file sizes or counts.
- **Impact**:
  - Denial of Service (DoS) via disk space exhaustion.
  - Ephemeral disks on hosting platforms (like Render free tier or Vercel serverless) wipe files on container restarts, losing citizen proof files.
- **Remediation**:
  - Configure `limits: { fileSize: 5 * 1024 * 1024 }` (e.g., 5MB limit) in Multer.
  - Integrate cloud object storage (e.g., Cloudinary or AWS S3) for persistent file handling.

---

### 🟢 MEDIUM SEVERITY

#### A. Token Exposure in localStorage (XSS Vulnerability)
- **Location**: [AuthContext.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/context/AuthContext.jsx)
- **Description**: Auth token is stored in the browser's `localStorage` to survive page reloads.
- **Impact**: Vulnerable to Session Hijacking via Cross-Site Scripting (XSS). If a third-party script runs malicious code, it can exfiltrate active user tokens.
- **Remediation**: Store tokens in memory and use HttpOnly, Secure, SameSite cookies for token transmission.

#### B. Absence of Input Validation & Sanitation
- **Location**: [authController.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/controllers/authController.js)
- **Description**: No backend check verifies if the email matches standard formats, if usernames contain illegal characters, or if passwords satisfy complexity criteria.
- **Impact**: Spam accounts and potential database bloat.
- **Remediation**: Integrate a validation library like `Joi` or `express-validator` to enforce input schemas.

---

### 🔵 LOW SEVERITY

#### A. Missing Client-Side Route Protection
- **Location**: [App.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/App.jsx)
- **Description**: Routes like `/admin-dashboard` are public routes.
- **Impact**: Bad user experience where non-logged in users load the admin screen outline before being rejected by the API.
- **Remediation**: Create a `ProtectedRoute` wrapper component to block unauthenticated access.
