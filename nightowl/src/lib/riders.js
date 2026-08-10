import { STORE_LOCATION } from '@/lib/deliveryLocations';

export const RIDER_POOL = [
  {
    id: 'r1',
    name: 'Ramesh Karki',
    phone: '+977-9801111001',
    vehicle: 'Honda Activa',
    plateNumber: 'Ba 5 Pa 1234',
  },
  {
    id: 'r2',
    name: 'Priya Shrestha',
    phone: '+977-9802222002',
    vehicle: 'Yamaha FZ',
    plateNumber: 'Ba 4 Pa 5678',
  },
  {
    id: 'r3',
    name: 'Arun Bajracharya',
    phone: '+977-9803333003',
    vehicle: 'TVS Jupiter',
    plateNumber: 'Ba 2 Pa 9012',
  },
];

export function createRiderAtStore() {
  const profile = RIDER_POOL[Math.floor(Math.random() * RIDER_POOL.length)];
  return {
    ...profile,
    lat: STORE_LOCATION.lat,
    lng: STORE_LOCATION.lng,
    heading: 0,
    speed: 0,
    status: 'idle',
    updatedAt: new Date().toISOString(),
  };
}

export function riderLabel(rider) {
  return `${rider.name} · ${rider.vehicle}`;
}

export function formatRiderSpeed(speed) {
  return `${Math.round(speed)} km/h`;
}

export function statusLabel(status) {
  switch (status) {
    case 'picking':
      return 'Picking order';
    case 'driving':
      return 'On the way';
    case 'arrived':
      return 'Arrived nearby';
    default:
      return 'At Jhyaap Station';
  }
}

export function trackingPhaseLabel(status, orderStatus) {
  if (status === 'picking' || orderStatus === 'preparing') {
    return 'Rider is packing your bottles at the store';
  }
  if (status === 'driving' || orderStatus === 'out_for_delivery') {
    return 'Live GPS — rider on bike heading to you';
  }
  if (status === 'arrived') return 'Rider has reached your area';
  return 'Rider assigned — waiting at Jhyaap Station';
}

export function riderInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

