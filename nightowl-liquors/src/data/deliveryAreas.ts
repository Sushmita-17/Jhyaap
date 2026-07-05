export type DeliveryCity = 'Kathmandu' | 'Lalitpur' | 'Bhaktapur';
export type DeliveryZoneCode = 'A' | 'B' | 'C' | 'D';

export interface DeliveryAreaRecord {
  name: string;
  city: DeliveryCity;
  lat: number;
  lng: number;
  zone: DeliveryZoneCode;
  deliveryFee: number;
  etaMinutes: number;
}

/** Kathmandu, Lalitpur & Bhaktapur delivery areas — shared by map, checkout & backend seed */
export const DELIVERY_AREAS: DeliveryAreaRecord[] = [
  // Kathmandu — Zone A (core)
  { name: 'Thamel', city: 'Kathmandu', lat: 27.7154, lng: 85.3123, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'New Baneshwor', city: 'Kathmandu', lat: 27.6889, lng: 85.3375, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Putalisadak', city: 'Kathmandu', lat: 27.705, lng: 85.319, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Durbarmarg', city: 'Kathmandu', lat: 27.712, lng: 85.317, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'New Road', city: 'Kathmandu', lat: 27.7045, lng: 85.3108, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Kamaladi', city: 'Kathmandu', lat: 27.7098, lng: 85.3165, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Asan', city: 'Kathmandu', lat: 27.7072, lng: 85.3125, zone: 'A', deliveryFee: 80, etaMinutes: 35 },
  { name: 'Maitighar', city: 'Kathmandu', lat: 27.6935, lng: 85.3205, zone: 'A', deliveryFee: 80, etaMinutes: 35 },

  // Kathmandu — Zone B (mid)
  { name: 'Lazimpat', city: 'Kathmandu', lat: 27.728, lng: 85.322, zone: 'B', deliveryFee: 100, etaMinutes: 45 },
  { name: 'Baluwatar', city: 'Kathmandu', lat: 27.726, lng: 85.329, zone: 'B', deliveryFee: 100, etaMinutes: 45 },
  { name: 'Maharajgunj', city: 'Kathmandu', lat: 27.736, lng: 85.325, zone: 'B', deliveryFee: 100, etaMinutes: 45 },
  { name: 'Naxal', city: 'Kathmandu', lat: 27.72, lng: 85.333, zone: 'B', deliveryFee: 100, etaMinutes: 45 },
  { name: 'Sinamangal', city: 'Kathmandu', lat: 27.698, lng: 85.352, zone: 'B', deliveryFee: 100, etaMinutes: 45 },
  { name: 'Chabahil', city: 'Kathmandu', lat: 27.7215, lng: 85.3482, zone: 'B', deliveryFee: 100, etaMinutes: 45 },
  { name: 'Gaushala', city: 'Kathmandu', lat: 27.7095, lng: 85.3412, zone: 'B', deliveryFee: 100, etaMinutes: 45 },
  { name: 'Gongabu', city: 'Kathmandu', lat: 27.7355, lng: 85.3155, zone: 'B', deliveryFee: 100, etaMinutes: 45 },
  { name: 'Samakhusi', city: 'Kathmandu', lat: 27.7298, lng: 85.3085, zone: 'B', deliveryFee: 100, etaMinutes: 45 },
  { name: 'Balaju', city: 'Kathmandu', lat: 27.7342, lng: 85.3012, zone: 'B', deliveryFee: 100, etaMinutes: 45 },
  { name: 'Swayambhu', city: 'Kathmandu', lat: 27.7145, lng: 85.2905, zone: 'B', deliveryFee: 100, etaMinutes: 45 },
  { name: 'Boudha', city: 'Kathmandu', lat: 27.7215, lng: 85.3625, zone: 'B', deliveryFee: 100, etaMinutes: 45 },

  // Kathmandu — Zone C (outer)
  { name: 'Koteshwor', city: 'Kathmandu', lat: 27.678, lng: 85.349, zone: 'C', deliveryFee: 120, etaMinutes: 60 },
  { name: 'Jorpati', city: 'Kathmandu', lat: 27.7165, lng: 85.3655, zone: 'C', deliveryFee: 120, etaMinutes: 60 },
  { name: 'Kapan', city: 'Kathmandu', lat: 27.7245, lng: 85.3515, zone: 'C', deliveryFee: 120, etaMinutes: 60 },
  { name: 'Budhanilkantha', city: 'Kathmandu', lat: 27.771, lng: 85.361, zone: 'C', deliveryFee: 120, etaMinutes: 60 },
  { name: 'Kalanki', city: 'Kathmandu', lat: 27.6935, lng: 85.2815, zone: 'C', deliveryFee: 120, etaMinutes: 60 },
  { name: 'Kalimati', city: 'Kathmandu', lat: 27.6985, lng: 85.2985, zone: 'C', deliveryFee: 120, etaMinutes: 60 },
  { name: 'Teku', city: 'Kathmandu', lat: 27.6995, lng: 85.3075, zone: 'C', deliveryFee: 120, etaMinutes: 60 },
  { name: 'Tripureshwor', city: 'Kathmandu', lat: 27.6925, lng: 85.3125, zone: 'C', deliveryFee: 120, etaMinutes: 60 },
  { name: 'Shankhamul', city: 'Kathmandu', lat: 27.6865, lng: 85.3265, zone: 'C', deliveryFee: 120, etaMinutes: 60 },

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
  { name: 'Kirtipur', city: 'Lalitpur', lat: 27.678, lng: 85.277, zone: 'D', deliveryFee: 150, etaMinutes: 75 },
  { name: 'Dhobighat', city: 'Lalitpur', lat: 27.6645, lng: 85.2915, zone: 'D', deliveryFee: 150, etaMinutes: 75 },
  { name: 'Nakhipot', city: 'Lalitpur', lat: 27.6525, lng: 85.3015, zone: 'D', deliveryFee: 150, etaMinutes: 75 },

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
];

const areaByName = new Map(DELIVERY_AREAS.map((a) => [a.name, a]));

export function getDeliveryArea(name: string): DeliveryAreaRecord | undefined {
  return areaByName.get(name);
}

export function getAreasByCity(city: DeliveryCity): DeliveryAreaRecord[] {
  return DELIVERY_AREAS.filter((a) => a.city === city);
}

export function getAllAreaNames(): string[] {
  return DELIVERY_AREAS.map((a) => a.name);
}

export const DELIVERY_FEE_BY_AREA: Record<string, number> = Object.fromEntries(
  DELIVERY_AREAS.map((a) => [a.name, a.deliveryFee])
);
