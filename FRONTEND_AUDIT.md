# Frontend Audit — CivicPulse

This document presents a complete audit of the frontend React web application, highlighting architecture, UI/UX issues, code quality, performance metrics, and security evaluations.

---

## 1. Frontend Architecture

### Directory & Component Structure
- **Organization**: The codebase follows a flat structure under `src/`:
  - `components/`: Contains modular elements (only [Navbar.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/components/Navbar.jsx) exists).
  - `pages/`: Page views representing the primary routing components.
  - `context/`: Shared context states ([AuthContext.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/context/AuthContext.jsx)).
  - `api/`: Centralized HTTP setup.
- **Routing**: Client-side routing is handled in [App.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/App.jsx) via `react-router-dom`.
  - **Weakness**: **Unguarded Routes**. There are no Route Guards (`ProtectedRoute` components) to prevent unauthenticated users from navigating to `/admin-dashboard`, `/my-reports`, `/report`, or `/profile`. Although the backend API will reject unauthorized requests, client-side views still render in a broken/empty state instead of redirecting the user to `/login`.

### State Management
- **Implementation**: Managed globally via `AuthContext.Provider`. It decodes JWT on initial load and handles token storage lifecycle (`localStorage`).
- **Concern**: Direct side-effects (mutating `localStorage` directly inside login methods) are tightly coupled with the React Context component instead of abstracting into an auth utility or storage hook.

---

## 2. UI/UX Analysis

### Visual Consistency & Premium Feel
- The pages leverage Tailwind CSS. However, the visual aesthetics feel somewhat basic and form-heavy, with simple grid boxes and solid gradients.
- **Micro-interactions**: The landing page uses hover animations, but button clicks lack loading indicators (except for a simple spinner in MyReports).

### Mobile Responsiveness
- **Critical Bug (Static Mobile Menu)**: In [Navbar.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/components/Navbar.jsx), lines 161–178 render a mobile menu button (hamburger icon) for small screens, but it has no state hooks (`isOpen`) or onClick toggle triggers. The responsive desktop navigation menu collapses on mobile viewports, leaving mobile users with a static navbar and no way to navigate the website.

### Accessibility (a11y)
- **Form Labels**: In [Signup.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/pages/Signup.jsx) and [Login.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/pages/Login.jsx), inputs have placeholders but no associated `<label>` elements or `aria-label` tags. This creates accessibility barriers for screen readers.
- **Color Contrast**: Some text elements (e.g., `text-slate-500` or `text-xs`) on white or light gray backgrounds may fail WCAG AA contrast ratios.

---

## 3. Code Quality & Standards

### Duplicate Code
- **SVG Icon Redundancy**: Large custom SVG markup is defined directly inline across multiple pages (e.g., [MyReports.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/pages/MyReports.jsx) contains over 100 lines of raw SVG markup for icons). These should be replaced using the imported `lucide-react` library.
- **Alert boxes**: Multiple components define their own custom error/success banner markup instead of reusing a shared alert component.

### Dead Code & Unused Modules
- **Imports**: Unused imports are found in pages (e.g., `useContext` or Lucide icons imported but not called).
- **Files**: [App.css](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/App.css) contains template styles that are completely bypassed in favor of Tailwind utility classes.

### Component Design Issues
- **Overly Large Files**: [MyReports.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/pages/MyReports.jsx) (402 lines) and [AdminDashboard.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/pages/AdminDashboard.jsx) (362 lines) combine data-fetching logic, state trackers, listing tables, and raw presentation components into single files. These should be split into presentational widgets and hooks.

---

## 4. Performance

### Bundle Sizes & Lazy Loading
- **Issue**: Standard imports are used in [App.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/App.jsx). This causes the entire page bundle (including heavy dashboard components) to load eagerly, slowing down initial page loads for public users visiting only the home page.
- **Recommendation**: Wrap page components in `React.lazy()` and render inside a `<Suspense>` boundary.

### Request Optimization
- **Waterfall Requests**: Pages perform isolated fetches on mount. While acceptable for a small app, this can lead to waterfalls if parent components and child components trigger sequential API requests instead of using a global cache (like TanStack Query / RTK Query).

---

## 5. Security Evaluation

### Token Storage (XSS Risk)
- **Vulnerability**: JWT authentication tokens are saved in `localStorage`. If an attacker executes a Cross-Site Scripting (XSS) exploit, they can read the storage and steal the user's active session.
- **Recommendation**: Migrate token storage to HTTP-Only cookies to protect tokens from JS read access.

### Client-Side State Injection
- **Issue**: The app relies entirely on client-side routing to decide which dashboard options to show. If an attacker tampers with the AuthContext state via browser tools, they can force the UI to render the administrative buttons (though actual backend APIs will reject requests).
