const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const palette = [
  [190, 74, 47],
  [216, 118, 68],
  [234, 212, 170],
  [228, 166, 114],
  [184, 111, 80],
  [116, 63, 57],
  [63, 40, 50],
  [158, 40, 53],
  [228, 59, 68],
  [247, 118, 34],
  [254, 174, 52],
  [254, 231, 97],
  [99, 199, 77],
  [62, 137, 72],
  [38, 92, 66],
  [25, 60, 62],
  [18, 78, 137],
  [0, 149, 233],
  [44, 232, 245],
  [255, 255, 255],
  [192, 203, 220],
  [139, 155, 180],
  [90, 105, 136],
  [58, 68, 102],
  [38, 43, 68],
  [255, 0, 68],
  [24, 20, 37],
  [104, 56, 108],
  [181, 80, 136],
  [246, 117, 122],
  [232, 183, 150],
  [194, 133, 105]
];

const paletteAscii = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

// Function to find the closest color in the palette
function findPaletteIndex(r, g, b) {
  let minDistance = Infinity;
  let closestIndex = -1;
  
  for (let i = 0; i < palette.length; i++) {
    const [pr, pg, pb] = palette[i];
    const distance = Math.sqrt(
      Math.pow(r - pr, 2) + 
      Math.pow(g - pg, 2) + 
      Math.pow(b - pb, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  
  // Allow for some tolerance in color matching
  if (minDistance > 10) {
    throw new Error(`No matching palette color found for RGB(${r}, ${g}, ${b}). Closest distance: ${minDistance}`);
  }
  
  return closestIndex;
}

// Main function to parse image
function parseImage(filename, allowTransparency = false) {
  const designPath = path.join(__dirname, '..', 'design', filename);
  
  if (!fs.existsSync(designPath)) {
    throw new Error(`Image file not found: ${designPath}`);
  }
  
  const data = fs.readFileSync(designPath);
  const png = PNG.sync.read(data);
  
  const width = png.width;
  const height = png.height;
  const textureData = [];
  
  // Process each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      const a = png.data[idx + 3];
      
      // Handle transparent pixels
      if (a === 0) {
        if (allowTransparency) {
          textureData.push(' '); // Use space for transparent pixels
        } else {
          throw new Error(`Transparent pixel found at (${x}, ${y}). Use --allow-transparency flag if this is intended.`);
        }
      } else {
        const paletteIndex = findPaletteIndex(r, g, b);
        textureData.push(paletteAscii[paletteIndex]);
      }
    }
  }
  
  return {
    width,
    height,
    data: textureData
  };
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const filename = args.find(arg => !arg.startsWith('--'));
  const allowTransparency = args.includes('--allow-transparency');
  const showPalette = args.includes('--show-palette');
  
  if (!filename && !showPalette) {
    console.error('Usage: node parseImage.js <filename> [--allow-transparency] [--show-palette]');
    console.error('Example: node parseImage.js t0.png');
    console.error('Example: node parseImage.js cat.png --allow-transparency');
    console.error('Example: node parseImage.js --show-palette');
    process.exit(1);
  }
  
  if (showPalette) {
    console.log('Color Palette:');
    palette.forEach((color, index) => {
      console.log(`${paletteAscii[index]}: RGB(${color[0]}, ${color[1]}, ${color[2]})`);
    });
    if (!filename) process.exit(0);
  }
  
  try {
    const result = parseImage(filename, allowTransparency);
    console.log(`// ${filename} - ${result.width}x${result.height}`);
    console.log(`[${result.width}, ${result.height}, "${result.data.join('')}"]`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = { parseImage, palette, paletteAscii };

