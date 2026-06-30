import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  MapPin,
  Layers,
  Tag,
  FolderOpen,
  Filter,
  Clock,
  Wrench,
  CheckCircle
} from "lucide-react";

const AllReports = () => {
  const { user, token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [filterArea, setFilterArea] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      const res = await api.get("/api/admin/reports", {
        headers: { Authorization: `Bearer ${token}` },
        params: filterArea ? { area: filterArea } : {},
      });
      setReports(Array.isArray(res.data.reports) ? res.data.reports : []);
    } catch (err) {
      console.error("Admin report fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === "admin") {
      fetchReports();
    }
  }, [filterArea, token, user]);

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

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#FDFBF7] py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-forest/5 border border-forest/15 text-forest mb-4">
            <span className="text-xs font-bold tracking-widest uppercase">adm.</span>
          </div>
          <h1 className="text-3xl font-light text-charcoal tracking-tight mb-2">
            all logged <span className="font-semibold italic text-forest">anomalies</span>
          </h1>
          <p className="text-charcoal/60 text-xs tracking-wide">
            master audit control panel for spatial restoration progress
          </p>
        </div>

        {/* Filter Input */}
        <div className="bg-white border border-charcoal/10 p-6 mb-8 shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-forest"></div>
          
          <div className="flex items-center space-x-3">
            <Filter size={16} className="text-sage" />
            <div className="flex-1 flex flex-col">
              <label htmlFor="area-filter" className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                Filter by Local Area Name
              </label>
              <input
                id="area-filter"
                type="text"
                placeholder="Type area name (e.g. ward 12, indira nagar) to narrow down..."
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
            <div className="py-20 text-center flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mb-4"></div>
              <p className="text-xs uppercase tracking-widest text-charcoal/50 font-bold">
                Resolving data logs...
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-20 px-8 text-center flex flex-col items-center max-w-md mx-auto">
              <div className="w-12 h-12 bg-sand/20 border border-sand/40 text-forest flex items-center justify-center mb-4">
                <FolderOpen size={20} />
              </div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-charcoal mb-2">
                No reports found
              </h3>
              <p className="text-xs text-charcoal/60 leading-relaxed">
                {filterArea
                  ? "There are no logged concerns matching that specific area name. Try adjusting your query."
                  : "No public concerns have been registered in the database yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal/10">
              {reports.map((r) => {
                const statusMeta = getStatusDetails(r.status);
                return (
                  <div
                    key={r._id}
                    className="p-6 hover:bg-[#FDFBF7]/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        
                        {/* Upper Details */}
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[9px] font-mono text-charcoal/40 bg-charcoal/5 px-2 py-0.5 border border-charcoal/5">
                              ID: {r._id}
                            </span>
                            <div className="w-1.5 h-1.5 bg-forest rounded-full"></div>
                            <div className="flex items-center gap-1.5 text-charcoal/50 text-[10px]">
                              <Calendar size={12} />
                              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <h3 className="text-base font-bold text-charcoal tracking-wide mb-2 uppercase">
                            {r.title}
                          </h3>
                          <p className="text-charcoal/70 text-xs font-light leading-relaxed max-w-2xl">
                            {r.description}
                          </p>
                        </div>

                        {/* Mid Row Badges */}
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-charcoal/60">
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

                        {/* Low Row Badges & Actions */}
                        <div className="flex items-center gap-4 pt-1">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${statusMeta.classes}`}>
                            {statusMeta.icon}
                            <span>{r.status}</span>
                          </div>

                          <button
                            onClick={() => navigate("/admin/update-status", { state: { reportId: r._id } })}
                            className="bg-charcoal text-sand hover:bg-forest hover:text-sand text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 transition-all"
                          >
                            Update Status
                          </button>
                        </div>
                      </div>

                      {/* Attached evidence image */}
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

        {/* Results Info Count */}
        {reports.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-xs font-light text-charcoal/60 tracking-wider">
              Showing {reports.length} anomaly log{reports.length !== 1 ? "s" : ""}
              {filterArea && ` filtered inside "${filterArea}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReports;
