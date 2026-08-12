import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  TrendingUp,
  Clock,
  Wrench,
  CheckCircle,
  FileText,
  MapPin,
  ArrowRight,
  ClipboardList,
  Layers,
  Calendar,
  Loader2
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/api/admin/dashboard-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data.stats);
        setRecentReports(res.data.recentReports || []);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  const getStatusClasses = (status) => {
    switch (status) {
      case "resolved": return "text-status-resolved bg-status-resolved/10 border-status-resolved/20";
      case "in-progress": return "text-status-inprogress bg-status-inprogress/10 border-status-inprogress/20";
      default: return "text-status-pending bg-status-pending/10 border-status-pending/20";
    }
  };

  return (
    <div className="pb-12 max-w-6xl mx-auto space-y-6">
      
      {/* Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Municipal overview and administrative control panel.</p>
        </div>
        <Link
          to="/all-reports"
          className="bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <span>Review All Logs</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-400">
          <Loader2 size={32} className="animate-spin mb-4 text-brand" />
          <p>Loading dashboard metrics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* SLA Banner */}
          <div className="bg-gradient-to-r from-brand to-brand-dark rounded-xl p-6 flex flex-col md:flex-row items-center justify-between text-white shadow-md">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Clock size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Issue Resolution Time (SLA)</h3>
                <p className="text-brand-light text-sm opacity-90">Average time to restore assets in your jurisdiction.</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black tabular-nums tracking-tight">
                {stats.avgResolutionTimeMs ? (
                  stats.avgResolutionTimeMs < 1000 * 60 * 60 * 24 ? 
                    `${Math.round(stats.avgResolutionTimeMs / (1000 * 60 * 60))} Hours` 
                    : `${Math.round(stats.avgResolutionTimeMs / (1000 * 60 * 60 * 24))} Days`
                ) : (
                  "N/A"
                )}
              </div>
              <p className="text-xs uppercase tracking-wider font-semibold opacity-75">Historical Average</p>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Anomalies",
                val: stats.total,
                desc: "All logged complaints",
                icon: ClipboardList,
                color: "text-brand",
                bg: "bg-brand/10",
              },
              {
                label: "Pending Verification",
                val: stats.pending,
                desc: "Awaiting initial review",
                icon: Clock,
                color: "text-status-pending",
                bg: "bg-status-pending/10",
              },
              {
                label: "In Restoration",
                val: stats.inProgress,
                desc: "Assigned to caretakers",
                icon: Wrench,
                color: "text-status-inprogress",
                bg: "bg-status-inprogress/10",
              },
              {
                label: "Resolved Integrity",
                val: stats.resolved,
                desc: "Asset restoration closed",
                icon: CheckCircle,
                color: "text-status-resolved",
                bg: "bg-status-resolved/10",
              },
            ].map((card, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  let filterValue = "all";
                  if (card.label === "Pending Verification") filterValue = "pending";
                  else if (card.label === "In Restoration") filterValue = "in-progress";
                  else if (card.label === "Resolved Integrity") filterValue = "resolved";
                  
                  navigate("/all-reports", { state: { statusFilter: filterValue } });
                }}
                className="bg-white p-5 rounded-xl border border-surface-border shadow-sm flex items-start gap-4 cursor-pointer hover:border-brand/50 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${card.bg} ${card.color}`}>
                  <card.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{card.val}</h3>
                  <p className="text-[10px] text-gray-400 mt-1">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Submissions */}
          <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-surface-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-brand" />
                <h2 className="text-base font-semibold text-gray-900">Recent Anomaly Submissions</h2>
              </div>
              <Link to="/all-reports" className="text-sm font-medium text-brand hover:underline">View All</Link>
            </div>

            {recentReports.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                No reports recently filed in your jurisdiction.
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {recentReports.map((report) => (
                  <div key={report._id} className="p-5 hover:bg-surface-muted transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    
                    <div className="flex items-center gap-4">
                      {report.imageUrl ? (
                        <img src={report.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <FileText size={20} className="text-gray-400" />
                        </div>
                      )}
                      
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-1">{report.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">ID: {report._id.substring(report._id.length - 6)}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin size={12} className="text-gray-400" />
                            <span className="capitalize">{report.state} {report.area ? `(${report.area})` : ""}</span>
                          </div>
                          <span>•</span>
                          <span className="capitalize font-medium text-gray-600">{report.category || "General"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusClasses(report.status)}`}>
                        {report.status}
                      </span>
                      
                      <button
                        onClick={() => navigate("/admin/update-status", { state: { reportId: report._id, version: report.__v } })}
                        className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
