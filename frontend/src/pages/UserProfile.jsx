import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { User, MapPin, Layers, Shield, Key, Edit2, Check, X, Loader2 } from "lucide-react";

// List of states in India
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Lakshadweep", "Puducherry"
];

const UserProfile = () => {
  const { token, updateUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    state: "",
    area: ""
  });

  useEffect(() => {
    if (!token) {
      setError("Please log in to view your profile.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/user/profile");
        setProfile(res.data.user);
        setEditForm({
          username: res.data.user.username,
          state: res.data.user.state,
          area: res.data.user.area || ""
        });
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          setError("Your session has expired or your account was reset. Please log in again.");
        } else {
          setError("Failed to load profile details.");
        }
      }
    };

    fetchProfile();
  }, [token]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.put("/api/user/profile", editForm);
      setProfile(res.data.user);
      setIsEditing(false);
      
      // Update global auth context
      updateUser(res.data.user);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Session Expired
          </h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">{error}</p>
          <a
            href="/login"
            className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20"
          >
            Log In Again
          </a>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="py-20 text-center flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest mb-4"></div>
          <p className="text-xs uppercase tracking-widest text-charcoal/50 font-bold">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-brand to-brand-dark rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
          <User size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Profile</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your identity and operational area</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand/5 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield size={20} className="text-brand" />
              Identity Details
            </h2>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark bg-brand/5 px-4 py-2 rounded-xl transition-colors"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            ) : (
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    username: profile.username,
                    state: profile.state,
                    area: profile.area || ""
                  });
                }}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 px-4 py-2 rounded-xl transition-colors"
              >
                <X size={16} /> Cancel
              </button>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Username */}
            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-2">
                Registered Username
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                />
              ) : (
                <p className="text-lg font-bold text-gray-900">
                  {profile.username}
                </p>
              )}
            </div>

            {/* Role (Never editable by user) */}
            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-2">
                Assigned Role
              </span>
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-brand/10 text-brand rounded-lg">
                  <Key size={14} />
                  <span>{profile.role === "admin" ? "Municipal Admin" : (profile.role === "super_admin" ? "Super Admin" : "Citizen")}</span>
                </span>
              </div>
            </div>

            {/* State */}
            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-2">
                Operational State
              </span>
              {isEditing ? (
                <select
                  value={editForm.state}
                  onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand transition-colors capitalize"
                >
                  <option value="">Select a state</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s.toLowerCase()}>{s}</option>
                  ))}
                </select>
              ) : (
                <p className="text-base text-gray-900 font-semibold flex items-center capitalize mt-1">
                  <MapPin size={18} className="text-brand mr-2" />
                  <span>{profile.state}</span>
                </p>
              )}
            </div>

            {/* Area */}
            <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold block mb-2">
                Registered Ward / Area
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.area}
                  onChange={(e) => setEditForm({...editForm, area: e.target.value})}
                  placeholder="e.g. Gomti Nagar"
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
                />
              ) : (
                <p className="text-base text-gray-900 font-semibold flex items-center capitalize mt-1">
                  <Layers size={18} className="text-brand mr-2" />
                  <span>{profile.area || "N/A"}</span>
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand/30 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Save Changes
              </button>
            </div>
          )}

          {/* Auth Verification Banner */}
          {!isEditing && (
            <div className="mt-8 bg-brand/5 border border-brand/20 p-4 rounded-2xl flex items-center gap-4">
              <div className="bg-white shadow-sm border border-brand/20 text-brand p-3 rounded-xl">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Credential Verified
                </p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Your identity is secure and your session signature is valid.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
