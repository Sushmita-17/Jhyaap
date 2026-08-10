import { STORE_LOCATION } from '@/lib/deliveryLocations';
import { BIKE_RIDER_MARKER_ICON } from '@/lib/mapIcons';
import { useThemeStore } from '@/store/themeStore';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Maximize2, Minimize2, Store, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';

const DEFAULT_DESTINATION = { lat: 27.6915, lng: 85.3410, label: 'Customer Destination' };
const VALLEY_CENTER = [27.7172, 85.3244];
function compactRoute(points, maxPoints = 700) {
  if (points.length <= maxPoints) return points;
  const step = Math.ceil(points.length / maxPoints);
  return points.filter((_, index) => index === 0 || index === points.length - 1 || index % step === 0);
}

const riderIcon = (driving = false, bearing = 0) => L.divIcon({
  className: 'jhyaap-leaflet-rider-icon',
  html: '<span class="jhyaap-rider-heading" style="--rider-bearing:' + bearing + 'deg"><span class="jhyaap-rider-image-wrap' + (driving ? ' is-driving' : '') + '"><span class="jhyaap-rider-motion"><img src="' + BIKE_RIDER_MARKER_ICON + '" alt="Animated delivery rider" class="jhyaap-leaflet-rider-image" /></span></span></span>',
  iconSize: [48, 48],
  iconAnchor: [24, 42],
});

const storeIcon = L.divIcon({
  className: 'jhyaap-leaflet-store-icon',
  html: '<div class="jhyaap-store-pin">Jhyaap Station</div>',
  iconSize: [110, 30],
  iconAnchor: [55, 15],
});

const destinationIcon = L.divIcon({
  className: 'jhyaap-leaflet-destination-icon',
  html: '<div class="jhyaap-destination-pin"></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

function AnimatedRiderMarker({ rider, routeCoordinates, onClick }) {
  const markerRef = useRef(null);
  const [position, setPosition] = useState(rider.coordinates);
  const [bearing, setBearing] = useState(0);
  const bearingRef = useRef(0);

  const icon = useMemo(() => riderIcon(rider.status === 'busy', bearing), [rider.status, bearing]);

  useEffect(() => {
    setPosition(rider.coordinates);
    markerRef.current?.setLatLng([rider.coordinates.lat, rider.coordinates.lng]);
  }, [rider.id, rider.coordinates.lat, rider.coordinates.lng]);

  useEffect(() => {
    if (rider.status !== 'busy' || routeCoordinates.length < 1) return;
    const routeStart = routeCoordinates[0];
    setPosition(routeStart);
    markerRef.current?.setLatLng([routeStart.lat, routeStart.lng]);
  }, [rider.id, rider.status, routeCoordinates]);

  useEffect(() => {
    if (rider.status !== 'busy' || routeCoordinates.length < 2) return undefined;

    let frameId;
    let segment = 0;
    let segmentStartedAt = performance.now();
    let lastUiUpdate = 0;
    let lastBearingSegment = -1;
    const animate = (now) => {
      if (segment >= routeCoordinates.length - 1) return;
      const from = routeCoordinates[segment];
      const to = routeCoordinates[segment + 1];
      const distanceMeters = Math.hypot((to.lat - from.lat) * 111000, (to.lng - from.lng) * 100000);
      const segmentDuration = Math.max(40, Math.min(1200, distanceMeters * 75));
      const progress = Math.min((now - segmentStartedAt) / segmentDuration, 1);
      const eased = progress;
      const next = {
        lat: from.lat + (to.lat - from.lat) * eased,
        lng: from.lng + (to.lng - from.lng) * eased,
      };
            if (segment !== lastBearingSegment) {
        const rawBearing = Math.atan2(to.lng - from.lng, to.lat - from.lat) * 180 / Math.PI;
        const nextBearing = rawBearing + 360 * Math.round((bearingRef.current - rawBearing) / 360);
        bearingRef.current = nextBearing;
        setBearing(nextBearing);
        lastBearingSegment = segment;
      }
      markerRef.current?.setLatLng([next.lat, next.lng]);
      if (now - lastUiUpdate > 350) {
        setPosition(next);
        lastUiUpdate = now;
      }
      if (progress >= 1) {
        segment += 1;
        segmentStartedAt = now;
      }
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [rider.id, rider.status, routeCoordinates]);

  return (
    <Marker
      ref={markerRef}
      position={[position.lat, position.lng]}
      icon={icon}
      eventHandlers={{ click: onClick }}
    />
  );
}
function ResizeMap({ isFullMap }) {
  const map = useMap();
  useEffect(() => {
    const resize = () => map.invalidateSize({ animate: false });
    resize();
    const firstFrame = requestAnimationFrame(resize);
    const timer = setTimeout(resize, isFullMap ? 250 : 80);
    return () => {
      cancelAnimationFrame(firstFrame);
      clearTimeout(timer);
    };
  }, [map, isFullMap]);
  return null;
}
function FitMap({ store, destination, rider }) {
  const map = useMap();
  useEffect(() => {
    const points = [[store.lat, store.lng], [destination.lat, destination.lng]];
    if (rider) points.push([rider.lat, rider.lng]);
    map.fitBounds(points, { padding: [50, 50], maxZoom: 16 });
  }, [map, store.lat, store.lng, destination.lat, destination.lng, rider?.lat, rider?.lng]);
  return null;
}

export default function DeliveryMap({ riders = [], selectedRider = null, onRiderSelect = null, height = '100%' }) {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  const [clickedRider, setClickedRider] = useState(null);
  const [isFullMap, setIsFullMap] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [animatedPosition, setAnimatedPosition] = useState(null);

  const activeRider = clickedRider || selectedRider || riders.find((rider) => rider.status === 'busy') || riders[0] || null;
  const destination = activeRider?.destinationCoords || DEFAULT_DESTINATION;
  const basePosition = activeRider?.coordinates || STORE_LOCATION;
  const displayedRider = activeRider && animatedPosition
    ? { ...activeRider, coordinates: animatedPosition }
    : activeRider;

  useEffect(() => {
    setAnimatedPosition(activeRider?.coordinates || null);
  }, [activeRider?.id, activeRider?.coordinates?.lat, activeRider?.coordinates?.lng]);

  useEffect(() => {
    if (!activeRider?.coordinates || activeRider.status !== 'busy') {
      setRouteCoordinates([]);
      return undefined;
    }
    const controller = new AbortController();
    fetch(`https://router.project-osrm.org/route/v1/driving/${basePosition.lng},${basePosition.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setRouteCoordinates(compactRoute((data.routes?.[0]?.geometry?.coordinates || []).map(([lng, lat]) => ({ lat, lng })))))
      .catch(() => setRouteCoordinates([]));
    return () => controller.abort();
  }, [activeRider?.id, activeRider?.status, basePosition.lat, basePosition.lng, destination.lat, destination.lng]);


  const handleSelect = (rider) => {
    setClickedRider(rider);
    onRiderSelect?.(rider);
  };

  const mapClass = isFullMap ? 'fixed inset-0 z-[100] overflow-hidden bg-black' : 'relative w-full';
  const mapHeight = isFullMap ? '100vh' : height;

  return (
    <div className={mapClass} style={{ height: mapHeight }}>
      <MapContainer center={VALLEY_CENTER} zoom={13} className="h-full w-full" scrollWheelZoom zoomControl>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
          maxZoom={19}
          maxNativeZoom={19}
          updateWhenIdle
          updateWhenZooming={false}
          keepBuffer={1}
          detectRetina={false}
        />
        <ResizeMap isFullMap={isFullMap} />
        <FitMap store={STORE_LOCATION} destination={destination} rider={displayedRider?.coordinates} />
        <Marker position={[STORE_LOCATION.lat, STORE_LOCATION.lng]} icon={storeIcon} />
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
        {routeCoordinates.length > 1 && (
          <>
            <Polyline positions={routeCoordinates.map((point) => [point.lat, point.lng])} pathOptions={{ color: '#f59e0b', weight: 6, opacity: 0.8 }} />
            {displayedRider?.coordinates && <Polyline positions={[[basePosition.lat, basePosition.lng], [displayedRider.coordinates.lat, displayedRider.coordinates.lng]]} pathOptions={{ color: '#22c55e', weight: 5, opacity: 0.9 }} />}
          </>
        )}
        {riders.filter((rider) => rider.coordinates).map((rider) => (
          <AnimatedRiderMarker
            key={rider.id}
            rider={rider.id === displayedRider?.id ? { ...rider, coordinates: displayedRider.coordinates } : rider}
            routeCoordinates={rider.id === displayedRider?.id ? routeCoordinates : []}
            onClick={() => handleSelect(rider)}
          />
        ))}
      </MapContainer>

        {/* Bottom-centered delivery info card (matches customer screenshot) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-6 z-[600] pointer-events-auto">
          <div className="w-[720px] max-w-[92vw] bg-white rounded-2xl shadow-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                <img src={BIKE_RIDER_MARKER_ICON} alt="Rider" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{activeRider?.name || 'Ramesh Tamang'} <span className="text-amber-400">★ 4.8</span></div>
                <div className="text-xs text-gray-500 mt-1">{activeRider?.phone || '9801234567'} · {activeRider?.vehicle || 'Ba 95 Pa 1234'}</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-gray-500">Distance</div>
                <div className="text-lg font-bold text-gray-900">{routeCoordinates?.length ? `${Math.round(routeCoordinates.reduce((acc, p, i, arr) => acc + (i>0? Math.hypot((p.lat - arr[i-1].lat)*111000, (p.lng - arr[i-1].lng)*100000):0),0))} m` : Math.round(activeRider?.distance||3200)} </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">ETA</div>
                <div className="text-lg font-bold text-gray-900">{routeCoordinates?.length ? `${Math.round((routeCoordinates.length>0? (routeCoordinates.length/100):12))} min` : `${Math.round(activeRider?.eta||12)} min`}</div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-end gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-green-50 rounded-full text-green-600">🍽️</span>
                  <div className="text-xs">Restaurant<br/><span className="font-semibold text-gray-800">Confirmed</span></div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-50 rounded-full text-gray-700">📦</span>
                  <div className="text-xs">Order<br/><span className="font-semibold text-gray-800">Picked Up</span></div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-50 rounded-full text-emerald-600">🛵</span>
                  <div className="text-xs">Status<br/><span className="font-semibold text-gray-800">In Transit</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-col gap-2">
        <div className="rounded-xl bg-black/80 px-3 py-2 text-xs font-bold text-white shadow-lg">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
          {activeRider?.status === 'busy' ? `${activeRider.name} is driving to customer` : 'Live rider map'}
        </div>
        {activeRider?.status === 'busy' && <div className="rounded-lg bg-black/75 px-3 py-1.5 text-[11px] text-amber-300">Road route to {destination.label || 'customer'}</div>}
      </div>

      <div className="absolute bottom-3 left-3 z-[500] flex items-center gap-2 rounded-xl bg-black/80 px-3 py-2 text-xs text-white shadow-lg">
        <Store className="h-3.5 w-3.5 text-green-400" /> Hub
        <MapPin className="ml-2 h-3.5 w-3.5 text-red-400" /> Customer
      </div>

      <div className="absolute bottom-3 right-3 z-[500] flex gap-2">
        <button type="button" onClick={() => setIsFullMap((value) => !value)} className="rounded-xl bg-black/80 p-3 text-white shadow-lg hover:bg-black">
          {isFullMap ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
        <button type="button" onClick={() => document.querySelector('.leaflet-container')?.zoomIn()} className="rounded-xl bg-black/80 p-3 text-white shadow-lg hover:bg-black"><ZoomIn className="h-4 w-4" /></button>
        <button type="button" onClick={() => document.querySelector('.leaflet-container')?.zoomOut()} className="rounded-xl bg-black/80 p-3 text-white shadow-lg hover:bg-black"><ZoomOut className="h-4 w-4" /></button>
      </div>
    </div>
  );
}






















