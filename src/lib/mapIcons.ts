import { DeliveryRider } from '@/types';

function svgToDataUrl(svg: string): string {
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

/** Bike + rider icon for live delivery tracking */
export const BIKE_RIDER_MARKER_ICON = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
  <circle cx="28" cy="28" r="26" fill="#0ea5e9" fill-opacity="0.2" stroke="#38bdf8" stroke-width="2"/>
  <g transform="translate(8,10)">
    <circle cx="30" cy="8" r="5" fill="#fde68a" stroke="#1e293b" stroke-width="1.5"/>
    <path d="M28 13c-2 1-4 4-4 7h2c0-2 1-4 3-5" fill="#fde68a" stroke="#1e293b" stroke-width="1"/>
    <circle cx="10" cy="30" r="7" fill="none" stroke="#1e293b" stroke-width="2.5"/>
    <circle cx="30" cy="30" r="7" fill="none" stroke="#1e293b" stroke-width="2.5"/>
    <path d="M10 30 L18 18 L26 18 L30 14 L34 18 L30 22 L22 22 L18 30 Z" fill="#f59e0b" stroke="#1e293b" stroke-width="1.5" stroke-linejoin="round"/>
    <rect x="20" y="16" width="8" height="5" rx="1" fill="#334155"/>
    <line x1="18" y1="18" x2="14" y2="24" stroke="#1e293b" stroke-width="2"/>
  </g>
</svg>
`);

export function riderStatusText(rider: DeliveryRider, destinationLabel = 'you'): string {
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

export function riderMapHtml(rider: DeliveryRider, isLive: boolean): string {
  const firstName = rider.name.split(' ')[0];
  const pulse = isLive && (rider.status === 'driving' || rider.status === 'picking');
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
        <img src="${BIKE_RIDER_MARKER_ICON}" width="52" height="52" alt="Rider" style="
          filter:drop-shadow(0 4px 8px rgba(0,0,0,0.45));
          ${pulse ? 'animation:jhyaap-bounce 1.2s ease-in-out infinite;' : ''}
        "/>
      </div>
      <div style="
        margin-top:-4px; transform:rotate(0deg);
        background:rgba(15,23,42,0.92); border:1px solid rgba(56,189,248,0.4);
        color:#fff; font-size:10px; font-weight:700; padding:2px 8px;
        border-radius:999px; white-space:nowrap; text-align:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
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
