import React, { useState, useContext, useEffect } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Clock, Wrench, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const UpdateReportStatus = () => {
  const { token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/admin/reports", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(Array.isArray(res.data.reports) ? res.data.reports : []);
    } catch (err) {
      console.error("Admin report fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleStatusChange = async (reportId, newStatus, version) => {
    setUpdatingId(reportId);
    try {
      await api.patch(`/api/admin/reports/${reportId}/status`, { status: newStatus, version }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistically update the UI
      setReports(reports.map(r => 
        r._id === reportId ? { ...r, status: newStatus, __v: r.__v + 1 } : r
      ));
    } catch {
      alert("Failed to update status. Someone else might have modified it.");
      fetchReports(); // Refresh on error
    } finally {
      setUpdatingId(null);
    }
  };

  // Group reports
  const pending = reports.filter(r => r.status === "pending");
  const inProgress = reports.filter(r => r.status === "in-progress");
  const resolved = reports.filter(r => r.status === "resolved");



  const [filter, setFilter] = useState("all");

  const filteredReports = reports.filter(r => filter === "all" || r.status === filter);

  return (
    <div className="pb-12 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Update Report Status</h1>
          <p className="text-sm text-gray-500">Filter and update civic report statuses across your jurisdiction.</p>
        </div>
        <button onClick={fetchReports} className="flex items-center gap-2 text-sm text-brand font-semibold hover:bg-brand/10 px-4 py-2 rounded-lg transition-colors">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex overflow-x-auto custom-scrollbar">
        {[
          { id: "all", label: "All Reports", count: reports.length },
          { id: "pending", label: "Pending Verification", count: pending.length },
          { id: "in-progress", label: "In Restoration", count: inProgress.length },
          { id: "resolved", label: "Resolved & Verified", count: resolved.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
              filter === tab.id 
                ? "bg-brand text-white shadow-sm" 
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filter === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Report List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading && reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
            <Loader2 size={32} className="animate-spin mb-4 text-brand" />
            <p>Loading reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-gray-400 opacity-80">
            <CheckCircle size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-600 mb-1">No reports found</p>
            <p className="text-sm">Try changing your status filter above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReports.map(report => (
              <div key={report._id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row gap-6 items-start relative">
                
                {updatingId === report._id && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                    <RefreshCw size={24} className="text-brand animate-spin" />
                  </div>
                )}

                {/* Left: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                      {report.category || "General"}
                    </span>
                    <span className="text-xs font-mono text-gray-400">ID: {report._id.substring(report._id.length - 6)}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{report.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{report.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500">
                    <span className="capitalize flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                      {report.area || "General Area"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(report.createdAt))} ago
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Status</label>
                  <select
                    value={report.status}
                    onChange={(e) => handleStatusChange(report._id, e.target.value, report.__v)}
                    className={`w-full text-sm font-semibold border rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand/20 outline-none cursor-pointer transition-colors shadow-sm ${
                      report.status === 'pending' ? 'bg-status-pending/5 border-status-pending/30 text-status-pending focus:border-status-pending' :
                      report.status === 'in-progress' ? 'bg-status-inprogress/5 border-status-inprogress/30 text-status-inprogress focus:border-status-inprogress' :
                      'bg-status-resolved/5 border-status-resolved/30 text-status-resolved focus:border-status-resolved'
                    }`}
                  >
                    <option value="pending" className="text-gray-900 font-medium">Pending Verification</option>
                    <option value="in-progress" className="text-gray-900 font-medium">In Progress (Restoration)</option>
                    <option value="resolved" className="text-gray-900 font-medium">Resolved & Verified</option>
                  </select>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default UpdateReportStatus;
