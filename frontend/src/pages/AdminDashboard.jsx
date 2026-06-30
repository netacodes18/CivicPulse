import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);

useEffect(() => {
  if (!token) return;

  const fetchStats = async () => {
    try {
      const res = await api.get("/api/admin/dashboard-stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching dashboard stats", err);
    }
  };

  fetchStats();
}, [token]);



  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-1">
                Overview of civic issue reports and system statistics
              </p>
            </div>
          </div>

          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Welcome to the Administrative Panel
                </h2>
                <p className="text-blue-100">
                  Monitor and manage civic issues reported by citizens
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-2a1 1 0 011-1h4a1 1 0 011 1v2M7 7h.01M7 11h.01M17 7h.01M17 11h.01"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {!stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                    <div className="w-8 h-4 bg-slate-200 rounded"></div>
                  </div>
                  <div className="w-16 h-8 bg-slate-200 rounded mb-2"></div>
                  <div className="w-20 h-4 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Reports Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    ALL
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-slate-800">
                    {stats?.total?.toLocaleString()}

                  </h3>
                  <p className="text-slate-600 text-sm mt-1 font-medium">
                    Total Reports
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    All issues submitted to date
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Reports Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
                    🔴 URGENT
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-red-600">
                    {stats?.pending?.toLocaleString()}

                  </h3>
                  <p className="text-slate-600 text-sm mt-1 font-medium">
                    Pending Review
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Awaiting administrative action
                  </p>
                </div>
              </div>
            </div>

            {/* In Progress Reports Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                    🟡 ACTIVE
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-yellow-600">
                    {stats?.inProgress?.toLocaleString()}

                  </h3>
                  <p className="text-slate-600 text-sm mt-1 font-medium">
                    In Progress
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Currently being addressed
                  </p>
                </div>
              </div>
            </div>

            {/* Resolved Reports Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    🟢 DONE
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-bold text-green-600">
                    {stats?.resolved?.toLocaleString()}

                  </h3>
                  <p className="text-slate-600 text-sm mt-1 font-medium">
                    Resolved
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Successfully completed issues
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info Section */}
        {stats && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Quick Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Resolution Rate</span>
                  <span className="font-semibold text-slate-800">
                    {stats.total > 0
                      ? Math.round((stats.resolved / stats.total) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Active Issues</span>
                  <span className="font-semibold text-slate-800">
                    {stats.pending + stats.inProgress}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Completion Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            stats.total > 0
                              ? (stats.resolved / stats.total) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {stats.total > 0
                        ? Math.round((stats.resolved / stats.total) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600">Platform Status</span>
                  <span className="flex items-center gap-2 text-green-600 font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600">Database</span>
                  <span className="flex items-center gap-2 text-green-600 font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600">Last Updated</span>
                  <span className="text-slate-800 font-medium text-sm">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
