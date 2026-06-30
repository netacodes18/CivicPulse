import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle,
  AlertCircle,
  MapPin,
  Tag,
  Layers,
  ArrowRight,
  FolderOpen,
  Trash2,
  Calendar,
  ThumbsUp,
  MessageCircle
} from "lucide-react";

const MyReports = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/user/my-reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReports(Array.isArray(res.data.reports) ? res.data.reports : []);
    } catch (err) {
      console.error("Error fetching reports", err);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token]);

  const triggerDelete = (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/user/report/${deleteTarget}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ message: "Log deleted successfully", type: "success" });
      setTimeout(() => setToast(null), 3000);
      setDeleteTarget(null);
      fetchReports();
    } catch (err) {
      setToast({ message: "Failed to delete log", type: "error" });
      setTimeout(() => setToast(null), 3000);
      setDeleteTarget(null);
    }
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case "resolved":
        return {
          icon: <CheckCircle className="w-4 h-4 text-forest" />,
          classes: "bg-forest/10 text-forest border-forest/20",
          symbol: "✓",
        };
      case "in-progress":
        return {
          icon: <Wrench className="w-4 h-4 text-[#6E7B5E]" />,
          classes: "bg-sage/20 text-[#404D2E] border-[#AEC4B6]",
          symbol: "⏳",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-charcoal/60" />,
          classes: "bg-sand/30 text-charcoal/80 border-charcoal/10",
          symbol: "📋",
        };
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#FDFBF7] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-forest/5 border border-forest/15 text-forest mb-4">
            <span className="text-xs font-bold tracking-widest uppercase">logs.</span>
          </div>
          <h1 className="text-3xl font-light text-charcoal tracking-tight mb-2">
            my reported <span className="font-semibold italic text-forest">anomalies</span>
          </h1>
          <p className="text-charcoal/60 text-xs tracking-wide">
            stewardship tracking panel for logged urban concerns
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white border border-charcoal/10 p-1 rounded-none shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-forest"></div>

          {loading ? (
            <div className="space-y-0 divide-y divide-charcoal/10 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                    <div className="flex-1 space-y-4 w-full">
                      <div className="w-1/4 h-3 bg-charcoal/10"></div>
                      <div className="w-3/4 h-6 bg-charcoal/10"></div>
                      <div className="w-full h-4 bg-charcoal/5"></div>
                      <div className="w-5/6 h-4 bg-charcoal/5"></div>
                      <div className="w-1/3 h-8 bg-charcoal/10 mt-4"></div>
                    </div>
                    <div className="flex-shrink-0 w-full sm:w-28 h-28 bg-charcoal/10"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="py-20 px-8 text-center flex flex-col items-center max-w-md mx-auto">
              <div className="w-12 h-12 bg-sand/20 border border-sand/40 text-forest flex items-center justify-center mb-4">
                <FolderOpen size={20} />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-charcoal mb-2">
                No active logs registered
              </h3>
              <p className="text-xs text-charcoal/60 leading-relaxed mb-8">
                You have not registered any public spatial anomalies yet. Let's document the first concerns.
              </p>
              <a
                href="/report"
                className="bg-forest hover:bg-charcoal text-sand hover:text-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 inline-flex items-center gap-2 group"
              >
                <span>Log Anomaly</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          ) : (
            <div className="divide-y divide-charcoal/10">
              {reports.map((r) => {
                const statusMeta = getStatusDetails(r.status);
                return (
                  <div
                    key={r._id}
                    className="p-6 hover:bg-[#FDFBF7]/40 transition-colors duration-200"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        
                        {/* Upper Section */}
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[9px] font-mono text-charcoal/40 bg-charcoal/5 px-2 py-0.5 border border-charcoal/5">
                              ID: {r._id}
                            </span>
                            <div className="w-1 h-1 bg-charcoal/20 rounded-full"></div>
                            <div className="flex items-center gap-1.5 text-charcoal/50 text-[10px]">
                              <Calendar size={12} />
                              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <h3
                            onClick={() => navigate(`/report/${r._id}`)}
                            className="text-lg font-medium text-charcoal tracking-tight mb-2 uppercase cursor-pointer hover:text-forest transition-colors"
                          >
                            {r.title}
                          </h3>
                          <p className="text-charcoal/70 text-xs font-light leading-relaxed max-w-2xl">
                            {r.description}
                          </p>
                        </div>

                        {/* Middle metadata badges */}
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-charcoal/60 pt-1">
                          <div className="flex items-center gap-1 bg-charcoal/5 px-2 py-1 border border-charcoal/5">
                            <Tag size={10} className="text-forest" />
                            <span className="font-bold uppercase tracking-wider">
                              {r.category || "uncategorized"}
                            </span>
                          </div>
                          {r.state && (
                            <div className="flex items-center gap-1">
                              <MapPin size={10} className="text-forest" />
                              <span className="capitalize">{r.state}</span>
                            </div>
                          )}
                          {r.area && (
                            <div className="flex items-center gap-1">
                              <Layers size={10} className="text-forest" />
                              <span className="capitalize">{r.area}</span>
                            </div>
                          )}
                        </div>

                        {/* Upvote & comment counts */}
                        <div className="flex items-center gap-4 text-[10px] text-charcoal/50 pt-1">
                          <div className="flex items-center gap-1">
                            <ThumbsUp size={12} />
                            <span className="font-bold">{r.upvotes?.length || 0} supports</span>
                          </div>
                          <button
                            onClick={() => navigate(`/report/${r._id}`)}
                            className="flex items-center gap-1 hover:text-forest transition-colors"
                          >
                            <MessageCircle size={12} />
                            <span className="font-bold">View details →</span>
                          </button>
                        </div>

                        {/* Lower status and delete action */}
                        <div className="flex items-center gap-4 pt-1">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${statusMeta.classes}`}>
                            {statusMeta.icon}
                            <span>{r.status}</span>
                          </div>

                          <button
                            onClick={() => triggerDelete(r._id)}
                            className="text-red-700 hover:text-red-950 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 py-1"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Attached photo evidence */}
                      {r.imageUrl && (
                        <div className="flex-shrink-0 w-full sm:w-28 h-28 border border-charcoal/10 overflow-hidden relative group">
                          <img
                            src={r.imageUrl}
                            alt="Log evidence screenshot"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic bottom counters */}
        {reports.length > 0 && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-charcoal/10 p-6 text-center relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-charcoal/10"></div>
              <span className="text-2xl font-light text-charcoal tracking-tight block mb-1">
                {reports.length}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-charcoal/50 font-bold">Total Logs Filed</span>
            </div>
            <div className="bg-white border border-charcoal/10 p-6 text-center relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-forest"></div>
              <span className="text-2xl font-light text-forest tracking-tight block mb-1">
                {reports.filter((r) => r.status === "resolved").length}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-forest font-bold">Resolved Cases</span>
            </div>
            <div className="bg-white border border-charcoal/10 p-6 text-center relative">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-sage"></div>
              <span className="text-2xl font-light text-[#5E6D62] tracking-tight block mb-1">
                {reports.filter((r) => r.status === "in-progress").length}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#5E6D62] font-bold">In Progress</span>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white border border-charcoal/10 max-w-sm w-full p-8 shadow-2xl relative animate-fade-in">
              <div className="absolute top-0 left-0 w-full h-1 bg-forest"></div>
              
              <h3 className="text-sm font-semibold uppercase tracking-widest text-charcoal mb-3 text-center">
                Confirm Deletion
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed text-center mb-8">
                Are you sure you want to permanently delete this spatial anomaly log? This action cannot be undone.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 border border-charcoal/20 hover:border-charcoal text-charcoal py-3 text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-700 hover:bg-red-900 text-white py-3 text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  Delete Log
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
            <div className={`p-4 border shadow-xl flex items-center gap-3 ${
              toast.type === "success" 
                ? "bg-forest border-forest text-sand" 
                : "bg-red-900 border-red-950 text-white"
            }`}>
              <span className="text-xs uppercase tracking-widest font-bold">
                {toast.message}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MyReports;
