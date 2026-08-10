import { bearingBetween } from '@/lib/deliveryLocations';
import { DELIVERY_RIDER_MARKER_ICON, RIDER_MARKER_SIZE } from '@/lib/mapIcons';
import L from 'leaflet';

export const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

export const RIDER_ICON_SIZE = RIDER_MARKER_SIZE;
// The PNG is a side-facing rider that points WEST (270°) when unrotated.
// After scaleX(-1) flip, it faces EAST (90°) - use this as the base bearing.
// Anchor at center to prevent wheelie/pivot effect - both wheels stay grounded.
// Uses transparent animated rider similar to Uber Eats/Pathao delivery systems.
export const RIDER_FACING_BEARING = 90;
export const RIDER_ICON_ANCHOR = [RIDER_MARKER_SIZE / 2, RIDER_MARKER_SIZE / 2];

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function lerpAngle(from, to, t) {
  let diff = ((to - from + 540) % 360) - 180;
  return (from + diff * t + 360) % 360;
}

export async function fetchOsrmRoute(from, to, signal) {
  if (!from?.lat || !to?.lat) return [];
  const url = `${OSRM_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const response = await fetch(url, { signal });
  const data = await response.json();
  return (data.routes?.[0]?.geometry?.coordinates ?? []).map(([lng, lat]) => [lat, lng]);
}

export function routeLength(route) {
  return Math.max(0, (route?.length ?? 0) - 1);
}

export function snapToRoute(route, lat, lng) {
  if (!route?.length) {
    return { index: 0, progress: 0, lat, lng };
  }

  let bestIndex = 0;
  let bestDistanceSq = Infinity;
  let bestLat = lat;
  let bestLng = lng;
  let bestProgress = 0;

  const total = routeLength(route);

  for (let i = 0; i < total; i += 1) {
    const [lat1, lng1] = route[i];
    const [lat2, lng2] = route[i + 1];
    const dx = lng2 - lng1;
    const dy = lat2 - lat1;
    const segmentLengthSq = dx * dx + dy * dy;

    let t = 0;
    if (segmentLengthSq > 0) {
      t = Math.max(0, Math.min(1, ((lng - lng1) * dx + (lat - lat1) * dy) / segmentLengthSq));
    }

    const projectedLat = lat1 + dy * t;
    const projectedLng = lng1 + dx * t;
    const distanceSq = (projectedLat - lat) ** 2 + (projectedLng - lng) ** 2;

    if (distanceSq < bestDistanceSq) {
      bestDistanceSq = distanceSq;
      bestIndex = i;
      bestLat = projectedLat;
      bestLng = projectedLng;
      bestProgress = (i + t) / total;
    }
  }

  return { index: bestIndex, progress: bestProgress, lat: bestLat, lng: bestLng };
}

export function getRoutePointAtProgress(route, progress) {
  if (!route?.length) return null;
  const total = routeLength(route);
  if (total === 0) {
    const [lat, lng] = route[0];
    return { lat, lng, bearing: 0 };
  }

  const scaled = Math.max(0, Math.min(1, progress)) * total;
  const index = Math.min(Math.floor(scaled), total - 1);
  const fraction = scaled - index;
  const [lat1, lng1] = route[index];
  const [lat2, lng2] = route[index + 1];

  return {
    lat: lat1 + (lat2 - lat1) * fraction,
    lng: lng1 + (lng2 - lng1) * fraction,
    bearing: bearingBetween({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 }),
  };
}

export function getRouteBearing(route, index) {
  const total = routeLength(route);
  if (total === 0) return 0;
  const i = Math.min(Math.max(0, index), total - 1);
  const [lat1, lng1] = route[i];
  const [lat2, lng2] = route[i + 1];
  return bearingBetween({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 });
}

/** Icon faces west (RIDER_FACING_BEARING); rotate so it points along the road bearing. */
export function bearingToIconRotation(bearing) {
  return ((bearing - RIDER_FACING_BEARING) % 360 + 360) % 360;
}

export function createRiderLeafletIcon({ heading = 0, showPulse = false, isDriving = false, isSelfView = false } = {}) {
  const pulseHtml = showPulse
    ? `<div class="jhyaap-rider-pulse-ring" aria-hidden="true"></div>`
    : '';

  const selfBadge = isSelfView
    ? `<span class="jhyaap-rider-you-badge">YOU</span>`
    : '';

  const stateClass = isDriving ? 'is-driving' : 'is-idle';
  const drivingClass = isDriving ? 'jhyaap-rider-marker-driving' : '';

  // No rotation - rider moves straight without spinning
  // Animated transparent rider similar to Uber Eats/Pathao delivery systems
  return L.divIcon({
    className: 'jhyaap-leaflet-rider-icon',
    html: `
      <div class="jhyaap-rider-heading ${drivingClass}" style="--rider-bearing:0deg;">
        <div class="jhyaap-rider-image-wrap ${stateClass}">
          <span class="jhyaap-rider-motion">
            <img
              src="${DELIVERY_RIDER_MARKER_ICON}"
              width="${RIDER_MARKER_SIZE}"
              height="${RIDER_MARKER_SIZE}"
              alt="Delivery rider"
              class="jhyaap-leaflet-rider-image"
              draggable="false"
            />
            ${selfBadge}
          </span>
          ${pulseHtml}
        </div>
      </div>
    `,
    iconSize: [RIDER_MARKER_SIZE, RIDER_MARKER_SIZE],
    iconAnchor: RIDER_ICON_ANCHOR,
  });
}

export function setMarkerBearing(marker, bearing) {
  // 2D rotation only (yaw) - no 3D tilt/lean (roll/pitch)
  const element = marker?.getElement?.()?.querySelector('.jhyaap-rider-heading');
  if (element) {
    element.style.setProperty('--rider-bearing', `${bearingToIconRotation(bearing)}deg`);
  }
}

export function createAnimatedRiderMarker(map, { position, showPulse, isDriving, isSelfView }) {
  const marker = L.marker([position.lat, position.lng], {
    icon: createRiderLeafletIcon({ showPulse, isDriving, isSelfView }),
    zIndexOffset: 1000,
    interactive: false, // Disable click interactions to prevent wheelie effect
  }).addTo(map);

  return marker;
}

export function animateRiderMarker({
  marker,
  from,
  to,
  route = [],
  duration = 3000,
  onComplete,
}) {
  let frameId = null;
  const startedAt = performance.now();
  
  // If route is provided, follow it sequentially through all coordinates
  if (route.length > 1) {
    const fromSnap = snapToRoute(route, from.lat, from.lng);
    const toSnap = snapToRoute(route, to.lat, to.lng);
    
    // Calculate total distance along route
    const totalSegments = routeLength(route);
    const startProgress = fromSnap.progress;
    const endProgress = toSnap.progress;
    const progressDelta = endProgress - startProgress;
    
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easeInOutQuad(progress);
      
      // Calculate current position along the route
      const currentRouteProgress = startProgress + progressDelta * eased;
      const point = getRoutePointAtProgress(route, currentRouteProgress);
      
      // Update marker position and 2D heading (yaw only - no tilt/lean)
      marker.setLatLng([point.lat, point.lng]);
      setMarkerBearing(marker, point.bearing);
      
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        // Ensure final position is exactly at destination
        marker.setLatLng([to.lat, to.lng]);
        const finalBearing = getRouteBearing(route, toSnap.index);
        setMarkerBearing(marker, finalBearing);
        onComplete?.({ lat: to.lat, lng: to.lng, bearing: finalBearing });
      }
    };
    
    frameId = requestAnimationFrame(step);
  } else {
    // Fallback to straight-line animation if no route
    const startBearing = bearingBetween(from, to);
    
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easeInOutQuad(progress);
      
      const currentLat = from.lat + (to.lat - from.lat) * eased;
      const currentLng = from.lng + (to.lng - from.lng) * eased;
      
      marker.setLatLng([currentLat, currentLng]);
      setMarkerBearing(marker, startBearing);
      
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        onComplete?.({ lat: to.lat, lng: to.lng, bearing: startBearing });
      }
    };
    
    frameId = requestAnimationFrame(step);
  }

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
  };
}
