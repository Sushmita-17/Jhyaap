function svgToDataUrl(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Rider marker — the delivery-boy photo (rider.png → rider-new.png transparent crop).
 * The SAME rider2.png exists in rider-panel/public, admin/public and API/public so
 * the marker is pixel-identical in every panel. It is never edited at runtime — all
 * smooth movement and rotation are applied through JS interpolation + CSS transform.
 * The rider faces west (RIDER_FACING_BEARING = 270°).
 */
// Larger size to match admin panel and show clearly on map.
export const RIDER_MARKER_SIZE = 64;

// Rectangle-free rider.png (rider panel photo, white background removed). No SVG.
// Uses rider-animated-transparent.png (processed transparent rider2) for the
// animated rider marker similar to Uber Eats/Pathao delivery systems.
export const DELIVERY_RIDER_MARKER_ICON = '/rider-animated-transparent.png';

export const BIKE_RIDER_MARKER_ICON = DELIVERY_RIDER_MARKER_ICON;

export const CUSTOMER_MARKER_ICON = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
  <path d="M22 2C12.06 2 4 10.06 4 20c0 14.25 18 30 18 30s18-15.75 18-30C40 10.06 31.94 2 22 2z" fill="#ef4444" stroke="#fff" stroke-width="2"/>
  <circle cx="22" cy="20" r="7" fill="#fff"/>
</svg>
`);

export const AREA_DOT_ICON = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
  <circle cx="6" cy="6" r="4" fill="#64748b" fill-opacity="0.9"/>
</svg>
`);

export const HIGHLIGHT_AREA_DOT_ICON = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <circle cx="8" cy="8" r="6" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
</svg>
`);
