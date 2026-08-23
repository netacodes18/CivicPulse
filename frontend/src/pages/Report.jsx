import React, { useState, useContext, useEffect } from "react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ArrowRight, UploadCloud, MapPin, Navigation, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const Report = () => {
  const { t } = useTranslation();
  const { token } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [activeCategories, setActiveCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/user/categories", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActiveCategories(res.data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    if (token) fetchCategories();
  }, [token]);

  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setImagePreview(null);
    }
  }, [image]);

  const handleGetLocation = () => {
    setFetchingLocation(true);
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError(t("report_err_gps") || "Geolocation is not supported by your browser");
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
      () => {
        setLocationError(t("report_err_gps_fail") || "Failed to retrieve location. Please check your permissions.");
        setFetchingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    if (area) formData.append("area", area);
    if (pincode) formData.append("pincode", pincode);
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
          "Idempotency-Key": idempotencyKey,
        },
      });

      setMessage({ text: "Report submitted successfully! Thank you for improving our community.", type: "success" });
      setTitle("");
      setDescription("");
      setCategory("");
      setArea("");
      setPincode("");
      setImage(null);
      setCoordinates({ lat: null, lng: null });
      setIdempotencyKey(crypto.randomUUID());
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to submit report. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-12 max-w-3xl mx-auto">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Report an Issue</h1>
        <p className="text-gray-500 text-sm">Provide details about the municipal issue you have observed.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg flex items-start gap-3 mb-6 border ${
          message.type === 'success' ? 'bg-status-resolved/10 border-status-resolved/20 text-status-resolved' : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
          <div>
            <h4 className="font-semibold text-sm">{message.type === 'success' ? 'Success' : 'Submission Error'}</h4>
            <p className="text-sm opacity-90">{message.text}</p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
        
        <form onSubmit={handleSubmit} className="divide-y divide-surface-border">
          
          {/* Section 1: Basic Info */}
          <div className="p-6 md:p-8 space-y-6">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold">1</span>
              Issue Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g., Deep pothole on Main Street"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors bg-surface-muted/50"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors bg-surface-muted/50 cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  {activeCategories.map((cat) => (
                    <option key={cat._id} value={cat.value}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                    Area / Landmark <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="area"
                    type="text"
                    placeholder="e.g. Ward 12, Main Street"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors bg-surface-muted/50"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pincode"
                    type="text"
                    placeholder="e.g. 110001"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors bg-surface-muted/50"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows="4"
                  placeholder="Provide precise location, landmarks, and structural status description..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-colors bg-surface-muted/50 resize-y"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Evidence */}
          <div className="p-6 md:p-8 space-y-6 bg-gray-50/50">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold">2</span>
              Visual Evidence (Optional)
            </h3>
            
            <div>
              <div className="border-2 border-dashed border-gray-300 hover:border-brand/50 rounded-xl p-8 text-center cursor-pointer transition-colors bg-white relative">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => setImage(e.target.files[0])}
                />
                <div className="flex flex-col items-center pointer-events-none">
                  {imagePreview ? (
                    <div className="mb-4 relative rounded-lg overflow-hidden border border-gray-200">
                       <img src={imagePreview} alt="Preview" className="max-h-48 object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-brand/5 rounded-full flex items-center justify-center mb-3">
                      <UploadCloud size={24} className="text-brand" />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-800 mb-1">
                    {image ? "Click to change image" : "Click to upload an image"}
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG up to 5MB
                  </span>
                </div>
              </div>
              
              {image && (
                <div className="mt-3 flex justify-between items-center px-2">
                  <span className="text-xs font-medium text-gray-600 truncate max-w-[80%]">
                    {image.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="p-6 md:p-8 space-y-6">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold">3</span>
              Precise Location (Optional)
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={fetchingLocation}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                <Navigation size={16} className={fetchingLocation ? "animate-pulse text-brand" : "text-gray-500"} />
                {fetchingLocation ? "Detecting location..." : "Use Current Location"}
              </button>
              
              <div className="flex-1">
                {coordinates.lat && coordinates.lng ? (
                  <div className="flex items-center gap-2 text-sm text-brand bg-brand/5 px-3 py-2 rounded-lg border border-brand/10 inline-flex">
                    <MapPin size={16} />
                    <span className="font-medium">Coordinates captured ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Info size={16} />
                    <span>Helps authorities locate the exact issue</span>
                  </div>
                )}
                {locationError && (
                  <p className="text-xs text-red-500 font-medium mt-2">{locationError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="p-6 md:p-8 bg-gray-50/50 flex items-center justify-end gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <span>Submit Report</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Report;
