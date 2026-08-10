// Type imports removed - these are JSDoc type definitions only, not actual exports
import { formatRiderSpeed, riderInitials, riderLabel, statusLabel, trackingPhaseLabel } from '@/lib/riders';
import { Bike, Gauge, Navigation, Package, Phone } from 'lucide-react';

export default function RiderStatusCard({ rider, isLive, orderStatus }) {
  const isDriving = rider.status === 'driving';
  const isPicking = rider.status === 'picking';

  return (
    <div className="panel overflow-hidden p-0">
      <div className="border-b border-white/10 bg-night-950/50 px-5 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Your delivery rider</p>
          {isLive && (isDriving || isPicking) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              Live GPS
            </span>
          )}
        </div>
        {isLive && (
          <p className="mt-1 text-xs text-night-400">{trackingPhaseLabel(rider.status, orderStatus)}</p>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-amber/15 text-lg font-bold text-neon-amber">
                {riderInitials(rider.name)}
              </span>
              {(isDriving || isPicking) && (
                <span
                  className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-night-950 ${
                    isPicking ? 'bg-neon-amber' : 'bg-green-500'
                  }`}
                >
                  {isPicking ? <Package className="h-3.5 w-3.5" /> : <Bike className="h-3.5 w-3.5" />}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-white">{rider.name}</p>
              <p className="text-sm text-night-400">{riderLabel(rider)}</p>
              <p className="mt-0.5 text-xs text-night-500">{rider.plateNumber}</p>
            </div>
          </div>
          <a
            href={`tel:${rider.phone}`}
            className="rounded-xl bg-green-500/10 p-3 text-green-400 transition-colors hover:bg-green-500/20"
          >
            <Phone className="h-5 w-5" />
          </a>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-night-950/60 p-3 text-center">
            <Navigation className="mx-auto mb-1 h-4 w-4 text-neon-amber" />
            <p className="text-[10px] uppercase tracking-wide text-night-500">Status</p>
            <p
              className={`mt-0.5 text-xs font-semibold ${
                isDriving ? 'text-green-400' : isPicking ? 'text-neon-amber' : 'text-white'
              }`}
            >
              {statusLabel(rider.status)}
            </p>
          </div>
          <div className="rounded-xl bg-night-950/60 p-3 text-center">
            <Gauge className="mx-auto mb-1 h-4 w-4 text-neon-amber" />
            <p className="text-[10px] uppercase tracking-wide text-night-500">Speed</p>
            <p className="mt-0.5 text-xs font-semibold text-white">
              {isPicking ? 'At store' : formatRiderSpeed(rider.speed)}
            </p>
          </div>
          <div className="rounded-xl bg-night-950/60 p-3 text-center">
            <Bike className="mx-auto mb-1 h-4 w-4 text-neon-amber" />
            <p className="text-[10px] uppercase tracking-wide text-night-500">Vehicle</p>
            <p className="mt-0.5 truncate text-xs font-semibold text-white">{rider.vehicle.split(' ')[0]}</p>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] text-night-500">
          Last updated {new Date(rider.updatedAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

