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
  const { token, login } = useContext(AuthContext); // Need login to update context user if needed
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
    if (!token) return;

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
        setError("Failed to load profile details.");
      }
    };

    fetchProfile();
  }, [token]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.put("/api/user/profile", editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.user);
      setIsEditing(false);
      
      // Update global auth context
      login(res.data.user, token);
      
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="bg-white border border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-50 border border-red-200 text-red-700 flex items-center justify-center mx-auto mb-4">
            <span className="text-lg font-bold">!</span>
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-charcoal mb-2">
            Error Loading Profile
          </h3>
          <p className="text-xs text-red-700">{error}</p>
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
    <div className="min-h-[calc(100vh-73px)] bg-[#FDFBF7] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center mb-10 relative">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-forest/5 border border-forest/15 text-forest mb-4">
            <span className="text-xs font-bold tracking-widest uppercase">usr.</span>
          </div>
          <h1 className="text-3xl font-light text-charcoal tracking-tight mb-2">
            stewardship <span className="font-semibold italic text-forest">profile details</span>
          </h1>
          <p className="text-charcoal/60 text-xs tracking-wide">
            registered credentials and administrative authorization
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-charcoal/10 p-8 shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-forest"></div>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
                Identity Profile Log
              </h2>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-forest hover:text-forest-dark transition-colors"
                >
                  <Edit2 size={12} /> Edit Profile
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
                  className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X size={12} /> Cancel
                </button>
              )}
            </div>

            <div className="grid gap-6">
              {/* Username */}
              <div className="border-b border-charcoal/10 pb-4">
                <span className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block mb-2">
                  Registered Username
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-forest outline-none"
                  />
                ) : (
                  <p className="text-base font-semibold text-charcoal uppercase tracking-wider">
                    {profile.username}
                  </p>
                )}
              </div>

              {/* Role (Never editable by user) */}
              <div className="border-b border-charcoal/10 pb-4">
                <span className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block mb-1">
                  Assigned Profile Role
                </span>
                <div className="flex items-center mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-forest/5 border border-forest/15 text-forest">
                    <User size={12} />
                    <span>{profile.role === "admin" ? "Municipal Admin" : "Citizen"}</span>
                  </span>
                </div>
              </div>

              {/* State */}
              <div className="border-b border-charcoal/10 pb-4">
                <span className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block mb-2">
                  Operational State
                </span>
                {isEditing ? (
                  <select
                    value={editForm.state}
                    onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-forest outline-none capitalize"
                  >
                    <option value="">Select a state</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s} value={s.toLowerCase()}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-charcoal font-light flex items-center capitalize mt-1">
                    <MapPin size={14} className="text-forest mr-2" />
                    <span>{profile.state}</span>
                  </p>
                )}
              </div>

              {/* Area */}
              <div className="border-b border-charcoal/10 pb-4">
                <span className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block mb-2">
                  Registered Ward / Area
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.area}
                    onChange={(e) => setEditForm({...editForm, area: e.target.value})}
                    placeholder="e.g. Gomti Nagar"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-forest outline-none"
                  />
                ) : (
                  <p className="text-sm text-charcoal font-light flex items-center capitalize mt-1">
                    <Layers size={14} className="text-forest mr-2" />
                    <span>{profile.area || "N/A"}</span>
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-forest hover:bg-forest-dark text-white px-6 py-2 rounded text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save Changes
                </button>
              </div>
            )}

            {/* Auth Verification Banner */}
            {!isEditing && (
              <div className="mt-8 bg-forest/5 border border-forest/15 p-4 flex items-center gap-3">
                <div className="bg-forest text-sand p-2 rounded-none">
                  <Shield size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-forest">
                    Credential Verified
                  </p>
                  <p className="text-[10px] text-forest/75 font-light">
                    Active session signature matches local security token
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs font-light text-charcoal/50 tracking-wider">
            Help restore spatial harmony by logging anomalies in your district
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
