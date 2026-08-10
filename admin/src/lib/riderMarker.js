/**
 * riderMarker.js — Reusable Leaflet rider-marker core (used by both rider-panel & admin).
 *
 * Uses L.divIcon (NOT L.icon) so the transparent rider image can be combined with a
 * floating "YOU" label in a single marker. Only the <img> rotates by bearing; the
 * label always stays flat/horizontal.
 *
 * The rider image is NEVER edited — all movement/rotation is CSS + JS.
 */
import L from 'leaflet';

// Default transparent rider asset served from /public.
// Rectangle-free rider.png (rider panel photo, white background removed). No SVG.
// Uses rider-new.png (cleaner transparent delivery-boy photo) for a medium-size marker.
export const RIDER_IMAGE_URL = '/rider-new.png';

// The side-facing rider points WEST (270°) when unrotated.
// Anchor at center to prevent wheelie/pivot effect - both wheels stay grounded
export const RIDER_FACING_BEARING = 270;

// Styling / anchor constants per spec.
// Smaller so the rider fits inside the inDrive-style orange direction ring.
export const RIDER_ICON_SIZE = [44, 52];
// Anchor at center to prevent wheelie/pivot effect - both wheels stay grounded
export const RIDER_ICON_ANCHOR = [22, 26];
export const RIDER_POPUP_ANCHOR = [0, -44];

/** Convert a compass bearing (0–360) to the CSS rotation needed so the icon points
 *  along that bearing, given the base facing direction of the artwork. */
export function bearingToIconRotation(bearing) {
  return (((bearing - RIDER_FACING_BEARING) % 360) + 360) % 360;
}

/** Bearing (0–360) from `from` → `to` using the haversine formula. */
export function bearingBetween(from, to) {
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Ease-out cubic for smooth deceleration at the end of each tween. */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/** Ease-in-out quad for smooth acceleration and deceleration (realistic vehicle movement) */
export function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Shortest-path angle interpolation across the 0/360 wrap-around. */
export function lerpAngle(from, to, t) {
  const diff = ((to - from + 540) % 360) - 180;
  return (from + diff * t + 360) % 360;
}

/**
 * Build the Leaflet divIcon exactly per spec.
 * @param {object} opts
 * @param {number} [opts.bearing=0]        compass bearing (deg)
 * @param {boolean} [opts.showYouLabel=true]  render the floating "YOU" pill
 * @param {string} [opts.imageUrl]         url of the transparent rider image
 * @returns {L.DivIcon}
 */
export function createRiderDivIcon({
  bearing = 0,
  showYouLabel = true,
  imageUrl = RIDER_IMAGE_URL,
  isDriving = false,
} = {}) {
  const rotation = bearingToIconRotation(bearing);
  const youLabel = showYouLabel ? `<div class="you-label">YOU</div>` : '';
  // Direction ring removed per user request.
  const directionRing = '';

  return L.divIcon({
    className: 'custom-rider-marker',
    html: `
      <div class="rider-marker-wrapper">
        ${youLabel}
        ${directionRing}
        <img
          src="${imageUrl}"
          alt="Rider"
          class="rider-icon"
          style="transform: rotate(${rotation}deg);"
          draggable="false"
        />
      </div>
    `,
    iconSize: RIDER_ICON_SIZE,
    iconAnchor: RIDER_ICON_ANCHOR,
    popupAnchor: RIDER_POPUP_ANCHOR,
  });
}

/** Update only the <img> rotation (label stays flat). */
export function setRiderBearing(marker, bearing) {
  const element = marker && marker.getElement && marker.getElement();
  const img = element && element.querySelector('.rider-icon');
  if (img) {
    img.style.transform = `rotate(${bearingToIconRotation(bearing)}deg)`;
  }
}

/** Create and add the rider marker to a Leaflet map. */
export function createRiderMarker(map, { position, bearing = 0, showYouLabel = true, imageUrl, isDriving = false } = {}) {
  const marker = L.marker([position.lat, position.lng], {
    icon: createRiderDivIcon({ bearing, showYouLabel, imageUrl, isDriving }),
    zIndexOffset: 1000,
  }).addTo(map);
  return marker;
}

/**
 * Smoothly animate a rider marker from its current lat/lng to a new one over
 * ~1–2s using requestAnimationFrame + easing. Rotates the icon to the given bearing.
 *
 * @param {object} map       Leaflet map instance
 * @param {L.Marker} marker  the rider marker to move
 * @param {number} newLat    destination latitude
 * @param {number} newLng    destination longitude
 * @param {number} bearing   compass bearing (deg) to face on arrival
 * @param {object} [opts]
 * @param {number} [opts.duration=1500]  ms duration of the tween
 * @param {Function} [opts.onComplete]   called when tween finishes
 * @returns {Function} cancel        call to abort the animation
 */
export function updateRiderPosition(map, marker, newLat, newLng, bearing, opts = {}) {
  const { duration = 1500, onComplete } = opts;

  const from = marker.getLatLng();
  const to = { lat: newLat, lng: newLng };
  const startBearing = bearingBetween(from, to);
  const endBearing = Number.isFinite(bearing) ? bearing : startBearing;

  let frameId = null;
  // Rotate immediately so the rider turns before/while moving.
  setRiderBearing(marker, startBearing);

  const startedAt = performance.now();

  const step = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = easeInOutQuad(progress);

    const lat = from.lat + (to.lat - from.lat) * eased;
    const lng = from.lng + (to.lng - from.lng) * eased;
    const currentBearing = lerpAngle(startBearing, endBearing, eased);

    marker.setLatLng([lat, lng]);
    setRiderBearing(marker, currentBearing);

    if (progress < 1) {
      frameId = requestAnimationFrame(step);
    } else {
      setRiderBearing(marker, endBearing);
      onComplete && onComplete({ lat: to.lat, lng: to.lng, bearing: endBearing });
    }
  };

  frameId = requestAnimationFrame(step);

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
  };
}
