import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const src = path.join(root, 'assets/worldroot-logo.png');
const outDir = path.join(root, 'assets/pwa');

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
];

async function renderIcon({ name, size, maskable }) {
  const pad = maskable ? Math.round(size * 0.2) : Math.round(size * 0.08);
  const inner = size - pad * 2;
  const png = await sharp(src)
    .resize(inner, inner, { fit: 'contain', background: { r: 13, g: 18, b: 13, alpha: 1 } })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 13, g: 18, b: 13, alpha: 1 },
    })
    .png()
    .toBuffer();
  await sharp(png).toFile(path.join(outDir, name));
  console.log(`Wrote ${name}`);
}

fs.mkdirSync(outDir, { recursive: true });
await Promise.all(sizes.map(renderIcon));
