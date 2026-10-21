# SkillMD-BDSIDCORP

Skill library + static marketing sites (Vietnamese) for SID Corp.

@frontend-themes/CLAUDE.md

## New site workflow
- User creates a folder at the repo root (or a subfolder like `BĐS/BĐS2/`) and drops in
  `.claude/skills/design-system/SKILL.md`. That file is the brief. Build it with the `tao-website` skill.
- A SessionStart hook (`.claude/hooks/pending-sites.js`) lists folders that have that SKILL.md but no `index.html`.
  Mention them to the user; start building when they ask (`/tao-website <folder>` or "làm web ...").
- Precedence: user's chat message > site SKILL.md > `frontend-themes/CLAUDE.md` > `.agents/skills/`.
  A site SKILL.md asking to copy a reference URL "as close as possible" overrides the theme bans on visuals;
  Vietnamese font subset, `lang="vi"`, and full Vietnamese copy always apply. Record exceptions in the site README.

## Sites
- `WebCoffee/`: built from `src/` (pages, partials). `node tools/build.js` then `node tools/check.js`.
  Edit `src/`, never the root `.html`. First line of each `src/pages/*.html` is `<!--meta {JSON}-->`.
  Build fails on – or — (use `-`), mid-write: fix and rebuild immediately.
- `BĐS/BĐS1/`: mirror of a Webflow template. `_src/` = downloaded English pages, `_mirror/` = localized links,
  root `.html` = generated. Edit `tools/vi.json` (translations) or `tools/build.js`, then `node tools/build.js`.
  `node tools/mirror.js` re-downloads (network). Preview: `node tools/serve.js` (port 5178).
- Each site has its own README with pages and design decisions.

## Skills
- `.agents/skills/` is the source of truth. `.claude`, `.codeartsdoer`, `.codestudio`, `.continue`, `.forge`,
  `.mcpjam` each hold a plain-copy `skills/` mirror. After adding/editing a skill, copy it to every mirror and check:
  `for d in .claude .codeartsdoer .codestudio .continue .forge .mcpjam; do diff -rq .agents/skills $d/skills; done`.
- 7 skills have `disable-model-invocation: true` (don't fit this vanilla-HTML, no-image-tool project): image-to-code,
  imagegen-frontend-web/-mobile, brandkit, design-taste-frontend-v1, gpt-taste, stitch-design-taste. Call with `/name`.
- 2 skills are locally modified vs upstream Leonxlnx/taste-skill (design-taste-frontend, high-end-visual-design).
  Re-syncing from upstream erases these.

## Global UI bans (in addition to frontend-themes/CLAUDE.md, unless the site brief asks otherwise)
- No small colored dot decorations before eyebrow labels.
- No giant decorative brand-name wordmark at the bottom of the footer.

## Git
- Push target: remote `hethong` (github.com/MiinhHung/SkillMD-BDhethong), branch `main`. `origin` is the old repo.
- `.mcp.json` files hold real tokens: never commit them. Delete `.playwright-mcp/` screenshots, don't commit them.
