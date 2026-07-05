const fs = require('fs');
const path = require('path');
const base = path.resolve(__dirname, '..');
const { execSync } = require('child_process');
const cookieJar = path.join(base, 'tmp_cookies.txt');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function fetch(url) {
  const cmd = `curl.exe -sL -b "${cookieJar}" -c "${cookieJar}" -A "${UA}" "${url}"`;
  return execSync(cmd, { maxBuffer: 20 * 1024 * 1024 }).toString('utf8');
}

function parseSlugs(html) {
  const slugs = new Set();
  const re = /<a href="(\/liquor\/product\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html))) slugs.add(m[1].toLowerCase());
  return slugs;
}

const map = new Map();
const cats = [
  ['whiskey','whisky'],['vodka','vodka'],['beer','beer'],['wine','wine'],
  ['gin','gin'],['rum','rum'],['tequila','tequila'],['brandy','brandy'],['liqueur','liqueur']
];
for (const [label, site] of cats) {
  let page = 1;
  while (page <= 80) {
    const url = page === 1
      ? `https://cheers.com.np/liquor/category?c=${site}`
      : `https://cheers.com.np/liquor/category?c=${site}&p=${page}`;
    const html = fetch(url);
    const slugs = parseSlugs(html);
    if (slugs.size === 0) break;
    for (const s of slugs) map.set(s, label);
    page++;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1500);
  }
}

const products = JSON.parse(fs.readFileSync(path.join(base,'scripts/cheers-products.json'),'utf8'));
let updated = 0;
for (const p of products) {
  const slug = (p.slug || '').toLowerCase();
  const cat = map.get(slug);
  if (cat && p.category !== cat) { p.category = cat; updated++; }
  else if (cat) p.category = cat;
}
// strip slug for user requested shape
const out = products.map(({ slug, ...rest }) => rest);
fs.writeFileSync(path.join(base,'scripts/cheers-products.json'), JSON.stringify(out, null, 2));
const c = {};
for (const x of out) c[x.category] = (c[x.category]||0)+1;
console.log('updated', updated, 'counts', c);
