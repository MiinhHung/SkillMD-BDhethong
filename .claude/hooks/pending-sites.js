// SessionStart hook: liệt kê thư mục site có .claude/skills/design-system/SKILL.md mà chưa có index.html,
// để Claude biết có site mới đang chờ làm (xem skill tao-website). Chạy tay: node .claude/hooks/pending-sites.js
const fs = require('fs');
const path = require('path');

const ROOT = process.env.CLAUDE_PROJECT_DIR || path.join(__dirname, '..', '..');
const SKIP = new Set(['.git', 'node_modules', 'frontend-themes', '_src', '_mirror', 'assets', 'src', 'tools']);
const SKILL = path.join('.claude', 'skills', 'design-system', 'SKILL.md');

const pending = [];
const done = [];
function walk(dir, depth) {
  if (depth > 3) return;
  if (dir !== ROOT && fs.existsSync(path.join(dir, SKILL))) {
    const rel = path.relative(ROOT, dir).split(path.sep).join('/');
    (fs.existsSync(path.join(dir, 'index.html')) ? done : pending).push(rel);
    return;
  }
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.isDirectory() && !e.name.startsWith('.') && !SKIP.has(e.name)) walk(path.join(dir, e.name), depth + 1);
  }
}
walk(ROOT, 0);

if (pending.length) {
  console.log('Site mới đang chờ làm (có design-system SKILL.md, chưa có index.html): ' + pending.join(', ') +
    '. Dùng skill tao-website; hỏi người dùng trước khi bắt đầu nếu họ chưa yêu cầu.');
}
if (process.argv.includes('--all')) console.log('Site đã có: ' + done.join(', '));
