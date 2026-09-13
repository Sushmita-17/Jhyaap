import { DELIVERY_RIDER_MARKER_ICON } from '@/lib/mapIcons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Phone } from 'lucide-react';
import {
  animateRiderMarker,
  createAnimatedRiderMarker,
  createRiderIcon
} from './AnimatedRiderMarker';

const KATHMANDU_STORE = { lat: 27.7074359, lng: 85.2853747, name: 'Jhyaap Station Hub' };
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001';

const SIM_STEP_MS = 2000;       // simulated GPS point every 2s (smoother tracking)
const GPS_PUSH_MS = 1500;       // throttle backend pushes to 1.5s (more frequent updates)
const GPS_FALLBACK_MS = 3000;   // if no hardware fix within 3s, run demo sim
const NEAR_CUSTOMER_M = 120;    // treat as "near customer" within 120m
const ANIMATION_DURATION = 1500; // faster, smoother glide along the route (Google Maps-like)

// ---------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------
function calculateHeading(from, to) {
  if (!from || !to) return 45;
  const dy = to.lat - from.lat;
  const dx = (to.lng - from.lng) * Math.cos((from.lat * Math.PI) / 180);
  if (Math.abs(dx) < 0.000001 && Math.abs(dy) < 0.000001) return 45;
  const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
  return Math.round((angle + 360) % 360);
}

function calculateDistance(from, to) {
  const R = 6371e3;
  const phi1 = (from.lat * Math.PI) / 180;
  const phi2 = (to.lat * Math.PI) / 180;
  const deltaPhi = ((to.lat - from.lat) * Math.PI) / 180;
  const deltaLambda = ((to.lng - from.lng) * Math.PI) / 180;
  const a = Math.sin(deltaPhi / 2) ** 2 +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculateRouteDistance(coords) {
  let total = 0;
  for (let i = 0; i < coords.length - 1; i += 1) total += calculateDistance(coords[i], coords[i + 1]);
  return total;
}

function decodePolyline(encoded) {
  const coordinates = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += deltaLat;
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += deltaLng;
    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return coordinates;
}

async function fetchRoute(from, to) {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=polyline&steps=true&alternatives=false`
    );
    const data = await response.json();
    if (data.code === 'Ok' && data.routes.length > 0) {
      const coordinates = decodePolyline(data.routes[0].geometry);
      return {
        coordinates,
        steps: data.routes[0].legs?.[0]?.steps || [],
        distance: data.routes[0].distance,
        duration: data.routes[0].duration,
      };
    }
    return null;
  } catch (error) {
    console.error('OSRM route error:', error);
    return null;
  }
}

// ---------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------
// Only start GPS tracking when rider actually picks up order and starts delivery
const ACTIVE_STATUSES = ['out_for_delivery', 'picked_up'];

function statusLabel(orderStatus, nearCustomer, arrived) {
  if (arrived || orderStatus === 'delivered') return 'Delivered';
  if (orderStatus === 'accepted' || orderStatus === 'preparing') return 'Going to pickup';
  if (nearCustomer) return 'Near customer';
  if (orderStatus === 'out_for_delivery' || orderStatus === 'picked_up') return 'Out for delivery';
  return 'Order placed';
}

function statusColor(orderStatus, nearCustomer, arrived) {
  if (arrived || orderStatus === 'delivered') return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
  if (nearCustomer) return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
  if (orderStatus === 'out_for_delivery' || orderStatus === 'picked_up') return 'bg-blue-500/15 text-blue-300 border-blue-500/40';
  return 'bg-gray-500/15 text-gray-300 border-gray-500/40';
}

// ---------------------------------------------------------------
// Main component
// ---------------------------------------------------------------
export default function LeafletRiderMap({
  orderId,
  orderStatus = 'pending',
  destinationLat,
  destinationLng,
  destinationName,
  destinationLocationUrl,
  customerName,
  customerPhone,
  height = '88vh',
  manualProgress = 0,
  onProgressUpdate,
  onStatusUpdate,
}) {
  const destLat = Number.isFinite(Number(destinationLat)) ? Number(destinationLat) : 27.6915;
  const destLng = Number.isFinite(Number(destinationLng)) ? Number(destinationLng) : 85.3410;
  const destPoint = { lat: destLat, lng: destLng };
  const trackingActive = ACTIVE_STATUSES.includes(orderStatus);

  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const animationCancelRef = useRef(null);
  const routePolylineRef = useRef(null);
  const traveledPolylineRef = useRef(null);
  const storeMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);

const [routeData, setRouteData] = useState(null);
  const [routeOrigin, setRouteOrigin] = useState(KATHMANDU_STORE);
  const [riderPosition, setRiderPosition] = useState(KATHMANDU_STORE);
  const [heading, setHeading] = useState(45);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [followRider, setFollowRider] = useState(true);
  const [hasLiveGps, setHasLiveGps] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [nearCustomer, setNearCustomer] = useState(false);
  const [arrived, setArrived] = useState(orderStatus === 'delivered');
  const [locationError, setLocationError] = useState(null);
  const [isMapCenteredOnRider, setIsMapCenteredOnRider] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const lastRiderPositionRef = useRef(KATHMANDU_STORE);
  const lastRiderHeadingRef = useRef(45);
  const simTimerRef = useRef(null);
  const gpsFallbackTimerRef = useRef(null);
  const gpsWatchIdRef = useRef(null);
  const gpsPushTimerRef = useRef(null);
  const routeIndexRef = useRef(0);
  const lastPushedPositionRef = useRef(null);
  const hasGpsFixRef = useRef(false);
  const isDeliveredRef = useRef(orderStatus === 'delivered');
  const gpsOriginRef = useRef(null);
  const routeFetchedFromGpsRef = useRef(false);
  const locationRequestIdRef = useRef(0);

  // --------------------- Map init ---------------------
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [KATHMANDU_STORE.lat, KATHMANDU_STORE.lng],
      zoom: 15,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 12,
    }).addTo(map);

    const storeIcon = L.divIcon({
      className: 'jhyaap-leaflet-store-icon',
      html: '<div class="jhyaap-store-pin">Jhyaap Station Hub</div>',
      iconSize: [110, 28],
      iconAnchor: [55, 14],
    });
    const storeMarker = L.marker([KATHMANDU_STORE.lat, KATHMANDU_STORE.lng], { icon: storeIcon }).addTo(map);
    storeMarkerRef.current = storeMarker;

    const destIcon = L.divIcon({
      className: 'jhyaap-leaflet-destination-icon',
      html: '<div class="jhyaap-destination-pin"></div>',
      iconSize: [26, 26],
      iconAnchor: [13, 26],
    });
    const destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);
    destMarkerRef.current = destMarker;

    map.fitBounds(
      L.latLngBounds([
        [KATHMANDU_STORE.lat, KATHMANDU_STORE.lng],
        [destLat, destLng],
      ]),
      { padding: [70, 70], maxZoom: 16 }
    );

    // Track map movement to update centered state
    map.on('moveend', () => {
      if (riderPosition && map) {
        const center = map.getCenter();
        const distance = calculateDistance(
          { lat: center.lat, lng: center.lng },
          riderPosition
        );
        setIsMapCenteredOnRider(distance < 50); // Consider centered if within 50m
      }
    });

    mapInstanceRef.current = map;
    setMap(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMap(null);
      [storeMarkerRef, destMarkerRef, routePolylineRef, traveledPolylineRef].forEach((ref) => {
        if (ref.current) { ref.current.remove?.(); ref.current = null; }
      });
      if (riderMarkerRef.current) { riderMarkerRef.current.remove(); riderMarkerRef.current = null; }
      if (animationCancelRef.current) { animationCancelRef.current(); animationCancelRef.current = null; }
    };
  }, [destLat, destLng]);

// --------------------- Fetch OSRM route ---------------------
  useEffect(() => {
    let cancelled = false;
    const loadRoute = async () => {
      setIsLoadingRoute(true);
      const origin = routeOrigin || KATHMANDU_STORE;
      const route = await fetchRoute(origin, destPoint);
      if (cancelled) return;
      if (route && route.coordinates.length > 0) {
        setRouteData(route);
        setRiderPosition(route.coordinates[0]);
        lastRiderPositionRef.current = route.coordinates[0];
        if (route.coordinates.length > 1) {
          const initialHeading = calculateHeading(route.coordinates[0], route.coordinates[1]);
          setHeading(initialHeading);
          lastRiderHeadingRef.current = initialHeading;
        }
        if (mapInstanceRef.current) {
          if (routePolylineRef.current) {
            routePolylineRef.current.remove();
            routePolylineRef.current = null;
          }
          const polyline = L.polyline(
            route.coordinates.map((c) => [c.lat, c.lng]),
            { color: '#f59e0b', weight: 3, opacity: 0.9, smoothFactor: 1, lineCap: 'round', lineJoin: 'round' }
          ).addTo(mapInstanceRef.current);
          routePolylineRef.current = polyline;
          // Fit map to route bounds but avoid zooming out too far
          try {
            mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [70, 70], maxZoom: 16 });
          } catch (e) {
            // ignore
          }
        }
      } else {
        console.error('Failed to fetch route');
      }
      setIsLoadingRoute(false);
    };
    loadRoute();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeOrigin, destLat, destLng]);

  // --------------------- Push location to backend (throttled) ---------------------
  const pushLocation = useCallback((position, status) => {
    if (!orderId || !trackingActive || isDeliveredRef.current) return;
    const now = Date.now();
    const last = lastPushedPositionRef.current;
    if (last && now - last.ts < GPS_PUSH_MS) return;
    lastPushedPositionRef.current = { ts: now };

    const token = localStorage.getItem('jhyaap_rider_token');
    const riderId = localStorage.getItem('jhyaap_rider_id');
    
    // Skip location update if rider is not logged in
    if (!riderId) return;
    
    const body = {
      rider_id: riderId,
      latitude: position.lat,
      longitude: position.lng,
      heading: lastRiderHeadingRef.current || 0,
      speed: 8,
      accuracy: 10,
    };
    fetch(`${BACKEND_API_URL}/api/v1/location/rider/${riderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    }).catch((err) => console.warn('Unable to send rider location:', err));
  }, [orderId, trackingActive]);

  // --------------------- Simulation advance ---------------------
  const advanceSimulation = useCallback(() => {
    if (!routeData || routeData.coordinates.length === 0) return;
    const coords = routeData.coordinates;
    const nextIndex = Math.min(routeIndexRef.current + 1, coords.length - 1);
    const nextPos = coords[nextIndex];
    const prevPos = coords[Math.max(0, nextIndex - 1)];

    setRiderPosition(nextPos);
    setHeading(calculateHeading(prevPos, nextPos));
    routeIndexRef.current = nextIndex;

    const distToDest = calculateDistance(nextPos, destPoint);
    if (distToDest <= NEAR_CUSTOMER_M) setNearCustomer(true);
    if (distToDest <= 35) {
      // arrived - stop simulation
      setIsSimulating(false);
      setArrived(true);
      onStatusUpdate?.('delivered');
      pushLocation(nextPos, 'arrived');
      return;
    }
    pushLocation(nextPos, nearCustomer ? 'near_customer' : 'driving');

    // Finished route but not considered arrived -> nudge toward dest
    if (nextIndex >= coords.length - 1 && distToDest > 35) {
      setRiderPosition(destPoint);
      setHeading(calculateHeading(coords[coords.length - 1], destPoint));
    }
  }, [routeData, destPoint, nearCustomer, pushLocation, onStatusUpdate]);

  // --------------------- Get current location ---------------------
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    // Generate unique request ID to prevent race conditions
    const currentRequestId = ++locationRequestIdRef.current;
    
    setIsLocating(true);
    setLocationError(null);
    
    // Stop any ongoing simulation
    setIsSimulating(false);
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    
    // Stop any existing GPS watch to prevent conflicts
    if (gpsWatchIdRef.current) {
      navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }
    
    // Get current position - single call with no timeout error
    // If GPS fails, simulation continues as fallback
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Check if this is still the current request
        if (currentRequestId !== locationRequestIdRef.current) {
          console.log('Ignoring old location request');
          return;
        }
        
        const { latitude, longitude } = position.coords;
        
        // Validate coordinates
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
            latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          console.error('Invalid GPS coordinates:', { latitude, longitude });
          setIsLocating(false);
          // Don't show error - let simulation continue
          return;
        }
        
        const currentPos = { lat: latitude, lng: longitude };
        
        console.log('GPS Location obtained:', currentPos);
        
        // Clear error state immediately on success
        setLocationError(null);
        
        // Update state immediately
        setRiderPosition(currentPos);
        setRouteOrigin(currentPos);
        gpsOriginRef.current = currentPos;
        routeIndexRef.current = 0;
        setHasLiveGps(true);
        hasGpsFixRef.current = true;
        setIsMapCenteredOnRider(true);
        setIsLocating(false);
        
        // Center map immediately with smooth animation using coordinates directly
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 17, {
            animate: true,
            duration: 1.5
          });
        }
        
        // Start simulation to move scooter from current location to customer
        // Force simulation even if hasGpsFix is true
        if (routeData && routeData.coordinates.length > 1) {
          setIsSimulating(true);
          // Don't reset hasGpsFix - let simulation run with GPS active
        }
        
        // Start watching position for live GPS tracking (like Google Maps)
        if (gpsWatchIdRef.current === null) {
          const watchId = navigator.geolocation.watchPosition(
            (watchPosition) => {
              const { latitude: watchLat, longitude: watchLng } = watchPosition.coords;
              
              // Validate watch coordinates
              if (!Number.isFinite(watchLat) || !Number.isFinite(watchLng)) return;
              
              const newPos = { lat: watchLat, lng: watchLng };
              
              // Update rider position in real-time
              setRiderPosition(newPos);
              gpsOriginRef.current = newPos;
              
              // Update heading if available
              if (Number.isFinite(watchPosition.coords.heading)) {
                setHeading(watchPosition.coords.heading);
                lastRiderHeadingRef.current = watchPosition.coords.heading;
              }
              
              // Calculate distance to destination
              const distToDest = calculateDistance(newPos, destPoint);
              if (distToDest <= NEAR_CUSTOMER_M) setNearCustomer(true);
              if (distToDest <= 35) {
                setArrived(true);
                setIsSimulating(false);
                onStatusUpdate?.('delivered');
                pushLocation(newPos, 'arrived');
              } else {
                pushLocation(newPos, nearCustomer ? 'near_customer' : 'driving');
              }
              
              // Stop simulation when live GPS is active
              setIsSimulating(false);
            },
            (watchError) => {
              // Silently ignore GPS watch errors
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
          );
          gpsWatchIdRef.current = watchId;
        }
      },
      (error) => {
        // Check if this is still the current request
        if (currentRequestId !== locationRequestIdRef.current) {
          console.log('Ignoring old location error');
          return;
        }
        
        setIsLocating(false);
        
        // Only show permission denied error - let simulation continue for other errors
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location access is required to show your current position. Please allow location access in your browser settings.');
        } else {
          // For timeout, unavailable, etc - just let simulation continue
          console.log('GPS not available, continuing with simulation');
          setLocationError(null);
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, [destPoint, pushLocation]);

  // --------------------- Start simulation immediately ---------------------
  useEffect(() => {
    if (arrived || isPaused) return;
    // Start simulation immediately for instant feedback
    // GPS will override if it gets a fix
    if (routeData && routeData.coordinates.length > 1) {
      setIsSimulating(true);
    }
  }, [arrived, isPaused, routeData]);

  // Run simulation interval
  useEffect(() => {
    if (!isSimulating || isPaused || arrived) return undefined;
    simTimerRef.current = setInterval(advanceSimulation, SIM_STEP_MS / speed);
    return () => { if (simTimerRef.current) clearInterval(simTimerRef.current); };
  }, [isSimulating, isPaused, arrived, speed, advanceSimulation]);

  // --------------------- Real GPS watch ---------------------
  useEffect(() => {
    // Don't start automatic watch if user is manually requesting location
    if (!orderId || arrived || !navigator.geolocation || isLocating) return undefined;

    const watchId = navigator.geolocation.watchPosition(
({ coords }) => {
        hasGpsFixRef.current = true;
        setHasLiveGps(true);
        setIsSimulating(false);
        const position = { lat: coords.latitude, lng: coords.longitude };

        // First live GPS fix: treat the rider's current position as the route origin
        // so the driver can test from their own location to the customer destination.
        const prevOrigin = gpsOriginRef.current;
        const movedSignificantly =
          !prevOrigin ||
          calculateDistance(prevOrigin, position) > 50; // 50m threshold to avoid re-routing on jitter
        if (movedSignificantly) {
          gpsOriginRef.current = position;
          setRouteOrigin(position);
          routeIndexRef.current = 0;
        }

        setRiderPosition(position);
        if (Number.isFinite(coords.heading)) {
          setHeading(coords.heading);
          lastRiderHeadingRef.current = coords.heading;
        }
        const distToDest = calculateDistance(position, destPoint);
        if (distToDest <= NEAR_CUSTOMER_M) setNearCustomer(true);
        if (distToDest <= 35) setArrived(true);
        pushLocation(position, distToDest <= 35 ? 'arrived' : 'driving');
      },
      (error) => {
        // Silently ignore GPS watch errors
      },
      { enableHighAccuracy: false, maximumAge: 10000, timeout: 15000 }
    );
    gpsWatchIdRef.current = watchId;

    return () => {
      navigator.geolocation.clearWatch(watchId);
      gpsWatchIdRef.current = null;
    };
  }, [orderId, trackingActive, arrived, destPoint, pushLocation, isLocating]);

  // --------------------- Smooth marker animation ---------------------
  useEffect(() => {
    if (!map || !mapInstanceRef.current) return;

    if (!riderMarkerRef.current) {
      riderMarkerRef.current = createAnimatedRiderMarker(mapInstanceRef.current, {
        position: riderPosition,
        heading,
        showPulse: trackingActive,
        isDriving: trackingActive,
        isSelfView: true,
      });
      lastRiderPositionRef.current = riderPosition;
      lastRiderHeadingRef.current = heading;
      return;
    }

    const previous = lastRiderPositionRef.current;
    const next = riderPosition;
    const nextHeading = heading;

    if (animationCancelRef.current) {
      animationCancelRef.current();
      animationCancelRef.current = null;
    }

    riderMarkerRef.current.setIcon(createRiderIcon(nextHeading, trackingActive, false, true));
    const routePoints = (routeData?.coordinates || []).map((c) => [c.lat, c.lng]);

    animationCancelRef.current = animateRiderMarker({
      marker: riderMarkerRef.current,
      from: previous,
      to: next,
      route: routePoints,
      duration: isPaused ? 3000 : ANIMATION_DURATION,
      onComplete: ({ bearing }) => {
        lastRiderPositionRef.current = next;
        lastRiderHeadingRef.current = bearing;
        if (followRider && mapInstanceRef.current && !arrived) {
          mapInstanceRef.current.panTo([next.lat, next.lng], { animate: true, duration: 1 });
        }
      },
    });

    return () => {
      if (animationCancelRef.current) {
        animationCancelRef.current();
        animationCancelRef.current = null;
      }
    };
  }, [map, riderPosition, heading, routeData, trackingActive, isPaused, followRider, arrived]);

  // --------------------- Clean up GPS watcher on unmount ---------------------
  useEffect(() => {
    return () => {
      if (gpsWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        gpsWatchIdRef.current = null;
      }
    };
  }, []);

  // --------------------- Track order status changes ---------------------
  useEffect(() => {
    if (orderStatus === 'delivered') {
      isDeliveredRef.current = true;
      setIsSimulating(false);
      setArrived(true);
      onStatusUpdate?.('delivered');
    } else {
      isDeliveredRef.current = false;
    }
  }, [orderStatus, onStatusUpdate]);

  // --------------------- Auto-request location on map load ---------------------
  useEffect(() => {
    if (!mapInstanceRef.current || isLocating || hasLiveGps || arrived) return;
    
    // Don't auto-fetch location - let user click button or use simulation
    // Simulation will start automatically after GPS_FALLBACK_MS if no GPS fix
  }, [map, arrived]);

  // --------------------- Invalidate map size on full screen toggle ---------------------
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  }, [isFullScreen]);

  // --------------------- Derived values ---------------------
  const totalDistance = routeData?.distance || (routeData ? calculateRouteDistance(routeData.coordinates) : 0);
  const progress = routeData && routeData.coordinates.length > 1
    ? Math.min(1, routeIndexRef.current / (routeData.coordinates.length - 1))
    : manualProgress / 100;
  const remainingDistance = Math.max(0, totalDistance * (1 - progress));
  const remainingMinutes = routeData ? Math.max(1, Math.round((routeData.duration / 60) * (1 - progress))) : 0;
  const displayDistance = remainingDistance > 1000
    ? `${(remainingDistance / 1000).toFixed(1)} km`
    : `${Math.round(remainingDistance)} m`;

  const label = statusLabel(orderStatus, nearCustomer, arrived);
  const badgeColor = statusColor(orderStatus, nearCustomer, arrived);

  const openExternalMap = (provider = 'osm') => {
    const from = riderPosition || KATHMANDU_STORE;
    let url;
    if (provider === 'google') {
      url = `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${destLat},${destLng}&travelmode=driving`;
    } else if (provider === 'osrm') {
      url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${destLng},${destLat}?overview=full&geometries=geojson`;
    } else {
      // OSM with rider position and full map view
      url = `https://www.openstreetmap.org/directions?from=${from.lat},${from.lng}&to=${destLat},${destLng}#map=16/${from.lat}/${from.lng}`;
    }
    window.open(url, '_blank');
  };

  const recenterOnRider = () => {
    if (mapInstanceRef.current && riderPosition) {
      mapInstanceRef.current.setView([riderPosition.lat, riderPosition.lng], 17, { animate: true });
      setIsMapCenteredOnRider(true);
    }
  };

  const restartRoute = () => {
    if (!routeData || routeData.coordinates.length === 0) return;
    routeIndexRef.current = 0;
    setNearCustomer(false);
    setArrived(false);
    isDeliveredRef.current = false;
    setRiderPosition(routeData.coordinates[0]);
    setHeading(routeData.coordinates.length > 1
      ? calculateHeading(routeData.coordinates[0], routeData.coordinates[1])
      : 45);
    setFollowRider(true);
    if (!hasLiveGps) setIsSimulating(true);
  };

  const progressPercent = Math.round((progress || 0) * 100);

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#2a221c] bg-[#0F0B08]">
      <div ref={mapRef} style={{ height: isFullScreen ? '100vh' : height, width: '100%' }} className="z-0" />

      {/* Full Map button - mobile only */}
      <div className="absolute top-2 right-2 z-[1000] md:hidden">
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="bg-white/90 text-gray-800 text-[10px] font-bold px-2 py-1 rounded border border-gray-300 shadow-md hover:bg-white transition"
        >
          {isFullScreen ? 'Exit Full' : 'Full Map'}
        </button>
      </div>

      {/* Current Location Button - Right side (Google Maps style) */}
      <button
        onClick={getCurrentLocation}
        disabled={isLocating}
        className={`absolute bottom-24 right-2 z-[1000] w-12 h-12 rounded-full shadow-lg backdrop-blur-sm transition flex items-center justify-center ${
          isMapCenteredOnRider && hasLiveGps
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-black/80 text-blue-400 border-blue-400/30 hover:bg-black/90'
        } ${isLocating ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isLocating ? 'Getting location...' : 'My Location'}
      >
        {isLocating ? (
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        )}
      </button>

      {/* Getting Location Message */}
      {isLocating && (
        <div className="absolute bottom-40 right-2 z-[1000]">
          <div className="bg-black/90 text-white text-[11px] px-3 py-2 rounded-lg border border-blue-400/30 shadow-lg backdrop-blur-sm">
            Getting your location...
          </div>
        </div>
      )}

      {/* Location Error Message */}
      {locationError && (
        <div className="absolute top-20 right-2 z-[1000] max-w-[200px]">
          <div className="bg-red-900/90 text-white text-[10px] p-2 rounded-lg border border-red-500/30 shadow-lg backdrop-blur-sm">
            {locationError}
            <button
              onClick={() => setLocationError(null)}
              className="ml-2 text-red-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}




      {/* Compact Rider info card (bottom-left) - white */}
      <div className="absolute bottom-6 left-6 z-[1000] md:bottom-6 md:left-6 bottom-28 left-2">
        <div className="rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-md p-1 w-[100px] max-w-[65%] md:w-[320px] md:p-3 md:max-w-[90%]">
          <div className="flex items-center justify-between gap-1 md:gap-3">
            <div className="flex items-center gap-1 md:gap-3">
              <div className="w-4 h-4 md:w-8 md:h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                <img src={DELIVERY_RIDER_MARKER_ICON} alt="Rider" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0 hidden md:block">
                <div className="text-sm font-bold text-gray-900 leading-4">You <span className="text-[11px] text-amber-500 font-semibold">★4.8</span></div>
                <div className="text-[11px] text-gray-600 truncate">{localStorage.getItem('rider_vehicle') || 'Scooter'}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[9px] md:text-sm font-bold text-amber-600">{isLoadingRoute ? '—' : displayDistance}</div>
              <div className="text-[8px] md:text-[12px] text-gray-600">{isLoadingRoute ? '—' : `${remainingMinutes} min`}</div>
            </div>
          </div>
          <div className="hidden md:block mt-2 text-[11px] text-gray-500">{label}</div>
        </div>
      </div>

      {/* Customer info card (bottom-right) - smaller white card */}
      {customerName && (
        <div className="absolute bottom-6 right-6 z-[1000] md:bottom-6 md:right-6 bottom-14 right-2">
          <div className="rounded-lg bg-white/95 backdrop-blur-md border border-gray-200 shadow-md p-2 w-[200px] max-w-[80%] md:w-[220px] md:max-w-[85%]">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-gray-900 leading-3">{customerName}</div>
                {customerPhone && (
                  <div className="text-[9px] text-gray-600">{customerPhone}</div>
                )}
              </div>
              {customerPhone && (
                <a
                  href={`tel:${customerPhone}`}
                  className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition"
                  title="Call Customer"
                >
                  <Phone size={10} />
                </a>
              )}
            </div>
            {destinationName && (
              <div className="mt-1 text-[8px] text-gray-500 truncate">{destinationName}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

