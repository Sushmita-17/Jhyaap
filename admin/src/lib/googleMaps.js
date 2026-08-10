import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

let loadPromise = null;

export function getGoogleMapsApiKey() {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
}

export function hasGoogleMapsApiKey() {
  return getGoogleMapsApiKey().length > 0;
}

export async function loadGoogleMaps() {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new Error('Missing VITE_GOOGLE_MAPS_API_KEY');
  }

  if (!loadPromise) {
    setOptions({ key: apiKey, v: 'weekly' });
    loadPromise = importLibrary('maps').then(() => undefined);
  }

  return loadPromise;
}

export const NIGHT_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1a1d24' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b93a7' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1d24' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a3040' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1f2430' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a4258' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1118' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#222836' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

