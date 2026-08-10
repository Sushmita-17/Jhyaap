import {
  animateRiderMarker,
  createAnimatedRiderMarker,
  createRiderLeafletIcon,
  setMarkerBearing
} from '@/lib/riderTracking';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';

/**
 * AnimatedRiderMarker - Production-ready animated rider marker for real-time delivery tracking
 *
 * Features:
 * - Smooth 60 FPS interpolation between GPS points
 * - Direction-based rotation (bearing calculation)
 * - Pulse effect for live indication
 * - Route-aligned easing along OSRM polyline coordinates
 * - Optimized for React with minimal re-renders
 */

const toRad = (deg) => deg * (Math.PI / 180);
const normalizeAngle = (angle) => ((angle % 360) + 360) % 360;
const lerpAngle = (from, to, t) => {
  let diff = normalizeAngle(to - from);
  if (diff > 180) diff -= 360;
  return normalizeAngle(from + diff * t);
};

const calculateBearing = (from, to) => {
  const dLon = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return normalizeAngle((Math.atan2(y, x) * 180) / Math.PI);
};

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const calculateDistance = (from, to) => {
  const R = 6371e3;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const buildRouteMeasures = (route) => {
  const lengths = [0];
  let total = 0;

  for (let i = 0; i < route.length - 1; i += 1) {
    const [lat1, lng1] = route[i];
    const [lat2, lng2] = route[i + 1];
    total += calculateDistance({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 });
    lengths.push(total);
  }

  return { lengths, total };
};

const getRoutePointAtProgress = (route, measures, progress) => {
  if (!route || !measures || route.length < 2) return null;

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const targetDistance = clampedProgress * measures.total;

  let segmentIndex = measures.lengths.findIndex((distance) => distance >= targetDistance);
  if (segmentIndex <= 0) segmentIndex = 1;
  if (segmentIndex >= route.length) segmentIndex = route.length - 1;

  const prevDistance = measures.lengths[segmentIndex - 1];
  const nextDistance = measures.lengths[segmentIndex];
  const fraction = nextDistance === prevDistance ? 0 : (targetDistance - prevDistance) / (nextDistance - prevDistance);
  const [lat1, lng1] = route[segmentIndex - 1];
  const [lat2, lng2] = route[segmentIndex];

  return {
    lat: lat1 + (lat2 - lat1) * fraction,
    lng: lng1 + (lng2 - lng1) * fraction,
    bearing: calculateBearing({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 }),
  };
};

const findRouteProgress = (route, measures, location) => {
  if (!route || !measures || route.length < 2) return 0;

  let best = { distanceSq: Infinity, progress: 0 };

  for (let i = 0; i < route.length - 1; i += 1) {
    const [lat1, lng1] = route[i];
    const [lat2, lng2] = route[i + 1];
    const dx = lng2 - lng1;
    const dy = lat2 - lat1;
    const segmentLengthSq = dx * dx + dy * dy;

    let t = 0;
    if (segmentLengthSq > 0) {
      t = ((location.lng - lng1) * dx + (location.lat - lat1) * dy) / segmentLengthSq;
      t = Math.max(0, Math.min(1, t));
    }

    const projectedLat = lat1 + dy * t;
    const projectedLng = lng1 + dx * t;
    const distanceSq = (projectedLat - location.lat) ** 2 + (projectedLng - location.lng) ** 2;

    if (distanceSq < best.distanceSq) {
      const segmentDistance = calculateDistance({ lat: lat1, lng: lng1 }, { lat: projectedLat, lng: projectedLng });
      best = { distanceSq, progress: (measures.lengths[i] + segmentDistance) / measures.total };
    }
  }

  return Math.max(0, Math.min(1, best.progress));
};

// The rider-panel and admin panels share the same marker rendering through
// createRiderLeafletIcon (rider.png + west-facing rotation + idle/moving states).
// This thin wrapper keeps the existing call signature while using the shared icon.
const createRiderIcon = (heading = 0, isDriving = false, showPulse = false, isSelfView = false) =>
  createRiderLeafletIcon({ heading, isDriving, showPulse, isSelfView });

export default function AnimatedRiderMarker({
  rider,
  isLive = false,
  animationDuration,
  showPulse = true,
  routeCoordinates = [],
}) {
  const map = useMap();
  const markerRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!map || !rider) return;

    // create marker once
    if (!markerRef.current) {
      markerRef.current = createAnimatedRiderMarker(map, {
        position: { lat: Number(rider.lat), lng: Number(rider.lng) },
        showPulse: showPulse && isLive,
        isDriving: rider.status === 'driving',
        isSelfView: false,
      });
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (!markerRef.current || !rider) return;

    const from = { lat: markerRef.current.getLatLng().lat, lng: markerRef.current.getLatLng().lng };
    const to = { lat: Number(rider.lat), lng: Number(rider.lng) };
    const duration = animationDuration ?? (isLive ? 3000 : 800);

    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }

    cancelRef.current = animateRiderMarker({
      marker: markerRef.current,
      from,
      to,
      route: routeCoordinates,
      duration,
      onComplete: ({ bearing }) => setMarkerBearing(markerRef.current, bearing),
    });
  }, [rider.lat, rider.lng, rider.heading, routeCoordinates, isLive, animationDuration, showPulse]);

  return null;
}
