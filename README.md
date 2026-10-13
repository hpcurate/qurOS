# qurOS

A phone app for one person's day: **root**, carried forward, with a day that
bends instead of breaking built into it.

qurOS is a static site — no build step, no framework, no dependencies. Open
`index.html` over http(s) and it runs; install it to the home screen and it
behaves like an app.

## What is in it

| Tab | What it is for |
| --- | --- |
| **TODAY** | The day. Two clock times (wake, sleep), **the one next action**, up to three small goals a day and three a week, the morning chain — each step with a full version and a minimum that counts as done — the hygiene chain with a shower timer, focus by area, the evening's prep and brain-dump, and an export for a qurOS chat. One switch makes it a bad day: everything collapses to its minimums. Nothing ever turns red. |
| **DO** | Daily routine checklists, packing lists, Todoist's today list and media. |
| **LOG** | The morning and evening log → an Obsidian daily note, history, reports. |
| **GYM** | The A/B program: the next day suggested, sets prefilled from last time, a rest timer, "add weight" when every set hit the top, the week as "X of 3–4". |
| **STORE** | The grocery list and the in-store counter; a recipe library that sends what is missing to Todoist under a walk-shop or car-shop trip. |
| **TOOLS** | Pomodoro (tagged by area — CAP, music, admin…), breathing, optimise, data. |
| **CREATE · TEND · TRACK · LEARN** | Songs and mixes, plants, the CAP curriculum, Anki decks. |
| **PLAN · DAY** | The old plan-the-hours pair. Still there, out of the bar by default — open them from the settings home. |

Everything — the chain, its minimums, the gym program, the recipes, the
areas, the look — is editable under **settings**, and every tab can be moved,
hidden or recoloured.

## Running it

```
npx serve .          # or any static server; Todoist calls need http(s)
```

Served from the same origin as root (e.g. both on `hpcurate.github.io`), qurOS
and root read **the same records** — logged days, lists, plants — with their
own looks and tab bars. Nothing is copied or migrated.

## Testing

```
cd test
npm install
npm test             # root's harness (1,265 checks) + the flex system's (137)
node boot.mjs        # a seconds-long smoke boot while iterating
```

## Docs

- `QUROS.md` — the manifest: architecture, contracts, storage keys, the things
  that will bite you, and §11, the flex system. Read it before editing.
- `AGENTS.md`, `UPDATE.md` — how to change this repo safely.
- `root-flex-system-spec.md` — the spec the flex system was built from.
- `docs/root-changelog.md` — root's history, 1.0 → 4.14.2.
- `updates/` — one log per qurOS version.
