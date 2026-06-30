# CivicPulse — Crowdsourced Municipal Issue Tracker

CivicPulse is a full-stack, crowdsourced municipal grievance reporting and tracking web application. It empowers citizens to report local civic issues (e.g. broken streetlights, potholes, waste management failures) with photographic evidence and categories. Municipal administrators can monitor complaints within their state, search by local area, and manage the resolution process through a dedicated status dashboard.

---

## 🚀 Key Features

- **Role-Based Authentication**:
  - **Citizens**: Register with state/area context, submit issues with descriptions and photo attachments, track their submitted issues, and view profiles.
  - **Admins**: Monitor state-wide complaints, filter by local neighborhood, delete invalid entries, and update resolution status (Pending, In Progress, Resolved).
- **Interactive Dashboards**:
  - Citizens get a chronological history of their reports with real-time status badges and category indicators.
  - Admins get a metrics dashboard tracking status breakdowns (total, pending, active, and resolved counts).
- **Responsive Layout**:
  - Seamless desktop experience alongside a fully functional mobile slide-out navigation system.
- **Robust Verification**:
  - Inbuilt unit testing verified via the native Node.js test runner.

---

## 🧱 Technology Stack

### Frontend
- **Framework & Routing**: React 19.1.0, React Router Dom 6.30.1
- **Styling**: Tailwind CSS 3.4.17 (responsive grid systems and utility classes)
- **API Client**: Axios 1.11.0 (with JWT bearer request interceptors)
- **Icons & Parsers**: Lucide React 0.516.0, jwt-decode 4.0.0

### Backend
- **Framework**: Node.js, Express.js 4.18.2
- **Database**: MongoDB (via Mongoose 8.16.0 ODM)
- **Authentication**: bcryptjs 3.0.2 (hashing), jsonwebtoken 9.0.2 (signing)
- **File Uploads**: Multer 2.0.1 (multipart form parsing)

---

## 🛠️ Directory Architecture & Explanation

```
CivicPulse/
├── backend/                       # Server-side Application
│   ├── controllers/               # Route logic handlers (auth, citizen CRUD, admin stats)
│   ├── middleware/                # Route filters (JWT verify, role guards, Multer uploads)
│   ├── models/                    # Mongoose database schemas (User, Report)
│   ├── routes/                    # API router directories
│   ├── tests/                     # Zero-dependency test suites
│   ├── uploads/                   # Local uploads disk folder
│   ├── .env                       # Backend local configuration credentials
│   ├── package.json               # Backend dependency manifest
│   └── server.js                  # Entry listener startup file
└── frontend/                      # Client-side Application
    ├── public/                    # Static public assets
    ├── src/                       
    │   ├── api/                   # Axios setup and proxy interceptor
    │   ├── components/            # Reusable UI parts (Navbar, etc.)
    │   ├── context/               # Global React context providers (AuthContext)
    │   ├── pages/                 # Routing pages and dashboards
    │   ├── App.jsx                # Router config and layouts
    │   └── main.jsx               # React DOM anchor entry point
    ├── .env                       # Frontend local configuration credentials
    ├── package.json               # Frontend dependency manifest
    ├── tailwind.config.js         # Styling config settings
    └── vite.config.js             # Vite build settings & proxy targets
```

---

## ⚙️ Local Installation & Setup

### Prerequisites
- Node.js v20 or later
- npm v10 or later
- A running MongoDB instance (local or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/netacodes69/CivicPulse.git
cd CivicPulse
```

### 2. Configure Backend Environment
Create a `.env` file in the `backend/` directory:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/CivicPulse?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
PORT=10000
NODE_ENV=development
```

### 3. Configure Frontend Environment
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=/api
```

### 4. Install Dependencies
```bash
# In backend/
cd backend
npm install

# In frontend/
cd ../frontend
npm install
```

---

## 🏃 Running the Application Locally

To run the full stack locally, launch the backend and frontend dev servers in separate terminal windows:

### Run Backend
```bash
cd backend
npm start
```
The server will boot on `http://localhost:10000` and output:
`📦 Connected to MongoDB`
`🚀 Server running on port 10000`

### Run Frontend
```bash
cd frontend
npm run dev
```
The Vite development server will spin up (typically at `http://localhost:5173/` or the next available port). All client requests to `/api` are automatically proxied to the backend on port `10000`.

---

## 🧪 Testing

CivicPulse uses Node.js's built-in native test runner for fast, zero-dependency testing.
To execute tests, navigate to the `/backend` directory and run:
```bash
npm test
```

---

## 🚀 Production Deployment

### Backend (Render / Heroku)
- Set root build directory as `backend`.
- Build Command: `npm install`.
- Start Command: `npm start`.
- Inject environment variables (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`) in the hosting panel.

### Frontend (Vercel / Netlify)
- Set root directory as `frontend`.
- Build Command: `npm run build`.
- Output Directory: `dist`.
- Vercel automatically respects [vercel.json](file:///c:/Users/Utkarsh%20Pratap/civicpulse/CivicPulse/frontend/vercel.json) rewrites to handle SPA routing.
