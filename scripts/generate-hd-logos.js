const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function unfilterPNG(buffer, width, height) {
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const raw = Buffer.alloc(width * height * bytesPerPixel);
  let srcPos = 0;
  for (let y = 0; y < height; y++) {
    const filterType = buffer[srcPos++];
    const rowStart = y * stride;
    const prevRowStart = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const b = buffer[srcPos++];
      const left = x >= bytesPerPixel ? raw[rowStart + x - bytesPerPixel] : 0;
      const up = y > 0 ? raw[prevRowStart + x] : 0;
      const upLeft = (y > 0 && x >= bytesPerPixel) ? raw[prevRowStart + x - bytesPerPixel] : 0;
      let val = 0;
      if (filterType === 0) val = b;
      else if (filterType === 1) val = (b + left) & 0xff;
      else if (filterType === 2) val = (b + up) & 0xff;
      else if (filterType === 3) val = (b + Math.floor((left + up) / 2)) & 0xff;
      else if (filterType === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - upLeft);
        let pr = upLeft;
        if (pa <= pb && pa <= pc) pr = left;
        else if (pb <= pc) pr = up;
        val = (b + pr) & 0xff;
      }
      raw[rowStart + x] = val;
    }
  }
  return raw;
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c;
}
function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  return (crc ^ (-1)) >>> 0;
}
function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
function encodePNG(rawRGBA, width, height) {
  const stride = width * 4;
  const filtered = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    filtered[y * (stride + 1)] = 0;
    rawRGBA.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const compressed = zlib.deflateSync(filtered, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([signature, makeChunk('IHDR', ihdr), makeChunk('IDAT', compressed), makeChunk('IEND', Buffer.alloc(0))]);
}

const logoPath = path.resolve('public/logo.png');
const buf = fs.readFileSync(logoPath);
let pos = 8;
let idatChunks = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.slice(pos + 4, pos + 8).toString('ascii');
  if (type === 'IDAT') idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
  pos += 12 + len;
}
const raw = unfilterPNG(zlib.inflateSync(Buffer.concat(idatChunks)), 1024, 1024);

// Create white version: all RGB channels 255, keep exact alpha
const whiteRaw = Buffer.from(raw);
for (let i = 0; i < 1024 * 1024; i++) {
  whiteRaw[i * 4] = 255;
  whiteRaw[i * 4 + 1] = 255;
  whiteRaw[i * 4 + 2] = 255;
}

fs.mkdirSync('public/images', { recursive: true });

// Write white and dark HD PNGs
const whitePng = encodePNG(whiteRaw, 1024, 1024);
fs.writeFileSync('public/images/logo-white.png', whitePng);
fs.writeFileSync('public/images/arvanta-logo-white.png', whitePng);
fs.writeFileSync('public/images/logo-dark.png', buf);
fs.writeFileSync('public/images/arvanta-logo-dark.png', buf);
fs.writeFileSync('public/images/logo.png', buf);

// Extract 520x520 centered icon of the symbol
const cropSize = 520;
const startX = Math.round(508.5 - cropSize / 2); // 249
const startY = Math.round(418 - cropSize / 2);   // 158

const symbolRawDark = Buffer.alloc(cropSize * cropSize * 4);
const symbolRawWhite = Buffer.alloc(cropSize * cropSize * 4);

for (let y = 0; y < cropSize; y++) {
  for (let x = 0; x < cropSize; x++) {
    const srcX = startX + x;
    const srcY = startY + y;
    const destIdx = (y * cropSize + x) * 4;
    if (srcX >= 0 && srcX < 1024 && srcY >= 0 && srcY < 1024) {
      const srcIdx = (srcY * 1024 + srcX) * 4;
      symbolRawDark[destIdx] = raw[srcIdx];
      symbolRawDark[destIdx + 1] = raw[srcIdx + 1];
      symbolRawDark[destIdx + 2] = raw[srcIdx + 2];
      symbolRawDark[destIdx + 3] = raw[srcIdx + 3];

      symbolRawWhite[destIdx] = 255;
      symbolRawWhite[destIdx + 1] = 255;
      symbolRawWhite[destIdx + 2] = 255;
      symbolRawWhite[destIdx + 3] = raw[srcIdx + 3];
    }
  }
}

const symDarkPng = encodePNG(symbolRawDark, cropSize, cropSize);
const symWhitePng = encodePNG(symbolRawWhite, cropSize, cropSize);
fs.writeFileSync('public/images/arvanta-symbol-dark.png', symDarkPng);
fs.writeFileSync('public/images/arvanta-symbol-white.png', symWhitePng);
fs.writeFileSync('public/favicon.png', symDarkPng);

// Also generate SVG wrappers that render with crisp-edges
const darkBase64 = buf.toString('base64');
const whiteBase64 = whitePng.toString('base64');
const symDarkB64 = symDarkPng.toString('base64');
const symWhiteB64 = symWhitePng.toString('base64');

fs.writeFileSync('public/images/logo.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">
  <image href="data:image/png;base64,${darkBase64}" width="1024" height="1024" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;" />
</svg>`);

fs.writeFileSync('public/images/logo-white.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">
  <image href="data:image/png;base64,${whiteBase64}" width="1024" height="1024" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;" />
</svg>`);

fs.writeFileSync('public/images/symbol.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520" width="100%" height="100%">
  <image href="data:image/png;base64,${symDarkB64}" width="520" height="520" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;" />
</svg>`);

fs.writeFileSync('public/images/symbol-white.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520" width="100%" height="100%">
  <image href="data:image/png;base64,${symWhiteB64}" width="520" height="520" style="image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges;" />
</svg>`);

console.log('Successfully generated all HD logo assets and SVGs without quality loss!');
