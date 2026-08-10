// Re-export rider-panel local rider tracking helpers
import {
  animateRiderMarker,
  createAnimatedRiderMarker,
  createRiderLeafletIcon,
  setMarkerBearing,
} from '@/lib/riderTracking';

/**
 * Positional-args helper for backward compatibility with LeafletRiderMap.
 * Signature: createRiderIcon(heading, isDriving, showPulse, isSelfView)
 */
const createRiderIcon = (heading = 0, isDriving = false, showPulse = false, isSelfView = false) =>
  createRiderLeafletIcon({ heading, isDriving, showPulse, isSelfView });

export { animateRiderMarker, createAnimatedRiderMarker, createRiderIcon, setMarkerBearing };

