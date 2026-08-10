import { useEffect, useRef } from 'react';
import {
  createRiderMarker,
  updateRiderPosition,
  setRiderBearing,
} from '@/lib/riderMarker';
import './RiderMarker.css';

/**
 * RiderMarker — Reusable animated rider marker for live delivery tracking.
 *
 * Plain-Leaflet friendly: pass a Leaflet map instance via the `map` prop.
 * The exact same component works in the Customer tracking view and Rider/Admin live
 * panel — just pass each map reference.
 *
 * Usage:
 *   <RiderMarker map={map} position={{lat, lng}} bearing={deg} />
 *
 * Props:
 *   map            Leaflet map instance (required)
 *   position       { lat, lng } current rider position
 *   bearing        compass direction (deg) the rider should face
 *   showYouLabel   show the floating "YOU" pill (default true)
 *   imageUrl       transparent rider image url (default '/rider-new.png')
 *   duration       animation duration in ms (default 1500)
 *   onAnimateStart optional callback when a new tween starts
 *   onAnimateEnd   optional callback when a tween completes
 */
export default function RiderMarker({
  map,
  position,
  bearing = 0,
  showYouLabel = true,
  imageUrl,
  duration = 1500,
  onAnimateStart,
  onAnimateEnd,
}) {
  const markerRef = useRef(null);
  const cancelRef = useRef(null);
  const lastPosRef = useRef(null);

  // Create the marker once (when map + position are available).
  useEffect(() => {
    if (!map || !position) return undefined;

    markerRef.current = createRiderMarker(map, {
      position,
      bearing,
      showYouLabel,
      imageUrl,
    });
    lastPosRef.current = { lat: position.lat, lng: position.lng };

    return () => {
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
    // only create on map change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Animate on position / bearing / config changes.
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || !position) return undefined;

    const prev = lastPosRef.current;
    const next = { lat: Number(position.lat), lng: Number(position.lng) };

    // If essentially the same spot, just update bearing without moving.
    const moved =
      !prev ||
      Math.abs(prev.lat - next.lat) > 1e-8 ||
      Math.abs(prev.lng - next.lng) > 1e-8;

    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }

    if (!moved) {
      setRiderBearing(marker, bearing);
      lastPosRef.current = next;
      return undefined;
    }

    if (onAnimateStart) onAnimateStart(next);

    cancelRef.current = updateRiderPosition(
      map,
      marker,
      next.lat,
      next.lng,
      bearing,
      {
        duration,
        onComplete: (result) => {
          lastPosRef.current = { lat: result.lat, lng: result.lng };
          if (onAnimateEnd) onAnimateEnd(result);
        },
      }
    );

    return () => {
      if (cancelRef.current) {
        cancelRef.current();
        cancelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, position?.lat, position?.lng, bearing, duration]);

  return null;
}
