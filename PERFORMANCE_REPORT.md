# Performance Report — CivicPulse

This report outlines performance analyses of the CivicPulse frontend and backend, highlighting initial loading problems, rendering concerns, database query speeds, and memory configurations.

---

## 1. Frontend Performance Audit

### A. Initial Load & Code Splitting
- **Problem**: In [App.jsx](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/src/App.jsx), all pages (`AdminDashboard`, `AllReports`, `MyReports`, `UserProfile`, etc.) are imported eagerly at startup.
- **Impact**: All code is bundled into a single JavaScript file (`dist/assets/index-*.js`). An unauthenticated user visiting the landing page is forced to download the code for the admin and citizen dashboards. This increases initial bundle sizes and slows down the time-to-interactive (TTI).
- **Optimization**: Wrap page routing in `React.lazy()` and utilize a `<Suspense>` component to split chunks.

### B. Image Processing & Bandwidth Consumption
- **Problem**: The platform serves raw user-uploaded evidence photos directly from the server disk. There is no image compression, resizing, or transformation middleware.
- **Impact**: If multiple citizens upload high-resolution 10MB photographs of civic issues, administrative pages listing reports (like All Reports) will download gigabytes of raw images concurrently. This leads to slow page loads, poor rendering performance, and high bandwidth costs.
- **Optimization**: Compress images client-side before upload, or integrate a cloud storage service like Cloudinary to request dynamically resized/web-optimized image paths.

### C. Request Waterfalls & Client Caching
- **Problem**: Every page fetch runs inside isolated `useEffect` blocks. There is no query cache layer.
- **Impact**: Navigating between pages (e.g. going from "My Reports" to "Profile" and back) triggers fresh network requests every time, causing layout flickers and redundant database queries.
- **Optimization**: Introduce a client cache manager (e.g. React Query) to cache query keys and render instantly.

---

## 2. Backend Performance Audit

### A. Missing Database Indexes (COLLSCANs)
- **Problem**: The MongoDB collections (`users` and `reports`) do not declare schema indexes on lookup fields:
  - `Report.find({ user: req.user.id })` triggers a collection scan without an index on the `user` field.
  - `Report.find({ state: ... })` triggers a collection scan without an index on `state` and `area`.
- **Impact**: Query latency scales linearly with database growth. As reports increase into the thousands, database performance will decay, causing high CPU load on the database cluster.
- **Optimization**: Create compound and single indexes in the Mongoose schemas:
  - `reportSchema.index({ user: 1 })`
  - `reportSchema.index({ state: 1, area: 1 })`

### B. Ephemeral Disk File Serving
- **Problem**: Serving uploaded files directly via `express.static` forces the Node.js single-threaded event loop to handle file streaming.
- **Impact**: Under concurrent load, the Express thread pool will saturate, blocking critical API request processing.
- **Optimization**: Offload static assets to CDNs or cloud storage buckets.
