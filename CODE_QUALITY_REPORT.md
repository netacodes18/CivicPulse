# Code Quality Report — CivicPulse

This report details structural issues, code duplication, naming mismatches, file complexities, and general technical debt within the CivicPulse application.

---

## 1. Dead Code, Unused Files & Modules

### Frontend
- **Unused Stylesheet**: [App.css](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/App.css) is imported in the source code but its contents are redundant templates.
- **Unused Imports**:
  - [Navbar.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/components/Navbar.jsx) imports `Home` from `lucide-react` but never references it.
  - [UserProfile.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/pages/UserProfile.jsx) imports `useEffect` but duplicates local user profiles logic unnecessarily.

### Backend
- **Unused Middleware**: `requireRole` is imported in [userRoutes.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/routes/userRoutes.js) but is never attached to any user routes.

---

## 2. Duplicate Logic & SVG Bloat

- **Raw SVG Injection**:
  - [MyReports.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/pages/MyReports.jsx) contains multiple inline SVG components for icons (e.g. status icons, maps pins, document sheets) comprising over 150 lines of static markup.
  - The same pattern is repeated in [AdminDashboard.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/pages/AdminDashboard.jsx), [UserProfile.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/pages/UserProfile.jsx), and [Navbar.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/components/Navbar.jsx).
  - **Resolution**: Use the `lucide-react` library (already installed in the dependencies) for all icons to make components clean and readable.

---

## 3. Naming Mismatches & Typographical Bugs

### A. Missing Report Schema Category Field
- **Location**: [Report.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/models/Report.js) vs [userController.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/controllers/userController.js)
- **Description**: The controller writes `category` to the database, but the model schema fails to declare it. Mongoose discards this field, causing all reports to show as "Uncategorized".

### B. Route Redundancy (Double Admin Path)
- **Location**: [adminRoutes.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/routes/adminRoutes.js)
- **Description**: Mounting `adminRoutes` under `/api/admin` combined with `router.get("/admin/dashboard-stats")` leads to `/api/admin/admin/dashboard-stats`.
- **Impact**: Frontend calls `/api/admin/dashboard-stats` causing 404 errors.

### C. Protected Route Attribute Access Mismatch
- **Location**: [authRoutes.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/routes/authRoutes.js)
- **Description**: `/api/auth/protected` calls `req.user.name` instead of `req.user.username`, returning `Hello undefined`.

---

## 4. Large Components & Complexity

### Component Bloat
- **Files**: [MyReports.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/pages/MyReports.jsx) and [AdminDashboard.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/pages/AdminDashboard.jsx).
- **Issue**: These components combine data fetch lifecycle hooks, search queries, pagination logic, layout render branches, and large Tailwind CSS strings.
- **Refactoring Opportunity**: Extract components into reusable pieces:
  - `StatCard`: Standard statistics card.
  - `ReportItem`: Report card item for citizen listings.
  - `StatusBadge`: Generic status indicator.

---

## 5. Dev Server Mismatch (Technical Debt)

- **Proxy Mismatch**: [vite.config.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/vite.config.js) uses port `5000` for proxy targeting, while the backend server listens on port `10000` by default.
- **Environment Mismatches**: Hardcoded Render domain in [frontend/.env](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/.env) forces local dev to call production database endpoints.
