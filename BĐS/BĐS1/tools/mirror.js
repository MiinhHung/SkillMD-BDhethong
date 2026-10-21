// Tải trang mẫu atrecxa.webflow.io (đã lưu trong _src/) + toàn bộ asset về assets/wf/,
// viết lại link sang trang nội bộ. Chạy 1 lần: node tools/mirror.js  (cần mạng)
// Sau đó: node tools/build.js  (dịch tiếng Việt, đổi logo, footer)
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, '_src');
const OUT = path.join(ROOT, '_mirror');
const ASSETS = path.join(ROOT, 'assets', 'wf');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(ASSETS, { recursive: true });

const PAGES = {
  'home.html': 'index.html',
  'about-us-v1.html': 'gioi-thieu.html',
  'services-v1.html': 'dich-vu.html',
  'projects.html': 'du-an.html',
  'blogs.html': 'tin-tuc.html',
  'contact-us.html': 'lien-he.html',
  '404.html': '404.html',
  'service_architecture-design.html': 'dich-vu-kien-truc-thiet-ke.html',
  'service_interior-styling.html': 'dich-vu-noi-that.html',
  'service_renovation-reuse.html': 'dich-vu-cai-tao.html',
  'project_foundry-lofts.html': 'du-an-foundry-lofts.html',
  'project_kiyomizu-court-house.html': 'du-an-kiyomizu-court-house.html',
  'project_pavilion-residence.html': 'du-an-pavilion-residence.html',
  'project_solstice-ridge-house.html': 'du-an-solstice-ridge-house.html',
  'blog_building-on-a-difficult-site-without-fighting-it.html': 'tin-tuc-xay-dung-tren-khu-dat-kho.html',
  'blog_the-quiet-discipline-of-a-well-planned-kitchen.html': 'tin-tuc-ky-luat-cua-mot-can-bep.html',
  'blog_why-we-start-every-project-with-a-week-of-doing-nothing.html': 'tin-tuc-mot-tuan-khong-lam-gi.html',
};

const LINKS = {
  '/': 'index.html', '/home-v2': 'index.html', '/home-v3': 'index.html',
  '/about-us-v1': 'gioi-thieu.html', '/about-us-v2': 'gioi-thieu.html', '/about-us-v3': 'gioi-thieu.html',
  '/services-v1': 'dich-vu.html', '/services-v2': 'dich-vu.html', '/services-v3': 'dich-vu.html',
  '/projects': 'du-an.html', '/blogs': 'tin-tuc.html', '/contact-us': 'lien-he.html', '/404': '404.html',
  '/instructions': 'gioi-thieu.html', '/style-guide': 'dich-vu.html', '/licenses': 'lien-he.html',
  '/changelog': 'tin-tuc.html',
};
// bài/dự án/dịch vụ không có trang riêng -> trỏ về trang chi tiết gần nhất
Object.assign(LINKS, {
  '/blog/choosing-stone-that-still-looks-right-in-twenty-years': 'tin-tuc-ky-luat-cua-mot-can-bep.html',
  '/blog/designing-homes-that-age-gracefully-with-their-owners': 'tin-tuc-mot-tuan-khong-lam-gi.html',
  '/blog/finding-the-perfect-neighborhood-to-inspire-your-interior-style': 'tin-tuc-xay-dung-tren-khu-dat-kho.html',
  '/blog/how-to-choose-the-right-neighborhood-for-your-family': 'tin-tuc-xay-dung-tren-khu-dat-kho.html',
  '/blog/natural-light-as-the-first-material-of-every-room': 'tin-tuc-ky-luat-cua-mot-can-bep.html',
  '/blog/the-case-for-reclaimed-brick': 'tin-tuc-mot-tuan-khong-lam-gi.html',
  '/blog/what-a-renovation-really-costs-before-the-first-wall-comes-down': 'tin-tuc-xay-dung-tren-khu-dat-kho.html',
  '/project/casa-bruma-sintra': 'du-an-pavilion-residence.html',
  '/project/horizon-residence': 'du-an-solstice-ridge-house.html',
  '/service/custom-homebuilding': 'dich-vu-kien-truc-thiet-ke.html',
});
for (const [src, out] of Object.entries(PAGES)) {
  const m = src.match(/^(service|project|blog)_(.+)\.html$/);
  if (m) LINKS[`/${m[1]}/${m[2]}`] = out;
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetch(new URL(res.headers.location, url).href));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(res.statusCode + ' ' + url)); }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

const assetMap = new Map(); // url -> local filename
function localName(url) {
  if (assetMap.has(url)) return assetMap.get(url);
  const u = new URL(url);
  let base = decodeURIComponent(u.pathname.split('/').pop() || 'file');
  base = base.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
  if (u.pathname.includes('/gsap/')) base = 'gsap-' + base;
  let name = base, i = 1;
  const used = new Set(assetMap.values());
  while (used.has(name)) name = base.replace(/(\.[^.]+)?$/, `-${i++}$1`);
  assetMap.set(url, name);
  return name;
}

const ASSET_RE = /https:\/\/(?:cdn\.prod\.website-files\.com\/[^"'\s<>]+|d3e54v103j8qbb\.cloudfront\.net\/js\/[^"'\s<>]+|unpkg\.com\/lenis@[^"'\s<>]+)/g;

function cleanUrl(u) { return u.replace(/&amp;/g, '&').replace(/\?site=.*$/, ''); }

async function download(url, name) {
  const file = path.join(ASSETS, name);
  if (fs.existsSync(file)) return;
  try { fs.writeFileSync(file, await fetch(url)); }
  catch (e) { console.warn('  ! ' + e.message); }
}

(async () => {
  const jobs = [];
  for (const [src, out] of Object.entries(PAGES)) {
    let html = fs.readFileSync(path.join(SRC, src), 'utf8');
    // bỏ snippet review của Webflow
    html = html.replace(/<script>\s*window\.__WF_REVIEW_BRIDGE[\s\S]*?<\/script>/g, '');
    html = html.replace(/<script[^>]*validation-worker[^>]*><\/script>/g, '');
    html = html.replace(/\s(integrity|crossorigin)="[^"]*"/g, '');
    html = html.replace(/<link href="https:\/\/cdn\.prod\.website-files\.com" rel="preconnect"\/?>/g, '');
    html = html.replace(ASSET_RE, (raw) => {
      if (raw === 'https://cdn.prod.website-files.com') return raw;
      const url = cleanUrl(raw);
      const name = localName(url);
      jobs.push([url, name]);
      return 'assets/wf/' + name;
    });
    // link nội bộ
    html = html.replace(/href="(?:https:\/\/(?:arcbase-template|atrecxa)\.webflow\.io)?(\/[^"#?]*)?(#[^"]*)?"/g, (m, p, hash) => {
      if (p === undefined) return m;
      const target = LINKS[p.replace(/\/$/, '') || '/'];
      if (!target) { console.warn('  ? link ' + p + ' in ' + src); return m; }
      return `href="${target}${hash || ''}"`;
    });
    fs.writeFileSync(path.join(OUT, out), html);
  }

  // CSS: tải font/ảnh bên trong
  const seen = new Set();
  for (const [url, name] of jobs) {
    if (seen.has(name)) continue; seen.add(name);
    await download(url, name);
    if (name.endsWith('.css')) {
      const f = path.join(ASSETS, name);
      let css = fs.readFileSync(f, 'utf8');
      const inner = [];
      css = css.replace(/url\("?(https:\/\/cdn\.prod\.website-files\.com\/[^"()]+(?:\([^"()]*\)[^"()]*)*)"?\)/g, (m, u) => {
        const n = localName(u); inner.push([u, n]); return `url("${n}")`;
      });
      fs.writeFileSync(f, css);
      for (const [u, n] of inner) await download(u, n);
    }
  }
  console.log(`pages: ${Object.keys(PAGES).length}, assets: ${assetMap.size}`);
})();
