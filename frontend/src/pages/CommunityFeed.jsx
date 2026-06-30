import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Layers,
  Tag,
  FolderOpen,
  Filter,
  Clock,
  Wrench,
  CheckCircle,
  ThumbsUp,
  MessageCircle,
  Users,
  User,
  Navigation,
} from "lucide-react";

const CommunityFeed = () => {
  const { user, token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [filterArea, setFilterArea] = useState("");
  const [loading, setLoading] = useState(true);
  const [upvotingId, setUpvotingId] = useState(null);
  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/user/community", {
        headers: { Authorization: `Bearer ${token}` },
        params: filterArea ? { area: filterArea } : {},
      });
      setReports(Array.isArray(res.data.reports) ? res.data.reports : []);
    } catch (err) {
      console.error("Community feed fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReports();
  }, [filterArea, token]);

  const handleUpvote = async (reportId) => {
    if (upvotingId) return;
    setUpvotingId(reportId);
    try {
      await api.post(
        `/api/user/report/${reportId}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchReports();
    } catch (err) {
      console.error("Upvote error", err);
    } finally {
      setUpvotingId(null);
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

  const hasUpvoted = (report) =>
    report.upvotes?.some(
      (u) => (typeof u === "object" ? u._id : u) === user?.id
    );

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#FDFBF7] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Block */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-forest/5 border border-forest/15 text-forest mb-4">
            <Users size={18} />
          </div>
          <h1 className="text-3xl font-light text-charcoal tracking-tight mb-2">
            community{" "}
            <span className="font-semibold italic text-forest">feed</span>
          </h1>
          <p className="text-charcoal/60 text-xs tracking-wide">
            browse civic concerns reported by residents across{" "}
            <span className="font-bold capitalize">{user?.state || "your state"}</span>.
            support issues that matter to you.
          </p>
        </div>

        {/* Filter Input */}
        <div className="bg-white border border-charcoal/10 p-6 mb-8 shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-forest"></div>
          <div className="flex items-center space-x-3">
            <Filter size={16} className="text-sage" />
            <div className="flex-1 flex flex-col">
              <label
                htmlFor="area-filter"
                className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1"
              >
                Filter by Area
              </label>
              <input
                id="area-filter"
                type="text"
                placeholder="Type area name to narrow down..."
                className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors placeholder-charcoal/30"
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value.toLowerCase())}
              />
            </div>
          </div>
        </div>

        {/* Reports Panel */}
        <div className="bg-white border border-charcoal/10 p-1 shadow-sm relative">
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
                No community reports
              </h3>
              <p className="text-xs text-charcoal/60 leading-relaxed">
                {filterArea
                  ? "No reports match that area. Try adjusting your filter."
                  : "No civic concerns have been reported in your state yet. Be the first!"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal/10">
              {reports.map((r) => {
                const statusMeta = getStatusDetails(r.status);
                const voted = hasUpvoted(r);
                return (
                  <div
                    key={r._id}
                    className="p-6 hover:bg-[#FDFBF7]/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        {/* Upper Details */}
                        <div>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-[10px] text-charcoal/50">
                              <User size={12} />
                              <span className="font-bold">
                                {r.user?.username || "Anonymous"}
                              </span>
                            </div>
                            <div className="w-1 h-1 bg-charcoal/20 rounded-full"></div>
                            <div className="flex items-center gap-1 text-charcoal/50 text-[10px]">
                              <Calendar size={12} />
                              <span>
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <h3
                            onClick={() => navigate(`/report/${r._id}`)}
                            className="text-base font-bold text-charcoal tracking-wide mb-2 uppercase cursor-pointer hover:text-forest transition-colors"
                          >
                            {r.title}
                          </h3>
                          <p className="text-charcoal/70 text-xs font-light leading-relaxed max-w-2xl">
                            {r.description?.length > 200
                              ? r.description.substring(0, 200) + "..."
                              : r.description}
                          </p>
                        </div>

                        {/* Metadata Badges */}
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-charcoal/60">
                          <div className="flex items-center gap-1 bg-charcoal/5 px-2 py-1 border border-charcoal/5">
                            <Tag size={10} className="text-forest" />
                            <span className="font-bold uppercase tracking-wider">
                              {r.category || "uncategorized"}
                            </span>
                          </div>
                          {r.area && (
                            <div className="flex items-center gap-1">
                              <Layers size={10} className="text-forest" />
                              <span className="capitalize">{r.area}</span>
                            </div>
                          )}
                          {r.coordinates?.lat && r.coordinates?.lng && (
                            <div className="flex items-center gap-1 text-forest">
                              <Navigation size={10} />
                              <span>
                                {r.coordinates.lat.toFixed(6)}, {r.coordinates.lng.toFixed(6)}
                              </span>
                            </div>
                          )}
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 font-bold uppercase tracking-wider border ${statusMeta.classes}`}
                          >
                            {statusMeta.icon}
                            <span>{r.status}</span>
                          </div>
                        </div>

                        {/* Upvote & View Row */}
                        <div className="flex items-center gap-4 pt-1">
                          <button
                            onClick={() => handleUpvote(r._id)}
                            disabled={upvotingId === r._id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all border ${
                              voted
                                ? "bg-forest text-sand border-forest"
                                : "bg-white text-charcoal/60 border-charcoal/15 hover:border-forest hover:text-forest"
                            }`}
                          >
                            <ThumbsUp size={12} />
                            <span>
                              {voted ? "Supported" : "Support"}
                            </span>
                            <span className="opacity-70">
                              {r.upvotes?.length || 0}
                            </span>
                          </button>

                          <button
                            onClick={() => navigate(`/report/${r._id}`)}
                            className="flex items-center gap-1.5 text-[10px] text-charcoal/50 hover:text-forest font-bold uppercase tracking-widest transition-colors"
                          >
                            <MessageCircle size={12} />
                            <span>Discuss</span>
                          </button>
                        </div>
                      </div>

                      {/* Attached evidence image */}
                      {r.imageUrl && (
                        <div className="flex-shrink-0 w-full sm:w-28 h-28 border border-charcoal/10 overflow-hidden relative group">
                          <img
                            src={r.imageUrl}
                            alt={`Evidence for: ${r.title}`}
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

        {/* Results Info Count */}
        {reports.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-xs font-light text-charcoal/60 tracking-wider">
              Showing {reports.length} report
              {reports.length !== 1 ? "s" : ""} in{" "}
              <span className="capitalize font-bold">{user?.state}</span>
              {filterArea && ` filtered by "${filterArea}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;
