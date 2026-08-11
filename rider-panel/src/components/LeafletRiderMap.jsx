import { DELIVERY_RIDER_MARKER_ICON } from '@/lib/mapIcons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  animateRiderMarker,
  createAnimatedRiderMarker,
  createRiderIcon
} from './AnimatedRiderMarker';

const KATHMANDU_STORE = { lat: 27.7074359, lng: 85.2853747, name: 'Jhyaap Station Hub' };
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001';

const SIM_STEP_MS = 3500;       // simulated GPS point every 3.5s (slow, realistic delivery)
const GPS_PUSH_MS = 2000;       // throttle backend pushes to 2s
const GPS_FALLBACK_MS = 5000;   // if no hardware fix within 5s, run demo sim
const NEAR_CUSTOMER_M = 120;    // treat as "near customer" within 120m
const ANIMATION_DURATION = 3200; // slow, smooth glide along the route

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
    const body = {
      lat: position.lat,
      lng: position.lng,
      heading: lastRiderHeadingRef.current || 0,
      status,
      speed: 8,
      accuracy: 10,
    };
    fetch(`${BACKEND_API_URL}/api/v1/tracking/${encodeURIComponent(orderId)}/location`, {
      method: 'PUT',
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

  // --------------------- Start simulation fallback (no GPS fix) ---------------------
  useEffect(() => {
    if (!trackingActive || arrived || hasGpsFixRef.current || isPaused) return;
    gpsFallbackTimerRef.current = setTimeout(() => {
      if (!hasGpsFixRef.current && routeData && routeData.coordinates.length > 1) {
        setIsSimulating(true);
        if (gpsWatchIdRef.current != null) {
          navigator.geolocation.clearWatch(gpsWatchIdRef.current);
          gpsWatchIdRef.current = null;
        }
      }
    }, GPS_FALLBACK_MS);
    return () => { if (gpsFallbackTimerRef.current) clearTimeout(gpsFallbackTimerRef.current); };
  }, [trackingActive, arrived, isPaused, routeData]);

  // Run simulation interval
  useEffect(() => {
    if (!isSimulating || isPaused || arrived) return undefined;
    simTimerRef.current = setInterval(advanceSimulation, SIM_STEP_MS / speed);
    return () => { if (simTimerRef.current) clearInterval(simTimerRef.current); };
  }, [isSimulating, isPaused, arrived, speed, advanceSimulation]);

  // --------------------- Real GPS watch ---------------------
  useEffect(() => {
    if (!orderId || !trackingActive || arrived || !navigator.geolocation) return undefined;

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
        if (error.code !== error.TIMEOUT) {
          console.warn('Live location unavailable:', error.message);
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 30000 }
    );
    gpsWatchIdRef.current = watchId;

    return () => {
      navigator.geolocation.clearWatch(watchId);
      gpsWatchIdRef.current = null;
    };
  }, [orderId, trackingActive, arrived, destPoint, pushLocation]);

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

    riderMarkerRef.current.setIcon(createRiderIcon(nextHeading, trackingActive, trackingActive, true));
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
      url = destinationLocationUrl || `https://www.openstreetmap.org/directions?from=${from.lat},${from.lng}&to=${destLat},${destLng}#map=15/${((from.lat + destLat) / 2)}/${((from.lng + destLng) / 2)}`;
    }
    window.open(url, '_blank');
  };

  const recenterOnRider = () => {
    if (mapInstanceRef.current && riderPosition) {
      mapInstanceRef.current.setView([riderPosition.lat, riderPosition.lng], 16, { animate: true });
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
      <div ref={mapRef} style={{ height, width: '100%' }} className="z-0" />

      {/* Status badge */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000]">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold shadow-lg backdrop-blur-sm bg-black/70 ${badgeColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${arrived ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
          {label}
        </span>
      </div>

      {/* Rider controls */}
      <div className="absolute top-10 left-2 z-[1000] flex flex-col gap-1.5">
        <button
          onClick={() => setIsPaused((v) => !v)}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 shadow-md hover:bg-black/90 transition"
          title={isPaused ? 'Resume Tracking' : 'Pause Tracking'}
        >
          {isPaused ? '▶' : '⏸'}
        </button>
        <button
          onClick={() => setSpeed((s) => Math.max(0.5, +(s - 0.5).toFixed(1)))}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 shadow-md hover:bg-black/90 transition"
          title="Slower"
        >
          −
        </button>
        <button
          onClick={() => setSpeed((s) => Math.min(3, +(s + 0.5).toFixed(1)))}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 shadow-md hover:bg-black/90 transition"
          title="Faster"
        >
          +
        </button>
        <button
          onClick={restartRoute}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 shadow-md hover:bg-black/90 transition"
          title="Restart Route"
        >
          ↺
        </button>
        <button
          onClick={recenterOnRider}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 shadow-md hover:bg-black/90 transition"
          title="Center on Rider"
        >
          ◎
        </button>
      </div>

      {/* Follow rider toggle */}
      <button
        onClick={() => setFollowRider((v) => !v)}
        className={`absolute bottom-24 left-2 z-[1000] text-[10px] font-bold px-2.5 py-1.5 rounded-full border shadow-lg backdrop-blur-sm transition ${
          followRider
            ? 'bg-[#C9A84C] text-[#0F0B08] border-[#C9A84C]'
            : 'bg-black/80 text-gray-300 border-white/15 hover:bg-black/90'
        }`}
      >
        {followRider ? '● Follow Rider' : '○ Follow Rider'}
      </button>

      {/* External nav */}
      <div className="absolute top-2 right-2 z-[1000] flex gap-1.5">
        <button
          onClick={() => openExternalMap('osm')}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 shadow-md hover:bg-black/90 transition"
        >
          OSM
        </button>
        <button
          onClick={() => openExternalMap('google')}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 shadow-md hover:bg-black/90 transition"
        >
          Google
        </button>
        <button
          onClick={() => openExternalMap('osrm')}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 shadow-md hover:bg-black/90 transition"
        >
          Route
        </button>
      </div>

      {/* Live / Simulation indicator */}
      <div className="absolute right-2 bottom-24 z-[1000]">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold bg-black/80 text-gray-300 border border-white/10 backdrop-blur-sm">
          <span className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-sky-400' : hasLiveGps ? 'bg-emerald-400' : 'bg-gray-500'} animate-pulse`} />
          {isLoadingRoute ? 'Routing…' : isSimulating ? 'Demo Movement' : hasLiveGps ? 'Live GPS' : 'Static'}
        </span>
      </div>

      {/* Compact Rider info card (bottom-left) */}
      <div className="absolute bottom-6 left-6 z-[1000]">
        <div className="rounded-xl bg-black/80 backdrop-blur-md border border-white/8 shadow-md p-3 w-[320px] max-w-[90%]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-white/10">
                <img src={DELIVERY_RIDER_MARKER_ICON} alt="Rider" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white leading-4">You <span className="text-[11px] text-amber-400 font-semibold">★4.8</span></div>
                <div className="text-[11px] text-gray-400 truncate">{localStorage.getItem('rider_vehicle') || 'Scooter'}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-bold text-[#C9A84C]">{isLoadingRoute ? '—' : displayDistance}</div>
              <div className="text-[12px] text-gray-300">{isLoadingRoute ? '—' : `${remainingMinutes} min`}</div>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

