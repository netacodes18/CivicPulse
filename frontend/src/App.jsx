import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Layout from "./components/Layout";
import { Suspense, lazy } from "react";

const Home = lazy(() => import("./pages/Home"));

const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Report = lazy(() => import("./pages/Report"));
const MyReports = lazy(() => import("./pages/MyReports"));
const AllReports = lazy(() => import("./pages/AllReports"));
const CategoriesAdmin = lazy(() => import("./pages/CategoriesAdmin"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const UpdateReportStatus = lazy(() => import("./pages/UpdateReportStatus"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ReportDetail = lazy(() => import("./pages/ReportDetail"));
const CommunityFeed = lazy(() => import("./pages/CommunityFeed"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Announcements = lazy(() => import("./pages/Announcements"));
const Analytics = lazy(() => import("./pages/Analytics"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const AnnouncementsAdmin = lazy(() => import("./pages/AnnouncementsAdmin"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          {/* Full unauthenticated landing page */}
          {!user && <Route path="/" element={<Landing />} />}
          
          {/* Explicit landing page route (accessible anytime) */}
          <Route path="/landing" element={<Landing />} />

          <Route path="/*" element={
            <Layout>
              <Routes>
                {/* If authenticated, / points to the Dashboard (Home) */}
                {user && <Route path="/" element={<Home />} />}
                
                <Route path="/report" element={<Report />} />
                <Route path="/report/:id" element={<ReportDetail />} />
                <Route path="/my-reports" element={<MyReports />} />
                <Route path="/community" element={<CommunityFeed />} />
                <Route path="/all-reports" element={<AllReports />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/admin/update-status" element={<UpdateReportStatus />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin/categories" element={<CategoriesAdmin />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/announcements" element={<AnnouncementsAdmin />} />
                <Route path="/admin/audit-logs" element={<AuditLogs />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
