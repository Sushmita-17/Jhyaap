// Type imports removed - these are JSDoc type definitions only, not actual exports

function svgToDataUrl(svg) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const STORE_MARKER_ICON = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="22" fill="#22c55e" stroke="#fff" stroke-width="3"/>
  <rect x="14" y="18" width="20" height="16" rx="2" fill="#14532d"/>
  <path d="M14 22h20M20 18v-4h8v4" stroke="#86efac" stroke-width="2" fill="none"/>
</svg>
`);

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

/**
 * Rider marker — the detailed delivery-rider SVG asset (full rider + helmet + scooter +
 * two wheels + handlebars + delivery box). The SAME delivery-rider.svg file exists in
 * rider-panel/public and admin/public so the marker is pixel-identical in every panel.
 * It is never edited at runtime — all smooth movement and rotation are applied through
 * JS interpolation + CSS transform. The rider faces west (RIDER_FACING_BEARING = 270°).
 */
export const RIDER_MARKER_SIZE = 48;

// Rectangle-free rider.png (rider panel photo, white background removed). No SVG.
// Uses rider-new.png (cleaner transparent delivery-boy photo) for a medium-size
// rider marker that matches the customer/rider panels.
export const DELIVERY_RIDER_MARKER_ICON = '/rider-new.png';

/** Alias for backward compatibility */
export const BIKE_RIDER_MARKER_ICON = DELIVERY_RIDER_MARKER_ICON;

export function riderStatusText(rider, destinationLabel = 'you') {
  switch (rider.status) {
    case 'picking':
      return `${rider.name.split(' ')[0]} is picking your order at Jhyaap Station`;
    case 'driving':
      return `${rider.name.split(' ')[0]} is on the way to ${destinationLabel}`;
    case 'arrived':
      return `${rider.name.split(' ')[0]} has arrived near ${destinationLabel}`;
    default:
      return `${rider.name.split(' ')[0]} is at Jhyaap Station`;
  }
}

export function riderMapHtml(rider, isLive) {
  const firstName = rider.name && rider.name !== 'undefined' && rider.name.trim() ? rider.name.split(' ')[0] : 'Rider';
  const statusIcon = rider.status === 'picking' ? '📦' : rider.status === 'driving' ? '🛵' : '🏪';

  return `
    <div class="jhyaap-rider-marker" style="
      position:absolute; transform:translate(-50%,-50%);
      transition:left 2s linear, top 2s linear;
      pointer-events:none; z-index:999;
    ">
      <div style="
        display:flex; flex-direction:column; align-items:center; gap:2px;
        transform:rotate(${rider.heading}deg);
        transition:transform 0.8s ease;
      ">
        <img src="${BIKE_RIDER_MARKER_ICON}" width="32" height="32" alt="Rider" style="
        "/>
      </div>
      <div style="
        margin-top:-2px; transform:rotate(0deg);
        background:rgba(15,23,42,0.92); border:1px solid rgba(56,189,248,0.4);
        color:#fff; font-size:9px; font-weight:700; padding:1px 6px;
        border-radius:999px; white-space:nowrap; text-align:center;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      ">${statusIcon} ${firstName}</div>
    </div>
  `;
}

export const RIDER_MARKER_STYLES = `
  @keyframes jhyaap-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }
`;

