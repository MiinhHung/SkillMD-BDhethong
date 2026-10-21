// Liệt kê mọi chuỗi chữ (text node + alt/placeholder/value/meta) trong _mirror/ chưa có trong tools/vi.json
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', '_mirror');
const vi = fs.existsSync(path.join(__dirname, 'vi.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'vi.json'), 'utf8')) : {};
const out = new Map();
for (const f of fs.readdirSync(DIR)) {
  let h = fs.readFileSync(path.join(DIR, f), 'utf8');
  h = h.replace(/<(script|style|svg)[\s\S]*?<\/\1>/g, '');
  for (const m of h.matchAll(/>([^<]+)</g)) { const t = m[1].trim(); if (t && /[A-Za-z]/.test(t)) out.set(t, (out.get(t) || 0) + 1); }
  for (const m of h.matchAll(/\s(alt|placeholder|value|content|data-wait|aria-label|title)="([^"]+)"/g)) {
    const t = m[2].trim();
    if (m[1] === 'content' && !/\s/.test(t)) continue;
    if (t && /[A-Za-z]{2}/.test(t) && !/^(https?:|assets\/|width=)/.test(t)) out.set(t, (out.get(t) || 0) + 1);
  }
}
const todo = [...out.keys()].filter((k) => !(k in vi));
fs.writeFileSync(path.join(__dirname, '..', '_src', 'todo.json'), JSON.stringify(todo, null, 1));
console.log('total', out.size, 'todo', todo.length);
