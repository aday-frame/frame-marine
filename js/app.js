/* ── FRAME MARINE — APP CORE ── */
'use strict';

/* ── STATE ── */
const App = window.App = {
  currentPage: 'dashboard',
  currentVesselId: 'v1',
  panelOpen: false,
  modalOpen: false,
};

/* ── ROUTER ── */
function navTo(pageId, clickedEl) {
  // Hide all pages
  document.querySelectorAll('.page, .page-flex').forEach(p => p.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('active'));
  if (clickedEl) clickedEl.classList.add('active');
  else {
    const match = document.querySelector(`.ni[data-page="${pageId}"]`);
    if (match) match.classList.add('active');
  }

  // Update topbar title
  const titles = {
    dashboard:   'Dashboard',
    'work-orders': 'Work orders',
    requests:    'Requests',
    calendar:    'Calendar',
    monitoring:  'Monitoring',
    assets:      'Assets',
    parts:       'Parts inventory',
    vendors:     'Vendors',
    team:        'Crew',
    chat:        'Chat',
    files:       'Files & docs',
    sops:        'SOPs & procedures',
    settings:    'Settings',
    charter:     'Charter',
    logbook:     'Logbook',
    pms:         'Planned maintenance',
    fleet:       'Tender & fleet',
    checklists:  'Checklists',
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = titles[pageId] || pageId;

  App.currentPage = pageId;

  // Page-specific init
  const inits = {
    'work-orders': () => window.WO && WO.render(),
    dashboard:     () => window.Dash && Dash.render(),
    monitoring:    () => window.Mon && Mon.render(),
    calendar:      () => window.Cal && Cal.render(),
    team:          () => window.Team && Team.render(),
    chat:          () => window.Chat && Chat.render(),
    parts:         () => window.Parts && Parts.render(),
    vendors:       () => window.Vendors && Vendors.render(),
    assets:        () => window.Assets && Assets.render(),
    logbook:       () => window.renderLogbook && renderLogbook(),
    pms:           () => window.renderPMS && renderPMS(),
    fleet:         () => window.renderFleet && renderFleet(),
    checklists:    () => window.renderChecklists && renderChecklists(),
  };
  if (inits[pageId]) inits[pageId]();

  // Close mobile sidebar
  document.getElementById('mob-sb')?.classList.remove('mob-open');
}

/* ── VESSEL SWITCHER ── */
function initVesselPicker() {
  const picker  = document.getElementById('vessel-picker');
  const dropdown = document.getElementById('vessel-dropdown');
  if (!picker || !dropdown) return;

  picker.addEventListener('click', e => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => dropdown.classList.remove('open'));
  dropdown.addEventListener('click', e => e.stopPropagation());

  renderVesselDropdown();
}

function renderVesselDropdown() {
  const dropdown = document.getElementById('vessel-dropdown');
  if (!dropdown) return;

  dropdown.innerHTML = `
    <div class="vessel-opt ${App.currentVesselId === 'all' ? 'active' : ''}" onclick="switchVessel('all')">
      <span class="vessel-opt-dot" style="background:var(--txt3)"></span>
      <div>
        <div class="vessel-opt-name">All vessels</div>
        <div class="vessel-opt-type">Fleet overview</div>
      </div>
      ${App.currentVesselId === 'all' ? '<span class="vessel-opt-check">✓</span>' : ''}
    </div>
    <div class="dropdown-sep"></div>` +
  FM.vessels.map(v => `
    <div class="vessel-opt ${v.id === App.currentVesselId ? 'active' : ''}"
         onclick="switchVessel('${v.id}')">
      <span class="vessel-opt-dot" style="background:${v.color}"></span>
      <div>
        <div class="vessel-opt-name">${v.name}</div>
        <div class="vessel-opt-type">${v.type} · ${v.loa}</div>
      </div>
      ${v.id === App.currentVesselId ? '<span class="vessel-opt-check">✓</span>' : ''}
    </div>
  `).join('') + `
    <div class="dropdown-sep"></div>
    <div class="dropdown-item" onclick="showToast('Vessel management coming soon')">
      <svg viewBox="0 0 16 16" fill="currentColor" style="width:13px;height:13px">
        <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 3.5v3.19l2.28 2.28-1.06 1.06-2.5-2.5A.75.75 0 017.25 8V4.5h1.5z"/>
      </svg>
      Manage vessels
    </div>
  `;
}

function switchVessel(vesselId) {
  App.currentVesselId = vesselId;
  FM.currentVesselId = vesselId;

  if (vesselId === 'all') {
    document.getElementById('vessel-picker-dot').style.background = 'var(--txt3)';
    document.getElementById('vessel-picker-name').textContent = 'All vessels';
    document.getElementById('vessel-picker-type').textContent = 'Fleet overview';
  } else {
    const v = FM.vessels.find(x => x.id === vesselId);
    if (!v) return;
    document.getElementById('vessel-picker-dot').style.background = v.color;
    document.getElementById('vessel-picker-name').textContent = v.name;
    document.getElementById('vessel-picker-type').textContent = v.type;
  }

  document.getElementById('vessel-dropdown').classList.remove('open');
  renderVesselDropdown();

  // Re-render current page for new vessel
  const inits = {
    'work-orders': () => WO?.render(),
    dashboard:     () => Dash?.render(),
    monitoring:    () => Mon?.render(),
    calendar:      () => Cal?.render(),
    team:          () => Team?.render(),
    chat:          () => Chat?.render(),
  };
  if (inits[App.currentPage]) inits[App.currentPage]();

  showToast('Switched to ' + v.name);
}

/* ── MODULE TABS ── */
App.currentModule = 'operations';

function switchModule(mod, el) {
  const locked = ['build', 'insights', 'finance'];
  if (locked.includes(mod)) {
    showToast('Coming soon');
    return;
  }

  document.querySelectorAll('.module-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  App.currentModule = mod;

  const opsSb      = document.querySelector('.sb-scroll');
  const charterSb  = document.getElementById('charter-sb');

  if (mod === 'charter') {
    if (opsSb)     opsSb.style.display     = 'none';
    if (charterSb) charterSb.style.display = 'block';
    // Update new button
    const newBtn = document.getElementById('new-btn');
    if (newBtn) { newBtn.textContent = '+ New charter'; newBtn.onclick = () => showToast('New charter coming soon'); }
    navTo('charter', null);
    setTimeout(() => Charter.render('overview'), 50);
  } else {
    if (opsSb)     opsSb.style.display     = '';
    if (charterSb) charterSb.style.display = 'none';
    const newBtn = document.getElementById('new-btn');
    if (newBtn) {
      newBtn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:12px;height:12px"><path d="M8 2v12M2 8h12"/></svg> New work order`;
      newBtn.onclick = () => WO.openNewModal();
    }
    navTo('dashboard', document.querySelector('.ni[data-page="dashboard"]'));
  }
}

/* ── PANEL ── */
function openPanel(content) {
  const body = document.getElementById('panel-body');
  if (body) body.innerHTML = content;
  document.getElementById('panel').classList.add('open');
  document.getElementById('panel-overlay').classList.add('open');
  App.panelOpen = true;
}

function closePanel() {
  document.getElementById('panel').classList.remove('open');
  document.getElementById('panel-overlay').classList.remove('open');
  App.panelOpen = false;
}

/* ── MODAL ── */
function openModal(content, title) {
  if (title) document.getElementById('modal-title').textContent = title;
  if (content) document.getElementById('modal-body').innerHTML = content;
  document.getElementById('modal-overlay').classList.add('open');
  App.modalOpen = true;
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  App.modalOpen = false;
}

/* ── AI PANEL ── */
function openAI() {
  const content = `
    <div class="ai-messages" id="ai-messages">
      <div class="ai-msg">
        <div class="ai-icon">
          <svg viewBox="0 0 16 16" fill="#080808"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.22 3.22l1.42 1.42M11.36 11.36l1.42 1.42M3.22 12.78l1.42-1.42M11.36 4.64l1.42-1.42" stroke="#080808" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>
        </div>
        <div class="ai-bubble assistant">
          Hi — I'm your Frame AI. I have full context on Lady M: work orders, sensor readings, crew, and upcoming charter.<br><br>
          Ask me anything — "What's still open before the Bermuda charter?" or "What caused the port engine alarm?"
        </div>
      </div>
    </div>
    <div class="ai-input-wrap">
      <textarea class="chat-input" id="ai-input" placeholder="Ask anything about Lady M…" rows="1"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendAI()}"
        oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
      <button class="btn btn-primary" onclick="sendAI()">Send</button>
    </div>
  `;
  openPanel(content);
  document.getElementById('panel-title').textContent = 'Frame AI';
  setTimeout(() => document.getElementById('ai-input')?.focus(), 100);
}

function sendAI() {
  const inp = document.getElementById('ai-input');
  if (!inp || !inp.value.trim()) return;
  const q = inp.value.trim();
  inp.value = '';
  inp.style.height = 'auto';

  const msgs = document.getElementById('ai-messages');
  msgs.innerHTML += `
    <div class="ai-msg user">
      <div class="ai-bubble user">${escHtml(q)}</div>
    </div>
    <div class="ai-msg" id="ai-thinking">
      <div class="ai-icon"><svg viewBox="0 0 16 16" fill="#080808"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="#080808" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg></div>
      <div class="ai-bubble assistant" style="color:var(--txt3)">Thinking…</div>
    </div>
  `;
  msgs.scrollTop = msgs.scrollHeight;

  // Simulate contextual response
  setTimeout(() => {
    const thinking = document.getElementById('ai-thinking');
    if (thinking) thinking.remove();
    const response = getAIResponse(q);
    msgs.innerHTML += `
      <div class="ai-msg">
        <div class="ai-icon"><svg viewBox="0 0 16 16" fill="#080808"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="#080808" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg></div>
        <div class="ai-bubble assistant">${response}</div>
      </div>
    `;
    msgs.scrollTop = msgs.scrollHeight;
  }, 900);
}

function getAIResponse(q) {
  const ql = q.toLowerCase();
  if (ql.includes('charter') || ql.includes('bermuda')) {
    return 'Before the Bermuda charter (5 May), 3 items need clearing:<br><br>• <b>WO-001</b> — Port engine coolant temp. CAT thermostat ordered, ETA 2 May. Dmitri is on it.<br>• <b>WO-003</b> — GS2 A/C not cooling. Refrigerant check needed today.<br>• <b>WO-004</b> — Provisions delivery must land by 4 May.<br><br>Stabilizer weep (WO-002) is monitored but non-blocking.';
  }
  if (ql.includes('engine') || ql.includes('coolant')) {
    return 'Port CAT C32 is throwing high coolant temp at 91°C — 17°C above normal operating temp. Thermostat (p/n 2W-8900) is suspected and on order from CAT Fort Lauderdale. Dmitri logged two prior events in 48h. Starboard engine is running clean at 82°C.';
  }
  if (ql.includes('bilge')) {
    return 'Current bilge readings: Engine Room 2%, Bow Thruster 0%, Lazarette 8% (elevated — Dmitri flagged this in chat), Tender Garage 1%. Lazarette is above normal — source investigation is in progress.';
  }
  if (ql.includes('fuel')) {
    return 'Lady M fuel status: Main port tank 72%, Stbd 68%, Day tank 85%. Total approx 22,720L of 32,000L capacity. Sufficient for Bermuda round-trip at cruise speed without refuelling.';
  }
  return 'I have context on all Lady M systems, work orders, and crew. Try asking about a specific system, upcoming tasks, or charter readiness.';
}

/* ── TOAST ── */
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'show' + (type ? ' toast-' + type : '');
  clearTimeout(App._toastTimer);
  App._toastTimer = setTimeout(() => { t.className = ''; }, 2800);
}

/* ── HELPERS ── */
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function fmt(n, unit='') {
  return n + (unit ? ' ' + unit : '');
}

/* ── KEYBOARD ── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (App.panelOpen) closePanel();
    else if (App.modalOpen) closeModal();
  }
});

/* ── OFFLINE ── */
function initOffline() {
  const banner = document.getElementById('offline-banner');
  if (!banner) return;

  function update() {
    if (navigator.onLine) {
      banner.classList.remove('visible');
    } else {
      banner.classList.add('visible');
    }
  }

  window.addEventListener('online',  update);
  window.addEventListener('offline', update);
  update();
}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => {
  initVesselPicker();
  initOffline();
  navTo('dashboard');

  // Unregister any existing service workers so files always load fresh
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  }
});
