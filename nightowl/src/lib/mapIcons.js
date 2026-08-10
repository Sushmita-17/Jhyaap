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

/** Transparent delivery rider on scooter — faces east (right), 40px, for map rotation */
export const RIDER_MARKER_SIZE = 40;

export const DELIVERY_RIDER_MARKER_ICON = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="40" height="40">
  <g transform="translate(4, 8)">
    <ellipse cx="36" cy="62" rx="22" ry="4" fill="#0f172a" opacity="0.22"/>
    <g>
      <circle cx="14" cy="54" r="7" fill="#1f2937" stroke="#fff" stroke-width="1.5"/>
      <circle cx="14" cy="54" r="2.5" fill="#6b7280"/>
      <circle cx="54" cy="54" r="7" fill="#1f2937" stroke="#fff" stroke-width="1.5"/>
      <circle cx="54" cy="54" r="2.5" fill="#6b7280"/>
      <path d="M58 48 C58 42 50 40 46 44 L34 44 C30 40 22 40 18 46 C16 52 24 56 28 52 L46 52 C50 56 58 54 58 48 Z" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
      <path d="M52 44 L48 26 L42 26 L44 44 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.2"/>
      <path d="M50 26 C50 22 54 22 54 26 C54 30 50 30 50 26 Z" fill="#ef4444"/>
      <path d="M53 24 C55 24 55 28 53 28 Z" fill="#facc15" stroke="#ca8a04" stroke-width="0.8"/>
      <rect x="20" y="36" width="22" height="5" rx="2.5" fill="#1e293b" stroke="#0f172a" stroke-width="1"/>
      <rect x="6" y="18" width="16" height="14" rx="2" fill="#d97706" stroke="#92400e" stroke-width="1.2"/>
      <line x1="6" y1="25" x2="22" y2="25" stroke="#78350f" stroke-width="1"/>
      <line x1="14" y1="18" x2="14" y2="32" stroke="#78350f" stroke-width="1"/>
      <path d="M38 28 L38 42 L44 42 L44 34 Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="0.8"/>
      <path d="M40 18 C36 18 32 20 34 28 C38 28 40 26 41 22 Z" fill="#16a34a" stroke="#15803d" stroke-width="0.8"/>
      <path d="M38 20 L48 26 L47 28 L37 22 Z" fill="#16a34a"/>
      <circle cx="48" cy="26" r="2" fill="#fed7aa"/>
      <circle cx="42" cy="14" r="4.5" fill="#fed7aa"/>
      <path d="M47 14 C47 8 37 8 37 14 C37 16 39 17 42 17 C45 17 47 16 47 14 Z" fill="#ea580c" stroke="#c2410c" stroke-width="1.2"/>
      <path d="M47 14 L37 14" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M45 12 Q42 11 39 12" stroke="#1e293b" stroke-width="0.8" fill="none"/>
    </g>
  </g>
</svg>
`);

/** Transparent left-facing delivery rider on scooter — 64px, for Leaflet rotation */
export const RIDER_MARKER_SIZE = 64;

export const DELIVERY_RIDER_MARKER_ICON = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="46" cy="48" r="7.5" fill="#1f2937" stroke="#111827" stroke-width="0.9"/>
  <circle cx="46" cy="48" r="6.2" fill="#374151"/>
  <circle cx="46" cy="48" r="3" fill="#6b7280"/>
  <circle cx="46" cy="48" r="1.2" fill="#9ca3af"/>

  <circle cx="16" cy="48" r="7.5" fill="#1f2937" stroke="#111827" stroke-width="0.9"/>
  <circle cx="16" cy="48" r="6.2" fill="#374151"/>
  <circle cx="16" cy="48" r="3" fill="#6b7280"/>
  <circle cx="16" cy="48" r="1.2" fill="#9ca3af"/>

  <path d="M10 44 Q16 38 22 44" fill="#22c55e" stroke="#15803d" stroke-width="0.9" stroke-linecap="round"/>
  <rect x="18" y="42" width="28" height="3.5" rx="1.2" fill="#1f2937"/>
  <path d="M14 42 L14 34 Q14 28 20 26 L28 24" fill="#22c55e" stroke="#15803d" stroke-width="0.9" stroke-linejoin="round"/>
  <path d="M14 34 Q18 30 22 28" fill="none" stroke="#15803d" stroke-width="0.6"/>
  <path d="M28 24 L40 24 Q44 24 46 28 L48 34 L48 42 L18 42 L18 34 Q18 28 22 26 L28 24" fill="#22c55e" stroke="#15803d" stroke-width="0.9" stroke-linejoin="round"/>
  <path d="M40 24 L48 24 Q52 24 52 28 L52 34 L48 34" fill="#22c55e" stroke="#15803d" stroke-width="0.9"/>
  <rect x="48" y="20" width="6" height="2" rx="1" fill="#6b7280"/>

  <rect x="30" y="28" width="18" height="5" rx="2.5" fill="#1e293b" stroke="#0f172a" stroke-width="0.9"/>
  <path d="M30 30 Q39 28 48 30" fill="none" stroke="#0f172a" stroke-width="0.6"/>

  <rect x="48" y="10" width="14" height="18" rx="2" fill="#22c55e" stroke="#15803d" stroke-width="0.9"/>
  <rect x="48" y="10" width="14" height="5.5" rx="2" fill="#4ade80"/>
  <line x1="48" y1="19" x2="62" y2="19" stroke="#15803d" stroke-width="0.8"/>
  <path d="M55 10 L55 19" stroke="#78350f" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M55 19 L52 22 M55 19 L58 22" stroke="#78350f" stroke-width="1.1" stroke-linecap="round"/>
  <rect x="54" y="13" width="2" height="1.8" rx="0.4" fill="#15803d"/>
  <rect x="54" y="22" width="2" height="1.8" rx="0.4" fill="#15803d"/>

  <line x1="10" y1="26" x2="18" y2="22" stroke="#22c55e" stroke-width="2.4" stroke-linecap="round"/>
  <line x1="10" y1="26" x2="10" y2="32" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>
  <line x1="10" y1="26" x2="10" y2="28" stroke="#1f2937" stroke-width="2.6" stroke-linecap="round"/>
  <line x1="10" y1="26" x2="6" y2="20" stroke="#1f2937" stroke-width="0.9" stroke-linecap="round"/>
  <ellipse cx="5.5" cy="19" rx="2" ry="1.2" fill="#22c55e" stroke="#15803d" stroke-width="0.7"/>
  <circle cx="12" cy="28" r="2.2" fill="#f9fafb" stroke="#9ca3af" stroke-width="0.7"/>
  <rect x="46" y="40" width="5" height="2.2" rx="1.1" fill="#6b7280" stroke="#4b5563" stroke-width="0.6"/>

  <path d="M28 30 L26 40 L30 40 L32 30" fill="#92400e" stroke="#78350f" stroke-width="0.8"/>
  <path d="M32 30 L34 40 L38 40 L36 30" fill="#92400e" stroke="#78350f" stroke-width="0.8"/>
  <ellipse cx="28" cy="41" rx="3" ry="1.4" fill="#451a03"/>
  <ellipse cx="36" cy="41" rx="3" ry="1.4" fill="#451a03"/>

  <path d="M22 22 C20 22 18 26 20 30 L28 30 C30 26 28 22 26 22" fill="#22c55e" stroke="#15803d" stroke-width="0.9"/>
  <path d="M23 22 Q25 24 27 22" fill="#78350f" stroke="#451a03" stroke-width="0.5"/>
  <path d="M22 24 L16 26" stroke="#22c55e" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="14" cy="26" r="1.6" fill="#22c55e" stroke="#15803d" stroke-width="0.6"/>
  <circle cx="10" cy="26" r="1.4" fill="#16a34a" stroke="#15803d" stroke-width="0.6"/>

  <rect x="22" y="16" width="3.5" height="3" rx="1" fill="#fed7aa"/>
  <circle cx="24" cy="12" r="5.5" fill="#fed7aa" stroke="#fbbf24" stroke-width="0.7"/>
  <ellipse cx="29.5" cy="13" rx="1.3" ry="1.8" fill="#fed7aa" stroke="#fbbf24" stroke-width="0.5"/>
  <path d="M19 10 Q19 6 24 6 Q29 6 29 10" fill="#92400e" stroke="#78350f" stroke-width="0.6"/>
  <circle cx="22" cy="11" r="0.8" fill="#1f2937"/>
  <path d="M21 14 Q22 15 23 14" stroke="#1f2937" stroke-width="0.7" fill="none" stroke-linecap="round"/>
  <ellipse cx="21.5" cy="12.5" rx="1.2" ry="0.6" fill="#fca5a5" opacity="0.35"/>

  <path d="M19 12 C19 6 29 6 29 12 C29 15 27 16 25 16 C21 16 19 15 19 12" fill="#5eead4" stroke="#15803d" stroke-width="0.9"/>
  <path d="M19 12 C19 8 24 6 29 12" fill="none" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round"/>
  <circle cx="28" cy="13" r="0.7" fill="#e5e7eb" stroke="#9ca3af" stroke-width="0.4"/>
  <path d="M22 15 L24 17 L26 15" fill="none" stroke="#1f2937" stroke-width="0.7" stroke-linecap="round"/>
</svg>
`);

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
  const firstName = rider.name.split(' ')[0];
  const pulse = isLive && (rider.status === 'driving' || rider.status === 'picking');
  const statusIcon = rider.status === 'picking' ? '📦' : rider.status === 'driving' ? '🛵' : '🏪';
  const heading = rider.heading ?? 233;
  const isWestbound = heading > 180 && heading < 360;

  return `
    <div class="jhyaap-rider-marker" style="
      position:absolute; transform:translate(-50%,-50%);
      transition:left 2s linear, top 2s linear;
      pointer-events:none; z-index:999; display:flex; flex-direction:column; align-items:center;
    ">
      <div style="position:relative; display:flex; align-items:center; justify-center:center;">
        <!-- Rotating 233Â° Amber Direction Pointer Beam -->
        <div style="
          position:absolute; inset:-12px; display:flex; align-items:center; justify-content:center;
          transform:rotate(${heading}deg); transition:transform 0.8s ease; pointer-events:none;
        ">
          <div style="
            width:0; height:0; border-left:7px solid transparent; border-right:7px solid transparent;
            border-bottom:22px solid #f59e0b; transform:translateY(-26px); filter:drop-shadow(0 0 8px #f59e0b);
          "></div>
        </div>

        <!-- STRAIGHT & UPRIGHT Rider Character (0Â° tilt) -->
        <div style="
          position:relative; z-index:10; transform:scaleX(${isWestbound ? -1 : 1});
          transition:transform 0.5s ease;
        ">
          <img src="${DELIVERY_RIDER_MARKER_ICON}" width="52" height="52" alt="Rider" style="
            filter:drop-shadow(0 4px 8px rgba(0,0,0,0.45));
            ${pulse ? 'animation:jhyaap-bounce 1.2s ease-in-out infinite;' : ''}
          "/>
        </div>
      </div>
      <div style="
        margin-top:2px; transform:rotate(0deg);
        background:rgba(15,23,42,0.92); border:1px solid rgba(56,189,248,0.4);
        color:#fff; font-size:10px; font-weight:700; padding:2px 8px;
        border-radius:999px; white-space:nowrap; text-align:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.35); position:relative; z-index:20;
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

