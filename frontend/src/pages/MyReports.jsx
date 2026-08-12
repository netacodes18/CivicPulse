import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  MapPin,
  Trash2,
  Calendar,
  ThumbsUp,
  MessageCircle,
  AlertCircle,
  Plus,
  Loader2,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";

const MyReports = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/user/my-reports", {
        headers: { Authorization: `Bearer ${token}` },
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
    if (token) fetchReports();
  }, [token]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/user/report/${deleteTarget}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToast({ message: "Report deleted successfully", type: "success" });
      setTimeout(() => setToast(null), 3000);
      setDeleteTarget(null);
      fetchReports();
    } catch (err) {
      setToast({ message: "Failed to delete report", type: "error" });
      setTimeout(() => setToast(null), 3000);
      setDeleteTarget(null);
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
    const matchesSearch = r.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pb-12 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Reports</h1>
          <p className="text-sm text-gray-500">Track and manage the civic issues you have reported.</p>
        </div>
        <Link to="/report" className="bg-brand hover:bg-brand-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
          <Plus size={16} />
          <span>Report an Issue</span>
        </Link>
      </div>

      {/* Stats Summary */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-surface-border p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center"><FileText size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-tight">{reports.length}</p>
              <p className="text-xs text-gray-500 font-medium">Total Submitted</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-surface-border p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-status-inprogress/10 text-status-inprogress flex items-center justify-center"><Clock size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-tight">{reports.filter(r => r.status === "in-progress").length}</p>
              <p className="text-xs text-gray-500 font-medium">In Progress</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-surface-border p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-status-resolved/10 text-status-resolved flex items-center justify-center"><CheckCircle size={20} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900 leading-tight">{reports.filter(r => r.status === "resolved").length}</p>
              <p className="text-xs text-gray-500 font-medium">Resolved</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-surface-border shadow-sm p-4 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search reports..."
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

      {/* Content Area */}
      <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 size={32} className="animate-spin mb-4 text-brand" />
            <p>Loading your reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-20 px-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Reports Submitted</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">You haven't reported any issues yet. When you submit a report, it will appear here for you to track.</p>
            <Link to="/report" className="bg-brand text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors inline-flex items-center gap-2">
              <Plus size={16} />
              <span>Submit Your First Report</span>
            </Link>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No reports match your current filters.
          </div>
        ) : (
          <div className="divide-y divide-surface-border overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Issue Details</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Activity</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredReports.map((r) => (
                  <tr key={r._id} className="hover:bg-surface-muted transition-colors group">
                    <td className="px-6 py-4" onClick={() => navigate(`/report/${r._id}`)}>
                      <div className="flex items-center gap-4 cursor-pointer">
                        {r.imageUrl ? (
                          <img src={r.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <FileText size={20} className="text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-brand transition-colors mb-1">{r.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                            {r.area && (
                              <>
                                <span className="mx-1">•</span>
                                <MapPin size={12} />
                                <span className="capitalize">{r.area}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 capitalize border border-gray-200">
                        {r.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusClasses(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1" title="Upvotes">
                          <ThumbsUp size={14} className="text-gray-400" />
                          <span>{r.upvotes?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Comments">
                          <MessageCircle size={14} className="text-gray-400" />
                          <span>0</span> {/* Assuming no comment array in the base model based on previous file context, or could add if it exists */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/report/${r._id}`)}
                          className="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <ArrowRight size={18} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(r._id); }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Report?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            toast.type === "success" ? "bg-gray-900 text-white" : "bg-red-600 text-white"
          }`}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyReports;
