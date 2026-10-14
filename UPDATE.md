# Update protocol

Run commands from `qurOS/`. Node plus `test/`'s one dependency (jsdom) is all
it needs: `npm install --prefix test` once.

## Before

Git is the backup (`GIT-PROTOCOL.md` at the workspace root): start from a
clean tree, or commit what is there first. For something risky, branch.

Keep a short working note in the conversation: **outcome / files / contract
at risk / how it will be checked**.

## Change

Start with the owning function in `js/`, its selectors in `css/app.css`, and
its markup (templates live in the JS; `index.html` is only the shell). Read
QUROS.md by section. Reuse what is there — `Q.ui.sheet`, `Q.ui.screen`,
`Q.ui.choose`, `Q.m.*` — rather than adding a parallel helper.

## Check

```
cd test
npm test          # behaviour (jsdom, fake recognizer) — must pass
node shots.mjs    # 25 screenshots at 412×915 into test/shots/ (git-ignored)
```

| Change | Check |
| --- | --- |
| Docs only | none |
| CSS / visual | `npm test` + the affected screenshots, looked at |
| JS, HTML, manifest, sw.js | `npm test`; screenshots if anything renders differently |
| The recorder, speech, storage, export | `npm test`, plus the matching section's checks extended |

jsdom cannot see layout and has no real speech or wake lock; say so when a
change depends on them. A real phone is the only check for speech sessions,
the wake lock and the share sheet.

## Ship

1. Bump `Q.VERSION` (`js/app.js`) and `VERSION` (`sw.js`) together.
2. QUROS.md Changelog line; architecture sections if a file, key or contract
   changed.
3. For a versioned update, write `updates/yy-mm-dd_update_vX.Y.Z.md` (and the
   copy in `../_git-push/updates/` when it comes through the Todoist protocol).
4. Commit `vX.Y.Z - <what>`; push when asked (GitHub Pages serves `main`).
