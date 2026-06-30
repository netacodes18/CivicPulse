# API Documentation — CivicPulse

All endpoints are prefixed with `/api`. Authenticated endpoints require a `Bearer <token>` in the `Authorization` header.

---

## 1. Authentication Endpoints

### Register User / Admin
- **Route**: `POST /api/auth/signup`
- **Access**: Public
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "citizen1",
    "email": "citizen1@test.com",
    "password": "Password123",
    "role": "user",
    "state": "maharashtra",
    "area": "mumbai central"
  }
  ```
  *(Note: `role` must be either `"user"` or `"admin"`. `state` is required and will be saved lowercased. `area` is optional.)*
- **Response** (`201 Created`):
  ```json
  {
    "user": {
      "id": "607f1f77bcf86cd799439011",
      "username": "citizen1",
      "email": "citizen1@test.com",
      "role": "user",
      "state": "maharashtra",
      "area": "mumbai central"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Login
- **Route**: `POST /api/auth/login`
- **Access**: Public
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "citizen1",
    "password": "Password123",
    "role": "user"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "user": {
      "id": "607f1f77bcf86cd799439011",
      "username": "citizen1",
      "email": "citizen1@test.com",
      "role": "user",
      "state": "maharashtra",
      "area": "mumbai central"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### Protected Connection Test
- **Route**: `GET /api/auth/protected`
- **Access**: Authenticated (User or Admin)
- **Response** (`200 OK`):
  ```json
  {
    "message": "Hello citizen1, you're authenticated."
  }
  ```

---

## 2. Citizen / User Endpoints

### Get Profile
- **Route**: `GET /api/user/profile`
- **Access**: Authenticated
- **Response** (`200 OK`):
  ```json
  {
    "message": "Welcome citizen1, you are authenticated as a user.",
    "user": {
      "id": "607f1f77bcf86cd799439011",
      "username": "citizen1",
      "role": "user",
      "state": "maharashtra",
      "area": "mumbai central"
    }
  }
  ```

### Submit Civic Issue Report
- **Route**: `POST /api/user/report`
- **Access**: Authenticated
- **Headers**: `Content-Type: multipart/form-data`
- **Form Parameters**:
  - `title` (String, Required)
  - `description` (String, Optional)
  - `category` (String, Optional)
  - `image` (File, Optional - .jpg, .jpeg, .png)
- **Response** (`201 Created`):
  ```json
  {
    "message": "Report submitted",
    "report": {
      "_id": "65b93d386d34b415a77f2402",
      "title": "Broken Streetlight",
      "description": "Streetlight near house 45 is broken",
      "category": "streetlights",
      "imageUrl": "http://localhost:10000/uploads/1706606000000.png",
      "user": "607f1f77bcf86cd799439011",
      "state": "maharashtra",
      "area": "mumbai central",
      "status": "pending",
      "createdAt": "2026-06-30T15:00:00.000Z",
      "updatedAt": "2026-06-30T15:00:00.000Z"
    }
  }
  ```

### Get My Reports
- **Route**: `GET /api/user/my-reports`
- **Access**: Authenticated (Citizen owner)
- **Response** (`200 OK`):
  ```json
  {
    "reports": [
      {
        "_id": "65b93d386d34b415a77f2402",
        "title": "Broken Streetlight",
        "description": "Streetlight near house 45 is broken",
        "category": "streetlights",
        "imageUrl": "http://localhost:10000/uploads/1706606000000.png",
        "user": "607f1f77bcf86cd799439011",
        "state": "maharashtra",
        "area": "mumbai central",
        "status": "pending",
        "createdAt": "2026-06-30T15:00:00.000Z"
      }
    ]
  }
  ```

### Update User Report
- **Route**: `PUT /api/user/report/:id`
- **Access**: Authenticated (Owner only)
- **Request Body**:
  ```json
  {
    "title": "Updated title",
    "description": "Updated description details"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "message": "Report updated",
    "report": { ... }
  }
  ```

### Delete User Report
- **Route**: `DELETE /api/user/report/:id`
- **Access**: Authenticated (Owner only)
- **Response** (`200 OK`):
  ```json
  {
    "message": "Report deleted successfully"
  }
  ```

---

## 3. Administrative Endpoints

### Get State Reports
- **Route**: `GET /api/admin/reports`
- **Access**: Admin Role
- **Query Parameters**:
  - `area` (String, Optional - filter issues in admin's state by area name)
- **Response** (`200 OK`):
  ```json
  {
    "reports": [
      {
        "_id": "65b93d386d34b415a77f2402",
        "title": "Broken Streetlight",
        "status": "pending",
        "user": {
          "_id": "607f1f77bcf86cd799439011",
          "username": "citizen1",
          "email": "citizen1@test.com"
        },
        "state": "maharashtra",
        "area": "mumbai central"
      }
    ]
  }
  ```

### Get Dashboard Statistics
- **Route**: `GET /api/admin/dashboard-stats`
- **Access**: Admin Role
- **Response** (`200 OK`):
  ```json
  {
    "total": 10,
    "pending": 5,
    "inProgress": 3,
    "resolved": 2
  }
  ```

### Update Report Status
- **Route**: `PUT /api/admin/report/:id/status`
- **Access**: Admin Role
- **Request Body**:
  ```json
  {
    "status": "in-progress"
  }
  ```
  *(Note: status values must be: `"pending"`, `"in-progress"`, or `"resolved"`)*
- **Response** (`200 OK`):
  ```json
  {
    "message": "Report status updated",
    "report": {
      "_id": "65b93d386d34b415a77f2402",
      "status": "in-progress"
    }
  }
  ```

### Delete Any Report
- **Route**: `DELETE /api/admin/report/:id`
- **Access**: Admin Role
- **Response** (`200 OK`):
  ```json
  {
    "message": "Report deleted by admin"
  }
  ```
