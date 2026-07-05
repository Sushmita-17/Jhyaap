import { Order } from '@/types';
import LiveDeliveryMap from '@/components/tracking/LiveDeliveryMap';
import RiderStatusCard from '@/components/tracking/RiderStatusCard';
import { STORE_LOCATION, estimateEtaMinutes, getAreaCoordinates } from '@/lib/deliveryLocations';
import { trackingPhaseLabel } from '@/lib/riders';
import { Clock, Package } from 'lucide-react';

interface LiveOrderTrackingPanelProps {
  order: Order;
  viewer?: 'customer' | 'admin';
  compact?: boolean;
}

export default function LiveOrderTrackingPanel({
  order,
  viewer = 'customer',
  compact = false,
}: LiveOrderTrackingPanelProps) {
  const showLiveMap =
    order.deliveryRider &&
    (order.status === 'confirmed' ||
      order.status === 'preparing' ||
      order.status === 'out_for_delivery' ||
      order.status === 'delivered');
  const isLive =
    order.status === 'preparing' || order.status === 'out_for_delivery';
  const store = order.storeCoords ?? STORE_LOCATION;
  const destination = order.destinationCoords ?? getAreaCoordinates(order.address.area);
  const rider = order.deliveryRider;
  const areaName = order.address.area;

  if (!showLiveMap || !rider) return null;

  const destinationLabel = viewer === 'admin' ? 'Customer' : 'your address';
  const etaMin =
    rider.status === 'driving'
      ? estimateEtaMinutes({ lat: rider.lat, lng: rider.lng }, destination)
      : null;

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {isLive && (
        <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2.5 text-xs text-green-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
          </span>
          {trackingPhaseLabel(rider.status, order.status)}
        </div>
      )}

      <div className="panel overflow-hidden p-0">
        <div className="border-b border-white/10 bg-night-950/50 px-4 py-3 md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white">
                {viewer === 'admin' ? 'Live delivery map' : 'Track your night delivery'}
              </h3>
              <p className="mt-0.5 text-xs text-night-400">
                Kathmandu · Lalitpur · Bhaktapur — all areas on map
              </p>
            </div>
            {isLive ? (
              <span className="rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-night-950">
                Live
              </span>
            ) : order.status === 'delivered' ? (
              <span className="rounded-full bg-night-800 px-2.5 py-1 text-[10px] font-semibold text-night-300">
                Completed
              </span>
            ) : null}
          </div>

          {rider.status === 'picking' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-neon-amber">
              <Package className="h-3.5 w-3.5" />
              {rider.name.split(' ')[0]} is picking &amp; packing at Jhyaap Station
            </div>
          )}
          {rider.status === 'driving' && etaMin != null && (
            <div className="mt-2 flex items-center gap-2 text-xs text-sky-400">
              <Clock className="h-3.5 w-3.5" />
              Estimated arrival ~{etaMin} min · {areaName}
            </div>
          )}
        </div>

        <div className="p-3 md:p-4">
          <LiveDeliveryMap
            store={store}
            destination={destination}
            rider={rider}
            isLive={isLive}
            showAllAreas
            destinationAreaName={areaName}
          />
        </div>

        <div className="border-t border-white/10 px-4 py-3 md:px-5">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-night-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              Jhyaap Station
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-base leading-none">🛵</span>
              {rider.name.split(' ')[0]} · {rider.vehicle}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              {destinationLabel} — {areaName}
            </span>
          </div>

          {viewer === 'admin' && (
            <p className="mt-2 text-xs text-night-500">
              {order.address.label} · {order.address.street}, {order.address.area}
            </p>
          )}
        </div>
      </div>

      <RiderStatusCard rider={rider} isLive={isLive} orderStatus={order.status} />
    </div>
  );
}
