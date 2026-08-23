import React, { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Users, Shield, ShieldAlert, ShieldCheck, Ban, CheckCircle, Search } from "lucide-react";

const UserManagement = () => {
  const { token, user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSuspend = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? "unsuspend" : "suspend"} this user?`)) return;
    try {
      await api.patch(`/api/admin/users/${userId}/suspend`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistic update
      setUsers(users.map(u => u._id === userId ? { ...u, isSuspended: !currentStatus } : u));
    } catch (err) {
      console.error("Failed to toggle suspension", err);
      alert(err.response?.data?.message || "Failed to update user status");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error("Failed to change role", err);
      alert(err.response?.data?.message || "Failed to update user role");
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role) => {
    switch(role) {
      case "super_admin": return <ShieldAlert size={16} className="text-purple-600" />;
      case "admin": return <ShieldCheck size={16} className="text-blue-600" />;
      case "moderator": return <Shield size={16} className="text-green-600" />;
      default: return <Users size={16} className="text-gray-500" />;
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-gray-500 font-medium mt-1">Manage citizens and moderators in your jurisdiction</p>
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Points</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(u => (
                <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${u.isSuspended ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{u.username}</span>
                      <span className="text-xs text-gray-500">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {currentUser.role === "super_admin" && u._id !== currentUser.id ? (
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="text-sm bg-white border-gray-200 rounded-md shadow-sm focus:border-brand focus:ring focus:ring-brand focus:ring-opacity-50"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1.5 capitalize text-sm font-medium text-gray-700">
                        {getRoleIcon(u.role)}
                        {u.role.replace("_", " ")}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-sm">
                      <span className="text-gray-900">{u.state}</span>
                      <span className="text-xs text-gray-500">PIN: {u.pincode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-brand">
                    {u.points}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {u.isSuspended ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <Ban size={12} /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <CheckCircle size={12} /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u._id !== currentUser.id && u.role !== "super_admin" && (
                      <button
                        onClick={() => handleToggleSuspend(u._id, u.isSuspended)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          u.isSuspended 
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {u.isSuspended ? "Unsuspend" : "Suspend"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
