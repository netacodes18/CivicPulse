import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LogOut, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('hi') ? 'en' : 'hi');
  };

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
                    {t("nav_report_issue")}
                  </Link>
                  <Link
                    to="/my-reports"
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal hover:border-b hover:border-charcoal pb-1 transition-all duration-150 font-medium"
                  >
                    {t("nav_my_reports")}
                  </Link>
                  <Link
                    to="/community"
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal hover:border-b hover:border-charcoal pb-1 transition-all duration-150 font-medium"
                  >
                    {t("nav_community")}
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
                    {t("nav_dashboard")}
                  </Link>
                  <Link
                    to="/all-reports"
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal hover:border-b hover:border-charcoal pb-1 transition-all duration-150 font-medium"
                  >
                    {t("nav_all_reports")}
                  </Link>
                  <Link
                    to="/admin/update-status"
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal hover:border-b hover:border-charcoal pb-1 transition-all duration-150 font-medium"
                  >
                    Update Status
                  </Link>
                </>
              )}

              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-charcoal/60 hover:text-forest transition-colors"
                title="Toggle Language"
              >
                <Globe size={14} />
                <span>{i18n.language.startsWith('hi') ? 'ENG' : 'हिंदी'}</span>
              </button>

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
                <span>{t("nav_logout")}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-6">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-charcoal/60 hover:text-forest transition-colors"
                title="Toggle Language"
              >
                <Globe size={14} />
                <span>{i18n.language.startsWith('hi') ? 'ENG' : 'हिंदी'}</span>
              </button>

              <Link
                to="/login"
                className="text-xs uppercase tracking-widest text-charcoal hover:text-forest transition-colors font-semibold"
              >
                {t("nav_login")}
              </Link>
              <Link
                to="/signup"
                className="text-xs uppercase tracking-widest bg-forest text-sand px-4 py-2 hover:bg-charcoal hover:text-white transition-all duration-200 shadow-sm font-semibold"
              >
                {t("nav_signup")}
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
                    {t("nav_report_issue")}
                  </Link>
                  <Link
                    to="/my-reports"
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal py-1.5 font-medium"
                  >
                    {t("nav_my_reports")}
                  </Link>
                  <Link
                    to="/community"
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal py-1.5 font-medium"
                  >
                    {t("nav_community")}
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
                    {t("nav_dashboard")}
                  </Link>
                  <Link
                    to="/all-reports"
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-widest text-charcoal/70 hover:text-charcoal py-1.5 font-medium"
                  >
                    {t("nav_all_reports")}
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
                  <span>{t("nav_logout")}</span>
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
                {t("nav_login")}
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="text-xs text-center uppercase tracking-widest bg-forest text-sand py-2 hover:bg-charcoal hover:text-white transition-all duration-200 font-semibold"
              >
                {t("nav_signup")}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
