# qurOS

A phone app for feeding the qurOS knowledge base. You talk (or type) what is
on your mind, log the day in a few taps, and send all of it to a qurOS chat as
one markdown file.

Standalone: its own records, its own storage, nothing shared with root.
A static site — no build step, no framework, no dependencies.

## What is in it

| Tab | What it is for |
| --- | --- |
| **DUMP** | The home tab. **Talk** (speech-to-text) or **write** (the keyboard — its mic works too). Each dump can have a topic: free, evening, a custom tag, or an item from the life-dump map. Everything captured, by day. |
| **DAY** | The day log, slip-tolerant: wake and bed, the one next action, up to three goals a day (carry or drop the leftovers), the morning chain with a full version and a minimum that counts as done, hygiene, focus by area, the gym (A/B with prefilled sets, a rest timer, "add weight"), meals, a 1–5 check-in, evening prep. One switch makes it a bad day. Nothing ever turns red; no streaks. |
| **MAP** | The life-dump map: sections by tier, every item untouched / started / covered, the next untouched one a tap away. A dump on an item marks it started. Load it from a `.md` file, paste it, or start from a starter map. |
| **SEND** | Everything new since the last export as one file — markdown (or JSON) with an instruction block for the chat at the top. Share it straight into the Claude app, copy it, or save it. Sending marks it all sent (with undo). Full backup and restore. |

## The lock

Starting a voice dump keeps the screen on (Screen Wake Lock) and **locks** it:

- every touch is swallowed — only **slide to unlock** along the bottom works;
- the back gesture is refused;
- after 20 s untouched the screen dims to near-black, and the content drifts a
  few pixels now and then (OLED burn-in);
- unlocked and left alone while still listening, it locks itself again (15 s).

So the phone can ride in a hand or a pocket on a walk while it listens. All of
it is adjustable in settings. If the browser has no speech-to-text, the writer
opens instead — still with the screen kept on.

Every phrase is saved to the phone the moment it is heard, so a dead battery
or a killed tab loses nothing: the next start offers the unsaved dump back.

## Running it

It needs http(s) for the microphone, the wake lock and the offline cache:

```
npx serve .           # any static server; localhost counts as secure
```

On GitHub Pages it lives at `https://hpcurate.github.io/qurOS/`. On the phone,
open that and **Add to Home screen** — it then runs full-screen, works offline
(speech-to-text itself usually needs a connection) and its storage is less
likely to be cleared. Long-press the icon for **Talk / Write / Day** shortcuts.

Speech-to-text is the browser's own: Chrome on Android works best; Safari on
iOS works with shorter sessions (the app restarts them on its own).

## Testing

```
cd test
npm install
npm test              # jsdom behaviour checks (a fake recognizer plays the mic)
node shots.mjs        # screenshots of every screen at phone size → test/shots/
```

## Docs

- `QUROS.md` — the manifest: architecture, storage keys, the export contract,
  the things that will bite you, the changelog. Read it before editing.
- `AGENTS.md`, `UPDATE.md` — how to change this repo.
- `updates/` — one log per version.
- `docs/root-flex-system-spec.md` — the planning spec the day log comes from.
  (v1.0.0, the version built on root, is kept on branch `root-port`.)
