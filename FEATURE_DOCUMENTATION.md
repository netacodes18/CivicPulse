# Feature Documentation

## 1. Upvote System
- **Purpose**: Allows citizens to surface critical anomalies by signalling community support.
- **Logic**: Users can toggle an upvote on any report. A user's `ObjectId` is pushed/pulled from the `Report.upvotes` array, ensuring a strict 1-vote-per-user limit.
- **Backend Route**: `POST /api/user/report/:id/upvote`

## 2. Community Discussion (Comments)
- **Purpose**: Enables crowdsourced intelligence. Citizens can provide additional context, temporary workarounds, or confirm if an issue has worsened.
- **Logic**: A 1-to-many relationship using a standalone `Comment` collection. Comments have a hard 1000-character limit and require authenticated attribution.
- **Backend Route**: `POST /api/user/report/:id/comment`

## 3. Geolocation Support
- **Purpose**: Pinpoints exact anomaly coordinates for municipal workers, replacing vague textual descriptions.
- **Logic**: The frontend uses the HTML5 `navigator.geolocation` API to capture `lat`/`lng`. These are passed via FormData to the backend and stored in the `Report.coordinates` sub-document.

## 4. Community Feed
- **Purpose**: Fosters local transparency. Citizens default to seeing reports within their registered `state`.
- **Logic**: The backend filters `Report.find({ state: req.user.state })`, mapping issues visually to users. Users can further restrict this via an `area` text filter in the UI.

## 5. Admin Dashboard
- **Purpose**: High-level triage view for city administrators.
- **Logic**: Leverages MongoDB Aggregation pipelines (`$group`, `$sum`, `$cond`) to calculate statistics (Total, Pending, In-Progress, Resolved) in a single optimized query roundtrip.

## 6. Security (Rate Limiting)
- **Purpose**: Defends against brute-force credential stuffing and Denial-of-Service attacks.
- **Logic**: 
  - `authLimiter`: Strict (15 req / 15 min) on `/api/auth` endpoints.
  - `generalLimiter`: Standard (100 req / 15 min) on general API paths.
