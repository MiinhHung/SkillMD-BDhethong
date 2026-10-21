// Check built root HTML: leftover {{tokens}}, missing local files, #anchors, img alt/size, duplicate ids, h1 count, banned names.
// Usage: node tools/check.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
let errors = 0;
const fail = (f, msg) => { errors++; console.log(`✗ ${f}: ${msg}`); };

for (const f of files) {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');

  const tok = html.match(/\{\{\w+\}\}/g);
  if (tok) fail(f, 'token còn sót ' + [...new Set(tok)].join(', '));

  if (/roavero/i.test(html)) fail(f, 'còn sót tên "Roavero"');
  if (/Sidcorp|Sid Corp/.test(html)) fail(f, 'tên thương hiệu phải viết "SID CORP"');
  if (!/<html lang="vi">/.test(html)) fail(f, 'thiếu <html lang="vi">');

  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(f, `có ${h1} thẻ h1 (cần đúng 1)`);

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set();
  for (const id of ids) { if (seen.has(id)) fail(f, `id trùng "${id}"`); seen.add(id); }

  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    const [p, hash] = url.split('#');
    if (p) {
      if (!fs.existsSync(path.join(ROOT, decodeURIComponent(p)))) fail(f, `thiếu file ${p}`);
    } else if (hash && !seen.has(hash)) {
      fail(f, `anchor #${hash} không tồn tại`);
    }
    if (p && hash && p.endsWith('.html')) {
      const other = fs.readFileSync(path.join(ROOT, p), 'utf8');
      if (!other.includes(`id="${hash}"`)) fail(f, `anchor ${url} không tồn tại`);
    }
  }

  for (const m of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = m[0];
    if (!/\salt="/.test(tag)) fail(f, 'img thiếu alt: ' + tag.slice(0, 80));
    if (!/\swidth="/.test(tag) || !/\sheight="/.test(tag)) fail(f, 'img thiếu width/height: ' + tag.slice(0, 80));
  }
}

console.log(errors ? `\n${errors} lỗi` : `OK - ${files.length} trang`);
process.exit(errors ? 1 : 0);
