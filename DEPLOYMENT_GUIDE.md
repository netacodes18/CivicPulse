# Deployment Guide — CivicPulse

This guide describes how to deploy the CivicPulse backend and React frontend to production environments like Render and Vercel.

---

## 1. Backend Deployment (Render)

Render is recommended for hosting the Express Node.js backend.

### Setup Steps
1. Create a new **Web Service** on Render.
2. Link your Git repository containing the CivicPulse code.
3. Configure the service settings:
   - **Name**: `civicpulse-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables** in the Render console:
   - `MONGO_URI`: Your production MongoDB connection string (e.g. Atlas cluster).
   - `JWT_SECRET`: A long, randomly generated secret key.
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render binds this port automatically, but setting it explicitly is recommended).
5. Click **Deploy Web Service**.

---

## 2. Frontend Deployment (Vercel)

Vercel is recommended for deploying the React Vite client application.

### Setup Steps
1. Create a new project in Vercel.
2. Link your Git repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the following **Environment Variable**:
   - `VITE_API_URL`: The full URL of your deployed Render backend API (e.g., `https://civicpulse-backend.onrender.com/api`).
5. Click **Deploy**.

*Note: The [vercel.json](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/vercel.json) file in the frontend root is already configured to redirect all incoming traffic to `index.html` to support React client-side routing.*

---

## 3. Production Environment & Networking Checklists

### CORS Access Control
- In production, ensure the backend [server.js](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/backend/server.js) maps the deployed Vercel domain inside `allowedOrigins`. Otherwise, client API calls will fail due to CORS browser policies.
- Check line 16 of `server.js`:
  ```javascript
  const allowedOrigins = [
    "http://localhost:5173",
    "https://civic-pulse-steel.vercel.app" // <- Replace with your production domain
  ];
  ```

### Static Asset Persistence Warning
- **Multer Local Disk**: The current configurations store file uploads in the local directory `/backend/uploads`. Since Render container filesystems are ephemeral, uploads will be lost whenever the Render web service restarts or updates.
- **Production Solution**: For production, replace the local Multer disk storage config with a cloud-based object storage provider (e.g. AWS S3 or Cloudinary).
