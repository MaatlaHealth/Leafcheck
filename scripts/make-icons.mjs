// Draws the app icons (an eye on green) as PNG files with no image libraries.
// Run: npm run icons
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BACKGROUND = [47, 93, 52];
const EYE_WHITE = [246, 243, 234];
const IRIS = [111, 168, 99];
const PUPIL = [29, 38, 29];

const crcTable = Array.from({ length: 256 }, (unused, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  return value >>> 0;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData));
  return Buffer.concat([length, typeAndData, crc]);
}

function encodePng(size, rgbaPixels) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  const rows = Buffer.alloc(size * (size * 4 + 1));
  for (let row = 0; row < size; row += 1) {
    rows[row * (size * 4 + 1)] = 0;
    rgbaPixels.copy(rows, row * (size * 4 + 1) + 1, row * size * 4, (row + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(rows)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Colour at a point in unit space. The eye is the overlap of two circles.
function colourAt(x, y, eyeScale, roundedCorners) {
  if (roundedCorners) {
    const cornerRadius = 0.18;
    const nearestX = Math.min(Math.max(x, cornerRadius), 1 - cornerRadius);
    const nearestY = Math.min(Math.max(y, cornerRadius), 1 - cornerRadius);
    if ((x - nearestX) ** 2 + (y - nearestY) ** 2 > cornerRadius ** 2) return null;
  }
  const localX = (x - 0.5) / eyeScale;
  const localY = (y - 0.5) / eyeScale;
  const circleRadius = 0.3925;
  const circleOffset = 0.2125;
  const insideAlmond = localX ** 2 + (localY - circleOffset) ** 2 <= circleRadius ** 2
    && localX ** 2 + (localY + circleOffset) ** 2 <= circleRadius ** 2;
  const distanceFromCentre = Math.hypot(localX, localY);
  if (distanceFromCentre <= 0.05 && localX > -0.02 && localY < 0.0 && Math.hypot(localX + 0.035, localY + 0.035) < 0.02) return EYE_WHITE;
  if (distanceFromCentre <= 0.06) return PUPIL;
  if (distanceFromCentre <= 0.135) return IRIS;
  if (insideAlmond) return EYE_WHITE;
  return BACKGROUND;
}

function drawIcon(size, { eyeScale, roundedCorners }) {
  const pixels = Buffer.alloc(size * size * 4);
  const samplesPerAxis = 4;
  for (let pixelY = 0; pixelY < size; pixelY += 1) {
    for (let pixelX = 0; pixelX < size; pixelX += 1) {
      let red = 0;
      let green = 0;
      let blue = 0;
      let alpha = 0;
      for (let sampleY = 0; sampleY < samplesPerAxis; sampleY += 1) {
        for (let sampleX = 0; sampleX < samplesPerAxis; sampleX += 1) {
          const colour = colourAt((pixelX + (sampleX + 0.5) / samplesPerAxis) / size, (pixelY + (sampleY + 0.5) / samplesPerAxis) / size, eyeScale, roundedCorners);
          if (!colour) continue;
          red += colour[0];
          green += colour[1];
          blue += colour[2];
          alpha += 1;
        }
      }
      const offset = (pixelY * size + pixelX) * 4;
      const sampleCount = samplesPerAxis * samplesPerAxis;
      pixels[offset] = alpha ? Math.round(red / alpha) : 0;
      pixels[offset + 1] = alpha ? Math.round(green / alpha) : 0;
      pixels[offset + 2] = alpha ? Math.round(blue / alpha) : 0;
      pixels[offset + 3] = Math.round((alpha / sampleCount) * 255);
    }
  }
  return encodePng(size, pixels);
}

mkdirSync('public/icons', { recursive: true });
writeFileSync('public/icons/icon-192.png', drawIcon(192, { eyeScale: 1, roundedCorners: true }));
writeFileSync('public/icons/icon-512.png', drawIcon(512, { eyeScale: 1, roundedCorners: true }));
writeFileSync('public/icons/icon-maskable-512.png', drawIcon(512, { eyeScale: 0.75, roundedCorners: false }));
writeFileSync('public/icons/icon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="18" fill="#2f5d34"/>
  <path d="M17 50 Q50 14 83 50 Q50 86 17 50 Z" fill="#f6f3ea"/>
  <circle cx="50" cy="50" r="13.5" fill="#6fa863"/>
  <circle cx="50" cy="50" r="6" fill="#1d261d"/>
</svg>
`);
console.log('Icons written to public/icons');
