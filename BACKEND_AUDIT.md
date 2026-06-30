# Backend Audit — CivicPulse

This report presents a thorough evaluation of the Express.js and MongoDB backend server, focusing on project structure, API designs, database management, security vulnerabilities, and performance issues.

---

## 1. Project Architecture

- **Pattern**: Follows a standard MVC-style Express layout (Routes -> Controllers -> Models/Middleware).
- **Initialization**: [server.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/server.js) sets up global configurations, handles CORS, registers static assets middleware, establishes database connections, and mounts endpoints.
- **Routing**: Handled separately via route definition routers that map paths to controller functions.

---

## 2. API Design & Consistency

### Critical Routing Path Mismatch (Double Admin Prefix)
- **Problem**: In [server.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/server.js), the admin route is mounted under `/api/admin`:
  ```javascript
  app.use("/api/admin", adminRoutes);
  ```
  However, inside [adminRoutes.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/routes/adminRoutes.js), the dashboard statistics endpoint is declared as:
  ```javascript
  router.get("/admin/dashboard-stats", authMiddleware, requireRole("admin"), getAdminDashboardStats);
  ```
  This creates a combined API endpoint path of `/api/admin/admin/dashboard-stats`.
- **Impact**: The frontend is hardcoded to request `/api/admin/dashboard-stats`. Because of the extra `/admin` segment in the backend router, the request returns a **404 Not Found** error, completely breaking the admin statistics dashboard.

### Error Handling
- **Practice**: The global error handler in [server.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/server.js) catches exceptions, but individual controllers catch exceptions and send back `res.status(500).json({ error: err.message })`.
- **Vulnerability**: Exposing raw `err.message` to clients in production is bad practice, as it can leak path variables, database configurations, or library call stacks, aiding potential attackers.

### Request Validation
- **Problem**: There is no request validation framework (like Joi or express-validator). Inputs are read directly from `req.body` and fed to Mongoose models. If key fields are missing or improperly typed, the DB operation either crashes or inserts corrupted data.

---

## 3. Database Architecture

### Missing Schema Field (Report Category)
- **Problem**: The [Report.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/models/Report.js) Mongoose schema contains fields for title, description, imageUrl, status, user, state, and area. However, it lacks a **category** field.
- **Impact**: When the user creates a report, the `category` input is dropped by Mongoose's strict schema compiler.

### Lack of Database Indexing (Performance Bottleneck)
- **Problem**: No indexes are defined in the Mongoose schemas aside from default key constraints.
- **Impact**: The backend frequently queries reports by:
  - `user` (for citizen user listings: `Report.find({ user: req.user.id })`)
  - `state` and `area` (for admin filtering: `Report.find({ state, area })`)
- As the collection grows, these queries will require **COLLSCANs** (collection scans) that load every document into memory, causing response times to scale linearly with user counts.

---

## 4. Security Audit

### NoSQL Injection Risk
- **Problem**: Raw client input is passed directly to queries like `User.findOne({ username })`. If `username` is passed as a JSON object (e.g. `{ "$ne": null }`), an attacker could bypass credentials checks or extract database information.
- **Fix**: Sanitize request parameters using a package like `mongo-sanitize`.

### Missing Rate Limiter
- **Problem**: The API lacks rate-limiting mechanisms on critical endpoints like login or registration.
- **Impact**: The auth routes are vulnerable to automated dictionary or brute-force attacks.

### CORS Setup Weakness
- **Problem**: The allowed origins are hardcoded to `http://localhost:5173` and a single Vercel domain.
- **Impact**: This breaks testing under Vercel preview environments, local dev servers spinning up on other ports (e.g., `5174`, `5175`), or alternative clients.

---

## 5. Backend Performance

### Disk Storage for File Uploads
- **Problem**: Multer is configured to use disk storage (`multer.diskStorage`), saving files directly to `/uploads` on the server disk.
- **Impact**: In a serverless environment (like Vercel serverless functions) or containers (like Render free tier), the disk is ephemeral. Uploaded files will vanish whenever the container restarts. Additionally, serving static files directly from the Node.js event loop blocks incoming API traffic.
- **Fix**: Use cloud object stores (like AWS S3, Cloudinary) to handle file uploads.
