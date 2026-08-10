const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const base = path.resolve(__dirname, '..');
const cookieJar = path.join(base, 'tmp_cookies.txt');
const outJson = path.join(base, 'scripts', 'cheers-products.json');
const notesPath = path.join(base, 'scripts', 'cheers-scrape-notes.json');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// All liquor-section categories on cheers.com.np (excludes /grocery)
const CATEGORIES = [
  { key: 'whiskey', site: 'whisky' },
  { key: 'vodka', site: 'vodka' },
  { key: 'beer', site: 'beer' },
  { key: 'wine', site: 'wine' },
  { key: 'gin', site: 'gin' },
  { key: 'rum', site: 'rum' },
  { key: 'tequila', site: 'tequila' },
  { key: 'brandy', site: 'brandy' },
  { key: 'liqueur', site: 'liqueur' },
  { key: 'mixers', site: 'mixers' },
  { key: 'japanese', site: 'japanese-liquor' },
  { key: 'glass', site: 'glass' },
  { key: 'tobacco', site: 'tobacco' },
  { key: 'offers', site: 'offers' },
];

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function fetchUrl(url, referer) {
  const escaped = url.replace(/"/g, '\\"');
  const ref = referer ? `-H "Referer: ${referer}"` : '';
  const cmd = `curl.exe -sL -c "${cookieJar}" -b "${cookieJar}" -A "${UA}" ${ref} "${escaped}"`;
  try {
    const buf = execSync(cmd, { maxBuffer: 20 * 1024 * 1024 });
    const text = buf.toString('utf8');
    if (text.includes('Just a moment...') && text.length < 20000) {
      return { ok: false, reason: 'cloudflare', text };
    }
    return { ok: true, text };
  } catch (e) {
    return { ok: false, reason: e.message, text: '' };
  }
}

function parseVolume(name) {
  const m = name.match(/(\d+(?:\.\d+)?)\s*(ML|L|G|PCS|PACK)\b/i);
  if (!m) return null;
  const unit = m[2].toUpperCase();
  if (unit === 'L') return `${m[1]}L`;
  if (unit === 'G') return `${m[1]}G`;
  if (unit === 'PCS') return `${m[1]} PCS`;
  if (unit === 'PACK') return `${m[1]} Pack`;
  return `${m[1]}ML`;
}

function parseProducts(html, category) {
  const products = [];
  const re =
    /<a href="(\/liquor\/product\/[^"]+)"[^>]*>[\s\S]*?<img[^>]+data-src="([^"]+)"[^>]+(?:alt|title)="([^"]+)"[\s\S]*?<\/a>[\s\S]*?<h4 class="price">\s*Rs\.&nbsp;([^<]+)</gi;
  let m;
  while ((m = re.exec(html))) {
    const name = m[3].trim().replace(/&amp;/g, '&');
    let imageUrl = m[2];
    if (!imageUrl.startsWith('http')) imageUrl = `https://cheers.com.np${imageUrl}`;
    products.push({
      name,
      imageUrl,
      price: m[4].trim().replace(/,/g, ''),
      category,
      volume: parseVolume(name),
      slug: m[1],
    });
  }
  return products;
}

function inferCategory(name) {
  const n = name.toLowerCase();
  if (/\b(cigarette|tobacco|cigar|shisha|hookah)\b/.test(n)) return 'tobacco';
  if (/\b(glass|tumbler|cup|mug|decanter)\b/.test(n)) return 'glass';
  if (/\b(syrup|tonic|soda|mixer|cola|juice|ginger beer|bitters)\b/.test(n)) return 'mixers';
  if (/\b(soju|sake|shochu|umeshu|japanese)\b/.test(n)) return 'japanese';
  if (/\b(beer|lager|ale|stout|ipa|pilsner)\b/.test(n)) return 'beer';
  if (/\b(wine|champagne|prosecco|sparkling|shiraz|cabernet)\b/.test(n)) return 'wine';
  if (/\b(vodka)\b/.test(n)) return 'vodka';
  if (/\b(whisky|whiskey|bourbon|scotch|malt)\b/.test(n)) return 'whiskey';
  if (/\b(gin)\b/.test(n)) return 'gin';
  if (/\b(rum)\b/.test(n)) return 'rum';
  if (/\b(tequila|mezcal)\b/.test(n)) return 'tequila';
  if (/\b(brandy|cognac)\b/.test(n)) return 'brandy';
  if (/\b(liqueur|schnapps|amaretto|baileys|jagermeister)\b/.test(n)) return 'liqueur';
  return 'mixers';
}

function dedupeKey(p) {
  return (p.slug || p.name).toLowerCase();
}

console.log('Bootstrapping session...');
const boot = fetchUrl('https://cheers.com.np/liquor');
if (!boot.ok) {
  console.error('Failed bootstrap', boot.reason);
  process.exit(1);
}

const all = new Map();
const stats = { pages: [], errors: [], categoryTotals: {} };

function addProducts(list) {
  let added = 0;
  for (const p of list) {
    const key = dedupeKey(p);
    if (!all.has(key)) {
      all.set(key, p);
      added++;
      stats.categoryTotals[p.category] = (stats.categoryTotals[p.category] || 0) + 1;
    }
  }
  return added;
}

for (const { key, site } of CATEGORIES) {
  const baseUrl = `https://cheers.com.np/liquor/category?c=${site}`;
  let page = 1;
  let stagnant = 0;
  while (page <= 80 && stagnant < 2) {
    const url = page === 1 ? baseUrl : `${baseUrl}&p=${page}`;
    sleep(2500);
    const res = fetchUrl(url, baseUrl);
    if (!res.ok) {
      stats.errors.push({ category: key, page, reason: res.reason });
      break;
    }
    const list = parseProducts(res.text, key);
    const added = addProducts(list);
    stats.pages.push({ url: `/liquor/category?c=${site}&p=${page}`, products: list.length, uniqueAdded: added });
    console.log(`${key} p${page}: parsed ${list.length}, new ${added}`);
    if (list.length === 0) break;
    if (added === 0) stagnant++;
    else stagnant = 0;
    page++;
  }
}

// Liquor landing — catch featured items not in category listings
const landingList = parseProducts(boot.text, 'featured').map((p) => ({
  ...p,
  category: inferCategory(p.name),
}));
const landingAdded = addProducts(landingList);
stats.pages.push({ url: '/liquor', products: landingList.length, uniqueAdded: landingAdded });
console.log(`landing: parsed ${landingList.length}, new ${landingAdded}`);

const products = [...all.values()].sort((a, b) => a.name.localeCompare(b.name));

const notes = {
  scrapedAt: new Date().toISOString(),
  scope: 'All /liquor categories; excludes /grocery',
  totalProducts: products.length,
  categoryTotals: stats.categoryTotals,
  categoriesScraped: CATEGORIES.map((c) => c.key),
  stats,
};

fs.writeFileSync(outJson, JSON.stringify(products, null, 2));
fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2));

console.log('TOTAL', products.length);
console.log('By category:', stats.categoryTotals);
console.log('Wrote', outJson);
