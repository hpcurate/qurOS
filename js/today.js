/* TODAY — the flex system.
   A day that bends instead of breaking (qurOS spec §2): nothing turns red,
   nothing resets to zero, every habit has a minimum that counts as done, the
   screen leads with the one next action, and one switch collapses the whole
   day to its minimums.

   What the day is *made of* is Config (`today.*`); what was done is
   `today_v1`. Much of a day is not TODAY's to store: the wake-up time is
   LOG's, a gym session is GYM's, a focus round is TOOLS', a routine tick is
   DO's. Those are read at render time through each app's own reader and
   never copied — a step whose state comes from another app says so, and a
   tick made here on a step linked to DO is written through to DO. TODAY's own
   record holds what only it knows: goals, the chain's manual ticks, the
   hygiene chain, the evening prep, the bad-day flag and its two clock stamps.

   The evening dump is a LOG entry (one per day, marked `src:'dump'`), so it
   lands in the Obsidian note's journal with every other entry rather than in
   a second journal beside it. */
window.TODAY = (function () {
'use strict';

const SCOPE = '.ns-today ';
const $id   = id => document.querySelector(SCOPE + '#' + id);
const view  = document.getElementById('view-today');
const bodyEl = () => document.querySelector('#view-today .view-body');
const toast = msg => Shell.toast(msg);
const esc   = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
  ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

const KEY = 'today_v1';
const KEEP_DAYS = 400;

/* ── Time ──────────────────────────────────────────────────────────────── */
const pad   = n => String(n).padStart(2, '0');
const HM    = /^([01]?\d|2[0-3]):([0-5]\d)$/;
const minOf = v => { const m = HM.exec(String(v == null ? '' : v).trim()); return m ? (+m[1]) * 60 + (+m[2]) : null; };
const normHM = v => { const m = minOf(v); return m == null ? '' : pad(Math.floor(m / 60)) + ':' + pad(m % 60); };
const hhmm  = (d = new Date()) => pad(d.getHours()) + ':' + pad(d.getMinutes());
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
const ISO   = /^\d{4}-\d{2}-\d{2}$/;
function dayOffset(iso, n) {
  const p = String(iso).split('-').map(Number);
  const d = new Date(p[0], (p[1] || 1) - 1, (p[2] || 1) + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const WDAYS  = ['sun','mon','tue','wed','thu','fri','sat'];
function dayWord(iso, base) {
  const t = base || CUR;
  if (iso === t) return 'today';
  if (iso === dayOffset(t, -1)) return 'yesterday';
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d) ? iso : `${WDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
/* The week a day belongs to, by its first day — Monday unless behaviour says
   Sunday. The same key files the weekly goals and bounds every "X of 7". */
function weekKey(iso) {
  const d = new Date(iso + 'T12:00:00');
  const start = (window.Prefs && Prefs.get('weekStart') === 'sun') ? 0 : 1;
  return dayOffset(iso, -((d.getDay() - start + 7) % 7));
}
const weekOf = iso => { const k = weekKey(iso); return [0, 1, 2, 3, 4, 5, 6].map(i => dayOffset(k, i)); };

/* ── Content ───────────────────────────────────────────────────────────── */
let ANCH, GOALS, CHAIN, HYG, PREP, BAD, EXP, SHOWER, SHOWER_NOTE, DUMP_PROMPT;
const KEY_RE = /^[a-z0-9_-]{1,24}$/;
const slug = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24) || 'x';
/* Rows rebuilt from their known keys, every key an identity that survives
   once: a list read at boot is the most dangerous input in the app (§6). */
function keyedRows(raw, shape) {
  const seen = new Set();
  return (Array.isArray(raw) ? raw : []).filter(r => r && typeof r === 'object').map((r, i) => {
    let key = KEY_RE.test(String(r.key || '')) ? String(r.key) : slug(r.label || r.key || 'row' + i);
    while (seen.has(key)) key = key.slice(0, 20) + '_' + i;
    seen.add(key);
    return Object.assign({ key, label: String(r.label || key).slice(0, 60) }, shape(r));
  }).filter(r => r.label).slice(0, 24);
}
const doSpec = v => { const s = String(v || '').trim(); return /^[^|]+\|.+$/.test(s) ? s : ''; };
function readConfig() {
  const A = Object.assign({}, Config.defaults('today.anchors'), Config.get('today.anchors') || {});
  ANCH = {
    wake: normHM(A.wake) || '06:00',
    sleep: normHM(A.sleep),
    eveningFrom: normHM(A.eveningFrom) || '18:00',
    /* A day ends between midnight and six; later than that it is a new day. */
    dayEnds: (minOf(A.dayEnds) != null && minOf(A.dayEnds) < 360) ? normHM(A.dayEnds) : '00:00',
    grace: Math.max(0, Math.min(180, Math.round(+A.grace) || 0)),
  };
  const G = Object.assign({}, Config.defaults('today.goals'), Config.get('today.goals') || {});
  GOALS = { cap: Math.max(1, Math.min(3, Math.round(+G.cap) || 3)),
            weekCap: Math.max(1, Math.min(3, Math.round(+G.weekCap) || 3)),
            hint: String(G.hint == null ? '' : G.hint).slice(0, 140),
            carry: G.carry !== false };
  CHAIN = keyedRows(Config.get('today.chain'), r => ({
    full: String(r.full || '').slice(0, 140), min: String(r.min || '').slice(0, 140),
    link: /^(wake|gym|hygiene|pom:[a-z0-9_-]+(:\d+)?)$/.test(String(r.link || '')) ? String(r.link) : '',
    do: doSpec(r.do) }));
  HYG = keyedRows(Config.get('today.hygiene'), r => ({
    min: !!r.min, optional: !!r.optional,
    every: Math.max(0, Math.min(30, Math.round(+r.every) || 0)), do: doSpec(r.do) }));
  PREP = keyedRows(Config.get('today.prep'), r => ({ do: doSpec(r.do) }));
  BAD = Object.assign({}, Config.defaults('today.badDay'), Config.get('today.badDay') || {});
  EXP = Object.assign({}, Config.defaults('today.export'), Config.get('today.export') || {});
  SHOWER = Math.max(1, Math.min(30, Math.round(+Config.get('today.showerMins')) || 5));
  SHOWER_NOTE = String(Config.get('today.showerNote') || '');
  DUMP_PROMPT = String(Config.get('today.dumpPrompt') || '').slice(0, 200);
}
readConfig();

/* ── State ─────────────────────────────────────────────────────────────── */
const blank = () => ({ v: 1, days: {}, weeks: {}, shower: { endsAt: 0, iso: '' }, map: null, mapState: {} });
let DB = blank();
function normGoal(g) {
  if (!g || typeof g !== 'object') return null;
  const text = String(g.text || '').trim().slice(0, 140);
  if (!text) return null;
  return { id: String(g.id || 'g' + Math.random().toString(36).slice(2, 8)).slice(0, 24), text,
           done: !!g.done, at: normHM(g.at), from: ISO.test(g.from) ? g.from : '',
           fate: g.fate === 'carried' || g.fate === 'dropped' ? g.fate : '' };
}
const goalList = a => (Array.isArray(a) ? a : []).map(normGoal).filter(Boolean).slice(0, 12);
function stampMap(o, ok) {
  const out = {};
  if (o && typeof o === 'object') Object.keys(o).slice(0, 40).forEach(k => {
    if (!KEY_RE.test(k)) return;
    const v = ok(o[k]);
    if (v != null) out[k] = v;
  });
  return out;
}
function normDay(d) {
  d = d && typeof d === 'object' ? d : {};
  return {
    goals: goalList(d.goals),
    chain: stampMap(d.chain, v => v && ['full', 'min', 'skip'].includes(v.v) ? { v: v.v, at: normHM(v.at) } : null),
    hyg:   stampMap(d.hyg,   v => normHM(v) || (v === true ? '00:00' : null)),
    prep:  stampMap(d.prep,  v => normHM(v) || (v === true ? '00:00' : null)),
    bad: !!d.bad,
    wake: normHM(d.wake), sleep: normHM(d.sleep), exported: normHM(d.exported),
  };
}
function normMap(m) {
  if (!m || typeof m !== 'object' || !Array.isArray(m.sections)) return null;
  const sections = m.sections.filter(s => s && typeof s === 'object').slice(0, 60).map((s, i) => ({
    key: String(s.key || 's' + i).slice(0, 60),
    title: String(s.title || 'section ' + (i + 1)).slice(0, 120),
    tier: isFinite(+s.tier) ? Math.max(0, Math.min(99, +s.tier)) : 99,
    items: (Array.isArray(s.items) ? s.items : []).filter(x => x && x.text).slice(0, 80)
      .map((x, j) => ({ key: String(x.key || s.key + '/' + j).slice(0, 140), text: String(x.text).slice(0, 240) })),
  })).filter(s => s.items.length);
  return sections.length ? { title: String(m.title || '').slice(0, 120), sections, loaded: +m.loaded || 0 } : null;
}
function normalise(s) {
  const d = blank();
  if (!s || typeof s !== 'object') return d;
  if (s.days && typeof s.days === 'object') Object.keys(s.days).filter(k => ISO.test(k)).sort().slice(-KEEP_DAYS)
    .forEach(k => { d.days[k] = normDay(s.days[k]); });
  if (s.weeks && typeof s.weeks === 'object') Object.keys(s.weeks).filter(k => ISO.test(k)).sort().slice(-60)
    .forEach(k => { d.weeks[k] = { goals: goalList(s.weeks[k] && s.weeks[k].goals) }; });
  const sh = s.shower || {};
  d.shower = { endsAt: Math.max(0, +sh.endsAt || 0), iso: ISO.test(sh.iso) ? sh.iso : '' };
  d.map = normMap(s.map);
  if (s.mapState && typeof s.mapState === 'object') Object.keys(s.mapState).slice(0, 2000).forEach(k => {
    if (s.mapState[k] === 'partial' || s.mapState[k] === 'done') d.mapState[k] = s.mapState[k];
  });
  return d;
}
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch {}
  DB = normalise(s);
}
function save() {
  const keys = Object.keys(DB.days).sort();
  while (keys.length > KEEP_DAYS) delete DB.days[keys.shift()];
  try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch {}
}
load();

/* The day a tick belongs to. Shell.today() is the calendar day; this is the
   same day held open until `dayEnds`, so a dump written at 00:40 with the
   day ending at 02:00 is still about the day it describes. At the default
   (midnight) the two are the same day. */
function flexDay(now = new Date()) {
  const end = minOf(ANCH.dayEnds) || 0;
  const iso = Shell.today(now);
  return now.getHours() * 60 + now.getMinutes() < end ? dayOffset(iso, -1) : iso;
}
let CUR = flexDay();
const dayRec = iso => DB.days[iso] || normDay(null);
function dayW(iso) { if (!DB.days[iso]) DB.days[iso] = normDay(null); return DB.days[iso]; }
const isBad = iso => !!dayRec(iso).bad;

/* ── Reading the other apps ────────────────────────────────────────────────
   Every one of these is optional: an app that is missing or that throws
   simply contributes nothing, and TODAY still draws a day. */
const has = (app, fn) => !!(window[app] && typeof window[app][fn] === 'function');
const ask = (fn, dflt) => { try { const v = fn(); return v === undefined ? dflt : v; } catch { return dflt; } };
const splitDo = spec => { const i = String(spec).indexOf('|'); return i < 0 ? null : [spec.slice(0, i).trim(), spec.slice(i + 1).trim()]; };
/* DO keeps one day — its own today — so a link is only followed on that day. */
const doLive = iso => has('DO', 'dayIso') && ask(() => DO.dayIso(), '') === iso;
function doTicked(spec, iso) {
  if (!spec || !doLive(iso) || !has('DO', 'ticked')) return false;
  const p = splitDo(spec); return !!(p && ask(() => DO.ticked(p[0], p[1]), false));
}
function doSet(spec, on, iso) {
  if (!spec || !doLive(iso) || !has('DO', 'setTick')) return;
  const p = splitDo(spec); if (p) ask(() => DO.setTick(p[0], p[1], on), null);
}
const logWake = iso => has('LOG', 'wakeOf') ? normHM(ask(() => LOG.wakeOf(iso), '')) : '';
const wakeOf  = iso => logWake(iso) || dayRec(iso).wake;
const sleepOf = iso => dayRec(iso).sleep;
const gymOf   = iso => has('GYM', 'dayOf') ? ask(() => GYM.dayOf(iso), null) : null;
const pomAreas = () => has('TOOLS', 'areas') ? ask(() => TOOLS.areas(), []) : [];
const pomCount = (iso, area) => has('TOOLS', 'areaCount') ? (+ask(() => TOOLS.areaCount(iso, area), 0) || 0) : 0;
const pomNow  = () => has('TOOLS', 'pomNow') ? ask(() => TOOLS.pomNow(), null) : null;

/* ── The hygiene chain ─────────────────────────────────────────────────── */
function hygDone(iso, h) {
  if (dayRec(iso).hyg[h.key]) return true;
  return !!(h.do && doTicked(h.do, iso));
}
/* Full is every step that is not optional; the minimum is the steps marked
   `min` (the shower), or the first step if none is marked. */
function hygLevel(iso) {
  const req = HYG.filter(h => !h.optional);
  if (!req.length) return '';
  if (req.every(h => hygDone(iso, h))) return 'full';
  const mins = HYG.filter(h => h.min);
  return (mins.length ? mins : req.slice(0, 1)).every(h => hygDone(iso, h)) ? 'min' : '';
}
function hygTick(key, iso = CUR) {
  const h = HYG.find(x => x.key === key); if (!h) return;
  const d = dayW(iso), on = !hygDone(iso, h);
  if (on) d.hyg[key] = hhmm(); else delete d.hyg[key];
  if (h.do) doSet(h.do, on, iso);
  save();
}
/* Days since a step was last done, looking back a month — for the shave hint,
   which is about rhythm, never about a miss. */
function hygSince(key, iso) {
  for (let i = 0; i <= 31; i++) if (dayRec(dayOffset(iso, -i)).hyg[key]) return i;
  return null;
}

/* ── The chain ─────────────────────────────────────────────────────────── */
/* A step's state is the first of: a tick made here (which includes "not
   today"), what its link says, what DO says. `src` is which one answered —
   the row tells you when a state is another app's, so a tick that will not
   come off is never a mystery. */
function linkState(step, iso) {
  const L = step.link;
  if (L === 'wake') {
    const w = wakeOf(iso); if (!w) return null;
    const t = minOf(ANCH.wake);
    return { v: t == null || minOf(w) <= t + ANCH.grace ? 'full' : 'min', at: w, src: logWake(iso) ? 'log' : 'own' };
  }
  if (L === 'gym') {
    const g = gymOf(iso);
    return g ? { v: g.minimum ? 'min' : 'full', at: g.at || '', src: 'gym' } : null;
  }
  if (L === 'hygiene') { const l = hygLevel(iso); return l ? { v: l, at: '', src: 'hyg' } : null; }
  if (L.startsWith('pom:')) {
    const [, area, at] = L.split(':');
    const n = pomCount(iso, area); if (!n) return null;
    return { v: n >= Math.max(1, +at || 1) ? 'full' : 'min', at: '', src: 'tools', n };
  }
  return null;
}
function stepState(step, iso = CUR) {
  const own = dayRec(iso).chain[step.key];
  if (own) return { v: own.v, at: own.at, src: 'own' };
  const l = linkState(step, iso);
  if (l) return l;
  if (step.do && doTicked(step.do, iso)) return { v: 'full', at: '', src: 'do' };
  return { v: '', at: '', src: '' };
}
const isDone = st => st.v === 'full' || st.v === 'min';
const SRC_WORD = { log: 'from LOG', gym: 'from GYM', hyg: 'from the hygiene chain', tools: 'from TOOLS', do: 'ticked on DO' };
function setStep(key, v, iso = CUR) {
  const step = CHAIN.find(s => s.key === key); if (!step) return;
  const d = dayW(iso), own = d.chain[key];
  if (own && own.v === v) {
    delete d.chain[key];
    if (step.do && v !== 'skip') doSet(step.do, false, iso);
  } else {
    const was = stepState(step, iso);
    /* A state another app already answered is a fact, not a tick: tapping
       the value it already shows says where it came from rather than
       stacking a copy on top of it. */
    if (!own && was.v === v && was.src && was.src !== 'own') { toast(`${step.label} · ${SRC_WORD[was.src] || 'already done'}`); return; }
    d.chain[key] = { v, at: hhmm() };
    if (step.do) doSet(step.do, v !== 'skip', iso);
  }
  save();
}
function chainCount(iso = CUR) {
  return CHAIN.reduce((n, s) => n + (isDone(stepState(s, iso)) ? 1 : 0), 0);
}

/* ── Goals ─────────────────────────────────────────────────────────────── */
const newId = () => 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const goalsOf = iso => dayRec(iso).goals.filter(g => !g.fate);
function addGoal(text, iso = CUR, from = '') {
  const t = String(text || '').trim().slice(0, 140);
  if (!t) return false;
  if (goalsOf(iso).length >= GOALS.cap) { toast(`${GOALS.cap} is the cap — finish or drop one first`); return false; }
  dayW(iso).goals.push({ id: newId(), text: t, done: false, at: '', from, fate: '' });
  save();
  return true;
}
function toggleGoal(id, iso = CUR) {
  const g = dayW(iso).goals.find(x => x.id === id); if (!g) return;
  g.done = !g.done; g.at = g.done ? hhmm() : '';
  save();
}
function removeGoal(id, iso = CUR) {
  const d = dayW(iso), i = d.goals.findIndex(x => x.id === id); if (i < 0) return;
  const was = d.goals[i];
  d.goals.splice(i, 1);
  save(); render();
  Shell.undo('goal removed', () => { dayW(iso).goals.splice(Math.min(i, dayW(iso).goals.length), 0, was); save(); render(); });
}
/* Yesterday's leftovers. The last earlier day that had goals at all, and only
   the ones that were neither finished nor already answered. Older days are
   not dragged forward: one day back is a question, a week back is a pile. */
function carryFrom(iso = CUR) {
  if (!GOALS.carry) return null;
  const days = Object.keys(DB.days).filter(k => k < iso && DB.days[k].goals.length).sort();
  const prev = days[days.length - 1];
  if (!prev) return null;
  const open = DB.days[prev].goals.filter(g => !g.done && !g.fate);
  return open.length ? { iso: prev, goals: open } : null;
}
function settleGoal(fromIso, id, fate) {
  const g = dayW(fromIso).goals.find(x => x.id === id); if (!g || g.fate) return;
  if (fate === 'carried' && !addGoal(g.text, CUR, fromIso)) return;
  g.fate = fate;
  save();
}

/* The week's goals: the same shape, filed under the week's first day. */
const weekW = k => (DB.weeks[k] || (DB.weeks[k] = { goals: [] }));
const weekGoals = k => (DB.weeks[k] ? DB.weeks[k].goals : []).filter(g => !g.fate);
function addWeekGoal(text, k = weekKey(CUR), from = '') {
  const t = String(text || '').trim().slice(0, 140);
  if (!t) return false;
  if (weekGoals(k).length >= GOALS.weekCap) { toast(`${GOALS.weekCap} a week is the cap`); return false; }
  weekW(k).goals.push({ id: newId(), text: t, done: false, at: '', from, fate: '' });
  save();
  return true;
}
function toggleWeekGoal(id, k = weekKey(CUR)) {
  const g = weekW(k).goals.find(x => x.id === id); if (!g) return;
  g.done = !g.done; g.at = g.done ? CUR : '';
  save();
}
function removeWeekGoal(id, k = weekKey(CUR)) {
  const w = weekW(k), i = w.goals.findIndex(x => x.id === id); if (i < 0) return;
  const was = w.goals[i];
  w.goals.splice(i, 1); save(); render();
  Shell.undo('weekly goal removed', () => { weekW(k).goals.splice(i, 0, was); save(); render(); });
}
function weekCarryFrom(k = weekKey(CUR)) {
  if (!GOALS.carry) return null;
  const prev = Object.keys(DB.weeks).filter(x => x < k && DB.weeks[x].goals.length).sort().pop();
  if (!prev) return null;
  const open = DB.weeks[prev].goals.filter(g => !g.done && !g.fate);
  return open.length ? { week: prev, goals: open } : null;
}
function settleWeekGoal(fromWeek, id, fate) {
  const g = weekW(fromWeek).goals.find(x => x.id === id); if (!g || g.fate) return;
  if (fate === 'carried' && !addWeekGoal(g.text, weekKey(CUR), fromWeek)) return;
  g.fate = fate; save();
}

/* ── Prep, the anchors, the bad day ────────────────────────────────────── */
const prepDone = (iso, p) => !!dayRec(iso).prep[p.key] || !!(p.do && doTicked(p.do, iso));
function prepTick(key, iso = CUR) {
  const p = PREP.find(x => x.key === key); if (!p) return;
  const on = !prepDone(iso, p), d = dayW(iso);
  if (on) d.prep[key] = hhmm(); else delete d.prep[key];
  if (p.do) doSet(p.do, on, iso);
  save();
}
/* TODAY's own wake stamp is the one-tap version; LOG's morning form, when it
   is written, is the record, and it wins. LOG's form is offered this one as
   its default (LOG.popM), so the time is only ever typed once. */
function setWake(v, iso = CUR) { dayW(iso).wake = v === '' ? '' : (normHM(v) || hhmm()); save(); }
function setSleep(v, iso = CUR) { dayW(iso).sleep = v === '' ? '' : (normHM(v) || hhmm()); save(); }
function toggleBad(iso = CUR) {
  const d = dayW(iso); d.bad = !d.bad; save();
  toast(d.bad ? 'bad day — minimums only' : 'back to the full day');
}
/* Hours slept before a morning: last night's lights-out to this morning's
   wake, when both are known. A night is never longer than 16 hours here — a
   stamp from three days ago is not last night. */
function sleepHoursBefore(iso) {
  const out = minOf(sleepOf(dayOffset(iso, -1))), up = minOf(wakeOf(iso));
  if (out == null || up == null) return null;
  let mins = up - out; if (mins <= 0) mins += 1440;
  return mins > 16 * 60 ? null : Math.round(mins / 6) / 10;
}

/* ── The dump: a LOG entry ─────────────────────────────────────────────── */
const dumpText = iso => has('LOG', 'entryOf') ? String(ask(() => LOG.entryOf(iso, 'dump'), '') || '') : '';
let dumpTimer = null, dumpPending = null;
function saveDump(text, iso) {
  dumpPending = { text, iso };
  clearTimeout(dumpTimer);
  dumpTimer = setTimeout(flushDump, 500);
}
function flushDump() {
  clearTimeout(dumpTimer); dumpTimer = null;
  if (!dumpPending) return;
  const { text, iso } = dumpPending; dumpPending = null;
  if (has('LOG', 'setEntry')) ask(() => LOG.setEntry(iso, 'dump', String(text || '').trim()), null);
}
window.addEventListener('pagehide', flushDump);

/* ── The next action ───────────────────────────────────────────────────── */
/* One thing, not the mountain. In the morning that is the first step of the
   chain nobody has answered yet (order is guidance: a later step ticked first
   is simply done, and a skipped one is passed over), then the first open
   goal. From `eveningFrom` it is the evening's: the prep, the dump, lights
   out. A morning step left undone does not follow you into the evening — it
   stays on the list, tickable, and stops asking. */
function nextItem(iso = CUR) {
  const bad = isBad(iso);
  const evening = iso !== CUR || nowMin() >= (minOf(ANCH.eveningFrom) ?? 1080);
  if (!evening) {
    for (let i = 0; i < CHAIN.length; i++) {
      const st = stepState(CHAIN[i], iso);
      if (!st.v) return { kind: 'step', step: CHAIN[i], st, pos: i };
    }
    if (!bad || BAD.keepGoals) { const g = goalsOf(iso).find(x => !x.done); if (g) return { kind: 'goal', goal: g }; }
    return { kind: 'free' };
  }
  if (!bad) { const p = PREP.find(x => !prepDone(iso, x)); if (p) return { kind: 'prep', prep: p }; }
  if (!dumpText(iso)) return { kind: 'dump' };
  if (!sleepOf(iso)) return { kind: 'sleep' };
  return { kind: 'rest' };
}

/* ── The week ──────────────────────────────────────────────────────────── */
function weekStats(iso = CUR) {
  const days = weekOf(iso).filter(k => k <= CUR);
  const chain = CHAIN.map(s => ({ key: s.key, label: s.label,
    cells: weekOf(iso).map(k => k > CUR ? 'future' : (stepState(s, k).v || '')) }));
  const hyg = HYG.map(h => ({ key: h.key, label: h.label, optional: h.optional,
    cells: weekOf(iso).map(k => k > CUR ? 'future' : (hygDone(k, h) ? 'full' : '')) }));
  const goals = days.reduce((a, k) => { const g = dayRec(k).goals; a.done += g.filter(x => x.done).length;
    a.total += g.filter(x => x.done || !x.fate).length; return a; }, { done: 0, total: 0 });
  const pom = {};
  pomAreas().forEach(a => { pom[a.key] = { label: a.label, color: a.color,
    n: days.reduce((t, k) => t + pomCount(k, a.key), 0) }; });
  const bad = days.filter(k => isBad(k)).length;
  const gym = has('GYM', 'weekCount') ? ask(() => GYM.weekCount(weekOf(iso)), null) : null;
  return { days: weekOf(iso), chain, hyg, goals, pom, bad, gym };
}

/* ── One day, read back ────────────────────────────────────────────────── */
/* Everything the export and LOG's note say about a day, in one place, so the
   two cannot disagree. Null for a day nothing at all happened on. */
function dayStats(iso) {
  const d = dayRec(iso);
  const steps = CHAIN.map(s => Object.assign({ key: s.key, label: s.label }, stepState(s, iso)));
  const hyg = HYG.filter(h => hygDone(iso, h)).map(h => h.label);
  const prep = PREP.map(p => ({ label: p.label, done: prepDone(iso, p) }));
  const pom = pomAreas().map(a => ({ label: a.label, n: pomCount(iso, a.key) })).filter(a => a.n);
  const any = d.goals.length || steps.some(s => s.v) || hyg.length || prep.some(p => p.done) ||
              d.bad || d.wake || d.sleep || pom.length || dumpText(iso);
  if (!any) return null;
  return {
    date: iso, bad: d.bad, wake: wakeOf(iso), wakeTarget: ANCH.wake, sleep: d.sleep, sleepTarget: ANCH.sleep,
    goals: d.goals.map(g => ({ text: g.text, done: g.done, fate: g.fate, at: g.at, from: g.from })),
    steps, hyg, hygLevel: hygLevel(iso), prep, pom, gym: gymOf(iso),
    dump: dumpText(iso),
  };
}

function exportMd(iso = CUR) {
  const s = dayStats(iso) || { goals: [], steps: [], hyg: [], prep: [], pom: [] };
  const d = new Date(iso + 'T12:00:00');
  const out = [`# qurOS · ${WDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`, ''];
  const head = t => { out.push('', '## ' + t); };
  if (EXP.anchors !== false) {
    out.push(`- date: ${iso}`);
    out.push(`- wake: ${s.wake || '—'}${ANCH.wake ? ` (target ${ANCH.wake})` : ''}`);
    out.push(`- sleep: ${s.sleep || '—'}${ANCH.sleep ? ` (target ${ANCH.sleep})` : ''}`);
    out.push(`- bad day: ${s.bad ? 'yes' : 'no'}`);
  }
  if (EXP.goals !== false) {
    head('goals');
    if (!s.goals.length) out.push('- none set');
    s.goals.forEach(g => out.push(`- [${g.done ? 'x' : ' '}] ${g.text}${g.done && g.at ? ` (${g.at})` : ''}` +
      `${g.fate === 'carried' ? ' → carried' : g.fate === 'dropped' ? ' → dropped' : ''}${g.from ? ` · from ${g.from}` : ''}`));
  }
  if (EXP.weekly !== false) {
    const wk = weekKey(iso), wg = (DB.weeks[wk] ? DB.weeks[wk].goals : []);
    if (wg.length) { head('this week'); wg.forEach(g => out.push(`- [${g.done ? 'x' : ' '}] ${g.text}${g.fate ? ' → ' + g.fate : ''}`)); }
  }
  if (EXP.chain !== false) {
    head(`morning chain — ${s.steps.filter(isDone).length} of ${s.steps.length}`);
    /* A checkbox a chat can read at a glance; what was done says which version
       and when, and a step nobody answered is simply unticked. */
    s.steps.forEach(st => out.push(`- [${isDone(st) ? 'x' : ' '}] ${st.label}` +
      (st.v === 'full' ? ' — full' : st.v === 'min' ? ' — minimum' : st.v === 'skip' ? ' — not today' : '') +
      (st.at ? ` (${st.at})` : '')));
  }
  if (EXP.hygiene !== false && HYG.length) {
    head('hygiene');
    out.push(HYG.map(h => `${h.label} ${hygDone(iso, h) ? '✓' : '—'}`).join(' · '));
  }
  if (EXP.pom !== false && pomAreas().length) {
    head('pomodoros');
    out.push(`- today: ${s.pom.length ? s.pom.map(a => `${a.label} ${a.n}`).join(' · ') : 'none'}`);
    const wk = weekOf(iso).filter(k => k <= iso);
    const week = pomAreas().map(a => ({ label: a.label, n: wk.reduce((t, k) => t + pomCount(k, a.key), 0) })).filter(a => a.n);
    out.push(`- this week: ${week.length ? week.map(a => `${a.label} ${a.n}`).join(' · ') : 'none'}`);
  }
  if (EXP.gym !== false) {
    const g = s.gym;
    if (g) { head('gym'); out.push(g.summary || (g.minimum ? 'minimum session' : 'session'));
             (g.lines || []).forEach(l => out.push('- ' + l)); }
  }
  if (EXP.meals !== false) {
    const meals = has('LOG', 'dayData') ? ask(() => LOG.dayData(iso), null) : null;
    const cooked = has('STORE', 'cookedOn') ? ask(() => STORE.cookedOn(iso), []) : [];
    if ((meals && meals.meals) || cooked.length) {
      head('meals');
      if (meals && meals.meals) out.push(`- logged: ${meals.meals} meal${meals.meals === 1 ? '' : 's'}`);
      if (cooked.length) out.push(`- cooked: ${cooked.join(', ')}`);
    }
  }
  if (EXP.prep !== false && s.prep.length) {
    head('evening prep');
    s.prep.forEach(p => out.push(`- [${p.done ? 'x' : ' '}] ${p.label}`));
  }
  if (EXP.dump !== false) {
    head('dump');
    out.push(s.dump ? s.dump : '_nothing written_');
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

/* ── The life-dump map (spec §9) ───────────────────────────────────────────
   A markdown file read as data: headings are sections, list items are the
   things to talk through, and a heading that says "Tier N" sets the tier for
   what follows it (or for itself, when it has items of its own). One section
   per dump, the lowest tier first. A state is filed under the item's text, so
   re-importing an edited map keeps every item that was not reworded. */
function parseMap(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  let title = '', tier = 99, cur = null;
  const sections = [], seed = {};
  const tierOf = s => { const m = /\btier\s*(\d{1,2})\b/i.exec(s); return m ? +m[1] : null; };
  lines.forEach(raw => {
    const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(raw);
    if (h) {
      const text = h[2].trim(), t = tierOf(text);
      if (h[1].length === 1 && !title && t == null) { title = text; return; }
      if (t != null) tier = t;
      const name = text.replace(/[-–—:·|(]*\s*\btier\s*\d{1,2}\b\s*\)?[-–—:·|]*/i, '').trim();
      cur = { key: slug(name || text) + '_' + sections.length, title: name || text, tier: t != null ? t : tier, items: [] };
      sections.push(cur);
      return;
    }
    const li = /^\s*(?:[-*+]|\d+[.)])\s+(?:\[([ xX~/-])\]\s*)?(.+)$/.exec(raw);
    if (li && li[2].trim()) {
      if (!cur) { cur = { key: 'general_0', title: title || 'general', tier, items: [] }; sections.push(cur); }
      const itext = li[2].trim();
      const key = cur.title.toLowerCase() + '/' + itext.toLowerCase();
      cur.items.push({ key, text: itext });
      if (/[xX]/.test(li[1] || '')) seed[key] = 'done';
      else if (/[~/-]/.test(li[1] || '')) seed[key] = 'partial';
    }
  });
  const map = normMap({ title, sections: sections.filter(s => s.items.length), loaded: Date.now() });
  return map ? { map, seed } : null;
}
function loadMapText(text, how) {
  const r = parseMap(text);
  if (!r) { toast('no sections with items in that file'); return false; }
  DB.map = r.map;
  /* States survive a re-import by key; the file's own [x] only fills in an
     item that has no state yet — the app's answer is newer than the file's. */
  Object.keys(r.seed).forEach(k => { if (!DB.mapState[k]) DB.mapState[k] = r.seed[k]; });
  save(); render();
  const n = r.map.sections.reduce((a, s) => a + s.items.length, 0);
  toast(`map ${how || 'loaded'} · ${r.map.sections.length} sections · ${n} items`);
  return true;
}
const mapSections = () => (DB.map ? DB.map.sections.slice().sort((a, b) => a.tier - b.tier) : []);
const itemState = k => DB.mapState[k] || 'empty';
function mapNext() {
  for (const s of mapSections()) {
    const it = s.items.find(x => itemState(x.key) === 'empty');
    if (it) return { section: s, item: it };
  }
  return null;
}
function dumpPromptFor(s) {
  const open = s.items.filter(x => itemState(x.key) !== 'done');
  return `${DUMP_PROMPT ? DUMP_PROMPT + ' ' : ''}${s.title}${s.tier < 99 ? ` (tier ${s.tier})` : ''}.\n` +
    open.map(x => `- ${x.text}${itemState(x.key) === 'partial' ? ' (started)' : ''}`).join('\n');
}
async function copyText(text, what) {
  try { await navigator.clipboard.writeText(text); toast((what || 'copied') + ' · copied'); return true; }
  catch {
    /* The clipboard API wants a secure context and a gesture; a selected
       textarea is the fallback that works everywhere else. */
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch {}
    ta.remove();
    toast(ok ? (what || 'copied') + ' · copied' : 'copy blocked — select the text instead');
    return ok;
  }
}

/* ── The shower ─────────────────────────────────────────────────────────── */
/* A wall-clock end, like every timer in the app, so a locked phone comes back
   to the right number. Finishing ticks the shower — it is the minimum, and the
   timer running out is the shower having happened. */
const showerLeft = () => DB.shower.endsAt ? Math.max(0, DB.shower.endsAt - Date.now()) : 0;
function showerStart() { DB.shower = { endsAt: Date.now() + SHOWER * 60000, iso: CUR }; save(); render(); }
function showerStop(done) {
  const iso = DB.shower.iso || CUR;
  DB.shower = { endsAt: 0, iso: '' };
  const sh = HYG.find(h => h.min) || HYG[0];
  if (done && sh && !hygDone(iso, sh)) hygTick(sh.key, iso);
  save(); render();
}

/* ── The tick ───────────────────────────────────────────────────────────── */
/* One second, only while something is moving: the shower, or a focus round
   while this slide is up. TOOLS runs its own clock and finishes its own
   rounds; this only repaints, and redraws when a round finishing changed a
   count the screen is showing. */
let timer = null, pomSig = '';
const onScreen = () => !!view && view.classList.contains('cur');
function needsTick() { const p = pomNow(); return !!DB.shower.endsAt || (onScreen() && !!(p && p.running)); }
function syncTick() {
  if (needsTick() && !timer) timer = setInterval(tick, 1000);
  else if (!needsTick() && timer) { clearInterval(timer); timer = null; }
}
const clock = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
function tick() {
  if (DB.shower.endsAt && showerLeft() <= 0) {
    showerStop(true);
    toast(`${SHOWER} minutes — done`);
    if (window.Prefs && Prefs.tap) Prefs.tap(40);
    return;
  }
  const t = $id('ty-shower-t'); if (t) t.textContent = clock(showerLeft() || SHOWER * 60000);
  const p = pomNow();
  const sig = p ? `${p.phase}|${p.round}|${p.running}|${pomAreas().map(a => pomCount(CUR, a.key)).join(',')}` : '';
  if (sig !== pomSig) { pomSig = sig; if (onScreen()) render(); }
  else if (p) { const el = $id('ty-pom-t'); if (el) el.textContent = clock(p.left); }
  syncTick();
}

/* ── Drawing ─────────────────────────────────────────────────────────────── */
const PLAY  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5" width="3.5" height="14" rx="1"/><rect x="13.5" y="5" width="3.5" height="14" rx="1"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
const FOLD  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const pref = (k, d) => (window.Prefs && Prefs.get(k) !== undefined ? Prefs.get(k) : d);
let chainOpen = null;          // in memory: the fold, until the next visit
const chainShown = () => chainOpen != null ? chainOpen : pref('todayChain', 'fold') === 'open';

function secHead(word, right, act, open) {
  const inner = `<span>${esc(word)}</span>${right ? `<em>${right}</em>` : ''}${act === 'fold'
    ? `<i class="ty-fold${open ? ' open' : ''}">${FOLD}</i>` : act ? `<i class="ty-go">${ARROW}</i>` : ''}`;
  return act ? `<button class="ty-sec-h" data-act="${esc(act)}"${act === 'fold' ? ` aria-expanded="${!!open}"` : ''}>${inner}</button>`
             : `<div class="ty-sec-h">${inner}</div>`;
}
const vWord = v => v === 'full' ? 'full' : v === 'min' ? 'min' : v === 'skip' ? 'not today' : '';
function stepNote(step, st, iso) {
  const bad = isBad(iso);
  if (st.v === 'skip') return 'not today';
  if (isDone(st)) return [st.at, vWord(st.v), SRC_WORD[st.src] || ''].filter(Boolean).join(' · ');
  return bad ? step.min : step.full;
}
function stepActs(step, st, iso, big) {
  const bad = isBad(iso);
  const pill = (v, label) => `<button class="ty-pill${st.v === v ? ' on' : ''}" data-act="step" data-k="${esc(step.key)}" data-v="${v}"
      data-tick aria-pressed="${st.v === v}">${st.v === v ? CHECK : ''}<span>${esc(label)}</span></button>`;
  if (bad) return pill('min', big ? 'done — minimum' : 'min');
  return pill('min', big ? 'minimum' : 'min') + pill('full', 'full');
}
/* What a linked step offers besides the tick: the place it is done. */
function stepLinkAct(step, iso) {
  const L = step.link;
  if (L === 'gym' && has('GYM', 'open')) {
    const nx = has('GYM', 'next') ? ask(() => GYM.next(), null) : null;
    return `<button class="ty-link" data-act="open-gym">${nx ? esc(nx.label) + ' is up' : 'open gym'}${ARROW}</button>`;
  }
  if (L === 'hygiene') return `<button class="ty-link" data-act="go" data-s="hyg">the chain${ARROW}</button>`;
  if (L === 'wake' && !wakeOf(iso) && iso === CUR) return `<button class="ty-link" data-act="up">I'm up · ${hhmm()}</button>`;
  if (L.startsWith('pom:') && has('TOOLS', 'startFocus')) {
    const area = L.split(':')[1], a = pomAreas().find(x => x.key === area), p = pomNow();
    if (p && p.running && p.phase === 'focus') return `<button class="ty-link" data-act="go-tools">${clock(p.left)} · ${esc(p.areaLabel || 'focus')}${ARROW}</button>`;
    return `<button class="ty-link go" data-act="pom-start" data-a="${esc(area)}">${PLAY}start ${esc(a ? a.label : area)} · ${has('TOOLS', 'focusMins') ? ask(() => TOOLS.focusMins(), 25) : 25} min</button>`;
  }
  return '';
}

function nextHTML(iso) {
  const n = nextItem(iso);
  const bad = isBad(iso);
  const frame = (tag, title, sub, acts, more, cls) => `<div class="ty-next card${cls ? ' ' + cls : ''}">
      <div class="ty-next-h"><span class="ty-tag">next</span>${tag ? `<span class="ty-next-pos">${tag}</span>` : ''}</div>
      <div class="ty-next-t">${title}</div>
      ${sub ? `<div class="ty-next-s">${sub}</div>` : ''}
      ${acts ? `<div class="ty-next-acts">${acts}</div>` : ''}
      ${more ? `<div class="ty-next-more">${more}</div>` : ''}
    </div>`;
  if (n.kind === 'step') {
    return frame(`${n.pos + 1} of ${CHAIN.length}`, esc(n.step.label), esc(bad ? n.step.min : n.step.full),
      stepActs(n.step, n.st, iso, true),
      stepLinkAct(n.step, iso) + `<button class="ty-quiet" data-act="step" data-k="${esc(n.step.key)}" data-v="skip">not today</button>`);
  }
  if (n.kind === 'goal') {
    const focus = has('TOOLS', 'startFocus') ? `<button class="ty-link go" data-act="pom-start">${PLAY}a focus round on it</button>` : '';
    return frame('goal', esc(n.goal.text), '',
      `<button class="ty-pill" data-act="goal" data-id="${esc(n.goal.id)}" data-tick>${CHECK}<span>done</span></button>`, focus);
  }
  if (n.kind === 'prep') return frame('evening', esc(n.prep.label), 'ready for tomorrow',
    `<button class="ty-pill" data-act="prep" data-k="${esc(n.prep.key)}" data-tick>${CHECK}<span>ready</span></button>`, '');
  if (n.kind === 'dump') return frame('evening', 'the evening dump', 'whatever is in your head — it gets cleaned up later',
    `<button class="ty-pill go" data-act="go" data-s="eve"><span>write it</span>${ARROW}</button>`, '');
  if (n.kind === 'sleep') return frame('evening', 'lights out',
    ANCH.sleep ? `target ${esc(ANCH.sleep)}` : 'one tap when you go',
    `<button class="ty-pill" data-act="sleep-now" data-tick>${CHECK}<span>lights out · ${hhmm()}</span></button>`, '');
  if (n.kind === 'rest') return frame('', 'that is the day', 'rest — tomorrow starts at ' + esc(ANCH.wake), '', '', 'calm');
  return frame('', 'nothing next', `the rest is yours${PREP.length ? ` · the evening starts at ${esc(ANCH.eveningFrom)}` : ''}`,
    '', '', 'calm');
}

function carryHTML(iso) {
  const c = carryFrom(iso);
  const w = weekCarryFrom();
  let out = '';
  if (c) {
    const full = goalsOf(iso).length >= GOALS.cap;
    out += `<div class="ty-carry card">
      ${secHead('from ' + dayWord(c.iso), 'carry or drop — either is fine')}
      ${c.goals.map(g => `<div class="ty-carry-r">
        <span class="ty-carry-t">${esc(g.text)}</span>
        <button class="ty-mini" data-act="carry" data-from="${esc(c.iso)}" data-id="${esc(g.id)}"${full ? ' disabled' : ''}>carry</button>
        <button class="ty-mini q" data-act="drop" data-from="${esc(c.iso)}" data-id="${esc(g.id)}">drop</button>
      </div>`).join('')}
      ${c.goals.length > 1 ? `<div class="ty-carry-all">
        <button class="ty-mini" data-act="carry-all" data-from="${esc(c.iso)}"${full ? ' disabled' : ''}>carry all</button>
        <button class="ty-mini q" data-act="drop-all" data-from="${esc(c.iso)}">drop all</button></div>` : ''}
      ${full ? `<div class="ty-fine">today already has ${GOALS.cap} — finish or drop one to carry more</div>` : ''}
    </div>`;
  }
  if (w) {
    const full = weekGoals(weekKey(CUR)).length >= GOALS.weekCap;
    out += `<div class="ty-carry card">
      ${secHead('from last week', 'carry or drop')}
      ${w.goals.map(g => `<div class="ty-carry-r">
        <span class="ty-carry-t">${esc(g.text)}</span>
        <button class="ty-mini" data-act="wcarry" data-from="${esc(w.week)}" data-id="${esc(g.id)}"${full ? ' disabled' : ''}>carry</button>
        <button class="ty-mini q" data-act="wdrop" data-from="${esc(w.week)}" data-id="${esc(g.id)}">drop</button>
      </div>`).join('')}
    </div>`;
  }
  return out;
}

function anchorsHTML(iso) {
  const w = wakeOf(iso), fromLog = !!logWake(iso), s = sleepOf(iso);
  const evening = nowMin() >= (minOf(ANCH.eveningFrom) ?? 1080) || iso !== CUR;
  const field = (which, v) => `<input class="ty-anc-in" type="text" inputmode="numeric" data-pad="clock"
      data-anchor="${which}" value="${esc(v)}" aria-label="${which} time" autocomplete="off">`;
  return `<div class="ty-anchors">
    <div class="ty-anc">
      <span class="ty-anc-l">wake<em>${ANCH.wake ? 'target ' + esc(ANCH.wake) : 'no target'}${fromLog ? ' · from log' : ''}</em></span>
      ${w ? (fromLog ? `<span class="ty-anc-v">${esc(w)}</span>` : field('wake', w))
          : iso === CUR ? `<button class="ty-anc-b" data-act="up">I'm up</button>` : '<span class="ty-anc-v dim">—</span>'}
    </div>
    <div class="ty-anc">
      <span class="ty-anc-l">sleep<em>${ANCH.sleep ? 'target ' + esc(ANCH.sleep) : 'no target'}</em></span>
      ${s ? field('sleep', s) : evening ? `<button class="ty-anc-b" data-act="sleep-now">lights out</button>`
          : '<span class="ty-anc-v dim">—</span>'}
    </div>
  </div>`;
}

function weekStripHTML() {
  const k = weekKey(CUR), gs = weekGoals(k);
  const done = gs.filter(g => g.done).length;
  return `<div class="ty-sec ty-wk">
    ${secHead('this week', gs.length ? `${done} of ${gs.length}` : 'up to ' + GOALS.weekCap, 'go-week')}
    <div class="ty-wchips">${gs.map(g => `<button class="ty-wchip${g.done ? ' on' : ''}" data-act="wgoal" data-id="${esc(g.id)}"
        data-tick aria-pressed="${g.done}">${g.done ? CHECK : ''}<span>${esc(g.text)}</span></button>`).join('')}${
      gs.length < GOALS.weekCap ? `<button class="ty-wchip add" data-act="wgoal-add">+ weekly goal</button>` : ''}</div>
  </div>`;
}

function goalsHTML(iso) {
  const gs = goalsOf(iso);
  const done = gs.filter(g => g.done).length;
  const room = gs.length < GOALS.cap;
  return `<div class="ty-sec ty-goals">
    ${secHead("today's goals", gs.length ? `${done} of ${gs.length} · up to ${GOALS.cap}` : `up to ${GOALS.cap}`)}
    ${gs.map(g => `<div class="ty-goal${g.done ? ' done' : ''}">
      <button class="ty-ck${g.done ? ' on' : ''}" data-act="goal" data-id="${esc(g.id)}" data-tick
              aria-pressed="${g.done}" aria-label="done">${CHECK}</button>
      <span class="ty-goal-t">${esc(g.text)}${g.from ? `<small>from ${esc(dayWord(g.from))}</small>` : ''}</span>
      <button class="ty-x" data-act="goal-del" data-id="${esc(g.id)}" aria-label="remove goal">×</button>
    </div>`).join('')}
    ${room ? `<div class="ty-add">
      <input type="text" id="ty-goal-in" maxlength="140" placeholder="${gs.length ? 'another one?' : 'one small thing for today'}"
             autocomplete="off" enterkeyhint="done" aria-label="a goal for today">
      <button class="ty-add-b" data-act="goal-add">add</button>
    </div>${GOALS.hint ? `<div class="ty-hint">${esc(GOALS.hint)}</div>` : ''}` : ''}
  </div>`;
}

function chainHTML(iso) {
  const open = chainShown();
  const states = CHAIN.map(s => stepState(s, iso));
  const n = states.filter(isDone).length;
  const next = nextItem(iso);
  const nextKey = next.kind === 'step' ? next.step.key : null;
  const dots = `<span class="ty-dots" aria-hidden="true">${states.map(st =>
    `<i class="${st.v === 'full' ? 'f' : st.v === 'min' ? 'm' : st.v === 'skip' ? 's' : ''}"></i>`).join('')}</span>`;
  return `<div class="ty-sec ty-chain">
    ${secHead('morning chain', `${n} of ${CHAIN.length}`, 'fold', open)}
    ${open ? CHAIN.map((s, i) => {
      const st = states[i];
      const cls = isDone(st) ? 'done' : st.v === 'skip' ? 'skip' : s.key === nextKey ? 'next' : 'dim';
      return `<div class="ty-step ${cls}">
        <span class="ty-step-ix">${s.key === nextKey ? 'next' : i + 1}</span>
        <span class="ty-step-b"><b>${esc(s.label)}</b><small>${esc(stepNote(s, st, iso))}</small></span>
        <span class="ty-step-acts">${stepActs(s, st, iso, false)}</span>
      </div>`;
    }).join('') : `<button class="ty-dots-row" data-act="fold">${dots}<span>${n === CHAIN.length ? 'all done' : 'the whole chain'}</span></button>`}
  </div>`;
}

function focusHTML(iso) {
  const areas = pomAreas();
  if (!areas.length || !has('TOOLS', 'pomNow')) return '';
  const p = pomNow() || {};
  const counts = areas.map(a => ({ a, n: pomCount(iso, a.key) }));
  const total = counts.reduce((t, x) => t + x.n, 0);
  const running = !!p.running, cur = p.area || areas[0].key;
  return `<div class="ty-sec ty-focus">
    ${secHead('focus', total ? `${total} round${total === 1 ? '' : 's'} today` : 'nothing yet today', 'go-tools')}
    <div class="ty-areas">${counts.map(({ a, n }) => `<button class="ty-area${a.key === cur ? ' on' : ''}" data-act="pom-area"
        data-a="${esc(a.key)}" style="--ar:${esc(a.color)}"><span>${esc(a.label)}</span>${n ? `<b>${n}</b>` : ''}</button>`).join('')}</div>
    <div class="ty-pom${running ? ' live' : ''}${p.phase && p.phase !== 'focus' ? ' brk' : ''}">
      <button class="ty-play" data-act="pom-toggle" aria-label="${running ? 'pause' : 'start'}">${running ? PAUSE : PLAY}</button>
      <span class="ty-pom-t" id="ty-pom-t">${clock(p.left || 0)}</span>
      <span class="ty-pom-s">${esc(p.phaseLabel || 'focus')}${p.phase === 'focus' || !p.phase ? ' · ' + esc((areas.find(a => a.key === cur) || areas[0]).label) : ''}</span>
    </div>
  </div>`;
}

function eveningHTML(iso) {
  const bad = isBad(iso);
  const done = PREP.filter(p => prepDone(iso, p)).length;
  const dump = !!dumpText(iso);
  const right = [PREP.length && !bad ? `prep ${done} of ${PREP.length}` : '', dump ? 'dump written' : ''].filter(Boolean).join(' · ');
  return `<div class="ty-sec ty-eve">
    ${secHead('evening', right || 'from ' + esc(ANCH.eveningFrom), 'go-eve')}
    ${bad ? '' : PREP.map(p => prepRow(iso, p)).join('')}
  </div>`;
}
const prepRow = (iso, p) => {
  const on = prepDone(iso, p);
  return `<div class="ty-goal${on ? ' done' : ''}">
    <button class="ty-ck${on ? ' on' : ''}" data-act="prep" data-k="${esc(p.key)}" data-tick aria-pressed="${on}" aria-label="ready">${CHECK}</button>
    <span class="ty-goal-t">${esc(p.label)}</span>
  </div>`;
};

function dumpRowHTML() {
  if (!DB.map || !pref('todayDumpRow', true)) return '';
  const n = mapNext();
  return `<button class="ty-dumprow" data-act="go" data-s="dump">
    <span class="ty-dr-l">life dump</span>
    <span class="ty-dr-t">${n ? `next: <b>${esc(n.item.text)}</b><small>${esc(n.section.title)}</small>` : '<b>every item touched</b>'}</span>
    <i class="ty-go">${ARROW}</i></button>`;
}

function homeHTML() {
  const iso = CUR, bad = isBad(iso);
  const parts = [];
  if (bad) parts.push(`<div class="ty-badnote">${esc(BAD.note || 'minimums only')}</div>`);
  if (!bad || BAD.keepGoals) parts.push(carryHTML(iso));
  parts.push(anchorsHTML(iso));
  parts.push(nextHTML(iso));
  if (!bad && pref('todayWeek', true)) parts.push(weekStripHTML());
  if (!bad || BAD.keepGoals) parts.push(goalsHTML(iso));
  parts.push(chainHTML(iso));
  if (pref('todayFocus', true) && (!bad || BAD.keepFocus)) parts.push(focusHTML(iso));
  parts.push(eveningHTML(iso));
  if (!bad) parts.push(dumpRowHTML());
  return parts.join('');
}

/* The week: its goals, then "X of 7" for every habit — a count, never a
   streak, and an empty cell is an empty cell, not a failure. */
function weekHTML() {
  const k = weekKey(CUR), gs = weekGoals(k), ws = weekStats(CUR);
  const cell = v => `<i class="${v === 'full' ? 'f' : v === 'min' ? 'm' : v === 'skip' ? 's' : v === 'future' ? 'x' : ''}"></i>`;
  const n7 = cells => cells.filter(v => v === 'full' || v === 'min').length;
  const head = `<div class="ty-wk-days">${ws.days.map(d => `<span${d === CUR ? ' class="on"' : ''}>${WDAYS[new Date(d + 'T12:00:00').getDay()].slice(0, 1)}</span>`).join('')}</div>`;
  const rowOf = r => `<div class="ty-wrow${r.optional ? ' opt' : ''}"><span class="ty-wrow-l">${esc(r.label)}</span>
      <span class="ty-cells">${r.cells.map(cell).join('')}</span><span class="ty-wrow-n">${n7(r.cells)}<em>/7</em></span></div>`;
  const pom = Object.values(ws.pom).filter(a => a.n);
  return `
    ${secHead('weekly goals', `${gs.filter(g => g.done).length} of ${gs.length || 0} · up to ${GOALS.weekCap}`)}
    ${gs.map(g => `<div class="ty-goal${g.done ? ' done' : ''}">
      <button class="ty-ck${g.done ? ' on' : ''}" data-act="wgoal" data-id="${esc(g.id)}" data-tick aria-pressed="${g.done}" aria-label="done">${CHECK}</button>
      <span class="ty-goal-t">${esc(g.text)}${g.from ? '<small>carried</small>' : ''}</span>
      <button class="ty-x" data-act="wgoal-del" data-id="${esc(g.id)}" aria-label="remove">×</button></div>`).join('') || '<div class="ty-fine">no weekly goals yet — up to three, each one small</div>'}
    ${gs.length < GOALS.weekCap ? `<div class="ty-add">
      <input type="text" id="ty-wgoal-in" maxlength="140" placeholder="a goal for this week" autocomplete="off" enterkeyhint="done" aria-label="a goal for this week">
      <button class="ty-add-b" data-act="wgoal-add-in">add</button></div>` : ''}

    ${secHead('the chain', 'this week')}
    ${head}${ws.chain.map(rowOf).join('')}
    ${HYG.length ? secHead('hygiene', 'this week') + head + ws.hyg.map(rowOf).join('') : ''}

    ${secHead('the rest of it')}
    <div class="ty-tiles">
      <div class="ty-tile"><b>${ws.goals.done}<em>/${ws.goals.total}</em></b><span>goals done</span></div>
      ${ws.gym ? `<div class="ty-tile"><b>${ws.gym.n}<em> of ${esc(ws.gym.target)}</em></b><span>gym sessions</span></div>` : ''}
      <div class="ty-tile"><b>${pom.reduce((t, a) => t + a.n, 0)}</b><span>focus rounds</span></div>
      <div class="ty-tile"><b>${ws.bad}</b><span>bad day${ws.bad === 1 ? '' : 's'}</span></div>
    </div>
    ${pom.length ? `<div class="ty-pomsplit">${pom.map(a => `<span style="--ar:${esc(a.color)}"><i></i>${esc(a.label)} <b>${a.n}</b></span>`).join('')}</div>` : ''}`;
}

function hygHTML() {
  const iso = CUR;
  const left = showerLeft(), running = !!DB.shower.endsAt;
  const lvl = hygLevel(iso);
  const wk = weekOf(iso).filter(k => k <= CUR);
  return `<div class="ty-shower card${running ? ' live' : ''}">
      <div class="ty-shower-t" id="ty-shower-t">${clock(running ? left : SHOWER * 60000)}</div>
      <div class="ty-shower-s">${running ? 'shower' : `a ${SHOWER}-minute shower`}</div>
      ${SHOWER_NOTE ? `<div class="ty-fine">${esc(SHOWER_NOTE)}</div>` : ''}
      <div class="ty-next-acts">${running
        ? `<button class="ty-pill" data-act="shower-done">${CHECK}<span>done</span></button>
           <button class="ty-pill q" data-act="shower-stop"><span>stop</span></button>`
        : `<button class="ty-pill go" data-act="shower-start">${PLAY}<span>start the timer</span></button>`}</div>
    </div>
    ${secHead('the chain', lvl === 'full' ? 'all of it' : lvl === 'min' ? 'the minimum is done' : 'shower is the minimum')}
    ${HYG.map(h => {
      const on = hygDone(iso, h);
      const n = wk.filter(k => hygDone(k, h)).length;
      const since = h.every && !on ? hygSince(h.key, iso) : null;
      const sub = [h.min ? 'minimum' : '', h.optional ? 'optional' : '',
        h.every ? (since == null ? `about every ${h.every} days` : since === 0 ? '' : `last ${since} day${since === 1 ? '' : 's'} ago`) : ''].filter(Boolean).join(' · ');
      return `<div class="ty-goal${on ? ' done' : ''}">
        <button class="ty-ck${on ? ' on' : ''}" data-act="hyg" data-k="${esc(h.key)}" data-tick aria-pressed="${on}" aria-label="${esc(h.label)}">${CHECK}</button>
        <span class="ty-goal-t">${esc(h.label)}${sub ? `<small>${esc(sub)}</small>` : ''}</span>
        <span class="ty-count">${n}<em>/7</em></span>
      </div>`;
    }).join('')}`;
}

let eveIso = null;             // which day the evening screen is about; null = today
function eveHTML() {
  const iso = eveIso || CUR;
  const s = sleepOf(iso);
  const md = exportMd(iso);
  return `<div class="ty-daypick">
      <button class="ty-chip${iso === CUR ? ' on' : ''}" data-act="eve-day" data-d="0">today</button>
      <button class="ty-chip${iso !== CUR ? ' on' : ''}" data-act="eve-day" data-d="-1">yesterday</button>
    </div>
    ${PREP.length ? secHead('ready for tomorrow', `${PREP.filter(p => prepDone(iso, p)).length} of ${PREP.length}`) + PREP.map(p => prepRow(iso, p)).join('') : ''}
    ${secHead('lights out', ANCH.sleep ? 'target ' + esc(ANCH.sleep) : '')}
    <div class="ty-anchors one"><div class="ty-anc">
      <span class="ty-anc-l">sleep<em>${s ? 'one tap to change it' : 'when you go'}</em></span>
      ${s ? `<input class="ty-anc-in" type="text" inputmode="numeric" data-pad="clock" data-anchor="sleep" data-iso="${iso}" value="${esc(s)}" aria-label="sleep time" autocomplete="off">`
          : `<button class="ty-anc-b" data-act="sleep-now">lights out · ${hhmm()}</button>`}
    </div></div>
    ${secHead('the dump', has('LOG', 'setEntry') ? 'saved to LOG as you type' : '')}
    <textarea class="ty-dump" id="ty-dump-in" rows="7" spellcheck="true" data-iso="${iso}"
      placeholder="everything on your mind — voice-to-text is fine, it gets cleaned up later">${esc(dumpText(iso))}</textarea>
    ${secHead('export for qurOS', dayRec(iso).exported ? 'exported ' + esc(dayRec(iso).exported) : '')}
    <div class="ty-next-acts">
      <button class="ty-pill go" data-act="export-share"><span>share .md</span></button>
      <button class="ty-pill" data-act="export-copy"><span>copy</span></button>
    </div>
    <pre class="ty-md" id="ty-md">${esc(md)}</pre>`;
}

let mapPaste = false;
function dumpHTML() {
  if (!DB.map) {
    return `<div class="ty-fine big">The life-dump map is a markdown file: headings are sections, list items are
      the things to talk through, and a heading that says <b>Tier 1</b> puts what follows first. One section per
      walk dump, the lowest tier first.</div>
      <div class="ty-next-acts col">
        <button class="ty-pill go" data-act="map-folder"><span>load qurOS-life-dump-map.md</span></button>
        <button class="ty-pill" data-act="map-file"><span>pick a file</span></button>
        <button class="ty-pill" data-act="map-paste"><span>${mapPaste ? 'hide' : 'paste it'}</span></button>
      </div>
      <input type="file" id="ty-map-file" accept=".md,.markdown,.txt,text/markdown,text/plain" hidden>
      ${mapPaste ? `<textarea class="ty-dump" id="ty-map-text" rows="10" spellcheck="false" placeholder="# Tier 1&#10;## Health&#10;- sleep&#10;- …"></textarea>
        <div class="ty-next-acts"><button class="ty-pill go" data-act="map-read"><span>read it</span></button></div>` : ''}`;
  }
  const n = mapNext();
  const secs = mapSections();
  const total = secs.reduce((a, s) => a + s.items.length, 0);
  const touched = secs.reduce((a, s) => a + s.items.filter(x => itemState(x.key) !== 'empty').length, 0);
  return `${n ? `<div class="ty-next card">
      <div class="ty-next-h"><span class="ty-tag">next untouched</span><span class="ty-next-pos">${esc(n.section.title)}${n.section.tier < 99 ? ' · tier ' + n.section.tier : ''}</span></div>
      <div class="ty-next-t">${esc(n.item.text)}</div>
      <div class="ty-next-s">one section per dump — this one has ${n.section.items.filter(x => itemState(x.key) !== 'done').length} left</div>
      <div class="ty-next-acts"><button class="ty-pill go" data-act="map-prompt" data-s="${esc(n.section.key)}"><span>copy the walk prompt</span></button></div>
    </div>` : `<div class="ty-next card calm"><div class="ty-next-t">every item touched</div></div>`}
    ${secHead(DB.map.title || 'the map', `${touched} of ${total} touched`)}
    ${secs.map(s => {
      const d = s.items.filter(x => itemState(x.key) === 'done').length;
      return `<div class="ty-msec">
        <div class="ty-msec-h"><b>${esc(s.title)}</b><em>${s.tier < 99 ? 'tier ' + s.tier + ' · ' : ''}${d}/${s.items.length}</em>
          <button class="ty-mini" data-act="map-prompt" data-s="${esc(s.key)}">prompt</button></div>
        ${s.items.map(x => { const st = itemState(x.key);
          return `<button class="ty-mitem ${st}" data-act="map-item" data-k="${esc(x.key)}"><i></i><span>${esc(x.text)}</span><em>${st === 'empty' ? '' : st}</em></button>`; }).join('')}
      </div>`;
    }).join('')}
    <div class="ty-next-acts">
      <button class="ty-pill" data-act="map-folder"><span>reload from the app folder</span></button>
      <button class="ty-pill" data-act="map-file"><span>replace from a file</span></button>
      <button class="ty-pill q" data-act="map-clear"><span>remove the map</span></button>
    </div>
    <input type="file" id="ty-map-file" accept=".md,.markdown,.txt,text/markdown,text/plain" hidden>`;
}

/* ── Screens ──────────────────────────────────────────────────────────── */
let screen = 'home';
function go(s) {
  screen = ['home', 'week', 'hyg', 'eve', 'dump'].includes(s) ? s : 'home';
  if (screen !== 'eve') eveIso = null;
  view.querySelectorAll('.scr').forEach(x => x.classList.toggle('on', x.id === 's-' + screen));
  const b = bodyEl(); if (b) b.scrollTop = 0;
  render();
}
/* The band is the date and how far through the chain the day is — said once,
   on the label line. A big number beside a six-letter wordmark does not fit a
   phone, and it would be the same number twice. */
function paintBand() {
  const lab = $id('ty-date');
  const n = chainCount(CUR);
  if (lab) lab.textContent = window.Prefs && Prefs.formatDate ? Prefs.formatDate(CUR) : CUR;
  const cnt = $id('ty-count');
  if (cnt) cnt.textContent = CHAIN.length ? `${n} of ${CHAIN.length}` : '';
  const b = $id('ty-bad');
  if (b) { const on = isBad(CUR); b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); }
  view.classList.toggle('ty-is-bad', isBad(CUR));
}
/* Writing a screen while a field on it holds the caret would take the caret
   away mid-word; the goal field keeps what was typed across a redraw. */
function render() {
  if (!view) return;
  paintBand();
  const keep = document.activeElement && document.activeElement.id;
  const typed = ['ty-goal-in', 'ty-wgoal-in'].map(id => { const el = $id(id); return el ? [id, el.value] : null; }).filter(Boolean);
  if (screen === 'home') { const b = $id('ty-home'); if (b) b.innerHTML = homeHTML(); }
  if (screen === 'week') { const b = $id('ty-week'); if (b) b.innerHTML = weekHTML(); }
  if (screen === 'hyg')  { const b = $id('ty-hyg');  if (b) b.innerHTML = hygHTML(); }
  if (screen === 'eve')  {
    const b = $id('ty-eve');
    /* the dump is being written: repaint everything but the field */
    const ta = $id('ty-dump-in');
    if (b && ta && document.activeElement === ta) { const md = $id('ty-md'); if (md) md.textContent = exportMd(eveIso || CUR); }
    else if (b) b.innerHTML = eveHTML();
  }
  if (screen === 'dump') { const b = $id('ty-dump'); if (b) b.innerHTML = dumpHTML(); }
  typed.forEach(([id, v]) => { const el = $id(id); if (el && !el.value) el.value = v; });
  if (keep && /^ty-(w?goal-in)$/.test(keep)) { const el = $id(keep); if (el) el.focus(); }
  syncTick();
}

/* ── Events ─────────────────────────────────────────────────────────────── */
function rollDay() {
  const d = flexDay();
  if (d === CUR) return false;
  CUR = d; eveIso = null;
  render();
  return true;
}
async function shareMd(iso) {
  const md = exportMd(iso), name = `qurOS_${iso}.md`;
  dayW(iso).exported = hhmm(); save();
  try {
    const file = new File([md], name, { type: 'text/markdown' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); render(); return; }
    if (navigator.share) { await navigator.share({ title: name, text: md }); render(); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
  a.download = name; a.click();
  render();
}
function openToolsFocus() {
  if (!has('TOOLS', 'show')) return;
  Shell.TABS.includes('tools') ? Shell.go('tools') : Shell.open('tools');
  TOOLS.show('pom');
}
function readFileInto(input) {
  const f = input.files && input.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { loadMapText(String(r.result || ''), 'loaded'); input.value = ''; };
  r.readAsText(f);
}

document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('.ns-today [data-act]');
  if (!t || t.disabled) return;
  const act = t.dataset.act;

  if (act === 'home')     { go('home'); return; }
  if (act === 'go')       { go(t.dataset.s); return; }
  if (act === 'go-week')  { go('week'); return; }
  if (act === 'go-eve')   { go('eve'); return; }
  if (act === 'go-tools') { openToolsFocus(); return; }
  if (act === 'fold')     { chainOpen = !chainShown(); render(); return; }
  if (act === 'bad')      { toggleBad(); render(); return; }

  if (act === 'step')     { setStep(t.dataset.k, t.dataset.v); render(); return; }
  if (act === 'up')       { setWake(hhmm()); render(); return; }
  if (act === 'sleep-now'){ setSleep(hhmm(), screen === 'eve' && eveIso ? eveIso : CUR); render(); return; }
  if (act === 'open-gym') { if (has('GYM', 'open')) GYM.open(); return; }

  if (act === 'goal')     { toggleGoal(t.dataset.id); render(); return; }
  if (act === 'goal-del') { removeGoal(t.dataset.id); return; }
  if (act === 'goal-add') { const el = $id('ty-goal-in'); if (el && addGoal(el.value)) { el.value = ''; render(); } return; }
  if (act === 'carry' || act === 'drop') { settleGoal(t.dataset.from, t.dataset.id, act === 'carry' ? 'carried' : 'dropped'); render(); return; }
  if (act === 'carry-all' || act === 'drop-all') {
    const c = carryFrom(); if (!c) return;
    c.goals.forEach(g => settleGoal(c.iso, g.id, act === 'carry-all' ? 'carried' : 'dropped'));
    render(); return;
  }
  if (act === 'wgoal')    { toggleWeekGoal(t.dataset.id); render(); return; }
  if (act === 'wgoal-del'){ removeWeekGoal(t.dataset.id); return; }
  if (act === 'wgoal-add'){ Shell.prompt('A goal for this week — small enough to see from here', '', v => { if (addWeekGoal(v)) render(); }); return; }
  if (act === 'wgoal-add-in') { const el = $id('ty-wgoal-in'); if (el && addWeekGoal(el.value)) { el.value = ''; render(); } return; }
  if (act === 'wcarry' || act === 'wdrop') { settleWeekGoal(t.dataset.from, t.dataset.id, act === 'wcarry' ? 'carried' : 'dropped'); render(); return; }

  if (act === 'hyg')      { hygTick(t.dataset.k); render(); return; }
  if (act === 'prep')     { prepTick(t.dataset.k, screen === 'eve' && eveIso ? eveIso : CUR); render(); return; }
  if (act === 'shower-start') { showerStart(); return; }
  if (act === 'shower-done')  { showerStop(true); toast('shower done'); return; }
  if (act === 'shower-stop')  { showerStop(false); return; }

  if (act === 'pom-area') { if (has('TOOLS', 'setArea')) TOOLS.setArea(t.dataset.a); render(); return; }
  if (act === 'pom-start'){ if (has('TOOLS', 'startFocus')) { TOOLS.startFocus(t.dataset.a || null); toast('focus · started'); } render(); return; }
  if (act === 'pom-toggle'){ if (has('TOOLS', 'togglePom')) TOOLS.togglePom(); render(); return; }

  if (act === 'eve-day')  { eveIso = t.dataset.d === '-1' ? dayOffset(CUR, -1) : null; render(); return; }
  if (act === 'export-share') { flushDump(); shareMd(eveIso || CUR); return; }
  if (act === 'export-copy')  { flushDump(); const iso = eveIso || CUR; dayW(iso).exported = hhmm(); save();
                                copyText(exportMd(iso), 'the day'); render(); return; }

  if (act === 'map-folder') {
    fetch('qurOS-life-dump-map.md', { cache: 'no-store' })
      .then(r => { if (!r.ok) throw new Error(String(r.status)); return r.text(); })
      .then(text => loadMapText(text, 'loaded'))
      .catch(() => toast('qurOS-life-dump-map.md is not in the app folder yet'));
    return;
  }
  if (act === 'map-file')  { const f = $id('ty-map-file'); if (f) f.click(); return; }
  if (act === 'map-paste') { mapPaste = !mapPaste; render(); return; }
  if (act === 'map-read')  { const el = $id('ty-map-text'); if (el && loadMapText(el.value, 'read')) mapPaste = false; return; }
  if (act === 'map-item')  {
    const k = t.dataset.k, cur = itemState(k);
    const nx = cur === 'empty' ? 'partial' : cur === 'partial' ? 'done' : 'empty';
    if (nx === 'empty') delete DB.mapState[k]; else DB.mapState[k] = nx;
    save(); render(); return;
  }
  if (act === 'map-prompt') { const s = mapSections().find(x => x.key === t.dataset.s); if (s) copyText(dumpPromptFor(s), s.title); return; }
  if (act === 'map-clear') {
    Shell.confirm('Remove the life-dump map?\nWhat you marked stays, filed under each item, and comes back with the map.', () => {
      const was = DB.map; DB.map = null; save(); render();
      Shell.undo('map removed', () => { DB.map = was; save(); render(); });
    });
    return;
  }
  if (act === 'reset-day') { resetDay(); return; }
  if (act === 'exp')       { toggleExport(t.dataset.k); return; }
});

document.addEventListener('keydown', ev => {
  if (ev.key !== 'Enter') return;
  const el = ev.target;
  if (!el || !el.closest || !el.closest('.ns-today')) return;
  if (el.id === 'ty-goal-in')  { ev.preventDefault(); if (addGoal(el.value)) { el.value = ''; render(); } }
  if (el.id === 'ty-wgoal-in') { ev.preventDefault(); if (addWeekGoal(el.value)) { el.value = ''; render(); } }
});
document.addEventListener('input', ev => {
  const el = ev.target;
  if (!el || el.id !== 'ty-dump-in' || !el.closest('.ns-today')) return;
  saveDump(el.value, el.dataset.iso || CUR);
  const md = $id('ty-md');
  if (md) { clearTimeout(md._t); md._t = setTimeout(() => { flushDump(); md.textContent = exportMd(el.dataset.iso || CUR); }, 700); }
});
document.addEventListener('change', ev => {
  const el = ev.target;
  if (!el || !el.closest || !el.closest('.ns-today')) return;
  if (el.dataset.anchor) {
    const v = el.value.trim(), iso = el.dataset.iso || CUR;
    if (v && !normHM(v)) { toast('a time, like 06:30'); render(); return; }
    if (el.dataset.anchor === 'wake') setWake(v, iso); else setSleep(v, iso);
    render(); return;
  }
  if (el.id === 'ty-map-file') readFileInto(el);
  if (el.id === 'ty-dump-in') flushDump();
});

function resetDay() {
  Shell.confirm('Clear today on TODAY?\nGoals, ticks, the hygiene chain, the prep and the two clock stamps go. LOG, GYM and TOOLS keep their own records.', () => {
    const was = DB.days[CUR] ? JSON.parse(JSON.stringify(DB.days[CUR])) : null;
    delete DB.days[CUR]; save(); render(); renderSettings();
    Shell.undo('today cleared', () => { if (was) DB.days[CUR] = normDay(was); save(); render(); renderSettings(); });
  });
}

/* ── Settings ───────────────────────────────────────────────────────────── */
function renderSettings() {
  const st = document.querySelector('.ns-today #ty-status');
  if (st) {
    const g = goalsOf(CUR);
    st.className = 'settings-status ' + (isBad(CUR) ? 'idle' : 'ok');
    st.textContent = `${dayWord(CUR)} · ${chainCount(CUR)} of ${CHAIN.length} in the chain · ` +
      `${g.filter(x => x.done).length} of ${g.length} goals${isBad(CUR) ? ' · bad day' : ''} · ` +
      `${Object.keys(DB.days).length} day${Object.keys(DB.days).length === 1 ? '' : 's'} on record`;
  }
  const ms = document.querySelector('.ns-today #ty-map-status');
  if (ms) {
    const secs = mapSections();
    ms.textContent = DB.map ? `${DB.map.title || 'map'} · ${secs.length} sections · ${secs.reduce((a, s) => a + s.items.length, 0)} items`
                            : 'no map loaded';
  }
  /* The panel's fields, painted from what the module actually uses — the
     normalised values, not the raw override — and never under a caret. */
  const val = { 'today.anchors': ANCH, 'today.goals': GOALS, 'today.badDay': BAD };
  document.querySelectorAll('.set-panel.ns-today [data-cfg]').forEach(el => {
    if (document.activeElement === el) return;
    const p = el.dataset.cfg, sub = el.dataset.sub;
    const v = sub ? (val[p] || {})[sub] : p === 'today.showerMins' ? SHOWER : p === 'today.showerNote' ? SHOWER_NOTE
            : p === 'today.dumpPrompt' ? DUMP_PROMPT : Config.get(p);
    el.value = v == null ? '' : String(v);
  });
  document.querySelectorAll('.set-panel.ns-today [data-cfg-toggle]').forEach(b => {
    const parts = b.dataset.cfgToggle.split('.'), key = parts.pop(), branch = parts.join('.');
    const on = !!Object.assign({}, Config.defaults(branch), Config.get(branch) || {})[key];
    b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on));
  });
  const ex = document.querySelector('.set-panel.ns-today #ty-export');
  if (ex) {
    const WORDS = { anchors: 'wake, sleep, bad day', goals: 'goals', weekly: "the week's goals", chain: 'the morning chain',
                    hygiene: 'hygiene', pom: 'pomodoros by area', gym: 'the gym session', meals: 'meals',
                    prep: 'evening prep', dump: 'the dump' };
    ex.innerHTML = Object.keys(WORDS).map(k => `<button class="set-check${EXP[k] !== false ? ' on' : ''}" data-act="exp" data-k="${k}"
      role="switch" aria-checked="${EXP[k] !== false}">${esc(WORDS[k])}</button>`).join('');
  }
}
/* One section of the export on or off. The branch is a fixed set of booleans,
   read through its defaults, so writing it whole cannot lose a section. */
function toggleExport(k) {
  const cur = Object.assign({}, Config.defaults('today.export'), Config.get('today.export') || {});
  cur[k] = cur[k] === false;
  Config.set('today.export', cur);
}

/* ── Wiring ─────────────────────────────────────────────────────────────── */
Config.subscribe(path => {
  if (path !== '*' && !/^(today|tools\.areas|gym)/.test(String(path))) return;
  readConfig(); render(); renderSettings();
});
Prefs.subscribe(k => {
  if (k === '*' || /^today/.test(k) || k === 'weekStart' || k === 'dateFormat') { if (k === 'todayChain') chainOpen = null; render(); }
});

Shell.register('today', {
  onShow: () => { rollDay(); render(); },
  onDayChange: () => { rollDay(); },
  /* `dayEnds` can put the day's end at 04:00, which the shell's midnight check
     never sees: the minute tick is what notices it. */
  onMinute: () => {
    if (rollDay() || !onScreen() || screen !== 'home') return;
    /* never under a caret: a redraw replaces the field being typed in */
    const a = document.activeElement;
    if (a && a.closest && a.closest('.ns-today') && /^(INPUT|TEXTAREA)$/.test(a.tagName)) return;
    render();
  },
  home: () => { if (screen !== 'home') go('home'); else { chainOpen = null; render(); } },
  search: q => {
    const out = [];
    const open = s => () => { Shell.TABS.includes('today') ? Shell.go('today') : Shell.open('today'); go(s); };
    goalsOf(CUR).filter(g => g.text.toLowerCase().includes(q)).forEach(g =>
      out.push({ title: g.text, sub: "today · today's goal", go: open('home') }));
    weekGoals(weekKey(CUR)).filter(g => g.text.toLowerCase().includes(q)).forEach(g =>
      out.push({ title: g.text, sub: 'today · this week', go: open('week') }));
    [['week', 'this week'], ['hyg', 'hygiene chain'], ['eve', 'evening dump'], ['dump', 'life dump']]
      .filter(([, w]) => w.includes(q)).forEach(([s, w]) => out.push({ title: w, sub: 'today', go: open(s) }));
    mapSections().forEach(s => s.items.filter(x => x.text.toLowerCase().includes(q)).forEach(x =>
      out.push({ title: x.text, sub: 'today · life dump · ' + s.title, go: open('dump') })));
    return out;
  },
});

render();
/* GYM, TOOLS and DO all exist by now (index.html loads TODAY last), but their
   first renders may still be settling: one more pass once the stack is clear. */
setTimeout(render, 0);

return {
  render, renderSettings, go, resetDay,
  reload: () => { load(); readConfig(); CUR = flexDay(); render(); renderSettings(); },
  state: () => JSON.parse(JSON.stringify(DB)),
  /* the day TODAY is on, which is the calendar day held open until `dayEnds`;
     `flexDayAt` is the same rule asked about any moment */
  flexDay: () => CUR, flexDayAt: d => flexDay(d),
  /* for LOG: the note's #### today section and the morning form's defaults */
  dayStats, wakeOf: iso => dayRec(iso).wake, sleepOf, sleepHoursBefore,
  /* for GYM: a walk counts as movement on a day with no session */
  walkedOn: iso => { const s = CHAIN.find(x => x.key === 'walk' || /walk/i.test(x.label));
                     return !!(s && isDone(stepState(s, iso))); },
  exportMd, parseMap, loadMapText, mapNext,
  /* the API the harness drives — the same calls the buttons make */
  addGoal, toggleGoal, settleGoal, carryFrom, addWeekGoal, toggleWeekGoal, weekCarryFrom, settleWeekGoal,
  setStep, stepState: (k, iso) => { const s = CHAIN.find(x => x.key === k); return s ? stepState(s, iso || CUR) : null; },
  nextItem, toggleBad, hygTick, hygLevel: iso => hygLevel(iso || CUR), prepTick, setWake, setSleep,
  weekStats, showerStart, showerStop, chainCount,
};
})();
