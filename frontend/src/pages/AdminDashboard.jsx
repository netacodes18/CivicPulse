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
  ClipboardList
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(res.data.stats);
        setRecentReports(res.data.recentReports || []);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "resolved":
        return "bg-forest/10 text-forest border border-forest/20";
      case "in-progress":
        return "bg-sage/20 text-[#404D2E] border border-[#AEC4B6]";
      default:
        return "bg-sand/30 text-charcoal/80 border border-charcoal/10";
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#FDFBF7] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-charcoal/10 pb-8">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-forest block mb-2">
              municipal overview
            </span>
            <h1 className="text-3xl font-light text-charcoal tracking-tight">
              administrative <span className="font-semibold italic text-forest">dashboard</span>
            </h1>
          </div>
          
          <button
            onClick={() => navigate("/all-reports")}
            className="bg-forest hover:bg-charcoal text-sand hover:text-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 group shadow-sm"
          >
            <span>Review All Logs</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mb-4"></div>
            <p className="text-xs uppercase tracking-widest text-charcoal/50 font-bold">
              Aggregating dashboard logs...
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Grid Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Anomalies",
                  val: stats.total,
                  desc: "All logged complaints",
                  colorLine: "bg-charcoal/20",
                  textColor: "text-charcoal",
                  icon: <ClipboardList className="w-5 h-5 text-charcoal/60" />,
                },
                {
                  label: "Pending Verification",
                  val: stats.pending,
                  desc: "Awaiting initial review",
                  colorLine: "bg-sand",
                  textColor: "text-charcoal",
                  icon: <Clock className="w-5 h-5 text-charcoal/60" />,
                },
                {
                  label: "In Restoration",
                  val: stats.inProgress,
                  desc: "Assigned to caretakers",
                  colorLine: "bg-sage",
                  textColor: "text-[#4A5D50]",
                  icon: <Wrench className="w-5 h-5 text-sage" />,
                },
                {
                  label: "Resolved Integrity",
                  val: stats.resolved,
                  desc: "Asset restoration closed",
                  colorLine: "bg-forest",
                  textColor: "text-forest",
                  icon: <CheckCircle className="w-5 h-5 text-forest" />,
                },
              ].map((card, idx) => (
                <div key={idx} className="bg-white border border-charcoal/10 p-6 rounded-none relative shadow-sm">
                  {/* Geometric top line indicator */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${card.colorLine}`}></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-charcoal/50 font-bold">
                      {card.label}
                    </span>
                    {card.icon}
                  </div>
                  <div>
                    <span className={`text-4xl font-light tracking-tight ${card.textColor} block mb-1`}>
                      {card.val}
                    </span>
                    <span className="text-[10px] text-charcoal/50 font-light block">
                      {card.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Submissions */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 border-b border-charcoal/10 pb-3">
                <TrendingUp size={16} className="text-forest" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
                  Recent Anomaly Submissions
                </h2>
              </div>

              <div className="bg-white border border-charcoal/10 shadow-sm relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-forest"></div>

                {recentReports.length === 0 ? (
                  <div className="p-12 text-center text-charcoal/50 text-xs uppercase tracking-wider">
                    No reports recently filed.
                  </div>
                ) : (
                  <div className="divide-y divide-charcoal/10">
                    {recentReports.map((report) => (
                      <div
                        key={report._id}
                        className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#FDFBF7]/40 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[10px] text-charcoal/50">
                            <span className="font-mono bg-charcoal/5 px-2 py-0.5 border border-charcoal/5">
                              ID: {report._id}
                            </span>
                            <span>•</span>
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <h3 className="text-sm font-bold text-charcoal uppercase tracking-wider">
                            {report.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-xs text-charcoal/60">
                            <MapPin size={12} className="text-forest" />
                            <span className="capitalize">
                              {report.state} {report.area ? `(${report.area})` : ""}
                            </span>
                            <span className="text-charcoal/30">|</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                              {report.category || "General"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                          
                          <button
                            onClick={() => navigate("/admin/update-status", { state: { reportId: report._id } })}
                            className="bg-charcoal/5 hover:bg-forest hover:text-sand text-charcoal border border-charcoal/10 hover:border-forest px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all"
                          >
                            Restore Asset
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
