import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { Plus, Edit2, Loader2, Check, X, Tag } from "lucide-react";

const CategoriesAdmin = () => {
  const { token, user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    value: "",
    department: "roads",
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/admin/categories", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Error fetching categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && ["admin", "super_admin"].includes(user?.role)) {
      fetchCategories();
    }
  }, [token, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/api/admin/categories/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post("/api/admin/categories", form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error("Error saving category", err);
      alert(err.response?.data?.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (cat = null) => {
    if (cat) {
      setEditingId(cat._id);
      setForm({
        name: cat.name,
        value: cat.value,
        department: cat.department,
        isActive: cat.isActive
      });
    } else {
      setEditingId(null);
      setForm({ name: "", value: "", department: "roads", isActive: true });
    }
    setShowModal(true);
  };

  const toggleStatus = async (cat) => {
    try {
      await api.put(`/api/admin/categories/${cat._id}`, { isActive: !cat.isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      console.error("Error toggling status", err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-brand"><Loader2 size={32} className="animate-spin" /></div>;
  }

  return (
    <div className="pb-12 max-w-5xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-surface-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag size={24} className="text-brand" />
            Manage Categories
          </h1>
          <p className="text-sm text-gray-500 mt-1">Add or update issue categories and their routing rules.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> New Category
        </button>
      </div>

      <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
              <th className="p-4 font-bold">Category Name</th>
              <th className="p-4 font-bold">Value (ID)</th>
              <th className="p-4 font-bold">Routed Department</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map(cat => (
              <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{cat.name}</td>
                <td className="p-4 text-sm text-gray-500"><code>{cat.value}</code></td>
                <td className="p-4">
                  <span className="inline-flex px-2 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 capitalize border border-blue-100">
                    {cat.department}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${cat.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'} border`}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => openModal(cat)} className="p-1.5 text-gray-400 hover:text-brand hover:bg-brand/10 rounded transition-colors mr-2">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => toggleStatus(cat)} className={`p-1.5 rounded transition-colors ${cat.isActive ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-green-400 hover:text-green-600 hover:bg-green-50'}`}>
                    {cat.isActive ? <X size={16} /> : <Check size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900">{editingId ? "Edit Category" : "New Category"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input required type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Broken Streetlights" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Value (ID)</label>
                <input required disabled={!!editingId} type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 outline-none disabled:bg-gray-100 disabled:text-gray-500" value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="e.g. broken_streetlights" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Routing Department</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 outline-none bg-white" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                  <option value="roads">Roads & Footpaths</option>
                  <option value="water">Water Supply & Leakage</option>
                  <option value="sanitation">Garbage & Sanitation</option>
                  <option value="electricity">Street Lights & Electricity</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-dark rounded-lg transition-colors flex items-center gap-2">
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesAdmin;
