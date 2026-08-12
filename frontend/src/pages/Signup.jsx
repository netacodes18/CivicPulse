import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { ArrowRight, MapPin, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const Signup = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    state: "",
    area: "",
    pincode: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await api.post("/api/auth/signup", form);
      setMessage("Signup successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex flex-col justify-center items-center px-6 py-12 bg-gray-50/50">
      <div className="w-full max-w-xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand/10 text-brand rounded-full mb-4">
            <MapPin size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create an Account</h1>
          <p className="text-sm text-gray-500">Join the civic response network and improve your community.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
          
          {message && (
            <div className="mb-6 bg-status-resolved/10 text-status-resolved p-4 rounded-lg text-sm font-medium flex items-center gap-2 border border-status-resolved/20">
              <CheckCircle2 size={18} />
              <span>{message}</span>
            </div>
          )}
          
          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium flex items-start gap-2 border border-red-100">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="e.g. john_doe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors bg-white"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors bg-white"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="flex-1 min-w-0 block w-full px-4 py-2.5 rounded-none rounded-r-lg border border-gray-300 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none text-sm transition-colors bg-white"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors bg-white"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Type *</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors appearance-none cursor-pointer bg-white"
                >
                  <option value="user">Citizen User</option>
                  <option value="moderator">Department Moderator</option>
                  <option value="admin">Municipal Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {/* Department (Only for Moderators) */}
              {form.role === "moderator" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Assigned Department *</label>
                  <select
                    name="department"
                    value={form.department || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors appearance-none cursor-pointer bg-white"
                    required={form.role === "moderator"}
                  >
                    <option value="">Select a department</option>
                    <option value="roads">Roads & Footpaths</option>
                    <option value="water">Water Supply & Leakage</option>
                    <option value="sanitation">Garbage & Sanitation</option>
                    <option value="electricity">Street Lights & Electricity</option>
                    <option value="other">Other Issues</option>
                  </select>
                </div>
              )}

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State / UT *</label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors appearance-none cursor-pointer bg-white"
                  required
                >
                  <option value="">Select your state</option>
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state.toLowerCase()}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Local Area / District (Optional)</label>
                <input
                  type="text"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="e.g. Ward 12, Indira Nagar"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors bg-white"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN Code *</label>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 110001"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors bg-white"
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand hover:bg-brand-dark text-white py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-brand font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;
