import React, { useState, useContext, useEffect } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Clock, Wrench, AlertCircle, Bookmark } from "lucide-react";

const UpdateReportStatus = () => {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [reportId, setReportId] = useState("");
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.reportId) {
      setReportId(location.state.reportId);
    }
  }, [location.state]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await api.put(
        `/api/admin/report/${reportId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating status");
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#FDFBF7] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-forest/5 border border-forest/15 text-forest mb-4">
            <span className="text-xs font-bold tracking-widest uppercase">upd.</span>
          </div>
          <h1 className="text-3xl font-light text-charcoal tracking-tight mb-2">
            restore <span className="font-semibold italic text-forest">spatial integrity</span>
          </h1>
          <p className="text-charcoal/60 text-xs tracking-wide">
            admin status dispatcher for municipal restoration progressions
          </p>
        </div>

        {/* Main Form Box */}
        <div className="bg-white border border-charcoal/10 p-8 shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-forest"></div>
          
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
                Grievance Dispatch Form
              </h2>
            </div>

            {/* Report ID */}
            <div className="flex flex-col">
              <label htmlFor="reportId" className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                Grievance Log ID *
              </label>
              <input
                id="reportId"
                type="text"
                placeholder="e.g. 64b8a21f82f9d504cf8a7ef9"
                className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors placeholder-charcoal/30 font-mono"
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                required
              />
              <p className="text-[9px] text-charcoal/40 mt-1 uppercase tracking-wider">
                Pre-populated from dashboard actions or copied manually from logs
              </p>
            </div>

            {/* Status Select */}
            <div className="flex flex-col">
              <label htmlFor="status" className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                Assigned Integrity Status *
              </label>
              <select
                id="status"
                className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">🔴 Pending Verification</option>
                <option value="in-progress">⏳ Restoration In Progress</option>
                <option value="resolved">✓ Restored & Verified</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={!reportId.trim()}
              className="w-full bg-forest hover:bg-charcoal text-sand hover:text-white py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Dispatch Status Update</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Success Banner */}
          {message && (
            <div className="mt-6 bg-forest/5 border border-forest/20 text-forest p-4 text-center">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Success</h4>
              <p className="text-xs font-light">{message}</p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-800 p-4 text-center">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-1">Dispatch Failed</h4>
              <p className="text-xs font-light">{error}</p>
            </div>
          )}
        </div>

        {/* Status Guide Cards */}
        <div className="mt-8 bg-white border border-charcoal/10 p-6 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-charcoal/10 pb-3 mb-6">
            <Bookmark size={14} className="text-forest" />
            <h4 className="text-[10px] uppercase tracking-widest text-charcoal font-bold">
              Dispatch Status Glossary
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-charcoal/10 p-4 flex flex-col justify-between h-[120px] bg-sand/10">
              <Clock className="w-5 h-5 text-charcoal/60" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-charcoal">Pending</p>
                <p className="text-[10px] text-charcoal/50 font-light mt-0.5">Anomaly waiting verification</p>
              </div>
            </div>
            
            <div className="border border-charcoal/10 p-4 flex flex-col justify-between h-[120px] bg-sage/10">
              <Wrench className="w-5 h-5 text-sage" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-charcoal">In Progress</p>
                <p className="text-[10px] text-charcoal/50 font-light mt-0.5">Dispatched to field teams</p>
              </div>
            </div>
            
            <div className="border border-charcoal/10 p-4 flex flex-col justify-between h-[120px] bg-forest/5">
              <CheckCircle className="w-5 h-5 text-forest" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-forest">Resolved</p>
                <p className="text-[10px] text-forest/70 font-light mt-0.5">Asset restored successfully</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateReportStatus;
