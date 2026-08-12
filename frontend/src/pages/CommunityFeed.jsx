import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
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
  FolderOpen,
  Share2,
  Image as ImageIcon,
  BarChart2,
  CalendarDays,
  AlertTriangle,
  Users,
  Award
} from "lucide-react";

const CommunityFeed = () => {
  const { user, token } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [sidebarData, setSidebarData] = useState({
    stats: { members: 0, discussions: 0, events: 0, groups: 0 },
    popularDiscussions: [],
    upcomingEvents: [],
    topContributors: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [upvotingId, setUpvotingId] = useState(null);
  const [activeTab, setActiveTab] = useState('Feed');
  
  // Quick Post State
  const [postTitle, setPostTitle] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = React.useRef(null);

  const navigate = useNavigate();

  const handleShare = (id) => {
    const url = `${window.location.origin}/report/${id}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  const handleQuickPost = async () => {
    if (!postTitle.trim()) return;
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("title", postTitle);
      formData.append("category", "other"); // Default category for quick posts
      
      if (postImage) {
        formData.append("image", postImage);
      }

      await api.post("/api/user/report", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPostTitle("");
      setPostImage(null);
      await fetchData(); // Refresh the feed!
    } catch (err) {
      console.error("Error creating quick post:", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const fetchData = async () => {
    try {
      const [reportsRes, sidebarRes, groupsRes, eventsRes] = await Promise.all([
        api.get("/api/user/community", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/api/user/community-sidebar", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/api/user/groups", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/api/user/events", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setReports(Array.isArray(reportsRes.data.reports) ? reportsRes.data.reports : []);
      setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      setSidebarData(sidebarRes.data);
    } catch (err) {
      console.error("Community fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleUpvote = async (reportId) => {
    if (upvotingId) return;
    setUpvotingId(reportId);
    try {
      await api.post(`/api/user/report/${reportId}/upvote`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
    } catch (err) {
      console.error("Upvote error", err);
    } finally {
      setUpvotingId(null);
    }
  };

  const hasUpvoted = (report) => report.upvotes?.some((u) => (typeof u === "object" ? u._id : u) === user?.id);

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
    
    // Nearby Logic: Filter by exact user pincode if in 'Nearby' tab
    const nearbyMatch = activeTab === 'Nearby' ? r.pincode === user?.pincode : true;
    
    return searchMatch && statusMatch && nearbyMatch;
  });

  const handleJoinGroup = async (groupId) => {
    try {
      await api.post(`/api/user/groups/${groupId}/join`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
    } catch (err) {
      alert("Failed to join group");
    }
  };

  const handleRsvpEvent = async (eventId) => {
    try {
      await api.post(`/api/user/events/${eventId}/rsvp`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchData();
    } catch (err) {
      alert("Failed to RSVP");
    }
  };

  return (
    <div className="pb-12 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Users size={24} className="text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Community</h1>
            <p className="text-sm text-gray-500">Connect, discuss, and collaborate for a better city.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Main Feed) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Tabs & Create Post Button */}
          <div className="flex items-center justify-between border-b border-gray-200">
            <div className="flex gap-6 overflow-x-auto custom-scrollbar">
              {['Feed', 'Discussions', 'Nearby', 'Groups', 'Events'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-semibold whitespace-nowrap ${activeTab === tab ? 'text-brand border-b-2 border-brand' : 'text-gray-500 hover:text-gray-900 transition-colors'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button onClick={() => navigate('/report')} className="hidden sm:flex items-center gap-2 text-brand font-semibold text-sm px-3 py-1.5 hover:bg-brand/5 rounded-lg transition-colors border border-brand/20 mb-2">
              <FileText size={16} />
              Create Post
            </button>
          </div>

          {/* Create Post Input Box */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center shrink-0">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <input 
                type="text" 
                placeholder="What's happening in your community?" 
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickPost()}
                className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400" 
              />
            </div>
            
            {/* Image Preview */}
            {postImage && (
              <div className="mb-4 relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                <img src={URL.createObjectURL(postImage)} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setPostImage(null)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-gray-100 gap-3">
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPostImage(e.target.files[0]);
                    }
                  }}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <ImageIcon size={16} className={postImage ? "text-brand" : "text-gray-400"} /> Photo / Video
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors opacity-50 cursor-not-allowed">
                  <BarChart2 size={16} className="text-gray-400" /> Poll
                </button>
                <button className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors opacity-50 cursor-not-allowed">
                  <CalendarDays size={16} className="text-gray-400" /> Event
                </button>
                <button onClick={() => navigate('/report')} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                  <AlertTriangle size={16} className="text-gray-400" /> Advanced Issue
                </button>
              </div>
              <button 
                onClick={handleQuickPost}
                disabled={isPosting || !postTitle.trim()}
                className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  !postTitle.trim() ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-brand text-white hover:bg-brand-dark"
                }`}
              >
                {isPosting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>

          {/* Feed Content Area */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
                <Loader2 size={32} className="animate-spin mb-4 text-brand" />
                <p>Loading community feed...</p>
              </div>
            ) : activeTab === 'Discussions' ? (
              <div className="py-20 px-6 flex flex-col items-center text-center bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <FolderOpen size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">The Discussions feature is currently under construction!</p>
              </div>
            ) : activeTab === 'Groups' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {groups.map(g => {
                  const isMember = g.members?.some(m => m._id === user?.id || m === user?.id);
                  return (
                    <div key={g._id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:border-gray-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{g.name}</h3>
                        <span className="text-xs font-bold bg-brand/10 text-brand px-2 py-1 rounded-md">{g.category}</span>
                      </div>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">{g.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                          <Users size={14} /> {g.members?.length || 0} Members
                        </div>
                        <button 
                          onClick={() => handleJoinGroup(g._id)}
                          disabled={isMember}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isMember ? 'bg-gray-100 text-gray-400' : 'bg-brand text-white hover:bg-brand-dark'}`}
                        >
                          {isMember ? 'Joined' : 'Join Group'}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {groups.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500 text-sm bg-white rounded-xl border border-gray-100 shadow-sm">
                    No official groups found in your state.
                  </div>
                )}
              </div>
            ) : activeTab === 'Events' ? (
              <div className="space-y-4">
                {events.map(e => {
                  const hasRsvpd = e.attendees?.some(m => m._id === user?.id || m === user?.id);
                  return (
                    <div key={e._id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:border-gray-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{e.title}</h3>
                        <p className="text-gray-500 text-sm mt-1">{e.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                            <Calendar size={14} /> {new Date(e.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                            <MapPin size={14} /> {e.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-xs font-bold text-gray-400">{e.attendees?.length || 0} Attending</span>
                        <button 
                          onClick={() => handleRsvpEvent(e._id)}
                          disabled={hasRsvpd}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${hasRsvpd ? 'bg-gray-100 text-gray-400' : 'bg-brand text-white hover:bg-brand-dark'}`}
                        >
                          {hasRsvpd ? "RSVP'd" : 'RSVP Now'}
                        </button>
                      </div>
                    </div>
                  );
                })}
                {events.length === 0 && (
                  <div className="py-12 text-center text-gray-500 text-sm bg-white rounded-xl border border-gray-100 shadow-sm">
                    No upcoming events in your state.
                  </div>
                )}
              </div>
            ) : reports.length === 0 ? (
              <div className="py-20 px-6 flex flex-col items-center text-center bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <FolderOpen size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Reports Found</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-6">No civic concerns have been reported in your state yet. Be the first!</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="py-12 text-center text-gray-500 text-sm bg-white rounded-xl border border-gray-100 shadow-sm">
                No reports match your current search and filters.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((r) => {
                  const voted = hasUpvoted(r);
                  return (
                    <div key={r._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-gray-200 transition-colors">
                      {/* Author Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0">
                             {r.user?.username ? r.user.username.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-gray-900">{r.user?.username || "Anonymous"}</h4>
                              <span className="bg-brand/10 text-brand text-[9px] font-bold px-2 py-0.5 rounded-md">Active Citizen</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                               <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                               <span>•</span>
                               <span>{r.area ? `${r.area}, ${r.state}` : r.state}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="flex flex-col md:flex-row gap-4 mb-4 cursor-pointer" onClick={() => navigate(`/report/${r._id}`)}>
                        <div className="flex-1">
                          <h3 className="text-[15px] font-bold text-gray-900 mb-1 leading-tight">{r.title}</h3>
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">{r.description}</p>
                          <div className="inline-flex items-center gap-1.5 bg-orange-50 px-2.5 py-1 rounded-full text-orange-600 font-semibold text-xs border border-orange-100">
                             <Layers size={12} />
                             <span className="capitalize">{r.category || "General Issue"}</span>
                          </div>
                        </div>
                        
                        {r.imageUrl && (
                          <div className="w-full md:w-36 h-28 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                            <img 
                              src={r.imageUrl} 
                              alt="Issue" 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                              onError={(e) => e.target.style.display = 'none'} 
                            />
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-6 text-gray-500">
                           <button 
                             onClick={() => handleUpvote(r._id)}
                             className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${voted ? 'text-brand' : 'hover:text-gray-900'}`}
                           >
                             <ThumbsUp size={16} className={voted ? "fill-brand" : ""} />
                             <span>{r.upvotes?.length || 0}</span>
                           </button>
                           <button onClick={() => navigate(`/report/${r._id}`)} className="flex items-center gap-1.5 text-xs font-semibold hover:text-gray-900 transition-colors">
                             <MessageCircle size={16} />
                             <span>Discuss</span>
                           </button>
                           <button onClick={() => handleShare(r._id)} className="flex items-center gap-1.5 text-xs font-semibold hover:text-gray-900 transition-colors">
                             <Share2 size={16} />
                             <span>Share</span>
                           </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                           <div className={`w-1.5 h-1.5 rounded-full ${r.status === 'resolved' ? 'bg-green-500' : (r.status === 'in-progress' ? 'bg-orange-500' : 'bg-red-500')}`}></div>
                           <span className="capitalize">{r.status} Priority</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Community Stats */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Community Stats</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 border border-gray-100 text-center">
                  <Users size={20} className="text-brand mb-1" />
                  <span className="text-lg font-black text-gray-900 leading-none">{sidebarData.stats.members}</span>
                  <span className="text-[10px] text-gray-500 font-semibold mt-1 uppercase tracking-wider">Members</span>
               </div>
               <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 border border-gray-100 text-center">
                  <MessageCircle size={20} className="text-purple-500 mb-1" />
                  <span className="text-lg font-black text-gray-900 leading-none">{sidebarData.stats.discussions}</span>
                  <span className="text-[10px] text-gray-500 font-semibold mt-1 uppercase tracking-wider">Discussions</span>
               </div>
               <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 border border-gray-100 text-center">
                  <CalendarDays size={20} className="text-orange-500 mb-1" />
                  <span className="text-lg font-black text-gray-900 leading-none">{sidebarData.stats.events}</span>
                  <span className="text-[10px] text-gray-500 font-semibold mt-1 uppercase tracking-wider">Events</span>
               </div>
               <div className="flex flex-col items-center p-3 rounded-lg bg-gray-50 border border-gray-100 text-center">
                  <Users size={20} className="text-blue-500 mb-1" />
                  <span className="text-lg font-black text-gray-900 leading-none">{sidebarData.stats.groups}</span>
                  <span className="text-[10px] text-gray-500 font-semibold mt-1 uppercase tracking-wider">Groups</span>
               </div>
            </div>
          </div>

          {/* Popular Discussions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Popular Discussions</h3>
              <button className="text-xs font-bold text-brand hover:underline">View All</button>
            </div>
            <div className="space-y-4">
               {sidebarData.popularDiscussions.length === 0 ? (
                 <p className="text-xs text-gray-500">No discussions yet.</p>
               ) : sidebarData.popularDiscussions.map((d, i) => (
                 <div key={i} className="flex gap-3 items-center group cursor-pointer" onClick={() => navigate(`/report/${d._id}`)}>
                   {d.imageUrl ? (
                     <img 
                       src={d.imageUrl} 
                       className="w-12 h-12 rounded-lg object-cover border border-gray-200" 
                       onError={(e) => {
                         e.target.style.display = 'none';
                         e.target.nextSibling.style.display = 'flex';
                       }} 
                     />
                   ) : null}
                   <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0" style={{ display: d.imageUrl ? 'none' : 'flex' }}>
                     <FileText size={16} className="text-gray-400" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="text-xs font-bold text-gray-900 group-hover:text-brand leading-tight mb-1 truncate">{d.title}</h4>
                     <p className="text-[10px] text-gray-500">{new Date(d.createdAt).toLocaleDateString()} • {d.upvoteCount} upvotes</p>
                   </div>
                   <div className="bg-brand/10 text-brand font-bold text-xs px-2 py-1 rounded-md shrink-0">
                     {d.upvoteCount}
                   </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Upcoming Events</h3>
              <button className="text-xs font-bold text-brand hover:underline">View All</button>
            </div>
            <div className="space-y-4">
               {sidebarData.upcomingEvents.length === 0 ? (
                 <p className="text-xs text-gray-500">No upcoming events.</p>
               ) : sidebarData.upcomingEvents.map((e, i) => {
                 const dateObj = new Date(e.date);
                 const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                 const dateNum = dateObj.getDate();
                 return (
                 <div key={i} className="flex gap-3 items-center">
                   <div className="flex flex-col items-center justify-center w-11 h-12 rounded-lg bg-gray-50 border border-gray-200 shrink-0">
                     <span className="text-[9px] font-bold text-brand uppercase">{month}</span>
                     <span className="text-sm font-black text-gray-900 leading-none">{dateNum}</span>
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="text-xs font-bold text-gray-900 leading-tight mb-0.5 truncate">{e.title}</h4>
                     <p className="text-[9px] text-gray-400 truncate">{e.location}</p>
                   </div>
                   <button className="border border-gray-200 text-gray-600 font-bold text-[10px] px-3 py-1.5 rounded-md hover:border-brand hover:text-brand transition-colors shrink-0">
                     Join
                   </button>
                 </div>
                 );
               })}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Top Contributors</h3>
              <button className="text-xs font-bold text-brand hover:underline">View All</button>
            </div>
            <div className="space-y-4">
               {sidebarData.topContributors.length === 0 ? (
                 <p className="text-xs text-gray-500">No contributors yet.</p>
               ) : sidebarData.topContributors.map((c, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <Award size={16} className={i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-orange-600" : "text-gray-300"} />
                     <div className="w-7 h-7 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center shrink-0">
                       {c.username.charAt(0).toUpperCase()}
                     </div>
                     <span className="text-xs font-bold text-gray-900">{c.username}</span>
                   </div>
                   <span className="text-[10px] font-bold text-gray-500">{c.points} pts</span>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
