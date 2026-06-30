import React, { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { User, MapPin, Layers, Shield, Key } from "lucide-react";

const UserProfile = () => {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/user/profile");
        setProfile(res.data.user);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile details.");
      }
    };

    fetchProfile();
  }, [token]);

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
        <div className="text-center mb-10">
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
            <div className="text-center mb-4 border-b border-charcoal/10 pb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-charcoal">
                Identity Profile Log
              </h2>
            </div>

            <div className="grid gap-6">
              {/* Username */}
              <div className="border-b border-charcoal/10 pb-4">
                <span className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block mb-1">
                  Registered Username
                </span>
                <p className="text-base font-semibold text-charcoal uppercase tracking-wider">
                  {profile.username}
                </p>
              </div>

              {/* Role */}
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
                <span className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block mb-1">
                  Operational State
                </span>
                <p className="text-sm text-charcoal font-light flex items-center capitalize mt-1">
                  <MapPin size={14} className="text-forest mr-2" />
                  <span>{profile.state}</span>
                </p>
              </div>

              {/* Area */}
              <div className="border-b border-charcoal/10 pb-4">
                <span className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold block mb-1">
                  Registered Ward / Area
                </span>
                <p className="text-sm text-charcoal font-light flex items-center capitalize mt-1">
                  <Layers size={14} className="text-forest mr-2" />
                  <span>{profile.area || "N/A"}</span>
                </p>
              </div>
            </div>

            {/* Auth Verification Banner */}
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
