// scripts/make-transparent.js
// Usage: npm install sharp && node scripts/make-transparent.js
// This script reads public/rider.png, produces public/rider_transparent.png
// by thresholding near-white pixels as background and making them transparent.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputPath = path.join(__dirname, '..', 'public', 'rider.png');
const outputPath = path.join(__dirname, '..', 'public', 'rider_transparent.png');

async function makeTransparent() {
  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    process.exit(1);
  }

  try {
    // Create a mask: grayscale -> threshold -> invert
    const maskBuffer = await sharp(inputPath)
      .grayscale()
      .threshold(240) // tune this threshold if background isn't pure white
      .negate()
      .toBuffer();

    // Compose original with mask as alpha channel
    await sharp(inputPath)
      .ensureAlpha()
      .joinChannel(maskBuffer)
      .png({ quality: 90 })
      .toFile(outputPath);

    console.log('Wrote transparent PNG:', outputPath);
  } catch (err) {
    console.error('Error creating transparent PNG:', err);
    process.exit(1);
  }
}

makeTransparent();
