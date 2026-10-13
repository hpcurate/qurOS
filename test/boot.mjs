// A fast boot check: load the real page in jsdom, report every error, and
// print what TODAY and GYM drew. Seconds, not the harness's minutes — for
// iteration only; the harness is the validation.
//   node test/boot.mjs [path-to-app]
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
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.detail?.message || e.message) + (e.detail?.stack ? '\n' + e.detail.stack.split('\n').slice(0, 4).join('\n') : '')));
vc.on('error', (...a) => errors.push('console.error: ' + a.map(x => (x && x.stack) || String(x)).join(' ')));
const dom = new JSDOM(html, {
  url: 'http://localhost/root/index.html', runScripts: 'dangerously', resources: new LocalLoader(),
  pretendToBeVisual: true, virtualConsole: vc,
  beforeParse(w) {
    w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {} });
    w.requestAnimationFrame = fn => setTimeout(fn, 0);
    w.Element.prototype.scrollIntoView = function () {};
    w.fetch = async () => ({ ok: false, status: 599, json: async () => ({}), text: async () => '' });
  },
});
const w = dom.window;
await new Promise(r => w.addEventListener('load', r));
await new Promise(r => setTimeout(r, 80));
const txt = sel => (w.document.querySelector(sel)?.textContent || '').replace(/\s+/g, ' ').trim();
console.log('modules:', ['Prefs','Config','Shell','TODAY','GYM','TOOLS','DO','LOG','STORE','SET','SEARCH'].map(k => k + (w[k] ? '✓' : '✗')).join(' '));
console.log('tabs:', w.Shell.TABS.join(' '));
console.log('TODAY home:', txt('.ns-today #ty-home').slice(0, 400));
console.log('GYM home:', txt('.ns-gym #gy-home').slice(0, 300));
for (const p of w.SET.PANELS) w.SET.panel(p);
const eds = w.document.querySelectorAll('.ns-set [data-group]').length;
console.log('settings panels:', w.SET.PANELS.length, '· editors drawn in the last panel pass:', eds);
for (const a of w.Shell.TABS) { w.Shell.go(a); }
for (const s of ['week', 'hyg', 'eve', 'dump', 'home']) w.TODAY.go(s);
w.Shell.go('store'); w.STORE.go('meals'); w.STORE.openRecipe('burritos');
console.log('recipe:', txt('.ns-store #recipe-body').slice(0, 300));
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
process.exit(errors.length ? 1 : 0);
