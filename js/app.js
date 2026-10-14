/* qurOS — boot, the tab bar, and the offline shell. */
(() => {
const Q = window.Q, { $, $$, icon } = Q.u;
Q.VERSION = '2.0.0';

const TABS = [
  { id: 'dump', label: 'dump', icon: 'wave', ui: () => Q.dump },
  { id: 'day', label: 'day', icon: 'day', ui: () => Q.day },
  { id: 'map', label: 'map', icon: 'map', ui: () => Q.mapUI },
  { id: 'send', label: 'send', icon: 'send', ui: () => Q.send },
];
let tab = 'dump';

function show(id) {
  if (!TABS.some(t => t.id === id)) id = 'dump';
  tab = id;
  $$('.view').forEach(v => v.classList.toggle('on', v.dataset.tab === id));
  $$('#bar button').forEach(b => { const on = b.dataset.tab === id; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'page' : 'false'); });
  try { sessionStorage.setItem('qos_tab', id); } catch {}
  render(id);
}
const render = id => { const t = TABS.find(x => x.id === id); if (t) t.ui().render(); };
function refresh() { render(tab); badge(); }
function badge() {
  const b = $('#bar [data-tab="send"] .badge');
  if (!b) return;
  const n = Q.send.unsentCount();
  b.textContent = n > 99 ? '99+' : n;
  b.hidden = !n;
}
function applyAccent() {
  const a = Q.settings.get().accent;
  document.documentElement.style.setProperty('--y', a);
  const m = $('meta[name="theme-color"]');
  if (m) m.content = '#0e0e0e';
}

function buildBar() {
  $('#bar').innerHTML = TABS.map(t => `<button type="button" data-tab="${t.id}" aria-label="${t.label}">${icon(t.icon)}<span>${t.label}</span>${t.id === 'send' ? '<i class="badge" hidden></i>' : ''}</button>`).join('');
  $('#bar').addEventListener('click', e => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    if (b.dataset.tab === tab) { const v = $(`.view[data-tab="${tab}"]`); if (v) v.scrollTo({ top: 0, behavior: 'smooth' }); }
    show(b.dataset.tab);
  });
}

function wire() {
  const views = $('#views');
  views.addEventListener('click', e => {
    const v = e.target.closest('.view');
    if (!v) return;
    const t = TABS.find(x => x.id === v.dataset.tab);
    if (t) t.ui().onClick(e);
  });
  views.addEventListener('change', e => { if (Q.day.onChange) Q.day.onChange(e); Q.send.onChange(e); });
  views.addEventListener('keydown', e => Q.day.onKey(e));
  /* the day turns over while the app sits open */
  let lastDay = Q.u.today();
  setInterval(() => { const d = Q.u.today(); if (d !== lastDay) { lastDay = d; if (Q.day.cur() < d) Q.day.go(d); refresh(); } }, 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && !Q.rec.isOpen()) refresh(); });
  Q.settings.on(() => { if (!Q.rec.isOpen()) badge(); });
}

/* ── the offline shell ── a new version installs in the background and
   takes over on the next start; never mid-dump */
function registerSW() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      if (!w) return;
      w.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) {
          Q.ui.toast('a new version is ready', { action: 'reload', ms: 12000, run: () => {
            if (Q.rec.isOpen()) { Q.ui.toast('finish the dump first'); return; }
            w.postMessage('skip');
          } });
        }
      });
    });
  }).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded || Q.rec.isOpen()) return;
    reloaded = true;
    location.reload();
  });
}

async function boot() {
  applyAccent();
  buildBar();
  wire();
  await Q.db.init();
  let start = 'dump';
  try { start = sessionStorage.getItem('qos_tab') || 'dump'; } catch {}
  show(start);
  badge();
  /* home-screen shortcuts: ./?go=talk | write | day */
  const go = new URLSearchParams(location.search).get('go');
  if (go === 'talk') Q.rec.ready({});
  else if (go === 'write') Q.rec.write({});
  else if (go && TABS.some(t => t.id === go)) show(go);
  if (go) try { history.replaceState(null, '', location.pathname); } catch {}
  if (!go) setTimeout(() => Q.dump.offerRecovery(), 300);
  registerSW();
  document.documentElement.classList.add('ready');
}

Q.app = { show, refresh, badge, applyAccent, tab: () => tab, boot };
if (!window.__QOS_NO_BOOT) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
}
})();
