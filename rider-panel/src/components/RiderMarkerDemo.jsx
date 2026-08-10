import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  createRiderMarker,
  updateRiderPosition,
  bearingBetween,
} from '@/lib/riderMarker';
import './RiderMarker.css';

/**
 * RiderMarkerDemo — mock GPS demo on an OpenStreetMap tile map.
 *
 * A simulated rider drives a lap near Jhyaap Station, sending a new GPS point every
 * 2s. The marker animates smoothly (rAF + easing) and rotates to the correct bearing,
 * exactly like a real ride-hailing app.
 *
 * Replace the setInterval body with your real data source:
 *   - WebSocket : ws.onmessage = (e) => { const d = JSON.parse(e.data); move(d.lat, d.lng); };
 *   - REST poll : setInterval(async () => {
 *                   const r = await fetch(`/api/v1/tracking/${orderId}/location`).then(r=>r.json());
 *                   move(r.data.lat, r.data.lng);
 *                 }, 3000);
 */

// Simulated loop near Jhyaap Station hub.
const ROUTE = [
  { lat: 27.7074359, lng: 85.2853747 },
  { lat: 27.7085, lng: 85.2875 },
  { lat: 27.7096, lng: 85.2898 },
  { lat: 27.7104, lng: 85.2921 },
  { lat: 27.7112, lng: 85.2946 },
  { lat: 27.7101, lng: 85.2968 },
  { lat: 27.7089, lng: 85.2952 },
  { lat: 27.7078, lng: 85.2929 },
  { lat: 27.7072, lng: 85.2901 },
  { lat: 27.7074359, lng: 85.2853747 }, // loop back
];

const SIM_INTERVAL_MS = 2000; // new GPS point every 2s
const ANIMATION_MS = 1500;    // smooth movement over 1.5s

export default function RiderMarkerDemo({ height = '80vh' }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const cancelRef = useRef(null);
  const [status, setStatus] = useState('Starting…');

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const map = L.map(containerRef.current, {
      center: [27.709, 85.29],
      zoom: 15,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create the rider marker at the start of the route.
    const marker = createRiderMarker(map, {
      position: ROUTE[0],
      bearing: bearingBetween(ROUTE[0], ROUTE[1]),
      showYouLabel: true,
    });
    markerRef.current = marker;
    mapRef.current = map;

    map.panTo([ROUTE[0].lat, ROUTE[0].lng]);
    setStatus('Simulating GPS…');

    // ---- Mock GPS source: send a new point every SIM_INTERVAL_MS ----
    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % ROUTE.length;
      const from = ROUTE[(index + ROUTE.length - 1) % ROUTE.length];
      const to = ROUTE[index];
      const bearing = bearingBetween(from, to);

      // <-- Replace this with your real WebSocket / REST data.
      if (cancelRef.current) cancelRef.current();
      cancelRef.current = updateRiderPosition(map, marker, to.lat, to.lng, bearing, {
        duration: ANIMATION_MS,
        onComplete: () => setStatus(`GPS @ ${to.lat.toFixed(5)}, ${to.lng.toFixed(5)}`),
      });
    }, SIM_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      if (cancelRef.current) cancelRef.current();
      if (markerRef.current) markerRef.current.remove();
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          zIndex: 1000,
          whiteSpace: 'nowrap',
        }}
      >
        🛵 {status}
      </div>
    </div>
  );
}
