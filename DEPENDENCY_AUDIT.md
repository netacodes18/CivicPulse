# Dependency Audit — CivicPulse

This document reviews the dependencies in both the backend and frontend packages, identifies security vulnerabilities (high and moderate severities), highlights deprecated packages, and maps out a safe upgrade strategy.

---

## 1. Backend Dependency Status

| Package | Declared Version | Role | Status / Vulnerability | Action |
| :--- | :--- | :--- | :--- | :--- |
| `mongoose` | `^8.16.0` | Database ORM | High severity: NoSQL Injection bypass in `$nor` ($sanitizeFilter) | Upgrade to `>=8.22.1` |
| `multer` | `^2.0.1` | File uploads | High severity: Denial of Service vulnerabilities (incomplete cleanup, uncontrolled recursion, nested fields) | Upgrade to stable `1.4.5-lts` or stable `^2.0.0` if released |
| `express` | `^4.18.2` | Web server framework | Implicitly pulls in `qs` and `path-to-regexp` which contain vulnerabilities | Upgrade to `>=4.21.2` |
| `bcryptjs` | `^3.0.2` | Hashing utility | Stable | Keep |
| `jsonwebtoken` | `^9.0.2` | Auth tokens signing | Stable | Keep |
| `cors` | `^2.8.5` | CORS config | Stable | Keep |
| `dotenv` | `^16.5.0` | Env loading | Stable | Keep |

---

## 2. Frontend Dependency Status

| Package | Declared Version | Role | Status / Vulnerability | Action |
| :--- | :--- | :--- | :--- | :--- |
| `vite` | `^6.3.5` | Builder / Dev server | High severity: Path traversal and alternate path access on Windows systems | Upgrade to `>=6.4.3` |
| `axios` | `^1.11.0` | HTTP Client | High severity: Prototype Pollution (credential leak, response hijacking, SSRF) | Upgrade to `>=1.16.0` (or stable patch) |
| `postcss` | `^8.5.6` | Style processing | Moderate: XSS via unescaped styles in css-stringify | Upgrade to `>=8.5.10` |
| `react` | `^19.1.0` | Core framework | Stable | Keep |
| `react-dom`| `^19.1.0` | DOM binder | Stable | Keep |
| `react-router-dom`| `^6.30.1` | Router library | Stable | Keep |
| `lucide-react` | `^0.516.0` | Icon system | Stable | Keep |

---

## 3. Vulnerability Summaries (Critical/High/Medium)

### A. Mongoose NoSQL Injection (High)
- **Vulnerability**: Mongoose's `sanitizeFilter` has improper sanitization of queries using `$nor` operator, allowing NoSQL injections.
- **Reference**: GHSA-wpg9-53fq-2r8h
- **Risk**: High. Attackers can bypass filter constraints and pull records from other areas/states.

### B. Multer Denial of Service (High)
- **Vulnerability**: Multer allows Denial of Service via uncontrolled recursion of multipart forms, deep nested field names, or incomplete cleanup of aborted uploads.
- **Reference**: GHSA-xf7r-hgr6-v32p, GHSA-3p4h-7m6x-2hcm
- **Risk**: High. An attacker uploading garbage files can exhaust disk space or block event loops.

### C. Vite Windows Path Traversal (High)
- **Vulnerability**: Vite dev server alternate paths bypass allows reading files on Windows filesystems outside the server directory root.
- **Reference**: GHSA-4w7w-66w2-5vf9, GHSA-fx2h-pf6j-xcff
- **Risk**: High during local development.

### D. Axios SSRF and Prototype Pollution (High)
- **Vulnerability**: Prototype pollution gadgets in Axios config merge allow credential injection, request hijacking, and SSRF proxy bypass.
- **Reference**: GHSA-3p68-rc4w-qgx5, GHSA-3g43-6gmg-66jw
- **Risk**: High. Could lead to session leakage or arbitrary request redirects.

---

## 4. Upgrade Strategy & Migration Risks

### Migration Steps
1. **Fix Vulnerable Direct Dependencies Safely**:
   - In `/backend`, run:
     `npm install mongoose@8.22.1 express@4.21.2`
   - In `/frontend`, run:
     `npm install axios@latest` (or target patch resolving proxy issues)
     `npm install -D vite@latest postcss@latest`
2. **Apply Nested Fixes (Indirect Dependencies)**:
   - Run `npm audit fix` inside both folders to patch transitive dependencies (like `qs`, `path-to-regexp`, `minimatch`, `picomatch`, `rollup`, `flatted`) without major breaking changes.

### Migration Risks
- **Mongoose**: Bumping mongoose 8.16 to 8.22 is a minor update, so breaking schema changes are unlikely. However, filters will be sanitized more strictly, so any custom query patterns using complex MongoDB operators must be tested.
- **Multer**: Moving away from the pre-release 2.0.1 to standard Multer 1.4.x might break how `req.file` is parsed in controllers. However, keeping the current version might sustain high-severity vulnerabilities. If Multer 2.x is kept, it should be updated to its latest patch.
- **React 19**: Frontend is already running React 19.1.0, which means compatibility issues with core hooks or dependencies are already resolved.
- **Vite 6**: Updating Vite to its latest patch carries extremely low risk since configurations are standard.
