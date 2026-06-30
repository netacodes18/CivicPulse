# API Documentation

All API endpoints are prefixed with `/api`.
Authentication is via JWT sent in the `Authorization` header as `Bearer <token>`.

## Authentication Routes (`/api/auth`)

| Endpoint | Method | Body | Description | Access |
|---|---|---|---|---|
| `/signup` | POST | `username`, `email`, `password`, `role`, `state`, `area` | Register a new user | Public |
| `/login` | POST | `email`, `password` | Authenticate user & receive JWT | Public |

## Citizen Routes (`/api/user`)

| Endpoint | Method | Params/Query | Description | Access |
|---|---|---|---|---|
| `/profile` | GET | - | Fetch logged-in user profile | Citizen/Admin |
| `/report` | POST | Form Data: `title`, `description`, `category`, `image` (file), `lat`, `lng` | Create a new report | Citizen/Admin |
| `/my-reports` | GET | - | Fetch reports created by the user | Citizen/Admin |
| `/community` | GET | `?area=xxx` | Fetch all reports in the user's state | Citizen/Admin |
| `/report/:id` | GET | - | Fetch a single report and its comments | Citizen/Admin |
| `/report/:id` | PUT | JSON: `title`, `description` | Update user's own report | Citizen/Admin |
| `/report/:id` | DELETE | - | Delete user's own report | Citizen/Admin |
| `/report/:id/upvote`| POST | - | Toggle upvote on a report | Citizen/Admin |
| `/report/:id/comment`| POST | JSON: `text` | Add a comment to a report | Citizen/Admin |
| `/report/:id/comments`| GET | - | Get comments for a report | Citizen/Admin |

## Admin Routes (`/api/admin`)

| Endpoint | Method | Description | Access |
|---|---|---|---|
| `/reports` | GET | Get all reports within the admin's state | Admin |
| `/dashboard-stats` | GET | Get aggregation stats & recent reports | Admin |
| `/report/:id/status` | PUT | Update status (`pending`, `in-progress`, `resolved`) | Admin |
| `/report/:id` | DELETE | Delete any report | Admin |

## Error Handling
Standard JSON response for errors:
```json
{
  "message": "Human readable error description",
  "error": "Detailed technical reason (optional)"
}
```
Standard HTTP status codes are used (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error).
