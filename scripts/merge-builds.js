const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy nightowl build to dist/
const nightowlDist = path.join(__dirname, '../nightowl/dist');
if (fs.existsSync(nightowlDist)) {
  copyDirectory(nightowlDist, distDir);
  console.log('✅ Copied nightowl build to dist/');
}

// Create admin directory and copy admin build
const adminDist = path.join(__dirname, '../admin/dist');
const adminTargetDir = path.join(distDir, 'admin');
if (fs.existsSync(adminDist)) {
  if (!fs.existsSync(adminTargetDir)) {
    fs.mkdirSync(adminTargetDir, { recursive: true });
  }
  copyDirectory(adminDist, adminTargetDir);
  console.log('✅ Copied admin build to dist/admin/');
}

// Create rider directory and copy rider build
const riderDist = path.join(__dirname, '../rider-panel/dist');
const riderTargetDir = path.join(distDir, 'rider');
if (fs.existsSync(riderDist)) {
  if (!fs.existsSync(riderTargetDir)) {
    fs.mkdirSync(riderTargetDir, { recursive: true });
  }
  copyDirectory(riderDist, riderTargetDir);
  console.log('✅ Copied rider-panel build to dist/rider/');
}

console.log('🎉 All builds merged successfully!');

function copyDirectory(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
