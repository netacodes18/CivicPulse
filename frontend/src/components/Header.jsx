import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Menu, Globe, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

const Header = ({ setIsSidebarOpen }) => {
  const { user } = useContext(AuthContext);
  const { i18n } = useTranslation();
  const location = useLocation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language.startsWith('hi') ? 'en' : 'hi');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return user?.role === "admin" ? "Admin Dashboard" : "Dashboard";
    if (path.includes("my-reports")) return "My Reports";
    if (path.includes("all-reports")) return "All Reports";
    if (path.includes("community")) return "Community Feed";
    if (path.includes("report")) return "Report Issue";
    if (path.includes("update-status")) return "Update Status";
    if (path.includes("profile")) return "Profile";
    if (path.includes("login")) return "Sign In";
    if (path.includes("signup")) return "Register";
    return "";
  };

  return (
    <header className="bg-white border-b border-surface-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-1 lg:hidden text-gray-500 hover:text-brand transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Mobile Logo */}
        <Link to="/" className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-brand rounded flex items-center justify-center">
             <MapPin className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 hidden sm:block">Civic Pulse</h1>
        </Link>

        {/* Desktop Page Title */}
        <div className="hidden lg:block">
           <h2 className="text-xl font-bold text-gray-900 leading-tight">
             {getPageTitle()}
           </h2>
        </div>
      </div>

      {/* Right side: Tools */}
      <div className="flex items-center gap-4">
        
        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand transition-colors bg-surface-muted px-3 py-1.5 rounded-full border border-gray-200"
          title="Toggle Language"
        >
          <Globe size={14} />
          <span>{i18n.language.startsWith('hi') ? 'EN' : 'HI'}</span>
        </button>

        {/* Avatar - Mobile Only (Desktop is in sidebar) */}
        {user && (
          <div className="lg:hidden w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-white font-bold text-sm">
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>

    </header>
  );
};

export default Header;
