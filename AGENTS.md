# Updating qurOS

The entry point; [UPDATE.md](UPDATE.md) has the workflow, [QUROS.md](QUROS.md)
the architecture and contracts.

1. Read the QUROS.md sections the change touches (§3 files, §4 recorder,
   §5 storage, §6 gotchas, §7 export). Not the whole file by default.
2. Make the smallest complete change in the owning `js/<file>.js` and its
   styles in `css/app.css`. Match the surrounding code; comments for reasons
   and contracts only.
3. `cd test && npm test` — all checks pass. Add a check for a behaviour fix.
   For anything visual, `node shots.mjs` and look at the affected screens.
4. Bump `Q.VERSION` (js/app.js) **and** `VERSION` (sw.js) together for any
   change that ships, or phones keep the cached old files.
5. Add a Changelog line to QUROS.md; update §3–§7 when a file, key or
   contract changes. Report what changed, what passed, what is unverified.

## Contracts to preserve

- Static site, no build, no dependencies; scripts load in the order in
  index.html, each on `window.Q`.
- Storage names in QUROS.md §5 are contracts. Never touch root's keys — same
  origin on GitHub Pages.
- The export's shape (QUROS.md §7) is read by the qurOS chat; bump `schema`
  if it ever has to change.
- The flex principles (QUROS.md §2) are requirements: nothing red or
  "failed", no streaks, a minimum counts as done, one next action leads.
- Never lose words: the draft is written on every phrase; nothing replaces
  an unsaved draft without saving it first.
- A locked recorder takes no touch but the slider.

No agent delegation by default.
