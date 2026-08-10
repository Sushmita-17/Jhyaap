import { useState, useEffect, useRef } from 'react';

const KATHMANDU_STORE = { lat: 27.7074359, lng: 85.2853747, name: 'Jhyaap Station Hub' };

// Utility to calculate heading angle in degrees (0 = North, 90 = East, 180 = South, 270 = West)
function calculateHeading(from, to) {
  if (!from || !to) return 45;
  const dy = to.lat - from.lat;
  const dx = (to.lng - from.lng) * Math.cos((from.lat * Math.PI) / 180);
  if (Math.abs(dx) < 0.000001 && Math.abs(dy) < 0.000001) return 45;
  const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
  return Math.round((angle + 360) % 360);
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

// Calculate total route distance
function calculateRouteDistance(coordinates) {
  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += calculateDistance(coordinates[i], coordinates[i + 1]);
  }
  return totalDistance;
}

// Decode polyline from OSRM response
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

    coordinates.push({
      lat: lat / 1e5,
      lng: lng / 1e5
    });
  }

  return coordinates;
}

// Fetch route from OSRM API
async function fetchRoute(from, to) {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=polyline`
    );
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes.length > 0) {
      const routeCoordinates = decodePolyline(data.routes[0].geometry);
      return routeCoordinates;
    }
    return null;
  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
}

// Detailed full delivery rider SVG (36px) - like inDrive/Pathao/Foodpanda
const DeliveryVehicleSvg = ({ heading = 0 }) => {
  const isWestbound = heading > 180 && heading < 360;
  const scaleX = isWestbound ? 'scaleX(-1)' : 'scaleX(1)';

  return (
    <div className="relative flex items-center justify-center" style={{ transform: scaleX }}>
      {/* Rotating Direction Beam pointing exact driving angle */}
      <div 
        className="absolute -inset-5 flex items-center justify-center pointer-events-none transition-transform duration-1000 ease-out z-0"
        style={{ transform: `rotate(${heading}deg)` }}
      >
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[26px] border-b-amber-400 -translate-y-9 animate-pulse drop-shadow-[0_0_12px_rgba(245,158,11,0.95)]" />
      </div>

      {/* Detailed Rider Icon */}
      <div className="relative z-10 transition-transform duration-500 ease-out">
        <div className="animate-drive-wobble">
          <svg viewBox="0 0 48 48" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <g transform="translate(2, 4)">
              {/* Brown Delivery Box on Back */}
              <rect x="2" y="4" width="14" height="12" rx="2" fill="#92400e" stroke="#78350f" strokeWidth="1.5"/>
              <rect x="3" y="5" width="12" height="10" rx="1.5" fill="#b45309" stroke="#92400e" strokeWidth="1"/>
              {/* Box straps */}
              <line x1="2" y1="10" x2="16" y2="10" stroke="#78350f" strokeWidth="1.5"/>
              <line x1="9" y1="4" x2="9" y2="16" stroke="#78350f" strokeWidth="1.5"/>
              
              {/* Wheels with silver rims */}
              <g className="animate-spin" style={{ animationDuration: '0.3s', transformOrigin: '12px 34px' }}>
                <circle cx="12" cy="34" r="5" fill="#1f2937" stroke="#9ca3af" strokeWidth="1.5"/>
                <circle cx="12" cy="34" r="3" fill="#4b5563"/>
                <line x1="12" y1="29" x2="12" y2="39" stroke="#9ca3af" strokeWidth="1"/>
                <line x1="7" y1="34" x2="17" y2="34" stroke="#9ca3af" strokeWidth="1"/>
              </g>
              <g className="animate-spin" style={{ animationDuration: '0.3s', transformOrigin: '32px 34px' }}>
                <circle cx="32" cy="34" r="5" fill="#1f2937" stroke="#9ca3af" strokeWidth="1.5"/>
                <circle cx="32" cy="34" r="3" fill="#4b5563"/>
                <line x1="32" y1="29" x2="32" y2="39" stroke="#9ca3af" strokeWidth="1"/>
                <line x1="27" y1="34" x2="37" y2="34" stroke="#9ca3af" strokeWidth="1"/>
              </g>
              
              {/* Modern red scooter body */}
              <path d="M 36 30 C 36 24, 28 24, 26 28 L 18 28 C 16 24, 8 24, 6 30 C 6 36, 16 38, 18 34 L 28 34 C 30 38, 36 36, 36 30 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5"/>
              <path d="M 32 28 L 28 16 L 24 16 L 26 28 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.5"/>
              
              {/* Handlebars and mirrors */}
              <path d="M 22 14 L 22 10" stroke="#1f2937" strokeWidth="2"/>
              <path d="M 20 10 L 24 10" stroke="#1f2937" strokeWidth="2"/>
              <ellipse cx="19" cy="10" rx="2" ry="1" fill="#9ca3af" stroke="#6b7280" strokeWidth="0.5"/>
              <ellipse cx="25" cy="10" rx="2" ry="1" fill="#9ca3af" stroke="#6b7280" strokeWidth="0.5"/>
              
              {/* Headlight */}
              <path d="M 30 16 C 30 13, 33 13, 33 16 C 33 19, 30 19, 30 16 Z" fill="#fef3c7"/>
              <path d="M 32 14 C 33 14, 33 18, 32 18 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1"/>
              
              {/* Seat */}
              <rect x="8" y="22" width="16" height="4" rx="2" fill="#1f2937" stroke="#111827" strokeWidth="1.5"/>
              
              {/* Rider legs (black pants) */}
              <path d="M 24 18 L 24 28 L 28 28 L 28 22 Z" fill="#1f2937" stroke="#111827" strokeWidth="1"/>
              
              {/* Rider torso (white shirt with red sleeves) */}
              <path d="M 26 10 C 22 10, 18 12, 20 18 C 24 18, 26 16, 27 12 Z" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1"/>
              <path d="M 24 12 L 30 16 L 29 17 L 23 13 Z" fill="#dc2626"/>
              
              {/* Rider arms */}
              <path d="M 24 12 L 30 16 L 29 17 L 23 13 Z" fill="#dc2626"/>
              <circle cx="30" cy="16" r="2" fill="#fed7aa"/>
              
              {/* Rider helmet (red) */}
              <circle cx="26" cy="8" r="5" fill="#fed7aa"/>
              <path d="M 31 8 C 31 3, 21 3, 21 8 C 21 10, 23 11, 25 11 C 29 11, 31 10, 31 8 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5"/>
              <path d="M 31 8 L 21 8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
              
              {/* Helmet visor reflection */}
              <path d="M 29 6 Q 26 5 23 6" stroke="#1f2937" strokeWidth="1" fill="none"/>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function RiderMap({ destinationLat, destinationLng, destinationName, height = '400px' }) {
  const destLat = destinationLat || 27.7007;
  const destLng = destinationLng || 85.3001;

  // Calculate center point between store and destination
  const centerLat = (KATHMANDU_STORE.lat + destLat) / 2;
  const centerLng = (KATHMANDU_STORE.lng + destLng) / 2;

  // Calculate bounding box for iframe
  const bboxWidth = 0.15;
  const bboxHeight = 0.20;

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${centerLng - bboxWidth},${centerLat - bboxHeight},${centerLng + bboxWidth},${centerLat + bboxHeight}&layer=mapnik`;

  const openExternalMap = (provider = 'osm') => {
    let url;
    
    switch (provider) {
      case 'google':
        url = `https://www.google.com/maps?q=${destLat},${destLng}`;
        break;
      case 'osm':
      default:
        url = `https://www.openstreetmap.org/?mlat=${destLat}&mlon=${destLng}#map=16/${destLat}/${destLng}`;
        break;
    }
    
    window.open(url, '_blank');
  };

  // Route and rider position state
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [riderPosition, setRiderPosition] = useState({
    lat: KATHMANDU_STORE.lat,
    lng: KATHMANDU_STORE.lng
  });
  const [heading, setHeading] = useState(45);
  const [currentRouteIndex, setCurrentRouteIndex] = useState(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Fetch route when component mounts
  useEffect(() => {
    const loadRoute = async () => {
      setIsLoadingRoute(true);
      const route = await fetchRoute(KATHMANDU_STORE, { lat: destLat, lng: destLng });
      
      if (route && route.length > 0) {
        setRouteCoordinates(route);
        setRiderPosition(route[0]);
        if (route.length > 1) {
          setHeading(calculateHeading(route[0], route[1]));
        }
      }
      setIsLoadingRoute(false);
    };

    loadRoute();
  }, [destLat, destLng]);

  // Move rider along the route
  useEffect(() => {
    if (routeCoordinates.length === 0 || isLoadingRoute || isPaused) return;

    const interval = setInterval(() => {
      setCurrentRouteIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        
        if (nextIndex >= routeCoordinates.length) {
          return prevIndex; // Arrived at destination
        }

        const nextPos = routeCoordinates[nextIndex];
        const currentPos = routeCoordinates[prevIndex];
        
        setRiderPosition(nextPos);
        setHeading(calculateHeading(currentPos, nextPos));
        
        return nextIndex;
      });
    }, 500 / speed); // Speed-adjusted movement

    return () => clearInterval(interval);
  }, [routeCoordinates, isLoadingRoute, isPaused, speed]);

  // Calculate marker percentage positions on the map frame
  const getMarkerPosition = (lat, lng) => {
    const x = ((lng - (centerLng - bboxWidth)) / (2 * bboxWidth)) * 100;
    const y = ((centerLat + bboxHeight - lat) / (2 * bboxHeight)) * 100;
    return { x, y };
  };

  const storePos = getMarkerPosition(KATHMANDU_STORE.lat, KATHMANDU_STORE.lng);
  const destPos = getMarkerPosition(destLat, destLng);
  const riderPos = getMarkerPosition(riderPosition.lat, riderPosition.lng);

  // Calculate route path for display
  const routePath = routeCoordinates.map(coord => getMarkerPosition(coord.lat, coord.lng));
  
  // Calculate total route distance
  const totalDistance = calculateRouteDistance(routeCoordinates);
  const traveledDistance = calculateRouteDistance(routeCoordinates.slice(0, currentRouteIndex));

  return (
    <div className="relative rounded-xl overflow-hidden border border-[#2a221c]">
      <iframe
        src={mapUrl}
        className="w-full border-0"
        style={{ height, filter: 'invert(0.85) hue-rotate(170deg)' }}
        title="Delivery Route Map"
      />
      
      {/* Route Path Overlay */}
      {routePath.length > 1 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' }}>
          <polyline
            points={routePath.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="8,4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
            style={{ animationDuration: '2s' }}
          />
        </svg>
      )}

      {/* Store Marker Overlay */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
        style={{ left: `${storePos.x}%`, top: `${storePos.y}%` }}
      >
        <div className="relative flex flex-col items-center hover:scale-110 transition-transform">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-green-300 border-2 border-white flex items-center justify-center text-xl shadow-2xl">
            
          </div>
          <span className="mt-1 px-2 py-0.5 bg-black/80 text-[#C9A84C] text-[10px] font-bold rounded whitespace-nowrap">
            {KATHMANDU_STORE.name}
          </span>
        </div>
      </div>

      {/* Customer Destination Marker Overlay */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer"
        style={{ left: `${destPos.x}%`, top: `${destPos.y}%` }}
      >
        <div className="relative flex flex-col items-center hover:scale-110 transition-transform">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-500 to-red-300 border-2 border-white flex items-center justify-center text-xl shadow-2xl">
            
          </div>
          <span className="mt-1 px-2 py-0.5 bg-black/80 text-[#C9A84C] text-[10px] font-bold rounded whitespace-nowrap">
            {destinationName || 'Destination'}
          </span>
        </div>
      </div>

      {/* Live Vehicle Rider Marker with Smooth North-Facing Vehicle SVG */}
      <div 
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-all duration-1000 ease-linear"
        style={{ left: `${riderPos.x}%`, top: `${riderPos.y}%` }}
      >
        <div className="relative flex flex-col items-center hover:scale-125 transition-transform">
          <DeliveryVehicleSvg heading={heading} />
          
          {/* Rider Live Direction Status Label */}
          <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold shadow-xl bg-gray-950/90 text-amber-400 border border-amber-500/40 whitespace-nowrap">
            {isLoadingRoute ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                Calculating Route...
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                {currentRouteIndex > 0 && routeCoordinates.length > 0 
                  ? `Driving (${Math.round((currentRouteIndex / routeCoordinates.length) * 100)}%)`
                  : 'Starting Route'}
              </>
            )}
          </div>
        </div>
      </div>

      {/* External Map Navigation Controls */}
      <div className="absolute top-2 right-2 z-[1000] flex gap-2">
        <button
          onClick={() => openExternalMap('osm')}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 flex items-center gap-1 shadow-md hover:bg-black/90 transition"
        >
          <span> OSM</span>
        </button>
        <button
          onClick={() => openExternalMap('google')}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 flex items-center gap-1 shadow-md hover:bg-black/90 transition"
        >
          <span> Google</span>
        </button>
      </div>

      {/* Rider Controls */}
      <div className="absolute top-2 left-2 z-[1000] flex gap-2">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 flex items-center gap-1 shadow-md hover:bg-black/90 transition"
        >
          <span>{isPaused ? '▶' : '⏸'}</span>
        </button>
        <button
          onClick={() => setSpeed(Math.max(0.5, speed - 0.5))}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 flex items-center gap-1 shadow-md hover:bg-black/90 transition"
        >
          <span>−</span>
        </button>
        <button
          onClick={() => setSpeed(Math.min(3, speed + 0.5))}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 flex items-center gap-1 shadow-md hover:bg-black/90 transition"
        >
          <span>+</span>
        </button>
        <button
          onClick={() => {
            setCurrentRouteIndex(0);
            setRiderPosition(routeCoordinates[0] || KATHMANDU_STORE);
            setHeading(routeCoordinates.length > 1 ? calculateHeading(routeCoordinates[0], routeCoordinates[1]) : 45);
          }}
          className="bg-black/80 text-[#C9A84C] text-[10px] font-bold px-2 py-1 rounded border border-[#C9A84C]/30 flex items-center gap-1 shadow-md hover:bg-black/90 transition"
        >
          <span>↺</span>
        </button>
      </div>

      {/* Route Information Panel */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-black/85 backdrop-blur-sm rounded-lg p-2 border border-[#C9A84C]/30 shadow-xl">
        <div className="text-[#C9A84C] text-[10px] font-bold mb-1"> Route Information</div>
        {isLoadingRoute ? (
          <div className="text-gray-400 text-[9px]">Loading route...</div>
        ) : (
          <div className="space-y-1">
            <div className="text-gray-300 text-[9px]">
              <span className="text-amber-400">From:</span> {KATHMANDU_STORE.name}
            </div>
            <div className="text-gray-300 text-[9px]">
              <span className="text-amber-400">To:</span> {destinationName || 'Destination'}
            </div>
            <div className="text-gray-300 text-[9px]">
              <span className="text-amber-400">Progress:</span> {routeCoordinates.length > 0 ? Math.round((currentRouteIndex / routeCoordinates.length) * 100) : 0}%
            </div>
            <div className="text-gray-300 text-[9px]">
              <span className="text-amber-400">Total Distance:</span> ~{Math.round(totalDistance)}m
            </div>
            <div className="text-gray-300 text-[9px]">
              <span className="text-amber-400">Traveled:</span> ~{Math.round(traveledDistance)}m
            </div>
            <div className="text-gray-300 text-[9px]">
              <span className="text-amber-400">Speed:</span> {speed}x {isPaused ? '(Paused)' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
