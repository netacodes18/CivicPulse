# CivicPulse - Technical Reference Architecture & Detailed Execution Flows

## Executive Summary & System Overview

**CivicPulse** is an enterprise-grade civic technology platform designed to bridge the operational gap between citizens and municipal administrations in India. The platform enables citizens to log urban anomalies (potholes, streetlighting failures, sanitation issues, water leakage) complete with photographic evidence, precise geolocation coordinates, and categorization tags.

Concurrently, municipal authorities access a localized, role-governed administrative dashboard that provides real-time triage, state/area level filtering, status tracking (*Pending → In Progress → Resolved*), and automated citizen notification dispatching.

---

## Technical Stack

| Layer | Component | Technologies |
| :--- | :--- | :--- |
| **Client Layer** | Frontend SPA | React 19, Vite 6, Tailwind CSS, Axios Interceptors, `i18next` |
| **Gateway & API** | REST Backend | Node.js, Express.js, Bcryptjs, Express Rate Limiter, Multer |
| **Database** | Persistence Store | MongoDB, Mongoose ODM, Compound Indexes |
| **Messaging & Async** | Queue & Worker | RabbitMQ (`amqplib`), Node.js Notification Worker (SMS & Email) |

---

## Global Architectural Topology

```
+-----------------------------------------------------------------------------------+
|                                CLIENT APPLICATION                                 |
|                 React 19 SPA (Citizen Portal & Admin Dashboard)                    |
+-----------------------------------------+-----------------------------------------+
                                          |
                              REST API (HTTPS + JWT Bearer)
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                              EXPRESS API GATEWAY                                  |
|   +-------------------+    +--------------------+    +------------------------+   |
|   |  Rate Limiting    | -> |  JWT Auth Guard    | -> | Controller Handlers    |   |
|   +-------------------+    +--------------------+    +------------------------+   |
+------------------+----------------------------------------------+-----------------+
                   |                                              |
     Read / Write  |                                              | Publish Event
     Mongoose ODM  v                                              v
+------------------+--------------------+        +----------------+-----------------+
|          MONGODB DATABASE             |        |        RABBITMQ BROKER           |
|  - Users Collection (State/Area Scoped)|        |  - Queue: notification_queue   |
|  - Reports Collection (Compound Index)|        +----------------+-----------------+
|  - Comments Collection                |                         |
+---------------------------------------+                         | Consume Message
                                                                  v
                                                 +----------------+-----------------+
                                                 |   BACKGROUND NOTIFICATION WORKER |
                                                 |  - SMS Gateway Dispatcher        |
                                                 |  - Nodemailer SMTP Dispatcher    |
                                                 +----------------------------------+
```

---

## Detailed Architectural Execution Flows

### Flow 1: Citizen Registration & Authentication Sequence
1. **Client Credentials Submission**: User submits username, email, phone, state, area, role, and password via the Signup form (`POST /api/auth/signup`).
2. **Validation & Hashing**: Backend checks for existing email/username collision, then generates a salt and hashes the password using `bcryptjs` (10 salt rounds).
3. **Database Storage & JWT Issuance**: Saves user record to MongoDB. Signs a JWT token containing `id`, `username`, `role`, `state`, and `area`.
4. **Client AuthContext Initialization**: Frontend stores JWT in `localStorage`. Axios interceptor automatically injects `Authorization: Bearer <token>` into all subsequent HTTP headers.

---

### Flow 2: Incident Reporting & Evidence Ingestion Pipeline
1. **Idempotency & Payload Preparation**: Frontend generates a UUID for `x-idempotency-key` and packages title, description, category, latitude, longitude, and image file into `FormData`.
2. **Multer File Processing**: Express middleware validates image MIME type (`.jpg`, `.png`), generates a timestamped unique filename, and saves the file to local disk (`/uploads/`).
3. **Idempotent MongoDB Save**: Creates a new Report document with state/area copied from `req.user`. If a network retry re-sends the same idempotency key, MongoDB's sparse unique index throws code `11000`, returning a duplicate safety response without creating a second record.

---

### Flow 3: Administrative Triage & Dashboard Aggregation
```
ADMIN CLIENT                   ADMIN CONTROLLER                  MONGODB AGGREGATION PIPELINE
     |                                |                                       |
     |--- GET /api/admin/dashboard -->|                                       |
     |                                |--- aggregate([                       |
     |                                |      { $match: { state: adminState } },|
     |                                |      { $group: {                      |
     |                                |          total: { $sum: 1 },          |
     |                                |          pending: { $sum: $cond(...) },|
     |                                |          resolved: { $sum: $cond(...) }|
     |                                |        }                              |
     |                                |      }                                |
     |                                |    ]) ------------------------------->|
     |                                |<-- Returns Aggregated Stats Bucket ---|
     |<-- HTTP 200 { stats, recent } -|                                       |
```

---

### Flow 4: Optimistic Concurrency Control (OCC) for Status Updates
1. **Version-Aware Status Request**: Admin sends new status (e.g., `resolved`) along with current document version `__v` (`PUT /api/admin/report/:id/status { status, version: __v }`).
2. **Atomic Find & Increment**: Backend executes `Report.findOneAndUpdate({ _id, __v: version }, { $set: { status }, $inc: { __v: 1 } })`.
3. **Conflict Resolution (409 Conflict)**: If another admin updated the document first, the version match fails. The controller returns `409 Conflict`, informing the user that the report was recently modified and requires a dashboard refresh.

---

### Flow 5: Asynchronous Notification Pipeline (RabbitMQ Event Fan-Out)
```
ADMIN ACTION               RABBITMQ BROKER               NOTIFICATION WORKER           RECIPIENT
     |                            |                               |                        |
     |-- Update Report Status --->|                               |                        |
     |   (Status Changed)         |                               |                        |
     |                            |                               |                        |
     |-- Publish Event ---------->|                               |                        |
     |   "notification_queue"     |                               |                        |
     |                            |-- Deliver Message (AMQP) ---->|                        |
     |<-- HTTP 200 OK (Instant) --|                               |-- Send SMS / Email --->|
     |                            |                               |    (Async / Non-block) |
```

---

## Database Schema Reference

### 1. User Schema
* `username`: String (Unique, Trim, Required)
* `email`: String (Unique, Required, Indexed)
* `password`: String (Required, Hashed with `bcryptjs`)
* `role`: String (Enum: `['user', 'admin']`)
* `state`: String (Required, Indexed)
* `area`: String (Indexed)

### 2. Report Schema
* `title`: String (Required, Trim)
* `category`: String (Default: `'other'`)
* `status`: String (Enum: `['pending', 'in-progress', 'resolved']`)
* `user`: ObjectId (Ref: `User`, Indexed)
* `state`, `area`: String (Compound Index `{ state: 1, area: 1 }`)
* `coordinates`: `{ lat: Number, lng: Number }`
* `idempotencyKey`: String (Sparse, Unique Index)
* `__v`: Number (Version key for OCC)

---

## Security & Resiliency Infrastructure

1. **Rate Limiting Protection**: `express-rate-limit` caps `/api/auth/*` at 15 requests / 15 minutes and general `/api/*` at 100 requests / 15 minutes.
2. **Compound Indexes**: High-performance querying backed by `{ state: 1, area: 1 }`, `user`, `email`, and `idempotencyKey` indexes.
3. **RabbitMQ Graceful Fallback**: Runs in mock notification mode if message broker is unavailable, ensuring zero downtime.
