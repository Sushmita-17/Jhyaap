import { useEffect, useRef, useState } from 'react';
import { DeliveryRider, GeoCoords } from '@/types';
import { DELIVERY_AREAS } from '@/data/deliveryAreas';
import {
  hasGoogleMapsApiKey,
  loadGoogleMaps,
  NIGHT_MAP_STYLES,
} from '@/lib/googleMaps';
import {
  AREA_DOT_ICON,
  CUSTOMER_MARKER_ICON,
  HIGHLIGHT_AREA_DOT_ICON,
  STORE_MARKER_ICON,
} from '@/lib/mapIcons';
import { AreaLabelOverlay, RiderMapOverlay } from '@/lib/mapMarkers';
import { estimateEtaMinutes, googleMapsRiderTrackUrl, VALLEY_MAP_CENTER } from '@/lib/deliveryLocations';
import { ExternalLink, MapPin, Navigation, Store } from 'lucide-react';

interface LiveDeliveryMapProps {
  store: GeoCoords;
  destination: GeoCoords;
  rider?: DeliveryRider;
  isLive?: boolean;
  showAllAreas?: boolean;
  destinationAreaName?: string;
}

function FallbackMap({
  store,
  destination,
  rider,
  isLive,
  destinationAreaName,
}: LiveDeliveryMapProps) {
  const progress = rider
    ? rider.status === 'picking' || rider.status === 'idle'
      ? 0.05 + Math.sin(Date.now() / 800) * 0.02
      : Math.min(1, Math.max(0, (rider.lat - store.lat) / (destination.lat - store.lat || 0.001)))
    : 0;

  const etaMin = rider ? estimateEtaMinutes({ lat: rider.lat, lng: rider.lng }, destination) : null;

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-night-900">
      <div className="absolute inset-0 opacity-40">
        <svg className="h-full w-full" viewBox="0 0 400 320">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#3a4258" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="320" fill="url(#grid)" />
          {DELIVERY_AREAS.slice(0, 24).map((area) => {
            const x = 30 + ((area.lng - 85.27) / 0.18) * 340;
            const y = 280 - ((area.lat - 27.61) / 0.17) * 240;
            return (
              <g key={area.name}>
                <circle cx={x} cy={y} r="2" fill="#64748b" opacity="0.7" />
                <text x={x} y={y + 10} fill="#94a3b8" fontSize="6" textAnchor="middle">
                  {area.name.length > 12 ? area.name.slice(0, 10) + '…' : area.name}
                </text>
              </g>
            );
          })}
          <line x1="60" y1="240" x2="340" y2="80" stroke="#f59e0b" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
        </svg>
      </div>

      <div className="absolute left-6 bottom-12 flex flex-col items-center gap-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-400 ring-2 ring-green-500/40">
          <Store className="h-5 w-5" />
        </span>
        <span className="rounded bg-night-950/90 px-2 py-0.5 text-[10px] font-semibold text-green-400">Jhyaap Station</span>
      </div>

      <div className="absolute right-6 top-12 flex flex-col items-center gap-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20 text-red-400 ring-2 ring-red-500/40">
          <MapPin className="h-5 w-5" />
        </span>
        <span className="rounded bg-night-950/90 px-2 py-0.5 text-[10px] font-semibold text-red-400">
          {destinationAreaName ?? destination.label ?? 'Delivery'}
        </span>
      </div>

      {rider && (
        <div
          className="absolute flex flex-col items-center gap-1 transition-all duration-[2000ms] ease-linear"
          style={{
            left: `${6 + progress * 78}%`,
            top: `${78 - progress * 58}%`,
          }}
        >
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/25 text-2xl ring-2 ring-sky-400/50 ${
              isLive ? 'animate-pulse' : ''
            }`}
            style={{ transform: `rotate(${rider.heading}deg)` }}
          >
            {rider.status === 'picking' ? '📦' : '🛵'}
          </span>
          <span className="rounded bg-night-950/90 px-2 py-0.5 text-[10px] font-bold text-white">
            {rider.name.split(' ')[0]}
          </span>
        </div>
      )}

      {isLive && (
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold uppercase text-night-950">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-night-950" />
          Live
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night-950 via-night-950/95 to-transparent p-4 pt-10">
        {rider && (
          <p className="text-center text-sm font-semibold text-white">
            {rider.status === 'picking'
              ? `${rider.name.split(' ')[0]} is picking your order`
              : rider.status === 'driving'
                ? `${rider.name.split(' ')[0]} is on the way${etaMin ? ` · ~${etaMin} min` : ''}`
                : `${rider.name.split(' ')[0]} · Jhyaap Station`}
          </p>
        )}
        <p className="mt-1 text-center text-[10px] text-night-400">
          Add <code className="text-neon-amber">VITE_GOOGLE_MAPS_API_KEY</code> in .env for full Google Maps like Bhojdeals
        </p>
      </div>
    </div>
  );
}

export default function LiveDeliveryMap({
  store,
  destination,
  rider,
  isLive = false,
  showAllAreas = true,
  destinationAreaName,
}: LiveDeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const riderOverlayRef = useRef<RiderMapOverlay | null>(null);
  const areaOverlaysRef = useRef<AreaLabelOverlay[]>([]);
  const markersRef = useRef<{
    store?: google.maps.Marker;
    dest?: google.maps.Marker;
    route?: google.maps.Polyline;
    traveled?: google.maps.Polyline;
  }>({});
  const [mapError, setMapError] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const etaMin =
    rider && rider.status === 'driving'
      ? estimateEtaMinutes({ lat: rider.lat, lng: rider.lng }, destination)
      : null;

  useEffect(() => {
    if (!hasGoogleMapsApiKey() || !mapRef.current) {
      setMapError(true);
      return;
    }

    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current) return;

        const google = window.google;
        if (!google?.maps) {
          setMapError(true);
          return;
        }

        const map = new google.maps.Map(mapRef.current, {
          center: VALLEY_MAP_CENTER,
          zoom: 12,
          styles: NIGHT_MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: true,
          fullscreenControl: true,
          gestureHandling: 'greedy',
          mapTypeControl: false,
        });

        googleMapRef.current = map;

        markersRef.current.store = new google.maps.Marker({
          map,
          position: store,
          title: store.label ?? 'Jhyaap Station',
          icon: { url: STORE_MARKER_ICON, scaledSize: new google.maps.Size(44, 44), anchor: new google.maps.Point(22, 22) },
          zIndex: 100,
        });

        markersRef.current.dest = new google.maps.Marker({
          map,
          position: destination,
          title: destination.label ?? destinationAreaName ?? 'Delivery',
          icon: { url: CUSTOMER_MARKER_ICON, scaledSize: new google.maps.Size(40, 48), anchor: new google.maps.Point(20, 46) },
          zIndex: 100,
        });

        markersRef.current.route = new google.maps.Polyline({
          map,
          path: [store, destination],
          strokeColor: '#f59e0b',
          strokeOpacity: 0.35,
          strokeWeight: 4,
          geodesic: true,
          icons: [
            {
              icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.8, strokeColor: '#f59e0b', scale: 3 },
              offset: '0',
              repeat: '16px',
            },
          ],
        });

        markersRef.current.traveled = new google.maps.Polyline({
          map,
          path: [store, store],
          strokeColor: '#22c55e',
          strokeOpacity: 0.85,
          strokeWeight: 5,
          geodesic: true,
          zIndex: 50,
        });

        if (showAllAreas) {
          const destName = destinationAreaName ?? destination.label;
          areaOverlaysRef.current = DELIVERY_AREAS.map((area) => {
            const highlighted = area.name === destName;
            const overlay = new AreaLabelOverlay(
              { lat: area.lat, lng: area.lng },
              area.name,
              highlighted
            );
            overlay.setMap(map);

            new google.maps.Marker({
              map,
              position: { lat: area.lat, lng: area.lng },
              icon: {
                url: highlighted ? HIGHLIGHT_AREA_DOT_ICON : AREA_DOT_ICON,
                scaledSize: new google.maps.Size(highlighted ? 14 : 10, highlighted ? 14 : 10),
                anchor: new google.maps.Point(highlighted ? 7 : 5, highlighted ? 7 : 5),
              },
              clickable: false,
              zIndex: highlighted ? 20 : 5,
            });

            return overlay;
          });
        }

        const bounds = new google.maps.LatLngBounds();
        bounds.extend(store);
        bounds.extend(destination);
        if (rider) bounds.extend({ lat: rider.lat, lng: rider.lng });
        map.fitBounds(bounds, 64);

        setMapReady(true);
      })
      .catch(() => setMapError(true));

    return () => {
      cancelled = true;
      areaOverlaysRef.current.forEach((o) => o.setMap(null));
      areaOverlaysRef.current = [];
      riderOverlayRef.current?.setMap(null);
      riderOverlayRef.current = null;
    };
  }, [store.lat, store.lng, destination.lat, destination.lng, showAllAreas, destinationAreaName]);

  useEffect(() => {
    if (!mapReady || !googleMapRef.current || !rider) return;

    const position = { lat: rider.lat, lng: rider.lng };

    if (!riderOverlayRef.current) {
      riderOverlayRef.current = new RiderMapOverlay(position, rider, isLive);
      riderOverlayRef.current.setMap(googleMapRef.current);
    } else {
      riderOverlayRef.current.update(position, rider, isLive);
    }

    const traveled = markersRef.current.traveled;
    if (traveled) {
      if (rider.status === 'driving' || rider.status === 'arrived') {
        traveled.setPath([store, position, destination]);
      } else {
        traveled.setPath([store, store]);
      }
    }

    const route = markersRef.current.route;
    if (route && rider.status === 'driving') {
      route.setPath([position, destination]);
    } else if (route) {
      route.setPath([store, destination]);
    }
  }, [rider?.lat, rider?.lng, rider?.heading, rider?.name, rider?.status, mapReady, isLive, store, destination]);

  if (mapError || !hasGoogleMapsApiKey()) {
    return (
      <FallbackMap
        store={store}
        destination={destination}
        rider={rider}
        isLive={isLive}
        destinationAreaName={destinationAreaName}
      />
    );
  }

  const mapsUrl =
    rider && rider.status === 'driving'
      ? googleMapsRiderTrackUrl({ lat: rider.lat, lng: rider.lng }, destination)
      : `https://www.google.com/maps/search/?api=1&query=${destination.lat},${destination.lng}`;

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10">
      <div ref={mapRef} className="h-[420px] w-full" />

      {isLive && (
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-night-950 shadow-lg">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-night-950" />
          Live tracking
        </div>
      )}

      {rider && (
        <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-night-950/92 p-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-lg">
                {rider.status === 'picking' ? '📦' : '🛵'}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {rider.status === 'picking'
                    ? `${rider.name.split(' ')[0]} is picking your order`
                    : rider.status === 'driving'
                      ? `${rider.name.split(' ')[0]} is on the way`
                      : rider.name}
                </p>
                <p className="text-xs text-night-400">
                  {rider.vehicle}
                  {etaMin != null && rider.status === 'driving' ? ` · ~${etaMin} min away` : ''}
                </p>
              </div>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1 rounded-lg bg-neon-amber/15 px-2.5 py-1.5 text-[10px] font-semibold text-neon-amber hover:bg-neon-amber/25"
            >
              <ExternalLink className="h-3 w-3" />
              Maps
            </a>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute right-3 top-3 flex flex-col gap-1.5 text-[10px]">
        <span className="flex items-center gap-1 rounded-full bg-night-950/80 px-2 py-1 text-green-400">
          <Store className="h-3 w-3" /> Store
        </span>
        <span className="flex items-center gap-1 rounded-full bg-night-950/80 px-2 py-1 text-sky-400">
          <Navigation className="h-3 w-3" /> Rider
        </span>
        <span className="flex items-center gap-1 rounded-full bg-night-950/80 px-2 py-1 text-red-400">
          <MapPin className="h-3 w-3" /> {destinationAreaName ?? 'You'}
        </span>
      </div>
    </div>
  );
}
