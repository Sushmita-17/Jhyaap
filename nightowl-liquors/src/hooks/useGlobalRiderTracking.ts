import { useEffect } from 'react';
import { useOrdersStore } from '@/store/ordersStore';

/** Auto-advances orders + updates live GPS for all active deliveries */
export function useGlobalRiderTracking() {
  const tickActiveDeliveries = useOrdersStore((s) => s.tickActiveDeliveries);
  const advanceOrderPipeline = useOrdersStore((s) => s.advanceOrderPipeline);

  useEffect(() => {
    const interval = setInterval(() => {
      advanceOrderPipeline();
      tickActiveDeliveries();
    }, 2500);

    return () => clearInterval(interval);
  }, [tickActiveDeliveries, advanceOrderPipeline]);
}
