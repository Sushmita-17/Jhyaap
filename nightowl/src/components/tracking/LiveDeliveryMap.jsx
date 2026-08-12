import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { estimateEtaMinutes, VALLEY_MAP_CENTER } from '@/lib/deliveryLocations';
import { DELIVERY_AREAS } from '@/data/deliveryAreas';
import { ExternalLink, MapPin, Navigation, Store, ZoomIn, ZoomOut } from 'lucide-react';
import { BIKE_RIDER_MARKER_ICON } from '@/lib/mapIcons';
import AnimatedRiderMarker from './AnimatedRiderMarker';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001';
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

// Fetch actual route from OSRM for realistic road following
async function fetchRoute(from, to) {
  if (!from?.lat || !to?.lat) return [];
  try {
    const url = `${OSRM_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    return (data.routes?.[0]?.geometry?.coordinates ?? []).map(([lng, lat]) => [lat, lng]);
  } catch (error) {
    console.warn('Failed to fetch route:', error);
    return [];
  }
}

// Calculate distance between two coordinates in meters
function calculateDistance(from, to) {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (from.lat * Math.PI) / 180;
  const phi2 = (to.lat * Math.PI) / 180;
  const deltaPhi = ((to.lat - from.lat) * Math.PI) / 180;
  const deltaLambda = ((to.lng - from.lng) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Create CircleMarker component manually to avoid import issues
const CircleMarker = ({ center, radius, pathOptions, children }) => {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const marker = L.circleMarker(center, {
      radius,
      ...pathOptions
    });

    marker.addTo(map);
    markerRef.current = marker;

    return () => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
    };
  }, [map, center, radius, pathOptions]);

  return children ? <Tooltip>{children}</Tooltip> : null;
};

// Component to handle auto-fitting the map to the bounds of all markers
function MapBoundsFit({ store, destination, rider, showAllAreas }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([store.lat, store.lng], [destination.lat, destination.lng]);
    if (rider) {
      bounds.extend([rider.lat, rider.lng]);
    }

    // If showAllAreas is true, extend the camera view to ensure the entire valley (all 3 cities) is visible on screen
    if (showAllAreas) {
      DELIVERY_AREAS.forEach(area => {
        bounds.extend([area.lat, area.lng]);
      });
    }

    // Pad the bounds slightly so markers aren't touching the edge
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: showAllAreas ? 13 : 15 });
  }, [map, store, destination, rider?.lat, rider?.lng, showAllAreas]);

  return null;
}

// Component to expose map instance for zoom controls
function MapController({ onMapReady }) {
  const map = useMap();
  
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  return null;
}

const storeIcon = L.divIcon({
  className: 'nightowl-map-marker',
  html: '<div class="nightowl-store-pin">Jhyaap Station Hub</div>',
  iconSize: [150, 30],
  iconAnchor: [75, 15],
});

const customerIcon = L.divIcon({
  className: 'nightowl-map-marker',
  html: '<div class="nightowl-destination-pin"></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

// Utility to calculate heading angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
function calculateHeading(from, to) {
  if (!from || !to) return 45;
  const dy = to.lat - from.lat;
  const dx = (to.lng - from.lng) * Math.cos((from.lat * Math.PI) / 180);
  if (Math.abs(dx) < 0.000001 && Math.abs(dy) < 0.000001) return 45;
  const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
  return Math.round((angle + 360) % 360);
}

const getRiderIcon = (isPicking, isLive, heading = 45) => {
  const isWestbound = heading > 180 && heading < 360;

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center pointer-events-none">
        <!-- Rotating Direction Pointer Cone (e.g. 233Â°) -->
        <div class="absolute -inset-4 flex items-center justify-center pointer-events-none transition-transform duration-1000 ease-out z-0" style="transform: rotate(${heading}deg);">
          <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[24px] border-b-amber-400 -translate-y-8 animate-pulse drop-shadow-[0_0_10px_rgba(245,158,11,0.95)]"></div>
        </div>

        <!-- STRAIGHT & UPRIGHT Rider Character (0Â° tilt) - NO bounce animation -->
        <div class="relative z-10 transition-transform duration-500 ease-out" style="transform: ${isWestbound ? 'scaleX(-1)' : 'scaleX(1)'};">
          ${isLive ? '<div class="absolute -inset-3 animate-ping rounded-full bg-[#f59e0b]/40"></div>' : ''}
          <img src="${BIKE_RIDER_MARKER_ICON}" width="64" height="64" alt="Delivery Rider" class="drop-shadow-[0_6px_16px_rgba(0,0,0,0.65)]" />
        </div>
      </div>
    `,
    className: 'custom-leaflet-marker-rider',
    iconSize: [64, 64],
    iconAnchor: [32, 32],
  });
};

  export default function LiveDeliveryMap({
    store,
    destination,
    rider: initialRider,
    isLive = false,
    showAllAreas = true,
    destinationAreaName,
    orderId,
  }) {
  const [animatedRider, setAnimatedRider] = useState(initialRider);
  // Allow destination to be overridden by URL params or browser geolocation (customer-provided)
  const [localDestination, setLocalDestination] = useState(destination);
  const previousPositionRef = useRef(null);
  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(null);
  const [orderStatus, setOrderStatus] = useState(initialRider?.status || 'assigned');
  const pollingRef = useRef(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);

  // Fetch actual route from OSRM for realistic road following
  useEffect(() => {
    const dest = localDestination || destination;
    if (!store || !dest) return;

    fetchRoute(store, dest).then(route => {
      if (route.length > 0) {
        setRouteCoordinates(route);
      }
    });
  }, [store, localDestination, destination]);

  // Poll for real-time GPS updates
  useEffect(() => {
    if (!orderId || !isLive) return;

    const fetchRiderLocation = async () => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/api/v1/tracking/${orderId}/location`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          setAnimatedRider({
            lat: data.data.lat,
            lng: data.data.lng,
            heading: data.data.heading || 0,
            status: data.data.status || 'driving',
            name: data.data.name || initialRider?.name || 'Raj Thapa',
            vehicle: data.data.vehicle || initialRider?.vehicle || 'Delivery scooter'
          });
          setOrderStatus(data.data.status || 'driving');
        }
      } catch (error) {
        console.warn('Failed to fetch rider location:', error);
      }
    };

    // Initial fetch
    fetchRiderLocation();

    // Poll every 3 seconds
    pollingRef.current = setInterval(fetchRiderLocation, 3000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [orderId, isLive, initialRider]);

  // AnimatedRiderMarker handles smooth animation following the actual route
  // No additional smoothing needed here - it would interfere with proper route following

  // Calculate distance remaining and ETA
  useEffect(() => {
    const dest = localDestination || destination;
    if (!animatedRider || !dest) return;

    const dist = calculateDistance(animatedRider, dest);
    setDistanceRemaining(dist);

    // Calculate ETA based on distance (assuming ~15 km/h average speed in city)
    const avgSpeedKmh = 15;
    const eta = (dist / 1000) / avgSpeedKmh * 60; // minutes
    setEtaMinutes(Math.round(eta));
  }, [animatedRider, localDestination, destination]);

  const mapRider = animatedRider ?? initialRider;

  // If URL contains ?lat=...&lng=..., use that as the destination (customer shareable link)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const lat = params.get('lat');
      const lng = params.get('lng');
      if (lat && lng) {
        const nLat = Number(lat);
        const nLng = Number(lng);
        if (Number.isFinite(nLat) && Number.isFinite(nLng)) {
          setLocalDestination({ lat: nLat, lng: nLng });
        }
      }
    } catch (err) {
      // ignore malformed URLs
    }
  }, []);

  // Expose a simple button for customers to set their current browser location as the destination
  const useMyLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported by your browser');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocalDestination(coords);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('Unable to access your location. Please enable location services and try again.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  
  // Handle order flow states
  const getStatusDisplay = () => {
    switch (orderStatus) {
      case 'assigned':
        return `${mapRider?.name?.split(' ')[0] || 'Rider'} assigned to order`;
      case 'picking':
        return `${mapRider?.name?.split(' ')[0] || 'Rider'} is picking up your order`;
      case 'driving':
        return `${mapRider?.name?.split(' ')[0] || 'Rider'} is on the way`;
      case 'arrived':
        return `${mapRider?.name?.split(' ')[0] || 'Rider'} has arrived`;
      case 'delivered':
        return 'Order delivered';
      default:
        return `${mapRider?.name?.split(' ')[0] || 'Rider'} - ${orderStatus}`;
    }
  };

  // Shared OpenStreetMap tiles used by admin and rider maps
  const mapTilesUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 z-0">
      <div className="h-[420px] w-full bg-night-950">
        <MapContainer 
          center={[VALLEY_MAP_CENTER.lat, VALLEY_MAP_CENTER.lng]} 
          zoom={13} 
          scrollWheelZoom={false}
          className="h-full w-full z-0"
          zoomControl={false}
        >
          <TileLayer
            url={mapTilesUrl}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors '
          />
          
          <MapBoundsFit store={store} destination={localDestination || destination} rider={mapRider} showAllAreas={showAllAreas} />
          <MapController onMapReady={setMapInstance} />

          {/* Route Line from Store to Customer - use actual OSRM route if available */}
          <Polyline 
            positions={routeCoordinates.length > 0 ? routeCoordinates : [[store.lat, store.lng], [(localDestination || destination).lat, (localDestination || destination).lng]]} 
            color="#f59e0b" 
            weight={4} 
            dashArray="10, 10" 
            opacity={0.5} 
          />

          {/* Show all coverage areas (Kathmandu, Lalitpur, Bhaktapur) */}
          {showAllAreas && DELIVERY_AREAS.map((area, index) => {
                const isDest = area.name === (destinationAreaName ?? (localDestination || destination).label);
            return (
              <CircleMarker
                key={`${area.city}-${area.name}-${index}`}
                center={[area.lat, area.lng]}
                radius={isDest ? 6 : 3}
                pathOptions={{
                  color: isDest ? '#ef4444' : '#64748b',
                  fillColor: isDest ? '#ef4444' : '#334155',
                  fillOpacity: isDest ? 1 : 0.6,
                  weight: isDest ? 2 : 1,
                }}
              >
                <Tooltip direction="top" offset={[0, -5]} className="bg-night-950 text-white border-white/20 text-xs font-semibold">
                  {area.name}, {area.city}
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* Solid line showing the path the rider has already covered */}
          {mapRider && (mapRider.status === 'driving' || mapRider.status === 'arrived') && (
            <Polyline 
              positions={[[store.lat, store.lng], [mapRider.lat, mapRider.lng]]} 
              color="#22c55e" 
              weight={5} 
              opacity={0.8} 
            />
          )}

          <Marker position={[store.lat, store.lng]} icon={storeIcon} />
          <Marker position={[(localDestination || destination).lat, (localDestination || destination).lng]} icon={customerIcon} />
          
          {mapRider && (
            <AnimatedRiderMarker 
              rider={mapRider} 
              isLive={isLive} 
              showPulse={isLive}
              routeCoordinates={routeCoordinates.length > 0 ? routeCoordinates : [[store.lat, store.lng], [(localDestination || destination).lat, (localDestination || destination).lng]]}
            />
          )}
        </MapContainer>
      </div>

      {isLive && (
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-night-950 shadow-lg z-10">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-night-950" />
          Live tracking
        </div>
      )}

      {mapRider && (
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-16 z-10 pointer-events-auto">
          <div className="w-[420px] max-w-[92vw] bg-white rounded-2xl shadow-xl p-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={BIKE_RIDER_MARKER_ICON} alt="Rider" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900">{mapRider?.name || 'Raj Thapa'} <span className="text-amber-400 text-[10px]">★ 4.8</span></div>
                <div className="text-[10px] text-gray-500 mt-0.5">{mapRider?.phone || '9801234567'} · {mapRider?.vehicle || 'Ba 95 Pa 1234'}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-[10px] text-gray-500">Distance</div>
                <div className="text-sm font-bold text-gray-900">~{Math.round(distanceRemaining)}m</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500">ETA</div>
                <div className="text-sm font-bold text-gray-900">{etaMinutes ?? '—'} min</div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-end gap-1.5">
                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-green-50 rounded-full text-green-600 text-[8px]">🍽️</span>
                  <div className="text-[9px] leading-tight">Liquor<br/><span className="font-semibold text-gray-800">Confirmed</span></div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-50 rounded-full text-gray-700 text-[8px]">📦</span>
                  <div className="text-[9px] leading-tight">Order<br/><span className="font-semibold text-gray-800">{orderStatus === 'assigned' || orderStatus === 'picking' ? 'Pending' : 'Picked Up'}</span></div>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-emerald-50 rounded-full text-emerald-600 text-[8px]">🛵</span>
                  <div className="text-[9px] leading-tight">Status<br/><span className="font-semibold text-gray-800">{orderStatus === 'driving' ? 'In Transit' : orderStatus}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute right-3 top-3 flex flex-col gap-1.5 text-[10px] z-10">
        <span className="flex items-center gap-1 rounded-full bg-night-950/80 px-2 py-1 text-green-400 shadow-md">
          <Store className="h-3 w-3" /> Store
        </span>
        <span className="flex items-center gap-1 rounded-full bg-night-950/80 px-2 py-1 text-sky-400 shadow-md">
          <Navigation className="h-3 w-3" /> Rider
        </span>
        <span className="flex items-center gap-1 rounded-full bg-night-950/80 px-2 py-1 text-red-400 shadow-md">
          <MapPin className="h-3 w-3" /> {destinationAreaName ?? 'You'}
        </span>
      </div>

      <div className="pointer-events-auto absolute right-3 top-28 z-10 flex flex-col gap-2">
        <button onClick={useMyLocation} className="bg-black/80 text-white text-[11px] px-3 py-1 rounded shadow-md hover:bg-black/90">
          Use my location
        </button>
      </div>

      <div className="pointer-events-auto absolute right-3 bottom-3 z-10 flex gap-2">
        <button 
          onClick={() => {
            if (mapInstance) {
              mapInstance.zoomIn();
            }
          }}
          className="bg-black/80 text-white p-2 rounded shadow-md hover:bg-black"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button 
          onClick={() => {
            if (mapInstance) {
              mapInstance.zoomOut();
            }
          }}
          className="bg-black/80 text-white p-2 rounded shadow-md hover:bg-black"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

