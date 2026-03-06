import './style.css';

// ── Themes ─────────────────────────────────────────────────────
const THEMES = {
  mocha: {
    label: 'mocha',
    color: '#a6e3a1',
    vars: {
      '--bg': '#1e1e2e', '--surface': '#181825', '--surface-deep': '#11111b',
      '--green': '#a6e3a1', '--green-dim': '#3d6147', '--green-muted': '#2a4033',
      '--amber': '#f9e2af', '--red': '#f38ba8', '--cyan': '#89b4fa',
      '--white': '#cdd6f4', '--muted': '#6c7086', '--border': '#313244',
    },
  },
  dracula: {
    label: 'dracula',
    color: '#50fa7b',
    vars: {
      '--bg': '#282a36', '--surface': '#21222c', '--surface-deep': '#191a21',
      '--green': '#50fa7b', '--green-dim': '#1f6b35', '--green-muted': '#12401f',
      '--amber': '#ffb86c', '--red': '#ff5555', '--cyan': '#8be9fd',
      '--white': '#f8f8f2', '--muted': '#6272a4', '--border': '#44475a',
    },
  },
  nord: {
    label: 'nord',
    color: '#a3be8c',
    vars: {
      '--bg': '#2e3440', '--surface': '#242933', '--surface-deep': '#1e2229',
      '--green': '#a3be8c', '--green-dim': '#4a6741', '--green-muted': '#2e4028',
      '--amber': '#ebcb8b', '--red': '#bf616a', '--cyan': '#88c0d0',
      '--white': '#eceff4', '--muted': '#4c566a', '--border': '#3b4252',
    },
  },
  gruvbox: {
    label: 'gruvbox',
    color: '#b8bb26',
    vars: {
      '--bg': '#282828', '--surface': '#1d2021', '--surface-deep': '#141617',
      '--green': '#b8bb26', '--green-dim': '#5a5a10', '--green-muted': '#32320a',
      '--amber': '#fabd2f', '--red': '#fb4934', '--cyan': '#83a598',
      '--white': '#ebdbb2', '--muted': '#928374', '--border': '#3c3836',
    },
  },
  tokyo: {
    label: 'tokyo',
    color: '#9ece6a',
    vars: {
      '--bg': '#1a1b26', '--surface': '#16161e', '--surface-deep': '#0d0e17',
      '--green': '#9ece6a', '--green-dim': '#3d5a2a', '--green-muted': '#243318',
      '--amber': '#e0af68', '--red': '#f7768e', '--cyan': '#7dcfff',
      '--white': '#c0caf5', '--muted': '#565f89', '--border': '#292e42',
    },
  },
};

function applyTheme(name) {
  const theme = THEMES[name];
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem('hp_theme', name);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === name);
  });
}

function renderThemeSwitcher() {
  const container = document.getElementById('theme-switcher');
  const current = localStorage.getItem('hp_theme') || 'mocha';
  container.innerHTML = '';
  Object.entries(THEMES).forEach(([name, theme]) => {
    const btn = document.createElement('button');
    btn.className = 'theme-btn' + (name === current ? ' active' : '');
    btn.dataset.theme = name;
    btn.title = theme.label;
    btn.style.background = theme.color;
    btn.addEventListener('click', () => applyTheme(name));
    container.appendChild(btn);
  });
}

// ── ASCII art ──────────────────────────────────────────────────
const ASCII = `
  ██╗  ██╗ ██████╗ ███╗   ███╗███████╗
  ██║  ██║██╔═══██╗████╗ ████║██╔════╝
  ███████║██║   ██║██╔████╔██║█████╗
  ██╔══██║██║   ██║██║╚██╔╝██║██╔══╝
  ██║  ██║╚██████╔╝██║ ╚═╝ ██║███████╗
  ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝`.trimStart();

document.getElementById('ascii-header').textContent = ASCII;

// date/uptime
const now = new Date();
const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
document.getElementById('boot-info').textContent =
  `Last login: ${days[now.getDay()]} ${months[now.getMonth()]} ${String(now.getDate()).padStart(2)} ` +
  `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')} — ` +
  `~/homepage v1.0.0`;

// ── Storage ────────────────────────────────────────────────────
const DEFAULT = [
  { alias: 'github',   url: 'https://github.com',  category: 'dev' },
  { alias: 'claude',   url: 'https://claude.ai',   category: 'dev' },
  { alias: 'chatgpt',  url: 'https://chatgpt.com', category: 'dev' },
  { alias: 'youtube',  url: 'https://youtube.com', category: 'social' },
  { alias: 'twitter',  url: 'https://x.com',       category: 'social' },
  { alias: 'reddit',   url: 'https://reddit.com',  category: 'social' },
];

function load() {
  try {
    const d = localStorage.getItem('hp_bookmarks');
    return d ? JSON.parse(d) : [...DEFAULT];
  } catch { return [...DEFAULT]; }
}

function save(data) { localStorage.setItem('hp_bookmarks', JSON.stringify(data)); }

function loadCollapsed() {
  try { return new Set(JSON.parse(localStorage.getItem('hp_collapsed') || '[]')); }
  catch { return new Set(); }
}

function saveCollapsed(set) {
  localStorage.setItem('hp_collapsed', JSON.stringify([...set]));
}

// ── Render bookmarks ───────────────────────────────────────────
function render() {
  const data = load();
  const list = document.getElementById('site-list');
  const empty = document.getElementById('empty-msg');
  list.innerHTML = '';

  if (data.length === 0) { empty.style.display = ''; return; }
  empty.style.display = 'none';

  const collapsed = loadCollapsed();

  const groups = {};
  data.forEach((item, i) => {
    const cat = item.category || 'general';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push({ ...item, _idx: i });
  });

  Object.entries(groups).forEach(([cat, items]) => {
    const isCollapsed = collapsed.has(cat);

    const group = document.createElement('div');
    group.className = 'cat-group';

    const header = document.createElement('div');
    header.className = 'cat-header' + (isCollapsed ? ' collapsed' : '');
    header.innerHTML = `
      <span class="cat-toggle">▼</span>
      <span class="cat-name">[${esc(cat)}]</span>
      <span class="cat-line">${'─'.repeat(40)}</span>
      <span class="cat-count">${items.length}</span>
    `;
    header.addEventListener('click', () => toggleCat(cat));

    const body = document.createElement('div');
    body.className = 'cat-body' + (isCollapsed ? ' collapsed' : '');
    body.id = 'cat-' + cat;

    const siteList = document.createElement('div');
    siteList.className = 'site-list';

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'site-row';
      row.innerHTML = `
        <span class="alias">${esc(item.alias)}</span>
        <span class="arrow">→</span>
        <a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.url)}</a>
        <button class="del-btn" data-idx="${item._idx}" title="rm">✕</button>
      `;
      row.querySelector('.del-btn').addEventListener('click', () => deleteSite(item._idx));
      siteList.appendChild(row);
    });

    body.appendChild(siteList);
    group.appendChild(header);
    group.appendChild(body);
    list.appendChild(group);
  });
}

function toggleCat(cat) {
  const collapsed = loadCollapsed();
  const header = [...document.querySelectorAll('.cat-header')]
    .find(h => h.querySelector('.cat-name').textContent === `[${cat}]`);
  const body = document.getElementById('cat-' + cat);

  if (collapsed.has(cat)) {
    collapsed.delete(cat);
    header && header.classList.remove('collapsed');
    body && body.classList.remove('collapsed');
  } else {
    collapsed.add(cat);
    header && header.classList.add('collapsed');
    body && body.classList.add('collapsed');
  }
  saveCollapsed(collapsed);
}

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Delete ─────────────────────────────────────────────────────
function deleteSite(i) {
  const data = load();
  const removed = data.splice(i, 1)[0];
  save(data);
  render();
  log(`removed: ${removed.alias}`, 'ok');
}

// ── Output log ─────────────────────────────────────────────────
function log(msg, type = 'info') {
  const logEl = document.getElementById('output-log');
  const line = document.createElement('div');
  line.className = `output ${type}`;
  const prefix = type === 'ok' ? '✓ ' : type === 'err' ? '✗ ' : '  ';
  line.textContent = prefix + msg;
  logEl.appendChild(line);
  while (logEl.children.length > 10) logEl.removeChild(logEl.firstChild);
  scrollBottom();
}

function scrollBottom() {
  const t = document.getElementById('terminal');
  t.scrollTop = t.scrollHeight;
}

// ── Commands ───────────────────────────────────────────────────
const COMMANDS = {
  help() {
    const lines = [
      ['g <query>',    'search on google'],
      ['add',          'add a new bookmark'],
      ['rm <alias>',   'remove a bookmark'],
      ['ls',           'list all bookmarks'],
      ['open <alias>', 'open a site'],
      ['note',         'open notes'],
      ['theme <name>', 'switch theme'],
      ['clear',        'clear output'],
    ];
    lines.forEach(([cmd, desc]) => {
      log(`  ${cmd.padEnd(18)} ${desc}`, 'info');
    });
  },

  g(args) {
    const q = args.join(' ');
    if (!q) { log('usage: g <query>', 'err'); return; }
    window.open('https://www.google.com/search?q=' + encodeURIComponent(q), '_blank');
    log(`searching: ${q}`, 'ok');
  },

  add() { openModal(); },

  ls() {
    const data = load();
    if (data.length === 0) { log('no bookmarks', 'info'); return; }
    data.forEach(d => log(`  ${d.alias.padEnd(18)} ${d.url}`, 'info'));
  },

  rm(args) {
    const alias = args[0];
    if (!alias) { log('usage: rm <alias>', 'err'); return; }
    const data = load();
    const idx = data.findIndex(d => d.alias === alias);
    if (idx === -1) { log(`not found: ${alias}`, 'err'); return; }
    data.splice(idx, 1);
    save(data);
    render();
    log(`removed: ${alias}`, 'ok');
  },

  open(args) {
    const alias = args[0];
    if (!alias) { log('usage: open <alias>', 'err'); return; }
    const data = load();
    const item = data.find(d => d.alias === alias);
    if (!item) { log(`not found: ${alias}`, 'err'); return; }
    window.open(item.url, '_blank');
    log(`opening ${item.url}`, 'ok');
  },

  note() {
    const body = document.getElementById('notes-body');
    const area = document.getElementById('notes-area');
    const open = body.style.display === 'none';
    body.style.display = open ? '' : 'none';
    if (open) { area.focus(); log('notes opened', 'ok'); }
    else log('notes closed', 'info');
  },

  theme(args) {
    const name = args[0];
    if (!name) {
      const current = localStorage.getItem('hp_theme') || 'mocha';
      Object.keys(THEMES).forEach(t => {
        log(`  ${t.padEnd(12)} ${t === current ? '← active' : ''}`, 'info');
      });
      return;
    }
    if (!THEMES[name]) { log(`unknown theme: ${name}`, 'err'); return; }
    applyTheme(name);
    log(`theme: ${name}`, 'ok');
  },

  clear() {
    document.getElementById('output-log').innerHTML = '';
  },
};

// ── Input handler ──────────────────────────────────────────────
const input = document.getElementById('cmd-input');

document.getElementById('terminal').addEventListener('click', (e) => {
  if (!window.getSelection().toString()) input.focus();
});

input.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  const raw = this.value.trim();
  this.value = '';
  if (!raw) return;

  const [cmd, ...args] = raw.split(/\s+/);

  if (COMMANDS[cmd]) {
    COMMANDS[cmd](args);
  } else {
    const data = load();
    const item = data.find(d => d.alias === cmd);
    if (item) {
      window.open(item.url, '_blank');
      log(`opening ${item.url}`, 'ok');
    } else {
      log(`command not found: ${cmd} — type 'help'`, 'err');
    }
  }
  scrollBottom();
});

// ── Modal ──────────────────────────────────────────────────────
function openModal() {
  document.getElementById('m-alias').value = '';
  document.getElementById('m-url').value = '';
  document.getElementById('m-cat').value = '';
  document.getElementById('modal').classList.add('open');
  document.getElementById('m-alias').focus();
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  input.focus();
}

function addSite() {
  const alias = document.getElementById('m-alias').value.trim().replace(/\s+/g,'-').toLowerCase();
  let url = document.getElementById('m-url').value.trim();
  const category = document.getElementById('m-cat').value.trim().replace(/\s+/g,'-').toLowerCase() || 'general';
  if (!alias || !url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  const data = load();
  data.push({ alias, url, category });
  save(data);
  render();
  closeModal();
  log(`added: ${alias} → ${url} [${category}]`, 'ok');
}

document.getElementById('cancel-btn').addEventListener('click', closeModal);
document.getElementById('add-btn').addEventListener('click', addSite);

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

['m-alias','m-url','m-cat'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (id === 'm-alias') document.getElementById('m-url').focus();
      else if (id === 'm-url') document.getElementById('m-cat').focus();
      else addSite();
    }
    if (e.key === 'Escape') closeModal();
  });
});

// ── Notes auto-save ────────────────────────────────────────────
const notesArea = document.getElementById('notes-area');
const notesSaved = document.getElementById('notes-saved');
let saveTimer;

notesArea.value = localStorage.getItem('hp_notes') || '';

notesArea.addEventListener('input', () => {
  clearTimeout(saveTimer);
  notesSaved.textContent = '';
  saveTimer = setTimeout(() => {
    localStorage.setItem('hp_notes', notesArea.value);
    notesSaved.textContent = 'saved';
    setTimeout(() => { notesSaved.textContent = ''; }, 2000);
  }, 600);
});

notesArea.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = notesArea.selectionStart;
    notesArea.value = notesArea.value.slice(0,s) + '  ' + notesArea.value.slice(notesArea.selectionEnd);
    notesArea.selectionStart = notesArea.selectionEnd = s + 2;
  }
  if (e.key === 'Escape') { input.focus(); }
});

// ── Pixel character animation ───────────────────────────────────
(function() {
  const canvas = document.getElementById('pixel-char');
  const ctx = canvas.getContext('2d');
  const P = 3;

  const SKN = '#ffcc88';
  const HAI = '#2a1500';
  const SHT = '#2a5fa0';
  const DSK = '#6b4f28';
  const MNF = '#5a5a6e';
  const SCR = '#001206';
  const SCG = '#00cc55';
  const TBG = '#dde0f4';
  const TBD = '#8888bb';
  const DOT = '#2233cc';

  function px(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * P, y * P, P, P);
  }

  let frame = 0;
  let blinkTimer = 0;
  let nextBlink = 80 + Math.floor(Math.random() * 100);
  let isBlinking = false;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const phase    = Math.floor(frame / 22) % 5;
    const dotCount = phase <= 3 ? phase : 0;

    for (let x = 2; x <= 8; x++) { px(x, 0, TBD); px(x, 4, TBD); }
    px(1, 1, TBD); px(1, 2, TBD); px(1, 3, TBD);
    px(9, 1, TBD); px(9, 2, TBD); px(9, 3, TBD);
    for (let y = 1; y <= 3; y++)
      for (let x = 2; x <= 8; x++)
        px(x, y, TBG);
    if (dotCount >= 1) px(3, 2, DOT);
    if (dotCount >= 2) px(5, 2, DOT);
    if (dotCount >= 3) px(7, 2, DOT);

    px(4, 5, TBD);
    px(4, 6, TBD);

    for (let x = 3; x <= 6; x++) px(x, 7, HAI);
    for (let y = 8; y <= 9; y++) {
      px(2, y, HAI);
      for (let x = 3; x <= 6; x++) px(x, y, SKN);
      px(7, y, HAI);
    }
    if (!isBlinking) {
      px(3, 8, HAI); px(6, 8, HAI);
    } else {
      px(3, 8, HAI); px(4, 8, HAI);
      px(5, 8, HAI); px(6, 8, HAI);
    }
    px(4, 9, HAI); px(5, 9, HAI);
    for (let x = 2; x <= 7; x++) px(x, 10, HAI);

    for (let y = 11; y <= 12; y++)
      for (let x = 3; x <= 6; x++)
        px(x, y, SHT);

    for (let x = 7; x <= 11; x++) px(x, 12, SKN);

    for (let x = 13; x <= 21; x++) { px(x, 6, MNF); px(x, 10, MNF); }
    for (let y = 6; y <= 10; y++)   { px(13, y, MNF); px(21, y, MNF); }
    for (let y = 7; y <= 9; y++)
      for (let x = 14; x <= 20; x++)
        px(x, y, SCR);
    px(15, 7, SCG); px(16, 7, SCG); px(17, 7, SCG); px(18, 7, SCG);
    px(15, 8, SCG); px(16, 8, SCG); px(17, 8, SCG);
    if (frame % 55 < 38) px(15, 9, SCG);
    px(17, 11, MNF); px(17, 12, MNF);

    for (let x = 0; x <= 23; x++) px(x, 13, DSK);

    blinkTimer++;
    if (!isBlinking && blinkTimer >= nextBlink) {
      isBlinking = true; blinkTimer = 0;
    } else if (isBlinking && blinkTimer >= 4) {
      isBlinking = false; blinkTimer = 0;
      nextBlink = 80 + Math.floor(Math.random() * 100);
    }

    frame++;
    requestAnimationFrame(draw);
  }

  draw();
})();

// ── Init ───────────────────────────────────────────────────────
applyTheme(localStorage.getItem('hp_theme') || 'mocha');
renderThemeSwitcher();
render();
input.focus();
