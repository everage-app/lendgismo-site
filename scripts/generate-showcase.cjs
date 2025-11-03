// Generates a manifest for screenshots/videos in client/public/assets/showcase (recurses into timestamp folders)
// Place PNG/JPG/WebP/GIF images anywhere under that folder; this writes manifest.json consumed by the app.
const fs = require('fs');
const path = require('path');

const SHOWCASE_DIR = path.resolve(__dirname, '..', 'client', 'public', 'assets', 'showcase');
const MANIFEST = path.join(SHOWCASE_DIR, 'manifest.json');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function titleFromFile(name) {
  const base = name.replace(/\.[^.]+$/, '');
  return base.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function walkFiles(dir, rel = '.') {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const r = rel === '.' ? entry.name : path.join(rel, entry.name);
    if (entry.isDirectory()) {
      // Skip hidden/system dirs just in case
      if (entry.name.startsWith('.')) continue;
      out.push(...walkFiles(abs, r));
    } else if (/\.(png|jpe?g|webp|gif|mp4|webm)$/i.test(entry.name)) {
      out.push(r);
    }
  }
  return out;
}

function main() {
  ensureDir(SHOWCASE_DIR);
  const files = walkFiles(SHOWCASE_DIR).sort((a, b) => a.localeCompare(b));
  const items = files.map((relPath) => {
    const src = `/assets/showcase/${relPath.replace(/\\/g, '/')}`;
    const ext = path.extname(relPath).toLowerCase();
    const type = /\.(mp4|webm)$/.test(ext) ? 'video' : 'image';
    // Derive a coarse timestamp from first path segment if it matches YYYYMMDD-HHMM
    const seg = relPath.split(/[\\/]/)[0];
    const ts = /^\d{8}-\d{4}$/.test(seg) ? seg : '';
    return {
      src,
      title: titleFromFile(path.basename(relPath)),
      caption: '',
      type,
      timestamp: ts
    };
  });
  fs.writeFileSync(MANIFEST, JSON.stringify({ items }, null, 2), 'utf8');
  console.log(`Wrote showcase manifest with ${items.length} items to ${MANIFEST}`);
}

main();
