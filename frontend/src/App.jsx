import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import Home from "./pages/Home";
import Landing from "./pages/Landing";
import Layout from "./components/Layout";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Report from "./pages/Report";
import MyReports from "./pages/MyReports";
import AllReports from "./pages/AllReports";
import CategoriesAdmin from "./pages/CategoriesAdmin";
import UserProfile from "./pages/UserProfile";
import UpdateReportStatus from "./pages/UpdateReportStatus";
import AdminDashboard from "./pages/AdminDashboard";
import ReportDetail from "./pages/ReportDetail";
import CommunityFeed from "./pages/CommunityFeed";
import Notifications from "./pages/Notifications";
import Announcements from "./pages/Announcements";
import Analytics from "./pages/Analytics";
import UserManagement from "./pages/UserManagement";
import AnnouncementsAdmin from "./pages/AnnouncementsAdmin";
import AuditLogs from "./pages/AuditLogs";

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <Router>
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
    </Router>
  );
};

export default App;
