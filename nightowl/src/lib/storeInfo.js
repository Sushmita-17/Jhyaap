import { STORE_GOOGLE_MAPS_URL, STORE_LOCATION, STORE_MAPS_EMBED_URL } from '@/lib/deliveryLocations';

export const STORE_INFO = {
  name: 'Jhyaap Station',
  tagline: "Raise your glass, we'll handle the rest",
  phone: '+977 9714324295',
  phoneTel: '+9779714324295',
  phone2: '+977 9843535553',
  phone2Tel: '+9779843535553',
  email: 'jhyaapstation@gmail.com',
  address: 'Jhyaap Station, Kathmandu',
  addressShort: 'Kathmandu Valley',
  coordinates: `${STORE_LOCATION.lat}, ${STORE_LOCATION.lng}`,
  googleMapsUrl: STORE_GOOGLE_MAPS_URL,
  mapsEmbedUrl: STORE_MAPS_EMBED_URL,
  instagram: 'https://www.instagram.com/jhyaap.station/',
  facebook: 'https://www.facebook.com/jhyaap.station/',
  whatsapp: 'https://wa.me/9779714324295?text=Hi%20Jhyaap%20Station!',
  deliveryCities: ['Kathmandu', 'Lalitpur', 'Bhaktapur'],
};

export function storeLocationReply() {
  return {
    type: 'location',
    text: `**${STORE_INFO.name}** - Your Night Liquor Delivery Hub\n\n📍 **Address:** ${STORE_INFO.address}\n📞 **Phone:** ${STORE_INFO.phone}\n📧 **Email:** ${STORE_INFO.email}\n\n🕐 **Delivery Hours:** 10:00 PM to 4:00 AM (NST)\n🚚 **Service Area:** Kathmandu, Lalitpur & Bhaktapur Valley\n\n💡 **About Us:** ${STORE_INFO.tagline}\n\nWe specialize in late-night alcohol delivery across the Kathmandu Valley. Order online and get your favorite drinks delivered to your doorstep during our night delivery hours.`,
    location: {
      lat: 27.7074359,
      lng: 85.2853747,
      address: STORE_INFO.address,
      googleMapsUrl: STORE_INFO.googleMapsUrl,
      mapsEmbedUrl: STORE_INFO.mapsEmbedUrl
    }
  };
}

