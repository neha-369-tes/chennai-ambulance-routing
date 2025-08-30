import { useEffect, useRef, useState } from 'react';
import type { HospitalWithRoute } from '@shared/schema';
import { CHENNAI_CENTER } from '@/lib/hospitals';
import { CHENNAI_TRAFFIC_ZONES } from '@/lib/routing';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface EmergencyMapProps {
  hospitals: HospitalWithRoute[];
  selectedHospital: HospitalWithRoute | null;
  emergencyLocation: { lat: number; lng: number } | null;
  onHospitalSelect: (hospital: HospitalWithRoute) => void;
  className?: string;
}

export default function EmergencyMap({ 
  hospitals, 
  selectedHospital, 
  emergencyLocation,
  onHospitalSelect,
  className = "" 
}: EmergencyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet to ensure it loads properly
        const L = (await import('leaflet')).default;
        
        // Fix for default markers in React
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        const map = L.map(mapRef.current!, {
          center: [CHENNAI_CENTER.lat, CHENNAI_CENTER.lng],
          zoom: 12,
          zoomControl: false
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Add zoom control to top right
        L.control.zoom({
          position: 'topright'
        }).addTo(map);

        mapInstanceRef.current = map;
        setIsMapReady(true);

      } catch (error) {
        console.error('Failed to initialize map:', error);
      }
    };

    initializeMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Add hospital markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const map = mapInstanceRef.current;
    const L = (window as any).L;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Create hospital markers
    hospitals.forEach((hospital) => {
      const isSelected = selectedHospital?.id === hospital.id;
      
      // Create custom hospital icon
      const hospitalIcon = L.divIcon({
        className: 'custom-hospital-marker',
        html: `
          <div class="relative">
            <div class="w-8 h-8 rounded-full ${isSelected ? 'bg-primary' : 'bg-success'} 
                        border-2 border-white shadow-lg flex items-center justify-center
                        ${isSelected ? 'scale-110' : ''} transition-all duration-200 hospital-marker">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z"></path>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([hospital.latitude, hospital.longitude], { 
        icon: hospitalIcon 
      }).addTo(map);

      // Create popup with hospital details
      const popupContent = `
        <div class="p-3 min-w-64">
          <h3 class="font-semibold text-lg mb-2">${hospital.name}</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Distance:</span>
              <span class="font-medium">${hospital.distance} km</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">ETA:</span>
              <span class="font-medium text-${hospital.estimated_time <= 10 ? 'success' : hospital.estimated_time <= 15 ? 'warning' : 'destructive'}">${hospital.estimated_time} min</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Capacity:</span>
              <span class="font-medium">${hospital.capacity}</span>
            </div>
            <div class="pt-2">
              <button onclick="window.selectHospital('${hospital.id}')" 
                      class="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Select Hospital
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle marker click
      marker.on('click', () => {
        onHospitalSelect(hospital);
      });
    });

    // Add global function for popup button clicks
    (window as any).selectHospital = (hospitalId: string) => {
      const hospital = hospitals.find(h => h.id === hospitalId);
      if (hospital) {
        onHospitalSelect(hospital);
      }
    };

  }, [hospitals, selectedHospital, isMapReady, onHospitalSelect]);

  // Add emergency location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !emergencyLocation) return;

    const map = mapInstanceRef.current;
    const L = (window as any).L;

    // Remove existing emergency marker
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && layer.options.emergency) {
        map.removeLayer(layer);
      }
    });

    // Create emergency location icon
    const emergencyIcon = L.divIcon({
      className: 'custom-emergency-marker',
      html: `
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-destructive border-2 border-white shadow-lg 
                      flex items-center justify-center animate-pulse">
            <svg class="w-6 h-6 text-destructive-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const emergencyMarker = L.marker([emergencyLocation.lat, emergencyLocation.lng], { 
      icon: emergencyIcon,
      emergency: true
    }).addTo(map);

    emergencyMarker.bindPopup(`
      <div class="p-3">
        <h3 class="font-semibold text-lg mb-2 text-destructive">Emergency Location</h3>
        <p class="text-sm text-muted-foreground">Lat: ${emergencyLocation.lat.toFixed(4)}, Lng: ${emergencyLocation.lng.toFixed(4)}</p>
      </div>
    `);

    // Center map on emergency location
    map.setView([emergencyLocation.lat, emergencyLocation.lng], 13);

  }, [emergencyLocation, isMapReady]);

  // Add route visualization
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || !selectedHospital || !emergencyLocation) return;

    const map = mapInstanceRef.current;
    const L = (window as any).L;

    // Remove existing route polylines
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    if (selectedHospital.route_coordinates) {
      const polyline = L.polyline(selectedHospital.route_coordinates, {
        color: '#e11d48', // primary color
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 5',
        className: 'route-line'
      }).addTo(map);

      // Fit map to show the entire route
      const bounds = L.latLngBounds([
        [emergencyLocation.lat, emergencyLocation.lng],
        [selectedHospital.latitude, selectedHospital.longitude]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [selectedHospital, emergencyLocation, isMapReady]);

  // Add traffic congestion zones
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const map = mapInstanceRef.current;
    const L = (window as any).L;

    // Remove existing traffic zones
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Circle && layer.options.traffic) {
        map.removeLayer(layer);
      }
    });

    // Add traffic congestion zones
    CHENNAI_TRAFFIC_ZONES.forEach((zone) => {
      const color = zone.factor >= 1.4 ? '#ef4444' : zone.factor >= 1.2 ? '#f59e0b' : '#10b981';
      
      L.circle([zone.lat, zone.lng], {
        radius: zone.radius * 1000, // Convert km to meters
        color: color,
        fillColor: color,
        fillOpacity: 0.1,
        weight: 2,
        opacity: 0.3,
        traffic: true
      }).addTo(map).bindPopup(`
        <div class="p-2">
          <h4 class="font-semibold">${zone.name}</h4>
          <p class="text-sm text-muted-foreground">Traffic Factor: ${zone.factor}x</p>
        </div>
      `);
    });

  }, [isMapReady]);

  return (
    <div className={`map-container relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        data-testid="emergency-map"
      />
      
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-700 rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <p className="text-muted-foreground">Chennai Emergency Map Loading...</p>
            <p className="text-sm text-muted-foreground mt-2">Initializing hospital database and routing engine</p>
          </div>
        </div>
      )}

      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 space-y-2 z-[1000]">
        {/* Traffic Status Indicator */}
        <div className="glass-effect rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Traffic Status</span>
          </div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">T.Nagar</span>
              <span className="text-destructive font-medium">Heavy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Anna Salai</span>
              <span className="text-warning font-medium">Moderate</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vadapalani</span>
              <span className="text-success font-medium">Light</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Route Overlay */}
      {selectedHospital && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-96 z-[1000]">
          <div className="glass-effect rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Active Route</h3>
              <div className="flex items-center space-x-1 text-success">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">En Route</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Destination:</span>
                <span className="text-sm font-medium text-foreground">{selectedHospital.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Distance:</span>
                <span className="text-sm font-medium text-foreground">{selectedHospital.distance} km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ETA:</span>
                <span className={`text-lg font-bold ${selectedHospital.estimated_time <= 10 ? 'text-success' : selectedHospital.estimated_time <= 15 ? 'text-warning' : 'text-destructive'}`}>
                  {selectedHospital.estimated_time} min
                </span>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Next Update:</span>
                  <span className="text-xs font-medium text-foreground">30 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
