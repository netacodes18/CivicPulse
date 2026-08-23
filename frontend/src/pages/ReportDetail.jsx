import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import {
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  Calendar,
  MapPin,
  Layers,
  Clock,
  CheckCircle,
  Send,
  User,
  Navigation,
  Loader2,
  FileText,
  Share2
} from "lucide-react";

const ReportDetail = () => {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  
  // Assignment state
  const [assignedDepartment, setAssignedDepartment] = useState("");
  const [assigning, setAssigning] = useState(false);

  const fetchReport = async () => {
    try {
      const res = await api.get(`/api/user/report/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reportData = res.data.report;
      setReport(reportData);
      setComments(res.data.comments || []);
      setAssignedDepartment(reportData.assignedDepartment || "");
    } catch (err) {
      console.error("Error fetching report", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) fetchReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  const handleUpvote = async () => {
    if (upvoting) return;
    setUpvoting(true);
    
    // Optimistic Update
    setReport(prev => {
      const hasVoted = prev.upvotes?.some((u) => (typeof u === "object" ? u._id : u) === user?.id);
      let newUpvotes = [...(prev.upvotes || [])];
      if (hasVoted) {
        newUpvotes = newUpvotes.filter(u => (typeof u === "object" ? u._id : u) !== user?.id);
      } else {
        newUpvotes.push(user?.id);
      }
      return { ...prev, upvotes: newUpvotes };
    });

    try {
      await api.post(`/api/user/report/${id}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      // Removed fetchReport() to prevent slow UI reloading.
    } catch (err) {
      console.error("Upvote error", err);
      await fetchReport(); // Revert on error
    } finally {
      setUpvoting(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      await api.post(`/api/user/report/${id}/comment`, { text: commentText.trim() }, { headers: { Authorization: `Bearer ${token}` } });
      setCommentText("");
      await fetchReport();
    } catch (err) {
      console.error("Comment error", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAssign = async () => {
    setAssigning(true);
    try {
      await api.patch(`/api/admin/reports/${id}/assign`, { assignedDepartment }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchReport();
      alert("Assignment updated successfully");
    } catch (err) {
      console.error("Assign error", err);
      alert("Failed to update assignment");
    } finally {
      setAssigning(false);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "resolved": return "text-status-resolved bg-status-resolved/10 border-status-resolved/20";
      case "in-progress": return "text-status-inprogress bg-status-inprogress/10 border-status-inprogress/20";
      default: return "text-status-pending bg-status-pending/10 border-status-pending/20";
    }
  };

  const hasUpvoted = report?.upvotes?.some((u) => (typeof u === "object" ? u._id : u) === user?.id);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 size={32} className="animate-spin mb-4 text-brand" />
        <p>Loading report details...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileText size={32} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Report Not Found</h2>
        <p className="text-gray-500 mb-6">The report you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate(-1)} className="bg-brand text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-dark transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pb-12 max-w-4xl mx-auto space-y-6">
      {/* Back Navigation */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-brand text-sm font-medium transition-colors mb-2">
        <ArrowLeft size={16} />
        <span>Back to reports</span>
      </button>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Report Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
            {report.imageUrl && (
              <div className="w-full h-64 sm:h-80 relative bg-gray-100 border-b border-surface-border">
                <img src={report.imageUrl} alt={report.title} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusClasses(report.status)}`}>
                  {report.status}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar size={14} />
                  <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{report.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-surface-border">
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <User size={16} className="text-brand" />
                  <span className="font-medium">{report.user?.username || "Anonymous"}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <Layers size={16} className="text-brand" />
                  <span className="capitalize font-medium">{report.category || "General"}</span>
                </div>
                {report.area && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="capitalize">{report.area}</span>
                  </div>
                )}
                {report.state && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    <span className="capitalize">{report.state}</span>
                  </div>
                )}
              </div>

              <div className="prose prose-sm sm:prose-base text-gray-700 max-w-none">
                <p className="whitespace-pre-line leading-relaxed">{report.description}</p>
              </div>

              {report.coordinates?.lat && report.coordinates?.lng && (
                <div className="mt-8 p-4 bg-brand/5 rounded-lg border border-brand/10 flex items-start gap-3">
                  <Navigation size={20} className="text-brand mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Precise Location Logged</h4>
                    <p className="text-xs text-gray-600">Coordinates: {report.coordinates.lat.toFixed(6)}, {report.coordinates.lng.toFixed(6)}</p>
                  </div>
                </div>
              )}

              {/* Assignment Panel (Admins/Moderators Only) */}
              {["admin", "super_admin", "moderator"].includes(user?.role) && (
                <div className="mt-8 p-6 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <User size={18} className="text-blue-600" />
                    Internal Assignment (Admin)
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Routed Department</label>
                      <select 
                        value={assignedDepartment} 
                        onChange={(e) => setAssignedDepartment(e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-lg px-3 py-2 border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                      >
                        <option value="">Unassigned</option>
                        <option value="roads">Roads & Footpaths</option>
                        <option value="water">Water Supply & Leakage</option>
                        <option value="sanitation">Garbage & Sanitation</option>
                        <option value="electricity">Street Lights & Electricity</option>
                        <option value="other">Other Issues</option>
                      </select>
                    </div>
                    <button 
                      onClick={handleAssign}
                      disabled={assigning}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {assigning ? <Loader2 size={16} className="animate-spin" /> : "Save Routing"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="px-6 py-4 bg-gray-50/80 border-t border-surface-border flex items-center justify-between">
              <button
                onClick={handleUpvote}
                disabled={upvoting}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border shadow-sm ${
                  hasUpvoted ? "bg-brand/10 text-brand border-brand/20" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <ThumbsUp size={16} className={hasUpvoted ? "fill-brand" : ""} />
                <span>{hasUpvoted ? "Supported" : "Support"}</span>
                <span className={`ml-1 px-2 py-0.5 rounded-md text-xs ${hasUpvoted ? "bg-brand/10" : "bg-gray-100"}`}>{report.upvotes?.length || 0}</span>
              </button>
              
              <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                <Share2 size={16} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Discussion */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-surface-border shadow-sm flex flex-col h-full max-h-[800px]">
            <div className="p-5 border-b border-surface-border flex items-center gap-2">
              <MessageCircle size={18} className="text-brand" />
              <h3 className="text-base font-semibold text-gray-900">Discussion ({comments.length})</h3>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {comments.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageCircle size={20} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">No comments yet</p>
                  <p className="text-xs text-gray-500">Be the first to share your thoughts.</p>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold uppercase">
                      {c.user?.username?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">{c.user?.username || "Unknown"}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg rounded-tl-none border border-gray-100">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="p-5 border-t border-surface-border bg-gray-50/50">
              <form onSubmit={handleComment}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors bg-white resize-none mb-3"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                    className="bg-brand hover:bg-brand-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                  >
                    {submittingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    <span>Post Comment</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
