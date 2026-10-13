# root — changelog, 1.0 → 4.14.2

The history of hpcurate/root before it was carried into qurOS, kept whole and
unedited (only this header is new). References to sections (§3, §6 …) point at
QUROS.md, whose §§1–10 are root's architecture.


### 4.14.2 — 2026-10-10 — update backups go into one `_backups/` folder

Asked for directly (not through Todoist) as part of tidying the `github/`
folder, which had filled up with eighteen `root-backup-*` folders.

- `createBackup` now writes to `../_backups/root-backup-<stamp>/` instead of a
  sibling of `root/`, creating the folder on first use. The backup is still
  complete, verified and never deleted by the runner. AGENTS.md and UPDATE.md
  say where it goes.
- A runner test now asserts the destination, so the change can't quietly revert.
- Pre-edit backup: `../root-backup-2026-10-10T11-06-01-401Z/` (1,655 files,
  verified), the last one made in the old place. It was moved into `_backups/`
  afterwards.
- Verified: 6 runner tests and the full harness, **1,262 behaviour checks
  passed**. No app code changed.

### 4.14.1 — 2026-09-11 — the state task was too big to write, so half the sync never left

`fix sync practice sessions` — "it just doesn't sync". Not the merge: the
transport.

- **Todoist caps a description at 16,384 characters.** The whole of `state` was
  written into one `ROOT · state` task. A year of routine tallies is ~36 KB on
  its own, so the task was refused and everything in it — CREATE's sessions,
  TEND, the packing lists — never left the device, while the small per-day tasks
  kept syncing. That is why the ticks arrived and the practice hours did not.
- **`stateTasks(body)`** splits the state across as many tasks as it needs, one
  key never straddling two. Pure and exported, because the untestable part was
  the transport, not the merge.
- **`do-stats-v1` travels as its last 120 days.** The strip draws at most 60 and
  `mergeStats` only fills in missing days, so nothing is lost by leaving the
  rest at home.
- **A record too big for a task of its own is left behind and named** rather
  than failing the whole push; the toast says how many.
- A leftover `state N` task from a fatter payload is emptied, not deleted.


### 4.14 — 2026-09-11 — six routines, entries on the calendar, and what goes with what

From the written brief (`systems_tools_update.md`), whole.

- **DO's day is six routines** — `fix`, `fit`, `log`, `eat`, `reset`, `plan` —
  by what a block of the day is *for* rather than by where it falls in it. The
  labels are the words the matching Todoist tasks carry, since the routine sync
  matches on key or label. **History is untouched**: `do-stats-v1` rows are
  summed by whatever keys they were stored with, so a day recorded under the old
  six still reads in the consistency strip.
- **Config migrates an override of the old set.** An override wins over its
  whole branch, so a replaced default is invisible to anyone who has used the
  editor. `Config.migrate()` drops a `do.routines` / `do.tabs` override that is
  still the shipped set it replaces, and leaves one carrying a routine of your
  own exactly alone. `Config.load` is exported so this is testable.
- **LOG's month grid has an `entries` switch.** The cells count that day's
  journal entries instead of showing the date. Not stored — like the fortnight
  chart, it is a way of looking at the month rather than a setting about it.
- **CREATE's record merges instead of being chosen between.** Sessions and works
  union by id; the same session on both sides keeps the one with more hours. A
  session is an event, and taking the newer whole record deleted the other
  device's.
- **No such thing as an overlap.** Every merge settles itself: the more recent,
  then the fuller, then text order as a last resort that is at least identical
  on both devices. The overlap sheet, its four handlers, its markup and its CSS
  are gone; `plan()` returns writes and notes, `commit()` takes one argument.
- **TOOLS says what goes with what.** A correlations section over the series it
  already draws: Pearson on the days where both recorded something, same-day
  ("moves with") and next-day ("tends to come before"), strongest first, with
  the overlap count beside each. Six days of overlap minimum, and it says it is
  not claiming causes.


### 4.13.1 — 2026-09-11 — the header sync kept DO's routines, and an import is visible

Two faults in 4.13.0, both reported as "the progress of my daily routines is not
completing".

- **DO's header `sync` ran the device sync *instead of* DO's routine sync.**
  Repointing that button dropped the job it already had: closing finished
  routines in Todoist and ticking here the ones finished on the other device.
  It now does both, routines first, so what they tick here is in the payload the
  device sync sends. `DO.syncTodoist(quiet)` gained TEND's `quiet` convention and
  a return value; its own button under settings → do is unchanged.
- **An import from one tap wrote records and said nothing.** The reviewed import
  has always offered "reload now"; `SYNC.run()` did not, so ticks arrived in
  storage behind views still holding what they read at boot. One `offerReload()`
  for all three paths, and an automatic run toasts instead of opening a dialog.


### 4.13 — 2026-09-11 — a sync that carries everything you changed, settles it by recency, and can run itself

`have a better sync`, whole. The engine stopped being a list of keys this file
knows about and became a question about what this device has actually written.

- **A journal under everything.** `js/sync.js` wraps `Storage.prototype.setItem`
  once at load and notes `key → moment` into `root_sync_touch_v1`. No app
  reports its own writes and no app knows this happened, which is the same rule
  §10 has always had. It is what makes the next three entries possible.
- **Everything changed in the last 24 hours travels**, on top of the route's own
  list — which stays as the floor, so an install with no journal yet syncs
  exactly what it used to. A key nothing here has heard of is carried because it
  was written.
- **The more recent write wins.** Each record's moment travels beside it, so a
  record written on both devices is settled rather than asked about. Only a real
  tie — the same record, the same moment, different contents — still opens the
  overlap sheet. A merge that took the other device's answer keeps *its* moment,
  so the next sync compares the same two numbers.
- **One tap.** `SYNC.run()` reads, merges, then sends back what this device
  holds; there is nothing to choose between import and export. **DO's header
  `sync` button is now this** — DO's own Todoist routine sync keeps its button
  under settings → do, which is the one decision made on Hugo's behalf here.
- **An id per payload.** A digest of the contents, recorded on both push and
  import, so "already imported" is one string compare and two devices on a timer
  stop writing to each other once they agree.
- **A SYNC section of its own,** the fourth category beside apps, appearance and
  data. It carries the one button, the refresh dial (`syncEvery`: off, or 1–60
  minutes), safe transfer, the window dial, the four what-travels switches and
  the three routes, which moved here out of `data`.
- **Four groups and a safe-transfer switch.** apps / settings / style / system,
  with system off; safe transfer is the old private/not-private route split made
  into a dial. Tokens travel on no route either way, switch or no switch.
- **Automatic refresh is off by default.** The dial has nine intervals and an
  `off`, which the request did not ask for and which a background sync nobody
  chose is the reason for.


*Newest first. Every change to `root/` gets an entry — what changed, and why if
the why is not obvious from the what.*

### 4.12.1 — 2026-09-10 — the mark sits straight, and DATA reads the whole app

Two Todoist fixes, both against 4.12.

- **The icon-only wordmark was off centre.** `text-box:trim-both cap alphabetic`
  trims the box to the letters' **cap height** and `vertical-align:baseline`
  sits the mark on their baseline. Both are exactly right while there are
  letters; both are nonsense once `font-size:0` has taken them away, and
  together they were the offset. With nothing left to trim to and no baseline
  left to sit on, the wordmark stops being laid out as type at all and becomes
  what it now is — a box holding one thing, centred.
- **DATA read three stores; it reads the app now.** The question is "what do I
  actually do", and answering it out of TOOLS' own instruments was answering a
  much smaller one. Five families — **body**, **done**, **made**, **tools**,
  **life** — over sleep, energy, mood, stress, kilometres, blocks, everything
  ticked on DAY, topics, cards, plants, desk hours, what was watched, the three
  instruments, how much of each day got written, notes, caffeine and shopping.
- **Every series goes through the owning app's own read-only day reader**, never
  its storage key: `LOG.dayData`, `LOG.loggedDays`, `TRACK.doneOn`,
  `LEARN.dailyStats`, `CREATE.dayStats`, `CAL.marks`, and two new ones,
  `TEND.careOn` and `STORE.tripsOn`. That is the rule §6 already states for
  LOG's note, and it is what stops DATA becoming a second definition of every
  record in the app. An app that is switched off contributes nothing and the
  chart carries on — each call is behind a `try`, for the reason the curate
  cache earned in 4.1.1.
- **`LOG.dayData` hands out a day, not the record.** Derived numbers only, so a
  caller cannot write through it and nothing here has to be kept in step with
  the form. Morning and evening both survive rather than being averaged into
  one: the day's shape *is* the pair.
- **An empty day is not a day of zero.** A night nobody wrote down is `null` and
  is left out, so it cannot pull an average towards nothing. A rating is
  averaged and a count is totalled, and each tile says which — "27 mood" would
  be nonsense, and so would "0.4 blocks a day" as a headline.
- Pre-edit backup: `../root-backup-2026-09-10T14-03-16-383Z/` (1,565 files, verified).
- Validated through the runner: 20 syntax checks, smoke for 10 apps / 15 themes /
  14 panels, **1192 behavior checks and 6 runner tests passed** (15 added). One
  4.12 check was widened where it pinned the shape of a CSS rule this fix
  reformatted. No browser: whether the mark now *looks* centred is Hugo's call.

### 4.12 — 2026-09-10 — two more instruments, the hours that are not about anything, and a day you can re-time

A written brief rather than a Todoist batch: `systems_tools_update.md`, whole,
minus the live indicator, which was asked to be left for now.

- **TOOLS is four instruments.** The Wim Hof round is called **breathing** —
  the method is his, the tool is a breathing round, and that is what the strip
  and the written-down session should say. Its Config path stays `tools.wimhof`:
  §5 does not rename a storage key for a word.
- **Every clocked instrument carries its own dials,** folded behind one word:
  the pomodoro's focus, break and rounds; breathing's rounds, breath and
  recovery. A dial reads the settings default until it is moved and says so
  while it does, because a dial that never admits it is a dial you cannot get
  back. The ranges are written once (`DIAL` in tools.js) and the settings
  editors offer exactly them, so a default cannot be set to a number the tool
  would clamp the moment you touched it.
- **The big button is square,** with its size and its corner on two dials in
  appearance. The corner is a *share* of the size rather than a pixel radius, so
  50% is a circle at any size and the two never have to be set in step.
- **Which instruments the strip carries, and in what order, is a setting** —
  the same shape `apps` has: the list *is* the visibility, so a tool switched
  off keeps its place for when it comes back on. One has to stay.
- **Both instruments show their history on their own page** — a row a day,
  lines and nothing else, with the accent on the one thing worth *finding*: the
  best day, the best hold ever posted. Everything else stays grey, because three
  highlights are no highlight.
- **Everything that finishes is written down now,** not only a breathing
  session: a finished focus round reaches LOG's day and DAY's schedule through
  the same two calls, and so does a finished run.
- **OPTIMISE** is new: named lists of steps, run against the clock. The shelf is
  a row per list with its fastest time on it, because that is the reason to
  press the button. A run has two buttons — the clock and the step — and the
  splits land under them as they are taken; a split faster than that list's best
  for that step comes back **gold**, which is the comparison made visible and the
  whole point of the instrument. A history with sorting, per-list filters and a
  records-only view. Lists are Config: a name, a colour (a palette, a colour of
  its own, the accent, or an accent gradient), one of twenty icons, and its
  steps one a line. Times are filed under a list's **id**, so renaming one keeps
  its record.
- **DATA** is new: five readings of what the other three wrote down — a tile per
  series, the range day by day, the share as a pie, the week as a nightingale
  wheel, and how many of the last days had anything on them at all. Inline SVG
  against the same tokens as everything else; no library, no canvas.
- **CREATE has practice counters** at the top of the shelf: one big block per
  area with `+30` and `+60` under it, the window (week / month / year) a word in
  the section's own title line. Taps inside a minute of each other are **one**
  session, not four — a log that said four would make the session count
  worthless. The section follows the strip, so `all` shows every counter and an
  area shows only its own, and which areas get one is a switch per area in
  settings. Practice is time at the desk like any other, so it reaches the week
  under the shelf, LOG's note and both reports.
- **DAY has an edit mode.** Reading a schedule and editing one are different
  jobs, so the delete, the move arrows and two new length buttons are all behind
  one switch — off, a row is a name, a clock and a tick, with nothing to catch a
  thumb against. The length buttons move a row by the step in settings (15
  minutes by default) and shift what is after it by the same amount, stopping at
  a `fixed` row: an anchor keeps its own clock, so growing into one is refused
  rather than quietly overrunning it. A row cannot be shrunk out of existence.
- **The band's wordmark can wear the app's own tab glyph** — name, icon and
  name, or icon alone. The shell puts one inside every `.h-logo` rather than
  eleven headers each carrying their own, and it is treated as a title: sized
  off `--title-px` and wearing the same hard offset shadow, as a drop-shadow
  because the mark is a drawing.
- Pre-edit backup: `../root-backup-2026-09-10T11-46-52-891Z/` (1,536 files, verified).
- Validated through the runner: 20 syntax checks, smoke for 10 apps / 15 themes /
  14 panels, **1177 behavior checks and 6 runner tests passed** (55 added). Three
  older checks were rewritten where they encoded a contract this version
  deliberately changed — two instruments became four, the session's name became
  `breathing`, and DAY's row controls moved behind the switch. No browser: the
  gold split, the nightingale and the square button are drawings, and how they
  look is Hugo's call.

### 4.11 — 2026-09-09 — the blocks were the whole page, and now the cursor can be tested

One request, direct, and the reason the previous three attempts kept missing.

- **"The selector appears but I can't go into one block."** Two causes, both in
  `blocksOf()`. A `.view` has exactly **two** children — the title band and
  `.view-body` — so asking it for a screen's blocks answered "the band, and
  everything else on the page"; stepping into the second handed back a flat list
  of every control, which is the thing blocks were added to replace. And on
  DO's home the descent then unwrapped the routine grid into six cards, so every
  block was a **leaf** with nothing inside it — there was genuinely nothing to
  step into. Blocks now come from the **open screen**, with the band as one of
  them, and a lone child is unwrapped only when it is a group *of groups*: a
  container whose children are the controls themselves is the block. DO's home
  is the band and the grid; entering the grid walks its cards.
- **`shown()` no longer asks `offsetParent`,** and this is the more important
  half. `offsetParent` is null for anything `position:fixed` — the numpad, the
  sheets, the nav — so the cursor considered the only thing on screen to be off
  it. It is also null for *everything* under jsdom, which is why three versions
  of this shipped without one check that could move the cursor: the part of the
  app that most needed testing was the part the harness could not touch. The
  question is asked in ROOT's own vocabulary now — a `.scr` without `.on`, a
  `.view` without `.cur`, `[hidden]`, `.hidden`, inline `display:none` — which
  is both more correct in a browser and answerable from the DOM alone.
- **`Shell.cursor` is exposed for the harness.** Nothing in the app calls it;
  the keyboard does. A feature rebuilt four times deserves checks that drive it
  rather than checks that read its source.
- Pre-edit backup: `../root-backup-2026-09-09T20-52-41-824Z/` (2,096 files, verified).
- Validated through the runner: 20 syntax checks, smoke for 10 apps / 15 themes /
  14 panels, **1122 behavior checks and 6 runner tests passed** (13 added, and
  for the first time they *move the cursor*: what a screen's blocks are, that
  none of them is the scroller, that a grid is one block rather than one block
  per card, stepping in, the ring being bounded by the block, coming back out,
  and refusing to leave from the top). Still no browser — how it *feels* is
  Hugo's call — but the mechanism is now observable rather than argued for.

### 4.10 — 2026-09-09 — a direction is a direction, and the layouts actually switch

Two Todoist requests, `@claude`-labelled, fetched 2026-09-09.

- **The cursor moved through the markup, not through the screen** (`@fix` p1,
  other). That is what "navigates inconsistently" was, and it was the same bug
  in both previous attempts: DO's home is a two-column grid, so the next node in
  the document is the card to the **right**, and the one after that is
  down-and-left. Pressing *down* moved *right*. Every grid, every row of chips
  and every pair of buttons on a row behaved the same way.
- **A direction is now a direction.** Each key picks the nearest thing that
  genuinely lies that way, measured off the boxes the browser has already laid
  out — the same rule the eye is using, which is why it needs no per-screen
  knowledge to feel right. Something sharing a row or a column counts for eight
  times more than raw distance, so the obvious neighbour wins over a closer one
  that is off to the side. Up and down fall back to document order when nothing
  is that way, so two keys still reach everything; left and right do not,
  because a *left* that jumps to the end of the previous row is the surprise
  this exists to remove.
- **All four arrows are the cursor.** Two of them used to change tab, which
  meant the four keys shaped like a direction pad did two unrelated jobs and
  left/right could not mean what they obviously mean. Tabs are the letters and
  1–9.
- **"Let me use the app with one hand"** is a question about *where the keys
  are*, and it cannot be answered from here — the defaults are already a guess
  about one layout and this install may not be on it. So it is asked instead:
  **set them** takes the four directions and the use key in order, binding each
  as it is pressed. Whatever is comfortable is what gets bound, on any keyboard.
- **The highlight is a choice of kind, not a volume knob.** 4.5's hard ring was
  too loud and 4.9's hairline wash was too quiet, which is the shape of a
  problem that is not solved by a slider. Four treatments (`kbMark`): **lift**
  (the default — outlined, haloed and raised off the page), **corner arrow**
  (4.9's), **edge bar** (a thick accent rule down the left, which the eye finds
  at the margin without scanning), and **spotlight** (everything else goes dark,
  done with one 100vmax shadow so nothing has to be targeted at the siblings).
- **TOOLS' new layouts were set but never drawn** (`@fix`, tools). The dial
  changed and the chip lit; the screen carried on drawing the ring. `tools.js`
  subscribed to Config and not to Prefs — every other app has subscribed to
  Prefs for versions, and TOOLS had never had a Prefs dial to subscribe for
  until 4.9 gave it one. One line.
- Pre-edit backup: `../root-backup-2026-09-09T20-24-24-999Z/` (2,077 files, verified).
- Validated through the runner: 20 syntax checks, smoke for 10 apps / 15 themes /
  14 panels, **1110 behavior checks and 6 runner tests passed** (18 added, 2
  rewritten where they pinned the arrows to the tabs). The scoring is checked
  against a hand-built two-column grid — pure arithmetic on rectangles, so it is
  provable here even though jsdom lays nothing out, and it is the part that was
  actually wrong. **Still not seen in a browser**: the four highlights and the
  feel of the movement are reasoned about, not looked at.

### 4.9 — 2026-09-09 — the cursor walks in two levels, TOOLS is four drawings, and today's log can travel

Three Todoist requests, `@claude`-labelled, fetched 2026-09-09.

- **The cursor could not see half the app** (`@fix`, other). Its selector knew
  about buttons, links and fields — and DO's routine cards are `<div onclick>`,
  while TEND, CAL, CREATE and TOOLS all dispatch off `data-act`. So "routines in
  do don't seem to register as an element" was not a DO bug at all: none of
  those controls existed as far as the cursor was concerned. `[onclick]` and
  `[data-act]` are in the selector now.
- **It walks two levels.** 4.5 shipped one flat list, and on a dense screen
  that is forty steps to reach the bottom — which is what "it scrolls between
  elements inconsistently" was describing. The cursor starts on a screen's
  **blocks**, the act key steps *into* one, and up/down then walk that block's
  own controls. Escape climbs a level before it gives up the cursor, so the way
  out is the same key however deep you are.
- **What counts as a block is derived, not listed.** A per-app list of container
  classes would be ten things to keep in step and would go stale the first time
  a screen was rebuilt. `blocksOf()` walks down from the screen through any run
  of single-child wrappers until it reaches a level with more than one thing on
  it — which is that screen's own idea of its sections, whatever the markup is
  called.
- **The mark replaced the ring.** A full accent outline around a block is an
  outline around half the screen, and it read as an error state rather than as
  a cursor. The selection is a hairline wash now, and what you follow is a small
  arrow hovering at its bottom-right corner — fixed, measured off
  `getBoundingClientRect`, and filled in and turned by 90° at the second level,
  so "which level am I on" is answered by the same object rather than by a
  second one elsewhere. It is a child of `<body>` for the reason §6 gives.
- **Seven rebindable keys**, not five: `in` and `out` join the map.
- **Today's log can ride the Todoist push** (`@change`, other). Off by default,
  and deliberately **today only**. The private route exists because a journal
  does not belong on someone else's server; the one honest exception is the day
  you are still in the middle of, which is also the day a file you have not
  moved yet cannot help with. It travels under its own key and is merged by
  LOG's own per-half rules on the way back, because it is a LOG record wherever
  it travelled. §10.
- **TOOLS is four drawings of one number** (`@change`, tools). The ring stays as
  one of them; `bar` is a departure board (large tabular figures, a hairline
  filling left to right, nothing enclosing anything), `stack` is a column of
  twelve blocks filling from the bottom — a quantity you can see rather than a
  number you read — and `plain` has no container at all. Every layout is handed
  the same 0-to-1 fraction and carries `#tl-big`, `#tl-sub` and a `--tl-frac`,
  so `paint()` moves one number and one word and does not care which drawing is
  on screen. The phase colours moved off `.tl-ring` onto the readout, so a
  layout never restates what colour a break is.
- Pre-edit backup: `../root-backup-2026-09-09T19-26-03-555Z/` (2,054 files, verified).
- Validated through the runner: 20 syntax checks, smoke for 10 apps / 15 themes /
  14 panels, **1092 behavior checks and 6 runner tests passed** (18 added).
  **Not seen in a browser** — the extension would not connect — so the arrow's
  placement, the three new layouts and the two-level walk itself are reasoned
  about, not looked at. The cursor is still the one part the harness cannot
  drive at all: it filters on `offsetParent`, which jsdom never populates, so
  every check here is about the layer underneath the walk.

### 4.8 — 2026-09-09 — TOOLS is two instruments, the timetable can be rearranged, and a finished routine always closes

Five Todoist requests, `@claude`-labelled, fetched 2026-09-09.

- **The minimal routine card keeps its progress bar** (`@fix`, do). It used to be
  cut along with everything else that took height. It is the one part of the
  card read at a glance rather than counted, so it rides the **bottom edge** of
  the row now and costs no height at all — which was the only reason to drop it.
- **A finished routine no longer "sometimes" fails to close in Todoist**
  (`@fix`, do). `tdBusy` is one lock over six operations. Five are button
  presses and dropping those is right — the button is visibly disabled. The
  sixth is the close fired by ticking the last item, which is not a Todoist
  control at all: no disabled button, no toast, no idea a fetch was in flight.
  It queued nothing and returned. It takes a ticket now, and every operation
  releases through one path that drains the queue.
- **The timetable can be rearranged, and empty time added** (`@fix`, plan). Two
  arrows on every movable row: a swap with the neighbour, re-timed from the
  earlier one's start, so the pair keeps its span and nothing outside it moves.
  A whole-day recompute was the other way, and it would move rows nobody
  touched — which is how a timetable stops being trusted. `+ gap` appends an
  empty hour to be walked into place with the same arrows. Fixed rows are
  anchors. §9.
- **The undo pill is yours** (`@change`, store/shell). The offset title shadow
  is gone **permanently** — it belongs on a wordmark read across a room, not on
  a control two words wide that shows for five seconds. Its mark is now a dial
  (`undoIcon`: hook, circle, arrow, chevron, none) and its words another
  (`undoText`). Turning both off would leave an empty control, so the words come
  back whenever the mark is off.
- **TOOLS, rebuilt** (`@change`, tools). Four instruments to two. The stopwatch
  and the countdown were the phone's own two clocks with a worse readout, and
  the decider answered a question by not answering it. What is left is what the
  phone does *not* have.
  - The **pomodoro** is a control now rather than a paragraph: one 74px round
    button, the round as **dots** rather than "round 2 of 4", skip and reset as
    small icons off to the side where they cannot be hit mid-phase, and a wash
    of the phase's own colour behind the ring while it runs.
  - The **Wim Hof round** is new. Three phases: the breaths, at a pace the ring
    actually breathes to; the **retention**, which counts *up* and is ended by
    you, because how long it lasted is the measurement and a timer cutting it
    off at a guess would be measuring the guess; then the recovery hold. A
    finished session is written into **LOG's day** as a block and onto **DAY's
    schedule** as a mark, through the calls both apps already offer anything
    that finishes something — neither grows a feature for it.
  - The phase cue is a **toast**, not a tone TOOLS plays. ROOT has one place
    that makes noise and it is `shell.js` (§3); an app reaching for the sound
    engine is exactly what that rule stops, and a harness check fails on it.
    Shell.toast already sounds, so the cue is the sound *and* the instruction —
    the better half of the trade with your eyes shut.
  - `tools.timers` and `tools.decks` leave Config; `tools.wimhof` arrives. A
    `v:1` store keeps its focus history and drops the three dead branches.
- **Task `6hV37Rcx3pppGXVG` said `project: hub | tab: store`.** The undo toast is
  root's shell and `store` is a root tab; hub has no such tab. Built as **root**
  and recorded here, per the protocol's rule on malformed fields.
- Pre-edit backup: `../root-backup-2026-09-09T18-36-43-010Z/` (2,027 files, verified).
- Validated through the runner: 20 syntax checks, smoke for 10 apps / 15 themes /
  14 panels, **1074 behavior checks and 6 runner tests passed** (17 added, and 6
  rewritten where they pinned behaviour that was asked to change). **Not seen in
  a browser** — the extension would not connect — so the new TOOLS layout, the
  breathing animation and the move arrows have been reasoned about, not looked
  at. The Todoist auto-close fix is covered structurally rather than
  behaviourally: the harness stubs networking, so the queue draining under a
  real in-flight call is unverified.

### 4.7 — 2026-09-09 — the frame is any size you like, and everything fits in one file

- **The frame dials open right up** — 320–2000 wide, 400–1600 tall, capped by
  the window it sits in. A frame past 560px wide now behaves like a wide window
  *inside itself*: the grids grow columns and the text stops at Max content
  width, so a big frame is roomy rather than stretched. CSS cannot measure a box
  whose size is a dial, so Prefs stamps `data-frame-wide` and the cap and the
  grids read that alongside their media queries.
- **Export everything / import everything**, as one `.md`. Not a route — the two
  sync routes keep two devices in step on a Tuesday, this is for a new phone.
  Every key on the origin, unfiltered, the same rule the JSON backup follows:
  appearance, behaviour, content edits, every logged day, every list, the queue,
  the plants, the curriculum, the calendar, the works in progress.
- **The Todoist key is left out by default**, with a switch to include it. A file
  that goes through a chat app should not carry it, and it is two taps to paste
  back. A record that merely *contains* one keeps everything else — dropping
  STORE's whole state to hide one field would be the wrong trade; `plan_token`
  is the one key that is nothing but the token, so it is the one key omitted.
- **Restoring replaces rather than merges**, deliberately: "move me to a new
  phone" means replace, and a half-and-half install is nobody's intent. It says
  how many keys are new and how many are replaced before it does anything, and
  it goes through the same snapshot as a sync import, so it can be taken back
  once. LEARN's decks still cannot travel — IndexedDB — and the file says so.
- Pre-edit backup: `../root-backup-2026-09-09T17-00-42-186Z/` (2,014 files, verified).
- Validated through the runner: 20 syntax checks, smoke for 10 apps / 15 themes /
  14 panels, **1057 behavior checks and 6 runner tests passed** (thirteen added).
  Still not seen in a browser — the extension would not connect.

### 4.6 — 2026-09-09 — the same day, written on two devices

- **Two sync routes, split by what the data is.** `todoist` carries DO's
  progress, DAY's calendar, CREATE and TEND as tasks in `04 | core` →
  `claude/codex`; `file` carries LOG, TRACK and STORE as a `.md` you move
  yourself. LOG is a private journal and does not belong on someone else's
  server; a routine tick is not. Same payload, same merge, same sheet — only the
  transport differs. Both are manual, and there is no background pull: an import
  that runs on its own is one you cannot be standing next to when it goes wrong.
- **An import completes a day, it never replaces one.** LOG merges *per half* —
  `m.saved` and `e.saved` already existed (log.js), so a morning written on the
  phone and an evening written on the desktop are one day arriving in two
  pieces rather than a conflict. Missing takes, newer wins, same-moment asks.
- **`e.blocks`, `e.media` and `entries` union whatever the timestamps say.**
  `setBlock()` and `setMedia()` write straight to storage without touching
  `e.saved`, so a timestamp rule would have quietly dropped every block ticked
  from DO on the other device. This was the trap in the feature.
- **The overlap sheet is only for what is genuinely ambiguous.** Everything the
  merge can settle is settled before it opens, so it lists the handful of things
  written on both devices that disagree and nothing else. `keep mine` is the
  default on every row.
- **Nothing is written until it has been looked at.** `plan()` computes every
  write and touches no storage; `commit()` snapshots the raw value of each key
  it is about to overwrite first, so the last import can be taken back once.
- **Tokens never travel.** Every record is walked on the way out and any `token`
  field is dropped — `do_todoist_v1` and `store_state_v1` both carry one, and a
  Todoist key inside a Todoist task should not exist. The local one is put back
  on the way in, so a scrubbed payload cannot blank a working key.
- **`do_<iso>` is pushed for today only.** DO sweeps every other `do_` day on
  the next day roll and folds it into `do-stats-v1` first, so an imported past
  day would be counted into the tally twice and then swept. The history travels
  as the tally.
- **Sync is the shell's, not the apps'.** `js/sync.js` reads and writes storage
  keys; no app module knows it exists, and a check fails if `sync.js` ever names
  one. CREATE's "the shelf has no network" (§1) stays true while its shelf
  travels. New: §10, and `root_sync_v1` / `root_sync_undo_v1` in §5.
- Pre-edit backup: `../root-backup-2026-09-09T15-51-14-874Z/` (1,998 files, verified).
- Validated through the runner: 20 syntax checks, smoke for 10 apps / 15 themes /
  14 panels, **1042 behavior checks and 6 runner tests passed** (29 added, most
  of them the merge). **The Todoist transport has not been run against the live
  API** — the harness stubs networking and pushing would have written to the real
  account — so the section resolves and the payload round-trips in tests, but the
  first real export is the first real test of it. The panel was not seen in a
  browser either; the extension would not connect.

### 4.5 — 2026-09-09 — a window instead of a sprawl, and the keyboard reaches the controls

- **A wide window gets a frame, not a rail.** `desktopMode` (layout → "On a wide
  screen"), `frame` by default, with `frameW` / `frameH` under it. The app is
  pinned to a phone-shaped box in the middle of the screen and *every phone rule
  is left alone* — the pill stays a pill, the grids stay two columns. The 2.8
  rail is intact and is what `rail` selects; each of its three media blocks is
  now gated on it, so the two modes are complementary at 560, 880 and 1180.
- **The frame is one rule on `<body>`, and the transform is load-bearing.** It
  centres the box *and* makes body the containing block for its own fixed
  children — the same mechanism §6 warns about inside `#track`, used deliberately
  one level up. Every piece of floating chrome is a child of body, so the whole
  lot lands inside the frame, including anything fixed added later. A wrapper
  element would have meant moving eleven scattered nodes and remembering the
  twelfth. The three `vw` measurements that were sizing against the window (the
  pill, the two toasts) now read `--frame-w`.
- **A roving cursor.** Up and down walk the controls of the slide you are on and
  the selected one wears the focus ring; the act key ticks it, presses it, or
  steps into it if it is a field. The list is rebuilt on every move rather than
  cached — these screens re-render constantly and a cached list goes stale — so
  a miss restarts at the top instead of pointing at a detached node.
- **A text field is selected but not focused.** The bindings are letters, so a
  focused field would swallow them *and* type them. The cursor stops on the
  field wearing the ring, the act key steps in, Escape steps back out. That is
  also why the ring is a class rather than `:focus-visible`.
- **Five rebindable keys** (`keyMap`: prev, next, up, down, act — a, e, comma, o,
  space). The arrows, 1–9 and `/` stay built in: they read the same on every
  keyboard, so there is nothing to choose. These five are defaults guessed at a
  layout, which is what makes them a dial. Settings captures the next key
  pressed rather than asking anyone to spell `arrowup` into a text field, on the
  capture phase so rebinding onto `e` does not change tab mid-choice; a key
  already bound elsewhere is taken off that action rather than shadowed.
- Pre-edit backup: `../root-backup-2026-09-09T15-34-55-997Z/` (1,998 files, verified).
- Validated through the runner: 19 syntax checks, smoke for 10 apps / 15 themes /
  14 panels, **1013 behavior checks and 6 runner tests passed** (twelve added).
  **Not seen in a browser** — the extension would not connect — so the frame's
  geometry and the cursor's ring have been reasoned about, not looked at. The
  cursor is also the one part the harness cannot reach at all: it filters on
  `offsetParent`, which jsdom never populates.

### 4.4 — 2026-09-09 — the tab you are on colours the app, and the palette can be your own

- **The tab's hue is the accent.** `tabAccent`, on by default, under Navigation.
  DO is purple all the way down, STORE amber, TOOLS coral — every button, chart
  and highlight in the app, not only the pill under it. It is one write to
  `--y` in `Prefs.apply()`, so the three washes mixed out of it follow; §4 has
  the mechanism. `colorfulTabs` is untouched and still gates the *bar*.
- **A custom palette.** `tabPalette: custom` and a swatch per tab, settings
  included. Only the tabs actually picked are stored (`tabColors`), so a tab
  left alone keeps its shipped hue and a new app arrives coloured rather than
  blank — `custom` deliberately matches no block in `themes.css`. Each picked
  colour brings its own ink, because a custom palette can hold a light tab and
  a dark one and a single `--tab-on-c` would be unreadable on one of them.
- **TOOLS had no hue.** It shipped in 4.3 without one in any of the six
  palettes, so its tab fell back to the accent. Added to all six; mono's ramp
  re-cut over eleven steps. The palette test now reads the tabs off the bar
  instead of a hand-written list, which is what would have caught it.
- Pre-edit backup: `../root-backup-2026-09-09T12-17-31-822Z/` (1,981 files, verified).
- Validated through the runner: 19 syntax checks, smoke for 10 apps / 15 themes /
  14 panels, **1001 behavior checks and 6 runner tests passed** (five added).
  Not seen in a real browser — the extension was not connected — so the hues
  themselves have been reasoned about, not looked at.

### 4.3.2 — 2026-09-09 — update protocol and validation runner

- Added AGENTS.md as a compact entry point and UPDATE.md as the update protocol.
  Read the relevant architecture sections instead of the complete release history.
- `node test/update.mjs start <area>` creates and verifies a full sibling backup.
  `check` compares against that snapshot and selects documentation, smoke or full
  validation. Shared CSS and executable changes require the full path; `--quick`
  supports iteration and `--full` forces comprehensive checks. Logs and the
  session pointer stay under ignored `.update/`.
- Kept the existing behavior harness intact. Added tests for backup completeness,
  changed-file detection, validation selection, concise output and CLI sessions.
  No new dependencies or application behavior changes.
- Pre-edit backup: `../root-backup-20260909-123633/` (1,971 files, SHA-256 verified).
- Verified through the runner: 19 JavaScript syntax checks; smoke checks for
  10 apps, 15 themes and 14 panels; **996 behavior checks and 6 runner tests passed**.
  No application layout or live network behavior changed.

### 4.3.1 — 2026-09-09 — comment cleanup and decider fix

- Backed up the entire project, including Git history and test dependencies,
  to `../root-backup-20260909-115833/` before editing; verified every file by SHA-256.
- Shortened historical explanations and decorative headings across JS, CSS,
  HTML and test files. Removed repeated inline commentary; kept storage contracts,
  migration notes and non-obvious constraints. Corrected stale descriptions of
  CREATE networking, PLAN transitions, STORE colours and the retired scale migration.
  Comment text is about 32% smaller, saving 167 KB.
- Fixed TOOLS' decider returning no answer after repeated picks from a list such
  as `same, same`. Repeat avoidance now requires a distinct alternative.
  Added checks for duplicate-only lists and duplicates with another choice.
- Removed a test that required an exact comment sentence and dropped a prose
  condition from the chart CSS check. Existing zoom and chart behaviour checks remain.
- Parser comparisons verified that all other JavaScript logic, CSS rules and
  non-comment HTML are unchanged. Baseline: 995 checks passed. Final harness:
  **996 passed, 0 failed** (two regression checks added, one prose-only check removed).
  `git diff --check` passed. Browser layout was not tested; visual rules are unchanged.

### 4.3 — 2026-09-07 — a TOOLS tab, sound becomes a kit you can map, and PLAN can patch one block of a day

Ten Todoist requests, one version. Two `@idea` tasks were read, listed and left
alone.

#### TOOLS — a tenth app

> *"new tab: tools / this has a bunch of productivity tools that you would
> need. (eg: pomodoro timer)"*

Four small instruments behind one strip: a **pomodoro**, a **stopwatch**, a
**countdown** and a **decider**.

**Why it is one tab and not four.** None of these is an app. Each is one
control, one readout and one number you keep for the day; four tabs would be
four tabs that are empty most of the time. So it is CREATE's tab strip again —
what you want is *an instrument*, and choosing which is a tap rather than a
place to navigate to. There are no sub-screens either, deliberately: a place to
navigate to is a place to forget you left something running.

**The clock is a timestamp, never a counter.** Nothing in here counts intervals.
Every running thing stores the wall-clock moment it ends — the stopwatch stores
the moment it started plus what was already banked — and every readout is
`Date.now()` measured against that. A `setInterval` that increments a number is
wrong on this device three times over: a background tab is throttled to once a
second at best, a phone that sleeps stops firing it entirely, and a reload loses
it. All three are exactly the case a pomodoro is used in. The interval that does
exist only *paints*, runs whatever tab you are on (a timer that finishes while
you are in LOG still has to say so), and is not created at all while nothing is
running. The harness proves the point directly: a phase whose end is already
five seconds in the past finishes on the very next tick.

What is Config's and what is the store's follows the usual line. The four
pomodoro lengths, the quick-timer chips and the decider's lists are content —
50/10 is a different working day, not a different-looking one — so they are
editable in Settings → tools and travel with the content export. What is
*running*, and the day's tally of finished focus rounds, are in `tools_v1`.

Everything §7 asks for and nothing else: a slide, `css/tools.css`, `js/tools.js`
with its `Shell.register`, a `tab-tools` sprite, `'tools'` in `Prefs.APPS`, a
settings panel ending in its content box, the five settings.js lists, a `GROUPS`
row, and one line in `search.js`'s `CONTENT` so the decider's lists are findable.
It is the current worked example in §7 for that reason.

#### Sound — a kit, and a map over it

> *"update the sound. there should be more variety. sounds need to be clicky but
> sublte. like a small tick sound. what you had is good it just needs to have
> more variety. add multiple preset sounds, some options, and the ability to map
> the sounds"*

4.2 had three voices hardwired to three moments. 4.3 splits that into the three
things that were tangled together, the way 2.0 split content, appearance and
behaviour:

- a **voice** is a timbre. Nine of them — `tick` `click` `wood` `pop` `thunk`
  `blip` `swell` `chime` `glass` — plus `none`, which is a real answer. The
  clicky five are square and triangle waves with a lowpass rolling the top off:
  that is the difference between a tick and a beep. `blip`, `swell` and `chime`
  are the three 4.2 shipped, kept under their own names.
- an **event** is a moment. Five now, not three: `tap`, `nav`, **`menu`**,
  **`done`** and `msg`.
- a **kit** maps the five onto voices. `tick` (the new default), `classic`
  (exactly what 4.2 sounded like — nothing that was liked has been taken away),
  `wood`, `glass`, `minimal`.

Then five per-event overrides, each sitting on `auto` — "whatever the kit says"
— until one of them is wrong. Pick a kit for the character, move the one event
that is off. Every chip in both controls plays its own sound as it is picked,
because "thunk" and "glass" are not words anyone can choose between by reading.

**The two new moments are decided in the shell, not announced by an app.** That
rule is the whole reason a tenth app needs no line of audio, and it was not
traded for two more sounds: `pressVoice()` in `shell.js` reads the element under
the finger. A tick that is about to go **on** is `done`; one coming back off is
a plain `tap`, because a sound that disagrees with what happened is noise. There
are still exactly three call sites in `shell.js` and zero in every app module,
and the harness fails if either number moves.

#### The top bar, and the bottom pill

> *"the top bar still has a blur attached to it. to fix that i propose that you
> just bring all the content down a few pixels."*

Taken literally, and that is the point. "The top of the band is blurred" has now
survived `--title-px` (2.24.0), `--sat` (2.24.1), `-webkit-overflow-scrolling`
(2.25.0), the translucent status bar (2.25.1) and `--mu`'s contrast (2.26). Five
answers, four of them rendering theories, every one of them a real defect that is
staying fixed — and the sixth answer is not a sixth theory. It is a dial.

**Content offset** is 0–24px, six by default, and it is folded into `--sat`
rather than into one rule, so it moves the wordmark band *and* every sticky
sub-screen header at once. Whole pixels only, rounded in `Prefs.apply()` rather
than trusted from the store, because a fraction there would land in every
header's padding and the band's min-height — which is the exact shape of the bug
this exists to stop chasing.

> *"add options to the corner radius/height/icon size of the bottom pill"*

Three dials: **Bar height** (44–76px), **Bar corners** (0–34px) and **Tab icon
size** (14–26px). The pill was 58px tall with a 999px radius and 19px icons, all
literals — the one piece of chrome on screen on every slide had less say over
itself than a card did. `--nav-r` is a *length* rather than `--r-pill`, so one
dial spans a square bar to the pill it ships as; at the default 29px on a 58px
bar it resolves to exactly what 999px did, and an install that never touches it
looks identical. `--nav-icon` also reaches the two rules that used to override
the icon size outright (the wide breakpoint, and labels-off), as ratios of
itself, so the dial is not silently cancelled at either.

#### PLAN — patching one block instead of rewriting the day

> *"make it possible to overwrite blocks when exporting in plan… currently if i
> do that, it rewrites the schedule completely and leaves empty the other blocks.
> it even adjusts the start of the day back to what was programmed"*

`mode: patch` is a third mode in the export contract, and it is the narrow one:
write the slot lines and change nothing else on the day. `blocks` was being read
as a whole-day instruction, and fairly — it carries `start:` and `template:`, so
the day gets rebuilt around whatever was sent.

Two rules make it honest. The header repeats **the stored day's own** `start:`
and `template:` rather than the form's, so a patch cannot move the day; the four
fields stay a contract and none goes missing, but the only new information in
the description is the slot lines. And it cannot be picked for a day ROOT has no
record of: the chip is drawn, dimmed, and refuses with a word — the same shape a
slot the template does not have has. Changing the date out from under a picked
`patch` drops it back to `blocks`, out loud, the way switching to `rest` drops
the b3s.

`CAL.patch()` is the local half: the same record shape, only the named slots
written into a day that already exists, and nothing else touched — not the
start, not the template, not the notes, not the fixed rows, not the other slots.
A patched row keeps its own stored hours (the day may have been shifted by a
wake-up time since). It returns how many rows it merged, or `false` on a day
with no record, which is the refusal the chip is gated on. CAL still has no URL,
no `fetch` and no `XMLHttpRequest` in it, and the harness still checks.

> *"make it so that when i am exporting to a day that already has a schedule
> saved there is just an indicator that there already is one."*

Under the mode chips: whether the chosen day has a schedule, its template, its
start, how many blocks are filled and when it was exported. In `patch` it also
names the slots about to change — "overwrite just this block" is only worth
trusting if you can see which block — and in `blocks` it says out loud that the
day will be rebuilt around what you send, which is the thing nobody had been
told.

#### CREATE

> *"the number in the title bar changes to the total tasks in todoist for the
> curate project but does not switch back"*

Two things. The bug: the band is not part of the home screen — the shell lifts it
out — so the area chip redrew the shelf and left the last chip's number sitting
on the row. It calls `render()` now, in the listener and in the exported `area()`
alike, and there is a check on it.

The ask: on `all`, one number was three unlike things added together — songs on
the desk, mixes on the desk, and somebody else's open list. It is a **tally**
now: one number per chip, each captioned with the chip it counts, in the place
the single rolling number sat. Curate is a column exactly when curate is a chip.
Every other filter keeps the single number and its shuffle.

> *"should be able to log without being in a song/mix. sometimes i am just
> tinkering."*

A **loose session**: the same form the work screen has, on the session log, with
no work behind it. The store already allowed it — `work` has been nullable since
the migration that split songs from works — so this is a form and a row style,
not a shape change. The area is still asked, because "which of the two was I
doing" is the one thing about a loose hour worth keeping. Its row says the area
instead of a name rather than showing a dash, and it counts in the totals, the
week and LOG's note like any other hour at the desk.

> *"make the progress bars a rounded square and change it to two progress bars, a
> big one that corresponds to the stages and 1 that correspond to the steps"*

The tick strip said how far through *this stage* a work is and nothing at all
about where the stage sits on the path: a song four ticks into `idea` and one
four ticks into `master` drew the identical shape. Two bars now — the stages of
the area, lit up to and including the one it is on, then the steps of that
stage — stacked, because they are the same measurement at two scales and reading
them top-down is reading zoomed out then zoomed in. Rounded squares at `--r1`: a
segment reads as a block someone filled in, where the 1px slivers read as
hatching. A terminal stage has no step bar at all rather than an empty rail.
The rail fallback past 16 items applies to the step bar alone.

> *"add colour palette presets for the stages"*

Six ramps in the CREATE editor, one tap each: `spectrum`, `ember`, `ocean`,
`forest`, `dusk`, `mono`. Picking a stage colour is really picking six or seven
colours that have to read as a *sequence* — which is exactly what the new stage
bar draws — and doing it one `<input type=color>` at a time is choosing each
colour without seeing the others. A ramp is **sampled** across however many
stages the area has rather than cycled, so the last stage always lands on the
last colour whether the path is four stages or nine, and the area itself takes
the head of its own ramp. The swatches stay editable afterwards and nothing
records which palette was used: it is a starting point, not a mode.

`data-ed` is the editor's third verb alongside `add` and `del` — an action that
is neither, which the palettes are the first of.

#### The other half of the contract

The description is parsed by the 22:00 cloud agent, which validates `mode:`
strictly and aborts on anything it does not know — so ROOT's half alone would
have produced a task that fails on the night. `SCHEDULE-AGENT-PROMPT.md` gained
a `MODE: patch` section: compute every slot from the calendar's actual
`routine p1` and ignore `start:` entirely, archive-then-write each **named**
slot the `full` way, touch nothing else, refuse a spec that names no slots. The
grammar line, the validation line, the notification shape and the never-broken
rule about deleting were widened with it, and a new §3.4 records the one trade —
`patch` has no start-time tolerance and reports no discrepancy, because ROOT
sends back the day's own start rather than the form's.

That file is not in this repo and a commit here cannot deploy it. The routine
holds its own copy of the prompt and it has to be replaced by hand.

#### Parked, not built

Two `@idea` tasks were read and left where they are, per the protocol:

- conditions for scheduled routine, multiple dates, id two dates on the same
  day, take the latest
- bring content down: triple tap screen to bring elements down 50% to make it
  more reachable from my hands on the screen

The second is close enough to the Content offset dial to be worth saying out
loud: the dial is a persistent few pixels for every screen, and the idea is a
gesture that halves the reach on demand. They are not the same thing and the
idea is still open.

#### The harness

992 → 995 checks. The app count, the `--sat` shape, CREATE's band and progress
bars and the sound stub were all updated where 4.3 deliberately changed the
behaviour they asserted, and one of them — the number shuffling on a work being
added — was rewritten because it had been passing on a stale animation left over
from three steps earlier rather than on the thing it names. The stub gained
`createBiquadFilter`, which a real browser has had since WebAudio shipped.

---

### 4.2 — 2026-09-07 — the curate list can be ticked off, labels get their colours, and the app makes a sound

Six requests, one batch. Three of them are shapes in CREATE, two open the curate
tab up, and one is new behaviour under the whole app.

**The curate list ticks off, subtasks included.** Through 4.1 this tab was
strictly read-only, and the reasoning was written down in three files: a third
app with an opinion about the same list is how two of them end up disagreeing.
That argument does not cover the tick. A record you have gone and found is
*done*, and walking to DO to say so is the errand that ends with a list nobody
trusts. So a row now has two targets — the box on the left closes it, the body
still opens it in Todoist — and closing is the whole of what CREATE writes. It
still never moves, reschedules, renames or creates a task.

The write is `/tasks/<id>/close`, the same call DO and TEND make, and the same
one in reverse puts it back. **The tick is drawn before the call lands**, because
a list this long stops feeling answerable if every tap waits on a network; if the
call does not land, the row goes back to *exactly* what it was — the previous
state, captured, not "the opposite of now", which would open a subtask nobody
touched. A ticked row stays where it is, struck through, rather than vanishing:
a row that disappeared would take the only evidence of a mis-tap with it. It
stops being counted at once, in its group's number and in the band.

A parent carries its subtasks both ways, because Todoist does — closing a task
closes what is under it, and reopening brings them back — so the screen and the
account say the same thing until the next refetch drops the row entirely.

The invariant in ROOT.md §6 narrowed rather than went away, and so did the
harness check that holds it: there must be **exactly one** `Todoist.call(` in the
module, its path `/close` or `/reopen`, and its method the only one in the file.
A second call is now a decision someone has to make on purpose.

**Labels in their own colours, behind a switch.** `create.curate.labelColors`
draws each task's labels in the colour Todoist gives them, out of `root_labels_v1`
— the label cache DO fills and PLAN refreshes — so a label is the same colour in
every app that draws one. A colour that is not cached yet is not invented: that
label is drawn plain. The switch is in settings → create, and it is the panel's
static markup rather than a generated content editor, so `Config.subscribe` is
what redraws it.

**Three shapes.** The hours on a session row are pushed to the right edge,
right-aligned in a box with a floor width and set in tabular figures, so they
read as a column instead of ending wherever the sentence beside them stopped.
Content under a sticky header gets top padding — `.hd + .cnt` — which is the
padding DO, LEARN, LOG, PLAN and STORE already have on all four sides; the shelf
is untouched, because it has a wordmark up there and not a header. And the sort
chips, the meta chips, the stage stepper and the session kinds take `--r3`
instead of `--r-pill`: rounded squares, not pills. The dots, the rails and the
progress bar keep `--r-pill`, because a circle is not a button.

**The interface has a voice.** Three notes — a control under a finger, a slide
arriving, a message — **synthesised**, a sine through a gain envelope, none
longer than a twentieth of a second. Nothing is downloaded, so there is no asset,
no cache and no licence for a click.

It is wired in three places in `shell.js` and nowhere else: one capture-phase
`pointerdown` listener on the document that fires for anything that looks
pressable, `Shell.go` when the slide actually changes, and `Shell.toast`. No app
carries a line of it and none can end up with its own idea of what a button
sounds like — if a press should sound, it should be a control.

Two rules keep it out of the way. **Nothing exists until it is asked for**: no
`AudioContext` is constructed while the setting is off, and the first one is
built inside the gesture that plays the first note, which is the only moment a
browser allows it — one made at boot is born suspended and plays silence with no
error anywhere (§6). And **one sound per gesture**: a tab press is a pointerdown
*and* a nav, and hearing both is the difference between "smooth" and "cheap", so
a play within 55 ms of the last is dropped rather than layered.

Off by default, with a level dial beside it in behaviour — sound is the one
setting that can embarrass someone in a quiet room, which is why haptics is off
by default too.

**Verified** with `test/harness.mjs`, **930 checks, all green** (896 at 4.1.2),
34 new. The curate tick is driven through the real DOM against a scripted
Todoist: the call that goes out, the row and its two subtasks going down
together, the counts dropping, the record on disk, the reopen, a refused call put
back, and a tap with no key saved sending nothing. The sound is driven against a
stubbed `AudioContext` — nothing built while it is off, one context built inside
the first press, the second press inside the gap dropped, the next one not, a
press on a heading silent, a toast and a slide each sounding once, and a re-tap
on the tab already shown sounding not at all.

**Not looked at** — still no browser this session. The three shape fixes are
asserted as rules, not as pixels: jsdom does not lay out, so "the hours line up
in a column" is `margin-left:auto` + `text-align:right` + tabular figures being
present, and nothing more. **They want an eye on a phone.** So does the sound,
which no test can hear: what the harness proves is that the right graph is built
at the right moment and torn down to silence when it is switched off, not that
660 Hz for 32 ms is pleasant.

### 4.1.2 — 2026-09-07 — CREATE stopped existing, and two reasons why

> the tab is there but can't see anything. also the settings don't have a
> default

Both symptoms, one cause, and a second cause hiding behind it.

**CREATE was not drawing nothing. It was not there at all.** Each module is
`window.X = (function(){ … })()` with its boot at the bottom, so anything that
throws inside runs before the assignment: `window.CREATE` was `undefined`. There
is no partial app and nothing on screen to say so — the slide is empty, and
every `window.CREATE && CREATE.…` guard elsewhere quietly does nothing, which is
why the settings panel's fields were blank as well. `settings.js` fills them by
calling `CREATE.renderSettings()`.

What threw: **a curate list cached by 4.1**. 4.1 cached rows from a label query
and they had no `subs`; 4.1.1 caches project rows that do, and draws
`t.subs.length`. One undefined array in a cache that exists only to save a
network call took out an entire tab, on every install that had opened that tab
once.

`normalise()` rebuilds the cache from its known keys now, which is what its own
comment always claimed it did: every field read through a default, every array
proved to be one, subtasks lifted recursively, and a group the shape cannot
account for dropped rather than drawn half-built. Nothing is lost by dropping a
cache — the next visit fetches it again.

**And behind that, the settings field really was empty.** `create.curate` was
`{ label, maxAgeMin }` for the one version 4.1.0 was current, and a Config
override is stored **whole-branch** (§3) — so an install that had touched that
field kept the old object and `project` read as undefined the moment the key was
renamed. No chip on the strip, a blank field in Settings.

The branch is read through the shipped defaults now —
`Object.assign({}, Config.defaults(path), Config.get(path))` — which is the
merge `log.meds`, `log.medsOn` and `plan.formFields` have always used, and is
safe for the same reason: a fixed set of keys with no deletion to express, so a
missing one means "not answered" rather than "gone". The stale `label` is
dropped; a label is not a project, so there is nothing in the old value that
answers the new question.

**The fallback is on the key being absent, never on the value being falsy.** A
project that is present and empty is a *choice* — "blank switches the tab off" —
and the first version of this fix took that choice away by resurrecting the
default whenever the string was empty. The two blanks are not the same thing.

**A filter that no longer exists now falls back, the way a deleted area already
did.** This is what turned a config mismatch into a blank screen rather than a
missing chip: the strip had dropped `curate`, but the shelf's own filter still
said `curate`, so everything stayed hidden and there was nothing left on the
page to tap. `areaSel()` had that fallback for an area the editor deleted and
not for this. Anything that can be *selected* has to be able to stop existing.

**And the field says what it goes back to.** The project input carries the
shipped value as its placeholder, so an empty one reads as a choice rather than
as something missing.

**Verified** — `test/harness.mjs`, **896 checks, all green** (885 at 4.1.1), 11
new, and five of them boot a whole second window holding the exact state that
broke: an install with 4.1's cached row shape (the module survives, the list is
lifted and drawn, every row has the arrays the drawing walks, and the settings
panel fills), an install with a cached group too broken to lift (dropped, module
alive), an install with 4.1's Config override (the chip is back, the field shows
the project, the stale key is not kept), an install that blanked the project on
purpose (still off), and a shelf left on a filter that has since gone (falls
back to the shelf rather than to nothing).

Three §6 notes: a throw at boot deletes the whole app; a cache is the part of a
record whose shape changes most and is checked least; and `Config.get()` on a
branch whose shape changed hands back the old shape.

**Not looked at** — still no browser this session. But this one did not need
eyes: the failure reproduced in jsdom from a seeded record, which is what the
harness is for.

### 4.1.1 — 2026-09-06 — the glider slides, the count moves into the band, and curate is a whole project

Six things, all asked for in one message, all on CREATE.

**CURATE is the whole project now, not a label.** `create.curate.project` —
`02 | curate` — read in the order it is arranged in over there: section order,
then each task's own order inside its section, with **subtasks nested** under
the task they belong to. A section with nothing open in it is not drawn, because
an empty heading is a row of furniture saying "nothing here"; a task with no
section gets its project's own unsectioned group, which sorts first, because
that is where Todoist puts it. The project name is matched folded, the way PLAN
matches every project it sends to, so the punctuation in `02 | curate` is not
load-bearing — and the chip wears what is after the last pipe, since the number
and the pipe are how it sorts in a sidebar and neither is worth a chip's width.

Still read-only, and the harness still holds that line.

**The glider actually slides, which was a real bug.** 4.1 rewrote the rail's
`innerHTML` on every selection, so the glider was a brand-new element already at
its destination — it had nothing to transition *from*. The one element whose
entire job is to move did not move, and nothing failed. Both strips keep a
signature of their chips now and only rewrite the markup when *that* changes; a
selection moves the `.active` class and asks the glider to travel. §6 carries
it, because anything animated across a re-render can make the same mistake.

The session log's strip moved out of the body it filters into a box of its own
(`#cr-log-tabs`) for the same reason — it was being rebuilt with the sessions
under it.

**The chips are even and centred.** `flex:1 1 0` gives every chip the same share
of the rail whatever its label is, and `min-width:max-content` is the floor that
stops the share squashing a word — so four chips split the width when there is
width to split and the rail scrolls when there is not. Sized to their own text
they were four different widths with the words hard against the left of each.

DO's copy deliberately does *not* do this: it shares the title band with a
wordmark and has no width of its own to share out. That is now one of the two
places the two strips are allowed to differ, and §6 names both.

**The count moved into the band.** It was a 74px block under it — most of a
phone screen spent on one digit, on the screen whose job is to list what is on
the shelf. It is a number at the right end of the wordmark's row now, in the
same `.h-daynum` box LOG's and DAY's big day numbers live in: same size, same
shadow, and **the same shuffle**, which is what was asked for. The label above
the wordmark says what it is counting — `in progress`, or the area it is
narrowed to, or the curate project.

`Shell.dayNum` was the only thing that could do that roll, and it only knew
about dates. It is `Shell.rollNum(box, text, sort)` now, unchanged in every
other respect, and `dayNum` is one line on top of it. Three boxes, one function.

The total the hero also carried is not lost: the "Finished" fold below says how
many are done, which is the same subtraction.

**Progress is ticks, not a bar.** It was a full-width 4px rail with `1 / 7`
printed beside it on a line of its own — three shapes saying one thing, and the
widest of them carrying the least. A rail can only say *what fraction*; the
number next to it existed because the fraction was not enough.

One segment per checklist item says both at once and needs no number: how far
along, and out of how many. It is also the shape the stage strip at the top of
the shelf already uses, so the screen has one way of drawing "some of these, not
all of them" instead of two. The count is still there for a screen reader
(`aria-label="1 of 7 done"`), which is what the ratio was actually for. Past
sixteen items the segments would be thinner than the gaps between them, so it
falls back to a rail — a checklist that long is a fraction again.

The week's split bars went to the same 5px, so the two bars on that screen are
one weight rather than two. They stay continuous, because a share of the week is
a proportion and not a count of anything.

**And the band is redrawn on every screen**, not only the shelf. It belongs to
the slide — the shell lifts it out of `#s-home` at boot — and moving a work to
its finished stage happens on the work screen and changes the number.

**Verified** — `test/harness.mjs`, **885 checks, all green** (865 at 4.1), 20
new: the glider surviving a selection and being rebuilt only when the chips
change; the chips' flex; the count in the band, in the shared box, shuffling
when it changes, saying which area it counts; the progress ticks, their count,
their `aria-label` and the long fallback; and the curate tab against a stubbed
Todoist — a whole project, sections in their order, an empty section not drawn,
subtasks nested in their own order, the group count including them, the folded
project match, and a missing project saying so.

Read back through `test/peek.mjs` as well: the band, the tab strip, the curate
tab printed as an indented tree, and the progress of every row on the shelf
drawn as `█░░░`.

**Not looked at.** The browser extension was still not connected, so the glider
sliding — the one thing here that is purely an animation — has been reasoned
about and its cause fixed, but not *watched*.

### 4.1 — 2026-09-06 — the areas become a real tab strip, CREATE reaches Todoist and LOG, and clearing can be taken back

Ten Todoist tasks labelled `@claude`, one batch, one version. The eleventh was
an `@idea` and is listed at the bottom, unbuilt.

**The areas are DO's selector now, and there are four of them.** `all ·
production · mixing · curate` in one bordered rail with a sliding glider under
the live chip — the DAILY / MEDIA / OTHER control from DO, in CREATE. The
session log uses the same strip rather than the second, different one it had.
The shape is written twice, in `do.css` and in `create.css`; §6 names the pair
so a change to one is known to be a change to both.

**CURATE: the Todoist label, grouped by section.** Every open task carrying
`create.curate.label` under the section it sits in, in Todoist's own order —
project order, then section order, then the task's own order inside the section.
Three calls, not one per project. Cached in `create_v1` so the tab draws before
the network answers, refreshed behind that when it is older than the window
(a dial), and refreshable by hand.

**It reads and never writes.** CREATE does not close, move, reschedule or create
a task: closing a curate task is DO's job and filing one is PLAN's. This does
end the module's "no network at all" rule and the header, the settings panel and
§6 all say so; what replaced it is the narrower promise that is still true and
still worth protecting, and two harness checks hold it.

**A mix has no key.** `create.areas[].fields` says which of the three meta chips
an area asks for. Production asks for tempo, key and tags; mixing asks for tempo
and tags, because a DJ set's key changes every four minutes. Switching a field
off takes away the chip *and* its handler and touches nothing already written —
`log.fields`' rule, since 2.0. There is a checkbox per field in the area editor.

**The spacing, and what it actually was.** `#cr-hero` and `#cr-sorts` had rules
written for `.cr-hero` and `.cr-sorts` and neither class was in the markup, so
the shelf's big number was never centred and the sort chips were never a row
with a gap in them. Two versions of that. Fixed, and a check now asserts every
generated block on the shelf carries the class its rules are written for.
Separately, every literal pixel margin in `create.css` became a ratio of
`--dens`: the Spacing dial moved every pad on the page and left the gaps
*between* the sections where they were, so the screen got denser and looser at
once — which is the other half of what "the spacing is off" looks like.

**CREATE reaches LOG.** `CREATE.dayStats(iso)` and `CREATE.rangeStats(days)` are
synchronous readers over `create_v1`, the shape `TRACK.doneOn` and
`LEARN.dailyStats` already have. The note gains a `#### create` section on a day
with sessions — hours, sessions, the split by area, what was worked on and what
was done to it — and the parser reads it back into `d.c`. Both reports gain an
"at the desk" line and a `## create` section. LOG stores nothing of CREATE's; it
asks at note time and at report time.

**The undo pill.** Clearing is the destructive act you do on purpose and still
regret, so it does not toast any more: `Shell.undo(label, restore)` offers the
way back, on a "Undo window" dial in behaviour (default 5s; 0 pins it). Seven
modules use it — STORE's list, cart and history, PLAN's queue and sent history,
DO's day, LOG's day and its two counters, DAY's stored days, TRACK's ticks,
CREATE's shelf. It wears the title: the display face at the wordmark's weight
with the same hard offset copy behind it, and the arrow — a sprite symbol, not a
typed character — takes the same offset as a drop-shadow.

**The navigation arrows wear the title too.** LOG's date arrows and PLAN's day
stepper are the same control doing the same job, and they were thin mono glyphs
a few pixels under a heavy display wordmark. They are `800 … var(--head)` in
title ink with the title's shadow now, composed at the point of use — never
through a token that pre-resolves its colour, which is the bug 3.0.1 spent a
version on. One caveat, written into the sheet: `←` and `→` are typed
characters, so a display face without them falls back per glyph. The weight, the
ink and the shadow all land regardless — those are not the font's to refuse.

**LOG's evening: what was planned comes first.** The standing nine blocks moved
*under* the planned ones and folded away behind a tap, closed by default, opening
itself if one of them is already ticked. Most evenings are made of what was
planned; the nine were a list to scroll past.

**And the two strips stopped lighting each other.** A planned task called
"mixing" and the standing block called "mixing" are the same name, and `e.blocks`
— which is the export's shape and stays it — can only say the name is in the
list. `e.blocksPlan` is the marker that says which strip put it there. A name is
still in the record once, so ticking it on the other strip moves the light
rather than counting it twice.

**The fortnight is six charts.** Tapping the key row underneath moves to the
next; the plot still opens over the month, on every chart. The day (energy,
mood, stress), morning vs evening, sleep (hours slept and the hour you woke),
walking, output (blocks and the three curate counters) and intake (coffee,
energy drinks, meals). Every series is a field the record already holds and
nothing new is stored. **One unit per chart, always** — a shared y-axis is a
claim that two numbers are comparable, and hours are not counts — which is why
there are six rather than two crowded ones. A chart with nothing in it is
dropped from the cycle rather than shown empty. The axis is the chart's own now,
and its gridlines and its labels come from one call so they cannot disagree.

**PLAN's clipped descenders, checked again.** The 3.1.0 fix is in place — the
five boxes that hide their overflow all carry a real line-height — and there is
an invariant over the sheet now: nothing on PLAN may combine `overflow:hidden`
with a `/1` font shorthand, so a sixth box cannot bring it back. It was still
not *looked at*, so the task stays open.

**A real bug, caught by `test/peek.mjs`.** The sleep chart read a wake-up time
through a `hourOf` that already existed in `log.js` for the alert rules and
answers *minutes since midnight*. Two `function` declarations of one name is the
later one winning in silence: nothing complained, no check failed, and the chart
said the average wake-up was 441. Renamed, and there is a harness check over
every module for a duplicate declaration now — §6 carries it, because it is the
shape of mistake any file this long can make.

**Parked, not built:** "bring content down: triple tap screen to bring elements
down 50% to make it more reachable from my hands on the screen" (`@idea`).

**Verified** — `test/harness.mjs`, **865 checks, all green** (816 at 4.0), 49
new. And read back through `test/peek.mjs`: the curate tab's groups in Todoist's
order, a mix's chips beside a song's, the evening's block field in its new order
with the fold closed, and all six charts' key rows one after another — which is
what turned up the `hourOf` collision.

**Not looked at.** The browser extension was not connected in this session, so
nothing here was seen on a real screen — no version since 3.0 has shipped that
way. The tab strip's glider, the undo pill, the title-weight arrows, the folded
block field and the six charts have all been reasoned about, tested and printed,
but not *looked at*.

### 4.0 — 2026-09-06 — CREATE holds two kinds of work, and the shelf holds both

> add a mixing section for root, i'm talking a major update new tab. you did a
> good job with create. i think it would be good if you also changed the "in
> flight" text and actually redo the home page.
>
> — and then, on being asked what MIX should be: *mix is for dj mixing not
> actual track mixing, that's production* · *i want to be able to log my
> sessions when mixing, what i did, how much time, make it function like
> CREATE. but now that i think of it could be just a slide in "CREATE"
> something unified maybe a combined view and then a per area view*

**Not a tenth tab.** The brief started as one and changed inside the same
message, which is the better answer and is the one built. A DJ set and a song
are the same object: a thing that sits on a stage, gets asked a checklist by
that stage, and eats hours at a desk. Two tabs running that machine twice would
have been two shelves, two session logs and two answers to "what am I working
on" — and the second one is a question with only one true answer.

So CREATE holds **areas**. `production` is the songs being made; `mixing` is the
DJ sets being built. An area is its name, its colour, the noun for one of its
things, the stages it walks and the words its sessions are called — and that is
the whole of it. Nothing in `create.js` is written for two of them: it walks
`AREAS`, whatever is in it, and a harness check greps the module for the string
`production` or `mixing` and fails if either appears outside a comment. A third
area is a block in Config and no code at all.

#### mixing

Five stages, and they are a DJ's, not a mix engineer's: **crate** (tracks
pulled, keys and tempos written down, the ones that do not fit cut, something in
it you have not played), **order** (opener chosen, the arc drawn, the peak
placed, the way out written), **drill** (every transition tried once, cue points
set, the hard one drilled, played end to end), **record**, and **played**, which
is its terminal stage. Its session chips are *digging · practice · recording ·
playing out · listening back*.

*The word that had to move.* Production's fourth stage was called `mix`, which
next to an area called mixing reads as the same thing and is the exact confusion
this version exists to remove. Its label is **mixdown** now. Its key is still
`mix`, because every tick ever filed is filed under it, and §6 says so in as
many words so nobody tidies it back.

#### the home page, redone

One shelf, with the areas as its filter — the "combined view and then a per
area view" the brief asked for, done as one screen rather than three.

- A pill per area with `all` in front of them. `all` is the default and the
  point: what is on the desk is one question.
- **One stage strip per area on screen.** On `all` that is both of them, one
  under the other — two shapes in one glance, which is the thing a combined
  view is *for* and the thing two tabs could never have done.
- The list is every area's work together, each row wearing a dot in its area's
  colour in front of its name. The rail down its left edge stays the *stage's*
  colour: on a shelf of things at different points, the stage is what you scan
  for.
- **One add button per area on screen**, so starting a mix is never something
  you change screens to do.
- The week's hours are split by area underneath the three tiles — hours only,
  because three numbers per area is a table and a glance at the week is not a
  table. The bars are relative to the biggest of them rather than to the total:
  the question is which of the two got the time, and a pair of slivers against a
  24-hour scale answers nothing.
- The session log carries the same filter, and totals per area. "Where did the
  week go" now has an answer with two halves.
- Picking an area is remembered, because it is where you were working.

**"In flight" is gone**, and not only from the heading it was a heading for: it
was CREATE's name for work that was not released and it never said anything the
plain word does not. It is **in progress**, the fold is **finished** rather than
**released**, and a harness check greps the module, the sheet and the markup so
it cannot creep back in.

#### what a v1 shelf becomes

A record written before this version is a list of `songs` whose ticks are filed
under `stageKey|item` — there was only one area to file them under. `normalise()`
lifts both: every song becomes a work in the first area, and every tick key
gains its area segment. Nothing is unticked by upgrading and nothing is thrown
away.

It runs in the **reader**, not behind a repair flag, because reading is
idempotent and a migration that runs on read cannot be skipped by an install
that never opens Settings — and `load()` writes the lifted record straight back
so the old shape does not sit on disk for as long as the shelf goes untouched.

*The one real bug in this version, caught by its own test.* The lift read the
shape off the object already merged onto `blank()`. `blank()` supplies an empty
`works`, so the question "does this record have a `works`?" always answered yes,
and a v1 shelf was read as an empty v2 one — which is to say, silently deleted.
§6 carries it, because it is the shape of mistake any future migration in this
codebase can make.

#### the editor

`create.stages` and `create.sessionKinds` are gone; there is one editor,
`create.areas`, and it edits a tree: an area's name, colour, singular and
plural, its session chips, and then its stages nested inside it. Two editors
would have meant picking which area you were editing in one panel in order to
see its stages in another. `+ add a stage` carries the area whose button it is;
the button at the bottom adds a whole area. The last area cannot be deleted —
a shelf with nowhere to put anything is not a state the app can draw.

Search reaches the whole tree, and every row says which area it belongs to,
because a stage label is ambiguous across areas by design.

#### a second thing in `test/`

`test/peek.mjs` prints a screen as words: what is on it, in what order, and
what it reads like. jsdom has no layout, so it cannot say whether anything is
the right size — it answers the half of "did that come out right" that does not
need eyes, which is the half you still have when there is no browser. It is what
caught `mix` sitting next to `mixing` on a row.

**Verified** — `test/harness.mjs`, **816 checks, all green**, 44 new across
CREATE: two areas out of Config with a terminal stage each; mixing being a DJ
set and not a mixdown; a tick filed under all three segments and surviving a
reorder; a session carrying its work's area; the area's own session chips; the
combined shelf drawing both areas, one strip each, one add button each; the
filter narrowing list, strip and button together and being remembered; a work
whose stage *or whole area* was deleted falling back without throwing; the log's
filter and its empty state; the v1 lift, its tick keys, its sessions and its
write-back; the editor's tree, its per-area add, its terminal hand-off, its
whole-area add and its refusal to delete the last one; an area colour being one
variable rather than a rule per area; and "in flight" being gone from all three
files. Also read back through `test/peek.mjs`: the combined shelf, the shelf
narrowed to mixing, one mix, and the session log.

**Not looked at.** The browser was not available in this session, so nothing
here was seen on a real screen — no version since 3.0 has shipped that way, and
the area pills, the stacked strips, the paired add buttons and the week's split
bars are all new shapes that have been read but not *looked at*.

### 3.1 — 2026-09-06 — the finish time moves onto its row, and the tab bar gets three dials

> text in section boxes is clipped at the bottom · when a task is completed, the
> completed time overlaps the scheduled tat name. fix that. · tasks completed on
> the schedule should have their completed time / name on the schedule · add more
> colour palette options for tab icon logos (in the pill/bottom bar). also add
> options for the shape of the circle around selected tabs. also animation options.

**PLAN's boxes were cutting the tails off their own text.** Every box on that
screen hides its overflow, which is what keeps a long section name from pushing
its row wider than the grid it sits in. Set against `line-height:1` that clip
lands on the baseline, so the descender of a g, p, y or q was sliced off flat at
the bottom of the box: the row fitted, the word inside it did not. The five
elements that hide their overflow carry a real line-height now — the section
row and its count, the project tile's name, the open project's heading and the
date stepper's two lines. Nothing got taller for it, because the height of those
rows was never the text: they are sized by `min-height: var(--tile-h)` and their
own padding, and the tallest of the five now measures 34.8px inside a 46px row.

This is the same defect as 3.0.4's clipped day number, arriving from the other
direction — there a box was trimmed under text that still laid out in full line
boxes, here the text was trimmed under a box that was already the right size.
Both are `overflow:hidden` cutting an axis nobody was thinking about.

**A completion is written on its row now, not floated across it.** 3.0.4 drew
every completion as a mark at the minute it happened. For a task ticked off the
day itself that minute is, almost by definition, *inside its own row* — so the
dot, the time and the name printed straight over the name already sitting
there, and the one row you had just finished was the one row you could no longer
read. The two requests above are one change read from both ends: the collision
is the bug, and the answer is not to drop the time but to put it where it
belongs.

So a completion that matches a row on the day is stamped **into that row**: the
time, in the completion green with the same small dot the floating mark wears,
on the row's meta line beside what the row already says it is. Same fact, in the
place that already names it, with nothing left to collide with — and a row
carrying its own finish time is what "when did I actually get that done" was
asking in the first place. The meta line is a flex row rather than one clipped
box, so what the row *is* shrinks and ellipses while the time never does: four
characters, and half a time is not a time.

Matched by name, newest first, one mark to a row — the same routine finished
twice is still two things that happened, and two rows of that name take one each
rather than both claiming the later time.

*What still floats.* A completion with no row of its own: a block ticked on DO,
a `@quick` card, anything finished that the day was not drawing. Those are the
ones the rail was always for, and they by definition cross a row that is about
something else — so the mark is a **band** now rather than loose words. It used
to be `height:0` with each chip carrying its own background, which meant the
row's text showed through the gaps between them and read as two things printed
on top of each other. It is 13px of the page's own ground, centred on the
minute, with a hairline in the completion colour along its top edge: a note
written *across* the day rather than words dropped onto it.

**The mark around the selected tab is three dials, in appearance → layout →
Navigation.** *Selected tab* — pill (what it has always been), rounded, square,
circle, ring, underline. *How it arrives* — grow, pop, fade, rise, none. *Tab
palette* — app (the hues it already had), warm, cool, candy, neon, mono. All
three default to exactly what the bar looked like yesterday.

*One drawing, eight variables.* The indicator is drawn once, in `shell.css`,
from `--tab-c`, `--tab-ink`, `--tab-r`, `--tab-t`, `--tab-s0`, `--tab-y0`,
`--tab-dur` and `--tab-ease`. Every option is a value swapped into those, so
adding a palette is ten custom properties and adding a shape is one rule —
`shell.css` never learns which shape or which palette won. That is §4's rule
about tokens rather than literals, applied to a component that had grown
eighteen literal declarations.

*mono is the interesting one.* Colour-coding without colour: a nine-step ramp
cut from `--tx` with `color-mix`, so the tabs still differ — by weight rather
than by hue — and it is the one palette as legible on a light theme as at night.
Its `--tab-on-c` is `var(--bg)`, so it flips with the theme rather than being a
hex that happens to work on one of them.

*A bug found on the way.* An alerting tab is supposed to wear the warning
colour, and with colour-coding on it did not — it alerted in its own app hue,
which is the one moment its own hue is not what the bar is trying to say. The
palette claimed `background` on `::before` from a selector naming one app in one
bar, which outweighs `.tab-b.has-alert` and always will; no amount of
re-weighting the alert fixes that. The palette writes `--tab-app-c` instead and
`--tab-c` falls back to it, so the two stopped competing: the palette answers
"what colour is this app", the alert answers "what colour is this mark", and the
mark is drawn from the second. It also means the warning reaches ring and
underline, which draw their colour as a border rather than a fill.

*Two shapes do not survive the side rail.* On a wide window a tab is a wide box,
not an icon-sized square — a 50% radius on one is an ellipse, and an underline
is a rule down the middle of nothing. Circle and underline fall back to the box
the other four already are above 880px; ring is the outline of whatever box it
is given and needs nothing. `none` answers the "keep the bar moving" exception
with its own `!important`, or the one option that asks for stillness would be
the one option that could not have it.

**Verified** — `test/harness.mjs`, **791 checks, all green**, 17 new: the
descenders and that the rows did not grow for them; the stamp on its row and no
floating mark for it; the band for one that has no row; the eight variables; all
six shapes present and the two that fall back on the rail; all five animations
and `none`'s `!important`; every palette defining all ten properties; mono
carrying no hex at all; the three controls on the layout panel and in the
appearance reset; and the alert outranking the palette.

**Not looked at.** The browser was not available in this session, so unlike
every version since 3.0 nothing here was seen on a real screen. Everything above
is verified at the source and DOM level and nowhere else. That matters most for
the PLAN clip: a descender being cut off is a thing you can only *see*, so its
Todoist task is left open for Hugo to confirm rather than closed on a
line-height that ought to be enough.

### 3.0.4 — 2026-09-06 — nothing is cut any more, and the day records what was finished

Two regressions from 3.0.3, and a feature.

**The day number and the counter were being cut off, top and bottom.** 3.0.3
trimmed those boxes to their cap height for layout — but their children still lay
out in full line boxes, and both boxes carry `overflow:hidden`, which clips *both*
axes. Measured in Chrome: 9.4px off the top of the day number and 10px off the
bottom of the counter's digits. The clip either one actually wanted is
horizontal — a digit slides sideways out of the day number, and a long total must
not run into the wordmark — so both are `clip-path:inset(-100% 0)` now:
unbounded top and bottom, cut at the box edges left and right. §6 carries the
rule, because anything that trims a box it also clips will hit this.

**A completed task now leaves a mark on the calendar, at the minute it was
finished.** A green dot on the rail, the time, and the name.

*Why it is not a row.* Everything else on DAY is the day as it was **planned**;
a mark is the day as it **happened**. Keeping the two visually distinct is the
whole point — §6 has said since 2.23 that a drawing which quietly claims to be
the plan is the one thing this app must not be. So marks are stored beside
`days` rather than inside one, and drawn over the rows rather than among them.

*Who can leave one.* Anything that finishes a task: DAY's own rows, DO's block
tiles and DO's today list. DO's two calls sit next to the `LOG.setBlock` and
`TEND.setDone` calls already there, are optimistic like the tick itself, and are
taken back if Todoist refuses. Unticking removes the mark — the newest one of
that name, not all of them, because the same routine finished twice in a day is
two things that happened.

*Only today can take one*, because a completion has a clock time by virtue of
happening now. And a mark on a day that was never exported is kept but has
nothing to be drawn on until one is; it is not thrown away for it.

*Two things the first version got wrong, both caught by looking at it.* Marks
drawn one per completion landed on the same pixel when two things were ticked in
the same minute and printed over each other — they are grouped by minute and
their names joined. And the mark sat exactly on top of the now line's badge,
because today is the only day either of them appears on — it is inset past the
time column and the badge on the left, and past the row's controls on the right,
from measurements rather than guesses.

**Verified** — `test/harness.mjs`, **774 checks, all green**, 9 new; and in
headless Chrome: the `6` on LOG and the `3` on STORE's total drawn whole, a tick
on DAY leaving a mark at the right y, two completions in one minute drawn as one
mark, and screenshots of all three looked at.

### 3.0.3 — 2026-09-06 — the bands centre on their ink, and the counter travels

> center the elements in the sticky titles on every tab … there is a big gap
> between the title card and the calculator … also add the slide right/left
> animation that the titles / dates have. add it to the counter.

Measured in Chrome before touching anything, which turned up **two** causes for
one gap.

**The titles were centring their line boxes, not their letters.** A wordmark is
all caps, and caps in a `line-height:1` box leave the descender space empty
underneath: `STORE.` is 35.1px of ink in a 54px box. The band had no slack to
redistribute either — 14 top + 82 content + 12 bottom was exactly its 108px
floor — so `justify-content:flex-end` had nothing to do and all of that empty
space sat under the title. The titles now carry
`text-box:trim-both cap alphabetic` so their boxes *are* the caps, the band is
`justify-content:center`, and the floor is measured in the trimmed title. Every
band went from 108px to 94px, and what is centred is what you can see.

**And STORE was adding a second gap under its own band.** §6 has said since 2.19
that the gap under the band is the shell's and an app must not add to it — the
rule zeroes the first child's top *margin*, and STORE's `.cnt` was *padding*, on
all four sides. Every other app's `.cnt` is horizontal padding only. So the
counter widget sat 18px from the shell plus 18px of STORE's own: the gap between
the title card and the calculator, exactly as reported. Wordmark to widget is
32px now rather than 56px.

**One row height for every band.** Trimming the wordmark had a consequence worth
naming: DO's tab rail is 40px once its border and density-scaled padding are
counted, and the moment the title stopped being 54px that rail became the tallest
thing in the row and made DO's band 2px taller than the other nine. One band
shape for every app is what makes the title morph read as one title being pushed
along, so the row is now `max(--band-row, trimmed title)` everywhere and DO's
rail is pinned to `--band-row`. All ten bands are 94px at every title size.

**The counter travels with the titles.** `.h-cost` joins `.h-logo`, `.hd-title`
and `.h-daynum` in the morph: it slides in from the side you are moving towards
and the outgoing one leaves the other way, instead of appearing where the last
one left. Reduced motion takes it off with the rest.

**Verified** — `test/harness.mjs`, **765 checks, all green**, 8 new; and measured
in headless Chrome rather than argued from the stylesheet:

```
before   every band 108px   ink 8.5px above the bottom padding   store: 18+18 under the band
after    every band  94px   content centred, ink trimmed          store: 18
         wordmark sits at the same y on all ten tabs
         .h-cost animation: title-out leaving, title-in entering
```

One of the new checks was written with `[\s\S]*?` and passed against the wrong
rule three lines further down — the trap §6 already warns about, caught here by
the check failing rather than by luck. All five in this batch are bounded with
`[^}]` now.

### 3.0.2 — 2026-09-06 — the total says which way it went, with a sign

> replace the green/red animation to a + or - that appear for increase/decrease. in "store"

**The colour is gone.** The running total went green on a rise and red on a fall;
it now puts a `+` or a `−` at its head for a moment instead. Colour asked the eye
to decode a hue into a direction — on a number that already carries the accent in
its shadow, and against a palette the theme picker can move out from under it. A
sign does not need decoding and cannot collide with a theme.

**Where it goes.** At the head of the number, `display:none` between changes so
it reserves nothing on a band that has none to spare. The counter has the right
end of the row to itself (`justify-content:space-between`), so when the sign
appears the box grows *leftwards* and the digits stay where they are — measured:
the box gained exactly the sign's 28.4px and the number did not move.

**What it wears.** What the number wears — title colour, accent shadow. Its job
is done by appearing, not by being another colour, and 3.0.1 had just finished
taking the last two inversions out of this band.

**Its life is one animation.** It turns in like one of the digit cells, holds
while the total is read, and fades. `−` is U+2212, the typographic minus, which
is a digit wide in tabular figures rather than the stubby hyphen.

**The nudge stays.** A fraction of a millimetre up on a rise and down on a fall.
It is not a colour, it says the same thing the sign says, and it was already
there — easy to drop if it is one signal too many.

**Verified** — `test/harness.mjs`, 757 checks, all green (7 rewritten from the
green/red flash, 5 new), and driven in headless Chrome: `+` on a rise, `−` on a
fall, gone at rest, nothing green or red left in the counter's rules.

**Found on the way, and still open: the pinned total does not fit.** At 412px
the wordmark takes 326px of a 376px row and the counter gets 36px for 267px of
content — 231px cut off, at every title size. It is a 2.25.1 defect, not a new
one, but it means this sign is largely unseeable until it is dealt with, and
dealing with it means making the wordmark or the number materially smaller while
the counter is pinned. That is a look rather than a fix, so it is Hugo's to
choose. §6 carries the measurement.

### 3.0.1 — 2026-09-06 — the title shadow was never overridable, and both "fixes" proved it

Hugo, for the third time: *"the dot is still not fixed. same with the animation
for the store total, the shadow is still staying red it needs to be accent
shadow, title text colour it's not hard to understand."*

He was right three times, and the reason all three attempts failed is one line
in `tokens.css`.

**`--title-sh` baked its colour at `:root`.** It was
`var(--title-sh-x) 0 0 var(--title-sh-c)`, declared on `:root` — and a custom
property's own `var()` references are substituted when *it* is computed, on the
element it is declared on. So `var(--title-sh-c)` resolved to the accent *there*,
and every element below inherited a finished string with nothing left in it to
override. **Every `--title-sh-c` override in the app was doing nothing**: the
wordmark's dot, STORE's currency mark, and the green/red flash on the total.

Lengths are the opposite — they stay lazy and resolve against whoever uses them —
so the offset *was* correctly 3px on the 54px wordmark and 1px on the 0.4em
currency mark. Half of it worked, which is why nobody caught the other half for
five versions.

The shadow is composed at the point of use now —
`text-shadow:var(--title-sh-x) 0 0 var(--title-sh-c)` — in all twelve places
that wear it. There is no composed token to reach for, and a check fails if one
comes back.

**The dot is the word.** Title text colour, accent shadow, exactly like the
letters in front of it. 2.26.2 and 3.0 both tried to make it the *inverse* of
the word — accent glyph, title-coloured shadow — and 3.0 finally succeeded at
applying an effect nobody had asked for, which is how it ended up further from
what was wanted than the version that did nothing. The rule for it is deleted
from `shell.css` and the `color:var(--y)` is deleted from all ten app sheets:
it inherits both now, and there is nothing left to invert.

**STORE's total is one signal again.** With the token fixed, the digits, the
decimal point, the shadow and the currency mark all move to green or red
together and ease back together — measured in Chrome, not inferred: during a
change every one of them reports the same `rgb()`, and the shadow tracks the
text frame for frame. The currency mark also stops being the inverse of the
number beside it, for the same reason the dot did.

**Measured, not argued.** 3.0 shipped two shadow fixes reasoned entirely from
the stylesheet, because jsdom does not cascade and a regex on a CSS file will
cheerfully assert the half that does nothing. This one was found by launching
headless Chrome over the devtools protocol and reading `getComputedStyle` off
the real page — sixty lines, node's global `WebSocket`, nothing installed. The
before/after is unambiguous:

```
before   dot   color rgb(167,139,250)  shadow rgb(167,139,250)   <- accent on accent
after    dot   color rgb(222,222,222)  shadow rgb(167,139,250)   <- title on accent
before   total color mid-red           shadow rgb(167,139,250)   <- shadow never moved
after    total color mid-red           shadow mid-red            <- linked
```

§6 carries both lessons: what a custom property bakes and when, and to go and
measure a visual fix rather than read the stylesheet again.

**Verified** — `test/harness.mjs`, 755 checks, all green; the nine checks that
had been asserting the old token were rewritten to assert the behaviour, plus
two new guards (nothing reaches for `var(--title-sh)`, and no sheet paints the
dot). And this time, looked at: the wordmark rendered at 3× in Chrome.

### 3.0 — 2026-09-06 — CREATE, and two things that were the same mistake twice

A ninth app, and two fixes that turned out to share a root cause.

---

#### CREATE — the songs being made

A tenth tab. The brief was one line — *"new tab CREATE for music production and
mixing, do what you think is best first then we will adjust"* — so the shape of
it is a decision, and this is the decision:

**A song sits on a stage, a stage asks a checklist of it, and every hour at the
desk is written down.** Three screens — the shelf, one song, the session log —
and no network at all.

*Why that and not a task list.* ROOT already has four ways to track work that is
due, and none of them fit a song: a song has no date, it is never late, and
having six of them open at once is the normal state of the craft rather than a
backlog to clear. What is actually hard to hold in your head is **which of them
is at which point**, and what "mix" means at four in the morning when you have
already listened to it two hundred times. So the stage is the state, and the
checklist is the app remembering the discipline you are too close to the track
to remember. Nothing here is due, nothing badges the tab, and nothing is ever
overdue.

*What is Config's.* The stages, their colours and their checklists — the whole
path a song walks is editable from Settings → create, including adding stages
and rewriting every list. The module holds no list of its own; the strip on the
shelf, the stepper and the checklist are all drawn from Config, so a stage added
in the editor needs no code and no CSS.

*What is the app's.* The songs, their ticks, their notes and every session, in
`create_v1`.

**Identities, and the one trade.** A stage's `key` is what a song's stage and
every one of its ticks is filed under, so it is shown in the editor and never
edited. A tick is filed under `stageKey|item text`: reordering a checklist keeps
every tick, rewording a line drops that one line's. A key column in the editor
would have protected the rename, and it would have been worse to live with than
the thing it protects — the same call DO's routine items already make.

The finished stage is found by `terminal`, never by its key or its position, so
"released" can be renamed to anything and the shelf still knows where a song
stops. Delete the row carrying it and the last stage inherits it, because a
shelf with no way to finish a song is not a shelf.

**The shelf.** How many songs are in flight, a strip of one segment per stage as
wide as the songs sitting on it, the songs themselves (sorted by last worked on,
by stage, or by name), and the last seven days' hours. Released songs are behind
a fold: a good thing to have and a bad thing to scroll past every time.

**One song.** Its tempo, key and tags as chips that open the app's own dialog;
the stage stepper; that stage's checklist; notes saved as you type; and the log
form — hours through the numpad's `duration` kind (130 is 1h30), a word about
what you did, and the session kinds as chips that fill the field rather than
replacing it.

**The session log.** Every session, newest first, under the day it happened on,
with the week and the all-time totals.

*Wired the way §7 says and nowhere else:* a slide whose `#s-home` starts with a
`.h-top`, `css/create.css` scoped to `.ns-create`, `Shell.register('create')`, a
`.tab-b` and a `tab-create` sprite symbol, `'create'` in `Prefs.APPS`, a settings
panel ending in its content box, `SET.PANELS` / `CATS.apps` / `SEG_NAMES` /
`RENDERERS` / `APP_NAMES` / `APP_HINTS` / `GROUPS`, two `EDITORS` entries, and
two `CONTENT` rows plus a `search` hook so both the stages and the songs are
findable. The `appsSeen` migration carries it onto an install that already has
an app list, which is the trap CAL walked into and there is a check for.

*The icon is a waveform — five bars and nothing else.* A fader would have been
the settings sliders again; the harness takes a signature of each `tab-*`
symbol's shapes and fails on a repeat, and five bars is a shape no other tab
icon is built from.

---

#### The dot's shadow, properly this time

2.26.2 said the dot after a wordmark takes the title colour as its shadow. It
did not. `.h-logo em{--title-sh-c:var(--tx)}` was the whole fix, on the
reasoning that `text-shadow` is inherited so restating the colour was enough.

**A `var()` is substituted on the declaration that uses it, on the element that
declaration applies to.** `.h-logo`'s `text-shadow` had already resolved to the
accent; what the dot inherited was that finished value, with no custom property
left in it to override. So the dot went on wearing an accent shadow behind an
accent glyph — not a shadow, just a slightly fatter dot, which is the exact
non-effect 2.26.2 was written to remove. Two versions of it.

The rule re-declares `text-shadow` beside the property now. STORE's counter and
its currency mark have always done both, which is why those two worked and this
one did not, and §6 now says so in the general form: anything that re-points
`--title-sh-c` owes itself a `text-shadow`.

**The check that passed was reading the custom property alone.** jsdom does not
cascade, so a regex on the stylesheet is all there is — and this one asserted
the half that was there rather than the half that made it work. It reads the
declaration beside it now.

---

#### STORE's total: one signal, one speed, and a board

Same root cause, one level along. The counter was rebuilt with an
`innerHTML =` on every repaint, which threw the currency mark away and built a
new one. **A replaced element has no previous computed value, so it cannot
transition:** the digits eased into green over `--dur-3` while the mark *snapped*
to it. One signal arriving twice, at two speeds, which is what reads as a
rendering fault rather than as a total going up.

The number is cells now — one per character, the decimal point included — and
they are updated in place; the mark is moved across a rebuild rather than
recreated. The cells declare no colour and no shadow of their own on purpose: an
inherited value follows the parent's transition frame by frame, so the digits,
the point and the shadow move with `.h-cost` for free and cannot drift from it.
The mark is the single exception, because it is deliberately the other colour,
and it carries a matching transition so it arrives with them rather than after.

**And the cards turn over.** A character that changes flips in from the top edge
in a short perspective, each cell a beat behind the one to its left — a
departure board. Only the characters that actually changed get it, so 4.50 →
4.90 turns one card rather than four, which is what makes a board read as fast
as it does. It rides `--mo` like every other animation, so "no motion" stops it
dead. Arriving is still not a change: pinning the counter mid-trip mounts, and
the cells do not also flip — two entrances at once is neither.

---

#### Also

**The colour-coded tab list had no entry for DAY.** Adding CREATE's meant
writing the line next to the gap; DAY was the only app whose pill fell back to
nothing with colour-coded tabs on. One line, and called out here because it was
not asked for.

**A harness check failed for one hour every night.** DAY's now-line fixture
built its day from `hour - 1` modulo 24, so between 00:00 and 00:59 it wrote a
day starting at 23:00 — an hour before the date it was filed under — and then
asked CAL where midnight fell in a day that had not started. CAL was right both
times; the fixture was wrong. The window slides to fit now instead of wrapping,
and what it expects moves with it. Found by running the suite at 00:14.

---

**Verified** — `test/harness.mjs`, **755 checks, all green**, 31 new: CREATE's
wiring, its Config-driven stages and checklists, the tick that survives a
reorder, a stage deleted from under a song, the session log, the released fold,
the delete that takes its sessions with it, both content editors, the terminal
flag surviving an edit; the dot's re-declared shadow; and the counter's
surviving mark, its cells, and the flip that only touches what changed.

**Not verified by eye.** jsdom does not lay out or paint, and the browser
extension was not connected this session, so nothing here has been seen on a
screen: CREATE's whole appearance, the dot's shadow, and the flip board are
argued from the stylesheet rather than looked at. The three Todoist tasks are
completed because each was built and is covered by checks; if any of it looks
wrong on the phone, that is the adjusting the CREATE task already said would
come.

### 2.26.2 — 2026-09-05 — the shadow stops clipping, the dot inverts, QUICK gets its heading back

Four adjustments to the title shadow, three of them things the last two releases
put there.

**The shadow needs room, so the offset is its own token.** `--title-sh-x`.
`.h-daynum` has to clip — that is what stops a number on its way out making the
row taller — and the shadow is the one part of the glyph that sticks out to the
right, so it was the part being cut off. The box is now a shadow-width wider and
the digits sit a shadow-width off its right edge. STORE's total reserves the
same. One value, so the reservation cannot drift from the thing it reserves for.

**The dot after a wordmark is the inverse of the word.** `DO<em>.</em>` — the
word is title-coloured with an accent shadow, so the dot, already the accent,
was an accent shape behind an accent shape: not a shadow, just a slightly fatter
dot. It takes the title colour as its shadow and keeps the accent as its own
colour, which reads as the same treatment seen from the other side.

**STORE's total flashes as one object.** The `€` sat at a fixed accent while the
digits went green and red, and half a number changing colour reads as a
rendering fault rather than as a signal. The mark and both shadows go with it
now. It also gained the shadow it had been opted out of: that exemption existed
because at `.4em` the un-rounded `.055em` came out sub-pixel and doubled into
mush, and with 2.26.1's whole-pixel offset there is nothing left to avoid. Like
the wordmark's dot, it wears it inverted.

**DO's QUICK heading had been wearing a task row's font.** Not a shadow, despite
appearances. `.tt-name` was declared twice in `do.css` — once for QUICK's fold
button and once, later and at the same specificity, for a task row's name
(12.5px mono in the foreground colour). The row's rule won every time, so QUICK
was set in a task row's type while BLOCKS, TODAY and MEDIA used the head's own
10px letter-spaced accent caps. The two names had nothing to do with each other
and only ever collided; the fold button is `.tt-fold` now, and a check fails if
`.tt-name` is ever declared twice again.

**Parked, not built:** the triple-tap reachability idea (`@idea`).

**Verified** — `test/harness.mjs`, **720 checks, all green** (713 at 2.26.1).
New coverage: the offset as its own token with its floor and fallback; the
daynum reserving it and offsetting its digits by it; the inverted dot; the
inverted currency mark; the whole unit flashing together; the total reserving
its own shadow; `.tt-name` declared exactly once; QUICK's heading inheriting the
head's type; and no section head carrying a shadow at all.

### 2.26.1 — 2026-09-05 — the shadow was the blur, and the fold was the other one

Both of 2.26.0's regressions, and the wordmark it forgot.

**The shadow was a sub-pixel smear.** `--title-sh` was `.055em`, which is 2.97px
on the 54px wordmark — a proper offset copy — and **0.825px on a 15px sticky
title**. A glyph copied less than a pixel sideways is not a shadow; it is the
same glyph drawn twice, half a pixel apart, which is the textbook way to make
text look out of focus. 2.26.0 put that on every sticky title in the app and
called it a treatment.

It is `max(1px, round(.055em, 1px))` now: a whole pixel at every size it is used
at, 1px on a sticky title and 3px on a wordmark, with a plain `1px` fallback for
a browser without `round()`.

**And the fold was the other regression.** 2.26.0 retired Interface scale
because document zoom put the whole page on fractional pixels — then folded the
stored scale into **Spacing**, which multiplies every padding and gap in the app
(`calc(18px * var(--dens))`). At 1.1 an 18px padding becomes 19.8px, every box
below it starts on a fractional offset, and the text inside it sits on a
fractional baseline. That is *the same defect, moved from one multiplier to
another* — and worse than the original, because the dial that could be put back
to 100% no longer existed.

The scale is dropped now rather than folded, and an install that 2.26.0 folded
is repaired: Spacing goes back to its default once, recorded in `densRepair` so
it happens once and never touches a Spacing chosen afterwards. The Spacing dial
carries a note saying what it does to text at anything but 100%, because it has
always had this property and nothing had ever said so.

**The wordmarks wear the shadow.** 2.26.0 put it on the sticky sub-screen
headers and the big dates and left out the one thing in the app most obviously a
title — `DO.`, `STORE.`, `LOG.` Set once in shell.css with the rest of the
band's shared shape, not in eight app sheets.

**Verified** — `test/harness.mjs`, **713 checks, all green** (710 at 2.26.0).
New coverage: the shadow offset rounded with a 1px floor and a fallback; the
wordmark wearing it; a stored scale dropped rather than folded; the repair
recorded so it runs once; a Spacing chosen after the repair left alone; and no
control for the repair flag, which is a record and not a setting.

### 2.26 — 2026-09-05 — the blur was `zoom`, and the shadow goes on every title

**It was Interface scale.** `html{zoom:var(--ui-scale)}`. Hugo found it by
moving the dial.

Document zoom multiplies every length in the page by a fraction. The app's type
is written in whole pixels — 8, 9, 9.5, 10, 11.5, 15, 54 — so at any scale but 1
every one of those becomes a fraction, and a fraction of a CSS pixel is a
fraction of a device pixel at any DPR. The glyphs are then resampled rather than
drawn, worst on the smallest type: which is exactly why it showed on the band's
10px date line and not on the 54px wordmark beside it, and why it was identical
on every theme, every screen and every build.

That last part is what four releases failed to read. Snapping the wordmark
(2.24.0), snapping the safe-area inset (2.24.1), taking the scroller off iOS's
legacy compositing path (2.25.0) and handing the status bar back to iOS (2.25.1)
each fixed a real defect and **none of them could have changed this**, because a
document-wide zoom sits above all of them. Four fixes that changed nothing were
four pieces of evidence pointing at a cause that applied to the whole document,
and the search stayed local instead.

**The dial is gone rather than tuned**, because no arrangement of steps is
sharp: for a 9.5px label to land whole at 3× DPR the scale would have to be a
multiple of ⅔, which is not a dial. What it was for is already covered by three
controls that are whole-pixel by construction — **Spacing**, **Title size** and
**Sub-screen title size**. An install that had moved it keeps the size it chose:
the stored scale is folded into Spacing on first load, clamped to Spacing's
range, and the key is deleted so it can never be applied twice. `tokens.css`
carries the whole story so nobody re-adds it.

**The title shadow is a shared treatment now.** It started on STORE's running
total in 2.25.1 and is one token (`--title-sh`) from here on, worn by every
sticky sub-screen title and by the big dates on LOG and DAY. Three copies of the
same offset in three stylesheets is three chances for them to drift.

**STORE's total is the wordmark's own size** — `min(--title-px, 14vw)`, so it
matches `STORE.` exactly at the default and only gives way at the title sizes
where it genuinely would not fit. Its currency mark reads in the accent.

**LOG's caffeine counters had a frozen accent.** The label under a selected
coffee or energy drink was `rgba(167,139,250,.6)` — VOID's violet, written in as
a literal — so on every other preset it stayed violet while its own border and
number had already gone to the theme's colour. It takes `var(--y)` now, the same
shape the currency counters two rules below had always used.

**Parked, not built:** the triple-tap reachability idea (`@idea`).

**Verified** — `test/harness.mjs`, **710 checks, all green** (698 at 2.25.2),
braces balanced, every touched module parsed, site served over http. New
coverage: no zoom and no `--ui-scale` anywhere; the dial gone from the schema,
the panel and the reset list; the three replacement dials present; a stored
scale folded into Spacing, folded *once*, and clamped; the shadow token and
every title and date wearing it; the total at the wordmark's size with an accent
currency mark; and no hardcoded violet left in LOG's rules.

### 2.25.2 — 2026-09-05 — the blur was the contrast

**It was never a rendering artefact.** `--mu` is `#4a4a4a` on a `#0e0e0e`
ground — a contrast ratio of **2.18:1**, under half the minimum for body text.
It is the *placeholder* colour, named as such in tokens.css, and the title
band's date line was using it as a **label** colour at 10px, bold, uppercase,
with .16em of letter-spacing.

Small text at 2:1 does not read as faint. It reads as **out of focus**. That is
what "the top of the sticky title is blurred" was, through five reports and four
wrong fixes — and it is exactly why pixel-snapping, a compositing path and the
status bar each changed nothing at all: none of them was ever touching the thing
that was wrong.

The screenshot said so plainly and it took too long to read it: *every* soft
thing in it was `--mu` — the date, `sync`, the day number, the inactive tab
chips — and *every* crisp thing was not: `DO.`, `ROUTINE P1`, `chores`. Four
fixes that each changed nothing were four pieces of evidence that the model was
wrong.

The band's label rows take `--tx-2` (**6.86:1**), and so do the actions sitting
in the same band — DO's and TEND's `sync`, LOG's date arrows and its "today"
chip, STORE's settings link. `--mu` itself is unchanged and still the
placeholder colour; it now carries a note saying that is all it is for.

**All four earlier fixes are kept.** Each was a real defect found on the way and
each is worth having: the wordmark still snaps to a whole pixel (2.24.0), so
does the status-bar inset (2.24.1), no scroller is on iOS's legacy accelerated
path (2.25.0), and the app no longer runs under the system status bar (2.25.1).
None of them was reverted to get here.

**Verified** — `test/harness.mjs`, **698 checks, all green** (693 at 2.25.1),
with the new ones asserting that no band draws its label row in `--mu`, that
they take `--tx-2`, that the actions beside them followed, that `--mu` is
unchanged and documented, and that none of the four earlier fixes was undone.

### 2.25.1 — 2026-09-05 — the status bar goes back to iOS, and STORE's total gets a face

**The blurred band was the status bar, and the page was asking for it.**
`apple-mobile-web-app-status-bar-style: black-translucent` hands the page the
whole screen, status bar included, and lets iOS draw its own material over that
strip. Everything the band put up there was therefore *underneath* something the
app does not control and cannot opt out of from inside the page — which is
exactly where the title band's top row was sitting, and why it read as blurred
while identical type twenty pixels lower did not.

Three releases went looking for the cause in CSS: a fractional wordmark
(2.24.0), a fractional status-bar inset (2.24.1), a legacy iOS compositing
opt-in (2.25.0). **All three were real defects, all three are fixed and staying
fixed, and none of them was this.** Four reports of an unchanged screen is
enough evidence that the thing drawing over the band was never ours.

`black` gives the strip back. iOS reserves it, paints it black, and
`env(safe-area-inset-top)` becomes 0 — so the app starts below the bar and
nothing of ours is under the system's material. The cost is that ROOT no longer
runs edge-to-edge at the top: near-invisible on the dark presets, whose ground
is `#0e0e0e`, and a black bar above a pale app on a light one. Reverting is one
word in one meta tag; everything else is written against `env()` and follows
either value without a change.

**STORE's total moved out of the fight it was in.** 2.25 put the item count and
the total at the same end of the same row, and two big things at one end of a
phone-wide band is how the total ran off the edge. The count reads on the date
line now — `SAT 5 SEP · 3/11 ITEMS`, DO's shape — and the total has the
wordmark's row to itself. Its size is the wordmark's scaled down *and* capped
against the viewport, so a four-figure basket at the largest title size still
fits beside `STORE.`; `min-width:0` and the band's own `overflow:hidden` are the
backstop.

**It is white, with a hard offset copy of itself behind it.** White because it
is the loudest number in the app while it is up and the pinned widget already
speaks in accent — two accents arguing at the top of the screen is worse than
one plain number. The shadow is a `text-shadow` with **zero blur**, one
twentieth of an em to the right, so it reads as the number's own shape displaced
rather than as depth; on a near-black ground a dark shadow is invisible, so it
takes the accent, which is also what stops a white number looking like it came
from the operating system.

**And it says which way it went.** Green as it rises, red as it falls, easing
back to white when it settles. The colour is the whole signal, so the movement
under it is a nudge — five hundredths of an em up on a rise, down on a fall —
enough to catch the direction without the number appearing to jump. The shadow
takes the colour with it, so the two never disagree. Arriving is deliberately
*not* a change: pinning the counter mid-trip mounts the number rather than
flashing it green, because "you just spent forty euros" is not true of money
that was already spent.

**Parked, not built:** the triple-tap reachability idea (`@idea`), unchanged
from 2.25.

**Verified** — `test/harness.mjs`, **693 checks, all green** (679 at the end of
2.25), braces balanced, every touched module parsed, site served over http. New
coverage: the meta tag changed and the bottom inset still claimed; every header
still measuring from `env()` so either status-bar value works unchanged; all
three earlier fixes still in place; the count on the date line with the total
alone on the wordmark row; the total sized against the viewport as well as the
title; the shadow being hard, offset and not doubled on the currency mark;
mounting not flashing; green on a rise, red on a fall, the shadow following, the
nudge being a nudge, the ease back to white, and a no-op repaint not re-firing.

**Not verified** — the blur, for the fourth time and the last time this way. It
cannot be seen from jsdom. What is different is that this is no longer a guess
at a CSS defect: it is the one candidate that was always outside CSS, and it is
now simply not asking iOS to draw over the app any more.

### 2.25 — 2026-09-05 — the blur is found, the date shuffles, STORE's counter comes up top

**The blurred title band was `-webkit-overflow-scrolling:touch`, and it took
three releases to find because it cannot be seen anywhere but on a phone.** That
property opts a scroller into iOS's legacy accelerated path, where the scroller
and everything composited over it are rasterised into layers and re-scaled
rather than redrawn — and text on a re-scaled layer is resampled. `.h-top` sits
directly over `.view-body` at z-index 20, which is exactly why the softness
landed on the band and nowhere else on the page, and why the date line (10px,
letter-spaced, muted) was the first thing to show it.

2.24.0 and 2.24.1 both went looking for a fractional pixel — `--title-px` for
the wordmark, `--sat` for the status-bar inset. Both of those were real, both
are kept, and neither was this: the offsets were never the problem, the
compositing path was. Hugo pasting the screenshot and saying "nothing changed"
after two attempts is what ruled the whole class out. The property has done
nothing since iOS 13 — momentum scrolling is the default — and is deprecated;
all seven uses are gone. The sideways strips keep their `touch-action:pan-x`,
which is the rule that actually makes them draggable.

**The big date is a shuffle now, and DAY has one too.** A vertical roll says
"the next one along", which is right for a counter and wrong for a date:
stepping through days is riffling a deck. The number that leaves is flicked to
one side, tilted seven degrees and blurred as it goes, while the next drops in
from the other side and settles. `--dn-dir` carries the direction you moved, so
forward throws the old one left and back throws it right — the animation and the
gesture agree about which way time went. It lives in `Shell.dayNum()` rather
than twice in two modules, because the point of DAY's being "the same big date
as in LOG" is that they are the same object; two copies would be two things to
keep in step. Two bugs fell out of writing it once: the cleanup timer was
module-level, so whichever box shuffled second cancelled the other's cleanup and
left its digits piling up behind the live number; and a fast burst of steps
stacked one outgoing digit per step. There is exactly one number on its way out
now, per box, ever.

**LOG's date arrows step aside like DAY's stepper**, on the same dial
(`calStepsHide`) rather than a second one — they are the same control doing the
same job, and "how long before a stepper gets out of the way" is one question.
They fade rather than being removed: taking them out of the row would move the
date sideways under them every time.

**STORE's band carries the list total, and the trip's cost while the counter is
pinned.** The two share one flex end deliberately — mounting the cost is what
pushes the item count leftwards, so nothing has to be told to move and the two
cannot get out of step. They are the same information at two scales, so they are
drawn as different kinds of thing: the count is the band's small type, the cost
is the big-number treatment LOG and DAY use for the date, in the accent and
carrying its currency, going red when the budget is. With the price up in the
band the widget stops drawing it and keeps what the band cannot carry — the
budget line, the bar and the keys. And it locks flush: `top:0`, not
`top:-1px`, which had been tucking its own top border out of sight at exactly
the moment it became the topmost thing on the page.

**More faces, and the sticky sub-screen title gets a size of its own.** Six
display and three mono, chosen to widen the range rather than lengthen the list
— a condensed grotesque, a geometric, a slab, a high-contrast serif, a rounded
face, an editorial one. And `.hd-title` had its 15px written into six
stylesheets as a literal, so the Title size dial reached the eight home
wordmarks and nothing else: the header you actually sit under while working was
the one piece of type in the app with no say over it. `--hd-title-px` is its own
five-step dial, and the bar's padding is derived from the size, so a bigger
title gets a proportionally taller header instead of a big word crammed into a
small box.

**Parked, not built:** "bring content down: triple tap screen to bring elements
down 50%" (`@idea`). The `@idea` label is the protocol's new parking place — a
thought written down where it will be seen again, not a request. It is listed
and left alone, never completed, because closing it would throw away the idea.

**Verified** — `test/harness.mjs`, **679 checks, all green** (657 at the end of
2.24.1), plus braces balanced across twelve stylesheets, every touched module
parsed, and the site served over http. New coverage: no sheet left on the legacy
scroll path while the pan-x claims survive; both earlier snapping fixes kept;
LOG's arrows idling, waking on touch and waking on a step; the shuffle's
sideways travel, blur, tilt and direction; DAY carrying the same number from the
same helper; neither box's cleanup cancelling the other's under a burst; STORE's
count and cost sharing a flex end, the cost mounting only when pinned, the
widget dropping the price and keeping the bar, and the pin locking flush; the
font lists' size and weights; and the sub-screen dial claiming the root, every
header measuring from it, the bar growing with it, and the appearance reset
knowing about it.

**Not verified** — the blur, again, for the same reason as twice before: it is a
rendering artefact on a device this session cannot reach. What is different this
time is that the cause is a named, deprecated, iOS-specific compositing opt-in
that was sitting directly under the one element that showed the symptom, rather
than an arithmetic term that ought to have mattered and did not.

### 2.24.1 — 2026-09-05 — the date moves to LOG, a day can be started from nothing

Six `@claude` tasks, all `@fix`, and four of them 2.24.0's fault an hour after
it shipped.

**The day number is LOG's, not DO's.** It was the wrong home twice over. On DO
it shared the wordmark's row with the daily/media/other strip and took the width
that strip needed — which is the "display issue" on the tab bar, same task, same
cause. And on DO the number only ever changes at midnight, so the roll, which is
the entire reason for drawing it big, was something you would see once a day and
only if you happened to be looking. LOG is the app that *moves* through days: the
arrows above the wordmark step the date, so the number changes whenever they are
used and the roll says which way you went. It reads in the title's own colour
now rather than the muted one — it is the second half of that line, not a
caption beside it.

**A day can be started when PLAN never sent one.** DAY could only draw a day
that had been exported, so a morning with nothing planned offered exactly one
route: leave for PLAN, queue tasks, send them. That is right when there is
something to send, and wrong when the blocks are already on DO — labelled @b1 /
@b2, fetched, sitting there — and all that is missing is a day-shape to drop
them into. The empty card now offers "schedule from do", which builds that shape
and opens the slot panel in one tap.

**§9 is not bent to do it.** CAL still resolves no template: `PLAN.blankDay()`
resolves it — the same `resolved()` an export uses, given a start time rather
than reading the form — and hands the finished record over through `write()`,
which remains the only way into that store. What *is* different from an export
is that nothing was sent: no Todoist task, no 22:00 agent, no Google. So the day
is marked `localOnly` and the head says **not sent**, permanently, and ahead of
"edited" because it is the larger of the two claims. A real export for the same
date replaces the record whole and the marker goes with it, which is correct —
that day *is* sent.

**The routines full/minimal control had no styling at all.** 2.24.0 invented
`.opts > .opt` for it; the app's shape for a choice is `.chips > .chip`, which
is what `chips()` generates for the built panels and what every static panel
writes by hand. No stylesheet had ever heard of the class it was given, so it
rendered as two bare buttons.

**PLAN's project title resizes faster, and its rule stops popping.** The move
owned .58 of the flip budget — near 400ms of watching a word change size, and
the name growing 13px → 24px is the one part of that gesture where the scale is
what you see rather than the travel. A slow translate reads as weight; a slow
scale reads as text struggling to settle. It is .34 now, so the reveal starts
sooner and the whole gesture is shorter as well. The rule under the open
project's name was an `::after`, and `el.animate()` cannot touch a
pseudo-element — so while every real element around it was held at zero by the
reveal wave, the rule snapped in on the first frame. It is a real child of the
tile now, holds no mover, and comes down with the section rows in their stagger.

**The blur: the other half of the arithmetic.** 2.24.0 found that the band's
vertical metrics were fractional and snapped the wordmark. The blur stayed,
because there are *two* fractional inputs and the wordmark is only one of them.
The other is the status-bar inset: a notched iPhone reports
`env(safe-area-inset-top)` as 47.33px, and that number lands in the band's
padding-top *and* its min-height — so with `justify-content:flex-end` every row
inside was still being pushed to a third of a pixel, and the smallest text in
the band was still being resampled rather than drawn. `--sat` is that value
snapped with `round(up, …)` — up, never down, because it is clearance from a
physical notch and a header ending a fraction high is a header with the clock on
it. All thirteen uses across seven stylesheets now measure from it.

**Verified** — `test/harness.mjs`, **652 checks, all green** (640 before). New
coverage: the day number on LOG in the title colour and gone from DO, and the
roll firing on a real date step; the empty day's two actions and their
weighting; `blankDay` returning the template with every slot empty and writing
nothing on its own; the `not sent` marker and its removal by a real export; CAL
still reading no `plan.*` config; the `ph-rule` being a real element outside any
mover; the move fraction being well under half the budget; and `--sat` being
snapped, rounded up, and used in place of every raw inset.

**Not verified** — whether the blur is gone. It is a rendering artefact, jsdom
cannot see one, the browser extension would not connect, and the image attached
to the task was not reachable through the Todoist API. The fix above is a real
remaining fractional term in the same defect, found by reading; it is not a
confirmation. Two other candidates remain if it persists: the
`black-translucent` status-bar style with `viewport-fit=cover`, which lets iOS
composite its own translucent bar over the top strip, and `html{zoom}` from a
non-default Interface scale. The task is left open in Todoist for that reason.

### 2.24 — 2026-09-05 — the media tab rebuilt, the day gets an editor, and the title stops being soft

First release taken straight from Todoist: eleven tasks labelled `@claude`,
carrying their own type and target (see `_git-push/PROTOCOL.md`).

**The media tab is a list now, not a grid of tiles.** 2.8 drew media as the
block tiles — three across, 64px boxes — which is the right shape for a block
(a word standing for an hour) and the wrong one for a *title*, because titles
are long. Three-across at 11px meant four wrapped lines or an ellipsis on
anything longer than "Dune", so the tab stopped being readable at exactly the
length a backlog reaches. It is one row per title now: the label's colour as a
rail down the left edge, the name at two lines before it gives up, the kind and
the second label as a meta line under it, and the tick on the right where every
tickable row in ROOT keeps it. Four things came with it, all drawn from data
that was already being fetched: **kind chips** with the open count on each, so
"what films have I got" is a tap; a **find** box (only once the list passes
eight, below which it is furniture); a **sort** — by kind, a → z, or by
priority, which had been fetched from Todoist since 2.8 and shown nowhere; and
**surprise me**, which picks one open title from whatever is filtered. That
last one is the honest answer to what a watchlist is for — the problem with
forty films is never finding one, it is choosing. The kind and the sort persist
(`td.mediaKind`, `td.mediaSort`); the find box does not, because a query you
come back to two hours later is a list that looks broken. A stored kind whose
label has since been deleted from Config falls back to "all" rather than
hiding the list behind a chip that is no longer drawn.

**Rows on the day can be deleted, and the prompt asks what to do with the
hour.** A day arrives from PLAN whole, and until now correcting one meant
re-exporting it — a great deal of ceremony for "that meeting is off". There are
exactly two honest things to do with the time a deleted row leaves, so it asks
rather than choosing: **close the gap** moves every row after it earlier by its
duration (the day is genuinely shorter, and you finish sooner), or **leave it
free** turns the row into an unclaimed slot and leaves the rest of the day
exactly where it was planned. The second is the right answer more often than it
sounds — a train at six is still at six whether or not the morning emptied out.
Either way the day is marked `localEdit`, same as filling it from DO: it no
longer matches what was sent. An idle row has no delete, because there is
nothing in it to remove. This is the first three-answer question in the app, so
`Shell.ask` gained an optional `alt` button (settling as the string `'alt'`) and
the action row stacks when there are three of them — three verbs across a phone
leaves each of them two words.

**LOG's morning wake-up time moves the day.** PLAN resolves a day against a
start time chosen the night before; the morning then happens, and the real
answer is rarely the one PLAN guessed, so every row was off by the difference
and the now-line crossed a schedule that stopped being true before breakfast.
Saving the morning form now shifts the whole day by `wake − start`. The day
keeps its shape — that is the thing this app draws — and only its position on
the clock changes. `rec.wakeShift` records what has already been applied, which
makes it idempotent and reversible: correcting 08:10 to 07:50 moves the day by
twenty minutes and not by another two hours, and clearing the field puts it back
where PLAN wrote it. Switchable off under settings → apps → cal, and CAL owns
all the arithmetic — LOG only says what the time was.

**Colourful events, as two switches.** Every row already carried its colour on
its rail; these lift it into the row as a 12% wash. Two dials rather than one
because the two kinds of row are two different claims — the blocks you filed
into slots, and the template hours around them — and washing both at once is a
rainbow. A wash and not a fill, so the *name* stays the highest-contrast thing
in the row. An unclaimed slot is never lit: there is nothing in it to have a
colour.

**The day's head no longer breaks its own words.** It was one run of text with
`·` typed into it, so a line could break at any space — and did, in the worst
place: "5 tasks" and "3 done" came apart, a number stranded above its noun.
Each fact is its own inline element now with the separator drawn by CSS, so a
break can only fall *between* facts. The head also stacks — meta on one row,
actions on the next — because on a phone the facts wanted the full width and
`schedule from do`, the longest label on the screen for a panel used a few times
a month, was taking it. That button is `+ do` now: same accent, quarter of the
length.

**Nothing on the day answers a finger that is scrolling.** 2.22.3 took the press
*wash* off anything scrolled under a finger and 2.23 swallowed the click that
ends a drag; both are about the tap that follows. The day is the one screen
where that was not enough, because its rows are as tall as the hours they stand
for — a scroll down a full day is a finger crossing five or six live controls.
For the length of the gesture the day is a picture: `pointer-events:none` on
`.cal-day` and `.cal-head` under `[data-scrolling]`. The scroller is the
ancestor and keeps its own, so the scroll itself is untouched.

**The top of the title band was soft, and it was arithmetic.** Four of the five
title sizes multiply out to a fraction (54 × .86 = 46.44), and the band is
`justify-content:flex-end`, so that fraction became the offset every row inside
it was pushed down by. Text that lands on a half pixel is resampled rather than
drawn — and it showed first on the *smallest* text in the band, the date line at
the top, which is why the bug read as "the top of the title is blurred" rather
than "the title is blurred". `--title-px` is the wordmark's size snapped with
`round()`, and the band is measured in it; the unrounded value stays as the
fallback for a browser without `round()`. The other half was `.morph`, added on
every tab change and never taken off, which left the title's `both`-filled
animation applied for the life of the session — holding the wordmark on a
compositing layer, where text is drawn with grayscale antialiasing instead of
subpixel. It now comes off with `.leaving`, on the same timer.

**DO's date sits opposite the wordmark.** The day of the month at the right end
of the `DO.` row, cut from the same type at the same size (`--title-px`, so it
follows the Title size dial and snaps with it), and muted — the wordmark is what
the row *is*, the number is what it is *about*. When the day changes the old
number leaves upward and the new one arrives from below: a checklist that resets
at midnight has exactly one moment where the number matters, and a digit that
changes without moving is a digit you do not notice has changed. It is
`aria-hidden` — the date line above it already says the date in words.

**Routine cards can be minimal, and can hide once finished.** Minimal is the
name and the ratio on one row, no bar, one column: about a third of the height,
so a tab with six routines is a screen rather than a scroll. What is dropped is
only the *drawing* of the progress — the ratio is the same number the bar was
showing. Hiding a finished routine never touches its state; switching the dial
back off brings the card straight back, ticks and all. A tab with nothing left
says "all done" and where to get the cards back, rather than leaving a hole
where the grid was.

**PLAN: the other projects stay on screen.** Opening a project used to clear the
grid of every other one, so the way to the next project was back out through the
one you were in — close, find, open, and the grid rebuilt twice for what is one
thought. The others are a strip of chips under the open header now, each with
its queued count, and one tap moves between them with the FLIP carrying the
section rows out and the new ones in. They are deliberately `.proj-jump` and not
`.proj-tile`: exactly one full project box is open at a time and the rest of the
file counts on it. The section rows lost their wash — three rows each filled
with the same project colour read as three identical slabs, with the name, the
only thing that differs, competing with all of it — and gained the rail, plus
the count of what is already queued into each. The open header keeps a rule in
the project's colour under its name, so opening a project no longer drains the
colour off the screen.

**A hints switch.** Settings → behaviour → "Explain the controls": the paragraph
over a section and the grey line under a switch, off in one attribute. They are
what makes the app legible on the first pass and what makes it long to scroll on
the hundredth, so they are a dial rather than a decision. Never hidden: a
control's own name, a section heading, and the home menu's sub-labels, which say
what is *inside* a category rather than explaining it — losing those is losing
the map, not the commentary.

**A latent bug found on the way.** The app panels are static markup in
`index.html`, and their `data-pref` switches were written with the shipped
default on them and then never painted again — so CAL's three had been showing
the default rather than the setting since they shipped, and flipping one moved
the value without moving the dot. `syncStatic()` paints a static panel from
Prefs after it renders. It is scoped away from look / layout / behave, which
rebuild their own markup and where two dials (`radius`, `border`) default to
`null` meaning "leave it to the theme" — painting those this way would put NaN
where the readout says `auto`.

**Verified** — `test/harness.mjs`, **632 checks, all green** (572 before), and
the site served over http. New coverage: the media rows, chips, find, sort and
surprise-me; the head's unbreakable facts; deleting a row both ways and
cancelling; the wake shift being idempotent, correctable, clearable and
switchable off; both colour dials; the scroll-inert day; `--title-px` and the
`@supports` fallback; `.morph` coming off; the hints attribute and what it does
*not* hide; a static panel's switch following its pref; minimal cards, hiding a
finished routine and the empty-tab message; the day number and its roll; and
PLAN's jump chips. Two 2.8 checks were rewritten rather than deleted — they
asserted the media *tile* markup that this release replaces, and the behaviour
they were guarding (the second label shown, ticking closing the task in Todoist)
is still checked on the new row.

**Not verified** — the blur itself, which is a rendering artefact and cannot be
seen from jsdom. Both causes are fixed and both are demonstrable in the source;
whether the phone still shows it is a question for the phone.

### 2.23 — 2026-09-05 — every overlay lets go, DAY runs during the day, and a half of the day is written when someone writes it

**Three bugs that read as three bugs and were one rule: an overlay owns the page
until it closes.** The pad's backdrop stopped taking pointer events the instant
its class came off, so the tap that dismissed it also pressed whatever was
underneath — one tap doing two things, and the second never asked for. The pad
was drawn without dismissing the system keyboard, so on a form where a text
field had been answered first it arrived over a keyboard against a visual
viewport iOS had already shrunk, and a fixed element measured against a viewport
that has moved has its keys somewhere other than where they look — which is the
"the calculator makes the whole page bug out and the taps are misaligned"
report. And the platform's own selection callout (paste / select / select all /
autofill) had nothing at all that would dismiss it: it stayed up, anchored where
the field had been rather than where the field now is, over whatever had
scrolled into that space.

One shell section answers all three. The tap that closes the pad is prevented
*and* stopped, and the click it would have synthesised is swallowed on its way
in. `padOpen` blurs whatever is focused before the pad is drawn, so nothing is
moving by the time it is. And a tap outside a focused field blurs it, on every
screen in every app — because blurring is the only thing that closes the
callout, and nothing was blurring. A per-field fix would have been one app
remembering and seven forgetting.

**A gesture that travelled is not a press.** 2.22.3 took the press *wash* off a
row scrolled under a finger; the press itself still fired when the finger
lifted. A pointer that moves more than 12px from where it landed — or a touch
the browser has already claimed for a scroll, which stops sending `pointermove`
and is caught on `touchmove` instead — marks the gesture, and the click at the
end of it never reaches the page.

**The pad says what the number is in.** A pad-owned field is never focused, so
while you answer it the only things on screen are the pad's label and a number —
and the label the pad covers is often the only place the unit was written down.
Cold shower reads `45 s`, weight `64.5 kg`, the walk `4 km`. Declared per field
with `data-unit` and never inferred: a unit guessed from a label is a unit that
is wrong on the one field nobody checked. `duration` and `clock` ignore it —
7h20m and 09:30 are already units.

**LOG's discard now undoes.** The forms do not hold their answers in the DOM:
the scales, the meds, the meals, the counters, the cold-shower toggle and the
blocks all write straight into the live record as they are tapped, and `save()`
only copies the text fields across and flushes the object. So "go back without
saving" left every one of those edits sitting in the record, and the next write
from *anywhere* committed them — an entry, a block ticked on DO, the other half
of the day. The form was discarded and the data was not, which is exactly "I
went back without saving and it saved anyway", just delayed until something else
touched the day. Discard re-reads the day from storage, which also keeps
whatever was legitimately written while the form was open.

**And a half of the day is written when someone wrote it.** `setBlock` files a
block ticked on DO into the real today's record without the evening form ever
being opened, and `blocks` counted as evidence that the evening had been filled
in — so one tick on DO turned the card green, cleared LOG's "!" and extended the
streak. `saveMorning` / `saveEvening` leave a stamp now, which is authoritative;
records written before it fall back to the old field scan with `blocks` taken
out of the evening's. The trade is deliberate and small: an old evening whose
only content was ticked blocks reads as unwritten. Nothing is deleted — the
blocks are still in the record, still in the `.md`, still in the reports.

**DAY during the day.** A line across today at the hour it is, summed from the
same durations the rows are drawn from rather than measured off the DOM, riding
the shell's existing minute tick. And every `task` or `fixed` row can be ticked
off — an `idle` row cannot, because it is the absence of an event. A tick is a
mark on the drawing and nothing else: CAL has no network by contract, and a
stored event carries a resolved name rather than a task id.

**DAY's slots can be filled from DO.** PLAN builds a day and sends it, and that
is still how a day gets here — but the day PLAN sent is the day as it looked
last night, and by morning the blocks on DO are the ones actually happening.
Re-exporting the whole day through PLAN to move two of them is a lot of ceremony
for a small correction. So the slots this day already has, filled from the block
tasks DO is holding now, with PLAN's own slot rules (a slot another task holds
is refused by name; tapping the one it holds gives that hour back). It
overwrites every slot, so it asks first, and it marks the day `localEdit` —
"edited here" in the head, permanently. Everywhere else on this screen what is
drawn is what PLAN resolved and handed over, and a drawing that quietly claims
to be the plan is the one thing DAY must not be. Nothing is sent anywhere.

**A block task is the blocks section's, not also a today row.** The two are
separate questions asked of Todoist, and a task due today carrying `@b1`
answered both — so it was drawn twice, counted twice in the tab badge, and
tickable in one place while the other still showed it open. Dropped at draw
time, not fetch time, so switching the blocks section off hands it straight back
with no refetch.

**How far back "show done" reaches is a setting.** Day (what it always did),
week or month. DO's own cache is one day deep and always was; the earlier days
come from LOG, where the tick already files the name. They are names under a
date rather than tiles — a tile would offer a tick that cannot exist, since
reopening a block finished last Tuesday is Todoist's job.

**LOG's selected day is inverted rather than ringed**, and the day numbers are
bold. A ring was a third border weight in a grid that already has a hairline and
today's accent, and at 5mm across the difference between 1px and 1.5px is not a
difference you can see. Swapping the ground for the ink is unmistakable at any
size and cannot be confused with the written-day tints, because it is not a tint
of anything.

**STORE**: an empty list says "no items yet" and stops; the field says "add
item".

**Verified** — `test/harness.mjs`, 572 checks, all green, 48 new. The unit
appearing per field and only where declared, and a duration left alone. The
three overlay rules present in the shell rather than in one app. Discard leaving
the record untouched and a later write from elsewhere unable to resurrect it,
cancel keeping you on the form. A blocks-only evening reading as unwritten and
saving the form stamping it, with the blocks themselves untouched. The now line
landing inside the hour it names and absent on a day that is not today; a task
row and a template row tickable and an idle row not; the tick persisting. The
schedule panel listing DO's blocks against the day's own slots, refusing a taken
slot by name, giving an hour back, asking before it overwrites, rewriting every
slot, leaving the template's hours alone, marking the day edited — and CAL still
containing no URL, no `fetch(` and no `XMLHttpRequest`. A block-labelled task
kept out of the today list and handed back when the section is switched off. The
done window at day / week / month, reaching into LOG's records, drawn as names
and not as buttons, and persisted.

**Still not verified by me**: how any of it looks or feels under a finger. The
Chrome extension is still not connected, so the touch behaviours in particular —
the swallowed tap, the blur, the 12px slop — are argued from the platform's
semantics and held in place by structural checks, not driven under a thumb.

### 2.22.3 — 2026-09-04 — nothing is pressed while you scroll, and a chart that opens

**A row lit up under a finger on the way down a list.** `:active` on a touch
screen is applied the moment the finger lands and is not cleared until it lifts,
so a touch that turns into a scroll lights up whatever it started on and keeps
it lit as the list moves under it. The fix is one token: the 22 press washes
that said `background:var(--s2)` say `var(--press)` now, the shell raises
`data-scrolling` on `<html>` while any slide is moving, and
`[data-scrolling="on"]{--press:transparent}` takes the wash out for the length
of the gesture. It reaches every `:active` in every app at once and any future
one for free, and a tap that is a tap still lights up — because a tap does not
scroll. The rules that press with a *project's* colour are not on the token
(their resting value differs per rule) and are noted in §6 as the exception.

**DO's quick section folds from its own title.** Tapping "quick" hides the cards
and leaves the head — the count is still there, and so is the way back. A
section you have finished with should be able to get out of the way without
being switched off in settings, which is a different and more permanent thing.
The title had to keep looking like the heading it replaced: a heading that is
also a button is only obvious once, so the only tell is a caret.

**LOG's fortnight opens over the month.** At the height it has beside the
calendar it can carry three lines and no labels, and labels are most of what
makes a chart answerable — a line that rose is worth less than a line that rose
from 2 to 4 on the ninth. Tapping it puts it where the month was, with a 1–5
scale, a date under every point and gridlines; tapping it again gives the month
back. The axes are **HTML, not SVG `<text>`**: the viewBox is stretched to fill
the width, so text inside it would be stretched with it. Each label is placed at
the same fraction the plot draws with, so they line up by construction rather
than by eye — which is also why the plot gained a 4% inset at each end, where
half of the first and last dot used to hang over the edge.

**Two motion dials.** `--mo` is now `--mo-base` (the preset) times `--mo-scale`
(a new **Animation speed** slider, 0.5×–3×), split so the two compose — "reduced,
and half again" is a real thing to want — and because a speed runs the opposite
way to a duration, so Prefs writes 1/speed. And **"keep the bar moving"**: an
opt-in exception that leaves the tab pill animating at Motion: none. The pill
growing into place under the tab you picked is feedback rather than decoration —
without it the only confirmation that the tap landed is that the page has
already changed, which is not the same thing. Off by default: someone who asks
for no motion should get none until they say otherwise.

**Verified** — `test/harness.mjs`, 524 checks, all green, 25 new. The token
existing and no sheet still pressing with the literal; the flag raised by a real
scroll event and lowered 160ms later. The quick title folding, keeping its
count, persisting, and unfolding. The chart opening over the month, carrying
exactly 5 y labels / 14 x labels / 5 gridlines only when open, those placed at
0/25/50/75/100% and 4%…96% — the same fractions the plot uses — and being HTML
rather than `<text>`. `--mo` composing from the two parts, speed 2× writing a
0.5 scale and 0.5× writing 2, `navMotion` off by default and scoped to `#nav`
and `.nav-arrow` when on, both controls on the layout panel, and the appearance
reset knowing about them.

**Still not verified by me**: how it looks. The Chrome extension is still not
connected.

### 2.22.2 — 2026-09-04 — one thing moves, and a hairline

**PLAN's transition, at the fourth attempt, and this time by being told what to
do rather than by guessing.** 2.21 made the border fade faster. 2.22 made it
faster again. 2.22.1 found that the tiles which *left* were never animated at
all and gave them ghosts. Each was a genuine improvement to a thing that was
still wrong, because the diagnosis underneath all three was wrong: they all
assumed the answer was to animate *more* of the screen better. It is not. A
screen where eight things move at once has no subject, and a gesture with no
subject reads as a stutter however well each part is timed.

So the instruction was: hide everything except the name and the colour dot,
move those. That is what it does. The grid clears on the first frame, the
project's name and dot travel and grow from where you tapped to where the
heading goes, and the section rows appear under them afterwards. Three groups
in `flip()` and every element is in exactly one of them — the **movers**, the
**carrier** box they live in, and everything else. The ghosts are gone: what
leaves is hidden, which is now consistent rather than a cut, because everything
that stays is hidden on that frame too.

Two things fell out of it worth writing down. A carrier cannot be faded —
`opacity` on a parent takes its children with it, and its children are the two
things that must stay visible — so its *paint* is held transparent instead and
comes back with the rest. And there is no move at all when the name does not
actually travel: opening a section's form leaves the heading exactly where it
is, and 400ms of blank screen while nothing moves is a pause, not a transition.

**A hairline round a day in LOG's month.** Forty-two boxes at the full border
weight is a lattice, and the lattice was the loudest thing on that screen. Half
of `--bw`, floored at .5px — one physical pixel on any phone — so it is ruling
rather than a grid of buttons. Still a ratio of the dial and not a literal, so
Border weight still reaches it (§4). The selected day's ring came down from 2px
to 1.5px with it: it can be the one heavy line in the grid, because there is
exactly one of it.

**Verified** — `test/harness.mjs`, 499 checks, all green. The scripted-layout
transition test rewritten for the new shape: the tile unpainted for the whole
move and painted in after it with `fill:backwards`, the name the only thing
moving, the rows held back and revealed in order, the queue outside the grid
still sliding. Plus the source assertions — movers and carriers separated, the
mover carrying its full delta, no ghosts left, no move when nothing travels, and
the arithmetic that move plus reveal still fits one `--t-flip`. The hairline
asserted as a ratio of `--bw` and not a literal.

**Still not verified by me**: how it looks. The Chrome extension is still not
connected.

### 2.22.1 — 2026-09-04 — what the first look on a real screen turned up

Seven things, reported directly rather than through the template. Two of them
are 2.22 shipping something that could not have worked, and both are worth
reading as cautionary notes rather than as tweaks.

**The numpad's keys were not where they were drawn.** Tapping a key registered
the one above it. The cause is the thing 2.22 was pleased with: the field was
focused and the keyboard suppressed with `inputmode="none"`. That is a *hint*,
and iOS honours it for drawing the keyboard and for nothing else it does about a
focused field — it still scrolls the field into view, and it still shrinks the
visual viewport for a keyboard that never arrives. A `position:fixed` pad drawn
against a viewport that has moved under it has its hit boxes somewhere other
than its pixels. **The field is never focused now**: the tap that opens the pad
is `preventDefault`ed, so there is no focus, no keyboard, no scroll and nothing
to move. The field says which one it is with a class instead of a caret. The
keys also fire on `pointerdown` rather than on `click` — a click on touch is
synthesised, arrives late, and can be suppressed by anything that prevented a
default earlier in the sequence.

**PLAN's transition, diagnosed properly at the third attempt.** 2.21 and 2.22
both made the border fade faster and neither fixed it, because the border was
never the problem. `flip()` walks what is on screen *now*, and opening a project
replaces the grid's `innerHTML` — so the seven tiles you did not tap were
already detached and were **never animated at all**. Most of the screen cut on
the first frame while one heading glided for two thirds of a second, and that
mismatch is what reads as a stutter. `snap()` keeps the nodes now (a detached
node is still a node) and `ghostOut()` puts each back as an absolutely
positioned ghost at the rect it had and fades it, gone by a third of the move.
The rows arriving were retimed to match: they used to start at 30% and run 60%
with 45ms between them, so the fourth row was still arriving 110ms *after* the
heading had settled. They now land just inside the move, which is what makes
them read as the consequence of the tap rather than as an afterthought.

**PLAN's flag can be answered by looking.** LOG's two alert rules clear
themselves — writing the morning is what makes "morning not written" false. The
third does not: "nothing planned for tomorrow" is a prompt, and the honest
answer is often "I know, I looked". Opening PLAN dismisses it for that day. It
is the only piece of alert state that is stored rather than derived, keyed by
the day so tomorrow's prompt is a new one.

**The rest.** The pinned calculator keeps its buttons — 2.22 folded the ± rows
away on the theory that a pinned counter is a readout, and it is not; the
buttons are why you pinned it. DAY's stepper is back to the size it was, square
with `--r2` rather than a pill: a full-width bar is a lot of chrome for two
controls. A written day in LOG's month is a **tint** rather than a fill — a
solid accent block was the brightest thing on the screen and a month of them
read as a warning. And the fortnight grew: **stress joins energy and mood**, the
graph is nearly twice as tall, and every day with a value carries a dot in its
series' colour. The dots are not decoration — a bare line says which way it
went, a line of dots also says how often you actually answered, and a fortnight
with four readings draws the same line as one with fourteen. Each dot is a
zero-length path with a round cap, because the box is stretched to fill the
width and a `<circle>` in it would be drawn as an ellipse.

**Verified** — `test/harness.mjs`, 494 checks, all green, 27 new. The pad
opening without focus and its keys registering on pointerdown, once and not
twice; `auto` still leaving a fine pointer alone. `snap()` keeping the nodes,
`ghostOut()` existing and being called, a ghost's `data-flip` stripped from
itself and its descendants, and the arithmetic that the last row lands inside
the move. The pinned calculator's ± rows still in the DOM. The stepper's square
radius. The month's tint. Three lines, three dot colours, the round-cap dots,
the taller box, and a key naming all three. PLAN's flag clearing on arrival,
staying cleared, and coming back when the day does.

One harness check was **wrong in the other direction** and is fixed: the
stepper's shape check used an unbounded lazy `[\s\S]*?` between a selector and a
declaration, which matches into the *next* rule and so asserts nothing about the
one it names. Bounded with `[^}]*` now.

**Still not verified by me**: how it looks. The Chrome extension is still not
connected. Everything above is a fix to something seen on a real screen, so the
report is real; the fix is verified as specified.

### 2.22 — 2026-09-04 — the app asks its own questions, and answers its own numbers

Two things had been quietly making ROOT feel like a web page rather than an app,
and they turn out to be the same thing: the platform's chrome landing in the
middle of it.

**Every question is the app's own now.** `window.confirm` arrives in the
platform's typeface at the top of the screen, ignores all thirty-nine appearance
dials, and reads as the browser interrupting rather than as the app asking.
There were 28 of them in ROOT and there are none any more: one `#ask` overlay
does confirm and prompt both, built from the same tokens as everything else.

The cost was real and is worth naming. **Asking cannot be synchronous** once it
is an overlay, so `if (!Shell.confirm(…)) return;` — the shape at every one of
those call sites — had to go. `Shell.confirm(msg, () => { … })` takes what to do
instead; the five places that were already `async` take `await Shell.confirm(msg)`
and read almost exactly as they did. Getting this wrong is *silent* — the guard
is falsy, the function returns, the action never happens — which is why §6 now
says so twice, and why one harness check greps every module for a bare
`confirm(` and another counts anything reaching `window.confirm` across the whole
run. Both must be zero.

The questions split into two kinds on the way, which they never had been.
`Shell.confirm` is for the ones "confirm before clearing" is allowed to wave
through. `Shell.ask` is for the ones it is not: LOG's "go back without saving?",
its import, the data panel's restore, PLAN's unmapped project. Those were
already the odd ones out; now they say so.

**A field that only takes a number gets a numpad, not a keyboard.** Two thirds
of the system keyboard are letters, it covers half the screen, and for sleep it
was not even asking the right question — the field wants 7.33 and the answer in
your head is "seven hours twenty". So the pad reads what you type: `720` is
7h20m and 7.33 lands in the field, `930` in an alert hour is 09:30, and
everything else is the number you typed. It claims any `type=number`,
`inputmode=numeric` or `inputmode=decimal` input across all eight apps and
settings, suppresses the keyboard with `inputmode="none"` set on *pointerdown* —
before focus, the only moment early enough — and hands the field back untouched
if you switch the pad off. A field that takes **text** still gets the system
keyboard, which is the whole distinction. On a laptop it stays out of the way by
default (`numpad: auto`), because a number field with a real keyboard beside it
was never the problem.

**LOG's home is one screen, and most of it is about you rather than about
navigation.** It was a streak line and eight cards, and the cards are the least
interesting thing on it — they are doors, and you already know where they go.
The doors moved down and got smaller, the two full-width utilities now share a
row, and the space that freed up holds a month of days drawn by how much of each
was written, and a fortnight of energy and mood as two lines. A cell is a
control: tapping one selects that day, which used to be twenty taps on the
band's arrow. The layout is height-driven and does not scroll — below 560px of
viewport it goes back to flowing, because "one screen" is a promise about a
phone held upright, not a reason to clip content on a laptop.

**DAY opens on today.** It opened on the nearest day that had something on it,
so a morning with nothing planned answered a question nobody asked — "here is
Thursday" — and you had to step back to learn that today was empty. Its stepper
spans the screen instead of floating over the middle of it as an 80px pill: each
arrow is half the width, a thumb-sized target on either side. Being that wide it
covers the bottom of the day, so it fades out after five idle seconds
(`calStepsHide`) and comes back on the first touch. The empty day's **OPEN
PLAN** is upper case — the one thing on that screen that has to be found rather
than read, in the one app that is otherwise lower case throughout. And a day can
be cleared from its own head.

**The rest.** The third medication slot ships **off**: it exists, the record and
the `.md` still carry it, the form simply does not ask until you say so — the
same rule `log.fields` has always followed. Every slot is highlighted in its own
colour from `log.medColors`, through one CSS rule rather than one selector per
key, so a fourth costs nothing. A quick card is drawn in its label's colour like
a block tile, and the label it takes is the **other** one: `@quick` is on every
one of them by definition, so colouring by it says nothing. Finished quick cards
can be cleared early rather than waiting for midnight, the way PLAN's sent list
can. STORE's counter has a pin on it and sticks to the top of the page while you
work down the list — sticky, not fixed, because nothing fixed may live inside
`#track`. And PLAN's project border fade is a fifth of the move rather than 42%
of it: 2.21 made it faster and it still was not fluid, because the border was
still visibly resolving after the box had landed.

**Verified** — `test/harness.mjs`, 467 checks, all green, 50 new. Not one system
dialog raised across the whole run, and no module carrying a bare `confirm(` or
`prompt(`. The dialog splitting one message into a question and its detail,
Escape closing it, cancelling running nothing, a cancelled question staying
cancelled afterwards, and the pref bypassing it entirely. The pad classifying
five kinds of field and declining the sixth; 720 → 7.33, 930 → 09:30, 9309
refused rather than written, the dot key disabled on an integer field. LOG's
month drawing, marking today, refusing tomorrow, and selecting a day on tap; the
fortnight's two lines; the home's no-scroll rule asserted in the sheet that
holds it. DAY landing on today, the stepper's width and its idle rule, the empty
day's upper case, and clearing one day cancelling and then confirming. The quick
card's colour rule and the label it comes from. The fade at 22%. STORE's pin
sticking, persisting and unpinning.

One check that had nothing to do with this release was **wrong and is fixed**:
"the → tomorrow button shows from 20:00 only" was left behind when 2.19 made
that button pick its tasks and dropped the hour gate. It asserted the old
behaviour and passed only by accident, at any hour before 20:00.

**Still not verified by me**: how it looks. The Chrome extension is still not
connected, so every appearance change here is verified as *specified* — the
rules asserted in the stylesheets that hold them — and not as seen. Same caveat
as 2.21, and it is the one thing a harness cannot buy.

### 2.21.2 — 2026-09-04 — two icons that were one icon, and arrows that were characters

DAY's new sun was a circle with eight radiating strokes. So was the settings
gear. At 19px, in a bar where they sit four apart, they were the same mark —
which is the whole failure of an icon. The sun stays with DAY, where it means
something; **settings wears sliders**, which is what forty dials and a pile of
toggles actually are. Two rails, a knob on each, each rail drawn as two
segments with a gap where the knob sits so nothing shows through a shape with
no fill.

**DAY's stepper arrows are drawn now, not typed.** They were `←` and `→` as
text in the mono face: at the mercy of whichever font is loaded, off the
optical centre, and invisible to the Icon weight dial. They are
`#ico-chev-l` / `#ico-chev-r` from the sprite — the same pair the nav's own
arrows have always used, at the same 17px — so the three arrows on that edge of
the screen finally read as one family.

**Verified** — 417 checks, all green, 3 new. The one worth keeping takes a
signature of every `tab-*` symbol's shapes and fails on a duplicate: the gear
and the sun were both `circle+path`, so it catches this class of mistake
without anyone having to look at the bar. Plus settings' symbol being lines and
knobs rather than a circle and a ray path, and the stepper's two buttons
carrying `<use>` of the two chevrons with no arrow character anywhere in them.

### 2.21.1 — 2026-09-04 — the :root block 2.21 split in half

The blur override was added by opening its selector *inside* `:root`, which
closed the block early: every token below `--chrome-blur` — the shell metrics,
`--title-base`, `--caps`, the motion durations — ended up in a rule that only
matches while blur is off. With blur on, which is the default, they were
undefined, so `text-transform:var(--caps)` resolved to nothing and the wordmarks
had no base size. The whole app went lower case with miniscule titles.

`:root` is whole again and the override is a standalone rule beside
`[data-caps="off"]`. No font, size or caps declaration was touched — none ever
had been.

**All 411 checks passed against the broken file**, which is the lesson worth
keeping: jsdom does not cascade, so a structurally broken stylesheet is
invisible to every behavioural check in the harness. Three new ones read the
file's shape instead — every shell token inside the `:root` block, an override
of one of them being a rule of its own, and the braces balancing — and they
fail against the broken version. 414 checks, all green. The other eleven
stylesheets were checked for the same fault and balance.

### 2.21 — 2026-09-04 — twelve fixes, three of which were not fixes

The first release driven by looking at the thing on a real screen rather than
by the harness, and it shows: half of this is gaps, colours and a button that
belonged to another app.

**TRACK counts from the day you start, not from the day you set it up.**
Ticking off what you had already done made the first week read as a sprint and
the projected finish read as a fantasy. `trackFrom` splits the two: ticks
before it are *banked* — still done, still on the count, drawn as the trend's
starting height — and only what comes after moves the pace. "Everything ticked
is my start" moves the date to tomorrow rather than rewriting any tick's date,
which is what makes it safe to press twice and what keeps the record of when
each topic was actually finished.

**The "!" moved to the tab it is about.** LOG's three rules were all flagging
LOG, including the one that means "nothing is planned for tomorrow" — a
signpost pointing at the wrong door. That one flags **PLAN** now. LOG still
owns all three, and `alertReasons()` returns every rule that is firing, because
they are independent once they are not sharing a tab. And an alerting tab wears
a **filled pill** the way the active tab does: a thin "!" in a bar of thin
marks read as just another icon.

**A third medication slot — and the last time that will need code.** The two
were named by hand in a dozen places: the form, the record, the export, the
parser, the history pills and both reports. They are `log.meds`'s keys now and
everything walks them. The keys stay the contract (`meds_<key>`, one `.md` row
each, in Config's order); adding one is additive, so a note written yesterday
has no row for it and reads exactly as it always did.

**A setting for the blur behind the bar.** It is the most expensive thing the
chrome does, and on a tired phone it is what makes the bar smear as the page
moves.

**DAY, seen properly for the first time.** The date moved into the title band
beside the wordmark, at a declared height so it cannot grow the band. The
arrows moved out of the slide entirely and became a fixed pill above the nav —
which they had to, since nothing `position:fixed` may live inside `#track`; the
stepper is a sibling of `#views` carrying `.ns-cal` so the one delegated
listener still reaches it. The tab icon became a sun: the agenda mark it
replaced was three bars on a rail, which at 19px is indistinguishable from
PLAN's month grid, and 19px is the only size that matters. And the empty day's
"open plan" is one of DAY's own controls rather than a form button stretched
across a card.

**The rest.** PLAN's border fade now finishes at 42% of the move — the border
is the thing you notice last, so it has to finish first for the gesture to read
as fluid. A quick card's second line takes the card's colour, like a block
tile's tag. A status box has a gap above it as well as below. The content
editors carry their own top gap, so they never butt onto a danger button again.

**Verified** — `test/harness.mjs`, 411 checks, all green, 23 new. Banking the
ticks and the pace refusing to count them; the panel saying how much is banked.
The plan rule flagging PLAN while LOG stays clear, the preview moving it, and
planning one block clearing it. Three med buttons drawn from Config, `meds_m3`
in the record, and the note writing one row per slot in Config's order, each
matching the record. The blur attribute going off and back on. The stepper
being a sibling of `#views` and shown only on DAY's slide, its two arrows not
in the scrolling day, and the empty day offering `.ce-go` rather than a `.btn`.
The sun icon carrying a circle and no rects. The fade's duration under 300ms
against a 680ms move. And the four appearance rules asserted in the sheets that
hold them.

**Still not verified by me**: how it looks. The Chrome extension is still not
connected, so every appearance fix here is verified as *specified*. The
difference this time is that the specification came from your screenshots
rather than from my guess.

### 2.20.1 — 2026-09-04 — a task over several hours, a day you step through, and a transition that stops zooming

Seven small things, three of which turned out not to be small.

**A task can take more than one hour.** `expSlots` maps a task to a *list* of
slots now, not one. A job that runs over b1a and b1b is one task given two
hours instead of the same task sent and picked twice, the description writes
one line per slot — the same name twice, in the day's order — and DAY draws it
as two blocks in the one project's colour. Tapping a slot the task already
holds gives back that hour alone rather than clearing the lot. A slot is still
exclusive: another task asking for it is refused by name.

**The transition stops being a zoom.** Opening a project used to scale the tile
into its heading, which scaled its border, its radius and its padding with it —
and it was only because the box was being stretched that its contents had to be
held at `opacity:0` until the scale resolved. The box is not scaled any more:
it is drawn at its new size, slid from its old position, and its border and
background *fade* between the two treatments. The name and its dot carry their
own flip keys and are FLIPped properly, translating and scaling from where they
were to where they are, never faded — with `data-flip-text` naming their box so
its slide is subtracted from theirs instead of compounding. §6 said counter-
scaling the children could not work here; that was true while the box itself
was scaled, and the note has been rewritten rather than deleted.

**The project tiles are one row.** Half the height, the name and its dot at the
left, "3 sections" / "2 queued" at the right end of the same row instead of
underneath. `--tile-h` is 46px now, and the open heading, the section rows and
the form were re-expressed in it so all three keep the exact height they had.

**DAY.** The wordmark reads DAY and the tab says `day`; the id stays `cal`
everywhere it is an identity — the storage key, the namespace, `Prefs.APPS`,
the settings panel — because renaming that would churn all four for a word, and
re-running the app migration for nothing. The day strip of chips is gone,
replaced by ← and → stepping through the days that exist, each arrow dimmed and
disabled in place when there is nowhere further to go. Dropping the strip also
dropped a sideways scroller inside `#track`, which needed its own
`touch-action` to be usable under a finger. And the dates read lower case:
`Prefs.formatDate()` is folded in `cal.js` and three rules opt out of the caps
switch by name — the one deliberate exception to that rule, written down in §9
so it reads as a choice.

**DO's today list gets the blocks section's gesture.** "→ tomorrow" turns the
rows from tick to select, you pick what is moving, one button sends it, and
"all" is still one tap. It is no longer gated on 20:00 — the old button moved
*everything* open, which only made sense late in the evening; choosing what
moves makes sense at any hour. A plant row is not selectable, TEND owns those.
`DO.deferToday()` called with nothing selected still moves every open task,
which is what it always did and what the ROOT.md entry promised.

**Verified** — `test/harness.mjs`, 388 checks, all green, 22 of them new. A
task taking two slots and saying so, the description writing its name twice in
the day's order, one slot handed back without the other, another task still
refused it, and the pair arriving on DAY as two blocks of one colour. The tile
fading its border with no scale anywhere, the name moving and growing under its
own key with no opacity in the frames, and no child animation left in the run
at all. The day stepped both ways with the far arrow disabled at each end, a
disabled arrow doing nothing, the date lower case in the DOM and the three
`text-transform:none` rules in the sheet. DAY worn and `cal` kept, found by the
name it wears. And DO's list turning selectable, the button armed only by a
selection, a plant refused, and exactly the picked task moved.

**Still not verified**: how any of it looks. Same reason as 2.20 — jsdom does
not paint, and no browser was available to drive.

### 2.20 — 2026-09-04 — the day you planned, drawn where you can see it

**CAL, an eighth app.** Everything needed to draw the day was already being
computed at export time — PLAN resolves the template against one start time,
puts the picked tasks in their slots and works out which calendar each belongs
on, and then threw all of it away the moment the Todoist task was written. It
is kept now, in `cal_days_v1`, and CAL draws it: a strip of the days that have
been planned, and the chosen one as proportional blocks, an hour drawn an hour
tall. The tasks wear their projects' colours — the very values PLAN paints its
own tiles with, so the two views agree rather than merely resembling each other.

It costs no request and no permission. **ROOT still never touches a calendar**
(§8): CAL is a local drawing of what ROOT *asked for*, not a window onto what
Google did with it, and it will show a day as planned even if the 22:00 agent
never ran. The harness reads `js/cal.js` and fails on any URL, any `fetch(` and
any `XMLHttpRequest` — a stricter rule than PLAN's, which is at least allowed
Todoist.

Three decisions worth writing down. **The whole template is stored, not the
exported lines**: `mode: blocks` sends the assigned slots alone, but the day
still has the shape the template gives it, so the unclaimed slots and the
routine hours are kept and each can be switched off. **A stored day is a
record, not a live query**: every row carries its own clock time, calendar name
and colour, so renaming a project in March cannot repaint a day planned in
September. **The day is written on success, never on the attempt** — a drawn
day is a scheduled day, and telling those apart at a glance is the point.

**And the trap underneath it: a new app does not reach an existing install.**
`Prefs.apps` is stored whole and replaces the default whole, the same rule
Config uses for a branch — so adding `'cal'` to `Prefs.APPS` gave it a tab on a
fresh install and *nothing at all* on any install that had ever opened the
layout panel, which is every install that has ever been used. CAL would have
shipped invisible, which is the one bug a new tab can actually have. `appsSeen`
now records every app an install has been offered: an app in `APPS` it has
never seen is new and goes in, in its shipped position, while an app missing
from `apps` but present in `appsSeen` was switched off on purpose and stays
off. It persists immediately, or switching the new tab straight back off would
be undone on the next boot.

**Verified** — `test/harness.mjs`, 366 checks, all green, 38 of them new. CAL
reaching for nothing; the export writing the day under the day it is for and
carrying the whole template, two slots as tasks, four as idle and fourteen as
fixed; every row at the clock time PLAN resolved; a task's colour being the
same value as its PLAN tile's, and a recoloured project repainting the tile but
not the day already stored; an hour drawn 56px and a 90-minute block 84px; the
strip offering today with nothing on it; each dial really changing the drawing;
a failed export writing no day at all; a re-export replacing rather than
merging; the keep window sweeping behind and never ahead; the task findable by
name with its day on the row; and `cal_days_v1` filed under CAL in the storage
report. The migration is proved by booting a *second* jsdom window with prefs
already in localStorage — the only way to run `Prefs.load()` twice — once as an
install from before CAL, which gains the tab in its shipped position while the
apps it had switched off stay off, and once as an install that had already been
offered CAL and turned it down, which keeps it off.

**Not verified**: how any of it looks. jsdom does not lay out or paint, and the
browser this was built on had no extension connected to drive it, so the visual
pass is still owed.

### 2.19 — 2026-09-04 — one field over the lot, the quick cards, the history the sweep ate, and a tab that says something

**Search, and `/` finally means something.** The key used to open settings —
a shortcut to a menu rather than to a thing. It opens one field now, over a
sheet, that reaches the apps, everything Config holds (routines and their
items, packing lists, aisles and groceries, meals, PLAN's projects and
sections, its presets and calendars, TEND's plant types, all 54 TRACK topics),
whatever each app keeps in its own storage (DO's travel checklists, TEND's
plants by name, species *or* room, LEARN's decks) and **every settings dial by
the label it actually wears**. Eleven panels and about forty dials had made
"where do I change X" the longest walk in the app.

Nothing in it is a second list of what exists, which is the whole design: the
settings index is built by rendering the three generated panels into a detached
node and reading the labels off the real controls, and content comes straight
out of `Config.get()`. A routine renamed a second ago is findable a second
later — there is a check for exactly that. `lookHTML()` / `layoutHTML()` /
`behaveHTML()` were split out of their `render*` functions so this is possible
without drawing anything; apps answer for their own data through a `search`
hook on `Shell.register`. The sheet is a sibling of `#views`, not a child of
`#track` — the old rule — and being a `.sheet-back` sheet it gets Escape and
the suppression of the shell's own shortcuts for free, which is what lets you
type "b" in it without landing on another tab. It is reached from a row at the
top of the settings menu on a phone, where there is no `/` to press.

**DO: `@quick`.** A refresh now also fetches every open task carrying
`do.quickLabel`, and draws them as cards under the routine cards — read like a
routine card, because that is what they are. Two shapes, and the second is the
point: a task with no subtasks is one card and the card is the tick; a task
*with* subtasks becomes a checklist, its rows ticked one at a time, the head
counting `2 / 5` over a progress bar. One column rather than the routine grid's
two — a checklist at half width wraps every row.

Ticking the last row closes the parent in Todoist as well, and unticking one
reopens it. Todoist leaves a parent open under finished children, so without
that a quick task would have to be finished twice. The subtasks are found by
project, not by parent: they do not carry the label themselves, and one call
per distinct project (nearly always one) is more honest than leaning on a
filter the v1 API does not really offer. Same cache rule as the media tiles —
a task closed here stays, ticked, until midnight, and a *subtask* closed here
is carried over by hand, or a card would shrink as it was ticked and `3 / 5`
would never be reachable.

**DO kept no history at all, and threw one away every morning.** `loadState()`
deleted every `do_<date>` record on the first load of a new day. Each one is
folded into a rolling tally first — per routine, done and total — and the home
screen grows a strip of the last fourteen days, one flexed cell each, filled by
how much of that day got ticked, with the average and the number of full days
on its head. LOG's weekly and monthly reports grow a `routines` row out of the
same tally.

The key is **`do-stats-v1`, hyphenated**: the sweep matches `do_`, and a summary
the sweep can reach is a summary that lasts one day. That is the same reasoning
`log-scale-v2` was named under, and the third time this file has recorded that
trap. Today is read live out of the record being written and falls back to the
folded row, so a restored backup still draws. `total` is the routine's length
as it is now — the ticks are all that survive a sweep — so a routine that has
since grown makes an old day look slightly worse than it was. It starts empty
and fills in from here; nothing before today can be recovered, and the panel
says so.

**PLAN: queue presets.** A day that is the same five tasks every week was five
trips through the form every week. "save as preset" on the queue row keeps them
under a name in `plan.presets`, and a chip on the queue refills it with one tap.
A preset carries tasks and never a day — it is a shape of day, so applying one
dates every task from the form's own floor and re-resolves the project id from
the current mapping. Rename or delete one in settings → apps → plan, like every
other piece of content.

**LOG's tab says something now.** Its icon becomes a `!` when the morning is
still unwritten past 10:00, when the evening is past 21:00, or when nothing is
planned for tomorrow past 21:00 — all three hours editable, and an empty one
switches that rule off. The state is derived on the shell's own minute tick
(`onMinute`, one timer for the app rather than one per module), never stored,
so there is nothing to dismiss and nothing to go stale: write the morning and
the flag moves to the evening on its own. "Planned" means a task PLAN has
queued or sent for tomorrow carrying a block — `plannedOn()`. A block moved to
tomorrow from DO's "→ tomorrow" is a Todoist edit ROOT keeps no record of, and
deliberately does not count.

The nav belongs to the shell, so this is `Shell.alert(app, on, why)` next to
`Shell.badge()` — an app that reaches into the tab bar itself is an app that
fights `paintNav()`. And because an alert you cannot see is an alert you cannot
judge, settings → apps → log has four buttons that pin it to one rule: the tab
really does change, and stays changed until it is switched back off.

**Verified** — `test/harness.mjs`, 328 checks, all green, 41 of them new: `/`
opening search rather than settings and the sheet holding the keyboard while it
is up; a grocery item found through its aisle, a PLAN section through its
project, a dial by its rendered label, an app by its name, and a routine
renamed one line earlier; a plant found by its room and labelled with the app
it came from; picking a dial landing on its panel; Escape closing it; the sheet
sitting outside `#track`. Two quick tasks fetched from one label,
the childless one ticking itself and the one with subtasks refusing to, its
rows closing the subtask alone and then the parent with the last of them,
unticking reopening both, and a refetch keeping both the closed card and the
closed subtask. Today's ticks read live, the strip drawing one cell per day
asked for, the day surviving its own sweep as a folded row under a key `do_`
cannot reach, and the weekly report growing the row. A queue saved with no day
on it, its chip naming the count, one tap refilling it dated from today, the
editor rendering it and deleting it taking the chip with it. And the alert
walking morning → evening → plan as each is answered, going out when a block is
queued for tomorrow, the preview pinning and unpinning it, and the switch
holding it off whatever the hour.

**Not verified**: nothing in a browser — the Chrome extension is still
unreachable from here, which makes this the sixth entry in a row that has not
been looked at. On the phone: whether a quick card with five subtasks reads as
one card or as a wall, whether the fourteen-cell strip is legible at the
default density (the cells are about 18px wide on a phone), whether the search
sheet's field clears the keyboard on iOS with results under it, and whether a
`!` in the tab bar reads as urgent or merely as broken.

### 2.18 — 2026-09-03 — a task has a day, and it is picked with two arrows

**Everything PLAN sent was due today. Full stop, in code.** `startSending()`
wrote `due_string:'today'` on every task and every subtask, so planning
tomorrow morning meant sending the batch tomorrow morning. The task form has a
date row now — `←` the day in words `→` — sitting directly under the task name:

```
   ←        tomorrow          →
           FRI, 4 SEP
```

A stepper rather than a date field, and the same three parts LOG's date header
already has. A day is nearly always today or the next one or two; a native
picker is four taps and a keyboard for something a nudge should do. The middle
says `today` / `tomorrow` / the weekday while it is still this coming week and
the short date past that, with the resolved date always underneath, and it is
itself the way back to today — tapping it is the reset, the way tapping a
picked chip clears it. It wears the accent while it is on any other day.

**Nothing steps into the past.** Todoist would take an overdue date happily
enough, but there is no reason to plan backwards, and a floor is what gives the
left arrow's disabled state a meaning. The floor is re-derived from
`Shell.today()` on every paint, never captured — the form can be opened either
side of midnight.

**The day is sticky between tasks, and is not state.** Queueing a day's work is
one gesture with five tasks in it, so the next form opens on the day the last
one was queued for (`lastDate`, held in the module beside `openKey`, never
persisted and re-floored against the real today on every open — a day left over
from last night falls back on its own). The queue row wears a pill for it, but
only when the day is not today: most tasks still are, and saying so on every
row is noise.

**What Todoist is told is now an explicit `due_date`**, the day picked when the
task was queued — not the word "today" resolved whenever the send happens. A
queue can outlive the day it was built on, and subtasks take their parent's
day. A task queued before this version has no `date` and falls back to today.

**"Sent today" became "due today", which matters to LOG.** `plan_sent_v1` is
what the evening form offers as extra blocks, so a task sent *for tomorrow* has
no business in it; `recordSent()` keeps it out and `plannedToday()` filters the
queue the same way. The standing history takes every task either way, but files
each under the day it is **due** rather than the day it was pushed — that is
the day the row names, and the day the export is built out of.

**One row, one toggle** — `plan.formFields.date`, on by default. Which meant
fixing something the toggles had latent all along: an override is stored
whole-branch, so one written before a row existed has no key for it, and a
missing key was read as "off". PLAN and the editor both read that branch
through `Config.defaults()` now, and the toggle flips what the switch is
*showing* rather than what the override happens to hold — otherwise the first
tap on a never-seen switch set it to what it already said and did nothing.
Narrow to a fixed set of booleans: everywhere else the whole-branch rule
stands, because a list needs deletions to be expressible.

**Verified** — `test/harness.mjs`, 287 checks, all green, 22 of them new: the
row's three parts, starting on today with the left arrow dead; a tap right
reading `tomorrow` with the short date under it and the middle marking itself
moved; a second tap naming the weekday; the left arrow walking back; the floor
refusing two steps past today; the middle returning to it; a Config edit
landing under the open form keeping the day the way it keeps the name; the
queued task carrying the day it was *given* and the queue row pilling it (and
not pilling today); the next form opening on the same day; the POST bodies
carrying `due_date` per task with no `due_string` anywhere, and the subtask on
its parent's day; only the today task reaching `plan_sent_v1` and
`plannedToday()`; the history filing both under their due days and the row
naming it; an override predating the row still showing it, its switch reading
on, and one tap — not two — turning it off.

**Not verified**: nothing in a browser — the Chrome extension is still
unreachable from here, which makes this the fifth entry in a row that has not
been looked at. On the phone the things to check are whether the two arrows are
a comfortable thumb target at the default density, whether the word and the
date under it stay on one line each at the largest interface scale, and whether
the accent fill on the middle reads as "this is not today" rather than as a
selected chip.

### 2.17 — 2026-09-03 — the export: a day, written down for something else to build

**"+ cal" copied text into a chat. It sends a task now.** The picked rows of
the sent history become one Todoist task labelled `import` whose description is
a spec for one day; a 22:00 agent reads it, writes the calendar and deletes the
task. ROOT's half ends at the POST — it is a static page with no Google auth
and it is not getting any, so there is no OAuth here, no calendar API and no
calendar ids, only names passed through for something else to resolve. A
harness check reads every URL in `js/plan.js` and fails if one is not Todoist.

**Two new Config branches**, both editable under settings → apps → plan →
content. `plan.calendars` maps a project — or `project > section` where one
splits, which only `curate` does — to a calendar name; its editor splits on the
*first* pipe only, because every name has one of its own (`02A1 | curate
project mixing`). `plan.dayTemplates` holds `normal` and `rest`, each row being
minutes from the day's start plus a duration, so **the whole day comes off one
number** and nothing in it is a wall-clock constant.

**`rest` has four block slots, not six**, and that is the thing most likely to
catch someone out. `b3a`/`b3b` do not exist on a rest day — those hours are
free time — so assigning one is refused with a word, and switching to `rest`
with a b3 already given out drops it loudly rather than losing it later when
the description is written. The two templates otherwise differ only by the hour
of gym, which is why every offset after it is exactly an hour earlier there.

**Slots are assigned, not inferred.** `calLinesFor()` read `a`/`b` off the
order two tasks happened to be sent in, and the `@b1` label a task carried
decided its block. Both are gone: six named slots, tapped. Which means
`toggleSent()` no longer caps two per block — three b1 tasks going to b1a, b1b
and b2a is a perfectly good day — and the cap is now the six slots themselves.
A slot another task holds is refused by name; a task's own slot clears on a
second tap.

**The panel opens in the tile grid**, like the task form and for the same
reason: `#s-form` was deleted in 2.12 and no new `.scr` should replace it. Date
(tomorrow), start (persisted, in `plan_export_v1`, and the only thing that is),
template, mode, a slot row per picked task, notes, a preview at real resolved
clock times, and one button naming the count. In `full` mode the preview
carries the warning that the day will be replaced and that what is there now is
archived to `00B | schedule 2` — worded as what *will* happen, since ROOT
cannot see the calendar to say what is there. The export button is simply
absent while a picked task has no slot, which is the only state where the
description could drop one silently.

The three text fields repaint the preview alone rather than the whole panel —
a full redraw pulls the caret out of the field mid-word — while everything else
redraws the grid and `paintExport()` puts the fields back, so a Config edit or
an arriving label fetch never loses what has been typed.

**Verified** — `test/harness.mjs`, 265 checks, all green, 42 of them new: both
templates resolving at 07:00 *and* 09:30 (one start time proves nothing about
an offset model), including a 17-hour day ending past midnight and marked `+1`;
`rest` carrying four slots and `normal` six, with every row butting onto the
next; a b3 assignment refused on `rest` with the toast, the b3 chips marked
not-on-offer, and the switch to `rest` dropping a b3 already given; a slot
another task holds refused by name; a seventh pick refused; the description
byte-exact for a five-task mixed export across four calendars, with `notes:`
absent when empty and one dash per line when not; a `plan.calendars` edit
reaching the preview and the description mid-panel while the notes textarea
keeps what was typed, and the reset putting the shipped calendar back; the
preview counting one line per picked row in `blocks` and the whole template in
`full`; the POST going to `api.todoist.com/api/v1/tasks` with `["import"]` and
the description verbatim; a toast on success *and* on a 500, which leaves the
panel up with its button back. Plus the eight shipped calendars, both editors
rendering in the plan panel, and the templates round-tripping through their
text form (with `1h30` read as ninety minutes). The harness also prints its
results now when something throws part-way, instead of losing every one.

**Not verified**: nothing in a browser — the Chrome extension is still
unreachable from here, so this is the fourth entry in a row that has not been
looked at. The panel is a tall one and the things to check on the phone are
whether five slot rows of six chips each read as a grid or as a wall, whether
the preview's three columns hold at a narrow width, and whether opening the
panel from the sent list — which jumps the page to the top — reads as arriving
somewhere or as losing your place.

### 2.16 — 2026-09-03 — one calendar from several sent tasks, and the open tile stops being a box

**"+ cal" is one button for a whole day, not one per row.** 2.15 gave every
sent row its own "+ 📅", which could only ever guess at the block's other
half by looking it up in the history. Tapping a row now *picks* it — the row
fills with its project's colour, the way a queued tile does — and a single
"+ cal" on the sent title row copies one template covering everything picked:

```
b1a : curate > mix the track
b1b : curate > master it
b2a : home > dishes
b2b : home > dishes
```

One template per block, the blocks in the order the form's chips are in
(`plan.blocks`) whatever order the rows were tapped in, anything unknown after
them, and blockless tasks last as bare `project > task` lines. Within a block
the two halves still split in send order (`ts`), and one picked task still
fills both halves.

**Two per block is the ceiling.** A block has an `a` and a `b` and nothing
else, so a third tap on a b2 row is refused with `b2 is full — two per block`
rather than being accepted and silently dropped at copy time. Blockless tasks
have no half to name, so nothing caps them.

The selection is a gesture, not state: held in the module, never persisted,
and keyed by each task's `ts` rather than its row index — the list is
unshifted on every send, and an index would slide onto a different task.
`renderSent()` drops any key whose row has gone. The button is absent until
something is picked, and names the count, which is the rule the send button
already followed.

**The open project tile stops being a box.** No wash, no border, half a tile
tall: just the name at 24px with its colour dot beside it, so it reads as the
heading over the section rows instead of a banner competing with them. Its
horizontal padding stays, so the name lines up with the rows' own text. The
same is now true with the form open under it — `.open.wide` no longer grows
the heading, and is kept only as the state marker `aria-expanded` and the
harness read. Two rules exist purely to stop the box being painted back in:
`:active` is more specific than `.open`, and `.has` is as specific and
declared earlier.

**Verified** — `test/harness.mjs`, 223 checks, all green, ten of them new:
five tasks sent into b1 ×3, b2 and no block, each row a `<button>` with
`aria-pressed` and no per-row +cal; a tap selecting one and bringing "+ cal"
out with its count; a second of the same block joining; a third refused with
the toast saying why; a tap letting one go and freeing the block again; two
tasks splitting a block a-then-b whichever order they were tapped in; one
filling both halves; a blockless one copying bare; three blocks coming out in
the form's order with the blockless line last; the clipboard getting the
whole thing; clear emptying the list, the key *and* the selection. Plus three
reading the open tile's rules off `plan.css`, since jsdom loads no
stylesheets. **Not verified**: nothing in a browser. The picked row's 14%
wash, the "+ cal" chip's size on the title row and the heading at half a
tile all want one look on the phone.

### 2.15 — 2026-09-03 — the sent history, and the open tile as a heading

**The open project tile is a heading, not a banner.** Its name sits where an
unopened tile has it — top left, the colour dot to its left — at 24px rather
than the up-to-92px centred slab 2.12 gave it, shrinking only if a long name
would not fit the row. The tile is one tile tall again (1.15 with the form
open, so the growth is still there to see). Both it and the section rows are
filled exactly as DO's block tiles are: a 10% wash of the label's colour with
the colour itself on the border.

**A sent history.** Everything PLAN has ever pushed, newest first, in a new
section under the queue: the task, its project, its block and the day, with
"clear all" on the title row. It is its own key (`plan_history_v1`, capped at
200) rather than an extension of `plan_sent_v1` — that one is today's only,
is emptied each morning and is read by LOG, so it cannot be allowed to grow
a past.

**"+ 📅" copies a task's block as calendar lines.** Each row has one, and it
puts on the clipboard exactly what the day's template wants:

```
b1a : curate > mix the track
b1b : curate > master it
```

A block is two halves, `a` and `b`. Two tasks in a block split it in the
order they were sent — `ts` is nudged by the position in the batch so a
single send of several tasks keeps its order. **One** task in a block fills
both halves with itself, which is the case the format exists for. A task sent
with no block has no half to name and copies the bare `project > task`.
`navigator.clipboard` first, with the old hidden-textarea path behind it for
where that is refused.

**Verified** — `test/harness.mjs`, 213 checks, all green: three tasks sent
into two blocks landing newest-first with a +cal button each, named for
project, block and day, counted on the title row; two tasks in b1 copying one
line each in send order, either row of that block copying the same pair; one
task in b2 filling both halves; a blockless task copying the bare line; the
button reaching the clipboard; clear emptying the list and its key while
leaving today's `plan_sent_v1` alone. **Not verified**: nothing in a browser.
The 24px heading and the +cal button's size are both worth an eye, and the
clipboard write has not been exercised against a real permission prompt.

### 2.14 — 2026-09-03 — PLAN's project morph, done properly

**Opening a project looked wrong, and the reason was the flip keys.** Each
section row borrowed the key of the project tile it replaced, so the rows did
not appear — they *flew in from wherever those tiles happened to sit*, being
squashed from a tile's width to the full width on the way. Row 1 came from
the tile beside the one you tapped and looked almost right; rows 2 and 3 came
from the middle of the grid and travelled diagonally while stretching, which
is exactly what read as rubbery. Opening a section's *form* looked clean only
by accident: its key matched nothing, so nothing animated at all.

`flip()` is now three explicit cases:

| the element | what happens |
| --- | --- |
| was there, same shape | translate only — the queue sliding to follow the grid's new height, with no scaling of a box that did not change shape |
| was there, changed shape | translate and scale the box, and hold its **contents** at `opacity:0` until 45% through, so text is never seen mid-scale |
| is new | fade up 7px into place, staggered 45ms down the list |

Rows own their keys (`sec:<i>`) and the form panel owns its own (`form:<i>`),
so neither pretends to be something else: the only thing that moves when a
project opens is the one thing that genuinely persists, its tile, growing.
The rows then open beneath it in sequence. Holding the contents back is what
makes the tile's growth clean — it goes from a third of the width to full
width, and no counter-scaling trick survives that; not drawing the text until
the box has nearly arrived does.

**The transition now has tests.** jsdom has neither layout nor Web
Animations, so `flip()` had been a complete no-op in every run to date and
none of its branches was ever reached. The harness stands in for both — a
scripted before/after layout and a recording `Element.animate` — and reads
back what was asked for.

**Verified** — `test/harness.mjs`, 202 checks, all green, including the five
new ones: the tile scaling from `(0.456, 0.742)` and no other element
scaling; its children held to `opacity:0` past the 45% mark; all three rows
revealed with a translate and no scale; their delays strictly increasing; the
queue translating by exactly its 40px displacement with no scale in the
keyframes. Plus the guard that a section row may never carry a `p:` key
again. **Not verified**: nothing in a browser. The one rough edge left is
that the tiles being replaced still vanish with the `innerHTML` swap rather
than fading — the staggered reveal covers it, but it is the thing to look at
first if the open still feels abrupt.

### 2.13 — 2026-09-02 — the title slides, the gap is the shell's, send when there is something to send

**The title morph is a slide.** The blur-and-scale settle is gone. The
incoming wordmark — or the sub-screen header the slide was left on — comes in
from the side you are moving towards while the outgoing one leaves the other
way, so the two read as one title being pushed along. `Shell.show()` takes
the direction from the move and writes `--dir` (+1 forward, −1 back) on both
slides; the keyframes are a translate and a fade, nothing else. The band is
`overflow:hidden` so nothing spills sideways mid-slide.

**The gap under the band belongs to the shell.** It used to be whatever
bottom margin each app had put on its own wordmark — 6px on TRACK, 28px on
DO — and 2.12 deleted those, which left the content flush. It is one rule
now (`.view-body #s-home`), with the first element's own top margin
cancelled so it cannot add to it. DO is the one app whose first section can
be switched off, so `markFirstSection()` marks the first one *actually on
screen* — CSS's `:first-child` would land on a `display:none` block — and
that one drops its top margin.

**The send button is absent, not faded.** It appears only once the queue has
something in it, names the count, and steps out of the way while the task
form is open rather than sitting under it (`PLAN.syncSend()`). The disabled
state and its style are gone.

**No "none" chip on the block row.** No block is the starting state, and
tapping the chip that is already on clears it — `optPick()` toggles now, so
the time row (which keeps its none chip) gained the same gesture for free.

**Verified** — `test/harness.mjs`, 197 checks, all green: `--dir` −1 moving
back through the tabs and +1 forward; the gap set once in `shell.css` and
DO marking the first visible section on both its tabs; the send button hidden
on an empty queue with no disabled attribute, appearing as "send 1 task to
todoist", and hidden again while the form is open; the block row with no
none chip, a pick selecting and a second tap clearing it. **Not verified**:
nothing in a browser. The slide's distance (34px) and the 18px gap are both
eyeball numbers that deserve one look on the phone.

### 2.12 — 2026-09-02 — one band shape, slower motion, PLAN's form in the grid

**Every title band is now the same box.** The morph in 2.11 read as a stumble
because the eight bands were eight different heights — each app had its own
padding, its own wordmark size (48 / 44 / 54) and its own bottom margin, and
DO's daily/media/other strip made its band taller again. `shell.css` sets the
rhythm once: a fixed-height label row, then the wordmark, bottom-aligned,
with the band sized off the wordmark alone. `--title-base` is one value at
`:root` (54px, still multiplied by the Title size dial), the per-app `.h-top`
/ `.h-logo` boxes are **deleted** from all eight sheets rather than left to
lose a specificity fight, and DO's tab chips are a fixed 32px tall so the
strip can never be what drives the height. A harness check reads the sheets
and fails if one starts setting its own again.

**The motion is doubled.** The cross-fade, the title morph and PLAN's FLIPs
were over before the eye caught them. They are tokens now — `--t-fade`,
`--t-title-in`, `--t-title-out`, `--t-flip` in `tokens.css`, all multiplied
by `--mo` so the Motion setting still governs them — at twice what 2.11
shipped with. `flipMs()` reads `--t-flip` so the Web Animations calls keep
step with the CSS.

**PLAN's task form is the third step of the same expansion.** Tapping a
section no longer leaves the home screen: the section rows become a panel two
tiles wide and four tall, morphing out of the row that was tapped, while the
project's title tile grows again above it (`.open.wide`). The `#s-form`
screen is gone from the markup — the panel carries the same ids, so
`optPick` / `prioPick` / `addToQueue` are untouched — and `paintForm()` puts
every control back from `formState` on each draw, so a re-render never loses
what has been typed. Adding to the queue folds the whole grid back up.

**Which form rows appear is a setting.** `plan.formFields` (block / time
estimate / priority / subtasks) with an editor under settings → apps → plan →
content. **The time estimate is off by default** — it is dead weight for a
day planned in blocks — but its chips are kept, so switching it back on costs
nothing. Every row's element is optional now, and the functions that touch
them all guard.

**The open project tile, properly.** The name is centred in the box with the
colour dot under it, both centred on both axes, and `fitTitle()` sizes it
from the tile's own height (up to 92px, shrinking only if it would overrun
the width) rather than the flat 34px it had. "n sections" is hidden while the
rows are showing, since the rows are what it was counting.

**One real bug found on the way.** PLAN's `onShow` only redrew when its home
screen was showing, to protect the form's chips from being wiped. The form
lives in the grid now and repaints itself from state, so the guard is gone —
and with it the case where arriving on PLAN after using another screen left
the tiles on a stale palette.

**Verified** — `test/harness.mjs`, 186 checks, all green: no app sheet
setting a band box or a wordmark size and one `--title-base` for all of them;
the form opening as a panel keyed to the row it came from with the title tile
`.wide` and the section named in its head; `#s-form` gone; the time row off
by default and following the setting both ways; the block chips in their
label's colour inside the panel; a Config edit mid-form keeping the typed
name and the picked block; cancel returning to the rows with the project
still open; add-to-queue filing under the right section and folding the grid.
**Not verified**: still nothing in a browser. The band height, the centred
title at its new size, the four-tile panel and the doubled timings are all
unseen — the timings especially are a judgement call worth one pass on the
phone.

### 2.11 — 2026-09-02 — the cross-fade, the title morph, PLAN opens in place

**The glider is gone.** 2.10's sliding, squashing shape under the active tab
is reverted: the filled pill is back to a `::before` per button that grows
into place. `themes.css` and `tokens.css` key off `.tab-b.on::before` again.

**Tabs cross-fade; the title morphs.** The slides are stacked rather than
laid side by side, and `#track` no longer moves at all. `Shell.show()` gives
the incoming slide `.cur` (opaque, and the only one that takes a tap) and the
outgoing one `.leaving` while it fades. The incoming slide also gets `.morph`
for a beat, which plays its title in from a blur and a slight scale while the
old one blurs away — its wordmark on a home, or the `.hd-title` of whichever
sub-screen that slide was left on, so a tab sitting in a sub-menu morphs that
header instead. `park()` does the same with `#track.still`, which suppresses
both. The swipe now only picks the next or previous tab once it is far or
fast enough; it no longer drags the slide under the finger, and the
rubber-band at the ends went with it.

**The pill sits on the safe area.** `--nav-gap` is 0, and everything that
parks itself above the pill (`#nav`, the arrows, PLAN's send button, TEND's
add bar and undo pill, the toast) uses `max(6px, gap + safe-area)`, so on a
phone it rides the home indicator and on a laptop it keeps 6px off the edge.

**PLAN opens a project in place.** The bottom sheet is gone from the markup.
Tapping a tile expands it across both columns with its name grown to the
largest size that still fits one line (`fitTitle`, measured in px), and the
other tiles become the project's section rows — full width, about half a tile
tall, in the project's colour. A FLIP does the movement: every `[data-flip]`
element's box is noted before the re-render and replayed from it after, and
each section row borrows the flip key of the tile it grows out of, so the
tiles visibly become the rows and the queue slides up or down to follow the
grid's new height. Tapping the open tile closes it; tapping another swaps;
picking a section opens the form and leaves the grid folded for the way back.
`openKey` is not persisted — it is a gesture, not state.

**Smaller.** The "nothing queued yet" block is gone: an empty queue already
says "empty" next to the QUEUE title. A tile's "n sections" line is drawn in
the tile's own colour rather than muted grey.

**Verified** — `test/harness.mjs`, 177 checks, all green: no glider and the
active tab carrying its own pill; a tab change marking the incoming slide
`.cur` + `.morph` and the outgoing one `.leaving`, the track's transform
never set, the leaving class cleared once the fade is over, and a slide left
on LOG's evening form morphing that header; the sheet gone from the markup;
no placeholder block with the count reading "empty"; a project expanding to
one open tile with the right number of section rows, the rows named and
coloured from the project and keyed to the tiles they grow from; the open
tile closing on a second tap, another project swapping in, and a section
opening the form with the grid folded. The section-count colour is read off
`plan.css` itself, since jsdom loads no stylesheets. **Not verified**: still
nothing in a browser — the Chrome extension remains unreachable — so the
cross-fade timing, the title morph, the FLIP into the section rows and the
pill's new resting place have not been seen.

### 2.10 — 2026-09-02 — the title band, the glider, blocks → tomorrow, PLAN in label colours

**The title is a fixed band, not a sticky element.** The fade under 2.9's
sticky header is gone, and so is the sticky. `Shell` now splits every slide
at boot into the home's `.h-top` — a band at the top, below the status bar,
outside the scroller — and `.view-body`, the scroll container holding every
screen. Content starts exactly under the band, nothing rides the rubber
band, and the scrollbar is hidden (`scrollbar-width:none` + the webkit
pseudo, which iOS honours). A sub-screen hides the band (`:has`) and brings
its own sticky `.hd`. The modules' `view` handles now point at the body, as
do the shell's scroll save/restore, the chrome watcher and tap-for-top. The
home screens' own `env(safe-area-inset-top)` padding is zeroed; the band
carries it. That is also what fixes the "other" tab (and the rest): the gap
under the title is the header's own bottom margin now, the same everywhere.

**The nav glider.** The active tab's filled shape is one `.nav-glider`
(made by Shell, `data-app` set to the active app) slid from tab to tab with
an overshoot curve and a squash-and-stretch keyframe mid-flight, instead of a
`::before` fading in and out per button. Measured from the button, so it
turns vertical on the desktop rail. Colour-coded tabs and the accent glow
key off the glider now; reduced motion stills it.

**Title size.** Settings → appearance → layout → "Title size": xs / s / m /
l / xl (`titleSize`, `data-title`, `--title-scale` 0.72–1.34) on the
wordmarks. Each app declares its base (`--title-base`: 54px, DO 48, settings
44) and `shell.css` multiplies.

**Blocks → tomorrow.** "→ tomorrow" on the blocks head (next to hide done)
switches the tiles from tick to select: a row of the block labels — b1 b2 b3,
each in its own Todoist colour — appears under the head, you tap the tiles
to move, then the slot. Each is rescheduled to tomorrow with that block label
replacing its current one (its other labels kept) in Todoist, and leaves the
list. "cancel" or an empty list ends the mode; the selection is a gesture,
not state. The cached block task keeps its full `labels` for this.

**PLAN in label colours.** `Todoist` (shell.js) gained a shared label-colour
cache, `root_labels_v1` — DO fills it as a side effect of its `/labels`
calls, `Todoist.labels()` refreshes it when older than an hour, single-flight
— and `Todoist.COLORS` is the one name → hex table. PLAN's project tiles
take their label's colour when the cache knows one (curate, home, edu … are
labels too, so a tile matches DO's block tiles) and the Settings colour
otherwise, drawn as the block tiles are: a wash of the colour, the colour on
the border, deeper when something is queued. The form's b1 / b2 / b3 chips
wear their label colour the same way. PLAN's `onShow` refreshes the cache
and redraws the home only, so an open form keeps its picks.

**Verified** — `test/harness.mjs`, 164 checks, all green: every slide a
band plus a body, DO's strip and date in the band, the screens in the body;
the glider keyed by app and following `go()`; the title dial's attribute and
default; a block task with "→ tomorrow" on its head, the slot row in violet /
teal / orange disabled until a tile is picked, a tap selecting rather than
closing, the slot posting `due_string: tomorrow` with `["curate","b2"]`, the
tile gone and the row folded; the colour cache filled; PLAN's curate tile in
grape and its b1 chip in violet. Two older checks moved from the home's
second child to its first, since the band left the screen. **Not verified**:
nothing in a browser — the extension is still unreachable — and this entry
is the most visual yet: the band's height, the `:has()` hide on sub-screens,
the glider's overshoot and squash, the hidden scrollbar on iOS and the PLAN
washes are all unseen.

### 2.9 — 2026-09-02 — the left arrow as back, sticky titles, → tomorrow

Six points from the first look at 2.8 on the phone.

**Media stays out of the forms.** The evening form's "media finished" row is
gone: a tick on the media tab closes the task in Todoist and lands in the
day's note, the weekly and monthly reports, and now LOG's history rows (a
`media: …` pill on a past day) — nothing else. `LOG.setMedia()` still writes
the record; `renderMedia` / `toggleMediaLocal` are removed.

**The left arrow is the back button.** Inside any sub-screen — a DO
checklist, LOG's evening form, a STORE category, a settings category — the
top-left "← back" is the far corner of a phone. The shell now watches the
track for `.scr` class changes (one `MutationObserver`, no per-app wiring):
whenever the current slide shows a `.scr.on` other than `#s-home` that has an
`.hd-back`, the left arrow turns into it (`.is-back`: the accent, an arrow
with a tail) and pressing it presses that button. Back home, it is the
previous-tab arrow again. **Tapping the tab you are on goes to that app's
home** — each module registered a `home` hook (`DO`/`PLAN`/`STORE` → `go('home')`,
LOG → `goBack()` with its unsaved check, LEARN leaves a study session
properly, settings → the menu); an app without one gets its back button
pressed until there is none. Already home, the tap scrolls to the top.

**Sticky titles.** Every home's `.h-top` (the date line, the logo, DO's tab
strip) is `position:sticky` on the page ground with a short gradient under
it, so what scrolls up fades behind the title and nothing runs under the
status bar any more. LOG's header gained the `.h-top` wrapper the others
already had, with its own safe-area padding. Sub-screen `.hd` headers were
already sticky.

**The strip under the home indicator.** It painted black under a near-black
theme: `<html>` had no background and `color-scheme:dark` makes the root
canvas black. `html{background:var(--bg)}`. The pill also sits lower —
`--nav-gap` 12px → 6px above the safe area; the arrows and the toast follow.

**The settings button wears the open app's icon.** On an app opened from the
settings home (out of the bar), the settings tab shows that app's sprite
icon and name and lights up; tapping it goes to the settings home and
retires the slide. `paintNav()` swaps the `<use>` href back on any other tab.

**"→ tomorrow" on the today list.** When the list has open fetched tasks, a
button on its head reschedules them to tomorrow in Todoist
(`POST /tasks/{id}` with `due_string: "tomorrow"`) after a confirm, and they
drop off the list. Plants are not touched — TEND owns those. *(Since 2.20.1
this is a select-then-move gesture like the blocks section's, and no longer
gated on the hour — see that entry. `DO.deferToday()` with nothing selected
still moves every open task, which is what it always did.)*

**Verified** — `test/harness.mjs`, 149 checks, all green: no media row on
the evening form, a past day's media pill in history; the arrow plain on a
home, `.is-back` and enabled inside a checklist, going back when pressed; the
DO tab tapped on a checklist landing home; a settings category counting as a
sub-screen and the settings tab returning to the menu; TEND opened from the
home putting `#tab-tend` and "tend" on the settings button, that button
going home and retiring the slide with `#tab-set` back; two tasks due today
moved to tomorrow with the right due string and gone from the list, the
button present exactly when the hour is 20 or later. **Not verified**:
nothing in a browser again (the extension is still unreachable). The sticky
titles and the gradient, the pill 6px lower, the root background under the
home indicator and the arrow's back icon are all visual and unseen; the
sticky DO header is ~120px tall with the tab strip in it, which is what was
asked for but worth a look.

### 2.8 — 2026-09-02 — the media tab, the settings menu, apps out of the bar

**A media tab on DO**, between daily and other (`do.tabs` gains a fixed
`media` id; an older override gets it spliced in on read). It fetches every
open Todoist task carrying one of `do.mediaLabels` (@movie @show @podcast
@music, editable under settings → apps → do → content), whatever its date,
and draws them as the block tiles — three across — grouped under the label,
the group head and the tiles in the label's own Todoist colour. A task's
second label (@album / @set / @track under @music) is a small chip on the
tile. Ticking fills the tile with the large tick, closes the task in Todoist
and writes the title into today's LOG record; unticking reopens it and takes
it back. A closed task stays, ticked, until midnight; the rest of the list
carries over. "hide done" and "refresh" sit in the section head; the switch
is under settings → apps → do. Not counted in the DO badge — it is a
backlog, not today's work.

**Media in LOG.** A new `e.media` list in the day record (`{ name, kind,
sub }`), a conditional `#### media` section in the daily note (`media_count`,
then one `media_<kind>` row per label, titles joined by `;`, the second label
in brackets), a `| media | n finished |` row under habits and a `## media`
section (count per type, then the titles) in the weekly and monthly reports,
and the parser reads the rows back so pasted notes feed them. The evening
form shows the day's media as chips under the blocks — DO's list for the real
today, ticked ones selected in the label colour, tapping goes through DO so
Todoist follows. Deliberately **not** a block: a title is not a focus block
and would eat the six-block cap.

**The settings page scrolled to the top on every app switch.** Two causes.
`Shell.rebuild()` re-appends every `.view` to re-order the track, and moving a
scroll container out of the document resets its scroll; the app list sits
well down the layout panel, so every toggle landed at the top. It saves and
restores each slide's `scrollTop` now, and the settings handler wraps its own
re-render in `keepScroll()`.

**The pill no longer takes the whole bottom.** `data-tabs="many"` is gone
from Prefs and `shell.css`; the pill stays at its phone width and the arrows
are always there. The apps that do not fit are switched off under appearance
→ layout and appear on the settings home as tiles (their tab icon, name and
hint); tapping one opens its slide — `Shell.open()` puts it into the track
just before settings with no tab button, and `retire()` takes it out again
once you have moved on. `#tend` in the address bar opens a hidden app the
same way.

**Settings is a menu now.** The home screen: the apps out of the bar, then
three categories. **apps** is the pill bar do / log / plan / store / tend /
track / learn, each panel ending with that app's content editors (the content
panel is gone — `do.routines` under do, `log.blocks` under log, and so on).
**appearance** is look / layout / behaviour. **data** is the one panel, no
pill bar. A category is a sub-screen with the same sticky back header the
apps use; `#settings/<panel>` still deep-links.

**Verified** — `test/harness.mjs`, 136 checks, all green: the media tab in
the right place, hidden on daily; three groups in red / blue / green with the
album chip on the music tile; tick → closed in Todoist, filled, in the log
with kind and sub-label, in the note as `media_music | Blonde (album)`, on
the evening form selected in green with its caption; untick reverses all of
it; the weekly and monthly rows and sections, parsed notes fed back, no
section on an empty day; the settings home with three categories; two apps
kept, five listed; opening TEND from the home puts it before settings with
no tab, leaving it retires the slide; the apps category with seven pills and
DO's editors in DO's panel; data without a pill bar; look under appearance;
back to the home. **Not verified**: nothing in a browser — the Chrome
extension was not reachable. The scroll fix in particular is browser-only
(jsdom's `scrollTop` is always 0), and the eight-app pill at 240px with the
arrows back deserves a look before deciding which apps to leave in it.

### 2.7 — 2026-09-02 — DO polish

**Space under the blocks.** A `.tt` section had a top margin and no bottom
one, fine while it was last; with the blocks first the routine grid sat flush
under the tiles. Both sections own their space below now, and the tile grid
wraps to as many rows as the day has tasks (three across on a phone).

**"hide done"** in the blocks header, where "refresh" sits on the today list.
Finished tiles drop out, the count stays, "all done" is said when nothing is
left. Persisted in `do_todoist_v1.blocksHideDone`.

**Progress bars tinted by progress.** Every DO bar — routine cards, the
checklist, the travel card, each travel list, each open list — runs from the
foreground colour at nothing done to green at everything done
(`color-mix(--gr N%, --tx)`, inline). The foreground rather than white so a
light theme's white card still shows the bar.

**Done tiles.** The small check box in the tile's corner sat on the text. Gone:
a finished tile fades its text back into the surface and draws one large tick
across the whole tile in the label's colour. CSS only; the markup and the
harness are unchanged.

**Verified** — `test/harness.mjs`, 111 checks, all green, including the
hide-done toggle both ways and the tinted bar. **Not verified**: the tint on
a light theme, and the full-tile tick.

### 2.6 — 2026-09-02 — DO's home, arranged

**Sections in any order.** DO's first tab has three sections — the block
tasks, the routine cards, the today list — and Settings → do → "home layout"
moves them up and down (`do.sections` in Config; blocks first by default).
The order is applied by moving the three real elements under the header, so
nothing else knows about it. **Only the first tab** shows the today list and
the blocks; "other" is for the odd routines.

**Block colour is the task's other label.** A planned task carries a slot
label (@b1…) and a subject label (@curate, @home…); the tile takes the
subject's Todoist colour and shows `@b1 · curate`. A task with no second label
keeps the slot label's colour.

**Section names on every today row, in the project's colour.** A
whole-project rule now fetches the project's sections and names each task's
own; the chip is tinted with the project's Todoist colour.

**The active tab's badge is the icon.** On the selected tab the count takes
the icon's place in the on-accent colour (`has-badge` on the button, set by
`Shell.badge`); on idle tabs it is the small pill as before.

**Verified** — `test/harness.mjs`, 108 checks, all green: blocks first in the
DOM by default and moved by `moveSection`; the today list and blocks hidden on
"other" and back on "daily"; the active DO tab carrying `has-badge` with the
count; a whole-project rule naming the section in `#4073ff`; a task labelled
@b1 + @curate drawn in grape (`#884dff`) with `@b1 · curate`. **Not verified**:
none of it on the phone; the count-as-icon in particular deserves a look with
tab names switched on.

### 2.5 — 2026-09-02 — the phone pass: what the first look on a real phone turned up

Four fixes from the phone, one removal, one addition.

**The caps switch did nothing.** 2.0 expressed "uppercase labels off" as an
override list of fourteen classes; the app sheets carry 113 `uppercase`
declarations. Every one now reads `text-transform:var(--caps)` (rewritten
mechanically, `tokens.css` sets `--caps:none` under `[data-caps="off"]`), and
the override list is gone. A new label must use the token.

**Fonts grew on rotation and stayed grown.** iOS Safari's text-size-adjust
inflates some text in landscape and keeps it on the way back.
`-webkit-text-size-adjust:100%` on `<html>` pins it. And since the app is not
meant to rotate at all: Settings → behaviour → "stay in portrait" (on by
default) draws a curtain over a phone-sized touch screen in landscape until
it is turned back, and calls `screen.orientation.lock` where a platform
honours it (Android, installed). iOS cannot be locked from a page; the
curtain is the lock there.

**The badge inverted badly on the active tab.** It sits on the ground colour
with an accent ring there now, instead of flipping to on-accent.

**Todoist label chips removed** from the today rows; priority, overdue date,
section and the tend tag stay.

**Block tasks on DO.** Under the today list, every open task due today that
carries one of PLAN's block labels (`plan.blocks`: @b1 @b2 @b3) is a tile in
the label's own Todoist colour (`/labels` gives the colour name; a table maps
Todoist's twenty names to hex). Ticking fills the tile with a check, closes the
task in Todoist and writes the task name into today's LOG record as a completed
block — straight to storage, so it is in the note whether or not the evening
form is opened — and LOG's evening form shows it selected, in the same colour,
among the planned chips. Unticking reopens the task and takes the block back.
Cached per day in `do_todoist_v1.blocks`, same rule as the today list; counted
in the badge; switchable under Settings → do.

**Verified** — `test/harness.mjs`, 102 checks, all green: the portrait and
caps attributes; a block task due today drawn as one tile in `#af38eb` with
its @b1 tag while a tomorrow one is not; no label chips; the tick closes the
task, fills the tile and lands in today's log; the evening form shows it
selected in the label colour; the untick reopens and deselects. **Not
verified**: the curtain, the badge on the active tab and the tiles have not
been seen; the caps switch has not been looked at on every screen.

### 2.4 — 2026-09-02 — TEND on Todoist and on DO, the open count, study in the reports

**TEND pushes today's round to Todoist.** Each plant due today becomes one
task — "water basil" — in a project and section set under Settings → tend
(default `04 | life` › `home | chores`), with a label (`home`), a priority (p2)
and today's due date. A tick anywhere closes it everywhere: TEND's round, the
detail sheet, DO's today block and Todoist itself. Undo, deleting today's
entry or unticking on DO reopens it. Todoist → TEND works on sync: a task
pushed today that is no longer open and that TEND did not close itself was
completed over there, so the care event is logged. The pushed ids live in
`tend_todoist_v1`, outside `tend.v3`, because `normalise()` would drop them.
Sync only ever adds and closes. It runs quietly from `onShow` when older than
ten minutes, and from the ⇅ button on TEND's home or "sync now" in its panel.
`Todoist` in `shell.js` is the shared client (call, getAll, resolve by name,
due date); DO keeps its own because of the proxy option.

**The plants are on DO's today block.** Drawn from TEND directly, with the
glyph, the label and priority as chips and a "tend" tag, pushed or not
(Settings → tend → "show due plants on DO"). A fetched task TEND pushed is
dropped by id, so nothing is listed twice. The block now shows when either
source has something.

**An open count on the DO tab.** `Shell.badge('do', n)` puts what is still
open today — Todoist tasks plus plants — on the tab button, and DO's date
line says "· n to do". Zero removes both. On the wide rail the badge sits at
the row's end.

**Study in the weekly and monthly reports.** A `| study | n topics · n cards |`
row under habits and a `## study` section (topics finished, cards rated and
acquired, the topic titles as a list). A day parsed from Obsidian uses its
note's `cap_*` / `anki_*` rows; a local day asks TRACK and LEARN directly.

**Verified** — `test/harness.mjs`, 93 checks, all green, including: the fern
due on TEND's list; one sync creates a task with the right project, section,
label, priority and due string against a scripted Todoist and records its id;
the plant on DO's block with `@home` and `p2`; the badge and date line at 1;
ticking on DO logs the watering and closes the task, the badge clears;
unticking removes it and reopens the task; a task completed in Todoist is
logged on the next sync and shows ticked on DO; the weekly and monthly reports
with the study row, section and a topic title from local data, and from a
pasted note. **Not verified**: nothing in a browser and nothing against real
Todoist. The badge and the plant rows have not been seen.

### 2.3 — 2026-09-02 — two phone bugs and three links between the apps

**Decimal fields could not be typed on the phone.** Weight, sleep hours and
the two km fields were `type=number inputmode=decimal`; the French keypad's
decimal key is a comma, and iOS refuses a comma in a number field, so the
value silently stayed empty. They are `type=text inputmode=decimal` now (STORE's
budget too), the shell swaps the comma for a dot as it is typed, and LOG's
save normalises again on the way to storage. The stored strings are unchanged
in shape, so the `.md` and the reports are untouched.

**Scrolling the theme gallery applied a theme.** A finger scrolling the look
panel fires `pointerover` on every card it crosses, which previewed each one,
and `:hover` sticks to the last card after the finger lifts, so the preview
was never reverted: the app changed to a theme that was neither saved nor
marked selected. Preview is mouse-only now (`pointerType`), `pointercancel`
reverts, and a tap still picks.

**Today's tasks from Todoist, on DO.** A block under the routine cards, not a
card: the open tasks due today (and overdue, switchable) in the projects and
sections listed under Settings → do, one per line as `project > section`.
Each row shows the priority (`p1`–`p3`), the labels and the section; overdue
rows are flagged. Ticking closes the task in Todoist, unticking reopens it,
both optimistic with a rollback on failure. The day's list is cached in
`do_todoist_v1` so a closed task stays visible, ticked, until midnight — the
API does not return completed tasks, and without the cache there would be
nothing to untick. It refetches silently when the tab comes back after ten
minutes, and drops the cache on the day rollover.

**PLAN's plans on LOG's evening form.** Whatever PLAN queued or sent today is
offered under the block buttons as extra blocks, in the project's colour, with
the project / time block / estimate as a caption. Ticking one records the task
name like any other block, so it lands in the `.md` block table and in the
reports' block counts. PLAN records what it sent under `plan_sent_v1` for the
current day; the queue counts as planned too. Only drawn for the real today.

**TRACK and LEARN in the daily note.** A `#### study` table at the end of the
`## data` section: `cap_topics` (how many ticked that day), `cap_done` (their
titles), `cap_progress` (n/54), `anki_rated`, `anki_acquired`, `anki_decks`.
It appears only on a day that had either. TRACK reads it straight from its
ticks, for any date; LEARN keeps a per-day tally in `learn_daily_v1` because
its cards are in IndexedDB and the note is built synchronously. The Output
screen tags the day with "n topics" / "n cards" as well.

**Verified** — `test/harness.mjs`, 80 checks, all green, including: a comma
typed into the sleep field becomes a dot and a comma pasted without an input
event is still saved as a dot; a touch `pointerover` on a theme card leaves the
theme alone while a mouse one previews it; the today block against a scripted
Todoist (due + overdue shown, future and dateless not; priority and label
rendered; close → reopen calls; a closed task kept ticked across a refresh;
the cache in `do_todoist_v1`; off hides it); a queued PLAN task offered and
recorded as a block; the study section with two topics and two ratings, its
tags, and its absence on a day with neither. The harness now rolls the clock
back to the real day after the midnight test. **Not verified**: none of it in a
browser; the today block has not been run against real Todoist; the comma fix
has not been typed on an actual iPhone keyboard, which is the only place it
matters.

### 2.2 — 2026-09-02 — TEND, TRACK and LEARN join the track

The three remaining standalone apps (`tend/`, `track/`, `learn/`) are in ROOT.
Same method as 1.0 — a port, not a rewrite: each is one IIFE under its own
`.ns-*` namespace, its storage keys untouched so the standalone copy keeps
working off the same data. The difference from 1.0 is that 2.0's rules applied
from the first line: every literal each app carried is a Config branch with an
editor, every stylesheet was written against the tokens, and each app's
settings screen became a settings panel.

**Eight slides do not fit a five-tab pill.** Rather than cram them in, which
apps have a tab and in what order is now a preference (`apps`, under layout →
"apps in the bar": a switch and up/down per app). The shell builds `TABS`, the
slide order and the nav from it — `Shell.rebuild()` re-orders the real DOM by
`id="view-x"` / `data-app="x"`, so nothing anywhere depends on position any
more: the tab click handlers, the colour-coded tabs in `themes.css` and the
start-tab chips were all positional and are keyed by app now. With seven or
more tabs Prefs stamps `data-tabs="many"` and the pill goes to the viewport
width with tighter labels and no arrows (they would sit on top of it; swipe,
tap and `1`–`9` cover the same ground). Six or fewer look exactly as before.

**TEND.** Its sheets moved out of the track onto the frame's `.sheet-back` /
`.sheet`, which is how they get Escape and the keyboard lock for free. The
fixed "add plant" bar became a sticky one inside the slide, the toast is
`Shell.toast`, the undo pill is a sibling of `#toast` at the same spot. Made
editable: the plant types (with their seasonal weight and note), the three care
tasks' names, the growth curve, the season names, the feeding cut-off, the
round thresholds (when a task is "coming up", how late is red, list length,
undo window, history depth), the new-plant defaults, and the shelf's default
sort. The starter list is Config too, used on a first-ever install and by
"reset to starter plants". Its date label follows the date-format preference.

**TRACK.** The 54-topic curriculum, the phase names, the level word, the PSE
row and the revision reminders are Config; the curriculum deliberately has no
editor (the ticks are filed under its ids). The start date, which the
standalone kept in state but never showed, is a setting now, alongside the
exam, the internship, the buffer, the lead and the pace factor; the pace window
and the "next up" count are new knobs. The chart's SVG text lost its hardcoded
font-family and follows `--mono`. Hardcoded 12–16px radii are ratios of
`--r-base`, so a "sharp" preset squares TRACK too.

**LEARN.** JSZip, sql.js and fzstd are fetched the first time an import starts
and never otherwise — ROOT stays dependency-free until you bring a deck in.
The four rating names are Config; the session shape (cap, card text size,
back-first, tags under the card) is Config and sits in the learn panel next to
the shuffle flag, which stays in `learn_settings` for the standalone app. Where
IndexedDB is missing the home screen says so instead of throwing. The data
panel, the storage report and the learn panel all say the decks are not in the
backup file, because they cannot be.

**A latent 2.1 bug, fixed while porting.** The content editors for LOG's curate
counters and scale endpoints pointed `data-cfg` at `log.curate.mix` with
`data-sub="label"`. Overrides are whole-branch, so the first keystroke overrode
`log.curate` with `{ mix: … }` and the other two counters vanished from the
evening form until a reset. `data-sub` walks dotted paths now (`mix.label`
against `log.curate`), the LOG editors use that shape, and TEND's task editor
was written against it. Number and range inputs bound this way store numbers.

**Smaller.** `Prefs` gained a `list` kind (known ids, deduplicated, never
empty) and copies array defaults so a list pref never aliases the schema.
`Prefs.reset()` goes through `defaultsOf()` for the same reason. A number field
inside a `.setting-row` is a small right-hand box rather than the full-width
form field. `data-numlist="all"` keeps zeros (the growth curve may have one);
`data-lines` splits a textarea into a list. Twelve panels in the segmented
control, which already scrolled. The manifest description names all seven.

**Verified** — `test/harness.mjs`, 63 checks, all green: everything from 2.1,
plus the three modules booting with no errors, the three panels, `5`/`7`
jumping to TEND/LEARN, the app list re-ordering the track and hiding a tab and
resetting, a plant saved through the real editor landing overdue on the round,
ticked, undone, its detail sheet closed by Escape, a round threshold read from
Config, a topic ticked into `capTracker.v2` under its id, the next-up count and
a panel date setting, LEARN's no-IndexedDB path, rating names from Config, and
no library `<script>` present without an import. **Not verified**: nothing has
been seen in a browser. Specifically unchecked by eye: the eight-tab pill at
phone width (the whole point of `data-tabs="many"`), TEND's sheets at 78vh with
the long editor, TRACK's chart at the five radius presets, LEARN's card face at
the scale extremes, and the three apps under the five light presets. An actual
`.apkg` import has not been run through the lazy loader.

### 2.1 — 2026-09-01 — the audit: what 2.0 left dangling

A read-through of every file against the vision in §1, looking for settings
that existed but did nothing, constants that 2.0 had made editable in one place
and left cached in another, and the phone-app cases (midnight, quotes, a flaky
request) that a jsdom boot pass cannot see. Nothing here changes a storage key,
a day-record field or the `.md` export.

**Settings that were decorative are real now.** Three preferences were written
by the settings view and read by nothing: *confirm before clearing* (only the
settings view's own buttons honoured it; every reset/clear in the four apps
called `confirm()` directly — they go through `Shell.confirm()` now), *week
starts on* (nothing read it; the km chart honours it, reports stay ISO/Monday
and the chip says so), and `log.streakRequires` (in Config, no editor, never
read; the streak uses it and Settings → content → LOG has a select for it).

**Midnight with the app open.** Every module captured "today" once at boot, so
a phone that keeps ROOT open — which is how it is used — filed ticks made after
midnight into yesterday's record until someone reloaded. Worse, DO and STORE
derived the day from `toISOString()`, which is UTC: the checklist did not reset
until 01:00 (winter) or 02:00 (summer), and a tick in that window went to the
wrong day. `Shell.today()` is now the only definition of the local day, and the
shell re-checks it on visibility, focus, tab change and once a minute, calling
each module's `onDayChange`. DO rolls to the new record; LOG follows only when
the selected day was today and no form is open, because an evening logged at
00:10 belongs to the day that just ended. STORE's trip date is local too.

**Editable in one place, cached in another.** DO's Todoist name→routine map was
built once at boot from `ROUTINES` — rename a routine in Settings and sync
stopped matching it until a reload. STORE's classifier vocabulary (`VOCAB`)
was built once from `CATEGORIES` — add a word to an aisle and the categoriser
never saw it. LOG's note parser capped meals at 4 while the meal count goes to
8, so meals 5–8 vanished from every pasted-notes report. LOG's daily km target
was still a constant (`log.kmTarget`, editable now, next to the streak rule).
PLAN's and STORE's home dates ignored the date-format preference that DO and
LOG already followed.

**A quote in an editable value broke its button.** Block names, workout types,
PLAN's chips and DO's checklist items are interpolated into inline `onclick`
strings; `esc()` handles `<>&` but not `'` or `\`, so a block called `it's` was
a syntax error and could not be toggled. Every such site goes through `attr()`
(JS-string escape, then attribute escape). See §3.

**Streak and "done" cards depended on two specific fields.** Morning counted as
logged only with a wake time, evening only with an evening km — and 2.0 made
both fields switchable off, after which the card could never turn green and
the streak was stuck at zero. Any recorded value in that half of the day counts
now. The streak also no longer resets to zero every morning: if today is not
finished it counts back from yesterday.

**PLAN re-sent tasks after a partial failure.** The queue was cleared only when
every task went through; one failed request kept all of them, and the next
"send" created duplicates in Todoist for the ones that had succeeded. Only the
failed tasks stay queued, and the log says so.

**Keyboard and sheets.** STORE's numpad reads digit keys; so did the shell's
tab shortcuts, on the same document, so typing `3` into the numpad on a laptop
also jumped to PLAN, and `/` decremented the count *and* opened settings. All
shortcuts are suppressed while a sheet or modal is up, and Escape closes it
(the shell clicks the overlay's own backdrop, so it knows nothing about who
owns which sheet).

**Smaller.** `Shell.settings('general')` was called from PLAN in three places
and matched no panel (the key lives under *data*) — every "add your key under
General" message pointed at a panel that does not exist. `Prefs.preview()` set
`data-theme` but not `data-mode`, so hovering a light preset from a dark one
previewed it without the light-mode corrections. `loadFonts()` set the font
link's `href` to `''` when both faces were system faces, which resolves to the
page itself and fetched `index.html` as a stylesheet; the link is removed
instead. A pasted "look" can now no longer inject a non-string currency or a
malformed accent (`coerce()` covers `text` and `color`). The meal count is
clamped to 1–12 on render, since the editor's number field is empty mid-edit.
`#settings/<panel>` deep-links to a settings panel. `manifest.webmanifest`
makes the site installable as a standalone app on Android; iOS was already
covered by the apple-* metas.

**Verified** — `test/harness.mjs`, 35 checks, all green: boot with no console
errors, all 15 presets, all nine panels, and one check per behaviour above
(the day rollover is driven by shimming `Date` a day forward and calling
`Shell.checkDay()`; the partial send by a scripted `fetch`). Before the changes
the same harness failed 22 of them, which is the diagnosis in numbers. **Not
verified**: nothing above has been seen in a browser, and the manifest has not
been installed on a phone. The rollover in particular deserves one real night
with the app open before it is trusted.

### 2.0.1 — 2026-09-01 — the horizontal scrollers inside the track

Reported as "my tabs are no longer centred and some I can't even access", blamed
on the swipe. The swipe was implicated, but it was the CSS half of it.

**DO's home tab strip could not hold more than the two tabs it shipped with.**
2.0 made `do.tabs` editable and built the strip from Config, but `.ns-do .tabs`
was still `inline-flex` with no shrink and no overflow — drawn for exactly
`daily` / `other`. Add a third or fourth tab in Settings and the strip outgrows
`.h-logo-row`, which is `flex-wrap:wrap`, so it drops onto its own line (there
goes the alignment against the logo) and runs off the right edge with no way to
reach what is past it. It now shrinks to the row (`min-width:0; max-width:100%`)
and scrolls sideways, `.tab` chips no longer squash (`flex:0 0 auto;
white-space:nowrap`), and `DO.positionGlider()` nudges the strip's own
`scrollLeft` so the active tab is never off the edge — its own `scrollLeft`, not
`scrollIntoView()`, which would drag the whole slide back to the top and break
"every tab remembers where you left it". The glider's inset was `3px` against a
`calc(3px * var(--dens))` padding; it is a `--dens` calc now too.

**`#track{touch-action:pan-y}` had frozen every horizontal scroller inside it.**
A gesture is resolved by intersecting `touch-action` up the ancestor chain, so
the track's claim on horizontal reaches every descendant. 2.0 wrote the one
exemption it knew it needed (`#track input,textarea,[contenteditable]`) and
nothing else, which left three scrollers that work with a mouse and are dead
under a finger: the settings segmented control — the very thing added in 2.0
because nine panels no longer fit — and LOG's two `.md` preview panes, which
`js/shell.js` explicitly steps aside for in `scrollsSideways()`. Between the two
halves the gesture did nothing at all: the shell declined it and the browser was
not allowed to act on it. All four scrollers now state
`touch-action:pan-x pan-y` for themselves, and the rule in `shell.css` says why,
because the next one added will hit the same wall.

The swipe interaction falls out of the fix rather than needing one: once the
strip genuinely overflows, `scrollsSideways()` sees it and refuses the app-level
swipe, so dragging the tabs moves the tabs instead of sliding the app to LOG.

**Verified** in jsdom (§7): all eight modules load with no console errors, the
strip renders the shipped two tabs, grows to five through `Config.set`, keeps its
glider across the re-render, activates a far tab, hides itself at one tab, and
restores on reset. **Not verified** — jsdom does not lay out or paint, so none of
the CSS above has been seen. The overflow, the wrap and the scroll are exactly
the kind of thing that only a real viewport proves; open DO with four or five
tabs on a phone before trusting this entry.

### 2.0 — 2026-09-01 — the customisation rewrite

**New files**

- `ROOT.md` — this manifest.
- `js/prefs.js` — appearance + behaviour engine. 15 presets (10 dark, 5 light),
  13 accent swatches + a custom colour, 8 display faces, 5 mono faces, 39
  settings in total (18 enums, 10 sliders, 9 toggles, 1 colour, 1 text). Loaded
  from `<head>` so the look is stamped before the first paint.
- `js/config.js` — the content layer. Every literal the four apps used to hold is
  now an editable branch under `do.` / `log.` / `plan.` / `store.`.
- `js/settings.js` — the settings view, extracted from `shell.js`.
- `css/settings.css` — the settings stylesheet, extracted from `shell.css`.

**Rewritten**

- `css/tokens.css` — full token system: one shape anchor with four derived radii,
  density and scale multipliers, a motion multiplier, a depth ramp, a texture
  overlay, and the single global rule behind each dial.
- `css/themes.css` — was 4 themes, one of which (`paper`) needed a hundred lines
  of shape overrides. Now 15 presets that are pure colour, because shape moved
  into `THEME_CHARACTER` + tokens. Light-mode corrections are keyed off
  `[data-mode]` rather than a theme id, so all five light presets get them.
- `js/shell.js` — settings removed; toast duration, swipe on/off, swipe
  threshold, chrome auto-hide and the opening tab all read from Prefs live rather
  than being captured at boot, so a setting takes effect without a reload.

**Mechanically normalised** (`do/log/plan/store.css`) — 92 hardcoded
`border-radius` px values → radius tokens (108 radius declarations now resolve to
a token), 85 hairline borders → `var(--bw)`, and 329 padding/gap values →
`calc(… * var(--dens))`. Before this, a theme could recolour
the app but never reshape it, and the density and corner dials would have been
decoration. There are now **zero** hardcoded `border-radius` px values in the app
sheets.

**Made editable** — DO's routines, the tab layout and the packing categories;
LOG's blocks (name + colour), block cap, med labels, meal count and name,
caffeine labels, curate labels and colours, scale endpoints, workout types, and
which fields appear at all; PLAN's project/section tree, block chips, time chips
and default priority; STORE's aisles (label, colour, icon, vocabulary), premade
meals and counter step amounts.

**Other fixes**

- Keyboard navigation added (← → between tabs, 1–5 to jump, `/` to settings),
  ignored while a field has focus. ROOT ran on a laptop with no keyboard route.
- STORE's `€` was hardcoded in eleven places; it is a preference now.
- Date formatting was duplicated in DO and LOG with different calls; both go
  through `Prefs.formatDate()`.
- `LOG.buildNote()` built the block table from six hardcoded cells; it is built
  from the array, so raising the cap widens the table instead of dropping blocks.
- The settings segmented control scrolls the active chip into view — at nine
  panels it used to leave the current one off the edge.
- Storage report gained a usage meter against the ~5 MB budget.
- Appearance + content can be exported as a small "look" JSON, separate from the
  full backup.

**Verified** with two jsdom harnesses: a boot/render pass (all modules load, all
15 themes apply, every panel renders, every Config-driven control is built with
the right cardinality) and an interaction pass (26 checks driving the real
editors and dials through DOM events, plus a `.md` export round-trip at both the
default and a raised block cap). All green, no console errors.

**Not verified — open risk.** No browser was available during the rewrite, so
2.0 has never been *seen*. jsdom does not lay out or paint: it proves the DOM is
built and the logic runs, and proves nothing about how any of it looks. Unchecked
by eye, in rough order of how likely they are to be wrong:

- the five light presets, which now inherit the `[data-mode="light"]` corrections
  that were written for `paper` alone;
- the loud presets — `synth` (glow + grid), `carbon` (2px rules, white accent),
  `dune` and `bloom` (16px and 14px radii on a layout drawn for 4px);
- the mechanically normalised spacing at density extremes (0.78 and 1.35);
- the texture overlays at their default strengths;
- `[data-nav="bar"]` and `[data-cards="line"]`, both new and neither seen.

None of this is known-broken. It is simply untested in the only way that counts
for a visual change. **Anyone picking this up should open all 15 presets on a
phone before trusting the changelog above.**

**Not changed, deliberately** — every storage key, the day-record field names,
the `.md` export schema, the Todoist sync semantics (DO only ever completes,
STORE only ever adds), and the standalone `complete/` `plan/` `eat/` apps' shared
keys.

### 1.0 — before 2026-09-01

The four standalone apps (`complete/`, `log/`, `plan/`, `eat/`) merged into one
five-slide shell with a shared Todoist credential, a shared toast, one settings
view and four themes. Storage keys were preserved throughout so the standalone
apps kept working.
