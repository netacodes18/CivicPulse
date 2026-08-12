import React, { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ShieldAlert, Search, Filter, RefreshCcw, ChevronLeft, ChevronRight, Activity, ArrowRight, UserX, UserCheck, Trash2, Edit3, Send } from "lucide-react";
import moment from "moment";

const AuditLogs = () => {
  const { token } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [filters, setFilters] = useState({
    action: "",
    targetModel: ""
  });

  useEffect(() => {
    fetchLogs();
  }, [page, filters.action, filters.targetModel, token]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page,
        limit: 15,
        ...(filters.action && { action: filters.action }),
        ...(filters.targetModel && { targetModel: filters.targetModel })
      });

      const res = await api.get(`/api/admin/audit-logs?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLogs(res.data.logs || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "STATUS_UPDATE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100"><Edit3 size={12}/> Status Update</span>;
      case "REPORT_ASSIGN":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100"><Activity size={12}/> Assignment</span>;
      case "REPORT_DELETE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-100"><Trash2 size={12}/> Deletion</span>;
      case "USER_SUSPEND":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-50 text-orange-700 border border-orange-100"><UserX size={12}/> Suspension</span>;
      case "USER_ROLE_CHANGE":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100"><UserCheck size={12}/> Role Change</span>;
      case "BROADCAST":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100"><Send size={12}/> Broadcast</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">{action}</span>;
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Audit Logs</h1>
            <p className="text-gray-500 font-medium mt-1">System tracking of critical admin actions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand appearance-none"
            >
              <option value="">All Actions</option>
              <option value="STATUS_UPDATE">Status Updates</option>
              <option value="REPORT_ASSIGN">Assignments</option>
              <option value="REPORT_DELETE">Deletions</option>
              <option value="USER_SUSPEND">Suspensions</option>
              <option value="USER_ROLE_CHANGE">Role Changes</option>
              <option value="BROADCAST">Broadcasts</option>
            </select>
          </div>
          
          <div className="relative flex-1 md:w-40">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <select
              value={filters.targetModel}
              onChange={(e) => handleFilterChange("targetModel", e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand appearance-none"
            >
              <option value="">All Targets</option>
              <option value="Report">Reports</option>
              <option value="User">Users</option>
              <option value="Announcement">Announcements</option>
            </select>
          </div>

          <button 
            onClick={() => fetchLogs()}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors shrink-0"
            title="Refresh Feed"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[800px]">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Timestamp</div>
              <div className="col-span-2">Actor (Admin)</div>
              <div className="col-span-2">Action Type</div>
              <div className="col-span-4">Details</div>
              <div className="col-span-2">Target</div>
            </div>

            {/* Loading State */}
            {loading && logs.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="px-6 py-16 text-center text-gray-500">
                <ShieldAlert size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="font-semibold">No audit logs found matching your criteria.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {logs.map(log => (
                  <div key={log._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                    
                    {/* Timestamp */}
                    <div className="col-span-2 text-sm text-gray-500 font-medium">
                      {moment(log.createdAt).format("MMM D, HH:mm:ss")}
                    </div>

                    {/* Actor */}
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                        {log.admin?.username ? log.admin.username.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <span className="text-sm font-bold text-gray-900 truncate">
                        {log.admin?.username || "Unknown"}
                      </span>
                    </div>

                    {/* Action Type */}
                    <div className="col-span-2">
                      {getActionBadge(log.action)}
                    </div>

                    {/* Details & Metadata */}
                    <div className="col-span-4">
                      <p className="text-sm font-medium text-gray-900">{log.details}</p>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-gray-500 bg-gray-50 p-1.5 rounded-md w-fit">
                          {log.metadata.from !== undefined && <span className="line-through opacity-70">{String(log.metadata.from)}</span>}
                          {log.metadata.from !== undefined && log.metadata.to !== undefined && <ArrowRight size={10} />}
                          {log.metadata.to !== undefined && <span className="text-gray-900">{String(log.metadata.to)}</span>}
                        </div>
                      )}
                    </div>

                    {/* Target */}
                    <div className="col-span-2 flex flex-col">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{log.targetModel}</span>
                      <span className="text-xs font-mono text-gray-600 truncate bg-gray-50 px-1 py-0.5 rounded mt-0.5" title={log.targetId}>
                        {log.targetId}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs font-medium text-gray-500">
              Showing {(page - 1) * 15 + 1} to {Math.min(page * 15, totalCount)} of {totalCount} logs
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold px-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
