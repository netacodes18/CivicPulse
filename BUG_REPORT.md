# BUG_REPORT.md — CivicPulse

This document classifies all identified bugs and issues by severity tier. Critical bugs have already been resolved. Major and Minor issues are documented for tracking.

---

## Critical Issues (All Resolved ✅)

| # | Bug | File | Status |
|:--|:----|:-----|:-------|
| C1 | **Admin route 404**: Routes mounted at `/api/admin` with inner paths `/admin/dashboard-stats` created double-prefix `/api/admin/admin/dashboard-stats`. | [adminRoutes.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/routes/adminRoutes.js) | ✅ Fixed |
| C2 | **Report schema missing `category` field**: Frontend sends `category` in form body, but Mongoose schema did not define it — silently dropped on save. | [Report.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/models/Report.js) | ✅ Fixed |
| C3 | **VITE_API_URL path duplication**: Setting `VITE_API_URL=/api` caused Axios to request `/api/api/auth/signup`. | [frontend/.env](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/.env) | ✅ Fixed |
| C4 | **Vite proxy port mismatch**: Proxy target pointed to `localhost:5000` while backend listens on `10000`. | [vite.config.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/vite.config.js) | ✅ Fixed |
| C5 | **Admin dashboard cards showing wrong counts**: All three status cards displayed `stats.total` instead of their respective `pending`/`inProgress`/`resolved` values. | [AdminDashboard.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/pages/AdminDashboard.jsx) | ✅ Fixed |
| C6 | **Auth test route undefined property**: `/api/auth/test` referenced `req.user.name` which does not exist; should be `req.user.username`. | [authRoutes.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/routes/authRoutes.js) | ✅ Fixed |
| C7 | **Uploads directory crash**: Multer fails with `ENOENT` if `/uploads` directory does not exist on fresh clone/deploy. | [server.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/server.js) | ✅ Fixed |

---

## Major Issues (Open for Phase 6–8)

| # | Bug | Severity | File | Notes |
|:--|:----|:---------|:-----|:------|
| M1 | **No API rate limiting**: Auth endpoints (`/signup`, `/login`) have no throttle, allowing brute-force password attacks. | MAJOR | server.js | Phase 8 implementation |
| M2 | **No Multer file size limit**: Users can upload arbitrarily large files, risking disk exhaustion and DoS. | MAJOR | [upload.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/middleware/upload.js) | Add `limits: { fileSize: 5 * 1024 * 1024 }` |
| M3 | **No request body validation**: Missing `express-validator` or `joi` — raw user input passes directly to MongoDB queries (NoSQL injection risk). | MAJOR | Controllers | Phase 8 |
| M4 | **No pagination**: `Report.find()` returns all documents — will degrade with scale. | MAJOR | Controllers | Phase 7 |
| M5 | **Hardcoded JWT secret**: `.env` contains `yourVerySecretKey123` — trivially guessable. | MAJOR | backend/.env | Rotate immediately |
| M6 | **MongoDB URI in git history**: Connection string with password was committed to version control. | MAJOR | backend/.env | Revoke and rotate credentials |
| M7 | **Admin dashboard stats uses 4 queries**: `countDocuments` called 4 times instead of a single `aggregate` pipeline. | MAJOR | adminController.js | Phase 7 optimization |
| M8 | **Dashboard stats response shape mismatch**: Controller returns `{ total, pending, inProgress, resolved }` flat but frontend reads `res.data.stats`. | MAJOR | adminController.js / AdminDashboard.jsx | Needs alignment |

---

## Minor Issues (Tracked)

| # | Bug | Severity | File | Notes |
|:--|:----|:---------|:-----|:------|
| m1 | **No password strength enforcement**: Users can register with 1-char passwords. | MINOR | authController.js | Add minimum length check |
| m2 | **No email format validation on backend**: Frontend has `type="email"` but backend accepts any string. | MINOR | authController.js | Add regex check |
| m3 | **console.log used for production logging**: Should use structured logger (winston/pino). | MINOR | All backend files | Low priority |
| m4 | **`config.js` fallback URL is unused**: `BASE_URL` constant is exported but never imported by any component. | MINOR | [config.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/config.js) | Dead code |
| m5 | **No `alt` text accessibility on some images**: Report evidence images use generic alt text. | MINOR | MyReports.jsx, AllReports.jsx | Accessibility |
| m6 | **Browserslist data 13 months old**: Build warning about outdated caniuse-lite database. | MINOR | package.json | Run `npx update-browserslist-db@latest` |
