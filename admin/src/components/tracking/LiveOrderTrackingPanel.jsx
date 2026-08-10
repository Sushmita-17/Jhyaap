import LiveDeliveryMap from '@/components/tracking/LiveDeliveryMap';
import RiderStatusCard from '@/components/tracking/RiderStatusCard';
import { STORE_LOCATION, estimateEtaMinutes, getAreaCoordinates } from '@/lib/deliveryLocations';
import { trackingPhaseLabel } from '@/lib/riders';
import { Clock, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
const API_BASE = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

export default function LiveOrderTrackingPanel({
  order,
  viewer = 'admin',
  compact = false,
}) {
  const showLiveMap =
    order.deliveryRider &&
    (order.status === 'out_for_delivery' || order.status === 'picked_up' || order.status === 'delivered');
  const isLive = order.status === 'picked_up';
  const store = order.storeCoords ?? STORE_LOCATION;
  const destination = order.destinationCoords ?? getAreaCoordinates(order.address.area);
  const areaName = order.address.area;
  const initialRider = order.deliveryRider;

  const [liveRider, setLiveRider] = useState(initialRider);
  const [arrivalNotice, setArrivalNotice] = useState(false);

  useEffect(() => {
    setLiveRider(initialRider);
  }, [initialRider]);

  useEffect(() => {
    if (!isLive || !order.id) return;

    const fetchLocation = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/tracking/${order.id}/location`);
        const result = await response.json();
        
        if (result.status === 'success' && result.data) {
          setLiveRider((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              lat: result.data.lat,
              lng: result.data.lng,
              heading: result.data.heading ?? prev.heading,
              status: result.data.status ?? prev.status,
            };
          });
        }
      } catch (err) {
        // Silent fail
      }
    };

    fetchLocation();
    const intervalId = setInterval(fetchLocation, 3000);

    return () => clearInterval(intervalId);
  }, [order.id, isLive]);

  useEffect(() => {
    if (liveRider?.status !== 'arrived' || arrivalNotice) return;
    setArrivalNotice(true);
  }, [liveRider?.status, arrivalNotice]);

  if (!showLiveMap || !liveRider) return null;

  const destinationLabel = 'Customer';
  const etaMin =
    liveRider.status === 'driving'
      ? estimateEtaMinutes({ lat: liveRider.lat, lng: liveRider.lng }, destination)
      : null;

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {arrivalNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-3 text-sm font-semibold text-emerald-300">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Rider arrived at customer location.
        </div>
      )}
      {isLive && (
        <div className="flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2.5 text-xs text-green-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
          </span>
          {trackingPhaseLabel(liveRider.status, order.status)}
        </div>
      )}

      <div className="panel overflow-hidden p-0">
        <div className="border-b border-white/10 bg-night-950/50 px-4 py-3 md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white">Live delivery map</h3>
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

          {liveRider.status === 'driving' && etaMin != null && (
            <div className="mt-2 flex items-center gap-2 text-xs text-sky-400">
              <Clock className="h-3.5 w-3.5" />
              Estimated arrival ~{etaMin} min · {areaName}
            </div>
          )}
        </div>

        <div className="p-0 border-b border-white/10 relative z-0">
          <LiveDeliveryMap
            store={store}
            destination={destination}
            rider={liveRider}
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
              {liveRider.name.split(' ')[0]} · {liveRider.vehicle}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              {destinationLabel} — {areaName}
            </span>
          </div>

          <p className="mt-2 text-xs text-night-500">
            {order.address.label} · {order.address.street}, {order.address.area}
          </p>
        </div>
      </div>

      <RiderStatusCard rider={liveRider} isLive={isLive} orderStatus={order.status} />
    </div>
  );
}
