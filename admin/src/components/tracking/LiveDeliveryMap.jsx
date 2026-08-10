import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExternalLink, MapPin, Navigation, Store } from 'lucide-react';
import { estimateEtaMinutes } from '@/lib/deliveryLocations';
import AnimatedRiderMarker from './AnimatedRiderMarker';

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001';

const storeIcon = L.divIcon({ className: 'jhyaap-leaflet-store-icon', html: '<div class="jhyaap-store-pin">Jhyaap Station</div>', iconSize: [110, 30], iconAnchor: [55, 15] });
const destinationIcon = L.divIcon({ className: 'jhyaap-leaflet-destination-icon', html: '<div class="jhyaap-destination-pin"></div>', iconSize: [34, 34], iconAnchor: [17, 34] });

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

function FitTrackingBounds({ store, destination, rider }) {
  const map = useMap();
  const didFit = useRef(false);
  useEffect(() => {
    if (didFit.current) return;
    const points = [[store.lat, store.lng], [destination.lat, destination.lng]];
    if (rider) points.push([rider.lat, rider.lng]);
    map.fitBounds(points, { padding: [48, 48], maxZoom: 16 });
    didFit.current = true;
  }, [map, store.lat, store.lng, destination.lat, destination.lng, rider?.lat, rider?.lng]);
  return null;
}

export default function LiveDeliveryMap({ store, destination, rider: initialRider, isLive = false, destinationAreaName, orderId }) {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [rider, setRider] = useState(initialRider);
  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(null);
  const [orderStatus, setOrderStatus] = useState(initialRider?.status || 'assigned');
  const pollingRef = useRef(null);

  // Poll for real-time GPS updates
  useEffect(() => {
    if (!orderId || !isLive) return;

    const fetchRiderLocation = async () => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/api/v1/tracking/${orderId}/location`);
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
          setRider({
            lat: data.data.lat,
            lng: data.data.lng,
            heading: data.data.heading || 0,
            status: data.data.status || 'driving',
            name: initialRider?.name || 'Rider',
            vehicle: initialRider?.vehicle || 'Delivery scooter'
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

  // Fetch route from OSRM
  useEffect(() => {
    if (!rider || !destination) return undefined;
    const controller = new AbortController();
    fetch(`${OSRM_URL}/${rider.lng},${rider.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setRouteCoordinates((data.routes?.[0]?.geometry?.coordinates ?? []).map(([lng, lat]) => [lat, lng])))
      .catch(() => setRouteCoordinates([]));
    return () => controller.abort();
  }, [rider?.lat, rider?.lng, destination?.lat, destination?.lng]);

  // Calculate distance remaining and ETA
  useEffect(() => {
    if (!rider || !destination) return;

    const dist = calculateDistance(rider, destination);
    setDistanceRemaining(dist);

    // Calculate ETA based on distance (assuming ~15 km/h average speed in city)
    const avgSpeedKmh = 15;
    const eta = (dist / 1000) / avgSpeedKmh * 60; // minutes
    setEtaMinutes(Math.round(eta));
  }, [rider, destination]);

  // Handle order flow states
  const getStatusDisplay = () => {
    const riderName = rider?.name && rider.name !== 'undefined' && rider.name.trim() ? rider.name : 'Rider';
    const firstName = riderName.split(' ')[0];
    switch (orderStatus) {
      case 'assigned':
        return `${firstName} assigned to order`;
      case 'picking':
        return `${firstName} is picking up order`;
      case 'driving':
        return `${firstName} is on the way`;
      case 'arrived':
        return `${firstName} has arrived`;
      case 'delivered':
        return 'Order delivered';
      default:
        return `${firstName} - ${orderStatus}`;
    }
  };

  const mapsUrl = `https://www.openstreetmap.org/directions?from=${rider?.lat},${rider?.lng}&to=${destination.lat},${destination.lng}`;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10">
      <MapContainer center={[27.69, 85.34]} zoom={13} className="h-[420px] w-full" scrollWheelZoom zoomControl>
        <TileLayer url={OSM_TILE_URL} attribution="&copy; OpenStreetMap contributors" maxZoom={19} />
        <FitTrackingBounds store={store} destination={destination} rider={rider} />
        <Marker position={[store.lat, store.lng]} icon={storeIcon} />
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
        {rider && orderStatus !== 'delivered' && <AnimatedRiderMarker rider={rider} isLive={isLive} showPulse={isLive} routeCoordinates={routeCoordinates} destination={destination} />}
      </MapContainer>

      <div className="absolute left-3 top-3 z-[500] flex items-center gap-1.5 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-night-950 shadow-lg">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-night-950" /> {isLive ? 'Live GPS' : 'Last known GPS'}
      </div>
      <div className="pointer-events-none absolute right-3 top-3 z-[500] flex flex-col gap-1.5 text-[10px]">
        <span className="flex items-center gap-1 rounded-full bg-night-950/85 px-2 py-1 text-green-400"><Store className="h-3 w-3" /> Hub</span>
        <span className="flex items-center gap-1 rounded-full bg-night-950/85 px-2 py-1 text-sky-400"><Navigation className="h-3 w-3" /> Rider</span>
        <span className="flex items-center gap-1 rounded-full bg-night-950/85 px-2 py-1 text-red-400"><MapPin className="h-3 w-3" /> {destinationAreaName || 'Customer'}</span>
      </div>
      <div className="absolute inset-x-3 bottom-3 z-[500] rounded-2xl border border-white/10 bg-night-950/92 p-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{getStatusDisplay()}</p>
            <p className="text-xs text-night-400">
              {rider?.vehicle || 'Delivery scooter'}
              {orderStatus === 'driving' && etaMinutes != null && ` - ~${etaMinutes} min away`}
              {orderStatus === 'driving' && ` - ~${Math.round(distanceRemaining)}m remaining`}
            </p>
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex shrink-0 items-center gap-1 rounded-lg bg-neon-amber/15 px-2.5 py-1.5 text-[10px] font-semibold text-neon-amber hover:bg-neon-amber/25"><ExternalLink className="h-3 w-3" /> OSM</a>
        </div>
      </div>
    </div>
  );
}

