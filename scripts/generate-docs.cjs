// Mirrors repo docs/*.md into client/public/docs and generates a manifest.json
// Non-destructive: does not modify existing external sync scripts.

const fs = require('fs');
const path = require('path');

const REPO_DOCS_DIR = path.resolve(__dirname, '..', 'docs');
const PUBLIC_DOCS_DIR = path.resolve(__dirname, '..', 'client', 'public', 'docs');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function readTitleFromMarkdown(content, fallback) {
  const m = content.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback;
}

function toPlainText(md) {
  // Remove code fences first to reduce noise
  let text = md.replace(/```[\s\S]*?```/g, ' ');
  // Remove inline code
  text = text.replace(/`[^`]*`/g, ' ');
  // Strip images ![alt](url)
  text = text.replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ');
  // Convert links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^\)]*\)/g, '$1');
  // Drop HTML tags if any
  text = text.replace(/<[^>]+>/g, ' ');
  // Remove markdown headings/bullets markers, tables pipes
  text = text.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  text = text.replace(/^\s{0,3}[-*+]\s+/gm, '');
  text = text.replace(/\|/g, ' ');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

function walkDocs(dir, baseDir) {
  const items = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(baseDir, full);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      // Skip private/internal docs folders
      if (name.toLowerCase() === 'internal') continue;
      items.push(...walkDocs(full, baseDir));
    } else if (stat.isFile() && name.toLowerCase().endsWith('.md')) {
      items.push({ full, rel });
    }
  }
  return items;
}

function slugFromRel(rel) {
  const noExt = rel.replace(/\\/g, '/').replace(/\.md$/i, '');
  return noExt; // keep folder structure in slug (e.g., sub/guide)
}

function main() {
  if (!fs.existsSync(REPO_DOCS_DIR)) {
    console.error('Docs directory not found:', REPO_DOCS_DIR);
    process.exit(0);
  }
  ensureDir(PUBLIC_DOCS_DIR);

  const files = walkDocs(REPO_DOCS_DIR, REPO_DOCS_DIR);
  const manifest = [];
  const searchIndex = [];

  for (const { full, rel } of files) {
    const dest = path.join(PUBLIC_DOCS_DIR, rel);
    ensureDir(path.dirname(dest));
    const content = fs.readFileSync(full, 'utf8');
    fs.writeFileSync(dest, content, 'utf8');

    const title = readTitleFromMarkdown(content, path.basename(rel, '.md'));
    const mtime = fs.statSync(full).mtime.toISOString();
    const slug = slugFromRel(rel);
    const file = rel.replace(/\\/g, '/');
    // Hide the template from sidebar, keep others including _STYLE_GUIDE
    const hidden = path.basename(rel).toLowerCase() === '_doc_template.md';
    manifest.push({ slug, file, title, updatedAt: mtime, hidden });

  // Build a compact search index: strip markdown + code, truncate to ~30KB
  const MAX = 30 * 1024;
  const plain = toPlainText(content);
  const text = plain.length > MAX ? plain.slice(0, MAX) : plain;
  searchIndex.push({ slug, title, content: text });
  }

  // Sort by file path for stable sidebar
  manifest.sort((a, b) => a.file.localeCompare(b.file));
  fs.writeFileSync(path.join(PUBLIC_DOCS_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DOCS_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 0), 'utf8');
  console.log(`Mirrored ${files.length} docs to public/docs and wrote manifest.json`);
}

main();
