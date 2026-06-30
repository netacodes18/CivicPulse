import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  LogOut,
  User,
  Home,
  FilePlus,
  LayoutDashboard,
  ClipboardEdit,
  ListOrdered,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-100 shadow-lg border-b border-slate-300 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg shadow-sm">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <Link
              to="/"
              className="text-xl font-bold text-slate-800 hover:text-blue-600 transition-colors duration-200"
            >
              CivicPulse
            </Link>
            <p className="text-xs text-slate-500 hidden sm:block">
              Municipal Services
            </p>
          </div>
        </div>

        {/* Empty middle section for clean layout */}
        <div className="flex-1"></div>

        {/* Auth Section */}
        <div className="flex items-center space-x-2">
          {/* Navigation Links - moved to right side */}
          {user && (
            <div className="hidden md:flex items-center space-x-1 mr-4">
              {/* User-specific Links */}
              {user?.role === "user" && (
                <>
                  <Link
                    to="/report"
                    className="px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <FilePlus size={18} />
                    <span>Report Issue</span>
                  </Link>

                  <Link
                    to="/my-reports"
                    className="px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <LayoutDashboard size={18} />
                    <span>My Reports</span>
                  </Link>

                  <Link
                    to="/profile"
                    className="px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                </>
              )}

              {/* Admin-specific Links */}
              {user?.role === "admin" && (
                <>
                  <Link
                    to="/admin-dashboard"
                    className="px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/all-reports"
                    className="px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <ListOrdered size={18} />
                    <span>All Reports</span>
                  </Link>

                  <Link
                    to="/admin/update-status"
                    className="px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 font-medium"
                  >
                    <ClipboardEdit size={18} />
                    <span>Update Status</span>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* User Info Badge (when logged in) */}
          {user && (
            <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-3 py-1.5 mr-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-slate-700 capitalize">
                {user.role === "admin" ? "Admin" : "Citizen"}
              </span>
            </div>
          )}

          {/* Auth Links */}
          {!user ? (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
          >
            {isOpen ? (
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-200 space-y-2">
          {user ? (
            <>
              {/* User roles links */}
              {user.role === "user" && (
                <>
                  <Link
                    to="/report"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                  >
                    Report Issue
                  </Link>
                  <Link
                    to="/my-reports"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                  >
                    My Reports
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                  >
                    Profile
                  </Link>
                </>
              )}
              {user.role === "admin" && (
                <>
                  <Link
                    to="/admin-dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/all-reports"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                  >
                    All Reports
                  </Link>
                  <Link
                    to="/admin/update-status"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                  >
                    Update Status
                  </Link>
                </>
              )}
              <div className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2 border-t border-slate-200">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center px-4 py-2 text-slate-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="block text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
