const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '..');
const sourcePath = path.join(base, 'scripts', 'cheers-products.json');
const outJson = path.join(base, 'src', 'data', 'cheers-catalog.json');
const productsImgDir = path.join(base, 'public', 'products');
const progressPath = path.join(base, 'scripts', 'download-progress.json');

const CATEGORY_MAP = {
  liquor: 'mixers',
  whisky: 'whiskey',
  featured: 'mixers',
  'japanese-liquor': 'japanese',
};

const SUBCATEGORY = {
  whiskey: 'Whisky',
  vodka: 'Vodka',
  beer: 'Beer',
  wine: 'Wine',
  gin: 'Gin',
  rum: 'Rum',
  tequila: 'Tequila',
  brandy: 'Brandy',
  liqueur: 'Liqueur',
  mixers: 'Mixers & Syrups',
  japanese: 'Japanese Liquor',
  glass: 'Glassware',
  tobacco: 'Tobacco',
  offers: 'Combo Offers',
  champagne: 'Champagne',
};

const DEFAULT_ABV = {
  whiskey: '40%',
  vodka: '40%',
  beer: '5%',
  wine: '12%',
  gin: '40%',
  rum: '40%',
  tequila: '40%',
  brandy: '40%',
  liqueur: '20%',
  mixers: '0%',
  japanese: '25%',
  glass: 'N/A',
  tobacco: 'N/A',
  offers: '40%',
  champagne: '12%',
};

const KNOWN_BRANDS = [
  'Johnnie Walker', 'Jack Daniel', "Jack Daniel's", 'Jameson', 'Glenfiddich', 'Chivas Regal',
  'Old Monk', 'Bacardi', 'Smirnoff', 'Absolut', 'Grey Goose', 'Captain Morgan', 'Bombay Sapphire',
  'Tanqueray', "Hendrick's", 'Jose Cuervo', 'Patrón', 'Patron', 'Corona', 'Heineken', 'Budweiser',
  'Kingfisher', 'Hoegaarden', 'Moët', 'Moet', 'Jacob\'s Creek', 'Barefoot', 'Old Durbar',
  'Khukri', 'Ruslan', 'Gorkha', 'Barahsinghe', 'Carlsberg', 'Tuborg', 'Foster', 'Sula',
  'William Lawson', 'Ballantine', 'Grant\'s', 'Grants', 'Dewar', 'Black & White', 'Black Dog',
  '100 Pipers', 'Teacher\'s', 'Teachers', 'Royal Stag', 'Blenders Pride', 'Signature',
  'Antiquity', 'McDowell', 'Officer\'s Choice', 'Officers Choice', 'Iconiq', 'White Mischief',
  'Magic Moments', 'Belvedere', 'Ciroc', 'Ketel One', 'Finlandia', 'Stolichnaya', 'SKYY',
  'Fireball', 'Jägermeister', 'Jagermeister', 'Baileys', 'Kahlúa', 'Kahlua', 'Malibu',
  'Hennessy', 'Martell', 'Courvoisier', 'Remy Martin', 'Nikka', 'Hibiki', 'Yamazaki',
  'Macallan', 'Glenlivet', 'Glenmorangie', 'Lagavulin', 'Laphroaig', 'Ardbeg', 'Bowmore',
  'Highland Park', 'Talisker', 'Monkey Shoulder', 'Ballantines', 'Famous Grouse',
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function imageFileFromUrl(imageUrl) {
  const m = imageUrl.match(/\/uploads\/products\/([^/]+)/);
  return m ? m[1] : null;
}

function localImagePath(fileName) {
  const local = path.join(productsImgDir, fileName);
  if (fs.existsSync(local) && fs.statSync(local).size > 512) {
    return `/products/${fileName}`;
  }
  return `https://cheers.com.np/uploads/products/${fileName}`;
}

function normalizeCategory(raw) {
  const c = (raw || 'liquor').toLowerCase();
  return CATEGORY_MAP[c] || c;
}

function extractBrand(name) {
  for (const brand of KNOWN_BRANDS) {
    if (name.toLowerCase().startsWith(brand.toLowerCase())) return brand;
  }
  const stripped = name.replace(/\d+(?:\.\d+)?\s*(ML|L|CL)\b/gi, '').replace(/\s+/g, ' ').trim();
  const words = stripped.split(' ');
  if (words.length <= 2) return stripped || 'Cheers';
  return words.slice(0, 2).join(' ');
}

function normalizeVolume(volume, name) {
  if (volume) return volume;
  const m = name.match(/(\d+(?:\.\d+)?)\s*(ML|L|G|PCS|PACK)\b/i);
  if (!m) return categoryUsesPieces(name) ? '1 Pack' : '750ML';
  const unit = m[2].toUpperCase();
  if (unit === 'L') return `${m[1]}L`;
  if (unit === 'G') return `${m[1]}G`;
  if (unit === 'PCS') return `${m[1]} PCS`;
  if (unit === 'PACK') return `${m[1]} Pack`;
  return `${m[1]}ML`;
}

function categoryUsesPieces(name) {
  return /\b(cigarette|pack|glass|cup|combo|offer|\+)\b/i.test(name);
}

function inferAbv(category, name) {
  const lower = name.toLowerCase();
  if (category === 'glass' || category === 'tobacco') return 'N/A';
  if (lower.includes('non-alcoholic') || lower.includes('0%')) return '0%';
  if (lower.includes('strong') && category === 'beer') return '8%';
  if (category === 'japanese' && lower.includes('soju')) return '16.5%';
  return DEFAULT_ABV[category] || '40%';
}

function slugId(index, name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return `c${index}-${slug}`;
}

const downloaded = new Set();
if (fs.existsSync(progressPath)) {
  try {
    downloaded.add(...JSON.parse(fs.readFileSync(progressPath, 'utf8')).done || []);
  } catch {
    /* ignore */
  }
}

const raw = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const catalog = raw.map((item, index) => {
  const category = normalizeCategory(item.category);
  const fileName = imageFileFromUrl(item.imageUrl);
  const h = hashStr(item.name);
  const price = parseInt(item.price, 10) || 0;
  const rating = Math.round((3.8 + (h % 12) / 10) * 10) / 10;
  const reviews = 40 + (h % 900);
  const hasDiscount = h % 5 === 0 && price > 1500;

  return {
    id: slugId(index + 1, item.name),
    name: item.name,
    brand: extractBrand(item.name),
    category,
    subcategory: SUBCATEGORY[category] || category,
    price,
    ...(hasDiscount ? { originalPrice: Math.round(price * 1.12) } : {}),
    volume: normalizeVolume(item.volume, item.name),
    abv: inferAbv(category, item.name),
    image: fileName ? localImagePath(fileName) : item.imageUrl.replace(/\/\d+\/\d+$/, ''),
    rating,
    reviews,
    inStock: h % 17 !== 0,
    ...(h % 11 === 0 ? { badge: ['Best Seller', 'Popular', 'New', 'Value Pick'][h % 4] } : {}),
    description: `${item.name} — available for delivery across Kathmandu Valley from Night Owl Liquors.`,
    tags: [category, extractBrand(item.name).toLowerCase().replace(/\s+/g, '-')],
  };
});

fs.writeFileSync(outJson, JSON.stringify(catalog, null, 0));
console.log('Wrote', catalog.length, 'products to', outJson);

const counts = catalog.reduce((acc, p) => {
  acc[p.category] = (acc[p.category] || 0) + 1;
  return acc;
}, {});
console.log('Category counts:', counts);
