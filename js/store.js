/* STORE: groceries, spending, meals, trips and add-only Todoist union sync.
   Storage: store_state_v1, with a one-time migration from eat_state_v1. */
window.STORE = (function () {
'use strict';

const SCOPE = '.ns-store ';
const view  = document.querySelector('#view-store .view-body');
const $id   = id  => document.querySelector(SCOPE + '#' + id);
const $all  = sel => document.querySelectorAll(SCOPE + sel);
const toast = msg => Shell.toast(msg);

/* Content
   The aisles and the premade meals used to be two literals here. They live in
   js/config.js now and are edited from Settings → content. Read once into
   module bindings — every render touches them repeatedly — and refreshed
   whenever an edit lands.

   `manual` is load-bearing: anything the categoriser cannot place goes there,
   so the editor pins it and this module falls back to it defensively. */
let CATEGORIES = Config.get('store.categories');
let MEALS      = Config.get('store.meals');

/* The currency mark is a preference, not a constant — STORE was hardcoded to €
   in nine places. */
const CUR = () => Prefs.get('currency') || '€';

// Categorisation
/* Extra vocabulary on top of the CATEGORIES item lists: synonyms, plurals the
   stemmer won't reach, brands, and French names (the item lists already mix in
   "porc", "origan", "creme fraiche"). Multi-word terms win over single words,
   so "orange juice" lands in drinks rather than fruits. */
const CAT_WORDS = {
  vegetables: ['cherry tomato','sweet potato','spring onion','green onion','green bean','bell pepper',
    'courgette','aubergine','eggplant','capsicum','poivron','courge','lettuce','salad','salade','laitue',
    'cucumber','concombre','mushroom','champignon','leek','poireau','celery','celeri','cabbage','chou',
    'cauliflower','ginger','gingembre','radish','radis','beetroot','betterave','pumpkin','potiron',
    'asparagus','asperge','artichoke','artichaut','kale','arugula','rocket','roquette','turnip','navet',
    'endive','fennel','fenouil','squash','carotte','oignon','ail','echalote','epinard','pomme de terre',
    'haricot vert','brocoli','broccoli','zucchini','tomatoes','patate'],
  fruits: ['orange','lemon','citron','lime','grape','raisin','strawberry','fraise','raspberry','framboise',
    'blueberry','myrtille','blackberry','mure','cherry','cerise','pear','poire','pineapple','ananas',
    'mango','mangue','melon','watermelon','pasteque','apricot','abricot','plum','prune','fig','figue',
    'grapefruit','pamplemousse','clementine','mandarin','nectarine','papaya','passion fruit',
    'pomegranate','grenade','coconut','date','berry','berries','pomme','banane','peche','fruit'],
  meats: ['pork','boeuf','poulet','canard','poisson','oeuf','oeufs','turkey','dinde','lamb','agneau',
    'veal','veau','bacon','lardons','sausage','saucisse','merguez','ham','jambon','mince','ground beef',
    'hache','steak','salami','chorizo','prosciutto','pancetta','shrimp','crevette','prawn','scampi',
    'mussels','moules','scallop','coquille','liver','foie','meatball','boulette','nugget','schnitzel',
    'escalope','filet','breast','thigh','cuisse','ribs','brisket','tuna','thon','trout','truite',
    'seabass','bar','dorade','crab','crabe','lobster','homard','chicken breast'],
  snacks: ['crisps','biscuit','cookie','candy','bonbon','sweets','popcorn','pretzel','cracker','tuc',
    'granola bar','protein bar','gummy','haribo','oreo','pringles','doritos','lays','kinder',
    'chocolate bar','chocolat','snack','speculoos','madeleine','gaufre','waffle','donut','beignet',
    'cake','gateau','tarte','pie','muffin','crepe','biscotte','nachos','tortilla chips','peanuts',
    'cashew','almond','amande','pistachio','pistache','noisette','hazelnut','trail mix','dried fruit'],
  carbs: ['spaghetti','penne','fusilli','tagliatelle','linguine','farfalle','lasagna','lasagne','macaroni',
    'pate','pates','noodle','nouille','riz','pain','wrap','couscous','quinoa','bulgur','polenta','gnocchi',
    'flour','farine','pita','naan','bun','roll','toast','semolina','semoule','vermicelli','udon','soba',
    'orzo','risotto','sandwich bread','pain de mie','ciabatta','focaccia','crouton','breadcrumb',
    'chapelure','pizza dough','pate a pizza','puff pastry','pate feuilletee'],
  cans: ['canned','tinned','conserve','passata','coulis','concentre','puree','tomato paste','petit pois',
    'pois chiche','chickpea','haricot rouge','kidney bean','white bean','haricot blanc','butter bean',
    'baked beans','lentille','mais','sweetcorn','coconut milk','lait de coco','olive','pickle',
    'cornichon','caper','capre','soup','soupe','broth','bouillon','stock','tomato sauce','sauce tomate',
    'sardine','anchovy','anchois','jackfruit','beans','bean'],
  dairy: ['milk','lait','cream','creme','parmesan','feta','brie','camembert','comte','emmental','chevre',
    'goat cheese','ricotta','mascarpone','cottage cheese','cheese','fromage','skyr','kefir','sour cream',
    'chantilly','whipped cream','raclette','halloumi','babybel','philadelphia','laughing cow',
    'vache qui rit','petit suisse','fromage blanc','mozzarella','yaourt','beurre','margarine','ghee',
    'oat milk','almond milk','soy milk','lait vegetal'],
  frozen: ['ice cream','glace','sorbet','sorbet','surgele','congele','gyoza','potsticker','spring roll',
    'nem','frozen','frites','fish stick','baton de poisson','frozen peas','frozen veg','crevettes surgelees'],
  breakfast: ['cereal','cereales','honey','miel','granola','croissant','pain au chocolat','pancake',
    'syrup','sirop','maple','erable','peanut butter','beurre de cacahuete','marmalade','marmelade',
    'confiture','nutella','cafe','espresso','instant coffee','coffee beans','capsule','dosette',
    'flocons','avoine','porridge','weetabix','corn flakes','chocapic','miel'],
  condiments: ['huile','oil','mayo','mayonnaise','vinegar','vinaigre','balsamic','balsamique','bbq sauce',
    'hot sauce','sriracha','tabasco','harissa','pesto','hummus','houmous','tahini','sauce','dressing',
    'vinaigrette','wasabi','salsa','guacamole','aioli','curry paste','fish sauce','nuoc mam',
    'oyster sauce','worcestershire','teriyaki','tzatziki','moutarde','sauce soja','soja','sweet and sour',
    'peanut sauce','tapenade','relish','horseradish','raifort',
    'huile olive','huile tournesol','huile sesame','huile coco','huile colza'],
  spices: ['oregano','cinnamon','cannelle','nutmeg','muscade','turmeric','curcuma','chili powder',
    'cayenne','thyme','thym','rosemary','romarin','basil','basilic','bay leaf','laurier','coriander',
    'coriandre','parsley','persil','dill','aneth','mint','menthe','sesame seed','graines de sesame',
    'vanilla','vanille','saffron','safran','herbes de provence','ras el hanout','zaatar','sumac',
    'five spice','garam masala','spice','epice','seasoning','assaisonnement','stock cube','cube bouillon',
    'sel','poivre','black pepper','peppercorn','baking powder','levure','sugar','sucre','cardamom',
    'clove','girofle','fenugreek','anise','anis'],
  drinks: ['water','eau','sparkling','petillante','cola','coke','pepsi','sprite','fanta','soda','lemonade',
    'limonade','tonic','juice','jus','beer','biere','wine','vin','rose','champagne','prosecco','cider',
    'cidre','whisky','whiskey','vodka','rum','rhum','gin','tequila','aperol','spritz','martini','porto',
    'energy drink','smoothie','milkshake','tea','the','kombucha','iced tea','perrier','san pellegrino',
    'evian','badoit','orangina','schweppes','oasis','tropicana','coconut water',
    'jus orange','jus pomme','jus raisin','jus fruit','jus ananas'],
};

/* Plural stripping, deliberately shallow — it runs on both the query and the
   vocabulary, so it only has to be self-consistent, not linguistically right. */
function stem(w) {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && /(ches|shes|sses|xes)$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !/(ss|us|is)$/.test(w)) return w.slice(0, -1);
  return w;
}
/* Single letters are dropped so French elisions collapse: "huile d'olive"
   and "jus d'orange" tokenise the same as the phrases stored below. */
function stemTokens(s) {
  return tdKey(s).split(' ').filter(w => w.length > 1).map(stem);
}

/* Vocabulary is built once: every known item plus every keyword above, each
   pre-stemmed into tokens. Items get a small edge over keywords on a tie. */
let VOCAB = null;
function vocab() {
  if (VOCAB) return VOCAB;
  VOCAB = [];
  const add = (list, cat, bonus) => list.forEach(i => {
    const t = stemTokens(i);
    if (t.length) VOCAB.push({ t, cat, bonus });
  });
  for (const [cat, def] of Object.entries(CATEGORIES)) {
    if (cat !== 'manual') add(def.items, cat, 3);
  }
  for (const [cat, words] of Object.entries(CAT_WORDS)) add(words, cat, 0);
  return VOCAB;
}

function lev(a, b, cap) {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < best) best = cur[j];
    }
    if (best > cap) return cap + 1;
    prev = cur;
  }
  return prev[b.length];
}
function fuzzyCap(w) { return w.length >= 8 ? 2 : w.length >= 5 ? 1 : 0; }

/* Is `t` a run of consecutive tokens inside `n`? Returns the match position. */
function phraseAt(n, t) {
  outer:
  for (let i = 0; i + t.length <= n.length; i++) {
    for (let j = 0; j < t.length; j++) if (n[i + j] !== t[j]) continue outer;
    return i;
  }
  return -1;
}

/* Scores every vocabulary entry against the name and returns the best category.
   Later tokens score slightly higher, so "cherry tomatoes" reads as a tomato
   and "tomato soup" reads as a soup — English puts the head noun last. */
function classify(raw) {
  const learned = (state.learned || {})[tdKey(raw)];
  if (learned && CATEGORIES[learned]) return { cat: learned, score: 999, why: 'learned' };
  return classifyBase(raw);
}
function classifyBase(raw) {
  const n = stemTokens(raw);
  if (!n.length) return { cat: 'manual', score: 0 };

  let best = { cat: 'manual', score: 0 };
  for (const v of vocab()) {
    let score = 0;
    const at = phraseAt(n, v.t);
    if (at >= 0) {
      score = 50 + 40 * v.t.length          // longer phrases dominate
            + (at + v.t.length) * 10        // head-noun bias: later tokens win
            + (v.t.length === n.length ? 30 : 0)    // whole-name match
            + v.bonus;
    } else if (v.t.length === 1) {
      // typo tolerance, one token at a time — "chiken", "avacado", "yoghurt"
      for (let i = 0; i < n.length; i++) {
        const cap = fuzzyCap(n[i]);
        if (!cap) continue;
        const d = lev(n[i], v.t[0], cap);
        if (d <= cap) score = Math.max(score, 45 - d * 6 + i * 2 + v.bonus);
      }
    }
    if (score > best.score) best = { cat: v.cat, score };
  }
  return best.score >= 25 ? best : { cat: 'manual', score: best.score };
}

// State
const SK = 'store_state_v1';
const SK_LEGACY = 'eat_state_v1';   // pre-rename key — read once, then migrate
const TD_DEFAULTS = { token:'', project:'04|life', section:'home|groceries',
                      projectId:null, sectionId:null, lastSync:null };
let state = { cart:0, budget:0, cartLog:[], list:[], history:[], currentCat:null,
              cwPin:false, todoist: { ...TD_DEFAULTS }, learned: {} };

function loadState() {
  try {
    let raw = localStorage.getItem(SK);
    if (raw === null) {
      // first run after the EAT → STORE rename: adopt the old data, leave it in place
      const legacy = localStorage.getItem(SK_LEGACY);
      if (legacy !== null) { raw = legacy; localStorage.setItem(SK, legacy); }
    }
    if (raw) {
      const s = JSON.parse(raw);
      state = Object.assign(state, s);
      state.cart = Number(state.cart) || 0;
      state.budget = Number(state.budget) || 0;
      state.list = Array.isArray(state.list) ? state.list : [];
      state.history = Array.isArray(state.history) ? state.history : [];
      state.cartLog = Array.isArray(state.cartLog) ? state.cartLog : [];
    }
  } catch {}
  // nested defaults survive an older save that predates these blocks
  state.todoist = Object.assign({ ...TD_DEFAULTS }, state.todoist || {});
  if (!state.learned || typeof state.learned !== 'object') state.learned = {};
}
/* The Todoist key lives in Creds now; it is mirrored back into this app's own
   record on every write so the standalone eat/ app keeps working off it. */
function saveState() {
  state.todoist.token = Creds.token();
  localStorage.setItem(SK, JSON.stringify(state));
}

// Navigation
function go(id) {
  $all('.scr').forEach(s => s.classList.remove('on'));
  $id('s-' + id).classList.add('on');
  if (view) view.scrollTop = 0;
  if (id === 'home')     renderHome();
  if (id === 'items')    renderCategories();
  if (id === 'cat')      renderCategoryItems();
  if (id === 'meals')    { renderRecipes(); renderMeals(); }
  if (id === 'recipe')   renderRecipe();
  if (id === 'trips')    loadTrips();
  if (id === 'history')  renderHistory();
}

// Cart counter
const CART_LOG_MAX = 200;   // plenty for one shop, and keeps the save small

/* Every change to the cart is logged so you can look back at what you punched
   in. `note` carries the numpad's breakdown, e.g. "2.50 ×3". */
function addCart(amt, note) {
  const before = state.cart;
  state.cart = Math.max(0, Math.round((state.cart + amt) * 100) / 100);
  const applied = Math.round((state.cart - before) * 100) / 100;   // honours the clamp at 0
  if (applied !== 0) {
    state.cartLog.push({ a: applied, t: Date.now(), n: note || '' });
    if (state.cartLog.length > CART_LOG_MAX) state.cartLog.shift();
  }
  saveState(); renderCart();
}
function resetCart() {
  if (state.cart === 0 && !state.cartLog.length) { toast('cart already at 0'); return; }
  Shell.confirm(`Reset cart counter to ${CUR()}0.00?`, () => {
    /* What it was, held for as long as the undo pill is up. A trip's running
       total is the one number in here that cannot be worked out again from
       anything else, so zeroing it by accident is the expensive mistake. */
    const was = state.cart, log = state.cartLog.slice();
    state.cart = 0; state.cartLog = [];
    saveState(); renderCart();
    Shell.undo(`cart reset from ${CUR()}${was.toFixed(2)}`, () => {
      state.cart = was; state.cartLog = log;
      saveState(); renderCart();
    });
  });
}
/* The counter, pinned
   In a shop the running total is the number you keep glancing at, and the list
   you are ticking is long enough to scroll it off the top. Pinned, the widget
   sticks to the top of the page (position:sticky — sticky, not fixed, because
   fixed inside #track is forbidden, §3) and the list scrolls under it.

   The pin is on the widget itself rather than in settings: it is the kind of
   thing you switch on in the aisle and off at the till. */
function togglePin() {
  state.cwPin = !state.cwPin;
  saveState(); paintPin(); paintBand(); Prefs.tap();
  toast(state.cwPin ? 'counter pinned' : 'counter unpinned');
}
function paintPin() {
  const cw = $id('cw'), btn = $id('cw-pin');
  if (cw) cw.classList.toggle('pinned', !!state.cwPin);
  if (btn) {
    btn.classList.toggle('on', !!state.cwPin);
    btn.setAttribute('aria-pressed', state.cwPin ? 'true' : 'false');
    btn.setAttribute('aria-label', state.cwPin ? 'unpin the counter' : 'pin the counter to the top');
  }
}

/* The band's right end
   How much of the list is ticked, always; and what the trip has cost, only
   while the counter is pinned. Pinning is the signal that you are in a shop
   and the total is the number you keep glancing at, so that is exactly when it
   is worth the band's width — and when it is up there, the widget below stops
   drawing it (store.css) rather than showing it twice.

   The count and the cost share one flex end, so mounting the cost is what
   slides the count leftwards. Nothing tells it to move. */
/* What the band was last showing, so a repaint knows which way the number moved.
   Held here rather than read back off the element: the text carries a currency
   symbol and a fixed two decimals, and parsing a number back out of its own
   formatting to find out what it used to be is a way to be wrong later. `null`
   means "nothing has been shown yet", which is not a rise from zero. */
let costWas = null;
let costTimer = null;

/* The face
   One cell per character, so a digit that changes can flip on its own the way a
   departure board does, and — the part that is not decoration — so that every
   element on screen survives a repaint.

   Until 3.0 this was one `innerHTML =` per paint, which threw the currency mark
   away and built a new one. A replaced element has no previous value to
   transition from, so the mark *snapped* to green while the digits beside it
   eased into it over --dur-3: the same signal arriving twice at two different
   speeds, which is what reads as a rendering fault rather than as a total going
   up. The digits inherit their colour from .h-cost and follow its transition
   for free; the mark carries its own (it is the accent, deliberately), so the
   mark is the one node that must not be replaced. It is moved across a rebuild
   rather than recreated.

   Cells are rebuilt only when the number changes shape — 9.99 to 10.00. */
function costFace(el, text) {
  let cu = el.querySelector('.cu');
  if (!cu) { cu = document.createElement('span'); cu.className = 'cu'; }
  cu.textContent = CUR();
  /* The sign lives at the head of the row and is held across a rebuild for the
     same reason the mark is: it is the one node whose own animation is running
     while the number under it changes. */
  let sg = el.querySelector('.cs');
  if (!sg) { sg = document.createElement('span'); sg.className = 'cs'; sg.setAttribute('aria-hidden', 'true'); }

  const cells = [...el.querySelectorAll('.cd')];
  if (cells.length !== text.length) {
    while (el.firstChild) el.removeChild(el.firstChild);   // keeps `sg` and `cu`: both held above
    el.appendChild(sg);
    for (let i = 0; i < text.length; i++) {
      const c = document.createElement('span');
      c.className = 'cd';
      c.style.setProperty('--i', String(i));               // its place in the cascade
      c.textContent = text[i];
      el.appendChild(c);
    }
    el.appendChild(cu);
    return [...el.querySelectorAll('.cd')];
  }
  const changed = [];
  cells.forEach((c, i) => {
    if (c.textContent !== text[i]) { c.textContent = text[i]; changed.push(c); }
  });
  if (sg.parentNode !== el) el.insertBefore(sg, el.firstChild);
  if (cu.parentNode !== el) el.appendChild(cu);
  return changed;
}

/* Which way it went
   A `+` or a `−` at the head of the number, for as long as the flash used to
   last. It replaced the green/red: colour said "something happened" and left you
   to work out what from a hue, and on a total that is already the accent's
   shadow that was one colour too many. A sign says it.

   It grows the box leftwards — the row is `space-between` and the counter has the
   right end to itself — so the digits do not move when it appears. Nothing is
   reserved for it either: it is `display:none` between changes. */
function costSign(el, dir) {
  const sg = el.querySelector('.cs');
  if (!sg) return;
  sg.textContent = dir === 'up' ? '+' : '−';
  sg.classList.remove('on');
  void sg.offsetWidth;                       // restart rather than queue behind the last
  sg.classList.add('on');
}

/* Only the characters that actually changed flip: 4.50 -> 4.90 turns one card
   over, not four, which is the whole reason a board reads as fast as it does.
   Restarted rather than added to — keying in a price a digit at a time fires
   this several times a second — and the class comes off the lot in one reflow
   rather than one per cell. */
function costFlap(cells) {
  if (!cells.length) return;
  cells.forEach(c => c.classList.remove('flap'));
  void cells[0].offsetWidth;
  cells.forEach(c => c.classList.add('flap'));
}

function paintBand() {
  const cnt = $id('store-count');
  if (cnt) {
    const total = state.list.length;
    const checked = state.list.filter(i => i.checked).length;
    cnt.textContent = total ? `${checked}/${total} ${total === 1 ? 'item' : 'items'}` : '';
  }
  const cost = $id('store-cost');
  if (!cost) return;
  const on = !!state.cwPin;
  const wasOn = !cost.classList.contains('hidden');
  cost.classList.toggle('hidden', !on);
  if (!on) { costWas = null; return; }        // unpinned: the next mount is a first paint

  const now = +state.cart || 0;
  const changed = costFace(cost, now.toFixed(2));

  /* Arriving is not a change. Pinning the counter mid-trip would otherwise
     flash green for the whole basket, which says "you just spent forty euros"
     about money that was already spent. The mount animation carries the number
     in, so the cells do not also flip: two entrances at once is neither. */
  if (!wasOn || costWas === null) {
    cost.classList.remove('up', 'down');
    cost.classList.remove('mount'); void cost.offsetWidth; cost.classList.add('mount');
    costWas = now;
    return;
  }
  if (now === costWas) return;
  costFlap(changed);

  /* Which way it went, said with a sign rather than a colour. The class still
     carries the direction — it drives the nudge, and it is what tells the sign
     which glyph to wear — and is dropped after the run. Restarted rather than
     added to: keying in a price a digit at a time fires this several times a
     second, and each one must replace the last rather than queue behind it. */
  const dir = now > costWas ? 'up' : 'down';
  costWas = now;
  cost.classList.remove('up', 'down', 'mount');
  void cost.offsetWidth;
  cost.classList.add(dir);
  costSign(cost, dir);
  clearTimeout(costTimer);
  costTimer = setTimeout(() => {
    cost.classList.remove('up', 'down');
    const sg = cost.querySelector('.cs');
    if (sg) sg.classList.remove('on');
  }, 900);
}

function renderCart() {
  paintPin();
  paintBand();
  $id('cw-cart').textContent = state.cart.toFixed(2);
  $all('.cu').forEach(el => { el.textContent = CUR(); });
  const logBtn = $id('cw-log-btn');
  if (logBtn) logBtn.textContent = state.cartLog.length ? `history ${state.cartLog.length}` : 'history';
  const bud = state.budget;
  const budEl = $id('cw-budget');
  const fill = $id('cw-fill');
  if (bud > 0) {
    const pct = Math.min(100, (state.cart / bud) * 100);
    fill.style.width = pct + '%';
    fill.style.background = colorFromPct(pct);
    const over = state.cart > bud;
    budEl.innerHTML = over
      ? `<span class="b-line over">over by ${CUR()}${(state.cart - bud).toFixed(2)}</span><span class="b-line">/ ${CUR()}${bud.toFixed(2)}</span>`
      : `<span class="b-line"><em>${CUR()}${(bud - state.cart).toFixed(2)}</em> left</span><span class="b-line">/ ${CUR()}${bud.toFixed(2)}</span>`;
  } else {
    fill.style.width = '0%';
    budEl.textContent = 'no budget set';
  }
}

// Cart log
function openCartLog() {
  renderCartLog();
  $id('clog-back').classList.add('on');
  $id('clog').classList.add('on');
}
function closeCartLog() {
  $id('clog-back').classList.remove('on');
  $id('clog').classList.remove('on');
}
function fmtClock(ts) {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function renderCartLog() {
  const log = state.cartLog;
  const n = log.length;
  $id('clog-count').textContent = `${n} entr${n === 1 ? 'y' : 'ies'}`;
  $id('clog-total').textContent = state.cart.toFixed(2) + CUR();
  const box = $id('clog-list');
  if (!n) {
    box.innerHTML = '<div class="clog-empty">nothing added yet — amounts you punch in show up here</div>';
    return;
  }
  // newest first: the entry you just made is the one you're most likely checking
  box.innerHTML = log.map((en, i) => {
    const up = en.a > 0;
    return `<div class="clog-row">
      <span class="clog-i">${i + 1}</span>
      <span class="clog-a ${up ? 'up' : 'dn'}">${up ? '+' : '−'}${CUR()}${Math.abs(en.a).toFixed(2)}</span>
      <span class="clog-n">${en.n ? esc(en.n) : ''}</span>
      <span class="clog-t">${fmtClock(en.t)}</span>
    </div>`;
  }).reverse().join('');
}

// Numpad
let padBuf = '';   // raw typed digits, e.g. "12.5"
let padN   = 1;    // how many of this item

function openPad() {
  padBuf = ''; padN = 1; renderPad();
  $id('pad-back').classList.add('on');
  $id('pad').classList.add('on');
}
function closePad() {
  $id('pad-back').classList.remove('on');
  $id('pad').classList.remove('on');
}
function padIsOpen() { return $id('pad').classList.contains('on'); }

function padKey(k) {
  if (k === '.') {
    if (padBuf.includes('.')) return;
    padBuf = (padBuf || '0') + '.';
  } else {
    const dot = padBuf.indexOf('.');
    if (dot >= 0 && padBuf.length - dot > 2) return;         // max 2 decimals
    if (dot < 0 && padBuf.replace('.','').length >= 6) return; // sane cap
    padBuf = (padBuf === '0' ? '' : padBuf) + k;
  }
  renderPad();
}
function padBack() { padBuf = padBuf.slice(0, -1); renderPad(); }
function padClear() { padBuf = ''; padN = 1; renderPad(); }
function padCount(d) { padN = Math.min(99, Math.max(1, padN + d)); renderPad(); }

function padValue() { return Math.round((parseFloat(padBuf) || 0) * 100) / 100; }
function padTotal() { return Math.round(padValue() * padN * 100) / 100; }

function renderPad() {
  const amt = $id('pad-amt');
  amt.innerHTML = (padBuf === '' ? '0.00' : esc(padBuf)) + `<span class="cu">${esc(CUR())}</span>`;
  amt.classList.toggle('empty', padBuf === '');
  $id('pad-count').textContent = '×' + padN;
  $id('pad-calc').innerHTML =
    padN > 1 ? `${padValue().toFixed(2)} × ${padN} = <em>${CUR()}${padTotal().toFixed(2)}</em>` : '';
}

function padApply(sign) {
  const total = padTotal();
  if (total === 0) { toast('enter an amount first'); return; }
  addCart(sign * total, padN > 1 ? `${padValue().toFixed(2)} × ${padN}` : '');
  toast(`${sign > 0 ? '+' : '−'}${CUR()}${total.toFixed(2)}${padN > 1 ? ` (${padN}×)` : ''}`);
  padBuf = ''; padN = 1; renderPad();
}

// physical keyboard, for when the app is open on a laptop
document.addEventListener('keydown', e => {
  if (!padIsOpen()) return;
  if (/^[0-9]$/.test(e.key)) { padKey(e.key); e.preventDefault(); }
  else if (e.key === '.' || e.key === ',') { padKey('.'); e.preventDefault(); }
  else if (e.key === 'Backspace') { padBack(); e.preventDefault(); }
  else if (e.key === 'Enter' || e.key === '+') { padApply(1); e.preventDefault(); }
  else if (e.key === '-') { padApply(-1); e.preventDefault(); }
  else if (e.key === '*') { padCount(1); e.preventDefault(); }
  else if (e.key === '/') { padCount(-1); e.preventDefault(); }
  else if (e.key === 'Escape') { closePad(); e.preventDefault(); }
});

function colorFromPct(pct) {
  const p = Math.min(100, Math.max(0, pct));
  if (p <= 50) {
    return lerpColor([92,219,125], [224,160,96], p / 50);
  }
  return lerpColor([224,160,96], [224,96,96], (p - 50) / 50);
}
function lerpColor(c1, c2, t) {
  const r = Math.round(c1[0] + (c2[0]-c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1]-c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2]-c1[2]) * t);
  return `rgb(${r},${g},${b})`;
}

// Home
function renderHome() {
  // one date format for the whole app, set under Settings → behaviour
  $id('date-label').textContent = Prefs.formatDate(Shell.today()).toUpperCase();
  renderCart();
  renderList();
  $id('hist-count').textContent = state.history.length;
}

// List
function addItem(name, cat) {
  const existing = state.list.find(i => i.name === name && i.cat === cat);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else state.list.push({ name, cat, qty: 1, checked: false });
  saveState();
  toast(`+ ${name}`);
}
function addItemSilent(name, cat) {
  const existing = state.list.find(i => i.name === name && i.cat === cat);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else state.list.push({ name, cat, qty: 1, checked: false });
}
function addManual() {
  const inp = $id('manual-input');
  const name = inp.value.trim();
  if (!name) return;
  const cat = classify(name).cat;
  addItemSilent(name, cat);
  inp.value = '';
  saveState();
  renderList();
  toast(cat === 'manual' ? `+ ${name}` : `+ ${name} → ${CATEGORIES[cat].label}`);
}
function toggleChecked(idx) {
  state.list[idx].checked = !state.list[idx].checked;
  saveState();
  renderList();
}
function setQty(idx, delta) {
  const it = state.list[idx];
  if (!it) return;
  it.qty = Math.min(99, Math.max(1, (it.qty || 1) + delta));
  saveState();
  renderList();
}
function deleteItem(idx) {
  state.list.splice(idx, 1);
  saveState();
  renderList();
}
function confirmClearList() {
  if (!state.list.length) { toast('list is empty'); return; }
  Shell.confirm(`Clear all ${state.list.length} items from list?`, () => {
    const was = state.list.slice();
    state.list = [];
    saveState();
    renderList();
    Shell.undo(`${was.length} item${was.length === 1 ? '' : 's'} cleared`, () => {
      state.list = was; saveState(); renderList();
    });
  });
}
/* Saving and renaming share one sheet: renameIdx === null means "save the
   current list", otherwise it means "rename history[renameIdx]". */
let renameIdx = null;

function saveTrip() {
  if (!state.list.length) { toast('list is empty'); return; }
  openTripName(null);
}

function openTripName(idx) {
  renameIdx = idx;
  const inp = $id('trip-input');
  $id('trip-ttl').textContent = idx === null ? 'name this trip' : 'rename trip';
  $id('trip-ok').textContent = idx === null ? 'save trip' : 'rename';
  inp.value = idx === null ? '' : (state.history[idx]?.name || '');
  $id('trip-back').classList.add('on');
  $id('tripname').classList.add('on');
  inp.focus();   // kept inside the tap gesture so iOS opens the keyboard
}

function closeTripName() {
  renameIdx = null;
  $id('trip-back').classList.remove('on');
  $id('tripname').classList.remove('on');
  $id('trip-input').blur();
}

function confirmTripName() {
  const name = $id('trip-input').value.trim().slice(0, 60);
  if (renameIdx !== null) {
    const t = state.history[renameIdx];
    if (t) t.name = name;          // blank clears it, falling back to the date
    closeTripName();
    saveState();
    renderHistory();
    toast(name ? `renamed to ${name}` : 'name cleared');
    return;
  }
  if (!state.list.length) { closeTripName(); toast('list is empty'); return; }
  state.history.unshift({
    date: Shell.today(),        // local day — toISOString() dated a late shop tomorrow
    name,                                        // '' is fine — the date shows instead
    items: state.list.map(i => ({ ...i })),
    cart: state.cart,
    budget: state.budget,
  });
  state.list = [];
  state.cart = 0;
  state.cartLog = [];                            // fresh calculator for the next shop
  closeTripName();
  saveState();
  renderHome();
  toast(name ? `saved · ${name}` : 'trip saved');
}

function renderList() {
  const ul = $id('grocery-list');
  const countEl = $id('list-count');
  const banner = $id('all-checked-banner');
  const tripBtn = $id('trip-btn');

  paintBand();
  if (!state.list.length) {
    ul.innerHTML = '<div class="li-empty">no items yet</div>';
    countEl.textContent = '0 items';
    banner.classList.remove('show');
    tripBtn.style.display = 'none';
    return;
  }

  const total = state.list.length;
  const checked = state.list.filter(i => i.checked).length;
  countEl.textContent = `${checked}/${total} ${total === 1 ? 'item' : 'items'}`;
  banner.classList.toggle('show', checked === total && total > 0);
  tripBtn.style.display = '';

  // group by category for display order
  const order = Object.keys(CATEGORIES);
  const grouped = {};
  state.list.forEach((it, i) => {
    const c = it.cat in CATEGORIES ? it.cat : 'manual';
    (grouped[c] = grouped[c] || []).push({ ...it, idx: i });
  });

  ul.innerHTML = order
    .filter(c => grouped[c])
    .map(c => {
      const color = CATEGORIES[c].color;
      return grouped[c].map(it => `
        <div class="li-item${it.checked ? ' checked' : ''}" style="--cat-color:${color}" onclick="STORE.toggleChecked(${it.idx})">
          <button class="li-dot" title="change category"
                  onclick="event.stopPropagation();STORE.openCatPick(${it.idx})"></button>
          <span class="li-name">${esc(it.name)}</span>
          <span class="li-qty" onclick="event.stopPropagation()">
            <button class="li-qty-btn${(it.qty || 1) <= 1 ? ' off' : ''}" onclick="STORE.setQty(${it.idx},-1)">−</button>
            <span class="li-qty-n">×${it.qty || 1}</span>
            <button class="li-qty-btn" onclick="STORE.setQty(${it.idx},1)">+</button>
          </span>
          <button class="li-del" onclick="event.stopPropagation();STORE.deleteItem(${it.idx})">✕</button>
        </div>
      `).join('');
    }).join('');
}

// Category picker
let cpIdx = null;
function openCatPick(idx) {
  const it = state.list[idx];
  if (!it) return;
  cpIdx = idx;
  $id('cp-name').textContent = it.name;
  $id('cp-grid').innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => `
    <button class="cp-opt${it.cat === key ? ' on' : ''}" style="--cat-color:${cat.color}"
            onclick="STORE.setCat('${key}')">
      <svg><use href="#${cat.icon}"/></svg><span>${cat.label}</span>
    </button>`).join('');
  $id('cp-back').classList.add('on');
  $id('catpick').classList.add('on');
}
function closeCatPick() {
  cpIdx = null;
  $id('cp-back').classList.remove('on');
  $id('catpick').classList.remove('on');
}
/* A correction is remembered by name, so the same item files itself correctly
   next time it is typed or pulled in from Todoist. */
function setCat(key) {
  const it = state.list[cpIdx];
  if (!it || !CATEGORIES[key]) return closeCatPick();
  it.cat = key;
  const k = tdKey(it.name);
  if (k) {
    if (classifyBase(it.name).cat === key) delete state.learned[k];  // no override needed
    else state.learned[k] = key;
  }
  saveState();
  renderList();
  closeCatPick();
  toast(`${it.name} → ${CATEGORIES[key].label}`);
}

// Categories
function renderCategories() {
  const grid = $id('cat-grid');
  grid.innerHTML = Object.entries(CATEGORIES)
    .filter(([k]) => k !== 'manual')
    .map(([key, cat]) => {
      const inListCount = state.list.filter(i => i.cat === key)
        .reduce((s, i) => s + (i.qty || 1), 0);
      return `
        <div class="cat-card${inListCount > 0 ? ' has' : ''}" style="--cat-color:${cat.color}" onclick="STORE.openCategory('${key}')">
          <svg class="cat-ico"><use href="#${cat.icon}"/></svg>
          <div class="cat-name">${cat.label}</div>
          <div class="cat-meta">${cat.items.length} items${inListCount > 0 ? ` · <em>${inListCount} in list</em>` : ''}</div>
        </div>
      `;
    }).join('');
}

function openCategory(key) {
  state.currentCat = key;
  go('cat');
}

function renderCategoryItems() {
  const cat = CATEGORIES[state.currentCat];
  if (!cat) { go('items'); return; }
  $id('cat-title').textContent = cat.label;
  const grid = $id('cat-items');
  grid.style.setProperty('--cat-color', cat.color);
  grid.innerHTML = cat.items.map(item => {
    const inList = state.list.find(i => i.name === item && i.cat === state.currentCat);
    const qty = inList ? (inList.qty || 1) : 0;
    return `
      <button class="item-add${qty > 0 ? ' active' : ''}" onclick="STORE.addItemAndRefresh('${esc(item).replace(/'/g, "\\'")}','${state.currentCat}')">
        <span>${esc(item)}</span>
        ${qty > 0 ? `<span class="qty-badge">×${qty}</span>` : ''}
      </button>
    `;
  }).join('');
}

function addItemAndRefresh(name, cat) {
  addItem(name, cat);
  renderCategoryItems();
}

// Meals
function renderMeals() {
  const list = $id('meal-list');
  list.innerHTML = Object.entries(MEALS).map(([key, meal]) => {
    const rows = meal.items.map(([n, c]) => `
      <div class="meal-row" style="--cat-color:${CATEGORIES[c]?.color || '#888'}">
        <span class="dot"></span>
        <span>${esc(n)}</span>
        <span class="ml-cat">${c}</span>
      </div>
    `).join('');
    return `
      <div class="meal-card" id="meal-${key}">
        <div class="meal-header" onclick="STORE.toggleMeal('${key}')">
          <div class="meal-name">${meal.label}</div>
          <span class="meal-count">${meal.items.length} items</span>
          <span class="meal-arrow">›</span>
        </div>
        <div class="meal-body">
          ${rows}
          <button class="meal-add" onclick="event.stopPropagation();STORE.addMeal('${key}')">+ add all to list</button>
        </div>
      </div>
    `;
  }).join('');
}

function toggleMeal(key) {
  const card = $id('meal-' + key);
  const wasOpen = card.classList.contains('open');
  $all('.meal-card').forEach(c => c.classList.remove('open'));
  if (!wasOpen) card.classList.add('open');
}

function addMeal(key) {
  MEALS[key].items.forEach(([name, cat]) => addItemSilent(name, cat));
  saveState();
  toast(`+ ${MEALS[key].label}`);
}

// History
function renderHistory() {
  const ul = $id('hist-list');
  if (!state.history.length) {
    ul.innerHTML = '<div class="li-empty" style="margin:8px 0">no trips saved yet — finish your list and tap "save trip" to archive it here</div>';
    return;
  }
  ul.innerHTML = state.history.map((t, i) => {
    const pills = t.items.map(it => {
      const color = CATEGORIES[it.cat]?.color || '#888';
      return `<span class="hist-pill" style="--cat-color:${color}"><span class="dot"></span>${esc(it.name)}${it.qty > 1 ? ` ×${it.qty}` : ''}</span>`;
    }).join('');
    const over = t.budget > 0 && t.cart > t.budget;
    const budTxt = t.budget > 0 ? ` <span class="bud">/ ${CUR()}${t.budget.toFixed(2)}</span>` : '';
    return `
      <div class="hist-card">
        <div class="hist-head">
          <span class="hist-date">${t.name ? esc(t.name) : fmtDate(t.date)}</span>
          <span class="hist-amt${over ? ' over' : ''}">${CUR()}${(t.cart || 0).toFixed(2)}${budTxt}</span>
        </div>
        ${t.name ? `<div class="hist-sub">${fmtDate(t.date)}</div>` : ''}
        <div class="hist-items">${pills}</div>
        <div class="hist-actions">
          <button class="hist-act" onclick="STORE.openTripName(${i})">rename</button>
          <button class="hist-act" onclick="STORE.restoreTrip(${i})">re-add</button>
          <button class="hist-act del" onclick="STORE.deleteTrip(${i})">delete</button>
        </div>
      </div>
    `;
  }).join('');
}

function fmtDate(iso) {
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short' }).toUpperCase();
  } catch { return iso; }
}

function restoreTrip(i) {
  const t = state.history[i];
  if (!t) return;
  t.items.forEach(it => addItemSilent(it.name, it.cat));
  // ensure all re-added items start unchecked
  state.list.forEach(it => { it.checked = false; });
  saveState();
  toast('items re-added to list');
  go('home');
}

function deleteTrip(i) {
  Shell.confirm('Delete this trip from history?', () => {
    state.history.splice(i, 1);
    saveState();
    renderHistory();
  });
}

function clearHistory() {
  if (!state.history.length) { toast('history is empty'); return; }
  Shell.confirm(`Clear all ${state.history.length} past trips?`, () => {
    const was = state.history.slice();
    state.history = [];
    saveState();
    renderHistory();
    Shell.undo(`${was.length} trip${was.length === 1 ? '' : 's'} cleared`, () => {
      state.history = was; saveState(); renderHistory();
    });
  });
}

// Settings
function renderSettings() {
  $id('budget-input').value = state.budget > 0 ? state.budget : '';
  renderTodoistSettings();
  renderTdButtons();
}
function saveBudget() {
  const inp = $id('budget-input');
  const v = parseFloat(inp.value);
  if (inp.value === '' || isNaN(v) || v < 0) {
    state.budget = 0;
  } else {
    state.budget = Math.round(v * 100) / 100;
  }
  saveState();
  toast(state.budget > 0 ? `budget set to ${CUR()}${state.budget.toFixed(2)}` : 'budget disabled');
}

// Todoist sync
// REST v2 was retired 2026-02-10; everything below targets the unified v1 API.
const TD_BASE = 'https://api.todoist.com/api/v1';
let tdBusy = false;

/* Names are matched loosely so "Tomato  x2" and "tomato" are the same item:
   lowercase, strip a trailing quantity, collapse whitespace and punctuation. */
function tdParseQty(raw) {
  const s = String(raw || '').trim();
  const m = s.match(/^(.*?)[\s,]*(?:[x×*]\s*(\d{1,2})|\((\d{1,2})\))$/i);
  if (m && m[1].trim()) {
    return { name: m[1].trim(), qty: Math.min(99, Math.max(1, parseInt(m[2] || m[3], 10))) };
  }
  return { name: s, qty: 1 };
}
function tdKey(name) {
  return String(name || '').toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '')   // drop accents
    .replace(/[^a-z0-9]+/g, ' ').trim();
}
function tdContent(item) {
  return (item.qty || 1) > 1 ? `${item.name} ×${item.qty}` : item.name;
}
function tdGuessCat(name) { return classify(name).cat; }

async function tdFetch(path, opts = {}) {
  const tok = Creds.token();
  if (!tok) throw new Error('no Todoist key saved — add one in settings');
  let res;
  try {
    res = await fetch(TD_BASE + path, {
      ...opts,
      headers: {
        'Authorization': 'Bearer ' + tok,
        ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
        ...(opts.headers || {}),
      },
    });
  } catch (e) {
    throw new Error(location.protocol === 'file:'
      ? 'blocked by the browser — open STORE over http(s), not as a local file'
      : 'network error — check your connection');
  }
  if (res.status === 401 || res.status === 403) throw new Error('token rejected by Todoist (401)');
  if (res.status === 429) throw new Error('rate limited by Todoist — wait a minute');
  if (!res.ok) throw new Error(`Todoist error ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

/* v1 paginates some collections as {results,next_cursor} and returns others as a
   bare array, so unwrap either and follow the cursor when there is one. */
async function tdGetAll(path, params = {}) {
  const out = [];
  let cursor = null;
  do {
    const q = new URLSearchParams({ ...params, limit: '200' });
    if (cursor) q.set('cursor', cursor);
    const page = await tdFetch(`${path}?${q}`);
    if (Array.isArray(page)) { out.push(...page); cursor = null; }
    else { out.push(...(page?.results || [])); cursor = page?.next_cursor || null; }
  } while (cursor);
  return out;
}

/* Resolves "04|life" / "home|groceries" to ids once, then caches them. */
async function tdResolveTarget(force = false) {
  const t = state.todoist;
  if (!force && t.projectId && t.sectionId) return t;

  const projects = await tdGetAll('/projects');
  const proj = projects.find(p => tdKey(p.name) === tdKey(t.project));
  if (!proj) {
    throw new Error(`project "${t.project}" not found (${projects.length} projects visible)`);
  }
  const sections = await tdGetAll('/sections', { project_id: proj.id });
  const sec = sections.find(s => tdKey(s.name) === tdKey(t.section));
  if (!sec) {
    const names = sections.map(s => s.name).join(', ') || 'none';
    throw new Error(`section "${t.section}" not found in ${proj.name} — has: ${names}`);
  }
  t.projectId = proj.id;
  t.sectionId = sec.id;
  saveState();
  return t;
}

async function testTodoist() {
  if (!Creds.token()) { tdStatus('add your Todoist key under settings → data first', 'bad'); return; }
  tdStatus('checking…', 'busy');
  try {
    const t = await tdResolveTarget(true);
    const tasks = await tdGetAll('/tasks', { project_id: t.projectId, section_id: t.sectionId });
    tdStatus(`connected — ${tasks.length} task${tasks.length === 1 ? '' : 's'} in ${t.section}`, 'good');
  } catch (e) {
    tdStatus(e.message, 'bad');
  }
}

/* Two-way union merge. Nothing is ever deleted or completed on either side:
   each side only gains the items the other side has and it is missing. */
async function syncTodoist() {
  if (tdBusy) return;
  if (!Creds.token()) { toast('add a Todoist key in settings'); Shell.settings('store'); return; }
  tdBusy = true;
  renderTdButtons();
  tdStatus('syncing…', 'busy');
  try {
    const t = await tdResolveTarget();
    const remote = await tdGetAll('/tasks', { project_id: t.projectId, section_id: t.sectionId });

    const remoteByKey = new Map();
    /* A trip is a parent task ("walk shop — thu 15 oct"), not something to
       buy: it is the thing its items hang under. Everything under it is an
       item like any other and comes across. */
    remote.filter(task => !isTripTask(task)).forEach(task => {
      const { name, qty } = tdParseQty(task.content);
      const k = tdKey(name);
      if (k && !remoteByKey.has(k)) remoteByKey.set(k, { name, qty });
    });
    const localKeys = new Set(state.list.map(i => tdKey(i.name)).filter(Boolean));

    // Todoist → STORE
    let pulled = 0;
    remoteByKey.forEach((item, k) => {
      if (localKeys.has(k)) return;
      state.list.push({ name: item.name, cat: tdGuessCat(item.name), qty: item.qty, checked: false });
      localKeys.add(k);
      pulled++;
    });
    if (pulled) { saveState(); renderList(); }

    // STORE → Todoist (snapshot first: the pull above appended to state.list)
    const toPush = state.list.filter(i => {
      const k = tdKey(i.name);
      return k && !remoteByKey.has(k);
    });
    let pushed = 0, failed = 0;
    for (const item of toPush) {
      try {
        await tdFetch('/tasks', {
          method: 'POST',
          body: JSON.stringify({
            content: tdContent(item),
            project_id: t.projectId,
            section_id: t.sectionId,
          }),
        });
        remoteByKey.set(tdKey(item.name), item);
        pushed++;
      } catch (e) { failed++; }
    }

    state.todoist.lastSync = Date.now();
    saveState();
    renderTodoistSettings();

    const parts = [];
    if (pulled) parts.push(`↓ ${pulled} added here`);
    if (pushed) parts.push(`↑ ${pushed} sent`);
    if (failed) parts.push(`${failed} failed`);
    const msg = parts.length ? parts.join(' · ') : 'already in sync';
    toast(msg);
    tdStatus(msg, failed ? 'bad' : 'good');
  } catch (e) {
    toast('sync failed');
    tdStatus(e.message, 'bad');
  } finally {
    tdBusy = false;
    renderTdButtons();
  }
}

function renderTdButtons() {
  $all('[data-td-btn]').forEach(b => {
    b.disabled = tdBusy;
    b.textContent = tdBusy ? 'syncing…' : b.dataset.tdBtn;
  });
}
function tdStatus(msg, kind) {
  const el = $id('td-status');
  if (!el) return;
  el.textContent = msg;
  el.className = 'td-status' + (kind ? ' ' + kind : '');
}

/* The key is set once in Settings › General; this only owns the target. */
function saveTodoist() {
  const proj = $id('td-project').value.trim();
  const sec  = $id('td-section').value.trim();
  const t = state.todoist;
  // a changed target invalidates the cached ids
  if (proj !== t.project || sec !== t.section) { t.projectId = null; t.sectionId = null; }
  t.project = proj || TD_DEFAULTS.project;
  t.section = sec || TD_DEFAULTS.section;
  saveState();
  renderTodoistSettings();
  toast('STORE target saved');
}

function renderTodoistSettings() {
  const t = state.todoist;
  if (!$id('td-project')) return;
  $id('td-project').value = t.project;
  $id('td-section').value = t.section;
  $id('td-last').textContent =
    t.lastSync ? 'last sync ' + new Date(t.lastSync).toLocaleString('en-GB',
      { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : 'never synced';
  $id('td-file-warn').classList.toggle('hidden', location.protocol !== 'file:');
}

// Utils
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* Counter steps
   The +10/+5/+1/+.5/+.1 rows were ten hardcoded buttons. The amounts are a
   setting now; the two rows are drawn from it, largest first. `.5` rather than
   `0.5` on the face keeps the button narrow enough for five across a phone. */
function renderSteps() {
  const rows = $all('.cw-btns');
  if (!rows.length) return;
  const amts = (Config.get('store.quickAmounts') || [10,5,1,0.5,0.1])
    .slice().sort((a, b) => b - a);
  const face = n => String(n).replace(/^0\./, '.');
  rows[0].innerHTML = amts.map(n =>
    `<button class="cw-btn plus" onclick="STORE.addCart(${n})">+${face(n)}</button>`).join('');
  if (rows[1]) rows[1].innerHTML = amts.map(n =>
    `<button class="cw-btn minus" onclick="STORE.addCart(${-n})">−${face(n)}</button>`).join('');
}

/* ── Recipes (qurOS spec §7) ──────────────────────────────────────────────
   A small library of preset meals so dinner is not a decision: ingredients
   scaled ×1 / ×2, a choice where a recipe has one (one meat a batch), a side
   (the rice), steps with their own timers, and one button that puts what is
   missing on the grocery list — in Todoist, under the trip it is for.

   Everything here is delegated through `data-sact` rather than inline
   handlers: a recipe's name is the user's own text and it lands in three
   screens and a sheet. The older premade lists (`store.meals`) are kept
   beside the recipes as "quick lists", untouched. */
let RECIPES = [], SYN = null, PANTRY = null, TRIPS = [];
const QTY_FRAC = { '½':0.5, '¼':0.25, '¾':0.75, '⅓':1/3, '⅔':2/3 };
function readRecipes() {
  const seen = new Set();
  RECIPES = (Array.isArray(Config.get('store.recipes')) ? Config.get('store.recipes') : [])
    .filter(r => r && typeof r === 'object' && /^[a-z0-9_-]{1,40}$/.test(String(r.key || '')))
    .filter(r => !seen.has(r.key) && seen.add(r.key))
    .map(r => ({
      key: r.key, name: String(r.name || r.key).slice(0, 80),
      serves: Math.max(1, Math.min(24, Math.round(+r.serves) || 2)),
      usual: [0.5, 1, 2, 3].includes(+r.usual) ? +r.usual : 1,
      note: String(r.note || '').slice(0, 240),
      ing: (Array.isArray(r.ing) ? r.ing : []).filter(i => i && String(i.n || '').trim()).slice(0, 60).map(i => ({
        q: isFinite(+i.q) && +i.q > 0 ? +i.q : null, u: String(i.u || '').slice(0, 16),
        n: String(i.n).trim().slice(0, 60), opt: !!i.opt, pantry: !!i.pantry,
        choice: String(i.choice || '').slice(0, 30), note: String(i.note || '').slice(0, 120) })),
      steps: (Array.isArray(r.steps) ? r.steps : []).filter(s => s && String(s.t || '').trim()).slice(0, 40)
        .map(s => ({ t: String(s.t).slice(0, 300), m: Math.max(0, Math.min(600, +s.m || 0)) })),
      sides: (Array.isArray(r.sides) ? r.sides : []).filter(s => s && Array.isArray(s.options)).slice(0, 3)
        .map(s => ({ label: String(s.label || 'side').slice(0, 30), options: s.options.map(String).slice(0, 6) })),
    }));
  SYN = null; PANTRY = null;
  TRIPS = (Array.isArray(Config.get('store.trips')) ? Config.get('store.trips') : [])
    .filter(t => t && /^[a-z0-9_-]{1,24}$/.test(String(t.key || '')) && String(t.label || '').trim())
    .map(t => ({ key: t.key, label: String(t.label).trim().slice(0, 30) })).slice(0, 6);
}
readRecipes();
const recipe = k => RECIPES.find(r => r.key === k) || null;

/* Names, the way a shopping list hears them
   "Onions x2", "onion" and "300 g onion" are one item; "bicarb soda" and
   "baking soda" are one item. Quantities and plurals come off first, then the
   synonym groups map each name to the first one in its group. A group is
   matched on the whole phrase before plurals are touched — so "peppers" can
   be bell peppers without "pepper" (the spice) becoming one too. */
const singular = w => /oes$/.test(w) ? w.slice(0, -2) : /ies$/.test(w) && w.length > 4 ? w.slice(0, -3) + 'y'
                    : /[^su]s$/.test(w) && w.length > 3 ? w.slice(0, -1) : w;
const singularPhrase = s => s.split(' ').map(singular).join(' ');
function baseName(raw) {
  return tdKey(tdParseQty(raw).name)
    .replace(/^\d+(?:\s*\d+)?\s*(?:g|kg|ml|cl|l|tbsp|tsp|cups?|cloves?|slices?|cans?|tins?|x)?\s+/, '')
    .replace(/\s+\d+(?:\s*(?:g|kg|ml|cl|l))?$/, '').trim();
}
function synMap() {
  if (SYN) return SYN;
  SYN = new Map();
  (Array.isArray(Config.get('store.synonyms')) ? Config.get('store.synonyms') : []).forEach(g => {
    const names = (Array.isArray(g) ? g : String(g || '').split(',')).map(x => tdKey(x)).filter(Boolean);
    if (!names.length) return;
    const canon = singularPhrase(names[0]);
    /* the names exactly as written: a plural taken off a *group member* is how
       "peppers" (bell) swallowed "pepper" (the spice). The input's plural comes
       off in canon(), against these. */
    names.forEach(n => SYN.set(n, canon));
  });
  return SYN;
}
function canon(raw) {
  const b = baseName(raw); if (!b) return '';
  const m = synMap();
  return m.get(b) || m.get(singularPhrase(b)) || singularPhrase(b);
}
function pantrySet() {
  if (!PANTRY) PANTRY = new Set((Array.isArray(Config.get('store.pantry')) ? Config.get('store.pantry') : []).map(canon).filter(Boolean));
  return PANTRY;
}
const isPantry = i => i.pantry || pantrySet().has(canon(i.n));

/* A quantity, said the way a recipe says it: ½ rather than 0.5, 1¼ rather
   than 1.25, and a whole number when it is one. */
function qtyText(q) {
  if (q == null) return '';
  const whole = Math.floor(q + 1e-9), frac = q - whole;
  const f = Math.abs(frac - 0.5) < 0.01 ? '½' : Math.abs(frac - 0.25) < 0.01 ? '¼' : Math.abs(frac - 0.75) < 0.01 ? '¾'
          : Math.abs(frac - 1 / 3) < 0.01 ? '⅓' : Math.abs(frac - 2 / 3) < 0.01 ? '⅔' : frac > 0.01 ? null : '';
  if (f === null) return String(Math.round(q * 100) / 100);
  return (whole ? String(whole) : '') + f || '0';
}
function parseQty(s) {
  const t = String(s || '').trim(); if (!t) return { q: null, u: '' };
  const m = /^(\d+(?:[.,]\d+)?)?\s*([½¼¾⅓⅔]|\d+\/\d+)?\s*(.*)$/.exec(t);
  if (!m || (!m[1] && !m[2])) return { q: null, u: t };
  let q = m[1] ? parseFloat(m[1].replace(',', '.')) : 0;
  if (m[2]) q += QTY_FRAC[m[2]] != null ? QTY_FRAC[m[2]] : (() => { const [a, b] = m[2].split('/').map(Number); return b ? a / b : 0; })();
  return { q: q > 0 ? q : null, u: m[3].trim() };
}

/* What one recipe page has chosen: the scale, the choice in each group, the
   side, and which optional / pantry lines are in. In memory — a recipe opened
   tomorrow starts from its own defaults, which is what "not a decision" asks. */
let rcp = null;
function openRecipe(key) {
  const r = recipe(key); if (!r) return;
  const choices = {};
  r.ing.forEach(i => { if (i.choice && !(i.choice in choices) && !i.opt) choices[i.choice] = i.n; });
  rcp = { key, scale: r.usual, choices, sides: r.sides.map(s => s.options[0] || ''), include: {} };
  go('recipe');
}
const ingId = (rk, i) => rk + '#' + i;
/* One grocery line per item, however many recipes ask for it: garlic in the
   burritos and garlic in the rice is one "garlic". A count with no unit goes
   into the title ("onion x2"); everything with a unit goes into the task's
   description, where it is a note about how much rather than a second item. */
function groceryLines(lines) {
  const byKey = new Map();
  lines.filter(l => l.on).forEach(l => {
    const k = canon(l.n); if (!k) return;
    const cur = byKey.get(k) || { key: k, name: l.n, count: 0, notes: [], cat: classify(l.n).cat };
    if (l.q != null && !l.u) cur.count += l.q;
    if (l.q != null && l.u) cur.notes.push(`${qtyText(l.q)} ${l.u}`.trim() + (l.recipe ? ` (${l.recipe})` : ''));
    else if (l.note) cur.notes.push(l.note);
    byKey.set(k, cur);
  });
  return Array.from(byKey.values()).map(x => {
    const n = Math.ceil(x.count - 1e-9);
    return Object.assign(x, { qty: Math.max(1, n), title: n > 1 ? `${x.name} x${n}` : x.name,
                              desc: x.notes.filter((v, i, a) => a.indexOf(v) === i).join(' · ') });
  });
}

/* ── Cooked ──────────────────────────────────────────────────────────────── */
function cooked(key) {
  const r = recipe(key); if (!r) return;
  const d = Shell.today();
  if (!state.cooked || typeof state.cooked !== 'object') state.cooked = {};
  const list = Array.isArray(state.cooked[d]) ? state.cooked[d] : [];
  if (!list.includes(r.name)) list.push(r.name);
  state.cooked[d] = list.slice(-12);
  /* "meals eaten" is a recent question; a year of it is a store that only grows */
  Object.keys(state.cooked).sort().slice(0, -60).forEach(k => delete state.cooked[k]);
  saveState();
  toast(`cooked · ${r.name}`);
  renderRecipe();
}
const cookedOn = iso => (state.cooked && Array.isArray(state.cooked[iso]) ? state.cooked[iso].slice() : []);

/* ── Step timers ─────────────────────────────────────────────────────────── */
/* Wall-clock ends, filed under recipe and step, kept in the record so a
   reload in the middle of fifteen minutes of rice still knows. */
const tmKey = (rk, i) => rk + '|' + i;
let tmTick = null;
function timers() { if (!state.timers || typeof state.timers !== 'object') state.timers = {}; return state.timers; }
function timerToggle(rk, i) {
  const r = recipe(rk); if (!r || !r.steps[i] || !r.steps[i].m) return;
  const t = timers(), k = tmKey(rk, i);
  if (t[k]) delete t[k]; else t[k] = Date.now() + r.steps[i].m * 60000;
  saveState(); syncTimers(); renderRecipe();
}
function syncTimers() {
  const any = Object.keys(timers()).length > 0;
  if (any && !tmTick) tmTick = setInterval(timerTick, 1000);
  else if (!any && tmTick) { clearInterval(tmTick); tmTick = null; }
}
const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function timerTick() {
  const t = timers(); let changed = false;
  Object.keys(t).forEach(k => {
    if (t[k] - Date.now() > 0) return;
    const [rk, i] = k.split('|'); const r = recipe(rk);
    delete t[k]; changed = true;
    toast(`${r ? r.name : 'recipe'} · step ${+i + 1} — time`);
    if (window.Prefs && Prefs.tap) Prefs.tap(60);
  });
  if (changed) { saveState(); renderRecipe(); }
  document.querySelectorAll('.ns-store [data-tm]').forEach(el => {
    const end = t[el.dataset.tm]; if (end) el.textContent = mmss(end - Date.now());
  });
  syncTimers();
}

/* ── Drawing ─────────────────────────────────────────────────────────────── */
const ARROW_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
function renderRecipes() {
  const box = $id('recipe-list'); if (!box) return;
  const today = Shell.today();
  box.innerHTML = RECIPES.length ? RECIPES.map(r => {
    const n = r.ing.filter(i => !i.choice || r.ing.find(x => x.choice === i.choice) === i).length;
    return `<button class="rc-card card" data-sact="recipe" data-k="${esc(r.key)}">
      <span class="rc-name">${esc(r.name)}</span>
      <span class="rc-meta">serves ${r.serves}${r.usual !== 1 ? ` · usually ×${r.usual}` : ''} · ${n} ingredients${r.steps.length ? ` · ${r.steps.length} steps` : ''}${cookedOn(today).includes(r.name) ? ' · <em>cooked today</em>' : ''}</span>
      ${r.note ? `<span class="rc-note">${esc(r.note)}</span>` : ''}
      <i class="rc-go">${ARROW_R}</i>
    </button>`;
  }).join('') : '<div class="li-empty">no recipes yet — settings → store → recipes</div>';
}
function renderRecipe() {
  const box = $id('recipe-body'); if (!box || !rcp) return;
  const r = recipe(rcp.key); if (!r) { go('meals'); return; }
  $id('recipe-title').textContent = r.name;
  const lines = linesOfAll(r);
  const groups = {};
  r.ing.forEach(i => { if (i.choice) (groups[i.choice] = groups[i.choice] || []).push(i); });
  const t = timers();
  const shop = groceryLines(lines);
  box.innerHTML = `
    ${r.note ? `<div class="rc-note big">${esc(r.note)}</div>` : ''}
    <div class="rc-row"><span class="rc-lbl">how much</span>
      <div class="rc-chips">${[0.5, 1, 2, 3].map(s => `<button class="rc-chip${rcp.scale === s ? ' on' : ''}" data-sact="scale" data-v="${s}">×${s === 0.5 ? '½' : s}</button>`).join('')}</div>
      <span class="rc-serves">serves ${qtyText(r.serves * rcp.scale)}</span></div>
    ${Object.keys(groups).map(g => {
      const opt = groups[g].every(i => i.opt);
      const cur = rcp.choices[g] !== undefined ? rcp.choices[g] : (opt ? null : groups[g][0].n);
      return `<div class="rc-row"><span class="rc-lbl">${esc(g)}</span><div class="rc-chips">${
        opt ? `<button class="rc-chip${cur == null ? ' on' : ''}" data-sact="choice" data-g="${esc(g)}" data-v="">none</button>` : ''}${
        groups[g].map(i => `<button class="rc-chip${cur === i.n ? ' on' : ''}" data-sact="choice" data-g="${esc(g)}" data-v="${esc(i.n)}">${esc(i.n)}</button>`).join('')}</div></div>`;
    }).join('')}
    ${r.sides.map((s, si) => `<div class="rc-row"><span class="rc-lbl">${esc(s.label)}</span><div class="rc-chips">${
      `<button class="rc-chip${!rcp.sides[si] ? ' on' : ''}" data-sact="side" data-i="${si}" data-v="">none</button>` +
      s.options.map(o => recipe(o) ? `<button class="rc-chip${rcp.sides[si] === o ? ' on' : ''}" data-sact="side" data-i="${si}" data-v="${esc(o)}">${esc(recipe(o).name)}</button>` : '').join('')}</div></div>`).join('')}

    <div class="sec"><span>ingredients <em>${shop.length} to shop for</em></span></div>
    <div class="rc-ings">${lines.filter(l => !l.choice || l.on || l.why !== 'not this time').map(l => {
      const tog = l.opt || (l.pantry && !l.choice);
      return `<div class="rc-ing${l.on ? '' : ' off'}">
        <span class="rc-q">${esc([qtyText(l.q), l.u].filter(Boolean).join(' '))}</span>
        <span class="rc-n">${esc(l.n)}${l.from ? `<small>${esc(l.from)}</small>` : ''}${l.note ? `<small>${esc(l.note)}</small>` : ''}</span>
        ${tog ? `<button class="rc-tog${l.on ? ' on' : ''}" data-sact="inc" data-id="${esc(l.id)}" role="switch" aria-checked="${l.on}"
           aria-label="include ${esc(l.n)}">${l.on ? 'in' : l.pantry ? 'have it' : 'skip'}</button>` : ''}
      </div>`;
    }).join('')}</div>

    ${r.steps.length ? `<div class="sec"><span>steps</span></div>
    <ol class="rc-steps">${r.steps.map((s, i) => { const k = tmKey(r.key, i), end = t[k];
      return `<li><span>${esc(s.t)}</span>${s.m ? `<button class="rc-timer${end ? ' on' : ''}" data-sact="timer" data-k="${esc(r.key)}" data-i="${i}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2.5h4"/></svg>
        <b${end ? ` data-tm="${esc(k)}"` : ''}>${end ? mmss(end - Date.now()) : s.m + ' min'}</b></button>` : ''}</li>`; }).join('')}</ol>`
      : `<div class="li-empty">no steps written yet</div>`}

    <div class="rc-acts">
      <button class="rc-btn go" data-sact="shop"${shop.length ? '' : ' disabled'}>add ${shop.length} to groceries${ARROW_R}</button>
      <button class="rc-btn" data-sact="cooked">${cookedOn(Shell.today()).includes(r.name) ? 'cooked today ✓' : 'cooked it'}</button>
    </div>`;
  syncTimers();
}
/* The recipe's own lines, then each chosen side's under its label. */
function linesOfAll(r) {
  const own = [];
  const sel = { choices: rcp.choices, include: rcp.include, sides: rcp.sides };
  const push = (rr, from, scale) => rr.ing.forEach((i, ix) => {
    const id = ingId(rr.key, ix);
    let on = true, why = '';
    if (i.choice) {
      const group = rr.ing.filter(x => x.choice === i.choice);
      const opt = group.every(x => x.opt);
      const pick = rr === r && sel.choices[i.choice] !== undefined ? sel.choices[i.choice] : (opt ? null : group[0].n);
      on = pick === i.n; why = on ? '' : 'not this time';
    } else if (i.opt) { on = !!sel.include[id]; why = on ? '' : 'optional'; }
    else if (isPantry(i)) { on = !!sel.include[id]; why = on ? '' : 'in the cupboard'; }
    own.push({ id, from, n: i.n, q: i.q == null ? null : i.q * scale, u: i.u, note: i.note, opt: i.opt,
               pantry: isPantry(i), choice: i.choice, on, why, recipe: rr.name });
  });
  push(r, '', rcp.scale);
  r.sides.forEach((s, si) => {
    const side = recipe(sel.sides[si]);
    /* A side is cooked for the same table, so it follows the main recipe's
       servings rather than its own ×: four burritos want four servings of rice. */
    if (side && side.key !== r.key) push(side, s.label + ' · ' + side.name, (r.serves * rcp.scale) / side.serves);
  });
  return own;
}

/* ── The grocery sheet ──────────────────────────────────────────────────────
   What is about to be added, what is already on the list (here or in
   Todoist), and which trip it is for. Nothing is sent until "add" is pressed,
   and a line already on the list is never sent twice. */
let gs = null;       // { lines, remote, trips, busy, pick, when, date, err }
const tripRe = () => TRIPS.length ? new RegExp('^\\s*(' + TRIPS.map(t => t.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'i') : null;
const isTripTask = task => { const re = tripRe(); return !!(re && re.test(String(task && task.content || ''))); };
const tripKindOf = content => { const s = String(content || '').toLowerCase().trim();
  return TRIPS.find(t => s.startsWith(t.label.toLowerCase())) || null; };
function whenWord(iso) {
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toLowerCase();
}
function openShop() {
  const r = recipe(rcp && rcp.key); if (!r) return;
  const lines = groceryLines(linesOfAll(r));
  gs = { lines, recipe: r.name, remote: null, trips: [], busy: !!Creds.token(), pick: Creds.token() ? 'new:' + (TRIPS[0] ? TRIPS[0].key : '') : 'local',
         when: 'today', date: Shell.today(), err: '' };
  $id('gs-back').classList.add('on'); $id('gsheet').classList.add('on');
  paintShop();
  if (Creds.token()) readTrips().then(res => {
    if (!gs) return;
    gs.busy = false; gs.remote = res.tasks; gs.trips = res.trips; gs.err = '';
    if (gs.trips.length) gs.pick = 'trip:' + gs.trips[0].id;
    paintShop();
  }).catch(e => { if (!gs) return; gs.busy = false; gs.err = e.message || 'Todoist did not answer'; gs.pick = 'local'; paintShop(); });
}
function closeShop() { gs = null; $id('gs-back').classList.remove('on'); $id('gsheet').classList.remove('on'); }
/* Every open task in the section — trips, what is under them and what is
   loose — and the trips among them, each with the items it already holds. */
async function readTrips() {
  const t = await tdResolveTarget();
  const all = await tdGetAll('/tasks', { project_id: t.projectId });
  const tripIds = new Set(all.filter(x => x.section_id === t.sectionId && !x.parent_id && isTripTask(x)).map(x => x.id));
  const tasks = all.filter(x => x.section_id === t.sectionId || tripIds.has(x.parent_id));
  const trips = tasks.filter(x => tripIds.has(x.id)).map(x => ({
    id: x.id, content: x.content, due: (x.due && x.due.date) ? String(x.due.date).slice(0, 10) : '',
    kind: (tripKindOf(x.content) || {}).key || '', items: tasks.filter(c => c.parent_id === x.id) }))
    .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
  return { target: t, tasks, trips, loose: tasks.filter(x => !x.parent_id && !tripIds.has(x.id)) };
}
/* Which of the lines are already somewhere on the list. */
function alreadyKeys() {
  const keys = new Set(state.list.map(i => canon(i.name)).filter(Boolean));
  (gs && gs.remote || []).filter(x => !isTripTask(x)).forEach(x => { const k = canon(x.content); if (k) keys.add(k); });
  return keys;
}
function paintShop() {
  const box = $id('gs-body'); if (!box || !gs) return;
  const have = alreadyKeys();
  const toAdd = gs.lines.filter(l => !have.has(l.key)), dup = gs.lines.filter(l => have.has(l.key));
  const tok = !!Creds.token();
  const opt = (v, label, sub) => `<button class="gs-opt${gs.pick === v ? ' on' : ''}" data-sact="gs-pick" data-v="${esc(v)}">
      <span>${esc(label)}</span>${sub ? `<small>${esc(sub)}</small>` : ''}</button>`;
  box.innerHTML = `
    <div class="gs-sum"><b>${toAdd.length}</b> to add${dup.length ? ` · <span>${dup.length} already on the list</span>` : ''}</div>
    <div class="gs-lines">${toAdd.map(l => `<span class="gs-l">${esc(l.title)}${l.desc ? `<small>${esc(l.desc)}</small>` : ''}</span>`).join('')}
      ${dup.map(l => `<span class="gs-l dup">${esc(l.name)}<small>already on the list</small></span>`).join('')}</div>
    <div class="gs-h">which trip</div>
    ${gs.busy ? '<div class="gs-fine">reading Todoist…</div>' : ''}
    ${gs.err ? `<div class="gs-fine bad">${esc(gs.err)} — it can still go on this phone's list</div>` : ''}
    <div class="gs-opts">
      ${tok && !gs.err ? gs.trips.map(t => opt('trip:' + t.id, t.content, `${t.items.length} item${t.items.length === 1 ? '' : 's'} on it`)).join('') : ''}
      ${tok && !gs.err ? TRIPS.map(t => opt('new:' + t.key, `new ${t.label}`, '— ' + whenWord(gs.date))).join('') : ''}
      ${tok && !gs.err ? opt('loose', 'no trip', 'loose in the section') : ''}
      ${opt('local', "this phone's list only", tok ? 'not sent to Todoist' : 'no Todoist key saved')}
    </div>
    ${gs.pick.startsWith('new:') ? `<div class="gs-when">${['today', 'tomorrow'].map(w =>
        `<button class="rc-chip${gs.when === w ? ' on' : ''}" data-sact="gs-when" data-v="${w}">${w}</button>`).join('')}
      <input type="date" id="gs-date" value="${esc(gs.date)}" aria-label="trip date"></div>` : ''}
    <button class="rc-btn go wide" data-sact="gs-go"${toAdd.length && !gs.busy ? '' : ' disabled'}>add ${toAdd.length}</button>`;
}
const dayAfter = (iso, n) => { const p = iso.split('-').map(Number); const d = new Date(p[0], p[1] - 1, p[2] + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
async function shopGo(btn) {
  if (!gs || gs.busy) return;
  const have = alreadyKeys();
  const toAdd = gs.lines.filter(l => !have.has(l.key));
  if (!toAdd.length) { closeShop(); return; }
  /* Always onto this phone's list as well: the shop happens in STORE, and
     STORE's own sync matches these against Todoist by name, so nothing is
     doubled when it next runs. */
  const local = () => { toAdd.forEach(l => { const ex = state.list.find(i => canon(i.name) === l.key);
    if (ex) ex.qty = Math.max(ex.qty || 1, l.qty); else state.list.push({ name: l.name, cat: l.cat, qty: l.qty, checked: false }); });
    saveState(); renderList(); };
  if (gs.pick === 'local' || !Creds.token()) { local(); toast(`+ ${toAdd.length} · on this phone's list`); closeShop(); return; }
  gs.busy = true; if (btn) { btn.disabled = true; btn.textContent = 'sending…'; }
  try {
    const t = await tdResolveTarget();
    let parent = null;
    if (gs.pick.startsWith('trip:')) parent = gs.pick.slice(5);
    else if (gs.pick.startsWith('new:')) {
      const kind = TRIPS.find(x => x.key === gs.pick.slice(4)) || TRIPS[0];
      const dateEl = $id('gs-date');
      const iso = gs.when === 'tomorrow' ? dayAfter(Shell.today(), 1) : gs.when === 'date' && dateEl && dateEl.value ? dateEl.value : Shell.today();
      const made = await tdFetch('/tasks', { method: 'POST', body: JSON.stringify({
        content: `${kind.label} — ${whenWord(iso)}`, project_id: t.projectId, section_id: t.sectionId, due_date: iso }) });
      parent = made && made.id;
    }
    let sent = 0, failed = 0;
    for (const l of toAdd) {
      const body = { content: l.title };
      if (l.desc) body.description = l.desc;
      if (parent) body.parent_id = parent; else { body.project_id = t.projectId; body.section_id = t.sectionId; }
      try { await tdFetch('/tasks', { method: 'POST', body: JSON.stringify(body) }); sent++; } catch { failed++; }
    }
    local();
    toast(failed ? `↑ ${sent} sent · ${failed} failed — all on this phone's list` : `↑ ${sent} sent to ${parent ? 'the trip' : 'the list'}`);
    closeShop();
  } catch (e) {
    local();
    toast('Todoist failed — added to this phone\'s list');
    if (gs) { gs.busy = false; gs.err = e.message || 'failed'; paintShop(); }
  }
}

/* ── Trips ───────────────────────────────────────────────────────────────── */
/* The trips as Todoist has them: each with its date and what is on it, and
   what is loose in the section. An item moves between them with one tap —
   Todoist's own move, drawn first and put back exactly if the call fails. */
let tv = null;       // { busy, err, trips, loose, at }
async function loadTrips(force) {
  if (!Creds.token()) { tv = { busy: false, err: 'no Todoist key saved — settings → data', trips: [], loose: [] }; renderTrips(); return; }
  if (tv && tv.busy) return;
  tv = Object.assign(tv || { trips: [], loose: [] }, { busy: true, err: '' }); renderTrips();
  try {
    const r = await readTrips();
    tv = { busy: false, err: '', trips: r.trips, loose: r.loose.filter(x => !isTripTask(x)), at: Date.now() };
  } catch (e) { tv = Object.assign(tv, { busy: false, err: e.message || 'Todoist did not answer' }); }
  renderTrips();
}
function renderTrips() {
  const box = $id('trips-body'); if (!box) return;
  if (!tv) { box.innerHTML = ''; return; }
  const dest = (task, here) => {
    const opts = tv.trips.filter(t => t.id !== here).map(t => `<option value="trip:${esc(t.id)}">→ ${esc(t.content)}</option>`).join('') +
                 (here ? '<option value="loose">→ no trip</option>' : '');
    return opts ? `<select class="tr-move" data-sact-change="move" data-id="${esc(task.id)}" aria-label="move ${esc(task.content)}">
      <option value="">move…</option>${opts}</select>` : '';
  };
  const row = (task, here) => `<div class="tr-item"><span>${esc(task.content)}${task.description ? `<small>${esc(task.description)}</small>` : ''}</span>${dest(task, here)}</div>`;
  box.innerHTML = `${tv.busy ? '<div class="gs-fine">reading Todoist…</div>' : ''}
    ${tv.err ? `<div class="gs-fine bad">${esc(tv.err)}</div>` : ''}
    ${tv.trips.map(t => `<div class="tr-trip card">
        <div class="tr-h"><b>${esc(t.content)}</b><em>${t.items.length} item${t.items.length === 1 ? '' : 's'}${t.due ? ' · due ' + esc(whenWord(t.due)) : ''}</em></div>
        ${t.items.map(i => row(i, t.id)).join('') || '<div class="li-empty">nothing on it yet</div>'}
      </div>`).join('')}
    ${tv.loose.length ? `<div class="sec"><span>no trip <em>${tv.loose.length}</em></span></div>
      <div class="tr-trip card loose">${tv.loose.map(i => row(i, '')).join('')}</div>` : ''}
    ${!tv.busy && !tv.err && !tv.trips.length && !tv.loose.length ? '<div class="li-empty">the grocery section is empty</div>' : ''}
    <div class="sec"><span>a new trip</span></div>
    <div class="rc-acts">${TRIPS.map(t => `<button class="rc-btn" data-sact="trip-new" data-k="${esc(t.key)}">+ ${esc(t.label)} · today</button>`).join('')}
      <button class="rc-btn" data-sact="trips-refresh">refresh</button></div>`;
}
async function moveItem(id, to) {
  if (!tv || !to) return;
  const all = tv.trips.flatMap(t => t.items.map(i => ({ i, from: t }))).concat(tv.loose.map(i => ({ i, from: null })));
  const hit = all.find(x => x.i.id === id); if (!hit) return;
  const was = JSON.parse(JSON.stringify({ trips: tv.trips, loose: tv.loose }));
  const target = to === 'loose' ? null : tv.trips.find(t => 'trip:' + t.id === to);
  if (to !== 'loose' && !target) return;
  if (hit.from) hit.from.items = hit.from.items.filter(x => x.id !== id); else tv.loose = tv.loose.filter(x => x.id !== id);
  if (target) target.items.push(Object.assign({}, hit.i, { parent_id: target.id })); else tv.loose.push(Object.assign({}, hit.i, { parent_id: null }));
  renderTrips();
  try {
    const t = await tdResolveTarget();
    await tdFetch(`/tasks/${encodeURIComponent(id)}/move`, { method: 'POST',
      body: JSON.stringify(target ? { parent_id: target.id } : { section_id: t.sectionId }) });
    toast(target ? `moved to ${target.content}` : 'moved off the trip');
  } catch (e) {
    tv.trips = was.trips; tv.loose = was.loose; renderTrips();
    toast('move failed — ' + (e.message || 'Todoist did not answer'));
  }
}
async function newTrip(kindKey) {
  const kind = TRIPS.find(x => x.key === kindKey); if (!kind || !Creds.token()) return;
  try {
    const t = await tdResolveTarget(), iso = Shell.today();
    await tdFetch('/tasks', { method: 'POST', body: JSON.stringify({
      content: `${kind.label} — ${whenWord(iso)}`, project_id: t.projectId, section_id: t.sectionId, due_date: iso }) });
    toast(`${kind.label} — ${whenWord(iso)}`);
    loadTrips(true);
  } catch (e) { toast('could not make the trip — ' + (e.message || 'Todoist did not answer')); }
}

document.addEventListener('click', ev => {
  const t = ev.target.closest && ev.target.closest('.ns-store [data-sact]');
  if (!t || t.disabled) return;
  const a = t.dataset.sact;
  if (a === 'recipe')   { openRecipe(t.dataset.k); return; }
  if (a === 'scale')    { rcp.scale = +t.dataset.v || 1; renderRecipe(); return; }
  if (a === 'choice')   { rcp.choices[t.dataset.g] = t.dataset.v === '' ? null : t.dataset.v; renderRecipe(); return; }
  if (a === 'side')     { rcp.sides[+t.dataset.i] = t.dataset.v; renderRecipe(); return; }
  if (a === 'inc')      { rcp.include[t.dataset.id] = !rcp.include[t.dataset.id]; renderRecipe(); return; }
  if (a === 'timer')    { timerToggle(t.dataset.k, +t.dataset.i); return; }
  if (a === 'cooked')   { cooked(rcp && rcp.key); return; }
  if (a === 'shop')     { openShop(); return; }
  if (a === 'gs-close') { closeShop(); return; }
  if (a === 'gs-pick')  { gs.pick = t.dataset.v; paintShop(); return; }
  if (a === 'gs-when')  { gs.when = t.dataset.v; gs.date = t.dataset.v === 'tomorrow' ? dayAfter(Shell.today(), 1) : Shell.today(); paintShop(); return; }
  if (a === 'gs-go')    { shopGo(t); return; }
  if (a === 'trips')    { go('trips'); return; }
  if (a === 'trips-refresh') { loadTrips(true); return; }
  if (a === 'trip-new') { newTrip(t.dataset.k); return; }
});
document.addEventListener('change', ev => {
  const el = ev.target;
  if (!el || !el.closest || !el.closest('.ns-store')) return;
  if (el.dataset.sactChange === 'move') { moveItem(el.dataset.id, el.value); return; }
  if (el.id === 'gs-date' && gs) { gs.when = 'date'; gs.date = el.value || Shell.today(); paintShop(); }
});

// Boot
loadState();
renderSteps();
renderHome();
syncTimers();   // a recipe timer left running across a reload keeps running

/* An edited aisle, meal or step amount redraws the list and the tiles at once.
   Items already on the list keep the category they were filed under; only ones
   whose aisle no longer exists fall back to "other". */
Config.subscribe(path => {
  if (path !== '*' && !String(path).startsWith('store.')) return;
  CATEGORIES = Config.get('store.categories');
  MEALS      = Config.get('store.meals');
  readRecipes();
  VOCAB = null;   // the categoriser's vocabulary is built from CATEGORIES; rebuild it
  let moved = false;
  state.list.forEach(it => { if (!CATEGORIES[it.cat]) { it.cat = 'manual'; moved = true; } });
  if (moved) saveState();
  renderSteps();
  renderHome();
  if ($id('s-meals') && $id('s-meals').classList.contains('on')) renderRecipes();
  if ($id('s-recipe') && $id('s-recipe').classList.contains('on')) renderRecipe();
});

// the currency mark reaches nine different readouts and the date label follows
// the date format; one redraw covers them all
Prefs.subscribe(k => { if (k === 'currency' || k === 'dateFormat' || k === '*') renderHome(); });

Shell.register('store', {
  home: () => go('home'),   // the STORE tab tapped while on STORE
  search: q => RECIPES.filter(r => r.name.toLowerCase().includes(q) ||
                                   r.ing.some(i => i.n.toLowerCase().includes(q))).map(r => ({
    title: r.name, sub: 'store · recipe',
    go: () => { Shell.TABS.includes('store') ? Shell.go('store') : Shell.open('store'); openRecipe(r.key); } })),
});

/* A shopping day, for anything outside STORE reading the day back — DATA is
   the only caller. A trip is what was actually finished, so it is the thing
   worth counting, and its spend is the number beside it. */
function tripsOn(iso) {
  const rows = (state.history || []).filter(t => t && t.date === iso);
  return { trips: rows.length,
           /* `cart` is what the in-store counter reached, which is what the trip
              actually cost — the budget beside it is what it was allowed to. */
           spent: rows.reduce((a, t) => a + (+t.cart || 0), 0),
           items: rows.reduce((a, t) => a + (Array.isArray(t.items) ? t.items.length : 0), 0) };
}

return { tripsOn,
         /* for TODAY's export: what was cooked from the recipe library that day */
         cookedOn,
         /* the recipe library and the grocery maths, for the harness and search */
         openRecipe, recipes: () => RECIPES.map(r => r.key), canon,
         groceryFor: (key, scale) => { const r = recipe(key); if (!r) return [];
           const was = rcp; rcp = { key, scale: scale || r.usual, choices: {}, sides: r.sides.map(x => x.options[0] || ''), include: {} };
           const out = groceryLines(linesOfAll(r)); rcp = was; return out; },
         openShop, closeShop, shopGo, loadTrips, moveItem, tripsState: () => tv && JSON.parse(JSON.stringify(tv)),
         go, addCart, resetCart, togglePin, openPad, closePad, padKey, padBack, padClear,
         padCount, padApply, openCartLog, closeCartLog,
         addManual, toggleChecked, setQty, deleteItem, confirmClearList,
         saveTrip, openTripName, closeTripName, confirmTripName,
         openCatPick, closeCatPick, setCat,
         openCategory, addItemAndRefresh, toggleMeal, addMeal,
         restoreTrip, deleteTrip, clearHistory,
         renderSettings, saveBudget, saveTodoist, testTodoist, syncTodoist };
})();
