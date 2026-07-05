const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const base = path.resolve(__dirname, '..');
const cookieJar = path.join(base, 'tmp_cookies.txt');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function fetchUrl(url) {
  const cmd = `curl.exe -sL -c "${cookieJar}" -b "${cookieJar}" -A "${UA}" "${url}"`;
  return execSync(cmd, { maxBuffer: 20 * 1024 * 1024 }).toString('utf8');
}

const urls = [
  'https://cheers.com.np/',
  'https://cheers.com.np/liquor',
  'https://cheers.com.np/grocery',
  'https://cheers.com.np/tobacco',
];

for (const url of urls) {
  const t = fetchUrl(url);
  const links = [...t.matchAll(/href="(\/(?:liquor|grocery|tobacco)[^"]*)"/gi)].map((m) => m[1]);
  const cats = [...t.matchAll(/category\?c=([^&"']+)/gi)].map((m) => m[1]);
  const prodSections = [...t.matchAll(/href="(\/[a-z-]+\/product\/[^"]+)"/gi)].map((m) => m[1].split('/')[1]);
  console.log('\n===', url, 'len', t.length, '===');
  console.log('links', [...new Set(links)].sort());
  console.log('cats', [...new Set(cats)].sort());
  console.log('product sections', [...new Set(prodSections)].sort());
}
