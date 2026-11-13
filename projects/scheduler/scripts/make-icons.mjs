// 칼 픽셀 아이콘으로 앱 아이콘(svg, png, ico)을 만든다: node scripts/make-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const PALETTE = { k: '#0d0b1f', w: '#f4f4f4', s: '#b8b5d6', y: '#ffd84a', n: '#9a6334' };
const BG = '#1e1b3a';
const SWORD = [
  '................',
  '............kkk.',
  '...........kwwk.',
  '..........kwwsk.',
  '.........kwwsk..',
  '........kwwsk...',
  '.......kwwsk....',
  '..kk..kwwsk.....',
  '..kyykwwsk......',
  '...kyysk........',
  '....kyyk........',
  '...knkkyk.......',
  '..knk..kk.......',
  '.kyk............',
  '.kk.............',
  '................',
];

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// SVG: 바깥 1칸 여백 + 배경
let rects = '';
SWORD.forEach((row, y) => [...row].forEach((c, x) => {
  if (PALETTE[c]) rects += `<rect x="${x + 1}" y="${y + 1}" width="1" height="1" fill="${PALETTE[c]}"/>`;
}));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" shape-rendering="crispEdges"><rect width="18" height="18" fill="${BG}"/>${rects}</svg>`;

function pixelsAt(size) {
  const scale = size / 18;
  const buf = Buffer.alloc(size * size * 4);
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    const gx = Math.floor(px / scale) - 1, gy = Math.floor(py / scale) - 1;
    const c = SWORD[gy]?.[gx];
    const [r, g, b] = hex(PALETTE[c] ?? BG);
    buf.set([r, g, b, 255], (py * size + px) * 4);
  }
  return buf;
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
function png(size) {
  const px = pixelsAt(size);
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
function ico(sizes) {
  const imgs = sizes.map(png);
  const head = Buffer.alloc(6); head.writeUInt16LE(1, 2); head.writeUInt16LE(sizes.length, 4);
  let offset = 6 + 16 * sizes.length;
  const dir = sizes.map((s, i) => {
    const d = Buffer.alloc(16);
    d[0] = s >= 256 ? 0 : s; d[1] = s >= 256 ? 0 : s; d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6);
    d.writeUInt32LE(imgs[i].length, 8); d.writeUInt32LE(offset, 12); offset += imgs[i].length;
    return d;
  });
  return Buffer.concat([head, ...dir, ...imgs]);
}

mkdirSync('public', { recursive: true });
mkdirSync('electron', { recursive: true });
writeFileSync('public/icon.svg', svg);
writeFileSync('public/icon-192.png', png(192));
writeFileSync('public/icon-512.png', png(512));
writeFileSync('electron/icon.png', png(256));
writeFileSync('electron/tray.png', png(32));
writeFileSync('electron/icon.ico', ico([16, 32, 48, 256]));
console.log('icons written');
