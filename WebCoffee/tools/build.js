// Build: src/pages/*.html + src/partials/*.html -> root *.html, sitemap.xml
// Usage: node tools/build.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const SITE_URL = 'https://coffee.sidcorp.vn';

const NAV = [
  { key: 'xuong-rang', href: 'xuong-rang.html', label: 'Xưởng rang' },
  { key: 'ban-si', href: 'ban-si.html', label: 'Bán sỉ' },
  { key: 'chuong-trinh', href: 'chuong-trinh-ban-si.html', label: 'Chương trình sỉ' },
  { key: 'quy-trinh', href: 'quy-trinh.html', label: 'Quy trình' },
];

const read = (p) => fs.readFileSync(p, 'utf8');
const partial = (name) => read(path.join(SRC, 'partials', name + '.html'));

function navLinks(active) {
  return NAV.map((n) => {
    const cur = n.key === active ? ' aria-current="page"' : '';
    return `<a href="${n.href}" class="nav-link"${cur}>${n.label}</a>`;
  });
}

function render(tpl, data) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in data ? data[k] : m));
}

const pages = fs.readdirSync(path.join(SRC, 'pages')).filter((f) => f.endsWith('.html')).sort();
const urls = [];

for (const file of pages) {
  const raw = read(path.join(SRC, 'pages', file));
  const m = raw.match(/^<!--meta\s+(\{[\s\S]*?\})\s*-->\r?\n/);
  if (!m) throw new Error(`${file}: thiếu dòng <!--meta {...}--> ở đầu file`);
  const meta = JSON.parse(m[1]);
  const body = raw.slice(m[0].length);

  for (const [i, line] of raw.split('\n').entries()) {
    if (/[–—]/.test(line)) throw new Error(`${file}:${i + 1}: dùng "-" thay cho – hoặc —`);
  }

  const links = navLinks(meta.nav);
  const canonical = SITE_URL + '/' + (file === 'index.html' ? '' : file);
  const data = {
    title: meta.title,
    description: meta.description,
    canonical,
    ogImage: SITE_URL + '/assets/img/' + (meta.ogImage || 'cafe-interior.jpg'),
    pageCss: meta.css ? `<link rel="stylesheet" href="assets/css/${meta.css}.css">` : '',
    schema: meta.schema ? `<script type="application/ld+json">${JSON.stringify(meta.schema)}</script>` : '',
    homeCurrent: file === 'index.html' ? ' aria-current="page"' : '',
    navLeft: links.slice(0, 2).join(''),
    navRight: links.slice(2).join(''),
    navMobile: links.join('') + `<a href="lien-he.html" class="nav-link"${meta.nav === 'lien-he' ? ' aria-current="page"' : ''}>Liên hệ</a>`,
    year: String(new Date().getFullYear()),
  };
  data.cta = render(partial('cta'), {
    ...data,
    ctaLabel: meta.ctaLabel || 'Yêu cầu mẫu thử',
    ctaHref: meta.ctaHref || 'lien-he.html',
    ctaTitle: meta.ctaTitle || 'Kể cho SID CORP về quán của bạn',
  });
  data.header = render(partial('header'), data);
  data.footer = render(partial('footer'), data);
  data.head = render(partial('head'), data);

  const html = render(body, data);
  fs.writeFileSync(path.join(ROOT, file), html);
  urls.push(canonical);
  console.log('built', file);
}

const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
console.log('built sitemap.xml');
