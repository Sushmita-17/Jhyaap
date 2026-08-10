const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const base = path.resolve(__dirname, '..');
const catalogPath = path.join(base, 'scripts', 'cheers-products.json');
const outDir = path.join(base, 'public', 'products');
const progressPath = path.join(base, 'scripts', 'download-progress.json');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const DELAY_MS = 400;
const BATCH_LOG = 25;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function imageFileFromUrl(imageUrl) {
  const m = imageUrl.match(/\/uploads\/products\/([^/]+)/);
  return m ? m[1] : null;
}

function downloadOne(fileName) {
  const dest = path.join(outDir, fileName);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1024) {
    return { ok: true, skipped: true, bytes: fs.statSync(dest).size };
  }
  const url = `https://cheers.com.np/uploads/products/${fileName}`;
  const cmd = `curl.exe -sL -A "${UA}" -H "Referer: https://cheers.com.np/liquor" -o "${dest}" -w "%{http_code}" "${url}"`;
  try {
    const code = execSync(cmd, { maxBuffer: 10 * 1024 * 1024 }).toString().trim();
    const bytes = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
    if (code !== '200' || bytes < 512) {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      return { ok: false, code, bytes };
    }
    return { ok: true, skipped: false, bytes };
  } catch (e) {
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    return { ok: false, error: e.message };
  }
}

if (!fs.existsSync(catalogPath)) {
  console.error('Missing', catalogPath, '- run node scripts/scrape-cheers.cjs first');
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const products = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const uniqueFiles = [...new Set(products.map((p) => imageFileFromUrl(p.imageUrl)).filter(Boolean))];

let progress = { done: [], failed: [] };
if (fs.existsSync(progressPath)) {
  try {
    progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
  } catch {
    progress = { done: [], failed: [] };
  }
}
const doneSet = new Set(progress.done);
const failedSet = new Set(progress.failed);

let downloaded = 0;
let skipped = 0;
let failed = 0;

console.log(`Downloading ${uniqueFiles.length} unique product images...`);

for (let i = 0; i < uniqueFiles.length; i++) {
  const fileName = uniqueFiles[i];
  if (doneSet.has(fileName)) {
    skipped++;
    continue;
  }

  const result = downloadOne(fileName);
  if (result.ok) {
    doneSet.add(fileName);
    failedSet.delete(fileName);
    if (result.skipped) skipped++;
    else downloaded++;
  } else {
    failedSet.add(fileName);
    failed++;
    if (failed <= 10) console.warn('FAIL', fileName, result);
  }

  if ((i + 1) % BATCH_LOG === 0 || i === uniqueFiles.length - 1) {
    progress.done = [...doneSet];
    progress.failed = [...failedSet];
    progress.updatedAt = new Date().toISOString();
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
    console.log(`[${i + 1}/${uniqueFiles.length}] new=${downloaded} skip=${skipped} fail=${failed}`);
  }

  sleep(DELAY_MS);
}

console.log('Done.', { total: uniqueFiles.length, downloaded, skipped, failed, savedTo: outDir });
