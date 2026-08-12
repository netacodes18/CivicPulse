import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Megaphone, Calendar } from "lucide-react";
import { format } from "date-fns";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/api/user/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Megaphone size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Official Announcements</h1>
            <p className="text-gray-500 font-medium mt-1">Updates and notices from your municipality</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          {[1,2].map(i => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100"></div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Megaphone className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Announcements</h3>
          <p className="text-gray-500">There are no official announcements for your area at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 w-fit">
                  <Calendar size={14} />
                  {format(new Date(item.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </p>
                <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
                  Posted by {item.author?.username || 'Municipality Admin'} • {item.state === 'ALL' ? 'Global' : item.state}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
