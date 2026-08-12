import React, { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Megaphone, Send, Trash2, Clock, MapPin } from "lucide-react";
import moment from "moment";

const AnnouncementsAdmin = () => {
  const { token, user } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetState, setTargetState] = useState("ALL");
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, [token]);

  const fetchAnnouncements = async () => {
    try {
      // Re-use the user endpoint to get announcements scoped to this admin's state
      const res = await api.get("/api/user/announcements", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert("Title and content are required");
    
    setBroadcasting(true);
    try {
      const res = await api.post("/api/admin/announcements", { title, content, targetState }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Announcement broadcasted successfully!");
      setTitle("");
      setContent("");
      fetchAnnouncements(); // Refresh list
    } catch (err) {
      console.error("Failed to broadcast", err);
      alert(err.response?.data?.message || "Failed to broadcast announcement");
    } finally {
      setBroadcasting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await api.delete(`/api/admin/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete announcement");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
          <Megaphone size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Broadcast Center</h1>
          <p className="text-gray-500 font-medium mt-1">Send official announcements to citizens</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Broadcast Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Send size={18} className="text-brand" />
              New Broadcast
            </h2>
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:bg-white transition-colors"
                  placeholder="e.g., Scheduled Water Outage"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Message Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:bg-white transition-colors min-h-[120px]"
                  placeholder="Write your announcement here..."
                  required
                />
              </div>

              {user?.role === "super_admin" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Target Audience</label>
                  <select
                    value={targetState}
                    onChange={(e) => setTargetState(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand focus:bg-white"
                  >
                    <option value="ALL">All States (National)</option>
                    <option value={user.state}>My State Only ({user.state})</option>
                  </select>
                </div>
              )}
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-brand/30 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2"
                >
                  {broadcasting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Megaphone size={18} />
                      Broadcast Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Broadcast History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Broadcast History</h2>
          
          {announcements.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center">
              <Megaphone className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Announcements Yet</h3>
              <p className="text-gray-500">Your broadcast history is empty.</p>
            </div>
          ) : (
            announcements.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 pr-8">{item.title}</h3>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors absolute top-4 right-4 opacity-0 group-hover:opacity-100"
                    title="Delete Broadcast"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{item.content}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                    <Clock size={14} />
                    {moment(item.createdAt).format("MMM D, YYYY h:mm A")}
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                    <MapPin size={14} />
                    Target: {item.state}
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                    <span>By: {item.author?.username || "Admin"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsAdmin;
