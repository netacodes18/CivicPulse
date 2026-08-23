import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  ThumbsUp,
  MapPin,
  TrendingUp,
  ArrowRight,
  Plus,
  Megaphone
} from "lucide-react";
import { useTranslation } from "react-i18next";
import MapHeatmap from "../components/MapHeatmap";

const Home = () => {
  const { user, token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, resolved: 0, inProgress: 0, upvotes: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t: _t } = useTranslation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const [reportsRes, statsRes, catRes] = await Promise.all([
          api.get("/api/user/community", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/api/user/dashboard-stats", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/api/user/dashboard-categories", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        setReports(Array.isArray(reportsRes.data.reports) ? reportsRes.data.reports : []);
        setStats(statsRes.data);
        setCategories(catRes.data.categories || []);
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const getStatusClasses = (status) => {
    switch (status) {
      case "resolved": return "text-status-resolved bg-status-resolved/10";
      case "in-progress": return "text-status-inprogress bg-status-inprogress/10";
      default: return "text-status-pending bg-status-pending/10";
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Reports", value: loading ? "..." : stats.total, icon: FileText, color: "text-brand", bg: "bg-brand/10", sub: `+${stats.thisWeek} this week` },
          { label: "In Progress", value: loading ? "..." : stats.inProgress, icon: Clock, color: "text-status-pending", bg: "bg-status-pending/10", sub: `${stats.total > 0 ? ((stats.inProgress / stats.total) * 100).toFixed(1) : 0}% of total` },
          { label: "Resolved", value: loading ? "..." : stats.resolved, icon: CheckCircle, color: "text-status-resolved", bg: "bg-status-resolved/10", sub: `${stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(1) : 0}% resolved` },
          { label: "Upvotes", value: loading ? "..." : (stats.upvotes > 999 ? (stats.upvotes/1000).toFixed(1) + 'K' : stats.upvotes), icon: ThumbsUp, color: "text-purple-600", bg: "bg-purple-100", sub: "Total community support" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-surface-border shadow-sm flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              <p className="text-[10px] text-gray-400 mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          {/* Heatmap Container */}
          <div className="bg-white rounded-xl border border-surface-border shadow-sm p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Issue Heatmap</h3>
            <div className="w-full h-[300px] bg-gray-100 rounded-lg relative overflow-hidden flex items-center justify-center">
              <MapHeatmap reports={reports} />
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-xl border border-surface-border shadow-sm p-0 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-surface-border">
              <h3 className="text-base font-semibold text-gray-900">Recent Reports</h3>
              <Link to="/community" className="text-sm text-brand font-medium hover:underline">View All</Link>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-400 animate-pulse">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No recent reports found in your area.</div>
            ) : (
              <div className="divide-y divide-surface-border">
                {reports.slice(0, 4).map((report) => (
                  <div key={report._id} className="p-5 flex items-center gap-4 hover:bg-surface-muted transition-colors cursor-pointer" onClick={() => navigate(`/report/${report._id}`)}>
                    {report.imageUrl ? (
                      <img src={report.imageUrl} alt={report.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="text-gray-400" size={24} />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{report.title}</h4>
                        <span className={`w-1.5 h-1.5 rounded-full ${report.priority === 'High' ? 'bg-status-high' : 'bg-status-resolved'}`}></span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-1">
                        {report.area || "General Area"} • Reported {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${getStatusClasses(report.status)}`}>
                        {report.status}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <ThumbsUp size={12} />
                        <span>{report.upvotes?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-surface-border shadow-sm p-6 text-center flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Report an Issue</h3>
            <p className="text-sm text-gray-500 mb-6">Help your community by reporting issues around you.</p>
            <Link to="/report" className="w-full flex items-center justify-center gap-2 bg-brand text-white py-3 rounded-lg font-medium hover:bg-brand-dark transition-colors">
              <Plus size={18} />
              <span>Report Now</span>
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-surface-border shadow-sm p-0">
            <div className="flex items-center justify-between p-5 border-b border-surface-border">
              <h3 className="text-base font-semibold text-gray-900">Categories</h3>
              <Link to="/community" className="text-sm text-brand font-medium hover:underline">View All</Link>
            </div>
            <div className="p-5 space-y-4">
              {loading ? (
                <div className="text-sm text-gray-400 animate-pulse">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="text-sm text-gray-400">No categories found.</div>
              ) : (
                categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-brand"></div>
                      <span className="text-sm text-gray-700 capitalize">{cat._id}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500">{cat.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-brand-accent/50 rounded-xl border border-brand/10 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Megaphone size={16} className="text-blue-600" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">Clean City Drive</h4>
            </div>
            <p className="text-xs text-gray-600 mb-2">Join the cleanliness drive this Sunday! Meet at Central Park.</p>
            <span className="text-[10px] text-gray-400">2d ago</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
