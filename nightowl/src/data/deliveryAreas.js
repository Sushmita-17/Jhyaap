/** Kathmandu, Lalitpur & Bhaktapur delivery areas — now fetched from API */
import { getDeliveryFees } from '@/lib/backendAPI';

// Fallback data for when API is unavailable
const FALLBACK_DELIVERY_AREAS = [
  { name: 'Thamel', city: 'Kathmandu', lat: 27.7154, lng: 85.3123, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'New Baneshwor', city: 'Kathmandu', lat: 27.6889, lng: 85.3375, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Putalisadak', city: 'Kathmandu', lat: 27.705, lng: 85.319, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Durbarmarg', city: 'Kathmandu', lat: 27.712, lng: 85.317, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'New Road', city: 'Kathmandu', lat: 27.7045, lng: 85.3108, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Kamaladi', city: 'Kathmandu', lat: 27.7098, lng: 85.3165, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Asan', city: 'Kathmandu', lat: 27.7072, lng: 85.3125, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Maitighar', city: 'Kathmandu', lat: 27.6935, lng: 85.3205, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Bhadrakali', city: 'Kathmandu', lat: 27.698, lng: 85.324, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Bhotebahal', city: 'Kathmandu', lat: 27.691, lng: 85.318, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Pakhnajol', city: 'Kathmandu', lat: 27.718, lng: 85.314, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Jyatha', city: 'Kathmandu', lat: 27.716, lng: 85.309, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Kichhen', city: 'Kathmandu', lat: 27.713, lng: 85.311, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Indrachowk', city: 'Kathmandu', lat: 27.708, lng: 85.309, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Ason', city: 'Kathmandu', lat: 27.706, lng: 85.311, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Lazimpat', city: 'Kathmandu', lat: 27.728, lng: 85.322, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Baluwatar', city: 'Kathmandu', lat: 27.726, lng: 85.329, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Maharajgunj', city: 'Kathmandu', lat: 27.736, lng: 85.325, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Naxal', city: 'Kathmandu', lat: 27.72, lng: 85.333, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Sinamangal', city: 'Kathmandu', lat: 27.698, lng: 85.352, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Chabahil', city: 'Kathmandu', lat: 27.7215, lng: 85.3482, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Gaushala', city: 'Kathmandu', lat: 27.7095, lng: 85.3412, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Gongabu', city: 'Kathmandu', lat: 27.7355, lng: 85.3155, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Samakhusi', city: 'Kathmandu', lat: 27.7298, lng: 85.3085, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Balaju', city: 'Kathmandu', lat: 27.7342, lng: 85.3012, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Swayambhu', city: 'Kathmandu', lat: 27.7145, lng: 85.2905, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Boudha', city: 'Kathmandu', lat: 27.7215, lng: 85.3625, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Baneshwor', city: 'Kathmandu', lat: 27.691, lng: 85.341, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Minbhawan', city: 'Kathmandu', lat: 27.694, lng: 85.335, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Baneswor', city: 'Kathmandu', lat: 27.689, lng: 85.338, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Tinkune', city: 'Kathmandu', lat: 27.685, lng: 85.328, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Siphal', city: 'Kathmandu', lat: 27.688, lng: 85.345, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Khusibu', city: 'Kathmandu', lat: 27.732, lng: 85.318, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Naradevi', city: 'Kathmandu', lat: 27.716, lng: 85.324, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Khalibari', city: 'Kathmandu', lat: 27.719, lng: 85.328, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Sundhara', city: 'Kathmandu', lat: 27.697, lng: 85.322, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Dillibazar', city: 'Kathmandu', lat: 27.724, lng: 85.335, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Sanothimi', city: 'Kathmandu', lat: 27.682, lng: 85.376, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Balkhu', city: 'Kathmandu', lat: 27.682, lng: 85.295, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Satungal', city: 'Kathmandu', lat: 27.705, lng: 85.285, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Koteshwor', city: 'Kathmandu', lat: 27.678, lng: 85.349, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Jorpati', city: 'Kathmandu', lat: 27.7165, lng: 85.3655, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Kapan', city: 'Kathmandu', lat: 27.7245, lng: 85.3515, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Budhanilkantha', city: 'Kathmandu', lat: 27.771, lng: 85.361, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Kalanki', city: 'Kathmandu', lat: 27.6935, lng: 85.2815, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Kalimati', city: 'Kathmandu', lat: 27.6985, lng: 85.2985, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Teku', city: 'Kathmandu', lat: 27.6995, lng: 85.3075, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Tripureshwor', city: 'Kathmandu', lat: 27.6925, lng: 85.3125, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Shankhamul', city: 'Kathmandu', lat: 27.6865, lng: 85.3265, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Naagpokhari', city: 'Kathmandu', lat: 27.723, lng: 85.331, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Mahankal', city: 'Kathmandu', lat: 27.717, lng: 85.338, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Gyaneshwor', city: 'Kathmandu', lat: 27.712, lng: 85.328, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Sukedhara', city: 'Kathmandu', lat: 27.715, lng: 85.342, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Dhumbarahi', city: 'Kathmandu', lat: 27.742, lng: 85.338, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Chundevi', city: 'Kathmandu', lat: 27.738, lng: 85.332, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Maharajgunj Chok', city: 'Kathmandu', lat: 27.735, lng: 85.326, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Narayanthan', city: 'Kathmandu', lat: 27.718, lng: 85.295, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Kirtipur', city: 'Kathmandu', lat: 27.678, lng: 85.277, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Macchegaun', city: 'Kathmandu', lat: 27.665, lng: 85.282, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Panga', city: 'Kathmandu', lat: 27.682, lng: 85.272, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Thapathali', city: 'Kathmandu', lat: 27.685, lng: 85.315, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Balkot', city: 'Kathmandu', lat: 27.695, lng: 85.365, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Gokarna', city: 'Kathmandu', lat: 27.748, lng: 85.375, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Mulpani', city: 'Kathmandu', lat: 27.728, lng: 85.375, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Tokha', city: 'Kathmandu', lat: 27.755, lng: 85.345, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Dhapasi', city: 'Kathmandu', lat: 27.745, lng: 85.335, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Goldhunga', city: 'Kathmandu', lat: 27.765, lng: 85.325, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Ramkot', city: 'Kathmandu', lat: 27.758, lng: 85.305, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Syuchatar', city: 'Kathmandu', lat: 27.715, lng: 85.275, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Chandragiri', city: 'Kathmandu', lat: 27.705, lng: 85.265, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Tinthana', city: 'Kathmandu', lat: 27.725, lng: 85.285, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Naikap', city: 'Kathmandu', lat: 27.735, lng: 85.275, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Thankot', city: 'Kathmandu', lat: 27.695, lng: 85.255, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Nagarjun', city: 'Kathmandu', lat: 27.745, lng: 85.295, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Jhor', city: 'Kathmandu', lat: 27.755, lng: 85.355, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Sundarijal', city: 'Kathmandu', lat: 27.765, lng: 85.385, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Mulkharka', city: 'Kathmandu', lat: 27.775, lng: 85.375, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Sankhu', city: 'Kathmandu', lat: 27.735, lng: 85.395, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Dharmasthali', city: 'Kathmandu', lat: 27.748, lng: 85.315, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Manamaiju', city: 'Kathmandu', lat: 27.742, lng: 85.325, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Mahankalchaur', city: 'Kathmandu', lat: 27.718, lng: 85.338, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Bansbari', city: 'Kathmandu', lat: 27.738, lng: 85.345, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Kuleshwor', city: 'Kathmandu', lat: 27.685, lng: 85.285, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Soaltee Mode', city: 'Kathmandu', lat: 27.695, lng: 85.28, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Nayabazar', city: 'Kathmandu', lat: 27.67, lng: 85.31, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  // Lalitpur — Zone C/D
  { name: 'Satdobato', city: 'Lalitpur', lat: 27.658, lng: 85.325, zone: 'C', deliveryFee: 120, etaMinutes: 60 },
  { name: 'Tikathali', city: 'Lalitpur', lat: 27.665, lng: 85.365, zone: 'C', deliveryFee: 120, etaMinutes: 60 },
  { name: 'Pulchowk', city: 'Lalitpur', lat: 27.6815, lng: 85.3185, zone: 'C', deliveryFee: 120, etaMinutes: 55 },
  { name: 'Jawalakhel', city: 'Lalitpur', lat: 27.6725, lng: 85.3145, zone: 'C', deliveryFee: 120, etaMinutes: 55 },
  { name: 'Kupondole', city: 'Lalitpur', lat: 27.6865, lng: 85.3155, zone: 'C', deliveryFee: 120, etaMinutes: 55 },
  { name: 'Sanepa', city: 'Lalitpur', lat: 27.6785, lng: 85.3115, zone: 'C', deliveryFee: 120, etaMinutes: 55 },
  { name: 'Ekantakuna', city: 'Lalitpur', lat: 27.6665, lng: 85.3085, zone: 'C', deliveryFee: 120, etaMinutes: 55 },
  { name: 'Lagankhel', city: 'Lalitpur', lat: 27.6668, lng: 85.3245, zone: 'C', deliveryFee: 120, etaMinutes: 55 },
  { name: 'Kumaripati', city: 'Lalitpur', lat: 27.6705, lng: 85.3195, zone: 'C', deliveryFee: 120, etaMinutes: 55 },
  { name: 'Imadol', city: 'Lalitpur', lat: 27.6555, lng: 85.3485, zone: 'C', deliveryFee: 120, etaMinutes: 65 },
  { name: 'Lubhu', city: 'Lalitpur', lat: 27.6485, lng: 85.3385, zone: 'C', deliveryFee: 120, etaMinutes: 65 },
  { name: 'Godawari', city: 'Lalitpur', lat: 27.6125, lng: 85.3815, zone: 'D', deliveryFee: 150, etaMinutes: 90 },
  { name: 'Bungamati', city: 'Lalitpur', lat: 27.6385, lng: 85.3015, zone: 'D', deliveryFee: 150, etaMinutes: 85 },
  { name: 'Harisiddhi', city: 'Lalitpur', lat: 27.6315, lng: 85.3315, zone: 'D', deliveryFee: 150, etaMinutes: 85 },
  { name: 'Thaiba', city: 'Lalitpur', lat: 27.6215, lng: 85.3515, zone: 'D', deliveryFee: 150, etaMinutes: 90 },
  { name: 'Lalitpur', city: 'Lalitpur', lat: 27.6588, lng: 85.3247, zone: 'D', deliveryFee: 150, etaMinutes: 70 },
  { name: 'Patan', city: 'Lalitpur', lat: 27.6766, lng: 85.325, zone: 'D', deliveryFee: 150, etaMinutes: 70 },
  { name: 'Dhobighat', city: 'Lalitpur', lat: 27.6645, lng: 85.2915, zone: 'D', deliveryFee: 150, etaMinutes: 75 },
  { name: 'Nakhipot', city: 'Lalitpur', lat: 27.6525, lng: 85.3015, zone: 'D', deliveryFee: 150, etaMinutes: 75 },
  { name: 'Chapagaun', city: 'Lalitpur', lat: 27.645, lng: 85.295, zone: 'D', deliveryFee: 150, etaMinutes: 75 },
  { name: 'Bhaisepati', city: 'Lalitpur', lat: 27.66, lng: 85.31, zone: 'D', deliveryFee: 150, etaMinutes: 75 },
  { name: 'Dhapakhel', city: 'Lalitpur', lat: 27.655, lng: 85.32, zone: 'D', deliveryFee: 150, etaMinutes: 75 },
  { name: 'Khokana', city: 'Lalitpur', lat: 27.635, lng: 85.29, zone: 'D', deliveryFee: 150, etaMinutes: 75 },
  // Bhaktapur — Zone D
  { name: 'Bhaktapur', city: 'Bhaktapur', lat: 27.671, lng: 85.4298, zone: 'D', deliveryFee: 150, etaMinutes: 90 },
  { name: 'Madhyapur Thimi', city: 'Bhaktapur', lat: 27.6785, lng: 85.3845, zone: 'D', deliveryFee: 150, etaMinutes: 85 },
  { name: 'Suryabinayak', city: 'Bhaktapur', lat: 27.6515, lng: 85.4215, zone: 'D', deliveryFee: 150, etaMinutes: 95 },
  { name: 'Jagati', city: 'Bhaktapur', lat: 27.6845, lng: 85.4115, zone: 'D', deliveryFee: 150, etaMinutes: 90 },
  { name: 'Kausaltar', city: 'Bhaktapur', lat: 27.6915, lng: 85.3715, zone: 'D', deliveryFee: 150, etaMinutes: 85 },
  { name: 'Balkot', city: 'Bhaktapur', lat: 27.6655, lng: 85.3915, zone: 'D', deliveryFee: 150, etaMinutes: 90 },
  { name: 'Sallaghari', city: 'Bhaktapur', lat: 27.6585, lng: 85.4015, zone: 'D', deliveryFee: 150, etaMinutes: 95 },
  { name: 'Changunarayan', city: 'Bhaktapur', lat: 27.7155, lng: 85.4285, zone: 'D', deliveryFee: 150, etaMinutes: 100 },
  { name: 'Sirutar', city: 'Bhaktapur', lat: 27.6485, lng: 85.4185, zone: 'D', deliveryFee: 150, etaMinutes: 95 },
  { name: 'Bode', city: 'Bhaktapur', lat: 27.675, lng: 85.395, zone: 'D', deliveryFee: 150, etaMinutes: 90 },
  { name: 'Siddhapur', city: 'Bhaktapur', lat: 27.68, lng: 85.42, zone: 'D', deliveryFee: 150, etaMinutes: 90 },
  { name: 'Tatopati', city: 'Bhaktapur', lat: 27.672, lng: 85.432, zone: 'D', deliveryFee: 150, etaMinutes: 90 },
  { name: 'Byasi', city: 'Bhaktapur', lat: 27.665, lng: 85.415, zone: 'D', deliveryFee: 150, etaMinutes: 90 },
  { name: 'Gatthaghar', city: 'Bhaktapur', lat: 27.66, lng: 85.405, zone: 'D', deliveryFee: 150, etaMinutes: 90 },
  { name: 'Kamalbinayak', city: 'Bhaktapur', lat: 27.668, lng: 85.425, zone: 'D', deliveryFee: 150, etaMinutes: 90 },
  { name: 'Nagarikot', city: 'Bhaktapur', lat: 27.655, lng: 85.41, zone: 'D', deliveryFee: 150, etaMinutes: 90 },
];

// Cache for delivery areas
let cachedDeliveryAreas = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Convert API response to delivery areas format
function convertApiToDeliveryAreas(apiFees) {
  return apiFees.fees.map(fee => ({
    name: fee.area_name,
    city: fee.city,
    lat: fee.lat,
    lng: fee.lng,
    zone: fee.zone,
    deliveryFee: fee.delivery_fee,
    etaMinutes: fee.eta_minutes
  }));
}

// Fetch delivery areas from API with fallback
export async function fetchDeliveryAreas() {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cachedDeliveryAreas && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedDeliveryAreas;
  }
  
  try {
    const apiData = await getDeliveryFees();
    const areas = convertApiToDeliveryAreas(apiData);
    cachedDeliveryAreas = areas;
    cacheTimestamp = now;
    return areas;
  } catch (error) {
    console.warn('Failed to fetch delivery fees from API, using fallback:', error);
    return FALLBACK_DELIVERY_AREAS;
  }
}

// Synchronous function for backward compatibility (uses cached data)
export function getDeliveryAreas() {
  if (cachedDeliveryAreas) {
    return cachedDeliveryAreas;
  }
  return FALLBACK_DELIVERY_AREAS;
}

// Legacy functions for backward compatibility
const areaByName = new Map(FALLBACK_DELIVERY_AREAS.map((a) => [a.name, a]));

export function getDeliveryArea(name) {
  const areas = getDeliveryAreas();
  const areaMap = new Map(areas.map((a) => [a.name, a]));
  return areaMap.get(name);
}

export function getAreasByCity(city) {
  const areas = getDeliveryAreas();
  return areas.filter((a) => a.city === city);
}

export function getAllAreaNames() {
  const areas = getDeliveryAreas();
  return areas.map((a) => a.name);
}

export const DELIVERY_FEE_BY_AREA = Object.fromEntries(
  FALLBACK_DELIVERY_AREAS.map((a) => [a.name, a.deliveryFee])
);

// Export for initialization
export const DELIVERY_AREAS = FALLBACK_DELIVERY_AREAS;

