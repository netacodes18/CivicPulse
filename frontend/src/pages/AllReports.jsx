import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FileText,
  Calendar,
  MapPin,
  Layers,
  Search,
  Filter,
  Clock,
  CheckCircle,
  ThumbsUp,
  MessageCircle,
  Loader2,
  FolderOpen
} from "lucide-react";

const AllReports = () => {
  const { user, token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReports, setSelectedReports] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("resolved");
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);
  const location = useLocation();
  const [statusFilter, setStatusFilter] = useState(location.state?.statusFilter || "all");
  const navigate = useNavigate();

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
    if (token && ["admin", "super_admin", "moderator"].includes(user?.role)) {
      fetchReports();
    }
  }, [token, user]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedReports(filteredReports.map(r => r._id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (id) => {
    if (selectedReports.includes(id)) {
      setSelectedReports(selectedReports.filter(rId => rId !== id));
    } else {
      setSelectedReports([...selectedReports, id]);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedReports.length === 0) return;
    setIsUpdatingBulk(true);
    try {
      await api.patch("/api/admin/reports/bulk", {
        reportIds: selectedReports,
        action: "status",
        value: bulkStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedReports([]);
      fetchReports();
    } catch (err) {
      console.error("Bulk update failed", err);
      alert("Failed to perform bulk update. Please try again.");
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "resolved": return "text-status-resolved bg-status-resolved/10 border-status-resolved/20";
      case "in-progress": return "text-status-inprogress bg-status-inprogress/10 border-status-inprogress/20";
      default: return "text-status-pending bg-status-pending/10 border-status-pending/20";
    }
  };

  const filteredReports = reports.filter(r => {
    const searchMatch = r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.area?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === "all" || r.status === statusFilter;
    return searchMatch && statusMatch;
  });

  return (
    <div className="pb-12 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">All Reports (Admin)</h1>
          <p className="text-sm text-gray-500">Master audit control panel for spatial restoration progress.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-surface-border shadow-sm p-4 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title, description or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors cursor-pointer bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedReports.length > 0 && (
        <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="bg-brand text-white text-xs font-bold px-2 py-1 rounded-md">
              {selectedReports.length} Selected
            </span>
            <span className="text-sm font-medium text-gray-700">Ready for bulk update</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="border border-brand/30 rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-brand/40 focus:border-brand outline-none transition-colors cursor-pointer bg-white text-gray-700 font-medium flex-1"
            >
              <option value="pending">Mark as Pending</option>
              <option value="in-progress">Mark as In Progress</option>
              <option value="resolved">Mark as Resolved</option>
            </select>
            <button
              onClick={handleBulkUpdate}
              disabled={isUpdatingBulk}
              className="bg-brand hover:bg-brand-dark text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isUpdatingBulk ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Apply"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 size={32} className="animate-spin mb-4 text-brand" />
            <p>Loading all reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-20 px-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FolderOpen size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">There are no reports registered in the database yet.</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No reports match your current search and filters.
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {/* Select All Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
              />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select All</span>
            </div>

            {filteredReports.map((r) => (
              <div key={r._id} className="p-5 hover:bg-surface-muted transition-colors flex gap-5">
                {/* Checkbox */}
                <div className="pt-1">
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(r._id)}
                    onChange={() => handleSelectReport(r._id)}
                    className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand cursor-pointer"
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-5 flex-1">
                  {/* Image */}
                  {r.imageUrl ? (
                    <img src={r.imageUrl} alt="" className="w-full md:w-40 h-32 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
                  ) : (
                    <div className="w-full md:w-40 h-32 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 border border-gray-200">
                      <FileText size={32} className="text-gray-400" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h3 className="text-base font-bold text-gray-900 truncate hover:text-brand cursor-pointer transition-colors" onClick={() => navigate(`/report/${r._id}`)}>
                          {r.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border whitespace-nowrap ${getStatusClasses(r.status)}`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                        {r.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md text-gray-700 font-medium border border-gray-200">
                          <Layers size={14} className="text-brand" />
                          <span className="capitalize">{r.category || "General"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        {r.area && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="capitalize">{r.area}</span>
                          </div>
                        )}
                      </div>

                      {r.assignedDepartment && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md border border-blue-100">
                          <Layers size={14} />
                          <span className="capitalize">Routed to: {r.assignedDepartment}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <ThumbsUp size={14} className="text-gray-400" />
                          <span className="font-medium">{r.upvotes?.length || 0} supports</span>
                        </div>
                        <button onClick={() => navigate(`/report/${r._id}`)} className="flex items-center gap-1.5 hover:text-brand transition-colors">
                          <MessageCircle size={14} />
                          <span className="font-medium">Details</span>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => navigate("/admin/update-status", { state: { reportId: r._id, version: r.__v } })}
                        className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {reports.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-gray-500">Showing {filteredReports.length} reports</p>
        </div>
      )}
    </div>
  );
};

export default AllReports;
