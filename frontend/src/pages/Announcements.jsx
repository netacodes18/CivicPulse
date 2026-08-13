import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Megaphone, Calendar, User, MapPin } from "lucide-react";
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
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans relative">
      {/* Decorative background blobs (similar to UserProfile) */}
      <div className="fixed -top-24 -right-24 w-96 h-96 bg-brand/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="fixed top-1/2 -left-24 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white rounded-3xl border border-gray-100 shadow-sm"></div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gray-200 to-gray-300"></div>
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Megaphone className="text-gray-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Announcements</h3>
          <p className="text-gray-500 max-w-sm mx-auto">There are no official announcements for your area at this time. We'll notify you when there's an update.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {announcements.map((item) => (
            <div 
              key={item._id} 
              className="bg-white rounded-3xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden hover:shadow-md hover:border-brand/30 transition-all duration-300 group relative"
            >
              {/* Subtle top highlight on hover */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand to-brand-light opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="border-b border-gray-100 bg-gray-50/30 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-[19px] font-extrabold text-gray-900 flex items-center gap-3">
                  {item.title}
                </h2>
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand bg-brand/10 px-3.5 py-1.5 rounded-full border border-brand/20 w-fit shrink-0">
                  <Calendar size={14} />
                  {format(new Date(item.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-[15px]">
                  {item.content}
                </p>
                
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <User size={14} className="text-gray-400" />
                    Posted by <span className="text-gray-700">{item.author?.username || 'Municipality Admin'}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-gray-700">{item.state === 'ALL' ? 'Global Broadcast' : item.state}</span>
                  </div>
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
