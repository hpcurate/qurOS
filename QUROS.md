# QUROS.md — the manifest

Read this before editing. Add a Changelog entry (bottom) with every change.

## 1. What qurOS is

A standalone mobile web app for capturing input to the qurOS knowledge base
(Hugo's planning chat): voice and typed dumps, a slip-tolerant day log, the
life-dump map's coverage — and one export of all of it for the chat.

Since v2.0.0 it is **not** built on root. It shares nothing with root except a
look and, on GitHub Pages, an origin — so every storage name is its own (§5).
v1.0.0 (root 4.14.2 + the flex system) is preserved on branch `root-port` and
tag `v1.0.0`.

## 2. Principles (requirements, not style)

From the planning spec (`docs/root-flex-system-spec.md` §2):

1. **Slip-tolerant.** Nothing turns red, says "failed" or resets. Problems are
   grey (a triangle in the recorder), never red. A test greps the CSS.
2. **No streaks.** Counts are "X of 7 this week".
3. **Minimums count.** A minimum fills the same check as full.
4. **One next action leads** (DAY's NEXT card); the rest is quieter.
5. **Two clock times**, wake and bed. No schedule.
6. **Goals, not schedules:** 3 a day, 3 a week, hard caps; carry or drop.
7. **One tap to log.** Other logs fill chain steps in (§6).
8. **Bad-day mode** collapses to minimums, neutral not negative.

And for capture: **never lose words** (§4), **the screen stays on while
capturing**, and **a locked recorder takes no touch but the slider**.

## 3. Architecture

Static files, no build. Plain scripts on `window.Q`, loaded in this order
(the order is load-bearing — each file uses only what loaded before it, plus
late-bound calls at runtime):

| File | Owns |
| --- | --- |
| `js/util.js` | `Q.u` helpers (dates, rollover, icons, escaping) and `Q.settings` (defaults + localStorage) |
| `js/db.js` | `Q.db` — IndexedDB records in memory, write-through; localStorage fallback; the draft |
| `js/speech.js` | `Q.speech` (Web Speech wrapper) and `Q.wake` (Screen Wake Lock, ref-counted by reason) |
| `js/ui.js` | `Q.ui` — layers + back button, toast, sheet, confirm/choose, sub-screens, copy/share/download/readFile |
| `js/model.js` | `Q.m` — what records mean: entries, days, weekly goals, the map (parse, states, next), topics |
| `js/rec.js` | `Q.rec` — the recorder overlay: talk/write, lock, slider, dim, drift, text assembly, save |
| `js/dump.js` | `Q.dump` — DUMP tab, topic picker, entry screen, after-save, recovery/rescue |
| `js/day.js` | `Q.day` — DAY tab |
| `js/gym.js` | `Q.gym` — the GYM sub-screen, A/B suggestion, last sets, rest timer |
| `js/map.js` | `Q.mapUI` — MAP tab and its editing |
| `js/send.js` | `Q.send` — export selection, markdown/JSON builders, mark-sent, SEND tab, backup/restore |
| `js/settings.js` | `Q.settingsUI` — the settings screen and its list editors |
| `js/app.js` | `Q.app` — boot, tab bar, badge, accent, service-worker registration, `Q.VERSION` |

`css/app.css` is the one stylesheet (tokens at the top); `css/fonts.css` and
`fonts/` bundle JetBrains Mono and Syne (latin + latin-ext). `sw.js` is the
offline shell. Tabs render with `innerHTML` from state and use event
delegation on `data-a` attributes; inputs save on `input`/`change` without a
re-render so focus is never lost mid-typing.

Layers (sheet, sub-screen, recorder) each push a history entry: Android's back
gesture closes the top one. `Q.ui.closeLayer` closes from the UI and swallows
the matching `popstate`. A layer may refuse to close (`guard`) — the locked
recorder does, and an unlocked one with unsaved words asks first.

## 4. The recorder

- One overlay for talking and writing. Voice on/off and locked/unlocked are
  independent; lock requires voice. The orb's shape is the state: circle =
  listening, square = paused, grey triangle = a problem.
- `Q.speech` runs `continuous` + `interimResults`, restarts every session that
  ends (sessions end after silence on phones) with back-off on errors, and
  restarts immediately when the page becomes visible again.
- **Android repeats.** In continuous mode Chrome on Android often re-sends the
  previous phrase plus new words as a new result. `relation()` classifies a
  phrase against the last one: `extends` → the recorder replaces the last
  phrase in place (`R.last.pos`), `same` → dropped. A session that ends with
  an unfinished tail keeps it, and the next session cannot repeat it (`carry`).
- Text assembly: phrases join with a space; a silence longer than `paraGap`
  starts a paragraph; "new paragraph" / "new line" (and French equivalents)
  are commands; sentence and paragraph starts are capitalised.
- **Never lose words.** The draft (`qos_draft`, localStorage, synchronous) is
  written on every phrase and every 5 s. On start, an unsaved draft is offered
  back; opening a new recording *rescues* (saves) any orphan draft first.
- **The lock.** Capture-phase listeners on `#rec` swallow touch, pointer,
  click, context-menu and wheel events unless they target the knob; keys are
  swallowed on `document`. Toasts get `pointer-events:none` while locked
  (`html.rec-locked`). The knob unlocks at ≥ 88 % of the track. Dim after
  `dimAfter` s; drift every 30 s; re-lock after `relockAfter` s idle while
  listening (not while a sheet is on top). A blocked mic unlocks and vibrates.
- Wake lock: held as `'rec'` while the recorder is open and `'gym'` on the gym
  screen (if `gymAwake`); re-acquired on `visibilitychange`.
- Fullscreen is requested on open (Android) and left on close.

## 5. Storage — names are contracts

Same origin as root on GitHub Pages, so everything is prefixed or its own:

| Where | Name | What |
| --- | --- | --- |
| IndexedDB | `qurOS` v1, stores `entries` (key `id`), `days` (key `date`), `kv` (key `k`) | the records |
| localStorage | `qos_data_v1` | the same three stores, only when IndexedDB is unavailable |
| localStorage | `qos_settings_v1` | settings (shallow merge over defaults: an edited list replaces the default whole) |
| localStorage | `qos_draft` | the recording in progress |
| sessionStorage | `qos_tab` | last tab, this session only |
| Cache Storage | `qurOS-<VERSION>` | the offline shell |

`kv` keys: `map`, `mapState` (`itemKey → 'partial'|'done'`), `week:YYYY-Www`
(weekly goals), `sends` (last 30, with the body when < 400 kB), `lastBackup`.
Each kv record carries `t` so a merge restore keeps the newer one.

Record shapes are documented at the top of `js/model.js`. Item keys are
`slug(section title)/slug(item text)`; renaming re-keys states and dump topics
(`Q.m.rekey`). A day belongs to `dayOf(ms)` = the date of `ms − rollover h`.

## 6. Things that will bite you

- **Never write root's keys** (`root_*`, `log_*`, `do_*`, `store_state_v1`…).
  Root and the old apps live on the same origin.
- **`VERSION` in `sw.js` must equal `Q.VERSION`** in `js/app.js` (a test checks)
  and every file the page loads must be in `SHELL`. The shell is cache-first:
  without a version bump, phones keep the old files.
- A waiting service worker only takes over when the user taps *reload*, and
  never while the recorder is open.
- Inputs need `font-size ≥ 16px` or iOS zooms the page.
- The anchors grid uses `minmax(0, 1fr)`: a `type=time` input's intrinsic
  width overflows a plain `1fr` column.
- `touch-action:none` is applied only while locked; unlocked, the transcript
  and textarea must scroll.
- Chain steps are auto-filled from other logs by flag, never overwriting a
  manual mark: `wake` (wake time, full if ≤ target + 15 min), `gym` (a logged
  session; min if the minimum plan), `hyg` (hygiene: min, full when all but
  shave), `focus:'CAP'` (a CAP pomodoro), `talk` (a walk dump saved).
- jsdom has no layout, no IndexedDB and no speech; `test/shots.mjs` is the
  visual check (headless Chrome, fake mic, 412×915).

## 7. The export (contract with the qurOS chat)

Markdown, `schema: 2`:

1. Front matter: `app`, `schema`, `exported` (ISO), `range`, `dumps`,
   `words`, `day_logs`.
2. `# qurOS export — <span>`, then the instruction block (settings → export)
   as a blockquote, then a one-line inventory.
3. `## Life-dump map` (if included): covered/started counts, next untouched,
   one line per section with started and untouched items.
4. Per date, ascending: `## <Weekday D Month YYYY>`, `### Day log` (bulleted
   `**Label:**` lines: Anchors, Bad day, Check-in, Goals, Week goals, Morning
   chain, Hygiene, Focus (pomodoros), Gym + sets, Meals, Evening prep), then
   `### Dumps` with `#### HH:MM · kind · topic: … · duration · source · lang ·
   N words` and the text.

"New" = entries never sent or edited since, days touched since sent. Sharing
marks them sent automatically (undo in the toast); copy/file ask. JSON export
is the same selection as data. The backup (`kind: 'backup'`) is every record
plus settings; an export cannot be restored.

## 8. Changelog

- **2026-10-14 · v2.0.0** — Rebuilt from scratch as a standalone capture app
  (Hugo: "start from the beginning … a standalone webapp that i can run on
  mobile to input data … prevent the screen from going to sleep … an overlay
  to lock the display when a recording is in progress"). DUMP / DAY / MAP /
  SEND; the recorder with wake lock, slide-to-unlock lock screen, dim, drift,
  back-gesture guard; crash-safe drafts; export schema 2; offline shell; own
  storage. Recipes and Todoist grocery trips from v1 were not carried over
  (they are STORE's job). Tests: `test/app.test.mjs` (146 checks);
  screenshots of all screens via `test/shots.mjs`. Not verified on a physical
  phone: real speech-to-text sessions, the wake lock and the share sheet.
