# CivicPulse
An urban anomaly reporting and civic engagement platform.

## Overview
CivicPulse empowers citizens to report, discuss, and support resolutions for urban anomalies (like broken streetlights, potholes, and sanitation issues). It bridges the gap between citizens and municipal caretakers, providing an administrative dashboard for triage and a community feed for spatial awareness.

## Key Features
- **Citizen Reporting**: Document local decay with photos, geolocation, and categorized tags.
- **Community Feed**: Discover and browse reports made by other citizens within your state.
- **Social Support**: Upvote and comment on issues that matter to your neighborhood.
- **Administrative Triage**: Dedicated admin dashboard to track metrics and update report statuses (Pending, In Progress, Resolved).
- **Responsive Architecture**: Mobile-first, premium minimalist interface powered by Tailwind CSS.

## Tech Stack
- **Frontend**: React (v19), Vite, Tailwind CSS, Lucide React, Axios.
- **Backend**: Node.js, Express, MongoDB, Mongoose.
- **Authentication**: JWT-based stateless authentication with Role-Based Access Control (RBAC).
- **Security**: Express Rate Limiting, Multer File Size Limits, CORS, Bcrypt Password Hashing.

## Getting Started

### Prerequisites
- Node.js (v20+)
- MongoDB (Local or Atlas)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
3. Create a `.env` file in the `backend` directory (see `.env.example`).
4. Create an `.env` file in the `frontend` directory with `VITE_API_URL=http://localhost:10000`.
5. Start development servers:
   ```bash
   # Terminal 1
   cd backend && npm run dev
   # Terminal 2
   cd frontend && npm run dev
   ```

## Documentation
- [Architecture Guide](ARCHITECTURE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Database Schema](DATABASE_SCHEMA.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Feature Details](FEATURE_DOCUMENTATION.md)
