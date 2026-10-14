/* qurOS — behaviour checks in jsdom. Not part of the site.
   cd test && npm install && npm test
   jsdom has no layout, no IndexedDB (the app falls back to localStorage)
   and no speech: a fake recognizer below plays the part, including Android's
   habit of repeating earlier phrases inside later results. */
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) pass++;
  else { fail++; fails.push(name); console.log('  ✗ ' + name); }
}
const eq = (a, b, name) => ok(JSON.stringify(a) === JSON.stringify(b), `${name} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
const tick = (ms = 0) => new Promise(r => setTimeout(r, ms));
function section(name) { console.log(name); }

class FakeSR {
  constructor() { FakeSR.all.push(this); FakeSR.last = this; this.results = []; }
  start() { this.started = true; setTimeout(() => this.onstart && this.onstart(), 0); }
  stop() { setTimeout(() => this.end(), 0); }
  abort() { this.end(); }
  end() { if (this.ended) return; this.ended = true; this.onend && this.onend(); }
  /* push results; each [text, isFinal]; replaces the in-progress tail */
  say(list, { append = true } = {}) {
    const keep = append ? this.results.filter(r => r.isFinal) : [];
    const fresh = list.map(([t, f]) => Object.assign([{ transcript: t }], { isFinal: !!f }));
    const resultIndex = keep.length;
    this.results = keep.concat(fresh);
    this.onresult && this.onresult({ resultIndex, results: this.results });
  }
}
FakeSR.all = [];

async function boot({ storage = {}, speech = true, settings = null } = {}) {
  const dom = new JSDOM(html, { url: 'https://hpcurate.github.io/qurOS/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  const errors = [];
  w.addEventListener('error', e => errors.push(e.message));
  w.console.error = (...a) => errors.push(a.join(' '));
  Object.entries(storage).forEach(([k, v]) => w.localStorage.setItem(k, v));
  if (settings) w.localStorage.setItem('qos_settings_v1', JSON.stringify(settings));
  w.__QOS_NO_BOOT = true;
  w.matchMedia = q => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
  w.HTMLElement.prototype.scrollTo = function () {};
  w.navigator.vibrate = () => true;
  const wake = { requests: 0, released: 0 };
  Object.defineProperty(w.navigator, 'wakeLock', { value: { request: async () => {
    wake.requests++;
    const s = new w.EventTarget();
    s.release = async () => { wake.released++; s.dispatchEvent(new w.Event('release')); };
    return s;
  } } });
  if (speech) w.webkitSpeechRecognition = FakeSR;
  for (const src of scripts) w.eval(fs.readFileSync(path.join(ROOT, src), 'utf8'));
  await w.Q.app.boot();
  return { dom, w, d: w.document, Q: w.Q, errors, wake };
}
const click = (w, el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
const $ = (env, s) => env.d.querySelector(s);

/* ─────────────────────────────────────────────────────────────── */
section('boot');
{
  const env = await boot();
  ok(!env.errors.length, 'boots without errors: ' + env.errors.join(' | '));
  eq(env.d.querySelectorAll('#bar button').length, 4, 'four tabs');
  ok($(env, '#v-dump.on'), 'DUMP is the home tab');
  ok($(env, '#v-dump .talk-btn') && $(env, '#v-dump .write-btn'), 'talk and write on the home tab');
  for (const t of ['day', 'map', 'send']) {
    env.Q.app.show(t);
    ok($(env, `#v-${t}.on .wm`), `${t} renders`);
  }
  ok(!env.errors.length, 'every tab renders without errors: ' + env.errors.join(' | '));
  eq(env.Q.db.mode(), 'ls', 'falls back to localStorage without IndexedDB');
  env.dom.window.close();
}

section('days and the rollover');
{
  const env = await boot();
  const { Q } = env;
  const at = (h, m = 0) => new Date(2026, 9, 14, h, m).getTime();
  eq(Q.u.dayOf(at(1, 30)), '2026-10-13', 'a 01:30 dump belongs to the evening before (rollover 4)');
  eq(Q.u.dayOf(at(4, 0)), '2026-10-14', 'from 04:00 it is the new day');
  Q.settings.set({ rollover: 0 });
  eq(Q.u.dayOf(at(1, 30)), '2026-10-14', 'rollover 0 is midnight');
  eq(Q.u.weekKey('2026-10-14'), '2026-W42', 'ISO week');
  eq(Q.u.weekKey('2027-01-01'), '2026-W53', 'ISO week across the year end');
  eq(Q.u.weekDays('2026-10-14')[0], '2026-10-12', 'weeks start on Monday');
  eq(Q.u.slept('23:40', '06:10'), 390, 'slept across midnight');
  eq(Q.u.slept('00:40', '07:00'), 380, 'a bed time after midnight');
  env.dom.window.close();
}

section('speech: phrases become text');
{
  const env = await boot();
  const { Q } = env;
  eq(Q.speech._relation('hello there', 'hello there how are you'), 'extends', 'a longer repeat extends');
  eq(Q.speech._relation('Hello there.', 'hello there'), 'same', 'a repeat is the same');
  eq(Q.speech._relation('hello', 'goodbye'), 'new', 'a different phrase is new');

  Q.rec.talk({});
  await tick(5);
  const sr = FakeSR.last;
  ok(sr && sr.started, 'talk starts the recognizer');
  ok(sr.continuous && sr.interimResults, 'continuous with interim results');
  sr.say([['today i walked kamo', false]]);
  ok($(env, '.rec-interim').textContent.includes('today i walked kamo'), 'interim words show while speaking');
  sr.say([['today i walked kamo', true]]);
  eq(Q.rec._R.d.text, 'Today i walked kamo', 'a final phrase lands, first letter up');
  /* Android: the next result repeats the last one and adds to it */
  sr.say([['today i walked kamo by the river', true]]);
  eq(Q.rec._R.d.text, 'Today i walked kamo by the river', 'a cumulative repeat replaces, not duplicates');
  sr.say([['today i walked kamo by the river', true]]);
  eq(Q.rec._R.d.text, 'Today i walked kamo by the river', 'an identical repeat is dropped');
  sr.say([['and it rained', true]]);
  eq(Q.rec._R.d.text, 'Today i walked kamo by the river and it rained', 'a new phrase is appended with a space');
  sr.say([['new paragraph then i went home', true]]);
  eq(Q.rec._R.d.text, 'Today i walked kamo by the river and it rained\n\nThen i went home', '"new paragraph" breaks the text');
  /* silence longer than paraGap starts a paragraph */
  Q.rec._R.lastFinalAt = Date.now() - 20000;
  sr.say([['much later', true]]);
  ok(/\n\nMuch later$/.test(Q.rec._R.d.text), 'a long silence starts a new paragraph');
  /* a session that ends with words still in progress keeps them */
  sr.say([['half a thought', false]]);
  sr.end();
  ok(/half a thought$/.test(Q.rec._R.d.text), 'an unfinished tail is kept when a session ends');
  await tick(200);
  ok(FakeSR.all.length >= 2 && FakeSR.last !== sr, 'the recognizer restarts after a session ends');
  const sr2 = FakeSR.last;
  sr2.say([['half a thought', true]]);
  ok(!/half a thought half a thought/.test(Q.rec._R.d.text), 'no doubling across a restart');
  sr2.say([['more words', true]]);
  ok(/more words$/.test(Q.rec._R.d.text), 'words after a restart append');
  /* the draft is on disk the moment a phrase lands */
  const draft = JSON.parse(env.w.localStorage.getItem('qos_draft'));
  ok(draft && /more words$/.test(draft.text), 'the draft is saved on every phrase');
  env.dom.window.close();
}

section('recorder: the lock');
{
  const env = await boot();
  const { Q, w, wake } = env;
  Q.rec.talk({});
  await tick(5);
  const rec = $(env, '#rec');
  ok(Q.rec.isOpen() && !rec.hidden, 'talk opens the recorder');
  ok(Q.rec.isLocked() && rec.dataset.lock === '1', 'a voice dump starts locked (lock on start)');
  ok(wake.requests >= 1 && Q.wake.state() === 'on', 'the screen wake lock is held');
  ok($(env, '.rec-wake i').textContent.includes('stays on'), 'the lock screen says the screen stays on');
  /* touches anywhere but the slider are swallowed */
  const done = rec.querySelector('[data-r="done"]');
  const ev = new w.MouseEvent('click', { bubbles: true, cancelable: true });
  done.dispatchEvent(ev);
  ok(Q.rec.isOpen() && ev.defaultPrevented, 'a tap on "done" does nothing while locked');
  const tdown = new w.Event('touchstart', { bubbles: true, cancelable: true });
  rec.querySelector('.rec-orb').dispatchEvent(tdown);
  ok(tdown.defaultPrevented, 'touches on the lock screen are blocked');
  /* the back gesture is refused while locked */
  w.dispatchEvent(new w.PopStateEvent('popstate', { state: null }));
  ok(Q.rec.isOpen() && Q.rec.isLocked(), 'back does not close a locked recorder');
  /* slide to unlock: a short drag springs back, a full one unlocks */
  const knob = rec.querySelector('.rec-knob'), track = rec.querySelector('.rec-track');
  Object.defineProperty(track, 'clientWidth', { value: 360, configurable: true });
  Object.defineProperty(knob, 'offsetWidth', { value: 56, configurable: true });
  const ptr = (type, x) => { const e = new w.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x }); Object.defineProperty(e, 'pointerId', { value: 1 }); knob.dispatchEvent(e); };
  knob.setPointerCapture = () => {};
  ptr('pointerdown', 10); ptr('pointermove', 120); ptr('pointerup', 120);
  ok(Q.rec.isLocked(), 'a short slide does not unlock');
  ptr('pointerdown', 10); ptr('pointermove', 400); ptr('pointerup', 400);
  ok(!Q.rec.isLocked() && rec.dataset.lock === '0', 'a full slide unlocks');
  ok(!rec.querySelector('.rec-ctl').hidden, 'controls show when unlocked');
  /* dim after the set time while locked */
  Q.settings.set({ dimAfter: 0.05, relockAfter: 0.05 });
  Q.rec.lock();
  await tick(90);
  ok(rec.classList.contains('dim'), 'the locked screen dims when left alone');
  rec.querySelector('.rec-shift').dispatchEvent(new w.Event('touchstart', { bubbles: true, cancelable: true }));
  ok(!rec.classList.contains('dim') && Q.rec.isLocked(), 'a touch wakes the dim screen but does not unlock it');
  Q.rec.unlock();
  await tick(90);
  ok(Q.rec.isLocked(), 'unlocked and idle while listening, it locks itself again');
  Q.rec.unlock();
  Q.settings.set({ dimAfter: 20, relockAfter: 15 });
  /* say something, then finish */
  FakeSR.last.say([['the lock works', true]]);
  click(w, rec.querySelector('[data-r="done"]'));
  await tick(30);
  ok(!Q.rec.isOpen(), 'done closes the recorder');
  const all = Q.m.entries();
  eq(all.length, 1, 'one entry saved');
  eq(all[0].text, 'The lock works', 'with the words');
  eq(all[0].src, 'voice', 'marked as voice');
  ok(!env.w.localStorage.getItem('qos_draft'), 'the draft is cleared after saving');
  ok(Q.wake.state() === 'off' && wake.released >= 1, 'the wake lock is released');
  ok($(env, '#v-dump .ent'), 'the dump is listed on the home tab');
  env.dom.window.close();
}

section('recorder: write, discard, back');
{
  const env = await boot();
  const { Q, w } = env;
  Q.rec.write({});
  await tick(80);
  const rec = $(env, '#rec');
  ok(Q.rec.isOpen() && !Q.rec.isLocked() && rec.dataset.voice === 'off', 'write opens unlocked, not listening');
  ok(Q.wake.state() === 'on', 'the screen stays on while writing too');
  const ta = rec.querySelector('.rec-text');
  ta.value = 'typed with the keyboard mic';
  ta.dispatchEvent(new w.Event('input', { bubbles: true }));
  /* back with words asks first */
  w.dispatchEvent(new w.PopStateEvent('popstate', { state: null }));
  ok(Q.rec.isOpen(), 'back with unsaved words keeps the recorder open');
  const sheet = env.d.querySelector('.sheet');
  ok(sheet && /Save this/.test(sheet.textContent), 'and asks whether to save');
  click(w, [...sheet.querySelectorAll('button')].find(b => b.textContent === 'save'));
  await tick(30);
  ok(!Q.rec.isOpen(), 'save from that question closes it');
  eq(Q.m.entries()[0] && Q.m.entries()[0].src, 'typed', 'a written dump is marked typed');
  /* discard */
  Q.rec.write({});
  await tick(10);
  ta.value = 'throw this away';
  ta.dispatchEvent(new w.Event('input', { bubbles: true }));
  Q.rec.discard();
  click(w, [...env.d.querySelectorAll('.sheet [data-ok]')].pop());
  await tick(30);
  ok(!Q.rec.isOpen() && Q.m.entries().length === 1, 'discard throws the words away');
  env.dom.window.close();
}

section('recovery after a dead battery');
{
  const env = await boot();
  env.Q.rec.talk({});
  await tick(5);
  FakeSR.last.say([['this walk must not be lost', true]]);
  const draft = env.w.localStorage.getItem('qos_draft');
  env.dom.window.close();   // the tab dies mid-dump
  const env2 = await boot({ storage: { qos_draft: draft } });
  await tick(350);
  const sheet = env2.d.querySelector('.sheet');
  ok(sheet && /unsaved dump/.test(sheet.textContent), 'the next start offers the unsaved dump');
  click(env2.w, [...sheet.querySelectorAll('button')].find(b => b.textContent === 'save it'));
  await tick(10);
  eq(env2.Q.m.entries()[0] && env2.Q.m.entries()[0].text, 'This walk must not be lost', 'and saves it');
  ok(!env2.w.localStorage.getItem('qos_draft'), 'then forgets the draft');
  env2.dom.window.close();
  /* ignored the question and started talking again: the old words are kept, not overwritten */
  const env3 = await boot({ storage: { qos_draft: draft } });
  env3.Q.rec.talk({});
  await tick(5);
  eq(env3.Q.m.entries().map(e => e.text), ['This walk must not be lost'], 'a new dump never overwrites an unsaved one');
  env3.dom.window.close();
}

section('no speech-to-text in this browser');
{
  const env = await boot({ speech: false });
  const { Q } = env;
  ok(/write/.test($(env, '#v-dump .hero-note').textContent), 'the home tab says to write instead');
  Q.rec.talk({});
  await tick(80);
  ok(Q.rec.isOpen() && !Q.rec.isLocked(), 'talk opens the writer, unlocked');
  ok(/no speech-to-text/.test($(env, '.rec-msg').textContent), 'and explains why');
  ok($(env, '[data-r="lock"]').hidden && $(env, '[data-r="mic"]').hidden, 'no lock or mic buttons without speech');
  env.dom.window.close();
}

section('mic blocked');
{
  const env = await boot();
  const { Q } = env;
  Q.rec.talk({});
  await tick(5);
  FakeSR.last.onerror({ error: 'not-allowed' });
  FakeSR.last.end();
  await tick(5);
  ok(Q.rec.isOpen() && !Q.rec.isLocked(), 'a blocked mic unlocks the screen');
  ok(/blocked/.test($(env, '.rec-msg').textContent), 'and says the mic is blocked');
  ok($(env, '#rec').dataset.shape === 'tri' && !/re[d]/.test($(env, '#rec').className), 'shown as a grey triangle, never red');
  env.dom.window.close();
}

section('day: flexible, never failed');
{
  const env = await boot();
  const { Q, w } = env;
  Q.app.show('day');
  const v = $(env, '#v-day');
  const nextTitle = () => v.querySelector('.next-card .nc-t').textContent;
  eq(nextTitle(), 'wake', 'the next action is the first chain step');
  click(w, v.querySelector('[data-a="chain"][data-id="wake"][data-v="min"]'));
  eq(nextTitle(), 'Kamo walk', 'a minimum counts and moves next along');
  const today = Q.u.today();
  eq(Q.m.day(today).chain.wake, 'min', 'stored as a minimum');
  ok(v.querySelector('.chain .row.marked'), 'the marked step shows done');
  click(w, v.querySelector('.next-card [data-v="skip"]'));
  eq(nextTitle(), 'gym', '"not today" moves on without a mark against it');
  /* goals: three a day, then the cap */
  const addGoal = t => { const i = v.querySelector('[data-f="goal"]'); i.value = t; click(w, v.querySelector('[data-a="goal-add"]')); };
  addGoal('1 pomodoro on CAP chapter 1'); addGoal('call the bank'); addGoal('fix the bike');
  eq(Q.m.day(today).goals.length, 3, 'three goals');
  ok(!v.querySelector('[data-f="goal"]'), 'no fourth: the input goes away at the cap');
  /* bad day */
  click(w, v.querySelector('[data-a="bad"]'));
  ok(Q.m.day(today).bad && v.classList.contains('bad'), 'bad-day mode is on');
  ok(!v.querySelector('[data-f="goal"]') && !v.querySelector('.focus-r'), 'goals and focus are hidden on a bad day');
  ok(/minimum/.test(v.querySelector('.next-card').textContent), 'the next action offers only its minimum');
  ok(!v.querySelector('.chain [data-v="full"]'), 'the chain shows only minimums');
  click(w, v.querySelector('[data-a="more"]'));
  ok(v.querySelector('.focus-r'), '"show everything" brings the rest back');
  click(w, v.querySelector('[data-a="bad"]'));
  /* no streaks, no red */
  ok(!/streak/i.test(v.textContent), 'no streaks anywhere');
  const css = fs.readFileSync(path.join(ROOT, 'css/app.css'), 'utf8');
  ok(!/#e06060|#ff0000|\bred\b/i.test(css.replace(/\/\*[\s\S]*?\*\//g, '')), 'nothing red in the styles');
  /* focus auto-fills the CAP step */
  click(w, v.querySelector('[data-a="focus"][data-k="CAP"][data-n="1"]'));
  eq(Q.m.day(today).chain.cap, 'full', 'a CAP pomodoro fills in the CAP chain step');
  eq(Q.m.day(today).focus.CAP, 1, 'and counts the pomodoro');
  /* wake now */
  click(w, v.querySelector('[data-a="now"][data-f="wake"]'));
  ok(/^\d\d:\d\d$/.test(Q.m.day(today).wake), 'wake "now" stores the time');
  env.dom.window.close();
}

section('day: carry or drop');
{
  const env = await boot();
  const { Q, w } = env;
  const today = Q.u.today(), y = Q.u.addDays(today, -1);
  const d = Q.m.day(y);
  d.goals = [{ id: 'g1', text: 'finish the mix', state: 'open' }, { id: 'g2', text: 'tidy the desk', state: 'open' }, { id: 'g3', text: 'done one', state: 'done' }];
  Q.m.saveDay(d);
  Q.app.show('day');
  const v = $(env, '#v-day');
  ok(/from before/.test(v.textContent), 'yesterday\'s open goals are offered');
  click(w, v.querySelector('[data-a="carry"][data-i="0"]'));
  eq(Q.m.day(y).goals[0].state, 'carried', 'carry marks the old one carried');
  eq(Q.m.day(today).goals.map(g => [g.text, g.from]), [['finish the mix', y]], 'and adds it today');
  click(w, v.querySelector('[data-a="drop"][data-i="0"]'));
  eq(Q.m.day(y).goals[1].state, 'dropped', 'drop just lets it go');
  ok(!/from before/.test(v.textContent), 'then the card is gone');
  env.dom.window.close();
}

section('gym');
{
  const env = await boot();
  const { Q, w } = env;
  const today = Q.u.today(), y = Q.u.addDays(today, -2);
  eq(Q.gym.suggest(today).plan, 'A', 'A to start');
  const d = Q.m.day(y);
  d.gym = { plan: 'A', ex: [{ name: 'Lat pulldown', unit: 'reps', lo: 8, hi: 12, sets: [{ w: '40', r: '12', done: true }, { w: '40', r: '12', done: true }, { w: '40', r: '12', done: true }] }] };
  Q.m.saveDay(d);
  eq(Q.gym.suggest(today).plan, 'B', 'after A comes B');
  ok(Q.gym.topped(Q.gym.lastFor('Lat pulldown', today), { sets: [1, 2, 3], hi: 12 }), 'every set at the top of the range → add weight');
  Q.gym.open(today);
  await tick(5);
  const scr = env.d.querySelector('[data-screen="gym"]');
  click(w, scr.querySelector('[data-g="plan"][data-p="A"]'));
  ok(/add weight/.test(scr.textContent), 'the hint shows on the exercise');
  const row = [...scr.querySelectorAll('.ex')].find(x => /Lat pulldown/.test(x.textContent));
  ok(row.querySelector('[data-g="w"]').placeholder === '40', 'sets are prefilled from last time');
  click(w, row.querySelector('[data-g="set"]'));
  const g = Q.m.day(today).gym;
  const lat = g.ex.find(x => x.name === 'Lat pulldown');
  eq([lat.sets[0].w, lat.sets[0].r, lat.sets[0].done], ['40', '12', true], 'one tap logs a repeat of last time');
  eq(Q.m.day(today).chain.gym, 'full', 'a gym session fills in the gym chain step');
  ok(!scr.querySelector('.rest-bar').hidden, 'the rest timer starts');
  ok(Q.wake.held('gym'), 'the screen stays on in the gym');
  env.Q.ui.closeLayer('screen:gym');
  ok(!Q.wake.held('gym'), 'and is let go after');
  env.dom.window.close();
}

section('map');
{
  const env = await boot();
  const { Q, w } = env;
  const md = `# My map\n## Family — Tier 1\n- Childhood\n- [x] Grandparents\n## Tier 2\n### Work\n- The CAP\n- [~] Money\n## Loose\n- Music`;
  const r = Q.m.loadMapText(md);
  ok(r, 'a markdown map loads');
  const secs = Q.m.sections();
  eq(secs.map(s => [s.title, s.tier]), [['Family', 1], ['Work', 2], ['Loose', 2]], 'sections and tiers, a bare "Tier N" heading sets the tier for what follows');
  eq(Q.m.itemState('family/grandparents'), 'done', '[x] is covered');
  eq(Q.m.itemState('work/money'), 'partial', '[~] is started');
  eq(Q.m.mapNext().item.text, 'Childhood', 'next is the first untouched item, lowest tier first');
  Q.m.setItemState('family/childhood', 'partial');
  Q.m.loadMapText(md + '\n- Piano');
  eq(Q.m.itemState('family/childhood'), 'partial', 'states survive a re-import');
  eq(Q.m.mapNext().item.text, 'The CAP', 'next moves on past started items');
  /* a dump on an item marks it started */
  Q.app.show('map');
  click(w, $(env, '#v-map [data-a="talk-item"]'));
  await tick(5);
  ok(/The CAP/.test($(env, '.rec-topic').textContent), 'talking about an item puts it on the lock screen');
  FakeSR.last.say([['the cap is going ok', true]]);
  Q.rec.unlock();
  await Q.rec.done();
  await tick(10);
  eq(Q.m.itemState('work/the-cap'), 'partial', 'a dump on an untouched item marks it started');
  eq(Q.m.dumpsFor('work/the-cap').length, 1, 'and the dump is filed under it');
  /* rename keeps the link */
  Q.m.mapEdit(m => { const it = m.sections.find(s => s.key === 'work').items[0]; it.text = 'The CAP électricien'; it.key = Q.m.itemKey('Work', it.text); });
  Q.m.rekey('work/the-cap', Q.m.itemKey('Work', 'The CAP électricien'));
  eq(Q.m.dumpsFor('work/the-cap-electricien').length, 1, 'renaming an item keeps its dumps');
  eq(Q.m.itemState('work/the-cap-electricien'), 'partial', 'and its state');
  ok(/\[~\] The CAP électricien/.test(Q.m.mapToMd()), 'the map exports back to markdown with states');
  env.dom.window.close();
}

section('send: the export');
{
  const env = await boot();
  const { Q, w } = env;
  const today = Q.u.today();
  Q.m.loadMapText('# m\n## Body — Tier 1\n- Sleep\n- Food');
  Q.m.saveEntry({ id: 'e1', kind: 'dump', topic: Q.m.topicFor(Q.m.sections()[0], Q.m.sections()[0].items[0]), text: 'I sleep badly when I eat late.', at: Date.now() - 60000, secs: 125, src: 'voice' });
  Q.m.saveEntry({ id: 'e2', kind: 'evening', topic: null, text: 'Good day overall.', at: Date.now(), secs: 0, src: 'typed' });
  const d = Q.m.day(today);
  d.wake = '06:05'; d.chain = { wake: 'full', walk: 'min' }; d.focus = { CAP: 2 }; d.scales = { mood: 4 };
  d.goals = [{ id: 'g', text: 'one pomodoro', state: 'done' }];
  d.gym = { plan: 'B', warm: true, ex: [{ name: 'Seated row', unit: 'reps', lo: 8, hi: 12, sets: [{ w: '35', r: '10', done: true }] }, { name: 'Plank', unit: 's', lo: 30, hi: 45, sets: [{ w: '', r: '40', done: true }] }] };
  Q.m.saveDay(d);
  const sel = Q.send.select();
  eq([sel.entries.length, sel.days.length], [2, 1], 'unsent: both dumps and the day');
  const md = Q.send.markdown(sel);
  ok(/^---\napp: qurOS\nschema: 2\n/.test(md), 'front matter with the schema');
  ok(/> This is an export from qurOS/.test(md), 'the instruction block for the chat');
  ok(/## Life-dump map/.test(md) && /Next untouched: \*\*Body › Sleep\*\*/.test(md), 'the map state');
  ok(/- \*\*Anchors:\*\* woke 06:05/.test(md), 'anchors');
  ok(/Kamo walk ✓ minimum/.test(md), 'a minimum is written as done (✓ minimum)');
  ok(/Focus \(pomodoros\):\*\* CAP 2/.test(md), 'focus by area');
  ok(/Seated row: 35 kg × 10/.test(md) && /Plank: 40 s/.test(md), 'gym sets');
  ok(/topic: Body › Sleep/.test(md) && /I sleep badly when I eat late\./.test(md), 'the dump with its topic');
  ok(/evening dump/.test(md) && /Good day overall\./.test(md), 'the evening dump');
  ok(md.indexOf('I sleep badly') < md.indexOf('Good day overall'), 'dumps in time order');
  ok(!/streak|fail/i.test(md), 'no streaks, nothing failed');
  const j = JSON.parse(Q.send.json(sel));
  eq([j.app, j.dumps.length, j.days.length], ['qurOS', 2, 1], 'the JSON export has the same selection');
  /* sending marks it all, an edit brings one back */
  const undo = Q.send.markSent(sel, 'shared', md);
  eq([Q.send.select().entries.length, Q.send.select().days.length], [0, 0], 'after sending, nothing is new');
  ok(/Nothing new since the last export/.test(Q.send.markdown()), 'and the export says so');
  await tick(5);
  Q.m.editEntry('e1', { text: 'I sleep badly when I eat late. Also coffee.' });
  const again = Q.send.select();
  eq(again.entries.map(e => e.id), ['e1'], 'an edit after sending makes it new again');
  ok(/updated since the last export/.test(Q.send.markdown(again)), 'and says it was updated');
  undo();
  eq(Q.send.select().entries.length, 2, 'undo un-marks the send');
  /* the tab */
  Q.app.show('send');
  ok(/share/.test($(env, '#v-send .send-acts').textContent), 'share, copy, file');
  eq($(env, '#bar [data-tab="send"] .badge').textContent, '3', 'the SEND badge counts what is new');
  /* share marks sent */
  w.navigator.share = async () => {};
  w.navigator.canShare = () => true;
  click(w, $(env, '#v-send [data-a="share"]'));
  await tick(10);
  eq(Q.send.select().entries.length, 0, 'a completed share marks everything sent');
  ok(Q.db.kv('sends', []).length === 1, 'and records the send');
  env.dom.window.close();
}

section('backup round trip');
{
  const env = await boot();
  const { Q } = env;
  Q.m.saveEntry({ id: 'b1', text: 'keep me', at: Date.now(), src: 'typed', kind: 'dump' });
  const d = Q.m.day(Q.u.today()); d.wake = '06:00'; Q.m.saveDay(d);
  Q.m.loadMapText('# m\n## A\n- x');
  const data = JSON.parse(JSON.stringify(Object.assign({ app: 'qurOS', kind: 'backup', settings: Q.settings.get() }, Q.db.dump())));
  env.dom.window.close();
  const env2 = await boot();
  env2.Q.db.load(data, 'merge');
  eq(env2.Q.m.entries().map(e => e.text), ['keep me'], 'dumps come back');
  eq(env2.Q.m.day(env2.Q.u.today()).wake, '06:00', 'days come back');
  eq(env2.Q.m.sections().length, 1, 'the map comes back');
  env2.dom.window.close();
}

section('the offline shell');
{
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
  const v1 = /VERSION = '([^']+)'/.exec(sw)[1], v2 = /Q\.VERSION = '([^']+)'/.exec(app)[1];
  eq(v1, v2, 'sw.js and app.js agree on the version');
  const shell = [...sw.matchAll(/'([^']+\.(?:html|js|css|woff2|svg|png|webmanifest))'/g)].map(m => m[1]);
  const missing = shell.filter(f => !fs.existsSync(path.join(ROOT, f)));
  eq(missing, [], 'every cached file exists');
  const notCached = scripts.filter(s => !shell.includes(s));
  eq(notCached, [], 'every script the page loads is cached');
  const mf = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
  ok(mf.icons.every(i => fs.existsSync(path.join(ROOT, i.src))), 'manifest icons exist');
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) { console.log(fails.map(f => ' - ' + f).join('\n')); process.exit(1); }
