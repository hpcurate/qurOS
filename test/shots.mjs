/* qurOS — screenshots of every screen in headless Chrome at phone size, for
   the visual check jsdom cannot do. Not part of the site.
     node shots.mjs [outDir]        (default: test/shots/, git-ignored)
   Serves the app on localhost, fakes the mic and the wake lock (headless has
   neither), seeds a few days of records, and drives the UI through the
   DevTools protocol — Node's own WebSocket, no dependencies. Set CHROME to
   the browser's path if it is not in the usual place. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, 'test', 'shots'));
fs.mkdirSync(OUT, { recursive: true });
const CHROME = process.env.CHROME || ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => fs.existsSync(p));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html');
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(0);
const PORT = server.address().port;

const profile = fs.mkdtempSync(path.join(process.env.TEMP || '/tmp', 'qos-shots-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run',
  '--hide-scrollbars', '--mute-audio', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((res, rej) => {
  let buf = '';
  chrome.stderr.on('data', d => { buf += d; const m = /DevTools listening on (ws:\S+)/.exec(buf); if (m) res(m[1]); });
  setTimeout(() => rej(new Error('chrome did not start')), 15000);
});
const port = new URL(wsUrl).port;
const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const page = targets.find(t => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let seq = 0;
const waits = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && waits.has(m.id)) { waits.get(m.id)(m); waits.delete(m.id); } });
const send = (method, params = {}) => new Promise(r => { const id = ++seq; waits.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function js(expr) {
  const r = await send('Runtime.evaluate', { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true });
  if (r.result && r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 600));
  return r.result && r.result.result && r.result.result.value;
}
async function shot(name) {
  await sleep(450);
  const r = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(r.result.data, 'base64'));
  console.log('  ' + name);
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 412, height: 915, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
  window.__errs = [];
  addEventListener('error', e => __errs.push(e.message));
  addEventListener('unhandledrejection', e => __errs.push(String(e.reason)));
  window.webkitSpeechRecognition = class {
    constructor() { window.__sr = this; this.results = []; }
    start() { setTimeout(() => this.onstart && this.onstart(), 0); }
    stop() { setTimeout(() => this.onend && this.onend(), 0); }
    abort() { this.onend && this.onend(); }
    say(t, fin) { const r = Object.assign([{ transcript: t }], { isFinal: fin }); const i = this.results.filter(x => x.isFinal).length;
      this.results = this.results.filter(x => x.isFinal).concat([r]); this.onresult && this.onresult({ resultIndex: i, results: this.results }); }
  };
  window.SpeechRecognition = window.webkitSpeechRecognition;
  Object.defineProperty(navigator, 'wakeLock', { value: { request: async () => { const s = new EventTarget(); s.release = async () => {}; return s; } } });
` });
await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/index.html` });
await sleep(1500);
await js(`localStorage.clear(); indexedDB.deleteDatabase('qurOS'); sessionStorage.clear();`);
await send('Page.reload');
await sleep(1500);

console.log('screens →', OUT);
await shot('01-dump-empty');

/* seed: a map, three days, a few dumps */
await js(`
  const Q = window.Q, t = Q.u.today(), D = n => Q.u.addDays(t, n), at = (d, h, m) => new Date(d + 'T' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':00').getTime();
  Q.m.loadMapText(Q.m.STARTER);
  Q.m.setItemState('now/how-my-days-actually-go-at-the-moment', 'done');
  Q.m.setItemState('now/what-is-weighing-on-me-this-month', 'partial');
  const sec = Q.m.sections()[0];
  Q.m.saveEntry({ id: 'e1', kind: 'dump', topic: Q.m.topicFor(sec, sec.items[1]), at: at(t, 7, 12), secs: 734, src: 'voice', lang: 'en-GB',
    text: 'Okay so this month the main thing is the CAP. I keep looking at the whole thing instead of the next chapter and then I freeze.\\n\\nThe walk helps. Kamo was pulling the whole time but it is easier to think out loud.' });
  Q.m.saveEntry({ id: 'e2', kind: 'dump', topic: null, at: at(t, 12, 40), secs: 95, src: 'voice', text: 'Note for later: ask about the internship dates in January and whether I can start on a Monday.' });
  Q.m.saveEntry({ id: 'e3', kind: 'evening', topic: null, at: at(D(-1), 22, 5), secs: 260, src: 'mixed', text: 'Good day. Gym was easier than I thought. Bed by eleven.' });
  const y = Q.m.day(D(-1)); y.wake = '06:20'; y.bed = '23:05'; y.chain = { wake: 'min', walk: 'full', gym: 'full', shower: 'full', cap: 'full' };
  y.gym = { plan: 'A', warm: true, ex: Q.settings.get().program.A.map(p => ({ name: p.name, unit: p.unit, lo: p.lo, hi: p.hi, sets: [0,1,2].map(() => ({ w: p.unit === 's' ? '' : '40', r: String(p.hi), done: true })) })) };
  y.focus = { CAP: 3, music: 1 }; Q.m.saveDay(y);
  const d = Q.m.day(t); d.wake = '06:05'; d.chain = { wake: 'full', walk: 'full' }; d.focus = { CAP: 1 }; d.scales = { mood: 3, energy: 4 };
  d.hyg = { shower: true, teeth: true }; d.goals = [{ id: 'g1', text: '1 pomodoro on CAP chapter 1', state: 'done' }, { id: 'g2', text: 'call the bank about the card', state: 'open' }];
  d.meals = [{ id: 'm1', slot: 'breakfast', text: 'oats + banana' }]; Q.m.saveDay(d);
  Q.m.setWeekGoals(Q.u.weekKey(t), [{ id: 'w1', text: 'three gym sessions', done: false }]);
  Q.app.show('dump'); Q.app.refresh();
`);
await shot('02-dump');
await js(`document.querySelector('#v-dump').scrollTop = 520;`);
await shot('03-dump-list');

/* the recorder */
await js(`document.querySelector('#v-dump').scrollTop = 0; Q.rec.talk({ topic: Q.m.topicFor(Q.m.sections()[1], Q.m.sections()[1].items[0]) });`);
await sleep(300);
await js(`__sr.say('i have been sleeping badly since the clocks changed', true); __sr.say('mostly because i look at my phone', false);`);
await shot('04-rec-locked');
await js(`const k = document.querySelector('.rec-track'); k.style.setProperty('--p', .55); document.querySelector('.rec-knob').style.transform = 'translateX(165px)';`);
await shot('05-rec-sliding');
await js(`document.querySelector('.rec-track').style.removeProperty('--p'); document.querySelector('.rec-knob').style.transform = ''; Q.rec.unlock();`);
await js(`__sr.say('mostly because i look at my phone in bed new paragraph and coffee after four', true);`);
await shot('06-rec-unlocked');
await js(`Q.rec.lock(); document.querySelector('#rec').classList.add('dim');`);
await shot('07-rec-dimmed');
await js(`document.querySelector('#rec').classList.remove('dim'); Q.rec.unlock(); Q.rec.toggleVoice();`);
await sleep(300);
await shot('08-rec-paused');
await js(`await Q.rec.done();`);
await sleep(300);
await shot('09-after-save');

await js(`Q.rec.talk({ kind: 'evening' }); `);
await sleep(200);
await js(`__sr.say('good day overall', true);`);
await shot('10-rec-evening-locked');
await js(`Q.rec.unlock(); Q.rec.discard();`);
await sleep(300);
await js(`document.querySelector('.sheet [data-ok]').click();`);
await sleep(300);

await js(`Q.rec.write({});`);
await sleep(300);
await js(`const t = document.querySelector('.rec-text'); t.value = 'Writing with the keyboard mic works too.'; t.dispatchEvent(new Event('input', { bubbles: true })); t.blur();`);
await shot('11-rec-write');
await js(`await Q.rec.done();`);
await sleep(300);

/* day */
await js(`Q.app.show('day'); document.querySelector('#v-day').scrollTop = 0;`);
await shot('12-day');
await js(`document.querySelector('#v-day').scrollTop = 700;`);
await shot('13-day-mid');
await js(`document.querySelector('#v-day').scrollTop = 1500;`);
await shot('14-day-low');
await js(`document.querySelector('#v-day').scrollTop = 99999;`);
await shot('15-day-end');
await js(`document.querySelector('#v-day').scrollTop = 0; document.querySelector('#v-day [data-a="bad"]').click();`);
await shot('16-day-bad');
await js(`document.querySelector('#v-day [data-a="bad"]').click();`);

/* gym */
await js(`Q.gym.open(Q.u.today());`);
await sleep(400);
await js(`document.querySelector('[data-screen="gym"] [data-g="set"]').click();`);
await shot('17-gym');
await js(`Q.ui.closeLayer('screen:gym');`);
await sleep(300);

/* map, send, settings */
await js(`Q.app.show('map'); document.querySelector('#v-map').scrollTop = 0;`);
await shot('18-map');
await js(`document.querySelector('#v-map').scrollTop = 600;`);
await shot('19-map-sections');
await js(`Q.app.show('send'); document.querySelector('#v-send').scrollTop = 0;`);
await shot('20-send');
await js(`document.querySelector('#v-send').scrollTop = 560;`);
await shot('21-send-preview');
await js(`Q.dump.pickTopic(null, 'dump', () => {});`);
await sleep(300);
await shot('22-topic-picker');
await js(`Q.ui.closeLayer(Q.ui.layers().pop());`);
await sleep(300);
await js(`Q.settingsUI.open();`);
await sleep(400);
await shot('23-settings');
await js(`document.querySelector('[data-screen="settings"] .scr-b').scrollTop = 1400;`);
await shot('24-settings-lists');
await js(`Q.ui.closeLayer('screen:settings'); Q.app.show('dump'); Q.dump.openEntry('e1');`);
await sleep(400);
await shot('25-entry');

const errs = await js(`return (window.__errs || []).join('\\n')`);
if (errs) console.log('page errors:\n' + errs);
ws.close();
chrome.kill();
server.close();
setTimeout(() => { try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(0); }, 500);
