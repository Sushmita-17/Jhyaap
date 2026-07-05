import { STORE_GOOGLE_MAPS_URL, STORE_LOCATION, STORE_MAPS_EMBED_URL } from '@/lib/deliveryLocations';

export const STORE_INFO = {
  name: 'Jhyaap Station',
  tagline: "Raise your glass, we'll handle the rest",
  phone: '+977 9801001101',
  phoneTel: '+9779801001101',
  email: 'jhyaapstation@gmail.com',
  address: 'Jhyaap Station, Kathmandu',
  addressShort: 'Kathmandu Valley',
  coordinates: `${STORE_LOCATION.lat}, ${STORE_LOCATION.lng}`,
  googleMapsUrl: STORE_GOOGLE_MAPS_URL,
  mapsEmbedUrl: STORE_MAPS_EMBED_URL,
  instagram: 'https://www.instagram.com/jhyaap.station/',
  facebook: 'https://www.facebook.com/jhyaap.station/',
  whatsapp: 'https://wa.me/9779801001101?text=Hi%20Jhyaap%20Station!',
  deliveryCities: ['Kathmandu', 'Lalitpur', 'Bhaktapur'] as const,
};

export function storeLocationReply(): string {
  return `**${STORE_INFO.name}**\n${STORE_INFO.address}\nCoordinates: ${STORE_INFO.coordinates}\n\nGoogle Maps:\n${STORE_INFO.googleMapsUrl}\n\nNight delivery across Kathmandu Valley. Walk-ins welcome during shop hours.`;
}
