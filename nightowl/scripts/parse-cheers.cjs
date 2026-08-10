const fs = require('fs');
const path = require('path');
const base = 'c:/Users/LENOVO/Downloads/nightowl-liquors/nightowl-liquors';

function parseProducts(html, category) {
  const products = [];
  const re = /<a href="(\/liquor\/product\/[^"]+)"[^>]*>[\s\S]*?<img[^>]+data-src="([^"]+)"[^>]+(?:alt|title)="([^"]+)"[\s\S]*?<\/a>[\s\S]*?<h4 class="price">\s*Rs\.&nbsp;([^<]+)</gi;
  let m;
  while ((m = re.exec(html))) {
    const name = m[3].trim();
    let imageUrl = m[2];
    if (!imageUrl.startsWith('http')) imageUrl = 'https://cheers.com.np' + imageUrl;
    const volMatch = name.match(/(\d+(?:\.\d+)?)\s*ML\b/i);
    products.push({
      name,
      imageUrl,
      price: m[4].trim().replace(/,/g, ''),
      category,
      volume: volMatch ? volMatch[1] + 'ML' : null,
    });
  }
  return products;
}

const html = fs.readFileSync(path.join(base, 'tmp_liquor.html'), 'utf8');
const products = parseProducts(html, 'liquor');
console.log('parsed from liquor page:', products.length);
fs.writeFileSync(path.join(base, 'scripts/cheers-products-partial.json'), JSON.stringify(products.slice(0, 3), null, 2));
module.exports = { parseProducts };
