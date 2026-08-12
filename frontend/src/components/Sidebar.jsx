import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { 
  Home, 
  FileText, 
  Search, 
  Trophy, 
  Bell, 
  Megaphone, 
  BarChart2, 
  Plus, 
  LogOut,
  MapPin
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: ["admin", "super_admin", "moderator"].includes(user?.role) ? "Admin Dashboard" : (t("nav_dashboard") || "Dashboard"), path: "/", icon: Home },
    { name: t("nav_my_reports") || "My Reports", path: "/my-reports", icon: FileText, reqRole: "user", reqAuth: true },
    { name: t("nav_community") || "Explore Issues", path: "/community", icon: Search, reqRole: "user", reqAuth: true },
    { name: "Notifications", path: "/notifications", icon: Bell, reqRole: "user", reqAuth: true },
    { name: "Announcements", path: "/announcements", icon: Megaphone, reqRole: "user", reqAuth: true },
    { name: "Analytics", path: "/analytics", icon: BarChart2, reqRole: "user", reqAuth: true },
    { name: t("nav_all_reports") || "All Reports", path: "/all-reports", icon: Search, reqAuth: true, adminOnly: true },
    { name: "Update Status", path: "/admin/update-status", icon: Plus, reqAuth: true, adminOnly: true },
    { name: "Manage Categories", path: "/admin/categories", icon: BarChart2, reqAuth: true, superAdminOnly: true },
    { name: "Manage Users", path: "/admin/users", icon: Search, reqAuth: true, superAdminOnly: true },
    { name: "Broadcast Announcements", path: "/admin/announcements", icon: Megaphone, reqAuth: true, superAdminOnly: true },
    { name: "Audit Logs", path: "/admin/audit-logs", icon: FileText, reqAuth: true, adminOnly: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-brand text-white flex flex-col h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Brand */}
        <div className="p-6">
          <Link to="/landing" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
               <MapPin className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Civic Pulse</h1>
              <p className="text-[10px] text-white/70">Stronger Communities, Together</p>
            </div>
          </Link>
        </div>

        {/* Report Button CTA */}
        {user?.role === "user" && (
          <div className="px-4 mb-6">
            <Link 
              to="/report" 
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-brand-light hover:bg-white hover:text-brand text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              <span>Report an Issue</span>
            </Link>
          </div>
        )}
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
          {navItems.map((item, idx) => {
            if (item.reqAuth && !user) return null;
            if (item.reqRole && user?.role !== item.reqRole) return null;
            if (item.adminOnly && !["admin", "super_admin", "moderator"].includes(user?.role)) return null;
            if (item.superAdminOnly && !["admin", "super_admin"].includes(user?.role)) return null;
            
            const isActive = item.path !== '#' && (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)));
            return (
              <Link 
                key={idx} 
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={isActive ? "nav-link-active" : "nav-link"}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
                {item.name === "Notifications" && (
                  <span className="ml-auto bg-brand-light text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">3</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section at bottom */}
        {user ? (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-white font-bold text-sm">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white leading-none mb-1 truncate max-w-[100px]">
                    {user.username || "User"}
                  </span>
                  <span className="text-[10px] text-white/70 leading-none">
                    {user.role === 'admin' ? 'Administrator' : 'Citizen'}
                  </span>
                </div>
              </div>
              <button onClick={handleLogout} className="text-white/50 hover:text-red-400 p-1" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-white/10 flex flex-col gap-2">
            <Link to="/login" onClick={() => setIsOpen(false)} className="text-center text-sm font-medium text-white/80 hover:text-white py-2">
              Log In
            </Link>
            <Link to="/signup" onClick={() => setIsOpen(false)} className="text-center text-sm font-medium bg-white text-brand rounded-lg py-2 hover:bg-surface-muted transition-colors">
              Sign Up
            </Link>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
