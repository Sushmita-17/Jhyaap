import { bearingBetween } from '@/lib/riderMarker';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import RiderMarker from './RiderMarker';
import './RiderMarker.css';

/**
 * CustomerTrackingMap — "Track My Order" live map for the customer app.
 *
 * Shows the rider moving smoothly on OpenStreetMap. In production you would feed it the
 * rider's live coords from the backend:
 *   GET /api/v1/tracking/{orderId}/location  →  setRiderPos({ lat, lng, heading })
 *
 * For demo purposes it animates a simulated rider loop so you can see the transparent
 * rider marker move + rotate immediately.
 *
 * Props:
 *   orderId     order to track (optional)
 *   rider       live rider object: { lat, lng, heading } (optional; overrides demo)
 */
export default function CustomerTrackingMap({
  orderId,
  rider,
  height = '70vh',
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const cancelRef = useRef(null);

  const [riderPos, setRiderPos] = useState(() =>
    rider ? { lat: rider.lat, lng: rider.lng, heading: rider.heading || 0 }
      : { lat: 27.7074359, lng: 85.2853747, heading: 0 }
  );

  // Live rider prop wins over demo.
  useEffect(() => {
    if (rider) {
      setRiderPos({ lat: rider.lat, lng: rider.lng, heading: rider.heading || 0 });
    }
  }, [rider]);

  // Build map once.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const map = L.map(containerRef.current, {
      center: [27.7074359, 85.2853747],
      zoom: 15,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
    };
  }, []);

  // Keep map centered on the rider.
  useEffect(() => {
    if (mapRef.current && riderPos) {
      mapRef.current.panTo([riderPos.lat, riderPos.lng], { animate: true, duration: 1 });
    }
  }, [riderPos]);

  // Demo simulation only when no live rider is provided.
  useEffect(() => {
    if (rider) return undefined;

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
      { lat: 27.7074359, lng: 85.2853747 },
    ];
    let index = 0;
    const timer = setInterval(() => {
      index = (index + 1) % ROUTE.length;
      const from = ROUTE[(index + ROUTE.length - 1) % ROUTE.length];
      const to = ROUTE[index];
      setRiderPos({ lat: to.lat, lng: to.lng, heading: bearingBetween(from, to) });
    }, 2000);

    return () => clearInterval(timer);
  }, [rider]);

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
        🛵 Your rider is on the way
      </div>
      {mapRef.current && (
        <RiderMarker
          map={mapRef.current}
          position={{ lat: riderPos.lat, lng: riderPos.lng }}
          bearing={riderPos.heading}
          showYouLabel
        />
      )}
    </div>
  );
}
