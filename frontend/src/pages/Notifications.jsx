import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Bell, CheckCircle, Info, Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const [notifRes, annRes] = await Promise.all([
        api.get("/api/user/notifications"),
        api.get("/api/user/announcements")
      ]);
      
      const personalNotifs = notifRes.data;
      const broadcastNotifs = annRes.data.map(ann => ({
        _id: ann._id,
        type: 'announcement',
        title: ann.title,
        message: ann.content,
        createdAt: ann.createdAt,
        read: true,
        isBroadcast: true
      }));

      const combined = [...personalNotifs, ...broadcastNotifs].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setNotifications(combined);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/api/user/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'status_update': return <CheckCircle className="text-green-500" size={24} />;
      case 'announcement': return <Megaphone className="text-blue-500" size={24} />;
      default: return <Info className="text-gray-500" size={24} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-brand">
          <Bell size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">Stay updated on your reports and community events.</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Bell className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Notifications Yet</h3>
          <p className="text-gray-500">You're all caught up! When there are updates to your reports, they'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div 
              key={notif._id} 
              className={`bg-white rounded-2xl p-6 border transition-all ${
                notif.read ? 'border-gray-100 shadow-sm opacity-70' : 'border-brand/30 shadow-md'
              }`}
            >
              <div className="flex gap-4">
                <div className="mt-1 flex-shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-bold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{notif.message}</p>
                  
                  {!notif.read && (
                    <button 
                      onClick={() => markAsRead(notif._id)}
                      className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
