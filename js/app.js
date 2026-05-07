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
function navTo(pageId, clickedEl, skipPush) {
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
    fleet:       'Tenders',
    owner:       'Owner',
    checklists:    'Checklists',
    owner:         'Owner view',
    certificates:  'Certificates',
    safety:        'Safety & ISM',
    inventory:     'Inventory',
    budget:        'Budget',
    hours:         'Hours of rest',
    documents:     'Docs',
    requests:      'Requests',
    hub:           'Hub',
    reports:       'Reports',
    kb:            'Manuals',
    notifications: 'Notifications',
    portfolio:     'Portfolio',
  };
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = titles[pageId] || pageId;

  App.currentPage = pageId;
  if (!skipPush) history.pushState(null, '', '/' + pageId);

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
    owner:         () => window.Owner && Owner.render(),
    certificates:  () => window.Certs && Certs.render(),
    safety:        () => window.Safety && Safety.render(),
    inventory:     () => window.Inventory && Inventory.render(),
    budget:        () => window.Budget && Budget.render(),
    hours:         () => window.Hours && Hours.render(),
    documents:     () => window.Documents && Documents.render(),
    requests:      () => window.Requests && Requests.render(),
    hub:           () => window.Hub && Hub.render(),
    reports:       () => window.Reports && Reports.render(),
    kb:            () => window.KB && KB.render(),
    notifications: () => renderNotifications(),
    settings:      () => window.Settings && Settings.init(),
    portfolio:     () => window.renderPortfolio && renderPortfolio(),
  };
  if (inits[pageId]) inits[pageId]();

  // Scroll content to top
  document.querySelector('.page-body')?.scrollTo(0, 0);

  // Close mobile sidebar + backdrop
  document.getElementById('mob-sb')?.classList.remove('mob-open');
  document.getElementById('mob-backdrop')?.classList.remove('open');

  // Sync mobile bottom nav active state
  document.querySelectorAll('.mob-nav-item[id^="mobnav-"]').forEach(b => b.classList.remove('active'));
  const mobNavBtn = document.getElementById('mobnav-' + pageId);
  if (mobNavBtn) mobNavBtn.classList.add('active');

  // Update WO badge count
  const woCount = (FM.openWOs(App.currentVesselId) || []).length;
  ['sb-wo-count', 'mobnav-wo-badge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = woCount; el.style.display = woCount ? '' : 'none'; }
  });

  // Update cert expiry badge
  if (window.Certs) Certs.updateSidebarBadge();

  // Update open NC badge
  const ncCount = (FM.nonConformances || []).filter(n => {
    const cr = FM.currentVessel();
    return n.vessel === (cr && cr.id) && n.status === 'open';
  }).length;
  const ncEl = document.getElementById('sb-nc-count');
  if (ncEl) { ncEl.textContent = ncCount; ncEl.style.display = ncCount ? '' : 'none'; }

  // Show FAB only on work-orders page
  const fab = document.getElementById('mob-fab');
  if (fab) {
    const show = pageId === 'work-orders';
    fab.classList.toggle('mob-fab-show', show);
    fab.style.display   = show ? '' : 'none';
    fab.style.visibility = show ? '' : 'hidden';
  }
}

/* ── MOBILE SIDEBAR TOGGLE ── */
function toggleMobSidebar() {
  const sb = document.getElementById('mob-sb');
  const bd = document.getElementById('mob-backdrop');
  if (!sb) return;
  const isOpen = sb.classList.contains('mob-open');
  sb.classList.toggle('mob-open', !isOpen);
  bd?.classList.toggle('open', !isOpen);
}
window.toggleMobSidebar = toggleMobSidebar;

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

  const cur = App.currentVesselId;
  const totalAssets = FM.vessels.length + (FM.properties || []).length;

  dropdown.innerHTML = `
    <div class="vessel-opt ${cur === 'portfolio' ? 'active' : ''}" onclick="switchVessel('portfolio')">
      <span class="vessel-opt-dot" style="background:linear-gradient(135deg,#F97316,#A78BFA)"></span>
      <div>
        <div class="vessel-opt-name">Portfolio</div>
        <div class="vessel-opt-type">${totalAssets} assets</div>
      </div>
      ${cur === 'portfolio' ? '<span class="vessel-opt-check">✓</span>' : ''}
    </div>
    <div class="dropdown-sep"></div>
    <div style="padding:4px 12px 2px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#60A5FA">Marine</div>` +
  FM.vessels.map(v => `
    <div class="vessel-opt ${v.id === cur ? 'active' : ''}" onclick="switchVessel('${v.id}')">
      <span class="vessel-opt-dot" style="background:${v.color}"></span>
      <div>
        <div class="vessel-opt-name">${v.name}</div>
        <div class="vessel-opt-type">${v.type} · ${v.loa}</div>
      </div>
      ${v.id === cur ? '<span class="vessel-opt-check">✓</span>' : ''}
    </div>
  `).join('') + `
    <div class="dropdown-sep"></div>
    <div style="padding:4px 12px 2px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#4ADE80">Properties</div>` +
  (FM.properties || []).map(p => `
    <div class="vessel-opt ${p.id === cur ? 'active' : ''}" onclick="switchVessel('${p.id}')">
      <span class="vessel-opt-dot" style="background:${p.color}"></span>
      <div>
        <div class="vessel-opt-name">${p.name}</div>
        <div class="vessel-opt-type">${p.type} · ${p.location}</div>
      </div>
      ${p.id === cur ? '<span class="vessel-opt-check">✓</span>' : ''}
    </div>
  `).join('') + `
    <div class="dropdown-sep"></div>
    <div class="dropdown-item" onclick="openManageVessels()">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" style="width:13px;height:13px">
        <circle cx="8" cy="8" r="6"/><path d="M8 5v6M5 8h6"/>
      </svg>
      Manage assets
    </div>
  `;
}

function switchVessel(vesselId) {
  App.currentVesselId = vesselId;
  FM.currentVesselId = vesselId;

  const dot  = document.getElementById('vessel-picker-dot');
  const name = document.getElementById('vessel-picker-name');
  const type = document.getElementById('vessel-picker-type');

  if (vesselId === 'portfolio') {
    dot.style.background = 'linear-gradient(135deg,#F97316,#A78BFA)';
    name.textContent = 'Portfolio';
    type.textContent = (FM.vessels.length + (FM.properties||[]).length) + ' assets';
  } else if (vesselId === 'all') {
    dot.style.background = 'var(--txt3)';
    name.textContent = 'All vessels';
    type.textContent = 'Fleet overview';
  } else {
    const v = FM.vessels.find(x => x.id === vesselId);
    const p = (FM.properties || []).find(x => x.id === vesselId);
    if (v) {
      dot.style.background = v.color;
      name.textContent = v.name;
      type.textContent = v.type;
    } else if (p) {
      dot.style.background = p.color;
      name.textContent = p.name;
      type.textContent = p.type;
    }
  }

  document.getElementById('vessel-dropdown').classList.remove('open');
  renderVesselDropdown();

  if (vesselId === 'portfolio') {
    navTo('portfolio', document.querySelector('.ni[data-page="portfolio"]'));
    return;
  }

  if (vesselId === 'all') {
    navTo('dashboard', document.querySelector('.ni[data-page="dashboard"]'));
    return;
  }

  // If switching to a property, go to portfolio view
  if ((FM.properties || []).find(x => x.id === vesselId)) {
    navTo('portfolio', document.querySelector('.ni[data-page="portfolio"]'));
    return;
  }

  // Re-render current page for the new vessel
  const inits = {
    'work-orders': () => WO?.render(),
    dashboard:     () => Dash?.render(),
    monitoring:    () => Mon?.render(),
    calendar:      () => Cal?.render(),
    team:          () => Team?.render(),
    chat:          () => Chat?.render(),
    safety:        () => Safety?.render(),
    inventory:     () => Inventory?.render(),
    requests:      () => Requests?.render(),
    certificates:  () => Certs?.render(),
    logbook:       () => window.renderLogbook?.(),
    pms:           () => window.renderPMS?.(),
    fleet:         () => window.renderFleet?.(),
    documents:     () => Documents?.render(),
    hours:         () => Hours?.render(),
    kb:            () => KB?.render(),
    reports:       () => Reports?.render(),
    checklists:    () => window.renderChecklists?.(),
    budget:        () => Budget?.render(),
    hub:           () => Hub?.render(),
    owner:         () => Owner?.render(),
  };
  if (inits[App.currentPage]) inits[App.currentPage]();

  const vLabel = FM.vessels.find(x => x.id === vesselId)?.name || vesselId;
  showToast('Switched to ' + vLabel);
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
  const footer = document.getElementById('modal-footer');
  if (footer) footer.style.display = '';
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

/* ── MANAGE VESSELS ── */
function openManageVessels() {
  document.getElementById('vessel-dropdown').classList.remove('open');
  const vesselRows = FM.vessels.map(v => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:.5px solid var(--bd)">
      <div style="width:10px;height:10px;border-radius:50%;background:${v.color};flex-shrink:0"></div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500;color:var(--txt)">${escHtml(v.name)}</div>
        <div style="font-size:11px;color:var(--txt3)">${escHtml(v.type)} · ${escHtml(v.loa)} · ${escHtml(v.flag)}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-ghost btn-xs" onclick="openTransferVessel('${v.id}')">Transfer</button>
        <button class="btn btn-danger btn-xs" onclick="confirmDeleteVessel('${v.id}','${escHtml(v.name).replace(/'/g,"\\'")}')">Remove</button>
      </div>
    </div>`).join('');

  const propRows = (FM.properties || []).map(p => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:.5px solid var(--bd)">
      <div style="width:10px;height:10px;border-radius:50%;background:${p.color};flex-shrink:0"></div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500;color:var(--txt)">${escHtml(p.name)}</div>
        <div style="font-size:11px;color:var(--txt3)">${escHtml(p.type)} · ${escHtml(p.location)}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-danger btn-xs" onclick="deleteProperty('${p.id}','${escHtml(p.name).replace(/'/g,"\\'")}')">Remove</button>
      </div>
    </div>`).join('');

  openModal(`
    <div style="display:flex;flex-direction:column;gap:20px">
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#60A5FA;margin-bottom:12px">Marine</div>
        ${vesselRows}
        <button class="btn btn-ghost btn-sm" style="margin-top:10px;width:100%" onclick="openAddVessel()">+ Add vessel</button>
      </div>
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:#4ADE80;margin-bottom:12px">Properties</div>
        ${propRows || '<div style="font-size:12px;color:var(--txt3);padding:8px 0">No properties added yet.</div>'}
        <button class="btn btn-ghost btn-sm" style="margin-top:10px;width:100%" onclick="openAddProperty()">+ Add property</button>
      </div>
      <div style="font-size:11px;color:var(--txt4);text-align:center">To transfer a vessel, the new owner must have a Frame account.</div>
    </div>
  `, 'Manage assets');
}
window.openManageVessels = openManageVessels;

function openAddVessel() {
  openModal(`
    <form onsubmit="saveNewVessel(event)" style="display:flex;flex-direction:column;gap:14px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Vessel name *</label>
          <input class="inp" id="av-name" placeholder="Lady M" required>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Type *</label>
          <select class="inp" id="av-type">
            <option>Motor Yacht</option><option>Sailing Yacht</option><option>Catamaran</option><option>Superyacht</option><option>RIB</option><option>Other</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">LOA *</label>
          <input class="inp" id="av-loa" placeholder="48m">
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Flag state</label>
          <input class="inp" id="av-flag" placeholder="CYM">
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Home port</label>
          <input class="inp" id="av-port" placeholder="Gustavia, St. Barths">
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">MMSI</label>
          <input class="inp" id="av-mmsi" placeholder="319123456">
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
        <button type="button" class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm">Add vessel</button>
      </div>
    </form>
  `, 'Add vessel');
}
window.openAddVessel = openAddVessel;

function saveNewVessel(e) {
  e.preventDefault();
  const name = document.getElementById('av-name').value.trim();
  const type = document.getElementById('av-type').value;
  const loa  = document.getElementById('av-loa').value.trim();
  const flag = document.getElementById('av-flag').value.trim() || 'INT';
  const port = document.getElementById('av-port').value.trim();
  const mmsi = document.getElementById('av-mmsi').value.trim();
  if (!name || !loa) return;
  const colors = ['#60A5FA','#4ADE80','#F87171','#FACC15','#A78BFA','#2DD4BF'];
  const newV = {
    id: 'v' + Date.now(), name, type, loa, flag, port: port || 'Unknown', mmsi: mmsi || '',
    color: colors[FM.vessels.length % colors.length], status: 'In service',
    zones: [], systems: [],
  };
  FM.vessels.push(newV);
  renderVesselDropdown();
  closeModal();
  showToast(name + ' added', 'ok');
}
window.saveNewVessel = saveNewVessel;

function openAddProperty() {
  openModal(`
    <form onsubmit="saveNewProperty(event)" style="display:flex;flex-direction:column;gap:14px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Property name *</label>
          <input class="inp" id="ap-name" placeholder="Mallorca Villa" required>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Type *</label>
          <select class="inp" id="ap-type">
            <option>Villa</option><option>Apartment</option><option>Chalet</option><option>Condo</option><option>Estate</option><option>Penthouse</option><option>Other</option>
          </select>
        </div>
        <div style="grid-column:1/-1">
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Location *</label>
          <input class="inp" id="ap-location" placeholder="Palma, Mallorca" required>
        </div>
        <div style="grid-column:1/-1">
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Description</label>
          <input class="inp" id="ap-desc" placeholder="e.g. 6BR villa with pool and sea views">
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
        <button type="button" class="btn btn-ghost btn-sm" onclick="openManageVessels()">Back</button>
        <button type="submit" class="btn btn-primary btn-sm">Add property</button>
      </div>
    </form>
  `, 'Add property');
}
window.openAddProperty = openAddProperty;

function saveNewProperty(e) {
  e.preventDefault();
  const name     = document.getElementById('ap-name').value.trim();
  const type     = document.getElementById('ap-type').value;
  const location = document.getElementById('ap-location').value.trim();
  const desc     = document.getElementById('ap-desc').value.trim();
  if (!name || !location) return;
  const colors = ['#F97316','#60A5FA','#A78BFA','#4ADE80','#FACC15','#F87171'];
  const newP = {
    id: 'p' + Date.now(), name, type, location, desc,
    color: colors[(FM.properties || []).length % colors.length],
    status: 'vacant', guests: 0, checkIn: null, checkOut: null,
    staff: 0, openIssues: 0,
  };
  if (!FM.properties) FM.properties = [];
  FM.properties.push(newP);
  renderVesselDropdown();
  closeModal();
  showToast(name + ' added', 'ok');
}
window.saveNewProperty = saveNewProperty;

function deleteProperty(id, name) {
  if (!confirm('Remove ' + name + ' from your portfolio?')) return;
  FM.properties = (FM.properties || []).filter(p => p.id !== id);
  if (App.currentVesselId === id) switchVessel(FM.vessels[0]?.id || 'v1');
  renderVesselDropdown();
  closeModal();
  showToast(name + ' removed');
}
window.deleteProperty = deleteProperty;

function openTransferVessel(vesselId) {
  const v = FM.vessels.find(x => x.id === vesselId);
  if (!v) return;
  openModal(`
    <div style="display:flex;flex-direction:column;gap:16px">
      <p style="font-size:13px;color:var(--txt2);line-height:1.6">Transfer <strong style="color:var(--txt)">${escHtml(v.name)}</strong> to another Frame account. The new owner will be invited to accept the transfer.</p>
      <div>
        <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">New owner email *</label>
        <input class="inp" id="transfer-email" placeholder="captain@example.com" type="email">
      </div>
      <div>
        <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Reason (optional)</label>
        <input class="inp" id="transfer-reason" placeholder="Sale, management change…">
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="submitTransfer('${vesselId}','${escHtml(v.name).replace(/'/g,"\\'")}')">Send transfer request</button>
      </div>
    </div>
  `, 'Transfer vessel');
}
window.openTransferVessel = openTransferVessel;

function submitTransfer(vesselId, name) {
  const email = (document.getElementById('transfer-email')?.value || '').trim();
  if (!email) { showToast('Enter a valid email', 'err'); return; }
  closeModal();
  showToast('Transfer request sent to ' + email, 'ok');
}
window.submitTransfer = submitTransfer;

function confirmDeleteVessel(vesselId, name) {
  openModal(`
    <div style="display:flex;flex-direction:column;gap:16px">
      <p style="font-size:13px;color:var(--txt2);line-height:1.6">Remove <strong style="color:var(--txt)">${escHtml(name)}</strong> from your account? All associated data (work orders, documents, logs) will be archived.</p>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
        <button class="btn btn-danger btn-sm" onclick="deleteVessel('${vesselId}')">Remove vessel</button>
      </div>
    </div>
  `, 'Remove vessel');
}
window.confirmDeleteVessel = confirmDeleteVessel;

function deleteVessel(vesselId) {
  FM.vessels = FM.vessels.filter(v => v.id !== vesselId);
  if (App.currentVesselId === vesselId) switchVessel(FM.vessels[0]?.id || 'all');
  renderVesselDropdown();
  closeModal();
  showToast('Vessel removed', 'ok');
}
window.deleteVessel = deleteVessel;

/* ── CRAFT DETAIL ── */
function openCraftDetail(craftId) {
  const c = (FM.fleet || []).find(x => x.id === craftId);
  if (!c) return;
  const vessel = FM.vessels.find(v => v.id === c.vessel);
  const logs   = (FM.fleetLog || []).filter(l => l.craftId === craftId).slice(0, 6);
  const docs   = (FM.vesselDocs || []).filter(d => d.vessel === c.vessel && (d.notes || '').toLowerCase().includes(c.name.toLowerCase()));
  const certs  = (FM.certificates || []).filter(cert => (cert.vessel === c.vessel) && ((cert.item||'').toLowerCase().includes(c.name.toLowerCase()) || (cert.notes||'').toLowerCase().includes(c.name.toLowerCase())));
  const wos    = (FM.workOrders || []).filter(w => {
    const terms = [c.name, c.make, c.model].map(s => s.toLowerCase());
    return terms.some(t => w.title.toLowerCase().includes(t)) || w.zone === 'Tender Garage';
  }).filter(w => w.status !== 'done').slice(0, 5);

  const fuelPct  = c.fuelPct || 0;
  const fuelCol  = fuelPct < 25 ? 'var(--red)' : fuelPct < 50 ? 'var(--yel)' : 'var(--grn)';
  const typeEmoji = { Tender:'⛵', 'Jet Ski':'🏄', Seabob:'🌊', Dinghy:'🚣' };

  const logHTML = logs.length ? logs.map(l => {
    const crew = (FM.crew || []).find(cr => cr.id === l.crew);
    return `<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:.5px solid var(--bd)">
      <div>
        <div style="font-size:12px;color:var(--txt)">${escHtml(l.note || '')}</div>
        <div style="font-size:11px;color:var(--txt3);margin-top:2px">${l.date} · ${crew ? escHtml(crew.name) : l.crew}</div>
      </div>
      <div style="font-size:12px;color:var(--txt2);text-align:right;flex-shrink:0;margin-left:12px">
        ${l.hours ? `${l.hours}h` : l.litres ? `${l.litres}L` : l.fuelPct ? `${l.fuelPct}% charged` : ''}
      </div>
    </div>`;
  }).join('') : `<div style="font-size:12px;color:var(--txt3);padding:8px 0">No activity logged</div>`;

  const woHTML = wos.length ? wos.map(w => `
    <div onclick="closePanel();navTo('work-orders',document.querySelector('[data-page=work-orders]'));setTimeout(()=>WO.openPanel('${w.id}'),80)"
         style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:.5px solid var(--bd);cursor:pointer">
      <span style="font-family:var(--mono);font-size:10px;color:var(--txt3);flex-shrink:0">${w.id}</span>
      <span style="font-size:12px;color:var(--txt);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(w.title)}</span>
      <span class="badge b-${w.status === 'in-progress' ? 'progress' : w.status === 'on-hold' ? 'hold' : 'open'}" style="font-size:9px">${FM.statusLabel(w.status)}</span>
    </div>`).join('') : `<div style="font-size:12px;color:var(--txt3);padding:8px 0">No open work orders</div>`;

  document.getElementById('panel-title').textContent = c.name;
  openPanel(`
    <!-- Photo hero -->
    ${c.photo ? `<div style="height:180px;background:linear-gradient(145deg,${c.color}22,${c.color}08);overflow:hidden;margin:-18px -18px 18px;border-bottom:.5px solid var(--bd)"><img src="${c.photo}" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></div>` : ''}

    <!-- Status + fuel row -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
      <span class="badge b-done" style="font-size:11px">${c.status.replace('-',' ')}</span>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:11px;color:var(--txt3)">${c.fuel === 'electric' ? 'Battery' : 'Fuel'}</span>
        <div style="width:60px;height:5px;border-radius:3px;background:var(--bg4);overflow:hidden"><div style="height:100%;width:${fuelPct}%;background:${fuelCol};border-radius:3px"></div></div>
        <span style="font-size:12px;font-weight:600;color:${fuelCol}">${fuelPct}%</span>
      </div>
    </div>

    <!-- Sub-header info -->
    <div style="margin-bottom:16px">
      <div style="font-size:18px;font-weight:600;color:var(--txt);letter-spacing:-.02em">${escHtml(c.name)}</div>
      <div style="font-size:12px;color:var(--txt3);margin-top:2px">${c.year} ${c.make} ${c.model} · ${escHtml(vessel?.name||'')} · ${c.loa}</div>
    </div>

    <!-- Stats grid -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px">
      ${[['Hours', c.hours.toLocaleString()+'h'], ['Engine', c.engine], ['Reg.', c.reg||'—'], ['Last service', c.lastService||'—']].map(([l,v]) => `
        <div style="background:var(--bg3);border-radius:8px;padding:10px 12px">
          <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:4px">${l}</div>
          <div style="font-size:12px;font-weight:500;color:var(--txt)">${v}</div>
        </div>`).join('')}
    </div>

    <!-- Open work orders -->
    <div class="panel-section">
      <div class="panel-section-title">Open work orders</div>
      ${woHTML}
    </div>

    <!-- Activity log -->
    <div class="panel-section">
      <div class="panel-section-title">Recent activity</div>
      ${logHTML}
    </div>

    <!-- Notes -->
    ${c.notes ? `<div style="background:var(--bg3);border-radius:8px;padding:12px 14px;font-size:12px;color:var(--txt2);line-height:1.6;margin-top:4px">${escHtml(c.notes)}</div>` : ''}
  `);
}
window.openCraftDetail = openCraftDetail;

/* ── NOTIFICATIONS PAGE ── */
function renderNotifications() {
  const wrap = document.getElementById('page-notifications');
  if (!wrap) return;
  const notifs = FM.notifications || [];
  const typeIcon = t => t === 'alert'
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  const iconColor = t => t === 'alert' ? 'color:var(--red);background:var(--red-bg)' : 'color:var(--blu);background:var(--blu-bg)';

  const unread = notifs.filter(n => !n.read);
  const read   = notifs.filter(n =>  n.read);

  const renderGroup = (list, label) => {
    if (!list.length) return '';
    return `
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--txt3);padding:16px 20px 8px">${label}</div>
      <div style="background:var(--bg2);border-top:.5px solid var(--bd);border-bottom:.5px solid var(--bd)">
        ${list.map((n, i) => `
          <div style="display:flex;gap:14px;padding:14px 20px;${i < list.length-1 ? 'border-bottom:.5px solid var(--bd);':''};background:${n.read ? 'transparent' : 'rgba(94,106,210,.04)'}">
            <div style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;${iconColor(n.type)}">${typeIcon(n.type)}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:${n.read ? '400' : '500'};color:var(--txt);margin-bottom:3px">${escHtml(n.title)}</div>
              ${n.body ? `<div style="font-size:12px;color:var(--txt3);line-height:1.55">${escHtml(n.body)}</div>` : ''}
              ${n.time ? `<div style="font-size:11px;color:var(--txt4);margin-top:5px">${escHtml(n.time)}</div>` : ''}
            </div>
            ${!n.read ? `<div style="width:7px;height:7px;border-radius:50%;background:var(--or);flex-shrink:0;margin-top:5px"></div>` : ''}
          </div>`).join('')}
      </div>`;
  };

  const empty = `<div style="padding:60px 24px;text-align:center;color:var(--txt3)">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" style="opacity:.3;display:block;margin:0 auto 12px"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
    <div style="font-size:13px">No notifications</div>
  </div>`;

  wrap.innerHTML = `
    <div style="padding:0 0 80px">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px">
        <span style="font-size:11px;color:var(--txt3)">${notifs.length} total</span>
        ${unread.length ? `<button class="btn btn-ghost btn-xs" onclick="markAllRead()">Mark all read</button>` : ''}
      </div>
      ${!notifs.length ? empty : renderGroup(unread, 'New') + renderGroup(read, 'Earlier')}
    </div>`;
}
window.renderNotifications = renderNotifications;

/* ── PERSONAL SETTINGS ── */
function openPersonalSettings() {
  openModal(`
    <div style="display:flex;flex-direction:column;gap:0">
      <div style="display:flex;align-items:center;gap:14px;padding:4px 0 20px">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--or);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0">AJ</div>
        <div>
          <div style="font-size:16px;font-weight:600;color:var(--txt)">Albert Day</div>
          <div style="font-size:12px;color:var(--txt3)">aday@castellomgmt.com · Owner</div>
        </div>
      </div>
      <div style="border-top:.5px solid var(--bd);padding-top:16px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.10em;color:var(--txt4);margin-bottom:12px">Appearance</div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0">
          <div>
            <div style="font-size:13px;font-weight:500;color:var(--txt)">Theme</div>
            <div style="font-size:11px;color:var(--txt3)">Switch between light and dark mode</div>
          </div>
          <div class="theme-seg" id="settings-theme-seg">
            <button class="theme-seg-btn" id="seg-dark" onclick="Settings.setTheme('dark')">Dark</button>
            <button class="theme-seg-btn" id="seg-light" onclick="Settings.setTheme('light')">Light</button>
          </div>
        </div>
      </div>
      <div style="border-top:.5px solid var(--bd);padding-top:16px;margin-top:4px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.10em;color:var(--txt4);margin-bottom:12px">Notifications</div>
        ${[
          { lbl:'Bilge alerts', sub:'SMS and push when bilge exceeds threshold', on:true },
          { lbl:'Engine alarms', sub:'Critical engine parameter alerts go out immediately, any time', on:true },
          { lbl:'Work order assignments', sub:'Get notified when a work order is assigned to you', on:true },
          { lbl:'Daily digest', sub:'Morning summary at 07:00', on:false },
        ].map(r => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:.5px solid var(--bd)">
            <div>
              <div style="font-size:13px;font-weight:500;color:var(--txt)">${r.lbl}</div>
              <div style="font-size:11px;color:var(--txt3)">${r.sub}</div>
            </div>
            <div class="toggle ${r.on?'on':''}" onclick="this.classList.toggle('on')"><div class="toggle-thumb"></div></div>
          </div>`).join('')}
      </div>
      <div style="margin-top:16px">
        <button class="btn btn-danger btn-sm" onclick="showToast('Signed out');closeModal()">Sign out</button>
      </div>
    </div>
  `, 'Account');
  setTimeout(() => {
    const mode = document.body.dataset.theme || 'dark';
    document.getElementById('seg-dark')?.classList.toggle('active', mode === 'dark');
    document.getElementById('seg-light')?.classList.toggle('active', mode === 'light');
  }, 50);
}
window.openPersonalSettings = openPersonalSettings;

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

/* ── THEME ── */
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('fm-theme', next);
  document.getElementById('theme-icon-moon').style.display = next === 'light' ? 'none' : '';
  document.getElementById('theme-icon-sun').style.display  = next === 'light' ? '' : 'none';
  // Update theme-color meta for mobile
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = next === 'light' ? '#F4F4F1' : '#080808';
}

/* ── BOOT ── */
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme before anything renders
  const savedTheme = localStorage.getItem('fm-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  if (savedTheme === 'light') {
    const m = document.getElementById('theme-icon-moon');
    const s = document.getElementById('theme-icon-sun');
    if (m) m.style.display = 'none';
    if (s) s.style.display = '';
  }

  initVesselPicker();
  initOffline();

  const _knownPages = new Set(['dashboard','work-orders','calendar','monitoring','assets','parts','vendors','team','chat','logbook','pms','fleet','checklists','charter','owner','certificates','safety','inventory','budget','hours','documents','reports','kb','notifications','hub','requests','settings']);
  function _parsePage(pathname) {
    const p = pathname.replace(/^\//, '').replace(/\/$/, '').replace(/\.html$/, '');
    return _knownPages.has(p) ? p : 'dashboard';
  }
  navTo(_parsePage(window.location.pathname), null, true);

  window.addEventListener('popstate', () => {
    navTo(_parsePage(window.location.pathname), null, true);
  });

  // Unregister any existing service workers so files always load fresh
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
  }
});
