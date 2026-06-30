import React, { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ArrowRight, UploadCloud, MapPin, Navigation } from "lucide-react";

const Report = () => {
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const handleGetLocation = () => {
    setFetchingLocation(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setFetchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setFetchingLocation(false);
      },
      (error) => {
        setLocationError("Unable to retrieve your location. Please ensure location services are enabled.");
        setFetchingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    if (image) formData.append("image", image);
    if (coordinates.lat && coordinates.lng) {
      formData.append("lat", coordinates.lat);
      formData.append("lng", coordinates.lng);
    }

    try {
      await api.post("/api/user/report", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Report submitted successfully!");
      setTitle("");
      setDescription("");
      setCategory("");
      setImage(null);
      setCoordinates({ lat: null, lng: null });
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit report");
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#FDFBF7] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-forest/5 border border-forest/15 text-forest mb-4">
            <span className="text-xs font-bold tracking-widest uppercase">log.</span>
          </div>
          <h1 className="text-3xl font-light text-charcoal tracking-tight mb-2">
            report an <span className="font-semibold italic text-forest">urban anomaly</span>
          </h1>
          <p className="text-charcoal/60 text-xs tracking-wide">
            document local space decay to request municipal caretakers restoration
          </p>
        </div>

        {/* Form Panel */}
        <div className="bg-white rounded-none border border-charcoal/10 p-8 shadow-sm relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-forest"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title Input */}
            <div className="flex flex-col">
              <label htmlFor="title" className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                Anomaly Title *
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Broken pavement slabs, Damaged drainage pipes"
                className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors placeholder-charcoal/30"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category Selection */}
            <div className="flex flex-col">
              <label htmlFor="category" className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                Anomalous Sector *
              </label>
              <select
                id="category"
                className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select a sector of concern</option>
                <option value="roads">Roads & Pedestrian paths</option>
                <option value="streetlights">Spatial Lighting & Standards</option>
                <option value="sanitation">Sanitation & Garbage Management</option>
                <option value="water">Water & Drainage Pipelines</option>
                <option value="parks">Parks & Public Recreation</option>
                <option value="safety">Public Safety & Structures</option>
                <option value="other">Other Public Assets</option>
              </select>
            </div>

            {/* Detailed Description */}
            <div className="flex flex-col">
              <label htmlFor="description" className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-1">
                Detailed Description *
              </label>
              <textarea
                id="description"
                rows="4"
                placeholder="Provide precise location, landmarks, and structural status description..."
                className="w-full border-b border-charcoal/20 focus:border-forest bg-transparent rounded-none py-2 px-1 text-charcoal text-sm outline-none transition-colors placeholder-charcoal/30 resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* File Upload Box */}
            <div className="flex flex-col">
              <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-2">
                Photo Evidence (Optional)
              </label>
              <div className="border border-dashed border-charcoal/30 hover:border-forest rounded-none p-6 text-center cursor-pointer transition-colors bg-[#FDFBF7] relative">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <label htmlFor="image" className="cursor-pointer flex flex-col items-center">
                  <UploadCloud size={28} className="text-sage mb-2" />
                  <span className="text-xs font-semibold text-charcoal block mb-1">
                    Select local image file
                  </span>
                  <span className="text-[10px] text-charcoal/50">
                    PNG, JPG, or JPEG up to 5MB
                  </span>
                </label>
              </div>
              
              {image && (
                <div className="mt-3 p-3 bg-forest/5 border border-forest/10 flex justify-between items-center">
                  <span className="text-xs font-medium text-forest truncate max-w-[90%]">
                    ✓ Selected: {image.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="text-[10px] font-bold uppercase text-red-700 hover:text-red-900 ml-2"
                  >
                    remove
                  </button>
                </div>
              )}
            </div>

            {/* Geolocation Section */}
            <div className="flex flex-col">
              <label className="text-[9px] uppercase tracking-widest text-charcoal/60 font-bold mb-2">
                Location Coordinates (Optional)
              </label>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={fetchingLocation}
                  className="bg-charcoal/5 hover:bg-charcoal/10 text-charcoal border border-charcoal/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Navigation size={14} className={fetchingLocation ? "animate-pulse" : ""} />
                  {fetchingLocation ? "Detecting..." : "Detect Location"}
                </button>
                
                <div className="flex-1">
                  {coordinates.lat && coordinates.lng ? (
                    <div className="flex items-center gap-2 text-xs text-forest font-medium">
                      <MapPin size={14} />
                      <span>{coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-charcoal/50 font-light">
                      Capture coordinates for accurate spatial mapping
                    </span>
                  )}
                  {locationError && (
                    <p className="text-xs text-red-600 font-medium mt-1">{locationError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-forest hover:bg-charcoal text-sand hover:text-white py-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span>Submit Grievance Log</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>

          {/* Banner message */}
          {message && (
            <div
              className={`mt-6 p-4 border text-center ${
                message.includes("successfully")
                  ? "bg-forest/5 border-forest/20 text-forest"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider">{message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report;
