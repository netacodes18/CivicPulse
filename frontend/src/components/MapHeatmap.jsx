import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

// Component to dynamically adjust map bounds based on markers
const MapBounds = ({ reports }) => {
  const map = useMap();

  useEffect(() => {
    if (reports && reports.length > 0) {
      const validReports = reports.filter(r => r.coordinates && r.coordinates.lat && r.coordinates.lng);
      if (validReports.length > 0) {
        const lats = validReports.map(r => r.coordinates.lat);
        const lngs = validReports.map(r => r.coordinates.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        // Add some padding to the bounds
        const padding = 0.05;
        map.fitBounds([
          [minLat - padding, minLng - padding],
          [maxLat + padding, maxLng + padding]
        ]);
      }
    }
  }, [reports, map]);

  return null;
};

const MapHeatmap = ({ reports }) => {
  const navigate = useNavigate();
  // Filter out reports without coordinates
  const validReports = reports?.filter(r => r.coordinates && r.coordinates.lat && r.coordinates.lng) || [];

  // Default center (e.g. geographic center of India roughly, or if reports exist, the first one)
  const defaultCenter = validReports.length > 0 
    ? [validReports[0].coordinates.lat, validReports[0].coordinates.lng]
    : [20.5937, 78.9629]; // India center

  const getColor = (status, priority) => {
    if (status === 'resolved') return '#10B981'; // green-500
    if (status === 'in-progress') return '#F59E0B'; // amber-500
    
    // pending
    if (priority === 'High') return '#EF4444'; // red-500
    return '#F97316'; // orange-500
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200 shadow-sm relative z-0">
      {validReports.length === 0 && (
        <div className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">No Coordinate Data</h4>
          <p className="text-xs text-gray-500">Reports in your area lack GPS coordinates.</p>
        </div>
      )}
      
      <MapContainer 
        center={defaultCenter} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapBounds reports={validReports} />

        {validReports.map((report) => (
          <CircleMarker
            key={report._id}
            center={[report.coordinates.lat, report.coordinates.lng]}
            radius={8}
            pathOptions={{ 
              color: getColor(report.status, report.priority), 
              fillColor: getColor(report.status, report.priority),
              fillOpacity: 0.7,
              weight: 2
            }}
          >
            <Popup>
              <div className="p-1 min-w-[200px]">
                <h4 className="font-bold text-sm text-gray-900 leading-tight mb-1">{report.title}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    report.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium capitalize">{report.category}</span>
                </div>
                {report.imageUrl && (
                  <img src={report.imageUrl} alt="" className="w-full h-24 object-cover rounded mb-2" />
                )}
                <button 
                  onClick={() => navigate(`/report/${report._id}`)}
                  className="w-full bg-brand hover:bg-brand-dark text-white text-xs font-bold py-1.5 rounded transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapHeatmap;
