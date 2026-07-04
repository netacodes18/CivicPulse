# Environment Setup Guide — CivicPulse

This document specifies the required environment configurations for running both the frontend and backend of the CivicPulse application locally and in production.

---

## 1. Backend Environment Configurations

Create a `.env` file inside the `backend/` directory.

### Configuration Template (`backend/.env`)
```env
MONGO_URI=mongodb+srv://<db_username>:<db_password>@cluster0.s97etd4.mongodb.net/CivicPulse?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
PORT=10000
NODE_ENV=development
```

### Variables Specification

| Variable Name | Description | Default (Local) | Security Level |
| :--- | :--- | :--- | :--- |
| `MONGO_URI` | Connection URI for the MongoDB Database | Local or remote string | **CRITICAL**. Access keys must never be exposed or checked into git. |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens | `yourVerySecretKey123` | **CRITICAL**. Set to a random 256-bit string in production. |
| `PORT` | The port the Express application server listens on | `10000` | Low |
| `NODE_ENV` | Mode under which the server runs (`development` or `production`) | `development` | Low |

---

## 2. Frontend Environment Configurations

Create a `.env` file inside the `frontend/` directory.

### Configuration Template (`frontend/.env`)
```env
VITE_API_URL=
```

### Variables Specification

| Variable Name | Description | Default (Local) | Security Level |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Base URL path for all Axios client queries | `""` (empty string) | Low. Set to production server URL (e.g. `https://api.domain.com`) in production build. |

---

## 3. Security Recommendations

- **Do Not Track Environment Files**: Double-check that `.env` files are added to `.gitignore` inside both `/backend` and `/frontend` directories.
- **Rotate Exposed Secrets**:
  - The default credentials checked into git history must be revoked and rotated.
  - The JWT secret key should be periodically rotated.
