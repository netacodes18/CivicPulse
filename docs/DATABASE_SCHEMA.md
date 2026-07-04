# Database Schema

CivicPulse uses MongoDB via the Mongoose ODM. Below are the schema definitions for the core collections.

## 1. User Schema
Stores authentication details and demographic data for role-based access.

| Field | Type | Attributes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `username` | String | Required, Unique, Trimmed |
| `email` | String | Required, Unique, Trimmed, Lowercase |
| `password` | String | Required (Bcrypt hash) |
| `role` | String | Enum: `["user", "admin"]`, Default: `"user"`, Lowercased on save |
| `state` | String | Required (e.g., "maharashtra") |
| `area` | String | Optional (e.g., "andheri") |
| `timestamps` | Boolean | `createdAt`, `updatedAt` managed by Mongoose |

## 2. Report Schema
Represents a civic anomaly submitted by a user.

| Field | Type | Attributes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `title` | String | Required, Trimmed |
| `description` | String | Trimmed |
| `category` | String | Default: `"other"`, Trimmed |
| `imageUrl` | String | Default: `""` (Path to `/uploads`) |
| `status` | String | Enum: `["pending", "in-progress", "resolved"]`, Default: `"pending"` |
| `user` | ObjectId | Ref: `"User"`, Required, Indexed |
| `state` | String | Required, Indexed (Copied from authoring user) |
| `area` | String | Indexed (Copied from authoring user) |
| `upvotes` | Array of ObjectId | Ref: `"User"` (Unique constraint handled in logic) |
| `coordinates.lat` | Number | Default: `null` |
| `coordinates.lng` | Number | Default: `null` |
| `timestamps` | Boolean | `createdAt`, `updatedAt` |

## 3. Comment Schema
Represents a discussion thread entry on a specific Report.

| Field | Type | Attributes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `report` | ObjectId | Ref: `"Report"`, Required, Indexed |
| `user` | ObjectId | Ref: `"User"`, Required |
| `text` | String | Required, Trimmed, MaxLength: 1000 |
| `timestamps` | Boolean | `createdAt`, `updatedAt` |

## Indexes and Optimization
- **`Report.state` & `Report.area`**: Indexed to accelerate spatial queries for the Community Feed and Admin Dashboard.
- **`Report.user`**: Indexed for fast retrieval of `/api/user/my-reports`.
- **`Comment.report`**: Indexed to load discussion threads efficiently.
- **Aggregation Pipelines**: Used in `getAdminDashboardStats` for single-query multi-metric generation.
