import { useEffect, useState, useRef, useCallback } from 'react';
import { X, Navigation, MapPin, Check, Crosshair, Maximize2, Minimize2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCurrentGPSLocation, generateOSMUrl } from '@/lib/locationUtils';

// Custom marker icon for better visibility
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    background-color: #C9A84C;
    width: 30px;
    height: 30px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="
      width: 10px;
      height: 10px;
      background-color: white;
      border-radius: 50%;
      transform: rotate(45deg);
    "></div>
  </div>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
  popupAnchor: [0, -42],
});

// Current location marker icon
const currentLocationIcon = L.divIcon({
  className: 'current-location-marker',
  html: `<div style="
    background-color: #3B82F6;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3);
    animation: pulse 2s infinite;
  "></div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
    </style>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function LocationMapModal({ isOpen, onClose, initialLat, initialLng, onLocationSelect, isLight }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);
  const [currentLat, setCurrentLat] = useState(initialLat || 27.7172); // Default: Kathmandu
  const [currentLng, setCurrentLng] = useState(initialLng || 85.3240);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [address, setAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const hasRequestedLocation = useRef(false);
  const watchIdRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Reverse geocoding using Nominatim (OSM)
  const reverseGeocode = useCallback(async (lat, lng) => {
    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'Jhyaap-Station-App',
          },
        }
      );
      const data = await response.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    } finally {
      setLoadingAddress(false);
    }
  }, []);

  const handleGetCurrentLocation = useCallback(async () => {
    setLoadingLocation(true);
    setLocationError(null);

    try {
      // Clear any existing watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // Check if we're getting GPS or IP-based location
      let hasGPSLocation = false;
      let bestAccuracy = Infinity;
      let bestPosition = null;

      // Use watchPosition for better accuracy
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const acc = position.coords.accuracy;

          // Check if this is a GPS location (accuracy < 1000m)
          if (acc < 1000) {
            hasGPSLocation = true;
          }

          // Keep the best position
          if (acc < bestAccuracy) {
            bestAccuracy = acc;
            bestPosition = { lat, lng, acc };
          }

          setCurrentLat(lat);
          setCurrentLng(lng);
          setAccuracy(acc);

          if (mapInstanceRef.current) {
            // Smooth fly to location
            mapInstanceRef.current.flyTo([lat, lng], 18, {
              duration: 1.5,
            });

            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            }

            // Add current location marker
            if (currentLocationMarkerRef.current) {
              currentLocationMarkerRef.current.remove();
            }
            currentLocationMarkerRef.current = L.marker([lat, lng], {
              icon: currentLocationIcon,
              interactive: false,
            }).addTo(mapInstanceRef.current);
          }

          reverseGeocode(lat, lng);

          // Stop watching after getting a good location (accuracy < 50m)
          if (acc && acc < 50) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
            setLoadingLocation(false);
          }
        },
        (error) => {
          setLoadingLocation(false);
          let errorMessage = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please allow location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          setLocationError(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0,
        }
      );

      // Fallback: stop watching after 15 seconds
      setTimeout(() => {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
          setLoadingLocation(false);

          // Check if we got GPS location
          if (!hasGPSLocation && bestPosition) {
            setLocationError('Could not get GPS location. Using approximate location. Please disable VPN and try again.');
          }
        }
      }, 15000);
    } catch (error) {
      setLocationError(error.message || 'Unable to get your location');
      setLoadingLocation(false);
    }
  }, [reverseGeocode]);

  const handleConfirmLocation = useCallback(() => {
    onLocationSelect(currentLat, currentLng, address);
    onClose();
  }, [currentLat, currentLng, address, onLocationSelect, onClose]);

  // Initialize map when modal opens
  useEffect(() => {
    if (!isOpen) {
      // Cleanup when modal closes
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        currentLocationMarkerRef.current = null;
      }
      // Clear GPS watch
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      isInitializedRef.current = false;
      hasRequestedLocation.current = false;
      // Restore body scroll
      document.body.style.overflow = '';
      return;
    }

    // Prevent body scroll and scroll window to top when modal opens
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!mapRef.current || isInitializedRef.current) return;

      try {
        // Initialize map
        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: false,
        }).setView([currentLat, currentLng], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);

        // Add zoom control
        L.control.zoom({
          position: 'bottomright',
        }).addTo(mapInstanceRef.current);

        // Add initial marker
        markerRef.current = L.marker([currentLat, currentLng], {
          draggable: true,
          icon: customIcon,
        }).addTo(mapInstanceRef.current);

        // Handle marker drag
        markerRef.current.on('dragend', (event) => {
          const marker = event.target;
          const position = marker.getLatLng();
          setCurrentLat(position.lat);
          setCurrentLng(position.lng);
          reverseGeocode(position.lat, position.lng);
        });

        // Handle map click
        mapInstanceRef.current.on('click', (event) => {
          const { lat, lng } = event.latlng;
          setCurrentLat(lat);
          setCurrentLng(lng);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          }
          reverseGeocode(lat, lng);
        });

        // Force map to recalculate size
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);

        isInitializedRef.current = true;

        // Auto-request location if no initial coordinates
        if (!initialLat && !initialLng && !hasRequestedLocation.current) {
          hasRequestedLocation.current = true;
          handleGetCurrentLocation();
        }
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setLocationError('Failed to load map. Please try again.');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, currentLat, currentLng, initialLat, initialLng, handleGetCurrentLocation, reverseGeocode]);

  // Update map when initial coordinates change
  useEffect(() => {
    if (!isOpen || !mapInstanceRef.current || !initialLat || !initialLng) return;
    
    if (initialLat !== currentLat || initialLng !== currentLng) {
      setCurrentLat(initialLat);
      setCurrentLng(initialLng);
      mapInstanceRef.current.setView([initialLat, initialLng], 16);
      if (markerRef.current) {
        markerRef.current.setLatLng([initialLat, initialLng]);
      }
      reverseGeocode(initialLat, initialLng);
    }
  }, [isOpen, initialLat, initialLng, currentLat, currentLng, reverseGeocode]);

  // Handle map resize when toggling full screen
  useEffect(() => {
    if (!isOpen || !mapInstanceRef.current) return;
    
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 100);
  }, [isFullScreen, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2147483647] bg-black/70 backdrop-blur-sm">
      <div
        className={`${
          isFullScreen 
            ? 'fixed inset-0 w-full h-full rounded-none' 
            : 'w-full h-[calc(100vh-180px)] md:h-[75vh] md:max-w-2xl md:rounded-2xl'
        } border shadow-2xl transition-all flex flex-col mx-auto overflow-hidden ${
          isLight ? 'bg-white border-gray-100' : 'bg-[#141414] border-white/10'
        }`}
        style={isFullScreen ? {} : { marginTop: '180px' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 md:p-6 border-b shrink-0">
          <div>
            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-[#C9A84C]">
              Select Location
            </p>
            <p className={`mt-1 text-xs md:text-sm ${isLight ? 'text-gray-600' : 'text-[#DDDDDD]'}`}>
              Drag the map or tap to set your delivery location
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className={`rounded-lg p-2 transition-colors ${
                isLight ? 'text-gray-500 hover:bg-gray-100' : 'text-[#888888] hover:bg-white/5'
              }`}
              aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
              title={isFullScreen ? "Exit full screen" : "Full screen map"}
            >
              {isFullScreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className={`rounded-lg p-2 transition-colors ${
                isLight ? 'text-gray-500 hover:bg-gray-100' : 'text-[#888888] hover:bg-white/5'
              }`}
              aria-label="Close map modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative h-[40vh]">
          <div
            ref={mapRef}
            className="h-full w-full"
            style={{ zIndex: 1 }}
          />
          
          {/* Current Location Button */}
          <button
            onClick={handleGetCurrentLocation}
            disabled={loadingLocation}
            className={`absolute bottom-6 left-4 z-[1000] flex items-center justify-center rounded-full w-14 h-14 text-white transition-all shadow-xl cursor-pointer ${
              loadingLocation
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
            title="Use Current Location"
          >
            <Crosshair className={`w-6 h-6 ${loadingLocation ? 'animate-spin' : ''}`} />
          </button>

          {/* Loading overlay */}
          {loadingLocation && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-[999]">
              <div className={`rounded-xl px-6 py-4 text-sm font-semibold ${
                isLight ? 'bg-white text-gray-900' : 'bg-[#141414] text-white'
              }`}>
                Getting your location...
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {locationError && (
          <div className="mx-4 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-500 shrink-0">
            {locationError}
          </div>
        )}

        {/* Selected Location Info */}
        <div className={`p-4 md:p-6 border-t shrink-0 ${
          isLight ? 'border-gray-200' : 'border-white/10'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-[#C9A84C]" />
            <p className={`text-xs font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              Selected Location
            </p>
          </div>
          
          {/* Address Display */}
          {address ? (
            <div className={`rounded-xl p-3 mb-3 text-xs ${
              isLight ? 'bg-gray-50 text-gray-700' : 'bg-black/30 text-gray-300'
            }`}>
              {address}
            </div>
          ) : loadingAddress ? (
            <div className={`rounded-xl p-3 mb-3 text-xs ${
              isLight ? 'bg-gray-50 text-gray-500' : 'bg-black/30 text-gray-500'
            }`}>
              Loading address...
            </div>
          ) : null}

          <div className={`rounded-xl p-3 md:p-4 font-mono text-xs ${
            isLight ? 'bg-gray-50 text-gray-700' : 'bg-black/30 text-gray-300'
          }`}>
            <div className="flex justify-between">
              <span>Latitude:</span>
              <span className="text-[#C9A84C]">{currentLat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Longitude:</span>
              <span className="text-[#C9A84C]">{currentLng.toFixed(6)}</span>
            </div>
            {accuracy !== null && (
              <div className="flex justify-between mt-1">
                <span>Accuracy:</span>
                <span className={accuracy < 50 ? 'text-green-500' : 'text-yellow-500'}>
                  {accuracy < 10 ? '<10m' : `~${Math.round(accuracy)}m`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`flex gap-3 p-4 md:p-6 border-t shrink-0 ${
          isLight ? 'border-gray-200' : 'border-white/10'
        }`}>
          <button
            onClick={onClose}
            className={`flex-1 py-4 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all ${
              isLight
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-white/5 text-[#888888] hover:bg-white/10'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmLocation}
            className="flex-1 bg-[#C9A84C] text-black py-4 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
          >
            <Check className="h-4 w-4" />
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}

export default LocationMapModal;
