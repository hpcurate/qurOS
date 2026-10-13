/* GYM — the A/B program (qurOS spec §5).
   Days rotate in the order Config holds them, and the app suggests whichever
   comes after the last full session. A session is a list of exercise cards; a
   set is a weight and a count, prefilled with last time's numbers for that
   exercise so logging it is one tap. Every set logged starts the rest timer.
   If every set of an exercise hit the top of its range last time, the card
   says to add weight — the only nudge in here, and it is a suggestion.

   The week is a count against a range ("2 of 3–4"), never a streak. A
   minimum session (bike + one exercise) is a gym day like any other, and on a
   day with no session a Kamo walk ticked on TODAY still counts as movement.

   `gym_v1` holds the sessions, the live one and the rest timer; the program
   is Config (`gym.*`). Every running clock is a wall-clock end, so a locked
   phone in a gym bag comes back to the right number. */
window.GYM = (function () {
'use strict';

const SCOPE = '.ns-gym ';
const $id   = id => document.querySelector(SCOPE + '#' + id);
const view  = document.getElementById('view-gym');
const bodyEl = () => document.querySelector('#view-gym .view-body');
const toast = msg => Shell.toast(msg);
const esc   = s => String(s == null ? '' : s).replace(/[&<>"']/g, c =>
  ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

const KEY = 'gym_v1';
const KEEP = 400;
const pad = n => String(n).padStart(2, '0');
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const KEY_RE = /^[a-z0-9_-]{1,24}$/i;
const hhmm = (d = new Date()) => pad(d.getHours()) + ':' + pad(d.getMinutes());
const today = () => Shell.today();
function dayOffset(iso, n) {
  const p = String(iso).split('-').map(Number);
  const d = new Date(p[0], (p[1] || 1) - 1, (p[2] || 1) + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const WDAYS  = ['sun','mon','tue','wed','thu','fri','sat'];
function dayWord(iso) {
  const t = today();
  if (iso === t) return 'today';
  if (iso === dayOffset(t, -1)) return 'yesterday';
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d) ? iso : `${WDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function weekOf(iso) {
  const d = new Date(iso + 'T12:00:00');
  const start = (window.Prefs && Prefs.get('weekStart') === 'sun') ? 0 : 1;
  const k = dayOffset(iso, -((d.getDay() - start + 7) % 7));
  return [0, 1, 2, 3, 4, 5, 6].map(i => dayOffset(k, i));
}
/* A number as it is said: 22.5, 20, never 20.0. */
const num = v => { const n = +v; return isFinite(n) ? String(Math.round(n * 100) / 100) : ''; };
const parseNum = v => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null; };

/* ── The program ───────────────────────────────────────────────────────── */
let DAYS, WARMUP, MINIMUM, REST, REST_CHOICES, INC, UNIT, TARGET, WALK, DO_LINK;
function normEx(e, i) {
  const lo = Math.max(1, Math.min(600, Math.round(+e.lo) || 8));
  return { key: KEY_RE.test(String(e.key || '')) ? String(e.key) : 'ex' + i,
           name: String(e.name || 'exercise').slice(0, 60),
           sets: Math.max(1, Math.min(10, Math.round(+e.sets) || 3)),
           lo, hi: Math.max(lo, Math.min(600, Math.round(+e.hi) || lo)),
           unit: e.unit === 's' ? 's' : 'reps', bw: !!e.bw };
}
function readConfig() {
  const seen = new Set();
  DAYS = (Array.isArray(Config.get('gym.days')) ? Config.get('gym.days') : [])
    .filter(d => d && typeof d === 'object' && KEY_RE.test(String(d.key || '')))
    .filter(d => !seen.has(d.key) && seen.add(d.key))
    .map(d => {
      const ek = new Set();
      return { key: d.key, label: String(d.label || 'day ' + d.key).slice(0, 30),
               exercises: (Array.isArray(d.exercises) ? d.exercises : []).filter(e => e && typeof e === 'object')
                 .map(normEx).filter(e => !ek.has(e.key) && ek.add(e.key)).slice(0, 16) };
    }).slice(0, 7);
  WARMUP  = String(Config.get('gym.warmup') || '').slice(0, 80);
  MINIMUM = String(Config.get('gym.minimum') || 'minimum').slice(0, 80);
  REST    = Math.max(15, Math.min(600, Math.round(+Config.get('gym.rest')) || 90));
  REST_CHOICES = (Array.isArray(Config.get('gym.restChoices')) ? Config.get('gym.restChoices') : [60, 90, 120, 180])
    .map(n => Math.round(+n)).filter(n => n >= 15 && n <= 600).slice(0, 6);
  INC     = Math.max(0.25, Math.min(50, +Config.get('gym.increment') || 2.5));
  UNIT    = String(Config.get('gym.unit') || 'kg').slice(0, 6);
  const T = Object.assign({}, Config.defaults('gym.target'), Config.get('gym.target') || {});
  TARGET  = { lo: Math.max(1, Math.min(7, Math.round(+T.lo) || 3)), hi: 0 };
  TARGET.hi = Math.max(TARGET.lo, Math.min(7, Math.round(+T.hi) || TARGET.lo));
  WALK    = Config.get('gym.walkCounts') !== false;
  DO_LINK = /^[^|]+\|.+$/.test(String(Config.get('gym.doLink') || '')) ? String(Config.get('gym.doLink')) : '';
}
readConfig();
const targetText = () => TARGET.lo === TARGET.hi ? String(TARGET.lo) : `${TARGET.lo}–${TARGET.hi}`;
/* Every exercise the program has, across its days, by key — the minimum
   session picks from these, and history reads names back through it. */
function allExercises() {
  const out = [], seen = new Set();
  DAYS.forEach(d => d.exercises.forEach(e => { if (!seen.has(e.key)) { seen.add(e.key); out.push(e); } }));
  return out;
}

/* ── State ─────────────────────────────────────────────────────────────── */
const blank = () => ({ v: 1, sessions: [], live: null, rest: { endsAt: 0, total: 0 }, restSecs: null });
let DB = blank();
function normSet(s) {
  if (!s || typeof s !== 'object') return null;
  const w = parseNum(s.w), r = parseNum(s.r);
  if (r == null && w == null) return null;
  return { w, r, at: /^\d{2}:\d{2}$/.test(String(s.at || '')) ? s.at : '' };
}
function normSession(s) {
  if (!s || typeof s !== 'object' || !ISO.test(s.date)) return null;
  const ex = (Array.isArray(s.ex) ? s.ex : []).filter(e => e && KEY_RE.test(String(e.key || ''))).slice(0, 20).map(e => ({
    key: String(e.key), name: String(e.name || e.key).slice(0, 60),
    target: normEx(Object.assign({ key: e.key, name: e.name }, e.target || {}), 0),
    sets: (Array.isArray(e.sets) ? e.sets : []).map(normSet).filter(Boolean).slice(0, 12),
    extra: Math.max(0, Math.min(6, Math.round(+e.extra) || 0)),
  }));
  return { id: String(s.id || 's' + Math.random().toString(36).slice(2, 8)).slice(0, 24), date: s.date,
           day: String(s.day || '').slice(0, 24), label: String(s.label || '').slice(0, 40),
           minimum: !!s.minimum, warm: !!s.warm,
           startedAt: Math.max(0, +s.startedAt || 0), endedAt: Math.max(0, +s.endedAt || 0), ex };
}
function normalise(s) {
  const d = blank();
  if (!s || typeof s !== 'object') return d;
  d.sessions = (Array.isArray(s.sessions) ? s.sessions : []).map(normSession).filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startedAt - b.startedAt).slice(-KEEP);
  d.live = normSession(s.live);
  const r = s.rest || {};
  d.rest = { endsAt: Math.max(0, +r.endsAt || 0), total: Math.max(0, +r.total || 0) };
  d.restSecs = s.restSecs == null ? null : (Math.max(15, Math.min(600, Math.round(+s.restSecs) || 0)) || null);
  return d;
}
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch {}
  DB = normalise(s);
}
function save() {
  if (DB.sessions.length > KEEP) DB.sessions = DB.sessions.slice(-KEEP);
  try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch {}
}
load();

/* ── Reading back ──────────────────────────────────────────────────────── */
const finished = () => DB.sessions.filter(s => s.endedAt);
/* The last finished session that logged this exercise, before `beforeId`. */
function lastFor(key, beforeId) {
  const list = finished();
  for (let i = list.length - 1; i >= 0; i--) {
    if (beforeId && list[i].id === beforeId) continue;
    const e = list[i].ex.find(x => x.key === key && x.sets.length);
    if (e) return { session: list[i], ex: e };
  }
  return null;
}
/* Every set at the top of the range, and at least as many sets as asked for. */
function shouldProgress(key, target, beforeId) {
  const l = lastFor(key, beforeId);
  if (!l) return false;
  const sets = l.ex.sets.filter(s => s.r != null);
  return sets.length >= target.sets && sets.every(s => s.r >= target.hi);
}
/* The day after the last full session, in program order. A minimum session
   does not move the rotation: it was not that day's work. */
function nextDay() {
  if (!DAYS.length) return null;
  const last = finished().filter(s => !s.minimum && DAYS.some(d => d.key === s.day)).pop();
  if (!last) return DAYS[0];
  const i = DAYS.findIndex(d => d.key === last.day);
  return DAYS[(i + 1) % DAYS.length];
}
const sessionsOn = iso => finished().filter(s => s.date === iso);
const minutesOf = s => s.endedAt && s.startedAt ? Math.max(1, Math.round((s.endedAt - s.startedAt) / 60000)) : 0;
const volumeOf = s => s.ex.reduce((t, e) => t + (e.target.bw ? 0 : e.sets.reduce((a, x) => a + (x.w || 0) * (x.r || 0), 0)), 0);
const setText = (x, e) => x.w != null && !(e && e.target.bw && !x.w) ? `${num(x.w)}×${num(x.r)}${e && e.target.unit === 's' ? 's' : ''}`
                                                                    : `${num(x.r)}${e && e.target.unit === 's' ? 's' : ''}`;
function summaryOf(s) {
  const t0 = s.startedAt ? hhmm(new Date(s.startedAt)) : '', t1 = s.endedAt ? hhmm(new Date(s.endedAt)) : '';
  return [s.minimum ? 'minimum session' : (s.label || 'day ' + s.day), t0 && t1 ? `${t0}–${t1}` : '',
          minutesOf(s) ? minutesOf(s) + ' min' : ''].filter(Boolean).join(' · ');
}
/* One day, for TODAY and LOG: the last session finished on it. */
function dayOf(iso) {
  const list = sessionsOn(iso);
  if (!list.length) return null;
  const s = list[list.length - 1];
  return { minimum: s.minimum, day: s.day, label: s.minimum ? 'min' : s.day,
           at: s.startedAt ? hhmm(new Date(s.startedAt)) : '', mins: minutesOf(s),
           volume: Math.round(volumeOf(s)), exercises: s.ex.filter(e => e.sets.length).length,
           summary: summaryOf(s),
           lines: s.ex.filter(e => e.sets.length).map(e => `${e.name}: ${e.sets.map(x => setText(x, e)).join(', ')}`) };
}
function walked(iso) {
  if (!WALK || !window.TODAY || typeof TODAY.walkedOn !== 'function') return false;
  try { return !!TODAY.walkedOn(iso); } catch { return false; }
}
function weekCount(days) {
  const list = Array.isArray(days) && days.length ? days : weekOf(today());
  const n = list.filter(k => sessionsOn(k).length).length;
  return { n, lo: TARGET.lo, hi: TARGET.hi, target: targetText(),
           moved: list.filter(k => k <= today() && (sessionsOn(k).length || walked(k))).length };
}

/* ── The live session ─────────────────────────────────────────────────── */
function exFromTarget(t) {
  return { key: t.key, name: t.name, target: Object.assign({}, t), sets: [], extra: 0 };
}
function start(dayKey, minimum) {
  if (DB.live) { toast('a session is already running'); go('sess'); return; }
  const d = DAYS.find(x => x.key === dayKey);
  if (!minimum && !d) { toast('that day is not in the program'); return; }
  DB.live = { id: 's' + Date.now().toString(36), date: today(), day: minimum ? 'min' : d.key,
              label: minimum ? 'minimum' : d.label, minimum: !!minimum, warm: false,
              startedAt: Date.now(), endedAt: 0, ex: minimum ? [] : d.exercises.map(exFromTarget) };
  save(); go('sess');
}
function liveEx(key) { return DB.live ? DB.live.ex.find(e => e.key === key) : null; }
/* What a set row offers before it is logged: this session's previous set of
   the same exercise if there is one (weight carried down the card), else the
   same set number last time, else the last set last time. */
function prefill(e, i) {
  if (e.sets[i]) return e.sets[i];
  if (i > 0 && e.sets[i - 1]) return e.sets[i - 1];
  const l = lastFor(e.key, DB.live && DB.live.id);
  if (l) return l.ex.sets[i] || l.ex.sets[l.ex.sets.length - 1];
  return { w: null, r: e.target.hi };
}
function logSet(key, i, w, r) {
  const e = liveEx(key); if (!e) return;
  const set = { w, r, at: hhmm() };
  if (set.r == null) { toast(e.target.unit === 's' ? 'how many seconds?' : 'how many reps?'); return; }
  if (i < e.sets.length) e.sets[i] = set;
  else e.sets.push(set);
  save();
  if (pref('gymAutoRest', true)) restStart();
  render();
}
function unlogSet(key, i) {
  const e = liveEx(key); if (!e || !e.sets[i]) return;
  e.sets.splice(i, 1);
  save(); render();
}
function addRow(key) { const e = liveEx(key); if (!e) return; e.extra = Math.min(6, e.extra + 1); save(); render(); }
function addExercise(key) {
  if (!DB.live) return;
  if (DB.live.ex.some(e => e.key === key)) { toast('already in this session'); return; }
  const t = allExercises().find(e => e.key === key); if (!t) return;
  DB.live.ex.push(exFromTarget(t)); save(); render();
}
function finish() {
  const s = DB.live; if (!s) return;
  const logged = s.ex.filter(e => e.sets.length).length;
  if (!s.minimum && !logged && !s.warm) {
    Shell.ask({ title: 'Nothing logged yet', body: 'Finish it as a minimum session, or keep going?',
      yes: 'log as minimum', no: 'keep going', done: a => { if (a) { s.minimum = true; s.label = 'minimum'; s.day = 'min'; doFinish(); } } });
    return;
  }
  doFinish();
}
function doFinish() {
  const s = DB.live; if (!s) return;
  s.endedAt = Date.now();
  s.ex = s.ex.filter(e => e.sets.length || !s.minimum);
  DB.sessions.push(s);
  DB.live = null;
  DB.rest = { endsAt: 0, total: 0 };
  save();
  /* Written down where the rest of the day is: a gym tick on DO's card (its
     Todoist routine close still fires) and a mark on DAY. LOG's morning form
     reads this session back as its workout rather than being written to. */
  if (DO_LINK && window.DO && DO.setTick && DO.dayIso && DO.dayIso() === s.date) {
    const i = DO_LINK.indexOf('|');
    try { DO.setTick(DO_LINK.slice(0, i), DO_LINK.slice(i + 1), true); } catch {}
  }
  try { if (window.CAL && CAL.markDone) CAL.markDone('gym', true); } catch {}
  toast(s.minimum ? 'minimum session logged — that counts' : `${s.label} done · ${minutesOf(s)} min`);
  go('home');
  try { if (window.TODAY && TODAY.render) TODAY.render(); } catch {}
}
function abandon() {
  if (!DB.live) return;
  Shell.confirm('Throw this session away?\nNothing from it is kept.', () => {
    const was = DB.live; DB.live = null; DB.rest = { endsAt: 0, total: 0 }; save(); go('home');
    Shell.undo('session thrown away', () => { DB.live = was; save(); go('sess'); });
  });
}
function removeSession(id) {
  const i = DB.sessions.findIndex(s => s.id === id); if (i < 0) return;
  Shell.confirm('Delete this session?', () => {
    const was = DB.sessions[i];
    DB.sessions.splice(i, 1); save(); go('home');
    Shell.undo('session deleted', () => { DB.sessions.splice(i, 0, was); save(); render(); });
  });
}

/* ── Rest ──────────────────────────────────────────────────────────────── */
const restSecs = () => DB.restSecs || REST;
const restLeft = () => DB.rest.endsAt ? Math.max(0, DB.rest.endsAt - Date.now()) : 0;
function restStart(secs) {
  const s = secs || restSecs();
  DB.rest = { endsAt: Date.now() + s * 1000, total: s * 1000 };
  save(); syncTick(); paintRest();
}
function restAdd(secs) {
  if (!DB.rest.endsAt) { restStart(secs); return; }
  DB.rest.endsAt += secs * 1000; DB.rest.total += secs * 1000;
  save(); paintRest();
}
function restSkip() { DB.rest = { endsAt: 0, total: 0 }; save(); paintRest(); syncTick(); }

let timer = null;
const needsTick = () => !!DB.rest.endsAt || !!DB.live;
function syncTick() {
  if (needsTick() && !timer) timer = setInterval(tick, 1000);
  else if (!needsTick() && timer) { clearInterval(timer); timer = null; }
}
const clock = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + pad(s % 60); };
function tick() {
  if (DB.rest.endsAt && restLeft() <= 0) {
    DB.rest = { endsAt: 0, total: 0 }; save();
    toast('rest over — next set');
    if (window.Prefs && Prefs.tap) Prefs.tap(60);
  }
  paintRest();
  const el = $id('gy-elapsed');
  if (el && DB.live) el.textContent = clock(Date.now() - DB.live.startedAt);
  syncTick();
}
function paintRest() {
  const box = $id('gy-rest'); if (!box) return;
  const on = !!DB.rest.endsAt && !!DB.live;
  box.hidden = !on;
  if (!on) { box.innerHTML = ''; return; }
  const left = restLeft(), frac = DB.rest.total ? left / DB.rest.total : 0;
  if (!box.firstChild) box.innerHTML = `<span class="gy-rest-l">rest</span><b id="gy-rest-t"></b>
    <button class="gy-mini" data-act="rest-add" data-s="30">+30</button>
    <button class="gy-mini" data-act="rest-skip">skip</button><i class="gy-rest-bar"><i></i></i>`;
  const t = $id('gy-rest-t'); if (t) t.textContent = clock(left);
  box.style.setProperty('--frac', frac.toFixed(3));
}

/* ── Drawing ──────────────────────────────────────────────────────────── */
const PLAY  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const UP    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
const pref = (k, d) => (window.Prefs && Prefs.get(k) !== undefined ? Prefs.get(k) : d);
let showDay = null;            // which program day the home screen's list shows

function weekStripHTML() {
  const days = weekOf(today());
  return `<div class="gy-week">${days.map(k => {
    const s = sessionsOn(k), w = !s.length && k <= today() && walked(k);
    const mark = s.length ? (s[s.length - 1].minimum ? 'min' : esc(s[s.length - 1].day)) : w ? 'walk' : '';
    return `<span class="gy-wd${s.length ? ' on' : w ? ' walk' : ''}${k === today() ? ' now' : ''}${k > today() ? ' later' : ''}">
      <em>${WDAYS[new Date(k + 'T12:00:00').getDay()].slice(0, 2)}</em><b>${mark || '·'}</b></span>`;
  }).join('')}</div>`;
}
function exLine(e) {
  const t = `${e.sets} × ${e.lo === e.hi ? e.lo : e.lo + '–' + e.hi}${e.unit === 's' ? ' s' : ''}`;
  const l = lastFor(e.key, DB.live && DB.live.id);
  const up = shouldProgress(e.key, e, DB.live && DB.live.id);
  return `<div class="gy-ex-row">
    <span class="gy-ex-n">${esc(e.name)}</span>
    <span class="gy-ex-t">${esc(t)}</span>
    <span class="gy-ex-l">${l ? 'last ' + esc(l.ex.sets.map(x => setText(x, l.ex)).join(' · ')) : 'not done yet'}${up
      ? `<b class="gy-up">${UP}${e.bw ? 'go harder' : 'add weight'}</b>` : ''}</span>
  </div>`;
}
function homeHTML() {
  const nx = nextDay();
  const wk = weekCount();
  const live = DB.live;
  const list = finished().slice().reverse();
  const shown = DAYS.find(d => d.key === showDay) || nx || DAYS[0];
  return `${weekStripHTML()}
    <div class="gy-target"><b>${wk.n}</b> of ${esc(targetText())} this week${wk.moved > wk.n ? ` · moved on ${wk.moved} day${wk.moved === 1 ? '' : 's'}` : ''}</div>
    ${live ? `<div class="gy-next card live">
        <div class="gy-next-h"><span class="gy-tag">in progress</span><span>${esc(live.label)} · since ${hhmm(new Date(live.startedAt))}</span></div>
        <div class="gy-acts"><button class="gy-btn go" data-act="resume">${PLAY}<span>back to it</span></button></div>
      </div>`
    : nx ? `<div class="gy-next card">
        <div class="gy-next-h"><span class="gy-tag">next up</span><span>${esc(nx.label)}</span></div>
        <div class="gy-next-t">${esc(nx.exercises.map(e => e.name).join(' · '))}</div>
        ${WARMUP ? `<div class="gy-fine">warm-up · ${esc(WARMUP)}</div>` : ''}
        <div class="gy-acts">
          <button class="gy-btn go" data-act="start" data-d="${esc(nx.key)}">${PLAY}<span>start ${esc(nx.label)}</span></button>
          ${DAYS.filter(d => d.key !== nx.key).map(d => `<button class="gy-btn" data-act="start" data-d="${esc(d.key)}"><span>${esc(d.label)} instead</span></button>`).join('')}
        </div>
        <button class="gy-btn min" data-act="start-min"><span>minimum · ${esc(MINIMUM)}</span></button>
      </div>` : `<div class="gy-fine big">No days in the program yet — settings → gym.</div>`}
    ${DAYS.length ? `<div class="gy-sec">program</div>
      <div class="gy-days">${DAYS.map(d => `<button class="gy-day${d.key === shown.key ? ' on' : ''}" data-act="show-day" data-d="${esc(d.key)}">${esc(d.label)}</button>`).join('')}</div>
      <div class="gy-exs card">${shown.exercises.map(exLine).join('') || '<div class="gy-fine">no exercises on this day</div>'}</div>` : ''}
    <div class="gy-sec">history<em>${list.length ? list.length + ' session' + (list.length === 1 ? '' : 's') : ''}</em></div>
    ${list.length ? list.slice(0, 30).map(s => `<button class="gy-hist" data-act="past" data-id="${esc(s.id)}">
        <span class="gy-hist-d">${esc(dayWord(s.date))}</span>
        <span class="gy-hist-t">${esc(s.minimum ? 'minimum' : s.label)}<small>${s.ex.filter(e => e.sets.length).length} exercises${minutesOf(s) ? ' · ' + minutesOf(s) + ' min' : ''}${volumeOf(s) ? ' · ' + Math.round(volumeOf(s)) + ' ' + esc(UNIT) : ''}</small></span>
      </button>`).join('') : '<div class="gy-fine">Nothing logged yet. The first session is the one that counts.</div>'}`;
}

function setRowHTML(e, i) {
  const logged = e.sets[i];
  const p = prefill(e, i);
  const unitWord = e.target.unit === 's' ? 's' : 'reps';
  return `<div class="gy-set${logged ? ' done' : ''}">
    <span class="gy-set-i">${i + 1}</span>
    ${e.target.bw ? '<span class="gy-set-bw">body</span>' : `<label class="gy-in"><input type="text" inputmode="decimal" data-unit="${esc(UNIT)}"
        data-w="${esc(e.key)}|${i}" value="${esc(p && p.w != null ? num(p.w) : '')}" placeholder="—" aria-label="weight, set ${i + 1}"><em>${esc(UNIT)}</em></label>`}
    <label class="gy-in"><input type="text" inputmode="numeric" data-unit="${unitWord}"
        data-r="${esc(e.key)}|${i}" value="${esc(p && p.r != null ? num(p.r) : '')}" placeholder="—" aria-label="${unitWord}, set ${i + 1}"><em>${unitWord}</em></label>
    <button class="gy-ck${logged ? ' on' : ''}" data-act="${logged ? 'unlog' : 'log'}" data-k="${esc(e.key)}" data-i="${i}"
      data-tick aria-pressed="${!!logged}" aria-label="${logged ? 'unlog' : 'log'} set ${i + 1}">${CHECK}</button>
  </div>`;
}
function exCardHTML(e) {
  const t = e.target;
  const rows = Math.max(t.sets, e.sets.length) + e.extra;
  const l = lastFor(e.key, DB.live.id);
  const up = shouldProgress(e.key, t, DB.live.id);
  const done = e.sets.length >= t.sets;
  return `<div class="gy-card card${done ? ' done' : ''}" data-ex="${esc(e.key)}">
    <div class="gy-card-h"><b>${esc(e.name)}</b><span>${t.sets} × ${t.lo === t.hi ? t.lo : t.lo + '–' + t.hi}${t.unit === 's' ? ' s' : ''}</span></div>
    <div class="gy-card-s">${l ? 'last ' + esc(dayWord(l.session.date)) + ' · ' + esc(l.ex.sets.map(x => setText(x, l.ex)).join(' · ')) : 'first time — pick a weight you could do a few more with'}${up
      ? `<b class="gy-up">${UP}${t.bw ? 'every set at the top — go harder' : `add weight · +${num(INC)} ${esc(UNIT)}`}</b>` : ''}</div>
    ${Array.from({ length: rows }, (_, i) => setRowHTML(e, i)).join('')}
    <button class="gy-add" data-act="row" data-k="${esc(e.key)}">+ set</button>
  </div>`;
}
function sessHTML() {
  const s = DB.live;
  if (!s) return '<div class="gy-fine big">No session running.</div>';
  const rest = restSecs();
  const pickable = s.minimum ? allExercises().filter(e => !s.ex.some(x => x.key === e.key)) : [];
  return `<div class="gy-meta"><span>${esc(dayWord(s.date))} · started ${hhmm(new Date(s.startedAt))}</span><b id="gy-elapsed">${clock(Date.now() - s.startedAt)}</b></div>
    <div class="gy-restpick"><span>rest</span>${REST_CHOICES.map(n => `<button class="gy-chip${n === rest ? ' on' : ''}" data-act="rest-set" data-s="${n}">${n < 60 ? n + 's' : (n % 60 ? (n / 60).toFixed(1) : n / 60) + 'm'}</button>`).join('')}${
      pref('gymAutoRest', true) ? '' : '<button class="gy-chip go" data-act="rest-go">start rest</button>'}</div>
    ${(s.minimum ? MINIMUM : WARMUP) ? `<button class="gy-warm${s.warm ? ' on' : ''}" data-act="warm" data-tick aria-pressed="${s.warm}">
      <i>${CHECK}</i><span>${s.minimum ? esc(MINIMUM.split('+')[0].trim() || 'warm-up') : 'warm-up · ' + esc(WARMUP)}</span></button>` : ''}
    ${s.ex.map(exCardHTML).join('')}
    ${s.minimum ? `<div class="gy-sec">${s.ex.length ? 'another?' : 'pick one exercise'}</div>
      <div class="gy-days wrap">${pickable.map(e => `<button class="gy-day" data-act="add-ex" data-k="${esc(e.key)}">${esc(e.name)}</button>`).join('')}</div>` : ''}
    <div class="gy-acts end">
      <button class="gy-btn go" data-act="finish">${CHECK}<span>finish the session</span></button>
      <button class="gy-btn q" data-act="abandon"><span>throw it away</span></button>
    </div>`;
}
let pastId = null;
function pastHTML() {
  const s = DB.sessions.find(x => x.id === pastId);
  if (!s) return '<div class="gy-fine big">That session is gone.</div>';
  return `<div class="gy-meta"><span>${esc(summaryOf(s))}</span><b>${esc(dayWord(s.date))}</b></div>
    ${s.ex.filter(e => e.sets.length).map(e => `<div class="gy-card card">
      <div class="gy-card-h"><b>${esc(e.name)}</b><span>${e.sets.length} set${e.sets.length === 1 ? '' : 's'}</span></div>
      <div class="gy-past-sets">${e.sets.map((x, i) => `<span><em>${i + 1}</em>${esc(setText(x, e))}</span>`).join('')}</div>
    </div>`).join('') || '<div class="gy-fine">No sets were logged in this one.</div>'}
    <div class="gy-acts end"><button class="gy-btn q" data-act="del-past" data-id="${esc(s.id)}"><span>delete this session</span></button></div>`;
}

/* ── Screens ───────────────────────────────────────────────────────────── */
let screen = 'home';
function go(s) {
  screen = ['home', 'sess', 'past'].includes(s) ? s : 'home';
  if (screen === 'sess' && !DB.live) screen = 'home';
  view.querySelectorAll('.scr').forEach(x => x.classList.toggle('on', x.id === 's-' + screen));
  const b = bodyEl(); if (b) b.scrollTop = 0;
  render();
}
function paintBand() {
  const wk = weekCount();
  const lab = $id('gy-label');
  if (lab) lab.textContent = `${wk.n} of ${targetText()} this week`;
  const box = $id('gy-daynum');
  if (box && Shell.rollNum) Shell.rollNum(box, String(wk.n), wk.n);
}
function render() {
  if (!view) return;
  paintBand();
  if (screen === 'home') { const b = $id('gy-home'); if (b) b.innerHTML = homeHTML(); }
  if (screen === 'sess') {
    const b = $id('gy-sess'); if (b) b.innerHTML = sessHTML();
    const t = $id('gy-sess-title'); if (t && DB.live) t.textContent = DB.live.label;
    paintRest();
  }
  if (screen === 'past') {
    const b = $id('gy-past'); if (b) b.innerHTML = pastHTML();
    const s = DB.sessions.find(x => x.id === pastId);
    const t = $id('gy-past-title'); if (t) t.textContent = s ? (s.minimum ? 'minimum' : s.label) : 'session';
  }
  syncTick();
}

/* ── Events ─────────────────────────────────────────────────────────────── */
const readField = (attr, key, i) => {
  /* keys are [a-z0-9_-], so the value needs no escaping inside the quotes */
  const el = view.querySelector(`[data-${attr}="${key}|${i}"]`);
  return el ? parseNum(el.value) : null;
};
document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('.ns-gym [data-act]');
  if (!t || t.disabled) return;
  const act = t.dataset.act;
  if (act === 'home')      { go('home'); return; }
  if (act === 'start')     { start(t.dataset.d, false); return; }
  if (act === 'start-min') { start(null, true); return; }
  if (act === 'resume')    { go('sess'); return; }
  if (act === 'show-day')  { showDay = t.dataset.d; render(); return; }
  if (act === 'past')      { pastId = t.dataset.id; go('past'); return; }
  if (act === 'del-past')  { removeSession(t.dataset.id); return; }
  if (act === 'finish')    { finish(); return; }
  if (act === 'abandon')   { abandon(); return; }
  if (act === 'warm')      { if (DB.live) { DB.live.warm = !DB.live.warm; save(); render(); } return; }
  if (act === 'log') {
    const k = t.dataset.k, i = +t.dataset.i;
    logSet(k, i, readField('w', k, i), readField('r', k, i));
    return;
  }
  if (act === 'unlog')     { unlogSet(t.dataset.k, +t.dataset.i); return; }
  if (act === 'row')       { addRow(t.dataset.k); return; }
  if (act === 'add-ex')    { addExercise(t.dataset.k); return; }
  if (act === 'rest-set')  { DB.restSecs = +t.dataset.s || null; save(); render(); return; }
  if (act === 'rest-add')  { restAdd(+t.dataset.s || 30); return; }
  if (act === 'rest-skip') { restSkip(); return; }
  if (act === 'rest-go')   { restStart(); return; }
  /* the settings panel's two — it carries .ns-gym, so this listener reaches it */
  if (act === 'gym-walk')  { Config.set('gym.walkCounts', !WALK); return; }
  if (act === 'gym-reset') { resetAll(); return; }
});
/* A logged set edited in place stays logged with the new numbers. */
document.addEventListener('change', ev => {
  const el = ev.target;
  if (!el || !el.closest || !el.closest('.ns-gym') || !DB.live) return;
  const ref = el.dataset.w || el.dataset.r; if (!ref) return;
  const [k, i] = ref.split('|'); const e = liveEx(k);
  if (!e || !e.sets[+i]) return;
  const v = parseNum(el.value);
  if (el.dataset.w) e.sets[+i].w = v; else if (v != null) e.sets[+i].r = v;
  save();
});

/* ── Settings ───────────────────────────────────────────────────────────── */
function renderSettings() {
  const st = document.querySelector('.ns-gym #gy-status');
  if (!st) return;
  const wk = weekCount(), nx = nextDay();
  st.className = 'settings-status ' + (DB.live ? 'ok' : 'idle');
  st.textContent = (DB.live ? `${DB.live.label} in progress · ` : '') +
    `${wk.n} of ${targetText()} this week · ${finished().length} sessions logged${nx ? ' · next: ' + nx.label : ''}`;
  /* the panel's fields, from the normalised values the app is using */
  const val = { 'gym.rest': REST, 'gym.increment': INC, 'gym.unit': UNIT, 'gym.warmup': WARMUP,
                'gym.minimum': MINIMUM, 'gym.doLink': DO_LINK, 'gym.restChoices': REST_CHOICES.join(', ') };
  document.querySelectorAll('.set-panel.ns-gym [data-cfg]').forEach(el => {
    if (document.activeElement === el) return;
    const p = el.dataset.cfg;
    const v = p === 'gym.target' ? TARGET[el.dataset.sub] : val[p];
    el.value = v == null ? '' : String(v);
  });
  const w = document.querySelector('.set-panel.ns-gym #gy-walk');
  if (w) { w.classList.toggle('on', WALK); w.setAttribute('aria-checked', String(WALK)); }
}
function resetAll() {
  Shell.confirm('Reset GYM?\nEvery logged session and the one in progress go. The program is a setting and stays.', () => {
    const was = JSON.parse(JSON.stringify(DB));
    DB = blank(); save(); go('home'); renderSettings();
    Shell.undo('gym reset', () => { DB = normalise(was); save(); render(); renderSettings(); });
  });
}

Config.subscribe(path => {
  if (path !== '*' && !String(path).startsWith('gym')) return;
  readConfig(); render(); renderSettings();
});
Prefs.subscribe(k => { if (k === '*' || k === 'weekStart' || /^gym/.test(k)) render(); });

Shell.register('gym', {
  onShow: () => { if (screen === 'sess' && !DB.live) screen = 'home'; render(); },
  onDayChange: () => render(),
  /* The tab tapped mid-session lands on the session, never off it: the one
     thing this must not do is hide a running clock behind the home screen. */
  home: () => { if (DB.live && screen !== 'sess') go('sess'); else if (!DB.live) go('home'); },
  search: q => {
    const open = s => () => { Shell.TABS.includes('gym') ? Shell.go('gym') : Shell.open('gym'); go(s); };
    const out = [];
    allExercises().filter(e => e.name.toLowerCase().includes(q)).forEach(e =>
      out.push({ title: e.name, sub: 'gym · exercise', go: open('home') }));
    DAYS.filter(d => d.label.toLowerCase().includes(q)).forEach(d =>
      out.push({ title: d.label, sub: 'gym · program', go: () => { showDay = d.key; open('home')(); } }));
    return out;
  },
});

/* A session left running across a reload comes back to the session screen. */
if (DB.live) screen = 'sess';
view.querySelectorAll('.scr').forEach(x => x.classList.toggle('on', x.id === 's-' + screen));
render();

return {
  render, renderSettings, go, resetAll,
  reload: () => { load(); render(); renderSettings(); },
  state: () => JSON.parse(JSON.stringify(DB)),
  /* for TODAY: open GYM on whatever is relevant — the live session, or home */
  open: () => { Shell.TABS.includes('gym') ? Shell.go('gym') : Shell.open('gym'); go(DB.live ? 'sess' : 'home'); },
  next: () => { const d = nextDay(); return d ? { key: d.key, label: d.label } : null; },
  dayOf, weekCount, live: () => !!DB.live,
  /* the API the harness drives — the same calls the buttons make */
  start, logSet, unlogSet, finish: doFinish, addExercise, restStart, restLeft,
  shouldProgress: key => { const e = allExercises().find(x => x.key === key); return e ? shouldProgress(key, e) : false; },
  prefill: (key, i) => { const e = liveEx(key); return e ? prefill(e, i) : null; },
};
})();
