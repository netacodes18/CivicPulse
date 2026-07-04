# Deployment Guide

This guide covers deploying CivicPulse to production environments like Vercel (Frontend) and Render (Backend).

## Backend Deployment (Render / Heroku)

The backend is a Node/Express app that requires an internet-accessible MongoDB instance.

1. **MongoDB Atlas**:
   - Create a cluster on MongoDB Atlas.
   - Whitelist `0.0.0.0/0` (or the specific IP of your host).
   - Get the connection string.
2. **Environment Variables**:
   Set the following variables in your host (e.g., Render Dashboard):
   - `PORT`: Usually automatically set (e.g., `10000`).
   - `MONGO_URI`: Your Atlas connection string.
   - `JWT_SECRET`: A strong randomized 64-character string.
3. **Build Command**:
   - Node natively handles this. Ensure `package.json` has:
     ```json
     "scripts": {
       "start": "node server.js"
     }
     ```
4. **Volume Mounts**:
   - If deploying to Render, the `/uploads` directory is ephemeral by default. For persistent image storage in production, either:
     - Use a Render Persistent Disk mounted to `/uploads`.
     - Or update `upload.js` to use a cloud provider like AWS S3 or Cloudinary instead of local Multer storage.

## Frontend Deployment (Vercel / Netlify)

The frontend is a Vite + React application.

1. **Environment Variables**:
   Set the following in Vercel:
   - `VITE_API_URL`: The production URL of your backend (e.g., `https://civicpulse-api.onrender.com`).
2. **Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Routing Configuration (Vercel specific)**:
   Because React uses client-side routing, Vercel needs to rewrite paths to `index.html`. 
   Create a `vercel.json` file in the frontend root:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
4. **Deploy**: Push to `main` branch to trigger Vercel deployment.
