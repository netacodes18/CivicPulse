import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ArrowRight } from "lucide-react";

const Login = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/api/auth/login", form);
      const token = res.data.token;
      login(token);

      // Decode token for route redirecting
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded.role === "admin") navigate("/all-reports");
      else navigate("/my-reports");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      setError(msg);
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
            sign in to <span className="font-semibold italic text-forest">civicpulse.</span>
          </h1>
          <p className="text-charcoal/60 text-xs tracking-wide">
            stewarding local neighborhoods & community spaces
          </p>
        </div>

        {/* Form Panel */}
        <div className="bg-white border border-charcoal/10 p-8 shadow-sm relative">
          {/* Top Geometric Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-forest"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
                Access Portal
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border-l-2 border-red-500 p-3">
                <p className="text-red-800 text-xs text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            <div className="space-y-6">
              {/* Username Input */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors"
                  required
                />
              </div>

              {/* Role Selector */}
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                  Access Level *
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors appearance-none cursor-pointer"
                >
                  <option value="user">Citizen User</option>
                  <option value="admin">Municipal Admin</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-forest hover:bg-charcoal text-sand hover:text-white py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              <span>Authenticate Session</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <p
              className="pt-4 text-xs text-center text-forest hover:text-charcoal cursor-pointer font-medium tracking-wide"
              onClick={() => navigate("/signup")}
            >
              No account? Register stewardship profile
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
