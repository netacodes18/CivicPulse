import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ArrowRight } from "lucide-react";

const Signup = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    state: "",
    area: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/auth/signup", form);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-[#FDFBF7] px-6 py-12">
      <div className="w-full max-w-md">
        
        {/* Header Block */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-forest/5 border border-forest/15 text-forest mb-4">
            <span className="text-xs font-bold tracking-widest uppercase">cp.</span>
          </div>
          <h1 className="text-2xl font-light text-charcoal tracking-tight mb-2">
            create <span className="font-semibold italic text-forest">stewardship account</span>
          </h1>
          <p className="text-charcoal/60 text-xs tracking-wide">
            register and monitor spatial resolutions in your area
          </p>
        </div>

        {/* Form Panel */}
        <div className="bg-white border border-charcoal/10 p-8 shadow-sm relative">
          {/* Top Geometric Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-forest"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
                Account Details
              </h2>
            </div>

            <div className="space-y-5">
              {/* Username */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                  Username *
                </label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors"
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                  Password *
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors"
                  required
                />
              </div>

              {/* Role */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                  Access Level *
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors cursor-pointer"
                >
                  <option value="user">Citizen User</option>
                  <option value="admin">Municipal Admin</option>
                </select>
              </div>

              {/* State */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                  State *
                </label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors cursor-pointer"
                  required
                >
                  <option value="">Select State</option>
                  <option value="uttar pradesh">Uttar Pradesh</option>
                  <option value="bihar">Bihar</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="karnataka">Karnataka</option>
                </select>
              </div>

              {/* Area */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                  Area (Optional)
                </label>
                <input
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="e.g. ward 12, indira nagar"
                  className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors placeholder-charcoal/30"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-forest hover:bg-charcoal text-sand hover:text-white py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group mt-4"
            >
              <span>Register Account</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <p
              className="pt-4 text-xs text-center text-forest hover:text-charcoal cursor-pointer font-medium tracking-wide"
              onClick={() => navigate("/login")}
            >
              Already have an account? Sign in
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
