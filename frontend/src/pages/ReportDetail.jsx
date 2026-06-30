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
  Tag,
  Layers,
  Clock,
  Wrench,
  CheckCircle,
  Send,
  User,
  Navigation,
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

  const fetchReport = async () => {
    try {
      const res = await api.get(`/api/user/report/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(res.data.report);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Error fetching report", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) fetchReport();
  }, [token, id]);

  const handleUpvote = async () => {
    if (upvoting) return;
    setUpvoting(true);
    try {
      const res = await api.post(
        `/api/user/report/${id}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh report data to get updated upvote count
      await fetchReport();
    } catch (err) {
      console.error("Upvote error", err);
    } finally {
      setUpvoting(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      await api.post(
        `/api/user/report/${id}/comment`,
        { text: commentText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText("");
      await fetchReport();
    } catch (err) {
      console.error("Comment error", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case "resolved":
        return {
          icon: <CheckCircle className="w-4 h-4 text-forest" />,
          classes: "bg-forest/10 text-forest border-forest/20",
        };
      case "in-progress":
        return {
          icon: <Wrench className="w-4 h-4 text-[#6E7B5E]" />,
          classes: "bg-sage/20 text-[#404D2E] border-[#AEC4B6]",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-charcoal/60" />,
          classes: "bg-sand/30 text-charcoal/80 border-charcoal/10",
        };
    }
  };

  const hasUpvoted = report?.upvotes?.some(
    (u) => (typeof u === "object" ? u._id : u) === user?.id
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mb-4 mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-charcoal/50 font-bold">
            Loading report data...
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-charcoal mb-2">
            Report Not Found
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="text-forest text-xs uppercase tracking-widest font-bold hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusMeta = getStatusDetails(report.status);

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#FDFBF7] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-charcoal/60 hover:text-forest text-xs uppercase tracking-widest font-bold mb-8 transition-colors group"
        >
          <ArrowLeft
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Back</span>
        </button>

        {/* Report Card */}
        <div className="bg-white border border-charcoal/10 shadow-sm relative mb-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-forest"></div>

          <div className="p-8 space-y-6">
            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-charcoal/50">
              <span className="font-mono bg-charcoal/5 px-2 py-0.5 border border-charcoal/5">
                ID: {report._id}
              </span>
              <div className="w-1 h-1 bg-charcoal/20 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>
                  {new Date(report.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="w-1 h-1 bg-charcoal/20 rounded-full"></div>
              <div className="flex items-center gap-1">
                <User size={12} />
                <span className="font-bold">
                  {report.user?.username || "Anonymous"}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-charcoal uppercase tracking-wide">
              {report.title}
            </h1>

            {/* Description */}
            <p className="text-charcoal/70 text-sm font-light leading-relaxed">
              {report.description}
            </p>

            {/* Attached Image */}
            {report.imageUrl && (
              <div className="border border-charcoal/10 overflow-hidden">
                <img
                  src={report.imageUrl}
                  alt={`Evidence for: ${report.title}`}
                  className="w-full max-h-96 object-cover"
                />
              </div>
            )}

            {/* Badge Row */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-charcoal/60 pt-2">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 font-bold uppercase tracking-wider border ${statusMeta.classes}`}
              >
                {statusMeta.icon}
                <span>{report.status}</span>
              </div>
              <div className="flex items-center gap-1 bg-charcoal/5 px-2 py-1 border border-charcoal/5">
                <Tag size={10} className="text-forest" />
                <span className="font-bold uppercase tracking-wider">
                  {report.category || "uncategorized"}
                </span>
              </div>
              {report.state && (
                <div className="flex items-center gap-1">
                  <MapPin size={10} className="text-forest" />
                  <span className="capitalize">{report.state}</span>
                </div>
              )}
              {report.area && (
                <div className="flex items-center gap-1">
                  <Layers size={10} className="text-forest" />
                  <span className="capitalize">{report.area}</span>
                </div>
              )}
              {report.coordinates?.lat && report.coordinates?.lng && (
                <div className="flex items-center gap-1 text-forest">
                  <Navigation size={10} />
                  <span>
                    {report.coordinates.lat.toFixed(6)}, {report.coordinates.lng.toFixed(6)}
                  </span>
                </div>
              )}
            </div>

            {/* Upvote Bar */}
            <div className="flex items-center gap-6 pt-4 border-t border-charcoal/10">
              <button
                onClick={handleUpvote}
                disabled={upvoting}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all border ${
                  hasUpvoted
                    ? "bg-forest text-sand border-forest"
                    : "bg-white text-charcoal border-charcoal/20 hover:border-forest hover:text-forest"
                }`}
              >
                <ThumbsUp size={14} />
                <span>{hasUpvoted ? "Supported" : "Support"}</span>
                <span className="ml-1 text-[10px] opacity-70">
                  {report.upvotes?.length || 0}
                </span>
              </button>

              <div className="flex items-center gap-1.5 text-charcoal/50 text-xs">
                <MessageCircle size={14} />
                <span className="font-bold">{comments.length}</span>
                <span className="font-light">
                  {comments.length === 1 ? "comment" : "comments"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="bg-white border border-charcoal/10 shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-charcoal/10"></div>

          <div className="p-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal mb-6 flex items-center gap-2">
              <MessageCircle size={16} className="text-forest" />
              Discussion
            </h2>

            {/* Comment Input */}
            <form onSubmit={handleComment} className="mb-8">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-forest/10 border border-forest/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-forest uppercase">
                    {user?.username?.charAt(0) || "?"}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts or additional information about this issue..."
                    rows={3}
                    maxLength={1000}
                    className="w-full border border-charcoal/15 focus:border-forest bg-transparent py-3 px-4 text-charcoal text-sm outline-none transition-colors placeholder-charcoal/30 resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-charcoal/40">
                      {commentText.length}/1000
                    </span>
                    <button
                      type="submit"
                      disabled={!commentText.trim() || submittingComment}
                      className="bg-forest hover:bg-charcoal disabled:opacity-40 disabled:cursor-not-allowed text-sand hover:text-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                      <Send size={12} />
                      <span>{submittingComment ? "Posting..." : "Post"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments Timeline */}
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle
                  size={24}
                  className="text-charcoal/20 mx-auto mb-3"
                />
                <p className="text-xs text-charcoal/50 uppercase tracking-wider font-bold">
                  No comments yet
                </p>
                <p className="text-[10px] text-charcoal/40 mt-1">
                  Be the first to share your thoughts on this issue.
                </p>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-charcoal/8">
                {comments.map((c) => (
                  <div key={c._id} className="py-5 first:pt-0">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-charcoal/5 border border-charcoal/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-charcoal/60 uppercase">
                          {c.user?.username?.charAt(0) || "?"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-charcoal">
                            {c.user?.username || "Unknown"}
                          </span>
                          <span className="text-[10px] text-charcoal/40">
                            {new Date(c.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(c.createdAt).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-charcoal/70 leading-relaxed font-light">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
