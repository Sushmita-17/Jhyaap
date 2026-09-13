const fs = require('fs');
const path = require('path');

function p(cmd) {
  console.log(cmd);
}

// Color palette
const C = {
  mint: '#7ED4AD',
  darkMint: '#5BB894',
  darkGreen: '#2D7D5F',
  deeperGreen: '#1F5F47',
  brown: '#A0724A',
  darkBrown: '#6B3F2A',
  black: '#1A1A1A',
  darkGray: '#374151',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  white: '#FFFFFF',
  skin: '#F5D0B0',
  darkSkin: '#E8B890',
  helmetShine: '#CCFBF1',
  jacketLight: '#A8F0C8',
  jacketStripe: '#4CAF50',
  boxLight: '#8BE6B8',
  boxDark: '#2D7D5F',
  metal: '#9CA3AF',
  metalDark: '#4B5563',
  tire: '#1F2937',
  spoke: '#9CA3AF',
  hub: '#6B7280',
  brake: '#D1D5DB',
  eye: '#1F2937',
  mouth: '#C0392B',
  cheek: '#F5A5A5',
  hair: '#6B4226',
  hairLight: '#8B5A2B',
  undershirt: '#1F2937',
  shoe: '#5C3A21',
  shoeSole: '#3D1F0A',
  glove: '#7ED4AD',
  gloveDark: '#5BB894',
  mirror: '#D1D5DB',
  light: '#FEF3C7',
  exhaust: '#4B5563',
  seat: '#374151',
  rack: '#6B7280',
  susp: '#4B5563',
  mudguard: '#1F2937',
  fender: '#111827',
};

function mkPath(d, attrs = {}) {
  const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `<path d="${d}" ${attrStr}/>`;
}

function circle(cx, cy, r, attrs = {}) {
  const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `<circle cx="${cx}" cy="${cy}" r="${r}" ${attrStr}/>`;
}

function ellipse(cx, cy, rx, ry, attrs = {}) {
  const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${attrStr}/>`;
}

function line(x1, y1, x2, y2, attrs = {}) {
  const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${attrStr}/>`;
}

function roundedRect(x, y, w, h, r, attrs = {}) {
  const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `<path d="M${x+r} ${y} L${x+w-r} ${y} Q${x+w} ${y} ${x+w} ${y+r} L${x+w} ${y+h-r} Q${x+w} ${y+h} ${x+w-r} ${y+h} L${x+r} ${y+h} Q${x} ${y+h} ${x} ${y+h-r} L${x} ${y+r} Q${x} ${y} ${x+r} ${y} Z" ${attrStr}/>`;
}

const parts = [];

// === WHEELS ===
parts.push(`<!-- FRONT WHEEL -->`);
parts.push(`<g id="front-wheel">`);
parts.push(roundedRect(8, 44, 16, 16, 8, { fill: C.tire, stroke: C.fender, 'stroke-width': '0.6' }));
parts.push(circle(16, 52, 7.5, { fill: 'none', stroke: C.metalDark, 'stroke-width': '0.8' }));
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2;
  parts.push(line(16 + 7.2 * Math.cos(a), 52 + 7.2 * Math.sin(a), 16 + 7.8 * Math.cos(a), 52 + 7.8 * Math.sin(a), { stroke: C.darkGray, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
}
for (let i = 0; i < 16; i++) {
  const a = (i / 16) * Math.PI * 2;
  const len = 6.2;
  parts.push(line(16, 52, 16 + len * Math.cos(a), 52 + len * Math.sin(a), { stroke: C.spoke, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
}
parts.push(circle(16, 52, 3.5, { fill: C.hub, stroke: C.metalDark, 'stroke-width': '0.6' }));
parts.push(circle(16, 52, 2, { fill: C.brake, stroke: C.metal, 'stroke-width': '0.4' }));
parts.push(line(16, 50, 16, 54, { stroke: C.metalDark, 'stroke-width': '1.2', 'stroke-linecap': 'round' }));
parts.push(circle(16, 52, 2.8, { fill: 'none', stroke: C.brake, 'stroke-width': '0.8' }));
parts.push(line(14.5, 51.5, 17.5, 52.5, { stroke: C.metal, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(line(14.5, 52.5, 17.5, 51.5, { stroke: C.metal, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(circle(16, 52, 0.8, { fill: C.metal }));
parts.push(`</g>`);

parts.push(`<!-- REAR WHEEL -->`);
parts.push(`<g id="rear-wheel">`);
parts.push(roundedRect(38, 44, 16, 16, 8, { fill: C.tire, stroke: C.fender, 'stroke-width': '0.6' }));
parts.push(circle(46, 52, 7.5, { fill: 'none', stroke: C.metalDark, 'stroke-width': '0.8' }));
for (let i = 0; i < 12; i++) {
  const a = (i / 12) * Math.PI * 2;
  parts.push(line(46 + 7.2 * Math.cos(a), 52 + 7.2 * Math.sin(a), 46 + 7.8 * Math.cos(a), 52 + 7.8 * Math.sin(a), { stroke: C.darkGray, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
}
for (let i = 0; i < 16; i++) {
  const a = (i / 16) * Math.PI * 2;
  const len = 6.2;
  parts.push(line(46, 52, 46 + len * Math.cos(a), 52 + len * Math.sin(a), { stroke: C.spoke, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
}
parts.push(circle(46, 52, 3.5, { fill: C.hub, stroke: C.metalDark, 'stroke-width': '0.6' }));
parts.push(circle(46, 52, 2, { fill: C.brake, stroke: C.metal, 'stroke-width': '0.4' }));
parts.push(line(46, 50, 46, 54, { stroke: C.metalDark, 'stroke-width': '1.2', 'stroke-linecap': 'round' }));
parts.push(circle(46, 52, 2.8, { fill: 'none', stroke: C.brake, 'stroke-width': '0.8' }));
parts.push(line(44.5, 51.5, 47.5, 52.5, { stroke: C.metal, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(line(44.5, 52.5, 47.5, 51.5, { stroke: C.metal, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(circle(46, 52, 0.8, { fill: C.metal }));
parts.push(`</g>`);

// === FRONT MUDGUARD ===
parts.push(`<!-- FRONT MUDGUARD -->`);
parts.push(`<g id="front-mudguard">`);
parts.push(mkPath(`M10 44 Q8 42 10 40 Q14 38 16 40 Q18 42 16 44 Q14 46 10 44 Z`, { fill: C.mudguard, stroke: C.fender, 'stroke-width': '0.5' }));
parts.push(mkPath(`M11 42 Q12 41 14 42 Q12 43 11 42 Z`, { fill: C.lightGray, opacity: '0.3' }));
parts.push(`</g>`);

// === REAR MUDGUARD ===
parts.push(`<!-- REAR MUDGUARD -->`);
parts.push(`<g id="rear-mudguard">`);
parts.push(mkPath(`M40 44 Q38 42 40 40 Q44 38 46 40 Q48 42 46 44 Q44 46 40 44 Z`, { fill: C.mudguard, stroke: C.fender, 'stroke-width': '0.5' }));
parts.push(mkPath(`M41 42 Q42 41 44 42 Q42 43 41 42 Z`, { fill: C.lightGray, opacity: '0.3' }));
parts.push(`</g>`);

// === SCOOTER BODY ===
parts.push(`<!-- SCOOTER BODY -->`);
parts.push(`<g id="scooter-body">`);
parts.push(mkPath(`M14 46 Q12 42 14 38 Q16 34 20 32 L24 30 Q28 28 32 28 L40 28 Q44 28 48 30 L50 32 Q52 34 52 38 Q52 42 50 46 L14 46 Z`, { fill: C.mint, stroke: C.darkGreen, 'stroke-width': '0.8', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M16 40 Q20 36 26 34 L40 34 Q46 34 50 38`, { fill: 'none', stroke: C.darkMint, 'stroke-width': '0.6', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M18 38 Q22 35 30 34 L44 34 Q48 34 50 38`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M20 42 Q24 39 32 38 L44 38 Q48 38 50 42`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M10 44 Q8 38 10 32 Q14 28 18 28 L22 30 Q18 34 16 38 Q14 42 14 46 L10 44 Z`, { fill: C.mint, stroke: C.darkGreen, 'stroke-width': '0.8', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M12 36 Q14 32 18 30`, { fill: 'none', stroke: C.darkMint, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M14 46 L14 48 Q16 50 20 50 L44 50 Q48 50 50 48 L50 46 L14 46 Z`, { fill: C.darkGray, stroke: C.black, 'stroke-width': '0.6' }));
parts.push(mkPath(`M16 48 L16 49 Q18 49.5 20 49.5 L44 49.5 Q46 49.5 48 49 L48 48 L16 48 Z`, { fill: C.gray, opacity: '0.3' }));
parts.push(line(18, 48.5, 46, 48.5, { stroke: C.metalDark, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(line(20, 49, 44, 49, { stroke: C.metalDark, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M18 46 L18 44 Q20 42 24 42 L28 42 Q30 42 30 44 L30 46`, { fill: 'none', stroke: C.metalDark, 'stroke-width': '1', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
parts.push(line(20, 44, 28, 44, { stroke: C.metal, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
parts.push(line(20, 45, 28, 45, { stroke: C.metal, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === SEAT ===
parts.push(`<!-- SEAT -->`);
parts.push(`<g id="scooter-seat">`);
parts.push(mkPath(`M28 34 Q26 32 28 30 Q32 28 38 28 Q44 28 46 30 Q48 32 46 34 Q44 36 38 36 Q32 36 28 34 Z`, { fill: C.seat, stroke: C.black, 'stroke-width': '0.7', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M30 32 Q34 30 40 30 Q44 30 46 32`, { fill: 'none', stroke: C.darkGray, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M32 33 Q36 32 42 32 Q44 32 45 33`, { fill: 'none', stroke: C.gray, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(circle(36, 31, 0.5, { fill: C.metal, opacity: '0.5' }));
parts.push(circle(40, 31, 0.5, { fill: C.metal, opacity: '0.5' }));
parts.push(`</g>`);

// === REAR RACK ===
parts.push(`<!-- REAR RACK -->`);
parts.push(`<g id="rear-rack">`);
parts.push(mkPath(`M44 30 L48 26 Q50 24 52 24 L54 24 Q56 24 56 26 L56 32 Q56 34 54 34 L44 34 Q42 34 42 32 L42 30 Q42 28 44 28 L52 28 Q54 28 54 30 L54 32 Q54 34 52 34 L44 34`, { fill: C.rack, stroke: C.metalDark, 'stroke-width': '0.6', 'stroke-linejoin': 'round' }));
parts.push(line(44, 32, 54, 32, { stroke: C.metalDark, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(line(44, 30, 54, 30, { stroke: C.metalDark, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === ENGINE COVER ===
parts.push(`<!-- ENGINE COVER -->`);
parts.push(`<g id="engine-cover">`);
parts.push(mkPath(`M30 42 Q28 44 28 46 L30 48 Q32 50 36 50 L42 50 Q46 50 48 48 L50 46 Q50 44 48 42 L30 42 Z`, { fill: C.exhaust, stroke: C.metalDark, 'stroke-width': '0.6', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M32 44 Q34 43 38 43 L46 43 Q48 43 48 45`, { fill: 'none', stroke: C.metal, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(circle(36, 46, 1.2, { fill: C.brake, stroke: C.metalDark, 'stroke-width': '0.4' }));
parts.push(circle(40, 46, 0.8, { fill: C.metal, stroke: C.metalDark, 'stroke-width': '0.3' }));
parts.push(mkPath(`M34 48 L36 48 L38 48`, { fill: 'none', stroke: C.metalDark, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M42 48 L44 48 L46 48`, { fill: 'none', stroke: C.metalDark, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === EXHAUST ===
parts.push(`<!-- EXHAUST -->`);
parts.push(`<g id="exhaust">`);
parts.push(mkPath(`M48 48 Q50 48 52 46 Q54 44 54 42`, { fill: C.exhaust, stroke: C.metalDark, 'stroke-width': '0.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M52 44 Q54 42 54 40`, { fill: 'none', stroke: C.metalDark, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
parts.push(circle(54, 40, 1.5, { fill: C.metal, stroke: C.metalDark, 'stroke-width': '0.5' }));
parts.push(mkPath(`M53 40 L55 40`, { fill: 'none', stroke: C.darkGray, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === SUSPENSION ===
parts.push(`<!-- SUSPENSION -->`);
parts.push(`<g id="suspension">`);
parts.push(mkPath(`M18 44 L18 40 Q18 38 20 38 L22 38 Q24 38 24 40 L24 44`, { fill: C.susp, stroke: C.metalDark, 'stroke-width': '0.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M18 42 L20 42 L22 42 L24 42`, { fill: 'none', stroke: C.metal, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M48 44 L48 40 Q48 38 50 38 L52 38 Q54 38 54 40 L54 44`, { fill: C.susp, stroke: C.metalDark, 'stroke-width': '0.6', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M48 42 L50 42 L52 42 L54 42`, { fill: 'none', stroke: C.metal, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === HANDLEBARS ===
parts.push(`<!-- HANDLEBARS -->`);
parts.push(`<g id="handlebars">`);
parts.push(mkPath(`M14 32 Q12 30 12 28 Q12 26 14 26 L16 26 Q18 26 18 28 L18 30 Q18 32 16 32`, { fill: C.metalDark, stroke: C.black, 'stroke-width': '0.7', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M8 26 Q10 24 14 24 L18 24 Q22 24 22 26 L22 28 Q22 30 18 30 L14 30 Q10 30 10 28 L10 26 Q10 24 8 26 Z`, { fill: C.metalDark, stroke: C.black, 'stroke-width': '0.7', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M8 26 Q6 26 6 28 Q6 30 8 30`, { fill: C.black, stroke: C.darkGray, 'stroke-width': '0.5' }));
parts.push(line(7, 27, 7, 29, { stroke: C.darkGray, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M22 26 Q24 26 24 28 Q24 30 22 30`, { fill: C.black, stroke: C.darkGray, 'stroke-width': '0.5' }));
parts.push(line(23, 27, 23, 29, { stroke: C.darkGray, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === BRAKE LEVERS ===
parts.push(`<!-- BRAKE LEVERS -->`);
parts.push(`<g id="brake-levers">`);
parts.push(mkPath(`M10 26 Q8 24 10 22`, { fill: 'none', stroke: C.metalDark, 'stroke-width': '1.2', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M22 26 Q24 24 22 22`, { fill: 'none', stroke: C.metalDark, 'stroke-width': '1.2', 'stroke-linecap': 'round' }));
parts.push(circle(10, 22, 0.8, { fill: C.metal, stroke: C.metalDark, 'stroke-width': '0.4' }));
parts.push(circle(22, 22, 0.8, { fill: C.metal, stroke: C.metalDark, 'stroke-width': '0.4' }));
parts.push(`</g>`);

// === REAR-VIEW MIRROR ===
parts.push(`<!-- REAR-VIEW MIRROR -->`);
parts.push(`<g id="rear-view-mirror">`);
parts.push(mkPath(`M10 24 Q8 20 10 16 Q12 14 14 16 Q14 18 12 20 Q10 22 10 24 Z`, { fill: C.mirror, stroke: C.metalDark, 'stroke-width': '0.6', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M10 18 Q11 17 12 18`, { fill: 'none', stroke: C.white, 'stroke-width': '0.3', 'stroke-linecap': 'round', opacity: '0.6' }));
parts.push(mkPath(`M11 20 L11 22`, { fill: 'none', stroke: C.metalDark, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === HEADLIGHT ===
parts.push(`<!-- HEADLIGHT -->`);
parts.push(`<g id="headlight">`);
parts.push(mkPath(`M8 32 Q6 30 8 28 Q12 26 14 28 Q14 30 12 32 Q10 34 8 32 Z`, { fill: C.light, stroke: C.metalDark, 'stroke-width': '0.6', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M9 30 Q10 29 11 30 Q10 31 9 30 Z`, { fill: C.white, opacity: '0.7' }));
parts.push(line(10, 31, 10, 33, { stroke: C.metalDark, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === REAR LIGHT ===
parts.push(`<!-- REAR LIGHT -->`);
parts.push(`<g id="rear-light">`);
parts.push(mkPath(`M50 32 Q52 30 52 28 Q52 26 50 26 Q48 26 48 28 Q48 30 50 32 Z`, { fill: '#EF4444', stroke: C.darkBrown, 'stroke-width': '0.6', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M49 28 Q50 27 51 28 Q50 29 49 28 Z`, { fill: C.white, opacity: '0.5' }));
parts.push(`</g>`);

// === WHEEL COVERS ===
parts.push(`<!-- WHEEL COVERS -->`);
parts.push(`<g id="wheel-covers">`);
parts.push(mkPath(`M10 42 Q8 40 10 38 Q14 36 16 38 Q18 40 16 42 Q14 44 10 42 Z`, { fill: C.fender, stroke: C.black, 'stroke-width': '0.5', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M11 40 Q13 39 15 40 Q13 41 11 40 Z`, { fill: C.darkGray, opacity: '0.3' }));
parts.push(mkPath(`M42 42 Q40 40 42 38 Q46 36 48 38 Q50 40 48 42 Q46 44 42 42 Z`, { fill: C.fender, stroke: C.black, 'stroke-width': '0.5', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M43 40 Q45 39 47 40 Q45 41 43 40 Z`, { fill: C.darkGray, opacity: '0.3' }));
parts.push(`</g>`);

// === RIDER LEGS ===
parts.push(`<!-- RIDER LEGS -->`);
parts.push(`<g id="rider-legs">`);
parts.push(mkPath(`M28 36 L22 40 Q18 42 16 44 L14 46 Q12 48 14 48 L18 48 Q20 48 20 46 L22 44 Q24 42 26 40 L28 38`, { fill: C.brown, stroke: C.darkBrown, 'stroke-width': '0.7', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M32 36 L38 40 Q42 42 44 44 L46 46 Q48 48 46 48 L42 48 Q40 48 40 46 L38 44 Q36 42 34 40 L32 38`, { fill: C.brown, stroke: C.darkBrown, 'stroke-width': '0.7', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M22 42 Q24 41 26 42`, { fill: 'none', stroke: C.darkBrown, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M38 42 Q40 41 42 42`, { fill: 'none', stroke: C.darkBrown, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M12 48 L18 48 Q20 48 20 46 L20 44 Q18 42 14 42 L12 42 Q10 42 10 44 L10 46 Q10 48 12 48 Z`, { fill: C.shoe, stroke: C.shoeSole, 'stroke-width': '0.7', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M44 48 L50 48 Q52 48 52 46 L52 44 Q50 42 46 42 L44 42 Q42 42 42 44 L42 46 Q42 48 44 48 Z`, { fill: C.shoe, stroke: C.shoeSole, 'stroke-width': '0.7', 'stroke-linejoin': 'round' }));
parts.push(line(12, 44, 18, 44, { stroke: C.shoeSole, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(line(12, 45, 18, 45, { stroke: C.shoeSole, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(line(44, 44, 50, 44, { stroke: C.shoeSole, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(line(44, 45, 50, 45, { stroke: C.shoeSole, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(line(14, 43, 16, 43, { stroke: C.darkSkin, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(line(46, 43, 48, 43, { stroke: C.darkSkin, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === RIDER TORSO ===
parts.push(`<!-- RIDER TORSO -->`);
parts.push(`<g id="rider-torso">`);
parts.push(mkPath(`M22 36 Q20 34 20 30 L20 24 Q20 22 22 22 L32 22 Q34 22 34 24 L34 30 Q34 32 32 36 L22 36 Z`, { fill: C.mint, stroke: C.darkGreen, 'stroke-width': '0.8', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M22 24 Q22 22 24 22 L30 22 Q32 22 32 24`, { fill: C.jacketLight, stroke: C.darkGreen, 'stroke-width': '0.6' }));
parts.push(line(26, 24, 26, 34, { stroke: C.darkMint, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M22 28 L24 28 L24 30 L22 30 Z`, { fill: C.darkMint, stroke: C.darkGreen, 'stroke-width': '0.4' }));
parts.push(mkPath(`M28 28 L30 28 L30 30 L28 30 Z`, { fill: C.darkMint, stroke: C.darkGreen, 'stroke-width': '0.4' }));
parts.push(mkPath(`M20 26 L34 26`, { fill: 'none', stroke: C.jacketStripe, 'stroke-width': '1', 'stroke-linecap': 'round', opacity: '0.6' }));
parts.push(mkPath(`M24 22 L28 22 L28 24 L24 24 Z`, { fill: C.undershirt, stroke: C.black, 'stroke-width': '0.4' }));
parts.push(mkPath(`M24 22 L26 20 L28 22`, { fill: C.undershirt, stroke: C.black, 'stroke-width': '0.4', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M20 26 L16 28`, { fill: 'none', stroke: C.mint, 'stroke-width': '3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M34 26 L36 28`, { fill: 'none', stroke: C.mint, 'stroke-width': '2.5', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === RIDER ARMS ===
parts.push(`<!-- RIDER ARMS -->`);
parts.push(`<g id="rider-arms">`);
parts.push(mkPath(`M20 28 Q16 30 14 32 Q12 34 12 36 L12 38 Q12 40 14 40 L16 40 Q18 40 18 38 L18 36 Q18 34 16 32 Q16 30 18 28`, { fill: C.mint, stroke: C.darkGreen, 'stroke-width': '0.7', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M34 28 Q36 30 38 32 Q40 34 40 36 L40 38 Q40 40 38 40 L36 40 Q34 40 34 38 L34 36 Q34 34 36 32 Q36 30 34 28`, { fill: C.mint, stroke: C.darkGreen, 'stroke-width': '0.7', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M12 40 Q10 40 10 42 Q10 44 12 44 L14 44 Q16 44 16 42 L16 40 Q16 38 14 38 L12 38 Q10 38 10 40 Z`, { fill: C.glove, stroke: C.gloveDark, 'stroke-width': '0.6', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M40 40 Q38 40 38 42 Q38 44 40 44 L42 44 Q44 44 44 42 L44 40 Q44 38 42 38 L40 38 Q38 38 38 40 Z`, { fill: C.glove, stroke: C.gloveDark, 'stroke-width': '0.6', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M11 41 L15 41`, { fill: 'none', stroke: C.gloveDark, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M39 41 L43 41`, { fill: 'none', stroke: C.gloveDark, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === RIDER HEAD ===
parts.push(`<!-- RIDER HEAD -->`);
parts.push(`<g id="rider-head">`);
parts.push(mkPath(`M24 22 L24 20 Q24 18 26 18 L28 18 Q30 18 30 20 L30 22`, { fill: C.skin, stroke: C.darkSkin, 'stroke-width': '0.5', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M22 18 Q20 16 20 14 Q20 10 24 10 Q28 10 28 14 Q28 16 26 18 L24 18 Q22 18 22 18 Z`, { fill: C.skin, stroke: C.darkSkin, 'stroke-width': '0.7', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M28 14 Q30 14 30 16 Q30 18 28 18`, { fill: C.skin, stroke: C.darkSkin, 'stroke-width': '0.5' }));
parts.push(mkPath(`M28.5 14.5 Q29.5 14.5 29.5 16 Q29.5 17.5 28.5 17.5`, { fill: C.darkSkin, opacity: '0.4' }));
parts.push(mkPath(`M20 16 Q22 18 24 18 L28 18 Q28 16 26 14`, { fill: 'none', stroke: C.darkSkin, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
parts.push(circle(22, 13, 1, { fill: C.eye }));
parts.push(circle(21.5, 12.7, 0.3, { fill: C.white }));
parts.push(mkPath(`M21 13.5 Q22 14 23 13.5`, { fill: 'none', stroke: C.darkSkin, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M20 12 Q21 11.5 23 12`, { fill: 'none', stroke: C.hair, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M21 14 Q20 15 21 15.5 Q22 16 22 15.5`, { fill: 'none', stroke: C.darkSkin, 'stroke-width': '0.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M20 16 Q22 17.5 24 16`, { fill: 'none', stroke: C.mouth, 'stroke-width': '0.7', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M20 16 Q22 17 24 16`, { fill: C.white, opacity: '0.3' }));
parts.push(circle(21, 15, 0.8, { fill: C.cheek, opacity: '0.3' }));
parts.push(`</g>`);

// === HAIR ===
parts.push(`<!-- HAIR -->`);
parts.push(`<g id="rider-hair">`);
parts.push(mkPath(`M20 14 Q18 12 18 10 Q18 8 20 8 Q22 8 24 8 Q26 8 28 8 Q28 10 26 12 Q24 14 22 14 Q20 14 20 14 Z`, { fill: C.hair, stroke: C.hairLight, 'stroke-width': '0.6', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M19 10 Q20 9 21 10`, { fill: 'none', stroke: C.hairLight, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M22 9 Q23 8 24 9`, { fill: 'none', stroke: C.hairLight, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M25 9 Q26 8 27 9`, { fill: 'none', stroke: C.hairLight, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M18 10 Q17 9 18 8`, { fill: 'none', stroke: C.hairLight, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M28 10 Q29 9 28 8`, { fill: 'none', stroke: C.hairLight, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(circle(20, 8, 0.6, { fill: C.hairLight, opacity: '0.4' }));
parts.push(circle(26, 8, 0.6, { fill: C.hairLight, opacity: '0.4' }));
parts.push(`</g>`);

// === HELMET ===
parts.push(`<!-- HELMET -->`);
parts.push(`<g id="rider-helmet">`);
parts.push(mkPath(`M18 16 Q16 14 16 12 Q16 8 20 6 Q24 4 28 6 Q30 8 30 12 Q30 14 28 16 L26 18 Q24 20 22 20 L20 20 Q18 20 18 18 L18 16 Z`, { fill: C.mint, stroke: C.darkGreen, 'stroke-width': '0.9', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M20 6 Q24 4 28 6 Q26 5 24 5 Q22 5 20 6 Z`, { fill: C.mint, stroke: C.darkGreen, 'stroke-width': '0.5' }));
parts.push(mkPath(`M16 12 Q16 14 18 14 Q20 14 22 14`, { fill: 'none', stroke: C.darkMint, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M18 16 Q16 14 16 12 Q16 8 20 6 Q24 4 28 6 Q30 8 30 12 Q30 14 28 16 L26 18 Q24 20 22 20 L20 20 Q18 20 18 18 L18 16 Z`, { fill: 'none', stroke: C.white, 'stroke-width': '1', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M18 18 Q18 20 20 20 L22 20`, { fill: 'none', stroke: C.black, 'stroke-width': '0.8', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M18 18 L16 20 Q14 22 16 24`, { fill: 'none', stroke: C.black, 'stroke-width': '0.8', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M16 24 Q18 22 20 20`, { fill: 'none', stroke: C.black, 'stroke-width': '0.6', 'stroke-linecap': 'round' }));
parts.push(circle(16, 22, 0.6, { fill: C.metal, stroke: C.metalDark, 'stroke-width': '0.3' }));
parts.push(circle(16, 22, 0.2, { fill: C.white }));
parts.push(mkPath(`M20 8 Q22 6 24 8 Q22 10 20 8 Z`, { fill: C.helmetShine, opacity: '0.4' }));
parts.push(mkPath(`M22 7 Q23 6 24 7 Q23 8 22 7 Z`, { fill: C.white, opacity: '0.5' }));
parts.push(circle(20, 10, 0.4, { fill: C.white, opacity: '0.3' }));
parts.push(circle(22, 10, 0.3, { fill: C.darkGreen, opacity: '0.4' }));
parts.push(circle(24, 9, 0.3, { fill: C.darkGreen, opacity: '0.4' }));
parts.push(circle(26, 10, 0.3, { fill: C.darkGreen, opacity: '0.4' }));
parts.push(`</g>`);

// === DELIVERY BOX ===
parts.push(`<!-- DELIVERY BOX -->`);
parts.push(`<g id="delivery-box">`);
parts.push(mkPath(`M46 32 Q44 30 44 28 L44 20 Q44 18 46 18 L58 18 Q60 18 60 20 L60 42 Q60 44 58 44 L46 44 Q44 44 44 42 L44 32 Z`, { fill: C.mint, stroke: C.darkGreen, 'stroke-width': '0.9', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M44 20 L44 18 Q44 16 46 16 L58 16 Q60 16 60 18 L60 20 Q60 22 58 22 L46 22 Q44 22 44 20 Z`, { fill: C.darkMint, stroke: C.darkGreen, 'stroke-width': '0.7', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M60 20 L62 18 Q64 16 64 18 L64 42 Q64 44 62 42 L60 44`, { fill: C.darkGreen, stroke: C.deeperGreen, 'stroke-width': '0.6', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M60 22 L62 20 Q63 18 62 16`, { fill: 'none', stroke: C.deeperGreen, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M60 42 L62 40 Q63 38 62 36`, { fill: 'none', stroke: C.deeperGreen, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M46 16 L58 16 Q60 16 60 18 L60 20 Q60 22 58 22 L46 22 Q44 22 44 20 L44 18 Q44 16 46 16 Z`, { fill: C.mint, stroke: C.darkGreen, 'stroke-width': '0.7' }));
parts.push(mkPath(`M44 18 L44 20`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.6', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M60 18 L60 20`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.6', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M44 42 L44 44`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.6', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M60 42 L60 44`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.6', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M48 24 L56 24 L56 38 L48 38 Z`, { fill: C.boxLight, stroke: C.darkGreen, 'stroke-width': '0.5', opacity: '0.5' }));
parts.push(mkPath(`M50 28 L54 28`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.4', 'stroke-linecap': 'round', opacity: '0.6' }));
parts.push(mkPath(`M50 30 L54 30`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.3', 'stroke-linecap': 'round', opacity: '0.5' }));
parts.push(mkPath(`M50 32 L52 32`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.3', 'stroke-linecap': 'round', opacity: '0.5' }));
parts.push(mkPath(`M48 20 L48 40`, { fill: 'none', stroke: C.brown, 'stroke-width': '2.5', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M56 20 L56 40`, { fill: 'none', stroke: C.brown, 'stroke-width': '2.5', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M48 26 L48 34`, { fill: 'none', stroke: C.darkBrown, 'stroke-width': '1.5', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M56 26 L56 34`, { fill: 'none', stroke: C.darkBrown, 'stroke-width': '1.5', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M46.5 26 L49.5 26 L49.5 29 L46.5 29 Z`, { fill: C.metal, stroke: C.metalDark, 'stroke-width': '0.5' }));
parts.push(mkPath(`M56.5 26 L59.5 26 L59.5 29 L56.5 29 Z`, { fill: C.metal, stroke: C.metalDark, 'stroke-width': '0.5' }));
parts.push(circle(48, 27.5, 0.3, { fill: C.black }));
parts.push(circle(58, 27.5, 0.3, { fill: C.black }));
parts.push(mkPath(`M44 28 L42 26 Q40 24 42 22 L44 22`, { fill: C.metalDark, stroke: C.black, 'stroke-width': '0.5', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M44 34 L42 36 Q40 38 42 40 L44 40`, { fill: C.metalDark, stroke: C.black, 'stroke-width': '0.5', 'stroke-linejoin': 'round' }));
parts.push(circle(42, 24, 0.4, { fill: C.metal, stroke: C.metalDark, 'stroke-width': '0.3' }));
parts.push(circle(42, 38, 0.4, { fill: C.metal, stroke: C.metalDark, 'stroke-width': '0.3' }));
parts.push(`</g>`);

// === ADDITIONAL BODY DETAILS ===
parts.push(`<!-- ADDITIONAL BODY DETAILS -->`);
parts.push(`<g id="body-details">`);
parts.push(mkPath(`M16 36 Q20 32 28 30 L44 30`, { fill: 'none', stroke: C.white, 'stroke-width': '0.5', 'stroke-linecap': 'round', opacity: '0.3' }));
parts.push(mkPath(`M18 42 Q24 38 36 38 L48 38`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.5', 'stroke-linecap': 'round', opacity: '0.4' }));
parts.push(mkPath(`M10 42 Q12 40 16 40 Q20 40 22 42`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M40 42 Q44 40 46 40 Q50 40 52 42`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M14 38 Q18 35 26 34 L46 34 Q50 34 52 38`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.6', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M8 30 Q6 28 8 26 Q10 24 12 26`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.5', 'stroke-linecap': 'round' }));
parts.push(line(52, 44, 54, 44, { stroke: C.metal, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(line(52, 45, 54, 45, { stroke: C.metal, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === ADDITIONAL RIDER DETAILS ===
parts.push(`<!-- ADDITIONAL RIDER DETAILS -->`);
parts.push(`<g id="rider-details">`);
parts.push(mkPath(`M22 30 Q24 29 26 30`, { fill: 'none', stroke: C.darkMint, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M24 32 Q26 31 28 32`, { fill: 'none', stroke: C.darkMint, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M22 34 Q24 33 26 34`, { fill: 'none', stroke: C.darkMint, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M23 22 Q24 21 26 21 Q28 21 29 22`, { fill: 'none', stroke: C.darkGreen, 'stroke-width': '0.4', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M16 34 Q18 33 20 34`, { fill: 'none', stroke: C.darkMint, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M36 34 Q38 33 40 34`, { fill: 'none', stroke: C.darkMint, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(line(12, 42, 14, 42, { stroke: C.gloveDark, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(line(12, 43, 14, 43, { stroke: C.gloveDark, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(line(40, 42, 42, 42, { stroke: C.gloveDark, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(line(40, 43, 42, 43, { stroke: C.gloveDark, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M18 10 Q17 9 19 8`, { fill: 'none', stroke: C.hair, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M26 9 Q27 8 28 9`, { fill: 'none', stroke: C.hair, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(circle(24, 7, 0.3, { fill: C.hairLight, opacity: '0.3' }));
parts.push(mkPath(`M21.5 12.5 Q22 12 22.5 12.5`, { fill: 'none', stroke: C.skin, 'stroke-width': '0.2', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M21 16.5 Q22 17 23 16.5`, { fill: C.white, opacity: '0.3' }));
parts.push(`</g>`);

// === CHROME DETAILS ===
parts.push(`<!-- CHROME DETAILS -->`);
parts.push(`<g id="chrome-details">`);
parts.push(mkPath(`M14 46 L50 46`, { fill: 'none', stroke: C.metal, 'stroke-width': '0.6', 'stroke-linecap': 'round', opacity: '0.4' }));
parts.push(mkPath(`M16 44 L48 44`, { fill: 'none', stroke: C.white, 'stroke-width': '0.3', 'stroke-linecap': 'round', opacity: '0.3' }));
parts.push(mkPath(`M20 44 L20 42`, { fill: 'none', stroke: C.metalDark, 'stroke-width': '0.6', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M28 44 L28 42`, { fill: 'none', stroke: C.metalDark, 'stroke-width': '0.6', 'stroke-linecap': 'round' }));
parts.push(circle(20, 42, 0.4, { fill: C.metal, stroke: C.metalDark, 'stroke-width': '0.3' }));
parts.push(circle(28, 42, 0.4, { fill: C.metal, stroke: C.metalDark, 'stroke-width': '0.3' }));
parts.push(mkPath(`M12 24 Q10 22 10 20`, { fill: 'none', stroke: C.metalDark, 'stroke-width': '0.6', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M14 24 L14 28 Q14 30 16 30`, { fill: C.metal, stroke: C.metalDark, 'stroke-width': '0.4', 'stroke-linejoin': 'round' }));
parts.push(mkPath(`M10 22 Q14 24 18 26`, { fill: 'none', stroke: C.darkGray, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(mkPath(`M22 22 Q24 24 26 26`, { fill: 'none', stroke: C.darkGray, 'stroke-width': '0.3', 'stroke-linecap': 'round' }));
parts.push(`</g>`);

// === SUBTLE BASE RING ===
parts.push(`<!-- SUBTLE BASE RING -->`);
parts.push(`<g id="base-ring">`);
parts.push(circle(32, 52, 14, { fill: 'none', stroke: C.mint, 'stroke-width': '0.4', opacity: '0.3' }));
parts.push(circle(32, 52, 15, { fill: 'none', stroke: C.mint, 'stroke-width': '0.2', opacity: '0.2' }));
parts.push(`</g>`);

const svgContent = parts.join('\n');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="none">
${svgContent}
</svg>`;

const outPath = path.join(__dirname, 'rider-marker.svg');
fs.writeFileSync(outPath, svg, 'utf8');
console.log(`SVG written to ${outPath}`);
console.log(`Total shapes: ${parts.length}`);
