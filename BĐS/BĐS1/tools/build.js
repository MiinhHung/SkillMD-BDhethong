// _mirror/*.html (bản gốc tiếng Anh đã tải về) -> *.html ở thư mục gốc:
// dịch tiếng Việt (tools/vi.json), logo SID Corp, footer logo SID, menu tiếng Việt.
// Chạy: node tools/build.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const MIRROR = path.join(ROOT, '_mirror');
const vi = JSON.parse(fs.readFileSync(path.join(__dirname, 'vi.json'), 'utf8'));
const missing = new Set();
const VALUES = new Set(Object.values(vi));

const ATTRS = ['alt', 'placeholder', 'value', 'content', 'data-wait', 'aria-label', 'title'];

function translateText(html) {
  html = html.replace(/>([^<]+)</g, (m, raw) => {
    const t = raw.trim();
    if (!t || !/[A-Za-z]/.test(t)) return m;
    if (t in vi) return '>' + raw.replace(t, vi[t]) + '<';
    if (VALUES.has(t)) return m;
    missing.add(t);
    return m;
  });
  const attrRe = new RegExp(`\\s(${ATTRS.join('|')})="([^"]+)"`, 'g');
  return html.replace(attrRe, (m, a, v) => {
    const t = v.trim();
    if (t in vi) return ` ${a}="${vi[t].replace(/"/g, '&quot;')}"`;
    return m;
  });
}

// dịch ngoài <script>/<style>/<svg>
function translate(html) {
  const parts = html.split(/(<(script|style|svg)\b[\s\S]*?<\/\2>)/g);
  let out = '';
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) out += translateText(parts[i]);
    else if (i % 3 === 1) out += parts[i];
  }
  return out;
}

// Menu "Trang" (dropdown): giữ nguyên cấu trúc, thay tiêu đề nhóm và link theo thứ tự
const DROPDOWN_TITLES = ['Trang chính', 'Dịch vụ', 'Dự án', 'Tin tức'];
const DROPDOWN_LINKS = [
  ['index.html', 'Trang chủ'], ['gioi-thieu.html', 'Giới thiệu'], ['lien-he.html', 'Liên hệ'],
  ['dich-vu-kien-truc-thiet-ke.html', 'Kiến trúc &amp; thiết kế'], ['dich-vu-noi-that.html', 'Thiết kế nội thất'], ['dich-vu-cai-tao.html', 'Cải tạo &amp; tái sử dụng'],
  ['du-an-foundry-lofts.html', 'Foundry Lofts'], ['du-an-kiyomizu-court-house.html', 'Kiyomizu Court House'], ['du-an-pavilion-residence.html', 'Pavilion Residence'],
  ['tin-tuc-mot-tuan-khong-lam-gi.html', 'Một tuần không làm gì'], ['tin-tuc-xay-dung-tren-khu-dat-kho.html', 'Khu đất khó'], ['tin-tuc-ky-luat-cua-mot-can-bep.html', 'Quy hoạch căn bếp'],
  ['dich-vu.html', 'Dịch vụ'], ['du-an.html', 'Dự án'], ['tin-tuc.html', 'Tin tức'], ['lien-he.html', 'Liên hệ'], ['404.html', '404'],
];
// Footer: 3 cột, mỗi link có 2 lớp chữ (hiệu ứng hover)
const FOOTER_TITLES = ['Trang chính', 'Dịch vụ', 'Dự án'];
const FOOTER_LINKS = [
  ['index.html', 'Trang chủ'], ['dich-vu.html', 'Dịch vụ'], ['gioi-thieu.html', 'Giới thiệu'],
  ['lien-he.html', 'Liên hệ'], ['tin-tuc.html', 'Tin tức'], ['du-an.html', 'Dự án'],
  ['dich-vu-kien-truc-thiet-ke.html', 'Kiến trúc &amp; thiết kế'], ['dich-vu-noi-that.html', 'Thiết kế nội thất'], ['dich-vu-cai-tao.html', 'Cải tạo &amp; tái sử dụng'],
  ['du-an-foundry-lofts.html', 'Foundry Lofts'], ['du-an-kiyomizu-court-house.html', 'Kiyomizu Court House'], ['du-an-pavilion-residence.html', 'Pavilion Residence'],
  ['du-an-solstice-ridge-house.html', 'Solstice Ridge House'], ['404.html', '404'],
];

function currentAttrs(href, page) {
  return href === page ? ' aria-current="page"' : '';
}

function rewriteDropdown(html, page) {
  return html.replace(/<nav class="nav-dropdown-content[\s\S]*?<\/nav>/, (block) => {
    let t = 0, l = 0;
    block = block.replace(/<div class="dropdown-subtitle">[^<]*<\/div>/g, () =>
      `<div class="dropdown-subtitle">${DROPDOWN_TITLES[t++] || ''}</div>`);
    block = block.replace(/<a href="[^"]*"(?: aria-current="page")? class="dropdown-link w-dropdown-link(?: w--current)?">[^<]*<\/a>/g, () => {
      const [href, label] = DROPDOWN_LINKS[l++];
      const cur = href === page;
      return `<a href="${href}"${cur ? ' aria-current="page"' : ''} class="dropdown-link w-dropdown-link${cur ? ' w--current' : ''}">${label}</a>`;
    });
    return block;
  });
}

function rewriteFooter(html, page) {
  const start = html.indexOf('<div class="footer-grid">');
  const end = html.indexOf('<div to-top-6="" class="footer-social-list">');
  if (start < 0 || end < 0) return html;
  let block = html.slice(start, end);
  let t = 0, l = 0;
  block = block.replace(/<div class="footer-menu-title">[^<]*<\/div>/g, () =>
    `<div class="footer-menu-title">${FOOTER_TITLES[t++]}</div>`);
  block = block.replace(/<a href="[^"]*"[^>]*class="footer-link w-inline-block[^"]*">[\s\S]*?<\/a>/g, () => {
    const [href, label] = FOOTER_LINKS[l++];
    const cur = href === page;
    return `<a href="${href}"${currentAttrs(href, page)} class="footer-link w-inline-block${cur ? ' w--current' : ''}">` +
      `<div class="footer-link-text one">${label}</div><div class="footer-link-text is-two">${label}</div></a>`;
  });
  return html.slice(0, start) + block + html.slice(end);
}

function brand(html) {
  // logo header: biểu tượng SID
  html = html.replace(/<img alt="[^"]*" src="[^"]*" class="brand-logo"\/>/g,
    '<img alt="SID Corp" src="assets/img/sid-logo-mark.png" width="56" height="56" class="brand-logo sid-brand-logo"/>');
  // khối chữ lớn cuối footer -> logo SID đầy đủ trên nền trắng
  html = html.replace(/<div([^>]*) class="footer-brand"><div class="footer-brand-overlay"><img [^>]*class="footer-brand-logo"\/><\/div><\/div>/g,
    '<div$1 class="footer-brand sid-footer-brand"><div class="footer-brand-overlay">' +
    '<img src="assets/img/sid-logo-full.png" loading="lazy" width="1992" height="676" ' +
    'alt="SID Corp - Systems of Innovation and Development" class="footer-brand-logo"/></div></div>');
  // credit
  html = html.replace(/\s*- Powered by\s*<a [^>]*>Webflow<\/a>/g, '');
  html = html.replace(/href="https:\/\/webflow\.com\/templates\/designers\/inksstudio-llc" target="_blank"/g, 'href="index.html"');
  return html;
}

// CSS gốc -> assets/site.css: font hỗ trợ tiếng Việt (Aboreto/Switzer không có dấu)
const CSS_SRC = fs.readdirSync(path.join(ROOT, 'assets', 'wf')).find((f) => /^atrecxa\.webflow\.shared.*\.css$/.test(f));
let css = fs.readFileSync(path.join(ROOT, 'assets', 'wf', CSS_SRC), 'utf8').replace(/url\("(?!data:)/g, 'url("wf/');
css = css.replace(/Aboreto, sans-serif/g, '"Montserrat", sans-serif')
  .replace(/font-family: Switzer(, Arial, sans-serif)?/g, 'font-family: "Be Vietnam Pro", Arial, sans-serif')
  .replace(/(font-family: var\(--_typography---typography--font-family--heading-font-family\))/g, '$1; text-transform: uppercase; letter-spacing: -0.035em !important');
fs.writeFileSync(path.join(ROOT, 'assets', 'site.css'), css);

const pages = fs.readdirSync(MIRROR).filter((f) => f.endsWith('.html'));
for (const page of pages) {
  let html = fs.readFileSync(path.join(MIRROR, page), 'utf8');
  html = html.replace('<html data-wf-domain="atrecxa.webflow.io"', '<html');
  html = html.replace(/ lang="en"/, ' lang="vi"');
  html = rewriteDropdown(html, page);
  html = rewriteFooter(html, page);
  html = brand(html);
  html = translate(html);
  html = html.replace(/Atrecxa/g, 'SID Corp');
  html = html.replace(/assets\/wf\/atrecxa\.webflow\.shared[^"]*\.css/, 'assets/site.css');
  html = html.replace(/families: \["Aboreto:400","Inter Tight:300,400,500,600,700"\]/,
    'families: ["Montserrat:300,400,500,600:latin,vietnamese","Be Vietnam Pro:300,400,500,600,700:latin,vietnamese","Inter Tight:300,400,500,600,700:latin,vietnamese"]');
  html = html.replace('</head>', '<link href="assets/sid.css" rel="stylesheet" type="text/css"/></head>');
  fs.writeFileSync(path.join(ROOT, page), html);
}
console.log(`built ${pages.length} pages`);
if (missing.size) console.log('chưa dịch:\n  ' + [...missing].join('\n  '));
