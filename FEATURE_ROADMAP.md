# FEATURE_ROADMAP.md — CivicPulse

This document outlines the feature expansion roadmap organized by implementation priority.

---

## Priority 1 — Essential Features

### 1.1 Upvote System
- **Why**: Allows citizens to support reported issues, helping admins prioritize the most impactful problems by community demand.
- **Complexity**: Low
- **Effort**: ~2 hours
- **Database Changes**: Add `upvotes: [{ type: ObjectId, ref: "User" }]` array to the Report schema.
- **Backend Changes**: New `POST /api/user/report/:id/upvote` endpoint that toggles the user's ObjectId in the array.
- **Frontend Changes**: Add upvote button with count badge on report cards in MyReports and AllReports pages.
- **API Changes**: New route in `userRoutes.js`.
- **Security**: Only authenticated users can upvote. Users can only upvote once (toggle mechanism).

### 1.2 Comment / Discussion System
- **Why**: Enables citizen-to-admin communication on specific reports, creating transparency and accountability.
- **Complexity**: Medium
- **Effort**: ~3 hours
- **Database Changes**: New `Comment` Mongoose model with fields: `{ report, user, text, createdAt }`.
- **Backend Changes**: New `POST /api/user/report/:id/comment` and `GET /api/user/report/:id/comments` endpoints.
- **Frontend Changes**: New comment section with timeline layout rendered below report details. Text input with submit button.
- **API Changes**: New routes in `userRoutes.js`.
- **Security**: Comments limited to authenticated users. Text trimmed and length-validated server-side.

### 1.3 API Rate Limiting
- **Why**: Prevents brute-force login attempts, signup spam, and API abuse. Production-critical security feature.
- **Complexity**: Low
- **Effort**: ~30 minutes
- **Database Changes**: None.
- **Backend Changes**: Install `express-rate-limit`. Apply stricter limits to auth endpoints (15 requests/15 min) and general limits to all other routes (100 requests/15 min).
- **Frontend Changes**: None.
- **API Changes**: Middleware applied at Express router level.
- **Security**: Directly mitigates brute-force and DoS attack vectors.

### 1.4 Dashboard Stats Fix (Bug M8)
- **Why**: The admin dashboard stats endpoint returns flat keys `{ total, pending, inProgress, resolved }` but the frontend reads `res.data.stats`. Both must align.
- **Complexity**: Low
- **Effort**: ~15 minutes
- **Database Changes**: None.
- **Backend Changes**: Wrap the response in `{ stats: { total, pending, inProgress, resolved }, recentReports: [...] }`.
- **Frontend Changes**: Already reads `res.data.stats` — will now receive correct shape.

---

## Priority 2 — High-Value Features

### 2.1 Geolocation Support
- **Why**: Attaching GPS coordinates to reports enables future map-based visualizations, clustering, and proximity-based discovery.
- **Complexity**: Medium
- **Effort**: ~2 hours
- **Database Changes**: Add `coordinates: { lat: Number, lng: Number }` to Report schema.
- **Backend Changes**: Accept coordinates in `createReport` controller.
- **Frontend Changes**: Add optional lat/lng inputs in the Report Issue form.
- **API Changes**: Extend existing POST `/api/user/report` body.
- **Security**: Coordinates validated as numbers within valid ranges.

### 2.2 Report Detail Page
- **Why**: Currently there is no individual report view. A detail page is needed to display full information, upvotes, and comments.
- **Complexity**: Medium
- **Effort**: ~2 hours
- **Database Changes**: None.
- **Backend Changes**: New `GET /api/user/report/:id` endpoint.
- **Frontend Changes**: New `ReportDetail.jsx` page with route `/report/:id`. Renders full report, upvote button, comment thread.
- **API Changes**: New route.
- **Security**: Authenticated users only.

### 2.3 Multer Upload Size Limits
- **Why**: Without limits, users can upload arbitrarily large files causing disk exhaustion.
- **Complexity**: Low
- **Effort**: ~10 minutes
- **Database Changes**: None.
- **Backend Changes**: Add `limits: { fileSize: 5 * 1024 * 1024 }` to Multer config.
- **Frontend Changes**: None.

### 2.4 Input Validation Middleware
- **Why**: Raw user input passes directly to MongoDB. Server-side validation prevents NoSQL injection and malformed data.
- **Complexity**: Low
- **Effort**: ~1 hour
- **Database Changes**: None.
- **Backend Changes**: Add `express-validator` checks to auth and report endpoints.
- **Frontend Changes**: None.
- **Security**: Directly mitigates injection attacks.

---

## Priority 3 — Nice-to-Have Features

### 3.1 Pagination
- **Why**: Report listings currently return unbounded result sets. Pagination improves performance at scale.
- **Complexity**: Medium
- **Effort**: ~2 hours

### 3.2 Real-time Notifications
- **Why**: Admins and citizens receive alerts when report statuses change.
- **Complexity**: High
- **Effort**: ~6 hours (requires WebSocket or SSE integration)

### 3.3 Interactive Map View
- **Why**: Visualize reports geographically using OpenStreetMap/Leaflet.
- **Complexity**: High
- **Effort**: ~8 hours

### 3.4 AI Complaint Categorization
- **Why**: Auto-categorize reports based on description text.
- **Complexity**: High
- **Effort**: ~6 hours (requires NLP library or API integration)

### 3.5 Leaderboard & Gamification
- **Why**: Incentivize civic participation through points and rankings.
- **Complexity**: Medium
- **Effort**: ~4 hours

### 3.6 Analytics Dashboard
- **Why**: Trend charts, area-wise heatmaps, and resolution time metrics.
- **Complexity**: High
- **Effort**: ~8 hours (requires charting library integration)
