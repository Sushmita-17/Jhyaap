import { useEffect, useMemo, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
// Reuse shared tracking helpers for consistent marker + animation
import {
  createAnimatedRiderMarker as adminCreateAnimatedRiderMarker,
  animateRiderMarker as adminAnimateRiderMarker,
  createRiderLeafletIcon as adminCreateRiderIcon,
  setMarkerBearing as adminSetMarkerBearing,
} from '@/lib/riderTracking';

/**
 * AnimatedRiderMarker - Production-ready animated rider marker for customer panel (nightowl)
 * 
 * Features:
 * - Smooth 60 FPS interpolation between GPS points
 * - Direction-based rotation (bearing calculation)
 * - Pulse effect for live indication
 * - Graceful handling of GPS signal loss
 * - Optimized for React with minimal re-renders
 */

// Calculate bearing between two points in degrees
const calculateBearing = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => deg * (Math.PI / 180);
  const toDeg = (rad) => rad * (180 / Math.PI);
  
  const dLon = toRad(lng2 - lng1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
          Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  
  const bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
};

// Smooth easing function for natural movement
const easeOutCubic = (t) => {
  return 1 - Math.pow(1 - t, 3);
};

// Use simple image instead of SVG - no transforms, no animations, just stable two-wheel driving
const getScooterSvg = (heading = 0, isDriving = false) => {
  return '';
};

// Create Leaflet icon with pulse effect - NO rotation, just stable image
const createRiderIcon = (heading = 0, isDriving = false, showPulse = false) => {
  const pulseHtml = showPulse ? `
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-12 h-12 rounded-full bg-[#C9A84C]/20 animate-ping" style="animation-duration: 1.5s"></div>
      <div class="absolute w-8 h-8 rounded-full bg-[#C9A84C]/30 animate-ping" style="animation-delay: 0.15s; animation-duration: 1.5s"></div>
      <div class="absolute w-6 h-6 rounded-full bg-[#C9A84C]/40 animate-ping" style="animation-delay: 0.3s; animation-duration: 1.5s"></div>
    </div>
  ` : '';

  return L.divIcon({
    className: 'custom-leaflet-marker-rider',
    html: `
      <div class="relative flex items-center justify-center pointer-events-none">
        <div class="relative z-10">
          ${pulseHtml}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

/**
 * AnimatedRiderMarker Component for Customer Panel
 * 
 * @param {Object} rider - Rider data with lat, lng, heading, status
 * @param {boolean} isLive - Whether this is a live tracking session
 * @param {number} animationDuration - Duration of animation between points in ms (default: 5000 for live, 800 for replay)
 * @param {boolean} showPulse - Show pulse effect around rider (default: true for live)
 * @param {Array} routeCoordinates - Array of [lat, lng] coordinates for the route polyline
 */
export default function AnimatedRiderMarker({ 
  rider, 
  isLive = false, 
  animationDuration,
  showPulse = true,
  routeCoordinates = []
}) {
  const map = useMap();
  const markerRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!map || !rider) return;

    // Create marker once
    if (!markerRef.current) {
      markerRef.current = adminCreateAnimatedRiderMarker(map, {
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

    cancelRef.current = adminAnimateRiderMarker({
      marker: markerRef.current,
      from,
      to,
      route: routeCoordinates,
      duration,
      onComplete: ({ bearing }) => {
        adminSetMarkerBearing(markerRef.current, bearing);
      }
    });
  }, [rider.lat, rider.lng, rider.heading, routeCoordinates, isLive, animationDuration, showPulse]);

  return null;
}
