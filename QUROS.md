# qurOS — manifest

> **Start with AGENTS.md and UPDATE.md before editing.** Read only the relevant
> sections of this reference. Update the Changelog for every completed change;
> keep its entries brief and keep the current architecture sections accurate.

qurOS is **root** (hpcurate/root, v4.14.2) carried forward, with the flex system
from `root-flex-system-spec.md` built into it. §§1–10 are root's architecture —
still exactly how this app works — with qurOS's changes folded in where they
touch it; **§11 is the flex system** (TODAY, GYM, focus areas, recipes and the
grocery trips). Where the text below says "ROOT" it means this codebase and its
lineage; the app itself is called qurOS. Root's own changelog, 1.0 → 4.14.2, is
kept whole in `docs/root-changelog.md`.

---

## 1. What ROOT is

Twelve small single-purpose tools that share one phone, one frame and one set of
storage keys. It is a static site — no build step, no framework, no dependencies,
no network except the Todoist calls you explicitly ask for (and, only when you
import an Anki deck, the three libraries LEARN needs to unpack it). Open
`index.html` over http(s) and it runs.

| Tab       | Does                                                                   |
| --------- | ---------------------------------------------------------------------- |
| **TODAY** | The day, flexible (qurOS, §11): two anchors (wake, sleep), the one next action, up to three goals a day and three a week with carry / drop, the morning chain with a full and a minimum per step, the hygiene chain and its shower timer, focus by area, the evening's prep, dump and export, and the life-dump map. One switch makes it a bad day. The first tab. |
| **GYM**   | The A/B program (qurOS, §11): the next day suggested, per-set weight and reps prefilled from last time, a rest timer, the "add weight" hint, the week as "X of 3–4", a minimum session that counts. |
| **DO**    | Daily routine checklists + travel packing lists. Closes finished routines in Todoist. Also the `@quick` cards, the block tiles (how far back "show done" reaches is a dial), the consistency strip, and the media tab — a watchlist, drawn as rows since 2.24, with kind chips, find, sort and *surprise me*. Its cards can be minimal, and a finished routine can be hidden. |
| **LOG**   | Morning/evening daily log → an Obsidian-shaped `.md` note, plus history and weekly/monthly reports. Its home is one screen: a month of days by how much of each was written, a fortnight of energy, mood and stress (tap it and it opens over the month, with axes), then the doors — and since 4.1 the fortnight is **six** charts, cycled by tapping the key row under it (the day, morning vs evening, sleep, walking, output, intake), each on its own single-unit axis. Its tab wears a `!` while a half of the day is unwritten. |
| **PLAN**  | Builds a queue of tasks against a project/section tree, then pushes the batch to Todoist. A queue can be saved as a preset. Picked rows of the sent history export back out as one day's schedule — see §8. |
| **STORE** | Grocery list with auto-categorisation, an in-store spend counter (pinnable to the top of the page), premade meals, trip history. Since 2.25 the band carries how much of the list is ticked, and — while the counter is pinned — what the trip has cost: white, with a hard offset shadow, and a `+` or `−` at its head for a moment when it moves (3.0.2; it went green and red until then). |
| **TEND**  | Plant care: today's round by room, a shelf of every plant, an append-only care log that stretches intervals with the season. |
| **TRACK** | The CAP Électricien plan: 54 topics ticked with a date, a derived pace, and the trajectory against exam, internship and revision. |
| **LEARN** | Anki `.apkg` decks studied on the go: rate cards, read the scoreboard, drill what needs work. |
| **CREATE** | The work being made, in **areas**: `production` is the songs, `mixing` is the DJ sets. Same machine for both — a thing sits on a stage, the stage asks its own checklist of it, and the hours at the desk are written down as sessions — so an area is only its own name, colour, noun, stages and session words, and a third one is a block in Config. Three screens: the shelf, one piece of work, the session log. The shelf is **combined**, with the areas as its filter (4.0): what is on the desk is one question and it stops being answerable the moment the answer is split across two screens. The shelf has no network: a song is not a task and a shelf of unfinished things is the normal state of the room, not a backlog to clear. Since 4.1 the areas are DO's tab strip rather than pills, an area says which meta chips it asks for (a mix has no key), and a fourth chip — **curate** — reads a whole Todoist **project** and lists it under its own sections, subtasks nested. That tab is the one networked thing in the app; since 4.2 a row can be ticked off, which closes it in Todoist, and that is the only thing CREATE writes anywhere. The day's hours also reach LOG's note and both reports. Since 4.1.1 the in-progress count is a number at the right end of the wordmark's row rather than a 74px block under the band — the same box and the same shuffle LOG's and DAY's day numbers have. Since 4.3 that number is a **tally** while the filter is `all` (one number per chip, each captioned — three unlike things added together answered nothing), a work's progress is **two** bars (the stages of its area, then the steps of the stage it is on), and an hour at the desk that made no song can be logged loose from the session log. Since 4.12 the shelf opens on **practice counters** — one block per area with `+30` and `+60` under it, totalling a week, a month or a year (a word in the section's own title line). Several taps inside a minute are one session; the counters follow the strip, and which areas get one is a switch per area in settings. Practice is an ordinary session with no work and a `practice` flag, so it reaches the week, the note and both reports like every other hour. |
| **DAY**   | The day PLAN exported, drawn as a calendar: the template resolved to clock times, the picked tasks in their slots, each row in its project's colour. A line across it at the hour it is now, and every row tickable. Stepped left and right through the days that are planned. Written at export time, and since 2.23 its slots can also be filled from the blocks DO is holding — see §9. Since 4.8 a row can be **moved** with the arrows on it — a swap with the neighbour that re-times the pair from the earlier one's start, so the pair keeps the span it had and nothing outside it moves; a `fixed` row is an anchor and neither moves nor is moved past. `+ gap` adds an empty hour on the end, to be walked up into place with the same arrows, which is why it asks for a length and not for a position. Since 2.24 a row can be deleted (closing the gap or leaving the hour free), LOG's morning wake-up time moves the whole day, and the blocks and the template hours can each be given their colour. Since 2.24.1 a day PLAN never sent can be started here from the day's own shape — it is marked **not sent** for as long as that is true. Since 2.25 it carries the same big shuffling date LOG does. Since 3.0.4 a completed task leaves a **mark** on it at the minute it was ticked — a green dot, the time and the name — whether it was ticked here, on DO's blocks or on DO's today list; since 3.1.0 a completion that has a row of its own is written **into that row** instead of floated across it, and only the ones with nowhere to sit still float. Since 4.12 all of that reshaping lives behind an **edit mode** — the delete, the arrows and two new length buttons appear only while it is on, because reading a schedule and editing one are different jobs. The length buttons move a row by `calStep` (15 minutes by default) and shift what follows by the same amount, stopping at a `fixed` row: an anchor keeps its clock, so growing into one is refused. Its id is `cal` everywhere that is an identity; **DAY** is only what it is called. |
| **TOOLS** | Four instruments behind one strip: a **pomodoro**, a **breathing** round, **optimise** and **data**. Every running thing stores the wall-clock moment it ends rather than counting ticks, so a phone that slept, a throttled background tab and a reload all come back to the right number. Added in 4.3 with four; 4.8 cut the stopwatch, the countdown and the decider and added the breathing round — three phases a round, a retention that is **not** timed because its length is the measurement. 4.12 renamed that round from *wim hof* (the method is his; the tool is a breathing round — its Config path is still `tools.wimhof`), gave every clocked instrument its own dials on the page and its history under it, squared the big button, made the strip itself a setting (`toolsShown` — which instruments, in what order), and added two more. **OPTIMISE** is named lists of steps run against the clock: a shelf row per list with its best time on it, two buttons in a run (the clock and the step), splits that come back **gold** when they beat that list's best for that step, and a history with filters. Its lists are Config (`tools.optimise`); its times are filed under a list's **id**, so a rename keeps the record. **DATA** reads the whole app back — since 4.12.1 not just the three instruments beside it but LOG, TRACK, LEARN, CREATE, DAY, TEND and STORE, in five families (body, done, made, tools, life), each series asked of the owning app's own read-only day reader rather than its storage key. Tiles, the range day by day, a pie, a nightingale wheel of the week and a kept-up strip, as inline SVG with no library. A rating is averaged, a count is totalled, and a day nobody wrote is left out rather than counted as a zero. Since 4.12 every finished thing here, not only a session, is written into LOG's day as a block and onto DAY's schedule as a mark. |
| **Settings** | A home menu (search, the apps kept out of the bar, then three categories), and behind it twelve panels: one per app (its settings, then its content editors), look / layout / behaviour, and data. |
| **Sync** | Not a tab either: two routes under settings → data, one through Todoist and one through a file you move yourself, and a merge that completes a day rather than replacing it — see §10. |
| **Search** | Not a tab: one sheet over the lot, opened with `/` or from the settings menu. Apps, Config content, each app's own data, and every settings dial by name — see §3. |

Which of the twelve get a tab, and in what order, is itself a setting
(appearance → layout → apps in the bar). Settings is always last. An app
switched off keeps its slide and opens from the settings home. **qurOS ships
PLAN and DAY out of the bar** — they are the rigid plan-the-hours pair TODAY
replaces — but both still ship, work and open from the settings home.

That list is stored whole, so a *new* app needs `Prefs.appsSeen` to reach an
install that already has one — see §6, which is the trap CAL walked into.

### The vision (2.0)

ROOT 1.0 was four apps merged into one shell. The shell was shared; almost
nothing else was. Personal data — routine items, block names, aisle vocabulary,
project trees — sat inside program logic, and the four "themes" could only
repaint a layout whose shape was hardcoded in five stylesheets.

**2.0 separates the three things that were tangled together:**

```
       CONTENT                  APPEARANCE                 BEHAVIOUR
   what the app is about     what the app looks like    how the app responds
   ────────────────────      ──────────────────────     ─────────────────────
      js/config.js               js/prefs.js               js/prefs.js
   editable in Settings       15 presets + 42 dials      one delegated reader
   → content panel            → look / layout panels     → behave panel
```

Nothing that is personal to one person is written into program logic any more.
The default content is still Hugo's, but it is *data with a default*, not a
constant — so ROOT is now a thing someone else could pick up, or that its owner
can reshape entirely without touching a line of code.

Two rules that fall out of the vision, and that every future change must respect:

1. **A theme sets the whole character, not just the palette.** Corner radius,
   border weight, depth, texture and the type pairing are all part of a preset.
   That is only possible because the app stylesheets reference tokens rather than
   literal pixel values — see §4.
2. **The export format is a contract.** LOG's `.md` output is parsed by an
   Obsidian workflow. Field *names* in the day record and in the exported table
   are never user-editable and never renamed. Everything the user *sees* is.

---

## 2. Files

```
qurOS/
├── README.md          what qurOS is, how to run and test it
├── AGENTS.md          short instructions for agents updating this project
├── UPDATE.md          backup, targeted reading, validation and completion protocol
├── QUROS.md           architecture reference and changelog (this file)
├── root-flex-system-spec.md   the spec the flex system was built from
├── docs/root-changelog.md     root's history, 1.0 → 4.14.2, kept whole
├── updates/           one log per version
├── index.html         all markup for every view + the icon sprite
├── favicon.png
├── manifest.webmanifest   installable on Android/Chrome; iOS reads the apple-* metas
├── test/
│   ├── update.mjs     verified backups and change-aware validation; see UPDATE.md
│   ├── update.test.mjs  checks for the update runner
│   ├── harness.mjs    jsdom boot + behaviour checks — see §7
│   ├── flex.mjs       the flex system's checks — see §11
│   ├── boot.mjs       a seconds-long smoke boot for iteration
│   ├── peek.mjs       prints a screen as words: what is on it and in what
│   │                  order. jsdom has no layout, so it cannot say whether
│   │                  anything is the right size — it answers the half of
│   │                  "did that come out right" that does not need eyes,
│   │                  which is the half you still have without a browser
│   └── package.json   its one dev dependency (jsdom); not part of the site
├── css/
│   ├── tokens.css     the token system + every global consequence of a dial
│   ├── today.css      TODAY (§11)
│   ├── gym.css        GYM (§11)
│   ├── themes.css     15 presets, depth ramps, card treatments, nav variants
│   ├── do.css         ┐
│   ├── log.css        │
│   ├── plan.css       │ per-app sheets, each scoped to its .ns-* namespace
│   ├── store.css      │
│   ├── tend.css       │
│   ├── track.css      │
│   ├── learn.css      │
│   ├── cal.css        │
│   ├── create.css     │
│   ├── tools.css      ┘
│   ├── shell.css      the frame: slide track, floating chrome, responsive rules
│   └── settings.css   the settings view
└── js/
    ├── prefs.js       appearance + behaviour engine   (loaded from <head>)
    ├── config.js      the content layer
    ├── shell.js       Creds, Shell, the slide track, swipe, keyboard
    ├── do.js  log.js  plan.js  store.js  tend.js  track.js  learn.js  cal.js
    ├── create.js       the songs being made
    ├── tools.js        the pomodoro (with focus areas), breathing, optimise, data
    ├── gym.js          the A/B program (§11)
    ├── today.js        the flex day (§11) — loads last of the apps
    ├── sync.js        the two sync routes and the merge — see §10
    ├── settings.js    the settings view
    └── search.js      the search sheet — reads SET's index and every module's hook
```

### Load order — this is load-bearing

```
<head>   prefs.js          stamps the look on <html> before the first paint
         tokens.css → today → do → log → plan → store → tend → track → learn → cal
                    → create → tools → gym → shell → settings → themes.css
<body>   config.js         content exists before any app reads it
         shell.js          defines Creds + Shell.toast, used by every module
         do / log / plan / store / tend / track / learn / cal / create / tools
         gym / today       TODAY reads every other app, so it boots after them
         sync.js           reads every app's keys, so it follows all of them
         settings.js       needs every module to exist to render its panels
         search.js         reads SET.searchIndex() and the modules' search hooks
```

LEARN's three libraries (JSZip, sql.js, fzstd) are **not** in this list. They
are injected by `LEARN.ensureLibs()` the first time an `.apkg` import starts,
and never otherwise — ROOT stays a no-dependency page until you bring a deck in.

`themes.css` is last so its `[data-theme]` overrides beat the app sheets on equal
specificity. `settings.css` is after `shell.css` for the same reason.

---

## 3. Architecture

### Namespacing

Each app is one IIFE published as `window.DO` / `LOG` / `PLAN` / `STORE` /
`TEND` / `TRACK` / `LEARN` / `CAL` / `CREATE` / `TOOLS`, and each does its DOM
lookups through a scoped helper:

```js
const SCOPE = '.ns-do ';
const $id = id => document.querySelector(SCOPE + '#' + id);
```

All seven apps use ids like `#s-home` and `#td-project`. The `.ns-*` prefix is
what keeps them from colliding. **Never query the document unscoped from inside
an app module.** Inline `onclick` handlers therefore read `DO.go(...)`, not
`go(...)`. TEND has no inline handlers at all: every button carries `data-act`
and one document-level listener, filtered on `.closest('.ns-tend')`, dispatches
— its markup is in three places (the slide, the overlays, the settings panel)
and that is the one listener that reaches all of them. CAL is built the same
way and for the same reason — its markup is in the slide and in the settings
panel, and a day name interpolated into an inline handler is one more thing to
get wrong. CREATE is the third, for the third time the same reason: the name of
a song or a mix is the user's own text and it is in three screens and a
settings panel. TOOLS is the fourth, for the fourth time the same reason: a
decider's lists are the user's own text too.

Any *user-editable* value that is interpolated into an inline handler —
`onclick="LOG.toggleBlock(this,'…')"` — goes through the module's `attr()`,
which escapes it as a JS string literal and then as an HTML attribute. `esc()`
alone is not enough: a block called `it's` was a syntax error in every handler
on the evening form.

### What the shell gives every module

```js
Shell.toast(msg)                       // the one toast — and the one place a message makes a sound
Shell.undo(label, restore)             // the one undo pill — offered *instead of* a toast
Shell.hideUndo()                       // take it back down early
Shell.rollNum(box, text, sort)         // a number in a .h-daynum box, shuffled
Shell.dayNum(box, iso)                 // …the day of the month, which is rollNum with the date as its sort
Shell.today()                          // local YYYY-MM-DD — the only definition of "today"
Shell.confirm(msg, onOk)               // the app's own dialog; honours "confirm before clearing"
Shell.confirm(msg)                     // …the same question as a promise, for async callers
Shell.prompt(msg, value, onOk)         // the same dialog with a field in it
Shell.ask({ title, body, input, yes, no, danger, done })   // the dialog itself
Shell.settings(panel)                  // jump to a settings panel ('general' still maps to 'data')
Shell.badge(name, n)                   // a count on a tab button
Shell.alert(name, on, why)             // the app's icon replaced by a "!" — LOG uses it
Shell.register(name, { onShow, onDayChange, onMinute, home, search })
```

**Sound is the shell's, and no module has a line of it.** `Prefs.sound(event)`
takes one of **five moments** — `tap` (a control under a finger), `nav` (the
slide arriving), `menu` (a sheet or dialog opening), `done` (something being
ticked off) and `msg` (a toast) — and it is still called from exactly **three**
places, all in `shell.js`: one capture-phase `pointerdown` listener on the
document, `Shell.go` when the slide actually changes, and `Shell.toast`. The two
moments added in 4.3 are decided *there*, off the element under the finger
(`pressVoice()`), and never announced by an app — which is what keeps a tenth
app free of a line of audio. A tick that is about to go **on** is `done`; one
coming back off is a plain `tap`, because the sound has to agree with what
happens or it is noise.

Which timbre each moment gets is two dials rather than a constant (4.3): a
**kit** maps all five at once (`tick`, `classic`, `wood`, `glass`, `minimal` —
`classic` is exactly what 4.2 sounded like), and five per-event overrides sit on
`auto` until one of them is wrong. Nine voices, all built from one oscillator,
one gain envelope and — where it needs the edge taken off — one lowpass.

Nothing is downloaded and no `AudioContext` exists while the setting is off; the
first one is built inside the gesture that plays the first note, which is the
only moment a browser allows it. A second play within 55 ms is dropped, so a tab
press — a pointerdown *and* a nav — is one sound rather than two. Adding a sound
to an app is therefore still never the answer: if a press should sound, it
should be a control.

**Asking is not synchronous.** `Shell.confirm` opens `#ask` and returns; what to
do next is the second argument, or the promise it answers with when there is no
second argument. A `confirm()` or `prompt()` anywhere in a module is a bug — see
§6 — and a harness check reads every module and fails on one.

**`Shell.undo` is what a clear does instead of toasting.** The module takes a
copy of what it is about to clear, clears it, and hands the way back as a
closure; the pill lives for the "Undo window" dial (behaviour; 0 pins it until
it is tapped or the next clear replaces it) and then the closure is dropped. It
is never shown *as well as* a toast — they occupy the same spot — and there is
deliberately only one at a time, because a stack of undo pills on a phone is a
stack of pills and the second clear is the one you meant. Nothing about it is
stored: an undo that survived a reload would be an edit history, which this is
not. Seven modules offer it (STORE, PLAN, DO, LOG, CAL, TRACK, CREATE) and a
harness check fails if one stops.

`Shell.ask` is the dialog underneath both, for the questions that are **not**
about clearing and so must be asked whatever "confirm before clearing" says:
LOG's "go back without saving?", its import, the data panel's restore, PLAN's
unmapped project. `Shell.confirm` is only for the ones that setting is allowed
to wave through.

`onShow` fires on every visit to the tab. `home` fires when the app's own tab
is tapped while it is already showing (go to the home screen; LOG checks for
unsaved input first). `onDayChange(iso)` fires when the
calendar day changes while the app is open — the shell checks on
`visibilitychange`, on window focus, on every tab change and once a minute.
DO moves to the new day's record; LOG moves its selected day only if it was
"today" and no form is open (an evening written at 00:10 belongs to the day
that just ended). Nothing else captures "today" at boot any more.

`onMinute` rides the same tick as that day check — one timer, not one per app —
for anything that has to notice the clock moving without being on screen. LOG's
alert is the only user: it turns on as 10:00 and 21:00 pass, whichever tab you
are on. `search(q)` answers with what that app holds outside Config, as
`{ title, sub, go }` rows; `q` arrives folded (lower case, accents dropped).

### Search

`js/search.js` — a `.sheet-back` sheet, a sibling of `#views`, opened with `/`
or from the row at the top of the settings menu. Four sources, in the order
they are offered:

| Source | Comes from | Tapping it |
| --- | --- | --- |
| the apps | `Shell.APPS` | opens the tab, or `Shell.open()` if it is out of the bar |
| each app's own data | the modules' `search` hooks — DO's travel lists, TEND's plants, LEARN's decks | opens that thing |
| content | `CONTENT` in search.js, one line per Config path | the panel whose editor owns that path |
| settings | `SET.searchIndex()` | `Shell.settings(panel)` |

**Nothing in it is a second list of what exists.** The settings index is built
by rendering the three generated panels into a detached node and reading the
labels off the controls themselves (`lookHTML()` / `layoutHTML()` /
`behaveHTML()` exist for that reason), and walking the app panels where they
stand; content comes out of `Config.get()` on the spot. A dial added to
`Prefs.SCHEMA` and a routine renamed this morning are both findable without a
line being added here — which is the only way an index like this survives
contact with the next six months.

Routes: `#do` … `#settings` pick a tab; `#settings/<panel>` lands on one
settings panel and is kept in the address bar as you switch panels.

### The cursor

The keyboard's way around, and it walks **two levels**: a screen's blocks first,
then the controls inside whichever block you step into. `blocksOf()` derives the
blocks by walking down from the screen through any run of single-child wrappers
until it finds a level with more than one thing on it — so a screen's sections
are whatever that screen's markup actually says they are, with no per-app list
to keep in step.

**Blocks come from the open screen**, not from the slide: a `.view` has only two
children (the band and `.view-body`), so its "blocks" would be the band and the
entire page. The band is one block; the rest are the sections of whichever
`.scr` is `.on`. A lone child is unwrapped only when it is a group *of groups* —
a container whose children are the controls themselves is the block, which is
what keeps a grid from becoming one block per tile.

**`shown()` is asked in ROOT's vocabulary**, never through `offsetParent`: that
is null for `position:fixed` elements *and* for everything under jsdom, which is
what kept this feature untestable through three rewrites.

**Movement is spatial.** Each direction picks the nearest candidate that
actually lies that way, off `getBoundingClientRect` — walking the list in
document order is what made a two-column grid send *down* to the right. Sharing
a row or column with the cursor counts for eight times more than distance. Up
and down fall back to document order at a dead end so two keys reach everything;
left and right do not.

Three rules it is built on:

- **The list is rebuilt on every move, never cached.** These screens re-render
  constantly, and a cached list hands back detached nodes. A miss restarts at
  the top, so the cursor heals rather than breaks.
- **A text field is selected but not focused.** The bindings are letters; a
  focused field would swallow them *and* type them.

What is selectable is `FOCUSABLE` in `shell.js`, and it includes `[onclick]` and
`[data-act]` — half of ROOT's controls are neither buttons nor links, and
leaving those out is why DO's routine cards were unreachable until 4.9.

The mark (`#kb-mark`) is a child of `<body>`, not of `#track` — §6.

### The slide track

`#track` holds up to eight slides **stacked**, and a tab change is a
cross-fade: `Shell.show()` sets `.cur` on the incoming slide and `.leaving`
on the outgoing one, plus `.morph` for a beat to play the incoming title in
(the wordmark, or the `.hd-title` of whichever sub-screen that slide was left
on). The track itself never moves. Each `.view` is a column: the home's
`.h-top` as a title band at the top (Shell moves it there at boot, before the
modules run) and `.view-body`, the scroll container holding every screen — so
every tab remembers where you left it, and the band never scrolls. A module
that resets or reads the scroll position uses the body
(`document.querySelector('#view-x .view-body')`), never the view.
**Nothing `position:fixed` may live inside `#track`** — a transformed ancestor
becomes the containing block for fixed descendants. The toast, the nav, the LOG
modal, TEND's sheets and undo pill, and all the STORE sheets are siblings of
`#views` for exactly that reason.

**Which slides exist, and in what order, is `Prefs.apps`.** `Shell.rebuild()`
reads it, re-orders the `.view` sections inside `#track` and the `.tab-b`
buttons inside `#nav` to match (each is addressed by `id="view-x"` /
`data-app="x"`, never by position), hides the ones switched off, and appends
settings. `Shell.TABS` is mutated in place so the reference stays live. A hidden
view is `display:none`, so the percentage transform still counts only visible
slides. The pill never grows past its phone width and the arrows are always
there; the settings home lists the apps that are out of the bar, and
`Shell.open(name)` puts one's slide back into the track just before settings
(no tab button) until you leave it, when `retire()` hides it again and re-parks
the track; while you are on it the settings button wears its icon. Keyboard
`1`–`9` jump by position in the current order. `rebuild()` re-appends the
`.view` nodes, which resets their scroll position, so it saves and restores
each slide's `scrollTop` around the move.

The left arrow is context-sensitive: on an app's home it is "previous tab";
inside a sub-screen (`.scr.on` other than `#s-home` carrying an `.hd-back`)
it becomes that back button. Tapping the tab you are already on calls the
module's `home` hook (`Shell.register(name, { home })`), else presses the
sub-screen's back button until there is none, and scrolls to the top once
home.

### Prefs — the appearance engine

Two mechanisms, deliberately split:

| Mechanism | Used for | Wins over |
| --- | --- | --- |
| `data-*` attributes on `<html>` | enumerated choices whose effect is more than one value (theme, depth ramp, texture, nav style) | stylesheet defaults |
| inline custom properties on `<html>` | continuous choices (radius, border weight, density, scale, custom accent) | *everything*, including the preset |

So a preset can set a whole character and each part of it stays individually
overridable. `Prefs.apply()` is the only function that writes to the DOM.

A preset's character (its default radius, border, depth, texture and font
pairing) lives in `THEME_CHARACTER` in `prefs.js`, **not** in `themes.css`. The
stylesheet holds only colours. This is why adding a theme is ~12 colour values
plus one line of character.

Loaded from `<head>`, before the stylesheets, so nothing flashes on a cold start.
It touches only `document.documentElement`, never `document.body`.

### Config — the content layer

```js
Config.get(path)        // merged: user override if present, else the shipped default
Config.set(path, value) // persist an override and notify subscribers
Config.reset(path)      // drop the override
Config.isCustom(path)   // has this branch been overridden?
Config.subscribe(fn)    // fn(path) after any set / reset / import
```

Overrides are stored **whole-branch, not deep-merged**. Deep-merging a user's
edits into a shipped list makes deletion impossible to express, and deletion is
the one thing an editor must be able to do. Only overrides are persisted, so an
untouched install stores nothing at all.

`get()` returns a structured copy — a caller mutating what it got back cannot
corrupt `DEFAULTS` or the override tree.

Every app module subscribes and re-renders on a matching path:

```js
Config.subscribe(path => {
  if (path !== '*' && !String(path).startsWith('do.')) return;
  readConfig(); renderTabs(); renderHome();
});
```

### Settings — a menu, four categories, two conventions

The settings view is two screens: `#s-home` (the menu: the apps out of the bar
as tappable tiles, then **apps** / **appearance** / **sync** / **data**) and
`#s-cat` (a sticky back header, the pill bar of that category's panels, the
panels). `SET.CATS` says which panel sits where; `SET.panel(name)` opens the
right category with that pill lit, `SET.home()` goes back to the menu. `sync`
and `data` are single panels, so their pill bars are hidden. `#settings` is the
menu, `#settings/<panel>` a panel.

1. **Appearance and behaviour controls** carry `data-pref="<key>"` and are handled
   by one delegated listener. Adding a control is markup, not wiring.
2. **Content editors** live inside a `[data-group="<config path>"]` and are read
   back out of the DOM *wholesale* by that group's `read()`. No per-field state is
   tracked, so an editor cannot drift out of step with what is saved. There is
   no content panel: each app's editors are rendered into the
   `[data-content-for="<app>"]` box at the end of that app's own panel, chosen
   by the first segment of the editor's path.

To add a knob: one line in `Prefs.SCHEMA`, one builder call in the panel, and
whatever CSS reads the attribute or variable.
To add a content editor: one entry in `EDITORS` with `render()` / `read()` /
optionally `add()` / `del()`, and its path in `EDITOR_ORDER` — it lands in the
panel of the app its path starts with.

---

## 4. The token system

`--r-base` is the single shape anchor; every radius is a ratio of it.

```css
--r-base:4px;                        /* a preset sets it; the Corners dial overrides */
--r1:calc(var(--r-base) * .75);      /* controls, rows, inputs */
--r2:var(--r-base);                  /* cards */
--r3:calc(var(--r-base) * 1.75);     /* segmented controls, tiles */
--r-sheet:calc(var(--r-base) * 2.5);
```

The four app stylesheets were **mechanically normalised** in 2.0 so the tokens
actually reach them:

| was | became |
| --- | --- |
| `border-radius:4px` | `border-radius:var(--r2)` |
| `1px solid var(--bd)` | `var(--bw) solid var(--bd)` |
| `padding:18px` | `padding:calc(18px * var(--dens))` |

**When you write new CSS in an app sheet, follow the same rule.** A literal
`4px` radius is a bug: it makes one control immune to the whole theme system.

Other anchors, and the single rule that makes each dial real:

| Token | Dial | Where it bites |
| --- | --- | --- |
| `--bw` | Border weight | every `var(--bw) solid` |
| `--dens` | Spacing | every padding/gap in the app sheets |
| `--ui-scale` | Interface scale | `html{zoom:var(--ui-scale)}` — native, scales boxes, text, borders and fixed positioning together |
| `--icon-stroke` | Icon weight | CSS beats the sprite's `stroke-width` presentation attribute — but gated on `[data-icon-stroke="custom"]`, which Prefs sets only once the dial has moved, so the sprite's deliberate 1.8/2.0/2.2 mix survives at the default |
| `--mo` | Motion + Animation speed | `--dur-1/2/3` all multiply by it. It is `--mo-base` (the preset, an attribute) times `--mo-scale` (the speed dial, an inline property) — split so the two compose, and because a *speed* runs the opposite way to a *duration*: Prefs writes 1/speed |
| `--press` | (not a dial) | the wash under a finger. One token so `[data-scrolling]` can take it to transparent for the length of a scroll — see §6 |
| `--tex-mult` | Texture strength | `body::before`, a `pointer-events:none` fixed overlay |
| `--chrome-alpha` | Chrome opacity | `--chrome-bg` mixes it with `--chrome-rgb` |
| `--readable` | Max content width | the `min-width:560px` cap |
| `--title-scale` | Title size | `.view > .h-top .h-logo` in `shell.css`, times the one `--title-base` |
| `--title-cap` | (not a dial) | Syne's cap height as a fraction of the em, **measured** (35.1px of box at 54px). Only ever sizes boxes around `text-box`-trimmed text — the wordmark's row, the day number. A different display face is one number |
| `--band-drop` | Content offset | folded into `--sat`, so it moves the wordmark band *and* every sticky sub-screen header at once. It exists because five theories about rasterisation did not fix "the top bar is blurred" and the sixth answer was "just move it down a bit" — see tokens.css |
| `--nav-fh` `--nav-r` `--nav-icon` | Bar height / Bar corners / Tab icon size | the bottom pill, in `shell.css`. `--nav-r` is a length rather than `--r-pill` so one dial spans a square bar to the pill it ships as; at the default 29px on a 58px bar it resolves to exactly what 999px did |
| `--band-row` | (not a dial) | the wordmark's row, and the floor under it: the trimmed title or this, whichever is taller, for **every** app. DO's tab strip sets the number |
| `--t-fade` `--t-title-in` `--t-title-out` `--t-flip` | (not a dial) | the shell's own motion — the tab cross-fade, the title morph, PLAN's FLIPs — all multiplied by `--mo` |

Colour: a preset states only `--y` (accent) and `--on-y` (what reads on top of
it). `--yd` / `--yb` / `--y-fade` are `color-mix`ed from `--y`, so a custom accent
stays consistent without three hand-written `rgba()` values.

Since 4.4 that accent can be the **tab's** colour rather than the theme's. The
shell tells Prefs which tab is up (`Prefs.setApp`); Prefs reads `--tab-<app>`
back off `<html>` — the stylesheet owns the palettes, and one of them is a
`color-mix`, so there is nothing to work out twice — and writes it into the same
single `--y`. Every wash follows from that one write. A hex gets its `--on-y`
from its own luminance; anything else borrows the palette's `--tab-on-c`. The
`custom` palette is the same property again, written inline per tab, and it has
no block in `themes.css` on purpose: a tab nobody has picked falls through to
the shipped hue.

---

## 5. Storage keys

Nothing here is namespaced under a single prefix, for history's sake — the four
apps were once four separate sites and the keys are kept so their standalone
versions still work off the same data.

| Key | Owner | Holds |
| --- | --- | --- |
| `do_<YYYY-MM-DD>` | DO | one day's routine ticks (older days are swept on the first load of a new day — folded into `do-stats-v1` first) |
| `do-stats-v1` | DO | the rolling routine tally, `{ days: { iso: { routineKey: [done, total] } } }`, capped at 400 days. **Deliberately hyphenated**: the day sweep matches `do_`, and a summary the sweep can reach lasts one day. Same reasoning as `log-scale-v2` |
| `do_todoist_v1` | DO | DO's Todoist target + a mirrored token, since 2.3 the today-tasks block's filter and its cached list for the day, since 2.5 the block tiles, since 2.8 the media tab's switch and cached list, since 2.19 the quick cards' switch and their cached tasks with subtasks, since 2.24 the media tab's kind filter and sort order (`mediaKind`, `mediaSort` — the find box is deliberately not stored) |
| `travel_state_v2` | DO | every packing checklist (`travel_state_v1` migrated once, on read) |
| `log_<YYYY-MM-DD>` | LOG | one logged day (`e.media` since 2.8: the titles finished on DO's media tab, `{ name, kind, sub }`; `e.blocksPlan` since 4.1: which of `e.blocks` were ticked on the *planned* strip rather than the standing one — a marker over the same names, never a second list, and never exported. See §6) |
| `log-scale-v2` | LOG | the 1–3 → 1–5 rescale flag. **Deliberately not `log_`-prefixed** — `allLogKeys()` would treat it as a day |
| `log-alert-seen-v1` | LOG | `{ plan: <iso> }` — the day PLAN's "nothing planned for tomorrow" prompt was last dismissed by opening PLAN. The only alert state that is stored rather than derived; hyphenated for the same reason as `log-scale-v2` |
| `plan_queue` / `plan_mappings` / `plan_projects` / `plan_token` | PLAN | |
| `plan_sent_v1` | PLAN | what was sent **for today** (name, project, block, time) — LOG offers these as blocks; a new day starts it empty. Since 2.18 a task sent for another day is deliberately absent |
| `plan_history_v1` | PLAN | the standing sent history behind PLAN's "sent" list — every task ever pushed, newest first, capped at 200, each filed under the day it is *due*. **Deliberately not `plan_sent_v1`**, which is emptied every morning |
| `plan_export_v1` | PLAN | the day start time the export last used, and nothing else. The date, template, mode, notes and slots are deliberately *not* kept: each export is its own day, and only the start time is the same one every time |
| `learn_daily_v1` | LEARN | per-day tally of cards rated / acquired / per deck, last 60 days — LOG's note reads it, the cards themselves are in IndexedDB |
| `store_state_v1` | STORE | list, cart, budget, history, Todoist target (`eat_state_v1` read once) |
| `tend.v3` | TEND | plants, the care-event log, season sensitivity and shelf sort (`tend.plants.v2` migrated once, on read) |
| `tend_todoist_v1` | TEND | Todoist target (project, section, label, priority), the push/show switches, and the ids of the tasks pushed today. **Not inside `tend.v3`**: both apps' `normalise()` rebuild that record from its known keys and would drop it |
| `capTracker.v2` | TRACK | ticks by topic id, the dates, which levels are open. `capTracker.weeks.v1` is surfaced and **never migrated** |
| `learn_settings` | LEARN | the shuffle flag. **Decks, cards and media are in IndexedDB `learn_v1`**, not localStorage — see §6 |
| `cal_days_v1` | CAL | the exported days, `{ days: { iso: { start, template, mode, notes, written, events } } }`, plus since 2.24 `localEdit` and `wakeShift` on a day that has been changed here and since 2.24.1 `localOnly` on a day started in DAY that PLAN never sent (all three dropped on re-export, which is correct — a re-exported day is a fresh, sent day). Since 3.0.4 it also holds `marks` — `{ iso: [{ at:'HH:MM', name }] }`, the completions of that day, kept **beside** `days` rather than inside one because a completion is a fact about the afternoon and not a claim about what was sent. Swept on the same keep window. Written by PLAN's export, and since 2.24 edited in place by a row deletion or a logged wake-up time; swept behind by the keep dial and never ahead. **Deliberately not `plan_`-prefixed**: the storage report files it under CAL and PLAN's own clears must not reach it |
| `create_v1` | CREATE | `works` — every song and every mix (area, name, stage, tempo, key, tags, notes and every tick) — the session log, the shelf's own three switches, and since 4.1 `curate` — a *cache* of the last Todoist read (the project's name and colour and its groups), which is the only thing in this record the app did not author and costs one network call to lose. A tick is filed under `<areaKey>\|<stageKey>\|<item text>` — see §6. The record carries its own `v`; `v:1` is the pre-4.0 shape (`songs`, two-segment tick keys) and is lifted on read — see §6. The key itself never changed, and the `_v1` in its name is the key's, not the record's. Underscore-suffixed like `store_state_v1`; nothing sweeps it, so there is no `do_`-style collision to dodge |
| `tools_v1` | TOOLS | what each instrument is doing, and the day's tallies: the pomodoro's phase, round and **the wall-clock moment it ends** (never a countdown that is decremented), the breathing round's phase, round, the moment the current phase began and this session's holds, and which instrument the strip is on. `pom.days` is `{ iso: n }` — finished focus rounds — and `whf.days` is `{ iso: [session] }`, both capped at the last 90 days because they are "today" numbers and a year of them is a store that only grows. Carries `v`; `v:1` is the pre-4.8 shape and its `sw`, `timer` and `decide` branches are **dropped rather than migrated** — there is nowhere for a lap list to go — while `pom.days` is kept, because LOG's note reads it. The lengths are **not** here: they are Config |
| `root_todoist_v1` | shell | **the** Todoist key, mirrored into the three legacy keys on save |
| `root_labels_v1` | shell | the Todoist label colours (`{ fetched, colors:{ name: hex } }`), filled by DO's fetches and `Todoist.labels()`, read by DO and PLAN |
| `root_sync_v1` | SYNC | this install's device id and, per route, when it last pushed and last imported. Nothing else — the data itself is never cached here |
| `root_sync_undo_v1` | SYNC | the raw value of every key the **last** import overwrote, so it can be taken back once. A snapshot, not a history: the next import replaces it, and undoing removes it |
| `root_sync_touch_v1` | SYNC | since 4.13, `{ key: when }` — when this device last wrote each key, kept by a wrapper around `Storage.prototype.setItem` in `js/sync.js`. It is what "everything I changed in the last 24 hours" and "the more recent one wins" are both computed from. Never travels, and is never journalled itself |
| `root_tab` | root's shell | root's last tab — qurOS never reads or writes it |
| `quros_tab` | shell | qurOS's last tab, so a reload lands where you left |
| `quros_prefs_v1` | Prefs | qurOS's appearance and behaviour, seeded once from `root_prefs_v1` on a first boot (§11) |
| `today_v1` | TODAY | `days` (goals with `fate`, chain ticks, hygiene, prep, bad day, wake / sleep stamps, export stamp), `weeks` (the week's goals), the shower timer, the life-dump map and its marks. 400 days kept. Sensitive on sync |
| `gym_v1` | GYM | `sessions` (id, date, day, sets per exercise key, start / end), `live`, the rest timer, the session's rest length. 400 sessions kept |
| `root_theme` | shell | legacy; kept in step with the active theme for the standalone apps |
| **`root_prefs_v1`** | root's Prefs | root's own record. qurOS reads it once, to seed `quros_prefs_v1`, and never writes it |
| **`root_config_v1`** | Config | content **overrides only** — absent on an untouched install |

Export writes **every** key on the origin, unfiltered. A backup that silently
drops a key is worse than one carrying a few bytes too many. It cannot carry
LEARN's decks, which are in IndexedDB; the data panel and the storage report
both say so, and a new device needs the `.apkg` imported again.

---

## 6. Things that will bite you

- **`#track` and `position:fixed`** — see §3. This has caused two bugs already.
- **`<body>` and `position:fixed`, which is the same mechanism used on purpose.**
  In `desktopMode: frame` the body is transformed to centre the frame, which
  makes it the containing block for every fixed element in the page. That is
  what puts the pill, the arrows, the toast, `#ask`, the numpad, search, DAY's
  stepper and the app sheets *inside* the frame rather than against the viewport,
  and it is why they all have to stay direct children of `<body>` — the same
  rule §3 already gives for keeping them out of `#track`, now load-bearing at
  both ends. Two consequences: a fixed element added later needs no frame rule
  of its own, and any `vw` measurement on one is measuring the window rather
  than the frame and must be re-expressed against `--frame-w` (three were).
- **`touch-action`** — the track claims horizontal gestures via `pan-y`, but
  `#track input,textarea,[contenteditable]{touch-action:auto}` gives them back
  inside a field. Without it a sideways drag steals caret placement and the paste
  callout, which made the Todoist key impossible to paste on a phone.
- **Anything inside `#track` that scrolls sideways must say so itself.** A
  gesture is resolved by intersecting `touch-action` up the ancestor chain, so
  the track's `pan-y` reaches every descendant and `overflow-x:auto` alone buys a
  scroller that works with a mouse and is dead under a finger. Every such element
  needs `touch-action:pan-x pan-y` of its own. Four have it: DO's `.tabs`, the
  settings `.set-seg`, and LOG's `.out-pre` / `.rep-pre`.
- **Anything built from Config has no fixed width.** A strip drawn for the two
  entries it shipped with breaks the moment the editor adds a third — and the
  editor is the whole point of 2.0. Wrap it, or scroll it; DO's tab strip was
  neither and lost its tabs off the right edge.
- **The toast fades, it does not slide.** A fixed `translateY` is shorter than the
  resting offset once `env(safe-area-inset-bottom)` is non-zero, which parked a
  sliver of the pill at the bottom of a phone screen permanently.
- **`SET.renderToken()` only refills the field when it holds nothing unsaved.**
  `onShow` re-renders the panel on every visit; without the check, leaving the tab
  and returning wiped a key that had been pasted but not saved.
- **DO's day sweep must skip `do_todoist_v1`.** It is `do_`-prefixed but it is
  settings, not a day. Sweeping it cleared the token on the first load of every
  new day.
- **`store.categories.manual` is load-bearing.** Uncategorised items land there.
  The editor pins it, `read()` restores it if it goes missing, and STORE re-files
  orphaned items to it when an aisle is deleted.
- **`plan.types[].key` is an identity, not a label.** `plan_mappings` is filed
  under it, so the editor preserves it across a rename.
- **LOG's field names are frozen.** `cur_mix`, `cur_prod`, `cur_cont` and the two
  caffeine counters are fixed slots with *editable labels*. Renaming the label
  changes what you see; the record and the `.md` are untouched.
- **The medication slots are `log.meds`'s keys, and the keys are the contract.**
  The record writes `meds_<key>` and the `.md` exports one row per key, in the
  order Config holds them. A key is never renamed and never removed; a label is
  free. **Adding one is additive** — a note written before it simply has no row
  for it, the parser looks rows up by name, and `medsOf()` reads a missing slot
  as false. `m3` was added that way in 2.21. Nothing may go back to naming
  `lam` and `rit` by hand: the form, the export, the parser, the history pills
  and both reports all walk `medKeys()`.
- **`log.medsOn` hides a slot from the form and from nothing else.** Since 2.22
  a slot can be switched off (`m3` ships off), and `medsShown()` is what the
  evening form walks. Every other reader still walks `medKeys()` — exactly the
  rule "turning a LOG field off never deletes data" already states. Do not be
  tempted to filter the export by it: a `.md` whose columns come and go is a
  `.md` the Obsidian side cannot parse.
- **A med's colour is `log.medColors`, written as `--med-c`.** There is one CSS
  rule for `.med-b.on`, not one per key. A slot with no colour falls back to the
  accent, so a fourth slot needs no stylesheet change at all.
- **The `.md` block table has a floor of six columns.** Lowering the block cap
  keeps the table identical (extra cells come out empty, as they always did on a
  light day); only deliberately raising it past six widens the table. The parser
  already reads a variable column count, so it round-trips.
- **Turning a LOG field off never deletes data.** The input keeps its value, save
  still reads it, the export still writes the column.
- **A tab icon is only doing its job if it is not another tab's icon.** 2.21
  gave DAY a sun — a circle with eight radiating strokes — which is exactly
  what the settings gear was. At 19px they were one mark. Settings wears
  sliders now; the sun belongs to the app that is about a day. A harness check
  takes a signature of each `tab-*` symbol's shapes and fails on a duplicate,
  which is what catches this without anyone having to look at the bar.
- **An arrow in this app is drawn, never typed.** `←` and `→` as text are at
  the mercy of whichever font is loaded, sit off the optical centre, and ignore
  the Icon weight dial. DAY's stepper uses `#ico-chev-l` / `#ico-chev-r` — the
  same pair the nav's own arrows use, at the same 17px.
- **Never open a selector inside the `:root` block.** An override of a token
  goes after the block closes, beside `[data-caps="off"]`. 2.21 added the blur
  override inside it, which closed `:root` early and left every token below
  `--chrome-blur` — `--title-base` and `--caps` among them — applying only
  while blur was off; the whole app went lower case with miniscule wordmarks.
  **jsdom does not cascade**, so all 411 checks passed against it. The three
  checks that catch this read the file's shape: every shell token inside the
  `:root` block, an override being a rule of its own, and the braces balancing.
- **`color-mix()` and `zoom` are both used unpolyfilled.** Baseline in every
  browser that matters since 2023/2024. Where `zoom` is unsupported the page
  simply renders at 100%.
- **"Today" can change under you.** DO's `TODAY`/`SK` and LOG's `REAL_TODAY` are
  `let`, re-derived by `rollDay()` when the shell's day check fires. Never copy
  them into another module-level constant, and never build a day key from
  `new Date().toISOString()` — that is UTC, and in France it is yesterday until
  01:00 or 02:00. Use `Shell.today()`.
- **A `confirm()` or `prompt()` in an app module is a bug**, and since 2.22 so is
  one anywhere else: they are the *system's* dialogs, in the platform's
  typeface, ignoring every dial in Settings. `Shell.confirm` / `Shell.prompt` /
  `Shell.ask` are the app's own. Two harness checks enforce it — one greps every
  module, one counts anything that reaches `window.confirm` during the whole
  run and fails if it is not zero.
- **`Shell.confirm` takes what to do, it does not answer.** The dialog is an
  overlay, so the answer arrives on a tap, not on the call. `if (!Shell.confirm(…))
  return;` is the shape that no longer works; it is
  `Shell.confirm(msg, () => { … })`, or `await Shell.confirm(msg)` where the
  caller is already async (DO's defer, LEARN's four). Getting this wrong is
  silent: the guard is falsy, the function returns, and the action simply never
  happens.
- **A numeric field is answered by the app's numpad, not the keyboard.** The
  shell claims any `input` that is `type=number`, `inputmode=numeric` or
  `inputmode=decimal` (see "The numpad" in `shell.js`). `data-pad` overrides the
  inference: `duration` (720 → 7h20m → 7.33), `clock` (930 → 09:30) and `off`.
  A field that takes text is untouched, which is the whole distinction. The
  first digit after the pad opens *replaces* the value; backspace continues it.
- **The field the pad owns is never focused, and that is load-bearing.** 2.22
  focused it and suppressed the keyboard with `inputmode="none"` — a *hint*,
  which iOS honours for drawing the keyboard and not for the rest of what it
  does about a focused field: it still scrolls the field into view and still
  shrinks the visual viewport for a keyboard that never comes. A
  `position:fixed` pad drawn against a viewport that has moved under it has its
  keys somewhere other than where they look, and 2.22 shipped exactly that — you
  tapped a key and got the one above it. The tap that opens the pad is
  `preventDefault`ed instead: no focus, no keyboard, no scroll, nothing moves.
  `inputmode="none"` is still set for a field reached by Tab, and the original
  lives in `data-pad-im` so switching the pad off hands it back.
- **An overlay owns the page until it closes, and the tap that closes it is
  spent.** The pad's backdrop stopped taking pointer events the instant its
  class came off, so the tap that dismissed it also pressed whatever was
  underneath — one tap, two actions, and the second one never asked for. The
  pointerdown that closes the pad is `preventDefault`ed *and*
  `stopPropagation`ed, and the click it would have synthesised is swallowed by
  a document-level capture listener (`padSwallowUntil`, cleared by the next
  pointerdown so it can never eat a later tap). Anything new that draws over
  the page owes the same three things.
- **`padOpen` blurs whatever is focused, and that is not tidiness.** A live
  system keyboard has already shrunk the visual viewport; a `position:fixed`
  pad drawn against a viewport that has moved under it has its keys somewhere
  other than where they look. 2.22 hit this by focusing the pad's own field and
  fixed it by not focusing it — but a field answered *earlier* on the same form
  was still focused, and its keyboard was still up. Nothing may be focused
  while the pad is drawn.
- **A tap outside a focused field blurs it, everywhere.** The platform's own
  selection callout (paste / select / select all / autofill) has no dismissal of
  its own: it stays up, anchored where the field was rather than where the field
  now is, over whatever has scrolled into that space. Blurring is the only thing
  that closes it, and until 2.23 nothing was blurring. One shell listener, so it
  is every app's for free — a per-field fix would be one app remembering and
  seven forgetting.
- **A gesture that travelled is not a press.** 2.22.3 took the press *wash* off
  a row scrolled under a finger; the press itself still fired on the way up. A
  pointer that moves more than `TAP_SLOP` (12px) from where it landed — or a
  touch the browser has already claimed for a scroll, which stops sending
  `pointermove` and is caught on `touchmove` instead — marks the gesture, and
  the click at the end of it is swallowed. The pad's own keys are exempt,
  because they fire on `pointerdown` and have already happened.
- **A pad-owned field says its unit with `data-unit`, and nothing is inferred.**
  The field is never focused while the pad is up, so the pad's own label and the
  number are all that is on screen — and the label the pad covers is often the
  only place the unit was written down. A unit guessed from a label is a unit
  that is wrong on the one field nobody checked, and a number under the wrong
  unit is worse than a bare number. `duration` and `clock` ignore it: 7h20m and
  09:30 are already units.
- **The pad's keys fire on `pointerdown`, not on `click`.** A click on touch is
  synthesised, can be suppressed by anything that prevented a default earlier in
  the sequence, and arrives late. The `click` handler is kept only for a
  keyboard user pressing Enter on a focused key and is de-duplicated against the
  pointerdown by timestamp.
- **STORE's classifier caches its vocabulary in `VOCAB`.** It is built from
  `CATEGORIES`; the Config subscriber sets it to `null` so an aisle edit is
  picked up. Anything else that changes what the categoriser should know must
  do the same.
- **DO's Todoist name map is built per call**, not at boot (`tdRoutineBySlug()`),
  because routines are editable. Do not cache it.
- **A sheet owns the keyboard.** The shell's shortcuts (`←` `→` `1–9` `/`) are
  suppressed while any `.sheet-back.on` or visible `.modal-overlay` exists, and
  Escape closes it by clicking its own backdrop/cancel button. A new overlay
  that does not use `.sheet-back` gets neither for free. TEND's two sheets use
  it, which is why they get both.
- **`data-sub` saves the whole branch it names, and must name the branch the
  module reads.** An override is stored whole-branch, so a field pointed at
  `log.curate.mix` with `sub=label` overrode `log.curate` with a one-slot
  fragment and the other two counters vanished from the evening form. Point it
  at `log.curate` with `sub=mix.label` (dotted subs are walked). Number and
  range inputs store numbers.
- **`tend.tasks` has three fixed keys and `track.curriculum` has fixed ids.**
  The care log is filed under water / feed / repot and the ticks under
  `t01`…`t54`; labels are free, identities are not. There is deliberately no
  curriculum editor — renumbering would orphan every tick.
- **A plant's `group` can name a type that no longer exists.** The editor lets
  you delete a type; TEND falls back to the default type (`tend.newPlant.group`)
  for the season maths and lists the plant under "other" on the shelf. Do not
  "fix" the plant's key on read — the type may come back.
- **LEARN without IndexedDB.** jsdom, some private modes and some managed
  browsers have none. `db()` rejects, `renderHome()` says so on the home screen,
  and nothing throws. Keep it that way: the harness boots without it.
- **TEND's `.tabs` are two fixed chips** and do not overflow. If they ever
  become Config-driven they need the same `touch-action:pan-x pan-y` and
  scroll treatment DO's strip got in 2.0.1.
- **The app list can hide the app you are on.** `Shell.rebuild()` is followed
  by `go()` to the same app if it is still shown, else to the first one, so no
  transform ever points at a hidden slide.
- **A decimal field is `type=text inputmode=decimal`, never `type=number`.**
  The French keypad offers a comma and iOS rejects it in a number field, so
  weight, sleep and km could not be typed on the phone. The shell turns the
  comma into a dot as you type (one capturing `input` listener), and LOG's
  save normalises again. A new decimal field gets both for free only if it is
  `type=text` with `inputmode="decimal"`.
- **Theme preview is mouse-only.** `pointerover` fires under a scrolling
  finger and `:hover` sticks after it lifts, so the touch preview applied a
  theme that was never chosen and never reverted. `pointerType` gates it.
- **DO's today block caches the day's tasks.** Todoist never returns a
  completed task, so a task closed here is kept in `do_todoist_v1` with
  `done:true` until midnight — that is the only way "untick → reopen" can
  exist. On every refresh the API's word wins: anything it returns is open,
  whatever we last did to it here.
- **LOG block chips match on `data-name`, not text.** A planned chip carries a
  caption, and the attribute has to be attribute-escaped (`attrEsc`): LOG's
  `esc()` leaves quotes alone, which is fine as text and fatal inside
  `data-name="…"`.
- **The `#### study` section of the note is conditional.** It appears only on
  a day with a ticked topic or a rated card. The parser looks rows up by key,
  so an extra section is additive and older notes are unaffected.
- **Every Todoist sync is single-flight and silently skipped while one runs.**
  DO and TEND both start a quiet sync from `onShow` when theirs is older than
  ten minutes, so a `syncTodoist()` called right after `Shell.go('tend')` may
  return at once as "busy". The harness waits it out; a user tapping "sync
  now" during an auto-sync gets the auto-sync's result a moment later.
- **A block-labelled task is the blocks section's, not the today list's.** The
  two are separate questions asked of Todoist and a task due today carrying
  `@b1` answered both, so it was drawn twice, counted twice in the badge, and
  tickable in one place while the other still showed it open. `todayRows()`
  drops it while `blocksOn` is set — at *draw* time, not at fetch time, so
  switching the section off hands it straight back with no refetch.
- **DO's done-blocks window past today comes from LOG, and is names only.**
  `td.blocks` is one day deep by design and starts empty every morning; the
  names survive because DO's tick calls `LOG.setBlock`. `LOG.blocksBefore(n)` is
  the read side. Those rows carry no id, no colour and no Todoist state — they
  are drawn as a list under a date, never as tiles, because a tile offers a tick
  that cannot exist.
- **DO's today block is two sources, deduplicated by task id.** TEND's rows
  come from `TEND.todayList()` directly (so they show even with push off) and
  carry `tend:` ids that route the tick back to `TEND.setDone()`; a fetched
  Todoist task whose id is in `TEND.pushedIds()` is dropped, or a pushed plant
  would appear twice. The block is visible when DO's fetch is on *or* a plant
  is due.
- **`Shell.badge(app, n)` is the only writer of `.tb-badge`.** DO calls it from
  `renderToday()` with the open count; TEND reaches it through `DO.renderToday()`
  (`notifyDo`). A new counting app should do the same, not touch the nav.
- **A new label says `text-transform:var(--caps)`, never `uppercase`.** The
  literal is invisible to the caps switch; 2.5 rewrote 113 of them.
- **A press wash says `var(--press)`, never `var(--s2)`.** On a touch screen
  `:active` is applied the moment the finger lands and is not cleared until it
  lifts, so a touch that turns into a scroll lights up whatever row it started
  on and keeps it lit as the list moves under it. The shell sets
  `data-scrolling` on `<html>` while any slide is moving (and for 160ms after,
  plus on any `touchmove`), and `[data-scrolling="on"]{--press:transparent}`
  takes the wash out. One token, so it reaches every `:active` in every app and
  any future one for free; 2.22.3 rewrote 22 of them. A tap that is a tap still
  lights up, because a tap does not scroll.
  The press rules that mix a *project's* colour (PLAN's tiles, DO's block
  tiles) are not on this token — their resting value differs per rule — so they
  can still light up under a drag. They are not in long scrollers, which is why
  it has not been worth the duplication.
- **"Written" means someone wrote it, and there is a stamp for it.**
  `morningLogged` / `eveningLogged` used to ask "does this half hold any value
  at all", which was right while every value came from the form and stopped
  being right when `setBlock` arrived: a block ticked on DO writes itself into
  the real today's `e.blocks` without the evening form being opened, so one tick
  turned the card green, cleared LOG's "!" and extended the streak. `m.saved` /
  `e.saved` are written by `saveMorning` / `saveEvening` and are authoritative
  when present; a record from before them falls back to the old field scan, with
  `blocks` taken out of the evening's. Anything else that can write a day
  without a person filling a form in must keep off both.
- **Discard has to undo, not merely decline to save.** The forms do not hold
  their answers in the DOM: the scales, the meds, the meals, the counters, the
  cold-shower toggle and the blocks all write straight into `data` as they are
  tapped, and `save()` only copies the text fields across and flushes the
  object. So "go back without saving" left every one of those edits in the live
  record, and the next write from *anywhere* committed them — an entry, a block
  ticked on DO (`setBlock` persists the same object), the other half of the day.
  `discard()` re-reads the day from storage, which also keeps whatever was
  legitimately written while the form was open.
- **`LOG.setBlock()` writes today's record even when another day is selected.**
  It edits the live record only if the selected day is the real today, and the
  stored one otherwise, so a tick on DO never changes which day LOG is showing.
- **TEND boots after DO.** DO draws its block before `window.TEND` exists, so
  TEND's boot schedules `notifyDo()` on the next tick and DO's `onShow` redraws
  it — otherwise the plants only appeared after the first interaction.
- **Re-appending a `.view` resets its scroll.** `Shell.rebuild()` moves the
  slides to re-order them, and it runs from the app list on the layout panel,
  which is well down the page: every switch used to land you at the top. It
  saves and restores each slide's `scrollTop`; settings' own re-render is
  wrapped in `keepScroll()` for the same reason. jsdom cannot prove either
  (its `scrollTop` is always 0), so this one is browser-only.
- **`do.tabs` may predate the media tab.** An override written by the routines
  editor before 2.8 has no `media` entry; DO's `readConfig()` splices one in
  at index 1 in memory rather than rewriting the override. Its id is fixed —
  `renderHome()` draws the grid on it instead of routine cards.
- **The media list is a backlog, not a day's list.** `td.media` keeps every
  open task whatever its date; a new day only drops the ones closed the day
  before (their untick window is over) rather than emptying the cache. Since
  2.24 it is drawn as rows rather than tiles, with a kind filter and a sort
  that persist and a find box that does not — a narrowing you chose is worth
  keeping, a half-typed query two hours old only looks like a broken list.
- **A sub-screen is `.scr` + `.hd-back`, and the shell relies on it.** The
  left arrow becomes "back" by finding `.scr.on:not(#s-home) .hd-back` in the
  current slide. A new sub-screen that names its home something other than
  `s-home`, or hides its back button, gets a dead left arrow.
- **A box trimmed with `text-box` must not be clipped on both axes.** 3.0.3
  trimmed the wordmark, the day number and STORE's counter to their cap height
  *for layout* — but their children still lay out in full line boxes, and both
  the day number and the counter carry `overflow:hidden`, which clips both axes.
  Measured in Chrome: 9.4px off the top of the day number and 10px off the
  bottom of the counter. The clip either one actually wanted is horizontal (a
  digit slides sideways; a long total must not run into the wordmark), so both
  are `overflow:visible` with `clip-path:inset(-100% 0)` — unbounded top and
  bottom, cut at the box edges left and right. Anything that trims a box it also
  clips owes the same.
- **A completion mark is grouped by the minute, and inset past two columns.**
  Marks drawn one per completion land on the same pixel when two things are
  ticked in the same minute and print over each other — which the first version
  did. They are grouped by `at` and their names joined. They are also inset from
  the left past the time column (≈53px) and the now line's own badge
  (≈36px), and from the right past the row's delete and tick, all measured:
  today is the only day either a mark or the now line appears on, so without it
  they overlap every time.
- **A band centres its ink, not its line boxes.** A wordmark is all caps, and
  caps in a `line-height:1` box leave the descender space empty underneath —
  8.5px of a 54px box, measured in Chrome. The band had no slack to redistribute
  either (14 top + 82 content + 12 bottom was exactly its 108px floor), so
  `justify-content` had nothing to do and every one of those 8.5px read as a gap
  under the title. Since 3.0.3 the titles carry
  `text-box:trim-both cap alphabetic` so their boxes *are* the caps, the band is
  `justify-content:center`, and its floor is measured in the trimmed title. The
  day number cannot be trimmed with it — its digits are absolutely positioned so
  one can slide out while the next slides in, and an absolute child has no line
  box — so it is given `--title-cap * 1em` by hand and its digits are pulled up
  by the half-leading it no longer has. Anything new that sits on the wordmark's
  row owes the same, or it centres 8.5px below the letters beside it.
- **Every home header is `.h-top`, and Shell lifts it out of the scroller.**
  At boot each view becomes band + `.view-body`; `#s-home > .h-top` is the
  band. A new app's header must be a `.h-top` directly under `#s-home` — its
  box (padding, height, the label row, the wordmark's size and the status-bar
  inset) belongs to `shell.css` and is shared by all nine, because the title
  morph only reads as one title becoming another if they are the same shape.
  Set type and colour in the app sheet; never the box, and never a
  `--title-base` of its own. A harness check enforces it.
- **Anything in the band that shares the wordmark's row needs a fixed
  height** — and since 3.0.3 the row itself has one, `--band-row`, which is what
  actually enforces it. DO's chips are 32px by declaration rather than by
  padding, but the *rail* around them is 40px once its border and its
  density-scaled padding are counted, and the moment the wordmark was trimmed
  from 54px to its 35px of caps that rail became the tallest thing in the row and
  made DO's band 2px taller than the other nine. The row is now
  `max(--band-row, trimmed title)` for every app and DO's rail is pinned to
  `--band-row`, so density cannot push one band out of step with the rest.
- **The gap under the band is the shell's, and an app must not add to it.**
  `.view-body #s-home` sets it and zeroes the first child's top margin. A
  section that can be hidden breaks `:first-child` — DO's
  `markFirstSection()` marks the first one on screen instead, and its rule
  needs the specificity to beat `.tt.hidden + .tt`.
  **It zeroes the margin and not the padding, which is the hole STORE fell
  through**: every other app's `.cnt` is horizontal padding only, STORE's padded
  all four sides, and on its home screen that box is the first thing under the
  band — 18px from the shell plus 18px of its own, which is the gap between the
  wordmark and the counter widget that anyone would notice first. Padding cannot
  be zeroed blanketly (LEARN's drop zone is 22px of padding that is the control's
  own shape, not a gap), so it is `§`-rule and a check rather than a stylesheet
  sweep: `.ns-store #s-home > .cnt{padding-top:0}`.
- **`position:fixed` inside `#track` is still forbidden**, for a new reason:
  the track no longer carries a transform, but the title morph animates one
  on `.h-logo` / `.hd-title` and PLAN's FLIP animates them on its tiles, and
  any of those becomes the containing block for a fixed descendant while it
  runs.
- **PLAN's expanded project is not state.** `openKey` and `openSub` live in
  the module and are deliberately not persisted or put in Config.
- **Opening a project moves exactly two elements, and hides everything else.**
  Four releases were spent making this smoother by animating *more* of it —
  faster border fades, staggered rows, ghosts of the tiles that left — and every
  one was the same mistake in a different place. A screen where eight things
  move at once has no subject, and a gesture with no subject reads as a stutter
  however well each part is timed. The grid clears to the project's **name and
  its colour dot**, those travel and grow, and the new content appears after
  them. Three groups in `flip()`, and every element is in exactly one:
  the **movers** (`[data-flip-text]`, present in both snapshots), the
  **carrier** (the box they live in), and everything else. What leaves is simply
  gone on the first frame — which is right *because* everything that stays is
  invisible on that frame too, so the screen clears in one go rather than
  half-cutting and half-fading.
- **A mover carries its full delta; `data-flip-text` no longer subtracts.** The
  attribute used to name the box so the box's own slide could be taken off the
  text's. The box does not slide any more, so the text carries the whole
  distance; the attribute still names the carrier, which is what it is read for
  now.
- **A carrier is held *unpainted*, never faded.** `opacity` on a parent takes
  its children with it, and its children are the two things that must stay
  visible. Its border and background are animated from `transparent` with
  `fill:'backwards'` and a delay instead, so the box arrives with the rest of
  the screen. Its other children (`.proj-meta`) are held back like anything
  else — anything that *wraps* a mover is not.
- **No move when nothing travels.** Opening a section's form leaves the heading
  where it is; holding the screen blank for 400ms while nothing moves is a
  pause, not a transition. `travels` decides, and `moveMs` is 0 when it is false.
- **A `data-flip` key is an identity, and sharing one across two different
  elements is a bug.** The section rows once borrowed the keys of the tiles
  they replaced, to make the tiles look like they became the rows; what it
  actually did was fly each row in from that tile's position while squashing
  it to a tile's width, and the further the tile the worse it looked. Every
  element owns its key now (`p:` tiles, `sec:` rows, `form:` the panel,
  `queue`), so only genuinely persisting elements move and everything else is
  revealed. A harness check fails if a row carries a `p:` key again.
- **A box is never scaled.** Scaling a box scales its border, its radius and its
  padding with it and stretches everything inside; counter-scaling the children
  cannot fix that while the box itself is scaled. Since 2.22.2 the box is not
  animated at all — it is drawn at its new size and simply not painted until the
  move is over. (2.20.1–2.22.1 slid it and crossfaded its border under the move.
  That was better than scaling it and still one thing too many on screen.)
- **Text carries its own flip key and is never faded.** `.proj-name` and
  `.proj-dot` are `data-flip` elements in their own right and are the only
  things that move. The name you tapped stays on screen the whole way, which is
  what stops the two states reading as two different screens.
- **PLAN's form has no screen of its own.** It is drawn into the tile grid by
  `formPanel()` with the ids it has always had, so every handler is
  unchanged — but each row is optional (`plan.formFields`), so nothing may
  assume its element exists: `resetOpts`, `setSub`, `addSubtask`,
  `renderSubtasks` and `addToQueue` all guard. `paintForm()` restores the
  controls from `formState` on every draw, which is what makes it safe to
  re-render the grid while the form is open.
- **`optPick()` toggles.** Tapping the chip that is already on clears the
  field. The block row has no "none" chip because of it; the time row keeps
  one and works either way.
- **PLAN's history binding is `sentLog`, not `history`.** A module-level
  `history` inside the IIFE shadows `window.history` for the whole file,
  which is the sort of thing that breaks a `replaceState` added months later.
- **The `rest` template has four block slots, not six.** `b3a` and `b3b` do
  not exist on a rest day — those hours are `free time` — so the panel refuses
  a b3 assignment while `rest` is picked, and switching to `rest` drops any b3
  already given out, both with a toast. Anything that reads the slots takes
  them off the template (`slotsOf`), never from a list of six written down in
  code. The two templates otherwise differ only by the hour of gym, which is
  why every offset after it is exactly an hour earlier on a rest day.
- **A task holds a list of slots, not a slot.** Since 2.20.1 `expSlots` maps a
  task to an *array*: a job that runs over b1a and b1b is one task given two
  hours, and the description writes one line per slot — the same name twice.
  Tapping a slot the task already holds gives back that hour alone. A slot is
  still exclusive: another task is refused it, by name. Anything reading the
  assignment takes `r.slots`, never `r.slot`.
- **A slot is assigned, never derived.** Until 2.16 the `a`/`b` half of a
  block was inferred from the order the two tasks were sent in, and the task's
  own `@b1` label decided which block. Neither is true now: the six slots are
  named and tapped, and the label a task was sent with has no say in where it
  lands. `toggleSent()` therefore no longer caps two per block — the cap is
  the number of slots a day has, and the panel refuses a slot another task
  already holds rather than taking it away in silence.
- **The sent selection is keyed by `ts`, not by row index.** The list is
  unshifted on every send, so an index-keyed selection would quietly slide
  onto a different task. `renderSent()` also drops any key whose row has gone
  (a clear, or the 200 cap), or "export" would count what is not on screen —
  and `expRows()` drops that key's slot with it.
- **The export panel repaints itself from `expForm` on every draw**, the way
  the task form does — a Config edit or an arriving label fetch re-renders the
  whole grid under it. The three text fields are the exception in the other
  direction: they must *not* trigger a full redraw, or the caret leaves the
  field mid-word, so `expField()` repaints only the preview and the button.
- **A hidden box must be emptied.** `renderBlocks()` used to return early
  when the section was hidden, leaving the old tiles in it; anything counting
  `.bk` (the harness, but also a future badge) saw ghosts. Hide *and* clear.
- **`html` carries the ground colour too.** The fixed body does not paint the
  strip under the home indicator; the root does, and with `color-scheme:dark`
  and no background it paints black.
- **A queued task carries its own due date, and the queue can outlive the
  day it was built on.** `startSending()` sends `due_date`, the day picked on
  the form — never `due_string:'today'` resolved at send time. A task queued
  before 2.18 has no `date` and falls back to `Shell.today()`.
- **"Sent today" is now "due today".** `recordSent()` keeps a task out of
  `plan_sent_v1` unless its day *is* today, and `plannedToday()` filters the
  queue the same way, or planning tomorrow's morning would fill tonight's
  evening form. The history takes every task either way, filed under its due
  day — which is the day the row names.
- **A `formFields` key that is missing is "not asked", not "off".** An
  override is stored whole-branch, so one written before a row existed has no
  answer for it. `formFields()` in `plan.js` reads it through
  `Config.defaults()`, the editor renders the same merge, and the settings
  toggle flips what it is *showing* — without that last part the first tap on
  a never-seen switch sets it to what it already said. Safe for this branch
  because it is a fixed set of booleans: there is no deletion to express. Any
  other branch keeps the whole-branch rule.
- **The date stepper repaints itself, and only itself.** `stepDate()` /
  `resetDate()` call `paintDate()` rather than `renderProjects()` — a full
  redraw would run a FLIP on the whole grid for a one-word change. `paintForm()`
  calls it too, so a Config edit landing under the open form keeps the day.
- **DO's day sweep is where the history comes from, so it folds before it
  deletes.** `loadState()` calls `foldDay()` on every `do_` key it is about to
  remove. The fold uses the routine's length *as it is now* — the ticks are all
  that survive a sweep — so a routine that has since grown makes an old day look
  worse than it was, and a routine that has been deleted drops out of the tally
  entirely. `statsFor()` prefers the live record for today and falls back to a
  folded row, which is what makes a restored backup show up on the strip.
- **A DO key that is not a day must not be `do_`-prefixed.** `do-stats-v1` is
  hyphenated for exactly that reason; `do_todoist_v1` is the exception, and it
  is the exception because it is named in the sweep's filter by hand. Anything
  new goes the hyphenated way.
- **A quick task's subtasks are fetched by project, not by parent.** Subtasks do
  not carry `@quick` themselves, so `fetchQuick()` asks each distinct project a
  quick task sits in for all its tasks and files the children by `parent_id`.
  One call in practice. A quick task with no `project_id` at all gets no
  children — nothing in the v1 API returns them without one.
- **A subtask closed here is not returned by the API again, and is carried over
  by hand.** Without that, a card would shrink as it was ticked and `3 / 5`
  would never be reachable. Same rule as the media tiles, one level deeper.
- **Ticking the last subtask closes the parent.** Todoist does not, so a quick
  task would otherwise have to be finished twice; unticking one reopens it.
  Two requests, and the second only when the parent's state actually changed.
- **The quick cards are one column.** A card with subtasks is a checklist and a
  checklist at half width wraps every row, so the two shapes share a single
  column rather than the routine grid's two.
- **The quick cards do not feed the tab badge.** It counts what is due today —
  the today list and the block tiles. Quick is a backlog with no date, like the
  media tab, and a badge that counted it would never reach zero.
- **`Shell.alert()` is the only writer of a tab's icon**, the way `Shell.badge()`
  is the only writer of `.tb-badge`. It swaps the `<use href>` to `#tab-alert`
  and back to `#tab-<app>`; nothing else may write that attribute for an app
  button, and `paintNav()` deliberately only ever touches the settings button's.
  An app opened transiently from settings wears its icon on the settings button,
  where the alert does not follow it.
- **The alert is LOG's, but the "!" is not always LOG's.** Since 2.21 an
  unwritten morning or evening flags **LOG** and an unplanned tomorrow flags
  **PLAN** — a "!" on LOG that means "go and use the other app" pointed at the
  wrong door. LOG still owns all three rules, the hours, the preview and the
  only calls to `Shell.alert`; `alertReasons()` returns every rule that is
  firing (they are independent now) and `alertReason()` is the first of them,
  which is what the settings line reports.
- **LOG's alert is derived on a tick, never stored — with one exception.**
  `alertReason()` is recomputed from the real today's record, the clock and
  PLAN, so there is no state to go stale. `alertTest`, the settings preview, is
  the one thing that can make it lie, and it stays pinned until it is switched
  off and says so in the panel.
  The exception is **`plan`, which can be dismissed**. LOG's two rules clear
  themselves — writing the morning is what makes "morning not written" false —
  but "nothing planned for tomorrow" is a *prompt*, and the honest answer is
  often "I looked, and there is nothing to plan". So PLAN's `onShow` calls
  `LOG.dismissAlert('plan')` and the flag goes out for that day. It is the only
  stored alert state, it is keyed by the day it was dismissed on (so tomorrow's
  prompt is a new prompt), and it lives in **`log-alert-seen-v1`** —
  hyphenated, for the same reason `log-scale-v2` is: `allLogKeys()` matches
  `log_`. `alertReasons()` still answers whether a rule is *true*;
  `alertShown()` is what the tabs wear, and only that one is filtered.
- **"Planned for tomorrow" means PLAN's own queue and history.** `plannedOn()`
  counts tasks carrying a block and filed under that day. A block moved to
  tomorrow from DO's "→ tomorrow" is a Todoist edit ROOT keeps no local record
  of, so it does not count — which is worth knowing before wondering why the
  flag is still up.
- **A preset carries tasks, never a day.** `plan.presets` is a shape of day:
  `applyPreset()` dates every task from the form's own floor and re-resolves the
  project id from the current mapping, so a preset saved in September still
  lands correctly in March.
- **A control search can find is a control search can render.** `SET.searchIndex()`
  renders `lookHTML()` / `layoutHTML()` / `behaveHTML()` into a detached node, so
  those three must stay pure string builders — the moment one of them writes to
  the document again, indexing it moves the page. `sectionOf()` is iterative and
  depth-capped: the recursive version walked in a circle on `.set-panel` and blew
  the stack.
- **A hidden app opened from settings is a transient slide.** `Shell.open()`
  splices it into `TABS` before settings and re-parks the track before
  animating, because settings' index moves by one; `retire()` does the same
  in reverse 340 ms after you leave it. `paintNav()` reads `TABS` by name for
  the same reason — a cached button list would be one off.
- **A new app does not reach an install that already has an app list.**
  `Prefs.apps` is stored whole and replaces the default whole — the same rule
  Config uses for a branch — so adding `'cal'` to `Prefs.APPS` gave it a tab on
  a fresh install and *nothing at all* on any install that had ever opened the
  layout panel, which is every install that has been used. `appsSeen` is what
  tells the two cases apart: an app in `APPS` this install has never been
  offered is new and goes in, in its shipped position; an app missing from
  `apps` but present in `appsSeen` was switched off on purpose and stays off.
  The result is persisted at once, or switching the new app straight back off
  would be undone on the next boot. `APPS_BEFORE_SEEN` is the one-time fallback
  for installs written before any of this existed — a historical fact, not a
  list to keep up to date. Two harness checks boot a second jsdom window with
  prefs already in localStorage, which is the only way to run `load()` twice.
- **A stored calendar day is a record, not a live query.** Each event in
  `cal_days_v1` carries its own resolved clock time, calendar name and colour,
  so CAL never reads `plan.types`. Renaming or recolouring a project in March
  must not repaint a day planned in September — the day says what was planned,
  and there is a check for exactly that.
- **CAL stores the whole template, not what the export wrote.** `mode: blocks`
  sends the assigned slots alone, but the day still has the shape the template
  gives it. The rows the export left out are stored as `fixed` (a template
  event) or `idle` (a slot nobody claimed) and each can be switched off. A view
  built from the exported lines only would show a day with holes in it.
- **DAY's stepper is the newest thing `position:fixed` inside `#track` would
  have broken.** It is a sibling of `#views` with `.ns-cal` on it — so cal.js's
  one delegated listener still reaches it — and CSS shows it only while
  `#view-cal` carries `.cur`. Its arrows are therefore *not* inside the slide,
  and `paintSteps()` finds it with `getElementById`, not the scoped `$id`.
- **TRACK's pace counts from `trackFrom`, not from the first tick.** Ticks
  dated before it are the progress you already had when you set the app up:
  counted as done, kept out of the pace and drawn as the trend's starting
  height rather than a cliff in week one. Null falls back to `startDate`, so an
  install that never touches it behaves exactly as before, and `baselineNow()`
  moves the date to *tomorrow* rather than rewriting any tick's date — which is
  what makes it safe to press twice.
- **A day filled from DO is no longer what was sent, and says so.** Everything
  else on DAY is a drawing of what PLAN resolved and handed to Todoist;
  `applySched()` breaks that for one day, so the record gains `localEdit` and
  the head reads "edited here" from then on. Anything else that ever edits a
  stored day owes the same mark — a drawing that quietly claims to be the plan
  is the one thing this app must not be.
- **Filling a day's slots reads the slots off the record, never off a
  template.** `slotsOf(rec)` walks the stored events. CAL does not resolve
  `plan.dayTemplates` and is not going to: a day drawn from a template that was
  never sent anywhere would be a day this app is not allowed to claim, which is
  why the action is not offered on a day that does not exist.
- **A tick on DAY is a mark on the drawing and nothing else.** CAL has no
  network by contract (§8), so it cannot close anything in Todoist — and it
  could not anyway, since a stored event carries a resolved name and no task id.
  An `idle` row is not tickable: it is the absence of an event.
- **CAL is written on success, never on the attempt.** `doExport()` builds the
  day *before* it clears the panel's state, but hands it over only after the
  Todoist task lands. A day drawn for an export that failed is a day that is
  not actually scheduled, and telling those two apart at a glance is the whole
  point of the view.

- **A custom property that references another one bakes it where it is
  *declared*, not where it is used.** This is the single most expensive thing in
  this file's history: it cost five versions and three "fixes" that changed
  nothing. `--title-sh` was `var(--title-sh-x) 0 0 var(--title-sh-c)` on
  `:root`, so `var(--title-sh-c)` was substituted **on `:root`** — the accent —
  and what inherited down the tree was a finished string with no property left
  in it to override. Every `--title-sh-c` override in the app was a no-op: the
  wordmark's dot, STORE's currency mark, and the green/red flash on the running
  total. **Lengths behave the opposite way** — they stay as tokens and resolve
  against whoever uses them — which is why the offset was correctly 3px on the
  54px wordmark and 1px on the 0.4em currency mark while the colour was the
  accent on both. That split is exactly what made it look like it worked.
  There is no composed `--title-sh` any more: the shadow is written out at the
  point of use, `text-shadow:var(--title-sh-x) 0 0 var(--title-sh-c)`, which is
  the only form where the element's own colour is the one that counts. A check
  fails if any stylesheet reaches for the old token again.
- **jsdom does not cascade, so a stylesheet regex is the whole test — and it
  will happily assert the half that does nothing.** Three checks passed against
  the broken shadow because they read the declaration that was present rather
  than the behaviour it was supposed to produce. What broke the loop was
  launching headless Chrome over the devtools protocol and reading
  `getComputedStyle` off the real page. **When a visual fix is reported as "still
  not fixed", stop reading the stylesheet and go and measure it** —
  `--remote-debugging-port` plus node's global `WebSocket` is about sixty lines
  and needs nothing installed.
- **The pinned total does not fit beside `STORE.` and is clipped, badly.**
  Measured in Chrome at 412×915: the row is 376px, the wordmark takes 326 of it
  at the default title size, and the counter is left 36px for content that needs
  267 — 231px of the number is cut off. It is clipped at *every* one of the five
  title sizes (at `xs` it still needs 193 and gets 126). The 2.25.1 note claiming
  it "still fits beside `STORE.` at the largest title size" was never true;
  `font-size:min(var(--title-px), 14vw)` never binds, because 14vw at any phone
  width is larger than 54px. Nothing can fix this without something getting
  materially smaller — the wordmark while the counter is pinned, or the counter
  itself — and that is a look, not a bug fix, so it is Hugo's call and it is
  **still open**. Anything added to the head of the counter (3.0.2's sign) makes
  the clipping worse while this stands.
- **An element rebuilt on every paint cannot transition.** A replaced node has
  no previous computed value, so it arrives at its final one — instantly, while
  everything around it eases. STORE's total was one `innerHTML =` per repaint,
  which threw the currency mark away and built a new one: the digits eased into
  green over `--dur-3` and the mark *snapped* to it, one signal arriving twice
  at two speeds. The number is cells now and the mark is moved across a rebuild
  rather than recreated. The digits carry no colour of their own on purpose —
  an inherited value follows the parent's transition frame by frame, so they
  are linked to `.h-cost` for free and cannot drift from it.
- **CREATE files a tick under `areaKey|stageKey|item text`.** Reordering a
  checklist in the editor keeps every tick; rewording a line drops that one
  line's. The alternative was a key column in the editor, which is worse to
  live with than the thing it protects. Stage *keys* are identities and are
  shown but never edited — a work's stage is filed under one. The area segment
  is what lets a stage key be unique inside its area rather than across the
  app: both areas ship an `idea`-shaped first stage, and neither has to know
  about the other to add one.
- **CREATE's finished stage is found by `terminal`, never by its key or its
  position** — and there is one per area. Work on it is filed under the
  "finished" fold rather than in progress, and is asked for no checklist. The
  editor preserves the flag across a rename and hands it to the last stage of
  that area if the one carrying it is deleted — without that, deleting one row
  would leave a shelf with no way to finish anything.
- **A stage a work sits on can be deleted out from under it, and so can its
  whole area.** CREATE falls back to the first stage, and to the first area,
  for *drawing*, and leaves the work's own `stage` and `area` strings alone —
  the way TEND leaves a plant's group key alone: either may come back, and
  rewriting it on read would be the one edit that cannot be undone. The editor
  refuses to delete the last area for the same reason it hands `terminal` on: a
  shelf with nowhere to put anything is not a state the app can draw.
- **CREATE's v1 → v2 lift runs in the reader, not behind a repair flag.**
  `normalise()` reads a pre-4.0 record — `songs` instead of `works`, tick keys
  of two segments instead of three — and lifts it every time, because reading
  is idempotent and a migration that runs on read cannot be skipped by an
  install that never opens Settings. It must read the shape off the **raw**
  parse and never off the object merged onto `blank()`: `blank()` supplies an
  empty `works`, so asking the merge whether it has one always says yes, and a
  v1 shelf is then read as an empty v2 one — which is to say, silently thrown
  away. That was a real bug for the length of one harness run. `load()` writes
  the lifted record straight back so the old shape does not sit on disk for as
  long as the shelf goes untouched.
- **A production song's stage `mix` is labelled "mixdown".** The key is `mix`
  and never changes — every tick ever filed is under it — but the word moved in
  4.0, because there is now an *area* called mixing and that one is DJ mixing.
  A stage and an area reading as the same thing is the confusion 4.0 exists to
  remove, so do not "tidy" the label back.

---

- **Two `function` declarations of one name in a module: the later one wins,
  silently.** 4.1 added a `hourOf` to `log.js` beside one that had been there
  since the alert rules, and the two answered the same-looking question in
  different units — an hour of the day against minutes since midnight. Nothing
  complained, no check failed, and the sleep chart drew an average wake-up time
  of 441. `test/peek.mjs` printed the number and it was obvious in a second,
  which is exactly the half of "did that come out right" the tool exists for.
  There is a harness check over every module now.
- **`.ns-create .cr-areas` is a copy of `.ns-do .tabs`.** The tab strip — the
  rail, the flat chips, the sliding glider — is written twice, once in `do.css`
  for the title band and once in `create.css` for the content. They are the same
  control and they have to keep looking like it, so a change to one is a change
  to both **unless it is one of the two places they deliberately differ**, and
  both are about the room each one has:
  DO's lives in the wordmark's row, so its height is `--band-row` and its chips
  are a fixed 32px (§4); CREATE's takes its height from its own padding.
  DO's chips are `flex:0 0 auto` — sized to their own text, because the strip
  shares its row with a wordmark and has no width of its own to share out;
  CREATE's are `flex:1 1 0` with `min-width:max-content`, so they split the rail
  evenly when there is room and it scrolls when there is not.
- **A strip rebuilt on every tap has a glider that cannot slide.** The glider
  is an element that travels by CSS transition, so it has to be *the same
  element* before and after — and 4.1 rewrote `.cr-areas`'s innerHTML on every
  selection, which handed it a brand-new node already at its destination. The
  one element whose entire job is to move did not move, and nothing failed.
  Both strips (the shelf's and the session log's) keep a `data-sig` of their
  chips now and only rewrite the markup when *that* changes; a selection moves
  the `.active` class and asks the glider to travel. DO's `setTab` has always
  worked this way. Anything else animated across a re-render owes the same
  care: check whether the node survived.
- **A block styled by class and marked up by id alone is styled by nothing.**
  `#cr-hero` and `#cr-sorts` had rules written for `.cr-hero` and `.cr-sorts`
  and neither class was ever in the markup, so the shelf's number was never
  centred and the sort chips were never a row with a gap in it — for two whole
  versions. That is what "the spacing is off" turned out to be. A harness check
  now asserts every generated block on that screen carries the class its rules
  are written for.
- **CREATE's shelf is offline; its curate tab reads, and closes.** Since 4.1 the
  module reaches the network through the shared `Todoist` client and nothing
  else. Through 4.1 it only ever *read*, on the grounds that a third app with an
  opinion about the same list is how two of them end up disagreeing. 4.2 narrowed
  that rather than dropping it: a curate row can be **closed and reopened**, and
  that is the whole of what CREATE writes. It still never moves, reschedules,
  renames or creates a task — filing one is PLAN's job. Two harness checks hold
  the line: no `fetch(` and no `api.todoist.com` in the module, and **exactly
  one** `Todoist.call(`, whose path is `/close` or `/reopen` and whose method is
  the only one in the file. A new call is a decision, not an edit.
- **`e.blocks` says what was done; it cannot say where it was ticked.** It is a
  flat list of names and the Obsidian side parses that shape, so it stays one.
  A planned task called "mixing" and the standing block called "mixing" are the
  same name, which is why ticking either used to light both. `e.blocksPlan` is
  the marker that separates them — the subset of `e.blocks` that was ticked on
  the planned strip — and it is UI state: never exported, absent on every day
  written before 4.1 (which reads as all-own, which is what it was), and reset
  to empty by the note parser. A name is still only in the record once, so
  ticking it on the other strip *moves* the light rather than counting it twice:
  "mixing" done once is one block however many places offered it.
- **An area's `fields` is "not asked", never "deleted".** `create.areas[].fields`
  says which of the three meta chips an area's work carries — a song has a
  musical key, a DJ set has one every four minutes — and switching one off
  removes the chip *and* its handler, so there is no hidden button with a live
  editor behind it. What is already written stays in the record and comes back
  the moment the field is switched on again. Exactly the rule `log.fields` has
  followed since 2.0, for exactly the same reason.

- **A throw inside a module's IIFE at boot deletes the whole app.** Each module
  is `window.X = (function(){ … })()`, and the boot sequence runs at the bottom
  of it — so anything that throws in there means the assignment never happens
  and `window.X` is `undefined`. There is no partial app and no error on screen:
  the slide is simply empty, and every other file that guards with
  `window.X && X.something()` — `settings.js` does, for every panel — silently
  does nothing. 4.1.1 read `t.subs.length` off a curate row cached by 4.1, which
  had no `subs`, and CREATE stopped existing. **A record read at boot is the
  most dangerous input in the app**, and the rule that follows is the one
  `normalise()` was always supposed to keep: rebuild it from its known keys,
  prove every array is one, and drop what the shape cannot account for.
- **A cache is the part of a record whose shape changes most and is checked
  least.** `create_v1.curate` is the only thing in that record the app did not
  author, and it changed row shape between two versions an hour apart. Nothing
  is lost by dropping a cache — a refetch costs one network call — so it is
  always cheaper to be strict with it than to be trusting. The harness boots an
  install holding the previous version's shape.
- **`Config.get()` on a branch whose shape changed hands back the old shape.**
  Overrides are stored **whole-branch** (§3), so an install that overrode
  `create.curate` while it was `{ label, maxAgeMin }` kept exactly that, and
  `project` read as undefined the moment 4.1.1 renamed the key: no chip on the
  strip, an empty field in Settings. Any branch with a fixed set of keys and no
  deletion to express is read *through* the shipped defaults —
  `Object.assign({}, Config.defaults(path), Config.get(path))` — which is what
  `log.meds`, `log.medsOn` and `plan.formFields` have always done. **The
  fallback is on the key being absent, never on its value being falsy**: a key
  that is present and empty is a choice ("blank switches the tab off") and
  taking it away is a different bug.

- **An optimistic write has to be able to be put back exactly.** CREATE's curate
  tick draws itself before the call lands, which is the only way a list this long
  feels answerable — but the way back is the *previous* state captured before the
  change, never "the opposite of what it is now". A parent carries its subtasks,
  so the row that was already ticked and the row that was not must each land back
  where they were; assuming the inverse would silently open a subtask nobody
  touched. The harness refuses a close and checks the record, not just the class.

- **A browser will not make a sound outside a gesture.** An `AudioContext`
  constructed at boot is born `suspended` and stays that way, and everything
  played through it is silence with no error anywhere. So the context is built
  **inside the first press that needs it**, and never at all while the setting is
  off — which also means an install that never turns sound on has no audio graph
  to pay for. `resume()` is asked for every time and its promise ignored: if it
  is refused there is simply no sound, which is the correct outcome.

## 7. How to do the common things

**Add a theme** — one entry in `Prefs.THEMES` (id, name, mode, group, desc, four
swatch colours), one line in `THEME_CHARACTER`, one colour block in `themes.css`.
Nothing else. It appears in the picker automatically.

**Add an appearance or behaviour setting** — one line in `Prefs.SCHEMA`; add
`attr:` for an enum that CSS keys off, or `cssVar:` for a continuous one. Write it
in `Prefs.apply()`, render it with `chips()` / `slider()` / `toggle()` in the
relevant panel, and add the rule that makes it real.

**Make something hardcoded editable** — move the literal into `DEFAULTS` in
`config.js`, replace the module's `const` with a `let` read through
`Config.get()`, add a `Config.subscribe()` that re-reads and re-renders, and add
an `EDITORS` entry plus its path in `EDITOR_ORDER`.

**Add an app tab** — TODAY and GYM (qurOS 1.0) are the latest worked examples.
A `<section class="view ns-x" id="view-x">` in
`index.html` whose `#s-home` starts with a `.h-top` (the title band Shell
lifts out; give the app a `--title-base` if 54px is wrong for its
wordmark), a `css/x.css` scoped to `.ns-x`, a module that calls
`Shell.register('x', …)`, a `.tab-b` with `data-app="x"` in the nav (plus a
`tab-x` sprite symbol — the settings home reuses it), `'x'` in `Prefs.APPS`, a
`data-panel="x"` settings panel ending in a `[data-content-for="x"]` box, `'x'`
in `SET.PANELS`, `CATS.apps.panels`, `SEG_NAMES` and `RENDERERS`, and a
`GROUPS` row for its storage keys, and its display name in `APP_NAMES` /
`APP_HINTS` (settings **and** `search.js` keep their own copy). `startTab`, the
app list and the shell's TABS all follow `Prefs.APPS` — and because `apps` is
stored whole, `appsSeen` is what actually gets the new tab onto an install that
already has an app list. That is automatic, but read the §6 note before
assuming a new tab appears: for CAL it did not. **TOOLS is the current worked
example** — 4.3 added it and touched exactly the list above and nothing else,
plus one line in `search.js`'s `CONTENT` for its decider lists and one row in
`GROUPS` for `tools_v1`. CREATE (3.0) is the previous one. Use the `card` class on the app's raised surfaces so the depth
ramp and the card treatments reach them without a new class list in
`themes.css`.

**Make something findable in search** — nothing, if it is in Config: add its
path to `CONTENT` in `search.js` (one line: the path, the app, and how a row
reads) and it is found from then on. For data an app keeps in its own key,
register a `search(q)` hook with `Shell.register` returning `{ title, sub, go }`
rows. Settings controls need nothing at all.

**Validate an update** — follow UPDATE.md. From the project root:

```
node test/update.mjs start <area>
node test/update.mjs check --quick
node test/update.mjs check
```

Start before editing to create a verified backup and session baseline. Quick
checks support iteration; the default selects validation from changed files.
Code, markup and test changes run the complete behavior harness. Console output
is brief; full logs are saved under ignored `.update/`.

The underlying `test/harness.mjs` loads the real page in jsdom and exercises
app behavior against stubbed network calls. It remains directly runnable with
`npm test --prefix test`. Its sections share state, so do not skip setup by
filtering test names. Add regression coverage for behavior fixes. jsdom does
not paint or lay out the page; verify visual changes in a browser.


---

## 8. The PLAN export

### Where ROOT stops

```
ROOT / PLAN            Todoist                22:00 cloud agent      Google Calendar
─────────────          ──────────             ─────────────────      ───────────────
[ export ] ──────────► task "@import"  ──────► reads description ───► writes events
 picked rows            description =          resolves times         then deletes
 + day options          the day spec           from the template      the task
```

**ROOT never touches a calendar.** It is a static page with no Google auth and
it is not getting any: no OAuth, no calendar API, no calendar ids. It writes
one Todoist task and stops. `plan.calendars` holds calendar *names*, which are
passed through verbatim for the agent to resolve. A harness check reads every
URL in `js/plan.js` and fails if one of them is not Todoist.

**CAL does not change that**, and §9 says so at more length: it is a local
drawing of what PLAN resolved before it sent the task, not a second window onto
Google. A harness check reads `js/cal.js` and fails on any URL, any `fetch(`
and any `XMLHttpRequest` at all — a stricter rule than PLAN's, because CAL has
no reason to talk to anything.

### The description — a contract

Frozen the way LOG's `.md` is frozen: the field names and the shape are not
user-editable, not renameable, and a downstream agent parses them.

```
day: YYYY-MM-DD
start: HH:MM
template: normal|rest
mode: blocks|full

<slot> | <project> | <task name>
…

notes:
- <one per line>
```

- `b1a | home | chores` means an event named **`b1a|chores`** on whichever
  calendar `plan.calendars` maps `home` to.
- `<project>` is the key ROOT resolved, so it is `curate > mixing` where the
  project splits across calendars and `home` where it does not. The agent
  looks that key up; it never sees an id.
- **Unassigned slots are absent.** No placeholder lines.
- **The whole `notes:` section is omitted** when there are none — never left
  as a bare header.
- The sections are separated by one blank line and there is no trailing
  newline. A harness check compares a mixed export byte for byte.

`mode: blocks` writes the picked tasks only. `mode: full` writes the whole
template and replaces the day; whatever is already on it is archived to
`00B | schedule 2` first, not deleted. That calendar name is the **agent's**,
not ROOT's — it appears once, in the warning text, deliberately not in Config,
because making it editable here would let it drift out of step with the side
that actually does the archiving.

`mode: patch` (4.3) is the third, and it is the narrow one: **write the slot
lines and change nothing else on the day.** Not the other slots, not the fixed
rows, not the start, not the template. It exists because `blocks` was being
read as a whole-day instruction — it carries `start:` and `template:`, so the
day was rebuilt around whatever was sent and every slot that was not sent came
back empty, with the start pulled back to whatever the template said.

Two rules make it honest:

- **The header repeats the stored day's own `start:` and `template:`**, not the
  form's. The four fields are still a contract and none may go missing, but a
  patch is not allowed to move the day, so the only new information in the
  whole description is the slot lines.
- **It cannot be picked for a day ROOT has no record of.** The chip is drawn,
  dimmed, and refuses with a word — the same shape as a slot the template does
  not have. There is nothing to patch into, and inventing the rest of the day
  from a template would be `blocks` wearing a different name.

The panel also says, under the mode chips, whether the chosen day already has a
schedule — its template, its start, how many blocks are filled and when it was
exported — read out of CAL's record. PLAN still cannot see Google and never
will; what it can see is what it last wrote down itself.

**The agent has to be taught each mode.** It validates `mode:` strictly and
aborts on anything it does not recognise, so a new mode is two changes and this
repo only holds one of them: `SCHEDULE-AGENT-PROMPT.md` at the workspace root
carries the routine's prompt, and the routine holds its own copy that has to be
replaced by hand. A mode ROOT can send and the agent cannot read is a task that
fails silently at 22:00.

### The two templates

`plan.dayTemplates`, editable under settings → apps → plan → content. Every
row is `at` minutes from the day's start and a duration in minutes, and is
either a fixed event (`cal` + `event`) or a block slot (`slot`). **Nothing is a
wall-clock time**, so one number — the start — moves the whole day.

| | `normal` | `rest` |
| --- | --- | --- |
| span | 17h00 | 16h00 |
| rows | 20 | 18 |
| block slots | b1a b1b b2a b2b **b3a b3b** | b1a b1b b2a b2b |
| gym | 1h, at +1:45 | — |

The two differ by exactly two things: the hour of gym, and the b3 pair. Losing
gym is why every offset after +1:45 is an hour earlier on a rest day, and the
b3 hours are `free time` there instead. `normal` and `rest` are identities —
the description writes the name down — so rename them and the agent stops
recognising the day.

### The panel

Drawn into PLAN's tile grid by `renderProjects()`, exactly the way the task
form is: no `.scr` of its own, opened from the sent list's title row once a row
is picked. Eight fields — date (tomorrow), start (the only thing persisted,
in `plan_export_v1`), template, mode, one slot row per picked task, notes,
preview, and one export button that names the count. Everything else resets on
each open: an export is one day, not a document.

Every refusal is loud, because the only alternative is dropping a task in
silence when the description is written:

| the tap | what happens |
| --- | --- |
| a seventh row picked | refused — a day has six slots |
| a slot the task already holds | given back, that hour alone |
| a slot another task holds | refused, naming the task that holds it |
| b3 while `rest` is picked | refused — those hours are free time |
| switching to `rest` with b3 given out | the b3s are dropped, with a toast |
| export with a picked task unassigned | there is no button; the panel says how many |

---

## 9. DAY (`cal`) — the day, drawn

### Its name is not its id

The tab wears **DAY**. The app's id is `cal`, and stays `cal` everywhere it is
an identity: `cal_days_v1`, `.ns-cal`, `Prefs.APPS`, `appsSeen`,
`data-panel="cal"`, the `p:`-style flip keys, the storage group's `match`. Only
the *labels* changed — the wordmark, the tab caption, `APP_NAMES`, `SEG_NAMES`
and the storage report's row. Renaming the id would have churned a storage key,
a namespace and the app migration for a word. Same split as
`plan.types[].key`: a label is editable, an identity is not.

### What it is, and what it is not

```
PLAN / export ──┬──► Todoist task "@import" ──► 22:00 agent ──► Google Calendar
                │
                └──► cal_days_v1 ──► CAL          (local, offline, read-only)
```

One action, two destinations. The right-hand branch never leaves the browser:
CAL has no network of its own, and unlike PLAN — which is *allowed* Todoist —
it is allowed nothing at all. It draws the day PLAN had already resolved a
moment earlier, which is why it costs no extra request and works with the phone
in flight mode.

**It is not a calendar client.** It cannot tell you what is really on your
Google calendar, only what ROOT asked for. If the agent failed at 22:00, CAL
still shows the day as planned — the same way PLAN's sent list shows what was
sent, not what survived.

### Two doors in, and only two

`CAL.write()` replaces a day whole — re-exporting a day is how you correct it,
so the last export wins rather than merging. `CAL.patch()` (4.3) is the other
one: it takes the same record shape, writes **only the slots it names** into a
day that already exists, and touches nothing else — not the start, not the
template, not the notes, not the fixed rows, not the other slots. A patched row
keeps its own stored hours; the patch says *what* is in the slot, and when that
slot happens is the day's business (it may have been shifted by a wake-up time
since). It returns how many rows it merged, or `false` on a day with no record
— which is the refusal PLAN's `patch` chip is gated on. The day is marked
`localEdit` afterwards, like every other change made here after the export.

### The record

`write(day)` is the only way in, and PLAN's `doExport()` is its only caller,
after the Todoist task lands. One entry per ISO day; re-exporting replaces it
whole, because re-exporting is how a day is corrected.

Each event carries its own resolved values — clock times from the one start
time, the calendar name, and the colour — so a stored day never has to ask PLAN
anything and is unaffected by later edits to `plan.types`. The three kinds:

| kind | is | drawn |
| --- | --- | --- |
| `task` | a picked task in the slot it was given | the project's colour, bold |
| `fixed` | a template event (routine, kamo, gym, break) | the calendar's colour from `cal.eventColors`, quiet |
| `idle` | a block slot nobody claimed | dashed and dimmed, named by `cal.idleLabel` |

`fixed` and `idle` are stored even in `mode: blocks`, where the export does not
write them: the day has that shape whether or not Google is told about it.
Each can be switched off — which is the one state where the drawing is empty
and has to say *which dial did it* rather than "nothing planned".

### The date up top, the arrows down below

The day's name sits in the **title band**, beside the wordmark, where every
other app puts its date — at a declared 32px height, because anything sharing
the wordmark's row that could grow past it makes this band the odd one out and
the title morph stumble.

The **stepper** is a fixed bar just above the nav, sharing the nav's chrome
treatment and hiding with it. Being fixed, it is a sibling of `#views` and not
part of the slide (§3, §6). Stepping walks the days that **exist** — the
planned ones plus today — not the calendar, so "next" never lands on a run of
empty days to click through. An arrow with nowhere to go is dimmed and disabled
*in place*: a control that disappears at the edge moves the one beside it.

It fades out after `calStepsHide` seconds idle (5 by default, 0 pins it) and
comes back on the first touch anywhere on DAY — `wakeSteps()` in `cal.js`. 2.22
also made it span the screen with two half-width arrows; 2.22.1 put it back to
the size it was, because that is a great deal of chrome for two controls and an
arrow whose edges you cannot see does not read as a button. It is **square**
now rather than a pill — `--r2`, the radius every other box in the app uses.
It is chrome, so it looked like the nav; it is a pair of controls, so it should
look like a pair of controls.

Both replaced a horizontal strip of day chips, which as a sideways scroller
inside `#track` needed its own `touch-action` to work under a finger at all.

**It opens on today.** `pickDefault()` used to return the nearest day that had
something on it, so a morning with nothing planned answered a question nobody
asked — "here is Thursday" — and you had to step back to find out that today was
empty. An app called DAY opens on the day it is; the stepper is one tap from
everything else. A day can also be cleared from its own head (`clearDay()`,
behind a confirmation), for a plan that was abandoned or exported to the wrong
date; the Todoist task it wrote is not ROOT's to withdraw and the question says
so.

### Now, and what is left of the day

Two things a day-shaped drawing is uniquely good at carrying, and neither was on
it: where the clock has got to, and what is already done.

**The line.** One hairline across the day at the height the hour has reached,
drawn only on today and only while today is still running. Its offset is summed
from the same durations the rows are drawn from rather than measured off the
DOM, so it lands on the boundary it names whatever `calHour` is set to, and a
row hidden by a dial contributes no height to either. Before the first row and
after the last one it is simply not drawn: a line pinned to an edge says "the
day has not started" in the most ambiguous way available. It rides the shell's
own minute tick (`onMinute` → `paintNow`), which moves the line and nothing
else — a full redraw once a minute would throw away the scroll position and the
schedule panel with it.

**The ticks.** A `task` or `fixed` row is a `<button>`; an `idle` row is a
`<div>`, because it is the absence of an event and there is nothing there to
have finished. A tick is stored on the event (`done`) and is a mark on the
drawing and nothing else — CAL has no network by contract (§8) and a stored
event carries a resolved name, not a task id. Ticking the same task on DO is
what closes it. Re-exporting the day resets them, because re-exporting replaces
the day.

### The day's slots, filled from DO

PLAN builds a day and sends it, and that is still how a day gets here. But the
day PLAN sent is the day as it looked the night before, and by the morning the
blocks on DO are the ones actually happening — re-exporting the whole day to
move two of them is a great deal of ceremony for a small correction.

So: **the slots this day already has, filled from the block tasks DO is holding
now.** Only the slots — a `fixed` template row is the shape of the day — and
only on a day that exists, because `slotsOf(rec)` walks the stored events. CAL
does not resolve `plan.dayTemplates` and is not going to.

The slot rules are PLAN's, deliberately (§8): a slot another task holds is
refused **by name** rather than taken away in silence, tapping the slot a task
already holds gives that hour back, and a task moving to a new slot gives up its
old one. What is different is the ending — this overwrites every slot on the
day, so it asks first, and the slots nobody filled go back to `idle`.

**And the day says it was edited here, permanently.** `localEdit` on the record,
"edited here" in the head. Everywhere else on this screen what is drawn is what
PLAN resolved and handed over; this breaks that for one day, and a drawing that
quietly claims to be the plan is the one thing DAY must not be. Nothing is sent:
the tasks stay as they are in Todoist and the calendar keeps whatever PLAN
already told it.

`sched` is a gesture, not state — module-level, never persisted, dropped on any
day change. Same rule as PLAN's `openKey` and DO's move selections.

### Lower case, deliberately — and the one thing that is not

DAY is the one app that reads lower case throughout. `Prefs.formatDate()` is
shared and capitalises, so it is folded in `cal.js` rather than changed there,
and `.cw-date`, `.cw-rel` and `.ch-meta` set `text-transform:none` **by name** —
the one deliberate exception to the "a new label says `var(--caps)`, never
`uppercase`" rule in §6. Written down here so it reads as a choice, not a miss.

The exception to the exception is `.ce-go`, the **OPEN PLAN** button on an
otherwise empty day: it is the only action on that screen, and the only thing
here that has to be *found* rather than read. Upper case, deliberately, and for
the opposite reason to everything around it.

### The dials

`calHour` (how tall an hour is drawn — the one place a pixel is a setting rather
than a token), `calShowFixed`, `calShowIdle`, `calCalNames`, `calAhead` (how far
ahead a planned day is still offered), `calKeep` (how long a passed day is
kept) and `calStepsHide` (how long the stepper waits before getting out of the
way). The keep window sweeps behind only; a day planned three weeks out is the
point of the thing.

---

## 10. SYNC — the same day, written on two devices

### Two routes, deliberately not one

| Route | Carries | Transport |
| --- | --- | --- |
| `todoist` | DO's progress, DAY's calendar, CREATE, TEND | tasks in `04 \| core` → `claude/codex` |
| `file` | LOG, TRACK, STORE | a `.md` you move yourself |

The split is about what the data *is*, not about what is convenient. LOG is a
private journal and does not belong on someone else's server; a routine tick is
not. The two are the same machine underneath — the same payload, the same
merge, the same overlap sheet — and only the transport differs.

Since 4.13 there is a third thing that is not a route either: **one tap**.
`SYNC.run()` reads the Todoist route, merges whatever is new, and then sends
back what this device holds — which is why the button says `sync` and not
`import` or `export`. It is what DO's header button and the section's own
button both call.

Two things 4.13.1 had to put back into that button. It runs **DO's own Todoist
routine sync first** (`DO.syncTodoist(true)`, quiet, the same flag TEND uses) and
then the device sync: closing a finished routine over there is what `sync` meant
on that header long before this button existed, and running it first means the
routines it ticks *here* are in the payload the device sync sends a moment later.
And a run that wrote records **offers the reload** — every view is holding what
it read at boot, so an import nobody re-reads looks exactly like an import that
did not happen. An automatic run only says what it took in; it never takes the
page away from under you.

**Automatic, but only because the merge stopped asking.** Until 4.13 both routes
were manual, on the grounds that an import you are not standing next to is one
you cannot catch going wrong. What changed is not the nerve but the merge: a
journal (below) gives every record a time, the newer one wins, and the only
thing left to ask about is a tie. So `syncEvery` — off, or a minute up to an
hour — runs the same one tap on a timer, and a run that finds a tie keeps this
device's copy and leaves the question for a sync you *are* standing next to.
Off is still the default.

### Sync belongs to the shell, not to the apps

`js/sync.js` reads and writes localStorage keys. No app module knows it exists,
and a harness check fails if `sync.js` ever names one. That is what keeps
CREATE's "the shelf has no network" (§1) true while CREATE's shelf still
travels, and it means a new app joins the sync by having its key added to a
list here rather than by growing a sync of its own.

### The journal — when each key was written

No record carries its own timestamp; a list is a list. So `js/sync.js` wraps
`Storage.prototype.setItem` (and `removeItem`) **once**, at load, and notes
`key → moment` into `root_sync_touch_v1`. That is the whole mechanism behind
three things the request asked for:

- **"Anything I do should be synced."** A payload carries the route's own list
  *plus* every key this device has written in the last 24 hours — `SINCE_MS`,
  deliberately not a dial. A key nothing in `sync.js` has ever heard of travels
  because it was written, not because it is on a list.
- **"The most recent is used."** Each record's moment travels beside it as
  `touch`, so the two devices compare the same two numbers. Equal-and-different
  is still a question.
- **A merge keeps the *author's* moment.** `commit()` re-stamps a record it took
  from the other device with that device's time, not with now — otherwise the
  next sync would think this device had just written it.

The wrapper is the same rule as everything else here: sync belongs to the shell,
and no app reports its own writes. Sync's own three keys are skipped, or the
journal would journal itself and never settle.

### What travels, and what is allowed to

Two separate questions, and two separate switches.

| Group | Keys | Default |
| --- | --- | --- |
| `apps` | everything an app wrote | on |
| `settings` | `root_config_v1`, the content layer | on |
| `style` | `root_prefs_v1`, the whole appearance engine | on |
| `system` | `root_tab`, `root_theme`, `root_labels_v1`, the Todoist target | **off** |

`system` is off because it is the one group where the other device's answer is
not better than this one's — the tab you were on is yours.

**Safe transfer** (`syncSafe`, on) is the route split of the table above made
into a dial: while it is on, the Todoist route leaves behind `log_*`,
`capTracker.*` and `store_state_*`. Turning it off is how the logged day goes
over Todoist, and it is a thing to decide rather than a thing to default.
`syncTodayPrivate` is still the narrow version of the same exception.

**A key that is nothing but a Todoist key travels on no route, by no switch** —
`plan_token` and `root_todoist_v1`. A record that merely contains one still
travels, scrubbed.

### An id says whether it has already been taken in

Every payload carries `id`: a digest of its *contents*, not of who wrote it or
when. A push records it, an import records it, and the next run compares one
string instead of planning a merge over twenty days — which is "know
immediately that the data it is importing has already been imported". It is also
what stops two devices on a timer from trading the same bytes forever: an
unchanged board builds the same id, and a push whose id has already been sent is
not sent.

### Never a whole-record replace

The rule the whole thing is built around: **an import completes a day, it does
not overwrite one.**

- **LOG, per half.** `saveMorning()` and `saveEvening()` stamp `m.saved` and
  `e.saved` (log.js), so a morning written on the phone and an evening written
  on the desktop are not a conflict — they are one day arriving in two pieces.
  Missing on one side is taken; both present takes the newer; both present and
  written in the same moment is a question.
- **`e.blocks`, `e.media` and `entries` union regardless of the timestamps.**
  `setBlock()` and `setMedia()` write straight to storage *without* touching
  `e.saved`, so a block ticked from DO on the other device would be dropped by
  a timestamp rule. This is the trap in this feature.
- **DO's ticks union.** A tick is a fact; an untick losing to a tick is the safe
  way round.
- **DAY compares `written`,** which cal.js already stamps on every export.
- **CREATE unions.** A session is an event that happened on one device at a
  moment; taking the newer of two whole `create_v1` records deletes whatever the
  other device logged in between, which is what "sessions are not being synced
  correctly" was (4.14). Sessions and works both carry ids, so both union by id
  — the same session on both sides keeps the one with more hours on it, a work
  keeps the one touched later.
- **Other state records take the newer one.** `create_v1`, `tend.v3`, `capTracker.v2`,
  `store_state_v1` and the rest have no timestamp *inside* them, which is why
  until 4.13 they were a question. The journal gives them one from outside, so
  identical is a no-op, missing on one side is taken, a different moment takes
  the more recent, and only the same moment goes to the overlap sheet.

### `do_<iso>` is today only

DO deletes every other `do_` day on the first load of a new day, folding it into
`do-stats-v1` first (`loadState()` / `foldDay()`). An imported past day would
therefore be counted into the tally a second time and then swept anyway. The
history travels as the tally, which is the record that actually survives.

### Tokens never travel

Every record is walked on the way out and any field called `token` is dropped —
`do_todoist_v1` and `store_state_v1` both carry one, and a Todoist key inside a
Todoist task is not a thing that should exist. On the way back the local token
is put back whatever arrived, so a scrubbed payload can never blank a working
key.

### The payload, and the fence

One task per day plus **as many `ROOT · state` tasks as the state takes**,
matched on title so a second export updates rather than duplicates, and **with
no due date** — a dated task would
turn a backup into twenty things to do today. The description is a line of
prose and then the payload inside a ```` ```root ```` fence; the fence is the
contract, the prose is free to change. The file route writes the same payload
under a readable header.

### A task description is 16,384 characters, and that is a contract

Todoist's cap, and the reason 4.14.1 exists. Until then the whole of `state`
went into one task; an install with a year of routine tallies wrote a
description twice the cap, the API refused it, and **every record in that task
never left the device** — CREATE's sessions, TEND, the packing lists — while the
small per-day tasks carried on working. That is what "some things sync and some
do not" looked like from the outside.

- `stateTasks(body)` splits the state into tasks under `DESC_MAX` (15,000, the
  margin being the prose and the fence). **One key never straddles two tasks**:
  a task is parsed on its own and half a record is worse than a missing one.
- `pullTodoist` already folded every `ROOT · …` task into one payload, so the
  reading side needed no change. A `state N` task left over from a fatter
  payload is **emptied**, not deleted — this module has never removed anything
  from Todoist.
- `do-stats-v1` travels as its **last 120 days** rather than all 400. The strip
  draws at most 60, and `mergeStats` only ever fills in a day the other side
  lacks, so an older day that stays at home stays correct on both devices.
- A single record too big for a task of its own is **left behind and named** in
  the push result, which the toast reports. A known limit beats a silent hole.

`stateTasks` is pure and exported for exactly one reason: the fault was never in
the merge, it was in what the transport could carry, and that is a thing a test
can measure.

### Today's log, on the Todoist route

`syncTodayPrivate`, off by default. It lets the Todoist push carry **today's**
`log_<iso>` as well, under its own `today` key. The split above is about what
the data *is*, and LOG is a journal — but the file is a thing you have to
remember to move, and the one day you actually want on the other device is the
day you are in the middle of. So it is opt-in, today only, and the panel says
what the trade is rather than hiding it behind a switch label.

Coming back it is merged by `mergeLogDay()` — per half, arrays unioned — not by
the Todoist route's own rules, because it is a LOG record wherever it travelled.

### Everything — the third button, which is not a route

`exportEverything()` / `restoreEverything()` write and read the whole origin as
one `.md`: every key, unfiltered, the same rule the JSON backup follows. It is
for moving to a new device, not for keeping two in step, and it **replaces**
rather than merges — that is what the request means. The Todoist key is left out
unless the switch is on; `plan_token` is the only key that is nothing but the
token, so it is the only one omitted outright. It uses the same snapshot as an
import, so it too can be taken back once.

### There is no such thing as an overlap

Until 4.14 a merge could hand back a *question* — two records written in the
same moment, different, and nobody to say which — and a sheet asked it. 4.14
removed the question and the sheet with it. Every merge settles:

1. the more recent record, where the journal knows both moments;
2. failing that, **the fuller one** — more fields written, and within a field
   more text, which is the same instinct as the rest of §10: an import completes
   a record, it does not empty one;
3. failing even that, the two compared as text. Arbitrary, but the *same*
   arbitrary answer on both devices, which is the only property that matters
   once nobody is being asked. Two devices that disagree here would undo each
   other on every sync.

`plan()` therefore returns writes and notes and nothing else, and `commit()`
takes one argument. `SET.syncOpen/syncPick/syncApply/syncCancel`, `#ovl` and the
`.ovl-*` rules are gone.

### Nothing is written until the whole plan is known

`plan()` computes every write and touches no storage. `commit()` copies the raw
value of each key it is about to overwrite into `root_sync_undo_v1` first, so
the last import can be taken back exactly once. It is a snapshot, not an edit
history — the same reasoning as `Shell.undo`.

---

---

## 11. The flex system — TODAY, GYM, focus areas, recipes

The spec is `root-flex-system-spec.md` at the top of the repo (written from
Hugo's planning sessions with qurOS, October 2026). It replaces PLAN and DAY —
a schedule that crumbled on one slip — with a day that bends instead of
breaking. Its principles are not style notes; every screen below is built on
them, and a change that breaks one is a bug:

1. **Slip-tolerant.** Nothing turns red, says "failed" or resets to zero. An
   unfinished goal is offered as carry / drop the next day, one tap each.
2. **No streaks.** "X of 7 this week", "2 of 3–4 this week" — a count against a
   range, never a run that can break.
3. **Minimums count.** Every habit has a full version and a minimum; the
   minimum is done, same tick.
4. **Next step, not the mountain.** TODAY leads with one next action; the whole
   chain is folded under it.
5. **Two clock times:** wake and sleep. No hours, no blocks.
6. **Goals, not schedules:** up to 3 a day, 3 a week. The cap is hard.
7. **One tap to log.**
8. **Bad-day mode:** one switch collapses the day to its minimums.

### What is where

| | Content (Config) | State | Module |
| --- | --- | --- | --- |
| TODAY | `today.anchors`, `.goals`, `.chain`, `.hygiene`, `.prep`, `.badDay`, `.export`, `.showerMins`, `.showerNote`, `.dumpPrompt` | `today_v1` | `js/today.js`, `css/today.css` |
| GYM | `gym.days`, `.warmup`, `.minimum`, `.rest`, `.restChoices`, `.increment`, `.unit`, `.target`, `.walkCounts`, `.doLink` | `gym_v1` | `js/gym.js`, `css/gym.css` |
| focus areas | `tools.areas` | `tools_v1` (`pom.area`, `pom.log[iso][].area`) | `js/tools.js` |
| recipes, trips | `store.recipes`, `.synonyms`, `.pantry`, `.trips` | `store_state_v1` (`cooked`, `timers`) | `js/store.js` |

Behaviour prefs: `todayChain` (fold / open), `todayWeek`, `todayFocus`,
`todayDumpRow`, `gymAutoRest`.

### TODAY

One screen and four sub-screens (`#s-week`, `#s-hyg`, `#s-eve`, `#s-dump`),
all delegated through `data-act` like TEND / CAL / CREATE / TOOLS, because a
goal is the user's own text.

The home, top to bottom: the bad-day note (when on), the carry / drop offers,
the two anchors, **the next action**, the week's goals, today's goals, the
morning chain (folded to a row of dots by default), focus, the evening, the
life-dump row. On a bad day only the anchors, the next action (as its
minimum), the chain and the evening are drawn — `today.badDay` can keep goals
and focus — and the app's accent drifts toward grey. Quieter, never redder.

**The next action** (`nextItem()`): before `anchors.eveningFrom`, the first
chain step nobody has answered (a skipped step is passed over, a later step
ticked first is simply done), then the first open goal. From the evening hour,
the evening's: the prep, the dump, lights out. A morning step left undone stops
asking in the evening; it stays on the list, tickable.

**A chain step's state** is the first of: a tick made here (which includes "not
today"), what its `link` says, what DO says (`stepState()`). The row says
which answered (`from LOG`, `from GYM`, `ticked on DO`…), so a tick that will
not come off is never a mystery. Tapping the value a linked step already shows
toasts its source rather than stacking a copy. Links:

| `link` | full | minimum |
| --- | --- | --- |
| `wake` | LOG's wake time (or TODAY's "I'm up") ≤ target + `grace` | later than that |
| `gym` | a GYM session that day | a minimum session |
| `hygiene` | every non-optional hygiene step | the `min` steps (the shower) |
| `pom:<area>[:<n>]` | ≥ n focus rounds in that area (n = 1) | fewer |

**`do: 'routine|item'`** mirrors a tick onto DO's card (`DO.setTick`, an
idempotent set, not a toggle) so DO's routine Todoist close still fires — but
only on DO's own day (`DO.dayIso()`); DO keeps one day. A tick made on DO
answers the linked step the same way. TODAY's own record keeps the copy that
survives DO's nightly sweep, which is what the week's counts read.

**Goals.** `addGoal` refuses past `goals.cap`. A goal carries `fate`
(`carried` / `dropped`) once answered; `carryFrom()` offers only the last
earlier day that had goals, and only its open, unanswered ones — one day back
is a question, a week back is a pile. Carrying respects today's cap. The week's
goals are the same shape filed under the week's first day (`weekStart` pref).

**The day** is `flexDay()`: the calendar day held open until `anchors.dayEnds`
(00:00–05:59), so a dump written at 00:40 lands on the day it describes. The
shell's midnight check cannot see 04:00, so `onMinute` rolls it.

**The dump** is a LOG entry with `src:'dump'` — one per day, edited in place,
written through `LOG.setEntry`, which writes the **stored** record and then
copies its entries into the live one. It must never flush LOG's live record:
that may hold an open form's unsaved answers (§6, "discard has to undo").

**The export** (`exportMd`) is markdown for a qurOS chat: anchors, goals and
week goals as checkboxes, the chain with full / minimum, hygiene, pomodoros by
area (day and week), the gym session, meals (LOG's count, STORE's cooked),
the prep, the dump. Each section is a switch in `today.export`.

**LOG's note** gains a `#### today` table after the existing sections
(`flexNoteRows`), only on a day TODAY knows anything about: `bad_day`,
`wake_target`, `sleep_time`, `goals_done`, `goals`, `chain_done`, `chain`,
`hygiene`, `pom_areas`, `gym`, `prep_done`. Additive, like `#### study` — the
parser looks rows up by key. A cell is one line; `|` and `;` are replaced,
never escaped. The dump is not in the table; it is an entry.

**LOG's morning form** is offered TODAY's wake stamp, the hours since last
night's lights-out (`sleepHoursBefore`), and GYM's session as its workout —
in empty fields only, never written for it (`offerDefaults`).

**The life-dump map** (spec §9) is a markdown file read as data — from
`qurOS-life-dump-map.md` next to `index.html`, a picked file, or pasted.
Headings are sections, list items are things to talk through, a heading that
says "Tier N" sets the tier for what follows it. States (`partial` / `done`)
are filed under `section/item text` and survive a re-import; a `[x]` / `[~]`
in the file only seeds an item with no state. "Next untouched" is the lowest
tier's first empty item; the prompt is that one section's open items.

### GYM

Days rotate in Config order; `nextDay()` is the day after the last **full**
session — a minimum session is not that day's work and does not move it. A set
row is prefilled from this session's previous set, else last time's same set,
else last time's last set, so logging is one tap. A logged set starts the rest
timer (`gymAutoRest`), a wall-clock end shown in the sticky header with the
title. `shouldProgress(key)`: every set at the top of the range, at least as
many sets as asked — "add weight" (`+increment`), or "go harder" for
bodyweight. Finishing ticks `gym.doLink` on DO and marks DAY. A session left
running survives a reload and reopens on the session screen. The tab tapped
mid-session lands on the session, never off it.

`weekCount()` is sessions this week against `target.lo–hi`; `moved` adds days
with a Kamo walk ticked on TODAY (`TODAY.walkedOn`), when `walkCounts` is on.

### Focus areas (TOOLS)

A finished round is filed under the area picked **when it finishes** — retagging
a running round is changing your mind about what it was for. `pom.days` stays a
plain count (LOG reads it, §5 contract); the area lives on the `pom.log` rows.
`TOOLS.startFocus(area)` lets TODAY start one: a break in progress gives way.

### Recipes and the grocery trips (STORE)

`store.recipes` is the library; `store.meals` (ingredients only) is kept beside
it as "quick lists". A recipe page holds its scale (×½–×3, `usual` preselected),
one pick per `choice` group, a pick per `side` (scaled by servings, not by its
own ×), and which optional / pantry lines are in. All of that is in memory: a
recipe opened tomorrow starts from its defaults.

`groceryLines()` merges by `canon()` name: quantities and plurals come off, then
`store.synonyms` maps a name to the first of its group. **Groups match whole
names only** — taking the plural off a group member is how "peppers" (bell)
swallowed "pepper" (the spice). A unit-less count goes in the title
(`onion x2`); anything with a unit goes in the task description.

"Add to groceries" opens a sheet (outside `#track`, like every STORE sheet): what
is missing and what is already on the list (STORE's list and every open task in
the section), and which trip. A **trip** is a parent task in the STORE section,
`<label> — <day>` with that day as `due_date`; items are its subtasks. New trip,
existing trip, loose, or this phone only. The items always land on STORE's own
list too, so STORE's union sync matches them by name and never doubles them.
**STORE's union sync skips trip parents** (`isTripTask`) and pulls what hangs
under them like anything else.

The trips screen moves an item with Todoist's `POST /tasks/{id}/move`
(`parent_id`, or `section_id` for loose) — drawn first, put back exactly on a
failure. That endpoint was confirmed from Todoist's docs navigation and a
third-party reference, and is stubbed in the tests: **live behaviour is
unverified until it has run against a real account.**

### Sync

`gym_v1` travels on the Todoist route, `today_v1` on the file route and is
**sensitive** (goals and the life map sit beside the journal). Neither is
"newest record wins": `mergeGym` unions sessions by id (the later-finished copy
of one session wins), `mergeToday` puts days together — goals by id (done on
either side is done), ticks and stamps by key, bad day if either set it, the
map's marks the further along of the two.

### qurOS beside root

qurOS and root are served from one origin (`hpcurate.github.io`), so they share
localStorage — the same days, lists and plants, read by two apps. That is the
point (no data is copied), and it is why the **shell's** keys are qurOS's own:
`quros_prefs_v1` (seeded once from `root_prefs_v1` on the first boot, then
independent; `startTab` is not carried over) and `quros_tab`. Every data key is
shared and every contract in §§5–6 still binds — root reads these records too.
The backup format keeps `app:'root'` so a backup restores into either.

### Things that will bite you (flex)

- **`TODAY` is two things.** `window.TODAY` is the module; inside `do.js` and
  `log.js`, `TODAY` is a local `let` holding the day. Those files must say
  `window.TODAY` to reach the module.
- **A keyed list's key is an identity.** Chain, hygiene, prep, areas, trips and
  exercises are filed under their keys; the editors keep a key across a rename
  and never show it as editable. A reorder is a move of the row, not a re-key.
- **A whole-branch write from a switch.** `data-cfg-toggle` writes the switch's
  *parent* branch whole — fine for `today.goals`, wrong for `gym` (it would pin
  every gym default as an override). GYM's walk switch writes its own key.
- **The nav is crowded past eight tabs** (`#nav[data-crowd]`, set in
  `paintNav`): inactive labels hide and the live tab widens. The rail is never
  crowded.
- **The tab colours moved:** TODAY wears the brand violet `#A78BFA`; DO moved to
  indigo `#7C8CFF` so two tabs never share a hue.
- **LOG's workout buttons are matched by text**, and GYM offers its day key
  (`A`, `B`, `min`), which is why `log.workouts` now ships as those.
- **The TOOLS wordmark's number still overflows** at the default title size on a
  412px phone (root's 4.x, not new). Fixing it is a look decision — a smaller
  wordmark breaks the one-band-shape rule — so it is left open, like STORE's
  pinned total in §6.

### Tests

`test/flex.mjs` (137 checks) boots its own windows and drives all of the above;
`test/harness.mjs` (1,265) is root's, adapted to the qurOS bar (it checks the
shipped bar, then puts every app in it, the way root's tests always ran).
`test/boot.mjs` is a seconds-long smoke boot for iteration. `npm test` runs
both suites; `node test/update.mjs check` runs both on a full check.

---

## Changelog

Newest first. One entry per version, in the same commit as the change. Root's
history before the port is in `docs/root-changelog.md`.

### 1.0.0 — 2026-10-13 — qurOS: root, with a day that bends instead of breaking

The port of root 4.14.2 with the flex system (`root-flex-system-spec.md`)
built in — all seven of its stages at once, at Hugo's request.

- **TODAY**, the new first tab: anchors, the one next action, goals (3 a day, 3
  a week) with carry / drop, the morning chain with full / minimum and links to
  LOG, GYM, the hygiene chain, TOOLS and DO, bad-day mode, the hygiene chain and
  shower timer, the evening (prep, lights out, the dump as a LOG entry, the
  export for a qurOS chat), the week as "X of 7", the life-dump map.
- **GYM**: the A/B program with rotation, prefilled sets, rest timer,
  progression hint, minimum session, week against 3–4, history.
- **TOOLS**: focus areas on the pomodoro, counts per area per day and week.
- **STORE**: the recipe library (the spec's meals), scaler, choices, sides, step
  timers, "cooked it", add to groceries with synonym dedupe, walk / car trips
  as Todoist parent tasks, moving items between trips.
- **LOG**: a `#### today` section in the note; the morning form offered TODAY's
  wake, the hours slept and GYM's session; `setEntry` / `entryOf` / `wakeOf`.
  Fix: DATA's weight read the wake-up time (`m.wt`) instead of `m.wkg`.
- **DO**: `setTick` / `ticked` / `dayIso` / `routineItems` for the mirrors;
  DO's tab colour moved to indigo.
- **Shell**: qurOS's own prefs and last-tab keys (shared data, separate shell);
  PLAN and DAY out of the bar on a fresh install; the bar hides inactive labels
  past eight tabs; the brand.
- **Sync**: `today_v1` (file route, sensitive) and `gym_v1` (Todoist route),
  each with a merge that puts two devices' records together.
- **Settings**: TODAY and GYM panels; editors for the chain, hygiene, prep, the
  program, focus areas, recipes, synonyms, pantry and trips; field hints sit
  under their labels.
- **Tests**: `test/flex.mjs`, 137 checks; root's harness adapted, 1,265 checks.
  Both pass. Visual checks in headless Chrome at 412×915.
- **Open**: the Todoist move endpoint is unverified against a live account; the
  spec's open questions (gym goal and injuries, weed tracking) are not built;
  the TOOLS wordmark overflow is root's and left for a look decision.
