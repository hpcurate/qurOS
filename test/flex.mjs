// qurOS — the flex system's checks (jsdom).
//   cd test && npm install && node flex.mjs [path-to-app]
// TODAY, GYM, the pomodoro areas, the recipe library and its grocery trips,
// and every link they make into the apps root already had (LOG's note and
// morning form, DO's ticks, TOOLS' rounds, the two sync routes). Root's own
// checks are in harness.mjs; this file boots its own window so neither leans on
// the other's state. Outcomes, not implementations: each check drives the app
// through the calls its buttons make and reads back what a person would see or
// what lands in storage.
import { JSDOM, ResourceLoader, VirtualConsole } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(process.argv[2] || path.join(HERE, '..'));
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

class LocalLoader extends ResourceLoader {
  fetch(url) {
    const u = new URL(url);
    if (u.hostname === 'localhost' && u.pathname.endsWith('.js'))
      return Promise.resolve(fs.readFileSync(path.join(ROOT, u.pathname.replace(/^\/root\//, ''))));
    return Promise.resolve(Buffer.from(''));
  }
}

let pass = 0, fail = 0;
const results = [];
const bail = e => { console.log(results.join('\n')); console.error('\nthrew before the end:\n' + ((e && e.stack) || e)); process.exit(1); };
process.on('uncaughtException', bail);
process.on('unhandledRejection', bail);
function check(name, cond, note) {
  if (cond) { pass++; results.push(`  ok   ${name}`); }
  else { fail++; results.push(`  FAIL ${name}${note ? ' — ' + note : ''}`); }
}
const tick = (ms = 20) => new Promise(r => setTimeout(r, ms));

/* A window per scenario: a fresh install, or one with storage already in it. */
let fetchScript = async () => ({ ok: false, status: 599, json: async () => ({}), text: async () => '' });
async function boot(store) {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.detail?.message || e.message)));
  vc.on('error', (...a) => errors.push('console.error: ' + a.map(x => (x && x.stack) || String(x)).join(' ')));
  const dom = new JSDOM(html, {
    url: 'http://localhost/root/index.html', runScripts: 'dangerously', resources: new LocalLoader(),
    pretendToBeVisual: true, virtualConsole: vc,
    beforeParse(w) {
      w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {} });
      w.requestAnimationFrame = fn => setTimeout(fn, 0);
      w.Element.prototype.scrollIntoView = function () {};
      w.confirm = () => { errors.push('system confirm'); return true; };
      w.prompt = () => { errors.push('system prompt'); return ''; };
      w.fetch = (...a) => fetchScript(...a);
      w.navigator.vibrate = () => true;
      Object.keys(store || {}).forEach(k => w.localStorage.setItem(k, typeof store[k] === 'string' ? store[k] : JSON.stringify(store[k])));
    },
  });
  const w = dom.window;
  await new Promise(r => w.addEventListener('load', r));
  await tick(60);
  w.__errors = errors;
  return w;
}
const pad = n => String(n).padStart(2, '0');
const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return isoOf(d); };
const T = day(0), Y = day(-1);
const read = (w, k) => { try { return JSON.parse(w.localStorage.getItem(k) || 'null'); } catch { return null; } };
const click = (w, el) => el && el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
const askOpen = w => { const el = w.document.getElementById('ask'); return !!el && !el.classList.contains('hidden'); };
const settle = (w, yes = true) => { if (askOpen(w)) click(w, w.document.getElementById(yes ? 'ask-yes' : 'ask-no')); };

/* ══ 1. A fresh install ════════════════════════════════════════════════════ */
const w = await boot();
const $ = s => w.document.querySelector(s);
const $$ = s => [...w.document.querySelectorAll(s)];
check('boots with no errors', w.__errors.length === 0, w.__errors.slice(0, 3).join(' | '));
check('TODAY and GYM are modules with a tab, a slide and a settings panel',
  ['today', 'gym'].every(a => w[a.toUpperCase()] && $('#view-' + a) && $(`.tab-b[data-app="${a}"]`) &&
    $(`.ns-set .set-panel[data-panel="${a}"]`)));
check('a fresh install opens on TODAY', $('.tab-b.on')?.dataset.app === 'today' && w.Shell.TABS[0] === 'today');
check('PLAN and DAY ship out of the bar but still exist', w.Shell.hidden().join(',') === 'plan,cal' && !!w.PLAN && !!w.CAL);
check('the prefs record is qurOS\'s own and written at once', !!read(w, 'quros_prefs_v1') && read(w, 'root_prefs_v1') === null);
check('a bar this full shows the live tab\'s label only', $('#nav').dataset.crowd === 'on');
w.Prefs.set('apps', ['today', 'do', 'log', 'gym']);
check('… and a short bar labels every tab', $('#nav').dataset.crowd === 'off');
w.Prefs.reset('apps');
check('the brand is qurOS', w.document.title === 'qurOS' && /qurOS/.test($('#view-settings > .h-top .h-logo')?.textContent || ''));

/* ══ 2. Goals ═══════════════════════════════════════════════════════════════ */
const TD = w.TODAY;
check('a goal is added', TD.addGoal('1 pomodoro on CAP chapter 1') && TD.state().days[T].goals.length === 1);
TD.addGoal('call the school'); TD.addGoal('tidy the desk');
check('the cap is three, and a fourth is refused', TD.addGoal('a fourth') === false &&
  TD.state().days[T].goals.length === 3);
const g0 = TD.state().days[T].goals[0];
TD.toggleGoal(g0.id);
check('ticking a goal marks it done with the time', TD.state().days[T].goals[0].done && /^\d\d:\d\d$/.test(TD.state().days[T].goals[0].at));
TD.toggleGoal(g0.id);
check('… and it comes back off', !TD.state().days[T].goals[0].done);

/* Yesterday's leftovers: carry one, drop one, neither is a penalty. */
const w2 = await boot({ today_v1: { v: 1, days: {
  [day(-3)]: { goals: [{ id: 'old', text: 'three days ago', done: false }] },
  [Y]: { goals: [{ id: 'a', text: 'call the school', done: false }, { id: 'b', text: 'post the letter', done: false },
                 { id: 'c', text: 'done already', done: true }] } } } });
const C = w2.TODAY.carryFrom();
check('the open goals of the last day with goals are offered, and only those',
  C && C.iso === Y && C.goals.map(g => g.id).join(',') === 'a,b', JSON.stringify(C));
check('the offer is drawn on TODAY with a carry and a drop for each',
  w2.document.querySelectorAll('.ns-today .ty-carry [data-act="carry"]').length === 2 &&
  w2.document.querySelectorAll('.ns-today .ty-carry [data-act="drop"]').length === 2);
click(w2, w2.document.querySelector('.ns-today .ty-carry [data-act="carry"][data-id="a"]'));
const st2 = w2.TODAY.state();
check('carry puts it on today, saying where it came from', st2.days[T].goals.some(g => g.text === 'call the school' && g.from === Y));
check('… and marks it carried on the day it was left', st2.days[Y].goals.find(g => g.id === 'a').fate === 'carried');
click(w2, w2.document.querySelector('.ns-today .ty-carry [data-act="drop"][data-id="b"]'));
check('drop marks it dropped and the offer goes', w2.TODAY.state().days[Y].goals.find(g => g.id === 'b').fate === 'dropped' &&
  !w2.TODAY.carryFrom() && !w2.document.querySelector('.ns-today .ty-carry'));
check('a dropped goal is never shown red, failed or counted against anything',
  !/fail|missed|overdue/i.test(w2.document.querySelector('.ns-today #ty-home').textContent));

/* ══ 3. The chain, the next step and the bad day ══════════════════════════ */
/* Morning for the next-step checks: the evening starts at the last minute. */
w.Config.set('today.anchors', Object.assign({}, w.Config.get('today.anchors'), { eveningFrom: '23:59' }));
check('with nothing answered the next step is the first of the chain', TD.nextItem().kind === 'step' && TD.nextItem().step.key === 'wake');
TD.setStep('wake', 'full');
check('a step ticked full is done', TD.stepState('wake').v === 'full');
check('the next step moves on to the second', TD.nextItem().step.key === 'walk');
TD.setStep('gym', 'min');
check('order is guidance: a later step ticked first is simply done', TD.stepState('gym').v === 'min' && TD.nextItem().step.key === 'walk');
TD.setStep('walk', 'skip');
check('"not today" passes a step over without marking it done', TD.nextItem().step.key === 'shower' && TD.chainCount() === 2);
TD.setStep('walk', 'skip');
check('… and tapping it again takes the skip back', TD.stepState('walk').v === '' && TD.nextItem().step.key === 'walk');
TD.setStep('gym', 'min');
check('tapping the answer a step already has clears it', TD.stepState('gym').v === '');
['walk', 'gym', 'shower', 'cap'].forEach(k => TD.setStep(k, 'min'));
const gOpen = TD.state().days[T].goals.find(g => !g.done);
check('with the chain answered, the next step is the first open goal', TD.nextItem().kind === 'goal' && TD.nextItem().goal.id === gOpen.id);
['wake', 'walk', 'gym', 'shower', 'cap'].forEach(k => { const s = TD.stepState(k); if (s.src === 'own') TD.setStep(k, s.v); });
w.Config.set('today.anchors', Object.assign({}, w.Config.get('today.anchors'), { eveningFrom: '00:00' }));
check('from the evening hour the next step is the evening\'s', TD.nextItem().kind === 'prep');
check('… and an unanswered morning step stops asking', TD.nextItem().kind !== 'step');
w.Config.set('today.anchors', Object.assign({}, w.Config.get('today.anchors'), { eveningFrom: '23:59' }));

w.Shell.go('today'); TD.go('home');
TD.toggleBad(); TD.render();
check('bad day: every action offered is the minimum', $$('.ns-today .ty-next [data-act="step"]').every(b => b.dataset.v === 'min' || b.classList.contains('ty-quiet')) &&
  /out of bed/.test($('.ns-today .ty-next').textContent));
check('… everything else is hidden — no goals, no week, no focus', !$('.ns-today .ty-goals') && !$('.ns-today .ty-wk') && !$('.ns-today .ty-focus'));
check('… the day is marked, and the switch says so', TD.state().days[T].bad === true && $('.ns-today #ty-bad').getAttribute('aria-checked') === 'true');
w.Config.set('today.badDay', Object.assign({}, w.Config.get('today.badDay'), { keepGoals: true }));
check('a bad day can keep the goals when asked to', !!$('.ns-today .ty-goals'));
w.Config.reset('today.badDay');
TD.toggleBad(); TD.render();
check('switching it off brings the full day back', !TD.state().days[T].bad && !!$('.ns-today .ty-goals'));

/* ══ 4. The links: LOG, GYM, TOOLS, DO ════════════════════════════════════ */
w.localStorage.setItem('log_' + T, JSON.stringify({ date: T, scale: 5, m: { wt: '06:10', saved: Date.now() }, e: {}, entries: [] }));
check('the wake step reads LOG\'s wake time: on time within the grace is full',
  TD.stepState('wake').v === 'full' && TD.stepState('wake').src === 'log' && TD.stepState('wake').at === '06:10');
w.localStorage.setItem('log_' + T, JSON.stringify({ date: T, scale: 5, m: { wt: '06:40', saved: Date.now() }, e: {}, entries: [] }));
check('… later than that is the minimum — still done, never late', TD.stepState('wake').v === 'min');
w.localStorage.removeItem('log_' + T);
TD.setWake('06:02');
check('with LOG empty, TODAY\'s own "I\'m up" stands in', TD.stepState('wake').v === 'full' && TD.stepState('wake').src === 'own');

TD.setStep('walk', 'full');
check('a step mirrored to DO ticks DO\'s routine item', w.DO.ticked('fit', 'kamo walk m') === true);
TD.setStep('walk', 'full');
check('… and untick there too', w.DO.ticked('fit', 'kamo walk m') === false);
w.DO.setTick('fit', 'kamo walk m', true);
check('a tick made on DO answers the step', TD.stepState('walk').v === 'full' && TD.stepState('walk').src === 'do');
w.DO.setTick('fit', 'kamo walk m', false);

check('GYM suggests day A first', w.GYM.next().key === 'A');
w.GYM.start('A');
check('a session starts on the session screen', $('.ns-gym #s-sess').classList.contains('on') && w.GYM.live());
w.GYM.logSet('squat', 0, 40, 12);
check('the next set is prefilled from the one just logged', w.GYM.prefill('squat', 1).w === 40 && w.GYM.prefill('squat', 1).r === 12);
check('a logged set starts the rest timer', w.GYM.restLeft() > 80000 && !$('.ns-gym #gy-rest').hidden);
w.GYM.logSet('squat', 1, 40, 12); w.GYM.logSet('squat', 2, 40, 12);
w.GYM.finish();
check('finishing files the session and answers TODAY\'s gym step', TD.stepState('gym').v === 'full' && TD.stepState('gym').src === 'gym');
check('… ticks DO\'s exercise item', w.DO.ticked('fit', 'exercise') === true);
check('… and moves the rotation on to day B', w.GYM.next().key === 'B');
check('every set at the top of the range means "add weight" next time', w.GYM.shouldProgress('squat') === true);
const dayA = w.GYM.dayOf(T);
check('the day reads back with its lines', dayA && !dayA.minimum && dayA.lines.length === 1 && /40×12/.test(dayA.lines[0]), JSON.stringify(dayA));
check('the week counts it against the range, never as a streak', w.GYM.weekCount().n === 1 &&
  /1 of 3–4 this week/.test($('.ns-gym #gy-label').textContent));

const toolsAt = w.TOOLS.state();
w.TOOLS.setArea('music');
check('a focus area is picked and kept', w.TOOLS.pomNow().area === 'music');
w.TOOLS.startFocus('cap');
check('starting focus from TODAY tags it and runs the clock', w.TOOLS.pomNow().running && w.TOOLS.pomNow().area === 'cap');
const ts = read(w, 'tools_v1'); ts.pom.endsAt = Date.now() - 1000; w.localStorage.setItem('tools_v1', JSON.stringify(ts));
w.TOOLS.reload(); await tick(400);
check('a finished round is filed under its area', w.TOOLS.areaCount(T, 'cap') === 1 && w.TOOLS.areaCount(T, 'music') === 0,
  JSON.stringify(read(w, 'tools_v1').pom.log[T]));
check('… which answers the CAP pomodoro step', TD.stepState('cap').v === 'full' && TD.stepState('cap').src === 'tools');
check('… and the day\'s plain count, which LOG reads, still counts it', read(w, 'tools_v1').pom.days[T] === 1);
check('TOOLS.today() carries the split by area', w.TOOLS.today().areas.find(a => a.key === 'cap').n === 1);
w.Config.set('tools.areas', w.Config.get('tools.areas').map(a => a.key === 'cap' ? Object.assign({}, a, { label: 'CAP élec' }) : a));
check('renaming an area keeps its rounds — the key is the identity', w.TOOLS.areaCount(T, 'cap') === 1 &&
  w.TOOLS.areas().find(a => a.key === 'cap').label === 'CAP élec');
w.Config.reset('tools.areas');
check('a break phase gives way when focus is asked for', (() => {
  const s = read(w, 'tools_v1'); s.pom.phase = 'short'; s.pom.endsAt = 0; s.pom.left = 0;
  w.localStorage.setItem('tools_v1', JSON.stringify(s)); w.TOOLS.reload();
  w.TOOLS.startFocus('admin');
  return w.TOOLS.pomNow().phase === 'focus' && w.TOOLS.pomNow().running && w.TOOLS.pomNow().area === 'admin';
})());
w.TOOLS.togglePom();

/* ══ 5. Hygiene and the shower ═══════════════════════════════════════════ */
TD.hygTick('shower');
check('the shower alone is the minimum of the hygiene chain', TD.hygLevel() === 'min' && TD.stepState('shower').src === 'hyg');
['face', 'teeth', 'floss', 'tongue'].forEach(k => TD.hygTick(k));
check('every step that is not optional is the full chain — shaving is not needed', TD.hygLevel() === 'full' && TD.stepState('shower').v === 'full');
check('a hygiene step mirrored to DO ticks DO\'s item', w.DO.ticked('fix', 'teeth morning') === true);
TD.hygTick('shower');
TD.showerStart();
const sh = read(w, 'today_v1'); sh.shower.endsAt = Date.now() - 10; w.localStorage.setItem('today_v1', JSON.stringify(sh)); TD.reload();
await tick(1200);
check('the shower timer running out ticks the shower', TD.state().days[T].hyg.shower && !TD.state().shower.endsAt);

/* ══ 6. The evening: prep, lights out, the dump, the export ═════════════ */
TD.prepTick('gymbag');
check('prep ticks, mirrored onto DO\'s gym prep', !!TD.state().days[T].prep.gymbag && w.DO.ticked('plan', 'gym prep') === true);
TD.setSleep('23:10');
w.Shell.go('today'); TD.go('eve');
const ta = $('.ns-today #ty-dump-in');
ta.value = 'the walk helped. CAP 1.2 tomorrow, first thing.';
ta.dispatchEvent(new w.Event('input', { bubbles: true }));
await tick(700);
const logRec = read(w, 'log_' + T);
check('the dump is a LOG entry for the day, saved as it is typed', logRec && logRec.entries.length === 1 &&
  logRec.entries[0].src === 'dump' && /CAP 1\.2 tomorrow/.test(logRec.entries[0].text));
ta.value = 'the walk helped.'; ta.dispatchEvent(new w.Event('input', { bubbles: true })); await tick(700);
check('… edited in place, never a second entry', read(w, 'log_' + T).entries.length === 1 && read(w, 'log_' + T).entries[0].text === 'the walk helped.');
const note = w.LOG.buildNote();
check('LOG\'s note carries the dump under #### entries, like any entry', /#### entries[\s\S]*> \d\d:\d\d - the walk helped\./.test(note));
check('… and a #### today table, after the sections it already had', /#### today\n\n\| data +\| ans \|/.test(note) &&
  note.indexOf('#### today') > note.indexOf('#### curate output'));
check('… whose rows are keyed, one line each', /\| bad_day +\| no \|/.test(note) && /\| goals_done +\| 0\/3 \|/.test(note) &&
  /\| chain_done +\| \d\/5 \|/.test(note) && /\| sleep_time +\| 23:10 \|/.test(note) && /\| pom_areas +\| CAP 1 \|/.test(note),
  (note.match(/#### today[\s\S]*/) || [''])[0]);
check('… and the contract around it did not move', /\| wakeup_time   \|/.test(note) && /\| curate_total  \|/.test(note) && /## planning/.test(note));
const wEmpty = await boot();
check('a day TODAY knows nothing about has no #### today section', !/#### today/.test(wEmpty.LOG.buildNote()));

const md = TD.exportMd(T);
check('the export starts with the day and its anchors', /^# qurOS · \w{3} \d+ \w{3} \d{4}/.test(md) && /- wake: 06:02 \(target 06:00\)/.test(md) &&
  /- sleep: 23:10/.test(md) && /- bad day: no/.test(md), md.slice(0, 200));
check('… the goals as checkboxes, the chain with full or minimum', /## goals\n- \[ \] 1 pomodoro on CAP chapter 1/.test(md) &&
  /- \[x\] gym — full/.test(md) && /- \[x\] wake — full \(06:02\)/.test(md), md);
check('… pomodoros by area, the gym session, the prep and the dump', /- today: CAP 1/.test(md) && /## gym\nday A/.test(md) &&
  /- \[x\] gym bag ready/.test(md) && /## dump\nthe walk helped\./.test(md));
w.Config.set('today.export', Object.assign({}, w.Config.get('today.export'), { dump: false, gym: false }));
check('a section switched off is left out', !/## dump/.test(TD.exportMd(T)) && !/## gym/.test(TD.exportMd(T)) && /## goals/.test(TD.exportMd(T)));
w.Config.reset('today.export');

/* An open form's unsaved answers stay unsaved when the dump is written. */
w.Shell.go('log'); w.LOG.go('evening');
w.LOG.toggleMeal(2);
w.LOG.setEntry(T, 'dump', 'written while the evening form was open');
check('writing the dump never saves the form that is open underneath it',
  !(read(w, 'log_' + T).e.meals || []).includes(2) && read(w, 'log_' + T).entries[0].text === 'written while the evening form was open',
  JSON.stringify(read(w, 'log_' + T).e.meals));
w.LOG.go('home');

/* ══ 7. LOG's morning form takes what the day already knows ════════════════ */
const wM = await boot({ today_v1: { v: 1, days: { [Y]: { sleep: '22:45' }, [T]: { wake: '06:05' } } } });
wM.Shell.go('log'); wM.LOG.go('morning');
check('the morning form is offered TODAY\'s wake time', wM.document.querySelector('.ns-log #m-wt').value === '06:05');
check('… and the hours slept since last night\'s lights-out', wM.document.querySelector('.ns-log #m-sl').value === '7.3',
  wM.document.querySelector('.ns-log #m-sl').value);
check('… without writing either: the record is still only what Save writes', !read(wM, 'log_' + T));
check('DATA\'s weight is the weight, not the wake-up hour', (() => {
  wM.localStorage.setItem('log_' + Y, JSON.stringify({ date: Y, m: { wt: '06:20', wkg: '78.4' }, e: {} }));
  return wM.LOG.dayData(Y).weight === 78.4;
})());

/* ══ 8. The week ═════════════════════════════════════════════════════════ */
const ws = TD.weekStats();
check('the week counts each step day by day, as X of 7', ws.chain.find(r => r.key === 'gym').cells.filter(v => v === 'full').length === 1 &&
  ws.days.length === 7);
check('… and the gym against its range', ws.gym && ws.gym.n === 1 && ws.gym.target === '3–4');
TD.addWeekGoal('finish CAP level 1, part 1');
check('weekly goals file under the week', TD.state().weeks[Object.keys(TD.state().weeks)[0]].goals[0].text === 'finish CAP level 1, part 1');
TD.addWeekGoal('two'); TD.addWeekGoal('three');
check('… with a cap of three', TD.addWeekGoal('four') === false);

/* ══ 9. The life-dump map ═══════════════════════════════════════════════ */
const map = ['# Life dump', '## Tier 2 — Work', '- the CAP', '- music', '## Tier 1', '### Health', '- sleep', '- [x] the gym plan',
             '### Money', '- [~] rent', '- savings'].join('\n');
const pm = TD.parseMap(map);
check('a map reads sections, tiers and items', pm && pm.map.sections.length === 3 &&
  pm.map.sections.find(s => s.title === 'Health').tier === 1 && pm.map.sections.find(s => s.title === 'Work').tier === 2,
  JSON.stringify(pm && pm.map.sections.map(s => [s.title, s.tier, s.items.length])));
TD.loadMapText(map);
check('the next untouched item is the lowest tier\'s first empty one', TD.mapNext().item.text === 'sleep' && TD.mapNext().section.title === 'Health');
check('a [x] or [~] in the file seeds the item\'s state', Object.values(TD.state().mapState).sort().join(',') === 'done,partial');
const ms0 = Object.assign({}, TD.state().mapState);
TD.loadMapText(map.replace('- music', '- music production'));
check('re-importing keeps every state whose item was not reworded', JSON.stringify(TD.state().mapState) === JSON.stringify(ms0));

/* ══ 10. Day rollover ═══════════════════════════════════════════════════ */
check('at the default the day ends at midnight', TD.flexDayAt(new Date(2026, 9, 14, 0, 30)) === '2026-10-14');
w.Config.set('today.anchors', Object.assign({}, w.Config.get('today.anchors'), { dayEnds: '03:00' }));
check('set later, 02:30 still belongs to the day before', TD.flexDayAt(new Date(2026, 9, 14, 2, 30)) === '2026-10-13' &&
  TD.flexDayAt(new Date(2026, 9, 14, 3, 0)) === '2026-10-14');
w.Config.reset('today.anchors');

/* ══ 11. GYM: minimum, abandon, delete, a session across a reload ════════ */
w.GYM.start(null, true);
check('the minimum session asks for one exercise', !!$('.ns-gym [data-act="add-ex"]'));
w.GYM.addExercise('plank'); w.GYM.logSet('plank', 0, null, 40);
w.GYM.finish();
check('a minimum session is a gym day, and does not move the rotation', w.GYM.weekCount().n === 1 && w.GYM.next().key === 'B' &&
  w.GYM.state().sessions.slice(-1)[0].minimum === true);
w.GYM.start('B');
const wR = await boot({ gym_v1: w.localStorage.getItem('gym_v1') });
check('a session left running survives a reload, on the session screen', wR.GYM.live() &&
  wR.document.querySelector('.ns-gym #s-sess').classList.contains('on'));
w.Shell.go('gym');
click(w, $('.ns-gym [data-act="abandon"]')); settle(w);
check('a session can be thrown away', !w.GYM.live());
click(w, $('#undo-pill'));
check('… and taken back', w.GYM.live());
click(w, $('.ns-gym [data-act="finish"]')); settle(w, true);
check('finishing with nothing logged offers the minimum, and takes it', !w.GYM.live() && w.GYM.state().sessions.slice(-1)[0].minimum === true);

/* ══ 12. Recipes and the grocery list ════════════════════════════════════ */
const S = w.STORE;
check('names match the way a list hears them', S.canon('Onions x2') === S.canon('onion') && S.canon('bicarb soda') === S.canon('Baking Soda') &&
  S.canon('300 g rice') === S.canon('rice') && S.canon('peppers') !== S.canon('pepper') && S.canon('spring onions') === S.canon('scallion'));
const bur = S.groceryFor('burritos');
const names = bur.map(l => l.name);
check('a choice takes one of its group, not all of it', names.includes('chicken') && !names.includes('pork') && !names.includes('minced beef'));
check('an optional ingredient is left off unless asked for', !names.includes('lime'));
check('the side comes with it, merged by name', names.filter(n => S.canon(n) === S.canon('garlic')).length === 1 &&
  bur.some(l => /tomato paste/.test(l.name)), names.join(', '));
check('… and the cupboard is not shopped for', !names.some(n => /^salt$/.test(n)));
const soup = S.groceryFor('soupe');
check('the soup is usually doubled: a count goes into the title', soup.some(l => l.title === 'onion x2') && soup.some(l => l.title === 'courgette x2'));
check('… a unit goes into the note, never the title', soup.find(l => l.name === 'olive oil').desc.startsWith('4 tbsp') &&
  soup.find(l => l.name === 'olive oil').title === 'olive oil');
check('… aubergine is optional and herbes de provence is in the cupboard', !soup.some(l => /aubergine|herbes/.test(l.name)));

/* No key: the phone's own list, deduplicated against what is already on it. */
w.Shell.go('store');
w.document.querySelector('.ns-store #manual-input').value = 'baking soda'; S.addManual();
S.openRecipe('stirfry_oyster'); S.openShop();
check('the grocery sheet shows what is already on the list', /already on the list/.test($('.ns-store #gs-body').textContent));
await S.shopGo();
const lst = read(w, 'store_state_v1').list;
check('"add to groceries" adds what is missing, once', lst.filter(i => S.canon(i.name) === S.canon('baking soda')).length === 1 &&
  lst.some(i => i.name === 'oyster sauce'), lst.map(i => i.name).join(', '));

/* With a key: the trip, created with a date, and the items under it. */
const calls = [];
const remote = [
  { id: 'p0', content: 'walk shop — wed 14 oct', section_id: 'sec', project_id: 'proj', parent_id: null, due: { date: '2026-10-14' } },
  { id: 't1', content: 'rice', section_id: 'sec', project_id: 'proj', parent_id: 'p0' },
  { id: 't2', content: 'tortillas x2', section_id: 'sec', project_id: 'proj', parent_id: null },
];
const json = (body, status = 200) => ({ ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body) });
let failMove = false;
fetchScript = async (url, opts = {}) => {
  const u = String(url), m = (opts.method || 'GET').toUpperCase();
  const body = opts.body ? JSON.parse(opts.body) : null;
  calls.push({ u, m, body });
  if (u.includes('/projects')) return json({ results: [{ id: 'proj', name: '04 | life' }] });
  if (u.includes('/sections')) return json({ results: [{ id: 'sec', name: 'home | groceries' }] });
  if (/\/tasks\/[^/?]+\/move/.test(u)) return failMove ? json({}, 500) : json(null, 204);
  if (u.includes('/tasks') && m === 'POST') { const t = Object.assign({ id: 'n' + calls.length }, body); remote.push(t); return json(t); }
  if (u.includes('/tasks')) return json({ results: remote.slice() });
  return json({});
};
w.Creds.save('test-token');
const ss = read(w, 'store_state_v1'); ss.list = []; w.localStorage.setItem('store_state_v1', JSON.stringify(ss));
const wS = await boot({ store_state_v1: ss, root_todoist_v1: { token: 'test-token' } });
wS.STORE.openRecipe('burritos'); wS.STORE.openShop(); await tick(80);
check('the sheet reads the open trips from Todoist', /walk shop — wed 14 oct/.test(wS.document.querySelector('.ns-store #gs-body').textContent));
check('… and counts what is already there — rice is under the trip, tortillas loose', (() => {
  const t = wS.document.querySelector('.ns-store #gs-body').textContent;
  return /rice[\s\S]*already on the list/.test(t) || /tortillas[\s\S]*already on the list/.test(t);
})());
click(wS, wS.document.querySelector('.ns-store [data-sact="gs-pick"][data-v="new:car"]'));
click(wS, wS.document.querySelector('.ns-store [data-sact="gs-when"][data-v="tomorrow"]'));
calls.length = 0;
await wS.STORE.shopGo(); await tick(40);
const parentCall = calls.find(c => c.m === 'POST' && c.body && /^car shop — /.test(c.body.content));
check('a new trip is a parent task with a date', !!parentCall && parentCall.body.due_date === day(1) && parentCall.body.section_id === 'sec',
  JSON.stringify(parentCall));
const kids = calls.filter(c => c.m === 'POST' && c.body && c.body.parent_id);
check('… and every new item hangs under it', kids.length > 5 && kids.every(c => c.body.parent_id === remote.find(t => /^car shop/.test(t.content)).id));
check('… with nothing already on the list sent again', !kids.some(c => /^rice$|^tortillas/.test(c.body.content)));
check('… and the counts and notes where they belong', kids.some(c => c.body.content === 'chicken') &&
  kids.some(c => c.body.content === 'garlic' && /clove/.test(c.body.description || '')));

/* STORE's own sync never pulls a trip in as something to buy. */
calls.length = 0;
await wS.STORE.syncTodoist(); await tick(40);
const pulled = read(wS, 'store_state_v1').list.map(i => i.name);
check('the union sync skips trip parents and takes what is under them', !pulled.some(n => /walk shop|car shop/.test(n)) && pulled.includes('rice'),
  pulled.join(', '));

/* Moving an item between trips: Todoist's move, drawn first, put back on failure. */
wS.Shell.go('store'); wS.STORE.go('trips'); await tick(80);
const before = wS.STORE.tripsState();
check('the trips screen lists each trip with its items', before && before.trips.length >= 2 && before.trips.some(t => t.items.some(i => i.id === 't1')));
calls.length = 0;
await wS.STORE.moveItem('t2', 'trip:p0');
check('a loose item moves onto a trip with Todoist\'s move', calls.some(c => /\/tasks\/t2\/move/.test(c.u) && c.body.parent_id === 'p0') &&
  wS.STORE.tripsState().trips.find(t => t.id === 'p0').items.some(i => i.id === 't2'));
failMove = true;
await wS.STORE.moveItem('t1', 'loose');
check('a move that fails is put back exactly', wS.STORE.tripsState().trips.find(t => t.id === 'p0').items.some(i => i.id === 't1') &&
  !wS.STORE.tripsState().loose.some(i => i.id === 't1'));
failMove = false;
fetchScript = async () => ({ ok: false, status: 599, json: async () => ({}), text: async () => '' });

w.Shell.go('store'); S.openRecipe('grilled_cheese');
click(w, $('.ns-store [data-sact="cooked"]'));
check('"cooked it" is remembered for the day', S.cookedOn(T).includes('grilled cheese'));
check('… and the evening export lists it under meals', /- cooked: grilled cheese/.test(TD.exportMd(T)));
S.openRecipe('rice_red');
click(w, $('.ns-store [data-sact="timer"][data-i="1"]'));
check('a step timer runs on the wall clock', !!read(w, 'store_state_v1').timers['rice_red|1']);
const sr = read(w, 'store_state_v1'); sr.timers['rice_red|1'] = Date.now() - 5; w.localStorage.setItem('store_state_v1', JSON.stringify(sr));
const wT = await boot({ store_state_v1: sr });
await tick(1200);
check('… finishes after a reload too, and lets go', !Object.keys(read(wT, 'store_state_v1').timers || {}).length);

/* ══ 13. Settings: the editors keep identities ═══════════════════════════ */
w.SET.panel('today');
check('the TODAY panel paints its fields from what the app uses', $('.ns-set [data-cfg="today.anchors"][data-sub="wake"]').value === '06:00' &&
  $('.ns-set select[data-cfg="today.anchors"][data-sub="dayEnds"]').value === '00:00');
const lbl = $('.ns-set [data-group="today.chain"] .ed-card[data-key="gym"] [data-field="label"]');
lbl.value = 'the gym'; lbl.dispatchEvent(new w.Event('input', { bubbles: true }));
check('renaming a chain step keeps its key, so its ticks stay', w.Config.get('today.chain').find(s => s.key === 'gym').label === 'the gym' &&
  TD.stepState('gym').src === 'gym' && TD.stepState('gym').v !== '');
click(w, $('.ns-set [data-group="today.chain"] [data-ed="up:2"]'));
check('the arrows reorder the chain', w.Config.get('today.chain').map(s => s.key).join(',') === 'wake,gym,walk,shower,cap');
w.Config.reset('today.chain');
click(w, $('.ns-set [data-act="exp"][data-k="dump"]'));
check('an export section switch writes the setting', w.Config.get('today.export').dump === false);
w.Config.reset('today.export');
w.SET.panel('store');
const ingTa = $('.ns-set [data-group="store.recipes"] .ed-card[data-key="soupe"] [data-field="ing"]');
check('a recipe\'s ingredients read as one line each', /^2 tbsp \| olive oil$/m.test(ingTa.value) &&
  /^1 \| aubergine \| optional \| optional — or another courgette$/m.test(ingTa.value) && /^1 tsp \| herbes de provence \| pantry$/m.test(ingTa.value), ingTa.value);
ingTa.value = ingTa.value + '\n½ | lemon | optional, zest only\nlime | optional';
ingTa.dispatchEvent(new w.Event('input', { bubbles: true }));
const soupIng = w.Config.get('store.recipes').find(r => r.key === 'soupe').ing;
check('… and read back the same, plus what was typed', soupIng.some(i => i.n === 'lemon' && i.q === 0.5 && i.opt && i.note === 'zest only') &&
  soupIng.some(i => i.n === 'lime' && i.opt && !i.u) && soupIng.find(i => i.n === 'olive oil').q === 2 && soupIng.find(i => i.n === 'olive oil').u === 'tbsp',
  JSON.stringify(soupIng.slice(-2)));
w.Config.reset('store.recipes');
w.SET.panel('gym');
const setsIn = $('.ns-set [data-group="gym.days"] .ed-ex[data-ex="squat"] [data-x="sets"]');
setsIn.value = '4'; setsIn.dispatchEvent(new w.Event('input', { bubbles: true }));
check('an exercise edited in the program keeps its key and its history', w.Config.get('gym.days')[0].exercises.find(e => e.key === 'squat').sets === 4 &&
  w.GYM.shouldProgress('squat') === false);
w.Config.reset('gym.days');

/* ══ 14. Sync: the two new records travel, and merge rather than overwrite ══ */
const M = w.SYNC._merge;
const gm = M.mergeGym({ sessions: [{ id: 'a', date: Y, endedAt: 1 }], live: null },
                      { sessions: [{ id: 'b', date: T, endedAt: 2 }, { id: 'a', date: Y, endedAt: 5, ex: [1] }], live: null });
check('GYM sessions union by id; the copy finished later wins', gm.out.sessions.length === 2 && gm.out.sessions[0].endedAt === 5);
const tm = M.mergeToday({ days: { [T]: { goals: [{ id: 'x', text: 'a', done: false }], chain: { wake: { v: 'full' } }, hyg: {}, prep: {} } }, weeks: {} },
                        { days: { [T]: { goals: [{ id: 'x', text: 'a', done: true }, { id: 'y', text: 'b' }], chain: { walk: { v: 'min' } }, hyg: { shower: '07:00' }, prep: {} } }, weeks: {} });
check('TODAY days are put together: goals by id, ticks by key', tm.out.days[T].goals.length === 2 && tm.out.days[T].goals[0].done &&
  tm.out.days[T].chain.wake && tm.out.days[T].chain.walk && tm.out.days[T].hyg.shower);
check('TODAY is private: not on the Todoist route while safe transfer is on, but in the file', !w.SYNC.carries('todoist', 'today_v1') && w.SYNC.carries('file', 'today_v1'));
check('GYM travels on either route', w.SYNC.carries('todoist', 'gym_v1') && w.SYNC.carries('file', 'gym_v1'));
check('qurOS\'s look is the style group', w.SYNC.groupOf('quros_prefs_v1') === 'style');

/* ══ 15. A root install, opened as qurOS ═════════════════════════════════ */
const rootPrefs = { apps: ['do', 'log', 'store', 'tend', 'track', 'learn', 'create', 'tools'], appsSeen: ['do', 'log', 'plan', 'store', 'tend', 'track', 'learn', 'cal', 'create', 'tools'],
                    theme: 'ember', startTab: 'log' };
const wRoot = await boot({ root_prefs_v1: rootPrefs, root_tab: 'store' });
check('the first boot takes root\'s look', wRoot.Prefs.get('theme') === 'ember');
check('… root\'s bar, with TODAY and GYM arriving where they ship', wRoot.Prefs.get('apps').join(',') === 'today,do,log,gym,store,tend,track,learn,create,tools',
  wRoot.Prefs.get('apps').join(','));
check('… and opens on TODAY, not on root\'s last tab or start tab', wRoot.Shell.TABS[0] === 'today' &&
  wRoot.document.querySelector('.tab-b.on')?.dataset.app === 'today');
check('… without writing a byte of root\'s record', JSON.stringify(read(wRoot, 'root_prefs_v1')) === JSON.stringify(rootPrefs));
wRoot.Prefs.set('theme', 'frost');
check('from then on the two looks are independent', read(wRoot, 'root_prefs_v1').theme === 'ember' && read(wRoot, 'quros_prefs_v1').theme === 'frost');

/* ══ 16. Search reaches the new things ════════════════════════════════════ */
const hits = q => w.SEARCH.results ? w.SEARCH.results(q) : [];
check('search finds a recipe, an exercise and a chain step', [['burritos', /recipe/], ['lat pulldown', /exercise/], ['shower chain', /chain step/]]
  .every(([q, re]) => hits(q).some(r => re.test(r.sub || ''))), JSON.stringify(hits('burritos').map(r => r.sub)));

/* ══ end ═════════════════════════════════════════════════════════════════ */
check('no errors anywhere in the run', w.__errors.length === 0 && wS.__errors.length === 0 && w2.__errors.length === 0 && wRoot.__errors.length === 0,
  [].concat(w.__errors, wS.__errors, w2.__errors, wRoot.__errors).slice(0, 4).join(' | '));
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
