const { execSync } = require('child_process');
const path = require('path');

const cookieJar = path.resolve(__dirname, '..', 'tmp_cookies.txt');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const t = execSync(
  `curl.exe -sL -c "${cookieJar}" -b "${cookieJar}" -A "${UA}" "https://cheers.com.np/liquor"`,
  { maxBuffer: 20 * 1024 * 1024 },
).toString('utf8');

const liquorCats = [...t.matchAll(/\/liquor\/category\?c=([^&"']+)/gi)].map((m) => m[1]);
const unique = [...new Set(liquorCats)].filter((c) => !/^\d+$/.test(c)).sort();
console.log('Liquor categories:', unique);

for (const c of unique) {
  const html = execSync(
    `curl.exe -sL -b "${cookieJar}" -A "${UA}" "https://cheers.com.np/liquor/category?c=${c}"`,
    { maxBuffer: 20 * 1024 * 1024 },
  ).toString('utf8');
  const count = (html.match(/\/liquor\/product\//g) || []).length;
  console.log(c, 'approx products on page1:', count);
}
