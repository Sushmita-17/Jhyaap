import { DELIVERY_AREAS, getDeliveryArea } from '@/data/deliveryAreas';

/** Jhyaap Station - Kathmandu (Google Maps place) */
export const STORE_LOCATION = {
  lat: 27.7074359,
  lng: 85.2853747,
  label: 'Jhyaap Station',
};

export const STORE_GOOGLE_MAPS_URL =
  'https://www.google.com/maps/place/Jhyaap+Station/@27.7074359,85.2827944,17z/data=!3m1!4b1!4m6!3m5!1s0x39eb19002dae6771:0x36fc3574343c71d2!8m2!3d27.7074359!4d85.2853747';

export const STORE_MAPS_EMBED_URL = `https://www.google.com/maps?q=${STORE_LOCATION.lat},${STORE_LOCATION.lng}&z=17&output=embed`;

/** Valley center for full-area map view */
export const VALLEY_MAP_CENTER = {
  lat: 27.69,
  lng: 85.34,
  label: 'Kathmandu Valley',
};

export { DELIVERY_AREAS };

export function getAreaCoordinates(area) {
  const record = getDeliveryArea(area);
  if (record) {
    return { lat: record.lat, lng: record.lng, label: record.name };
  }
  return { lat: 27.7, lng: 85.32, label: area };
}

export function interpolatePoint(from, to, progress) {
  const t = Math.min(1, Math.max(0, progress));
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}

export function bearingBetween(from, to) {
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function haversineKm(from, to) {
  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function estimateEtaMinutes(from, to, speedKmh = 22) {
  const km = haversineKm(from, to);
  return Math.max(5, Math.round((km / speedKmh) * 60));
}

export function googleMapsDirectionsUrl(origin, destination) {
  return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
}

export function googleMapsRiderTrackUrl(rider, destination) {
  return googleMapsDirectionsUrl(rider, destination);
}

