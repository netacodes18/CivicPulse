# PROJECT_ANALYSIS.md — CivicPulse

## What CivicPulse Does

CivicPulse is a **civic engagement web platform** that enables citizens to report local municipal issues (potholes, broken streetlights, sanitation, drainage, etc.) and allows government administrators to track, triage, and resolve those issues. It bridges the communication gap between residents and local municipal bodies.

---

## Current User Flow

### Citizen Flow
1. **Register** an account with username, email, password, state, and area.
2. **Login** with credentials and role selection (Citizen).
3. **Submit a Report** with title, description, category, and optional photo evidence.
4. **View My Reports** dashboard showing all personally filed reports with status indicators.
5. **Delete Reports** that are no longer relevant.
6. **View Profile** showing registration details and authentication status.

### Admin Flow
1. **Login** with admin role credentials.
2. **View Admin Dashboard** with aggregate statistics (Total, Pending, In Progress, Resolved).
3. **Browse All Reports** filtered by area within admin's registered state.
4. **Update Report Status** by pasting a report ID and selecting a new status (Pending → In Progress → Resolved).
5. **Delete Any Report** from the system.

---

## Architecture

### Frontend
| Property | Value |
|:---|:---|
| Framework | React 19.1.0 |
| Bundler | Vite 6.3.5 |
| Router | react-router-dom 6.30.1 |
| HTTP Client | Axios 1.11.0 |
| CSS Framework | TailwindCSS 3.4.17 |
| Icons | lucide-react 0.516.0 |
| Auth Decoding | jwt-decode 4.0.0 |
| State Management | React Context API (AuthContext) |

### Backend
| Property | Value |
|:---|:---|
| Runtime | Node.js 22.x |
| Framework | Express 4.18.2 |
| Database | MongoDB Atlas (Mongoose 8.16.0) |
| Auth | jsonwebtoken 9.0.2 |
| Password Hashing | bcryptjs 3.0.2 |
| File Uploads | Multer 2.0.1 |
| CORS | cors 2.8.5 |

### Database Schema

**Users Collection**
- `username` (String, unique, required)
- `email` (String, unique, required)
- `password` (String, bcrypt hashed)
- `role` ("user" | "admin")
- `state` (String, required)
- `area` (String, optional)

**Reports Collection**
- `title` (String, required)
- `description` (String)
- `category` (String, default: "other")
- `imageUrl` (String)
- `status` ("pending" | "in-progress" | "resolved")
- `user` (ObjectId → Users, indexed)
- `state` (String, indexed)
- `area` (String, indexed)
- `createdAt` / `updatedAt` (timestamps)

### Authentication
- JWT tokens signed with `JWT_SECRET`, 1-day expiry.
- Token payload: `{ id, role, username, state, area }`.
- Roles normalized to lowercase on registration and login.
- `authMiddleware` extracts Bearer token, verifies signature, attaches decoded user to `req.user`.
- `requireRole("admin")` middleware gates admin-only endpoints.

### API Routes
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `GET /api/user/profile` — Citizen profile
- `POST /api/user/report` — Submit report (with multer upload)
- `GET /api/user/my-reports` — Citizen's reports
- `PUT /api/user/report/:id` — Update own report
- `DELETE /api/user/report/:id` — Delete own report
- `GET /api/admin/reports` — All reports (state-filtered)
- `GET /api/admin/dashboard-stats` — Aggregate counts
- `PUT /api/admin/report/:id/status` — Update status
- `DELETE /api/admin/report/:id` — Admin delete

### Deployment
- **Backend**: Render (Node Web Service), port 10000
- **Frontend**: Vercel (static build), `VITE_API_URL` env var

---

## Features Already Implemented
1. ✅ User registration and login with role-based access
2. ✅ JWT authentication with middleware guards
3. ✅ Citizen report submission with image upload
4. ✅ Citizen dashboard (my reports)
5. ✅ Admin dashboard with aggregate statistics
6. ✅ Admin report listing with area filtering
7. ✅ Admin status update workflow
8. ✅ Report deletion (both citizen and admin)
9. ✅ User profile viewing
10. ✅ Mobile-responsive modern UI with architecture-inspired design
11. ✅ Custom confirmation modals and toast notifications
12. ✅ CORS configuration for production deployments

## Missing Features
1. ❌ No upvote/support mechanism for community issue prioritization
2. ❌ No comment/discussion system on reports
3. ❌ No geolocation coordinates on reports
4. ❌ No API rate limiting (brute-force vulnerable)
5. ❌ No JWT refresh token mechanism
6. ❌ No email/password validation strength checks
7. ❌ No report detail/single-view page
8. ❌ No notification system
9. ❌ No analytics or trend visualization
10. ❌ No input sanitization middleware (XSS risk)
11. ❌ No Multer file size limits
12. ❌ No pagination on report listings

## Technical Debt
1. MongoDB credentials were committed to git history (exposed in `.env`)
2. JWT secret is a weak, hardcoded string (`yourVerySecretKey123`)
3. No request body validation library (e.g., express-validator or joi)
4. Admin dashboard stats endpoint makes 4 separate `countDocuments` queries instead of one aggregation pipeline
5. Image URLs use ephemeral local disk storage (lost on container restarts)
6. No centralized error handling patterns in controllers
7. `console.log` used for production logging instead of structured logger

## Scalability Issues
1. No pagination — listing endpoints return unbounded result sets
2. No caching layer for frequently accessed dashboard stats
3. No database connection pooling configuration
4. Single-region deployment (no CDN for static assets)
5. No horizontal scaling strategy for backend workers
