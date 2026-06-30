# System Architecture — CivicPulse

This document describes the architectural layout, data flows, routing guard designs, and database models of the CivicPulse application.

---

## 1. High-Level Design (Full Stack Architecture)

CivicPulse is designed as a decoupled client-server application:

```mermaid
graph TD
    Client[React Client SPA] <-->|JSON / Axios API Proxy| Server[Express Backend Server]
    Server <-->|Mongoose ODM| DB[(MongoDB Atlas Database)]
    Server -->|Local filesystem| Files[(Disk uploads/ folder)]
```

- **Vite React Client**: Renders the user interface. It communicates with the backend via relative `/api` paths handled by the Vite dev server proxy in development, and direct HTTP calls in production.
- **Express Backend**: Exposes a stateless REST API.
- **MongoDB**: Acts as the document store, modeling users and reports with referencing relationships.

---

## 2. Database Schema & Relationships

The database is built on two primary MongoDB collections:

```mermaid
erDiagram
    User {
        ObjectId _id PK
        String username
        String email
        String password
        String role
        String state
        String area
    }
    Report {
        ObjectId _id PK
        String title
        String description
        String category
        String imageUrl
        String status
        ObjectId user FK
        String state
        String area
        Date createdAt
        Date updatedAt
    }
    User ||--o{ Report : "submits"
```

### Collection Indexes (Performance Optimizations)
To ensure optimal lookup times on growing datasets, indexes are registered on search fields:
- `Report` collection is indexed on:
  - `user`: For quick retrieval of citizen reports history.
  - `{ state: 1, area: 1 }`: For fast administrative area filtering scans.

---

## 3. Authentication & Route Protection Flow

Authentication utilizes stateless JSON Web Tokens (JWT) signed via HMAC-SHA256:

```mermaid
sequenceDiagram
    autonumber
    actor User as Citizen / Admin
    participant Client as React SPA (AuthContext)
    participant Server as Express Server (authMiddleware)
    
    User->>Client: Enter login details
    Client->>Server: POST /api/auth/login
    Note over Server: Match password hash (bcryptjs)<br/>Normalize user role check
    Server-->>Client: Return User JSON + JWT
    Note over Client: Save token to localStorage.<br/>Set active user profile state.
    
    User->>Client: Navigate to Admin Dashboard
    Client->>Server: GET /api/admin/reports (Authorization: Bearer <token>)
    Server->>Server: Validate token signature & expiration
    Server->>Server: Verify role satisfies "admin"
    Server-->>Client: Returns JSON list of reports
```

### Route Protection Architecture
- **Backend Protection**: Endpoints are protected by a chain of middlewares:
  - `authMiddleware`: Extracts the Bearer token, verifies its signature, and appends the decoded payload (`id`, `role`, `state`, `area`) to `req.user`.
  - `requireRole(role)`: Inspects `req.user.role` to ensure it matches the target role constraint before invoking the controller.
- **Frontend Protection**: Handled dynamically via `AuthContext`. If the user is unauthenticated or has a citizen role, they are redirected away from admin views.

---

## 4. API Flow Mapping

- **Auth Router**: Manages login/signup requests.
- **User Router**: Handles citizen issue creation, updating, and deletions. When a citizen uploads an image, the request goes through **Multer** middleware, which saves the file locally in `uploads/` and generates a static URL mapped to `req.body.imageUrl`.
- **Admin Router**: Aggregates statistics counts, retrieves state reports matching the admin's state, and handles deletions and status updates.
