import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-charcoal/10 px-6 py-4 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-bold tracking-tight text-charcoal hover:opacity-80 transition-opacity">
            civicpulse<span className="text-forest font-extrabold">.</span>
          </Link>
          <div className="hidden lg:block w-px h-4 bg-charcoal/20"></div>
          <span className="text-[10px] uppercase tracking-widest text-charcoal/50 font-semibold hidden lg:inline">
            Urban Development & Care
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          {user ? (
            <>
              {user.role === "user" && (
                <>
                  <Link
                    to="/report"
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal hover:border-b hover:border-charcoal pb-1 transition-all duration-150 font-medium"
                  >
                    Report Issue
                  </Link>
                  <Link
                    to="/my-reports"
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal hover:border-b hover:border-charcoal pb-1 transition-all duration-150 font-medium"
                  >
                    My Reports
                  </Link>
                  <Link
                    to="/profile"
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal hover:border-b hover:border-charcoal pb-1 transition-all duration-150 font-medium"
                  >
                    Profile
                  </Link>
                </>
              )}

              {user.role === "admin" && (
                <>
                  <Link
                    to="/admin-dashboard"
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal hover:border-b hover:border-charcoal pb-1 transition-all duration-150 font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/all-reports"
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal hover:border-b hover:border-charcoal pb-1 transition-all duration-150 font-medium"
                  >
                    All Reports
                  </Link>
                  <Link
                    to="/admin/update-status"
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal hover:border-b hover:border-charcoal pb-1 transition-all duration-150 font-medium"
                  >
                    Update Status
                  </Link>
                </>
              )}

              {/* Status indicator */}
              <div className="flex items-center space-x-2 bg-forest/5 border border-forest/10 px-3 py-1 rounded">
                <div className="w-1.5 h-1.5 bg-forest rounded-full"></div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-forest">
                  {user.role === "admin" ? "Admin" : "Citizen"}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="text-xs uppercase tracking-widest text-red-700/80 hover:text-red-700 transition-colors flex items-center gap-1.5 font-medium"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-6">
              <Link
                to="/login"
                className="text-xs uppercase tracking-widest text-charcoal hover:text-forest transition-colors font-semibold"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-xs uppercase tracking-widest bg-forest text-sand px-4 py-2 hover:bg-charcoal hover:text-white transition-all duration-200 shadow-sm font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger menu */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-charcoal hover:text-forest focus:outline-none transition-colors"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 8h16M4 16h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-charcoal/10 flex flex-col space-y-3">
          {user ? (
            <>
              {user.role === "user" && (
                <>
                  <Link
                    to="/report"
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal py-1.5 font-medium"
                  >
                    Report Issue
                  </Link>
                  <Link
                    to="/my-reports"
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal py-1.5 font-medium"
                  >
                    My Reports
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal py-1.5 font-medium"
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
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal py-1.5 font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/all-reports"
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal py-1.5 font-medium"
                  >
                    All Reports
                  </Link>
                  <Link
                    to="/admin/update-status"
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal py-1.5 font-medium"
                  >
                    Update Status
                  </Link>
                </>
              )}

              <div className="pt-2 border-t border-charcoal/10 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-forest">
                  Role: {user.role === "admin" ? "Admin" : "Citizen"}
                </span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="text-xs uppercase tracking-widest text-red-700/80 hover:text-red-700 flex items-center gap-1.5 font-medium"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-3 pt-2 border-t border-charcoal/10">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="text-xs text-center uppercase tracking-widest text-charcoal hover:text-forest py-2 font-semibold"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="text-xs text-center uppercase tracking-widest bg-forest text-sand py-2 hover:bg-charcoal hover:text-white transition-all duration-200 font-semibold"
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
