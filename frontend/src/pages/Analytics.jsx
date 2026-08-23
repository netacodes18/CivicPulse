import React, { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { BarChart2, Activity, CheckCircle, Clock, MapPin, TrendingUp, Layers, AlertTriangle } from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';

const Analytics = () => {
  const { user, token } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine if admin mode
  const isAdmin = ["admin", "super_admin", "moderator"].includes(user?.role);

  useEffect(() => {
    fetchAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, token]);

  const fetchAnalytics = async () => {
    if (!token) return;
    try {
      if (isAdmin) {
        const res = await api.get("/api/admin/analytics", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } else {
        const [statsRes, catRes] = await Promise.all([
          api.get("/api/user/dashboard-stats", { headers: { Authorization: `Bearer ${token}` } }),
          api.get("/api/user/dashboard-categories", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const formattedCats = (catRes.data.categories || []).map(c => ({
          name: c._id.replace(/_/g, ' '),
          value: c.count
        }));
        setStats({ ...statsRes.data, categories: formattedCats });
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 flex justify-center items-center h-96">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-brand/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-brand rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16">
          <Activity className="mx-auto text-gray-300 mb-6" size={56} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-500">We couldn't load your analytics right now. Please try again later.</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#1e8f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================
  if (isAdmin) {
    const { kpi, trend, sla, hotspots, categories } = stats;
    
    // Format categories for Pie chart
    const formattedCategories = categories.map(c => ({
      name: c._id || "Unknown",
      value: c.count
    }));

    return (
      <div className="max-w-7xl mx-auto py-8 px-4 font-sans space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <BarChart2 size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Operational Analytics</h1>
            <p className="text-gray-500 font-medium mt-1">Key performance metrics and trends</p>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Activity size={24} /></div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Total Reports</p>
            <h3 className="text-4xl font-black text-gray-900">{kpi?.total || 0}</h3>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600"><AlertTriangle size={24} /></div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Pending Action</p>
            <h3 className="text-4xl font-black text-gray-900">{kpi?.pending || 0}</h3>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600"><CheckCircle size={24} /></div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-1">Resolved</p>
            <h3 className="text-4xl font-black text-gray-900">{kpi?.resolved || 0}</h3>
          </div>
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm bg-gradient-to-br from-blue-600 to-blue-800 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white"><Clock size={24} /></div>
            </div>
            <p className="text-sm font-semibold text-blue-100 mb-1">Avg Resolution Time</p>
            <h3 className="text-4xl font-black text-white">
              {kpi?.avgResolutionTimeMs ? Math.round(kpi.avgResolutionTimeMs / (1000 * 60 * 60 * 24)) : 0} <span className="text-xl font-medium">days</span>
            </h3>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Trend Chart */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-gray-900">Volume Trend (6 Months)</h2>
              <p className="text-sm text-gray-500">Reports submitted over time</p>
            </div>
            <div className="h-[300px] w-full">
              {trend && trend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No trend data</div>
              )}
            </div>
          </div>

          {/* SLA Chart */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-gray-900">Department SLA Performance</h2>
              <p className="text-sm text-gray-500">Avg Resolution Time (Days)</p>
            </div>
            <div className="h-[300px] w-full">
              {sla && sla.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sla} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="avgResolutionTimeDays" name="Days to Resolve" radius={[6, 6, 6, 6]} fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No SLA data</div>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-gray-900">Issue Distribution</h2>
              <p className="text-sm text-gray-500">Breakdown by category</p>
            </div>
            <div className="h-[300px] w-full">
              {formattedCategories && formattedCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={formattedCategories} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                      {formattedCategories.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">No category data</div>
              )}
            </div>
          </div>

          {/* Hotspots Table */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Geographic Hotspots</h2>
                <p className="text-sm text-gray-500">Top 5 PIN codes by report volume</p>
              </div>
              <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                <MapPin size={20} />
              </div>
            </div>
            {hotspots && hotspots.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-4 font-bold">PIN Code</th>
                      <th className="p-4 font-bold text-right">Total</th>
                      <th className="p-4 font-bold text-right text-orange-600">Pending</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {hotspots.map((h, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">{i+1}</span>
                          {h.pincode}
                        </td>
                        <td className="p-4 text-right font-semibold">{h.count}</td>
                        <td className="p-4 text-right font-semibold text-orange-600">{h.pendingCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400">No hotspot data</div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // CITIZEN DASHBOARD
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
            <BarChart2 size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics Overview</h1>
            <p className="text-gray-500 font-medium mt-1">Visualize your community impact and reporting trends</p>
          </div>
        </div>
        <div className="bg-white px-5 py-2.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
          <TrendingUp size={16} className="text-brand" />
          <span className="text-sm font-bold text-gray-700">Top 10% Contributor</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><Activity size={24} /></div>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg">All Time</span>
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1">Total Reports</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-gray-900">{stats.totalReports}</h3>
            <span className="text-sm font-bold text-green-500">+{stats.thisWeekReports} this wk</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500"><CheckCircle size={24} /></div>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">Success</span>
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1">Resolved Issues</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-gray-900">{stats.resolvedReports}</h3>
            <span className="text-sm font-bold text-gray-400">({stats.totalReports ? Math.round((stats.resolvedReports / stats.totalReports) * 100) : 0}%)</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500"><Clock size={24} /></div>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-lg">Waiting</span>
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1">Pending Review</p>
          <h3 className="text-4xl font-black text-gray-900">{stats.pendingReports}</h3>
        </div>

        <div className="bg-gradient-to-br from-brand to-brand-dark rounded-3xl p-6 shadow-lg shadow-brand/20 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md"><MapPin size={24} /></div>
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-md">Points</span>
          </div>
          <p className="text-sm font-semibold text-white/80 mb-1 relative z-10">Civic Impact Score</p>
          <h3 className="text-4xl font-black text-white relative z-10">{stats.impactPoints}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-gray-900">Issue Distribution</h2>
            <p className="text-sm text-gray-500 mt-1">Breakdown of reports by category</p>
          </div>
          <div className="h-[300px] w-full">
            {stats.categories && stats.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.categories} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                    {stats.categories.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium">No category data available</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-gray-900">Volume Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">Comparing total reports across categories</p>
          </div>
          <div className="h-[300px] w-full">
            {stats.categories && stats.categories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categories} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                    {stats.categories.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 font-medium">No category data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
