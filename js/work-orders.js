/* ── FRAME MARINE — WORK ORDERS ── */
'use strict';

const WO = window.WO = {};

WO.activeFilter = 'all';
WO.searchQ = '';
WO.activeId = null;

/* ── RENDER LIST ── */
WO.allWOs = function() {
  return App.currentVesselId === 'all' ? FM.workOrders : FM.vesselWOs(App.currentVesselId);
};

WO.render = function() {
  const wos = WO.allWOs();
  WO.renderStats(wos);
  WO.renderList(wos);
};

WO.renderStats = function(wos) {
  const bar = document.getElementById('wo-stats');
  if (!bar) return;
  const open     = wos.filter(w => w.status === 'open').length;
  const progress = wos.filter(w => w.status === 'in-progress').length;
  const hold     = wos.filter(w => w.status === 'on-hold').length;
  const high     = wos.filter(w => w.priority === 'high' && w.status !== 'done').length;

  bar.style.gridTemplateColumns = 'repeat(4,1fr)';
  bar.innerHTML = `
    <div class="pms-stat">
      <div class="pms-stat-lbl">Open</div>
      <div class="pms-stat-val" style="color:var(--or)">${open}</div>
    </div>
    <div class="pms-stat">
      <div class="pms-stat-lbl">In progress</div>
      <div class="pms-stat-val">${progress}</div>
    </div>
    <div class="pms-stat">
      <div class="pms-stat-lbl">On hold</div>
      <div class="pms-stat-val" style="color:var(--yel)">${hold}</div>
    </div>
    <div class="pms-stat" style="${high > 0 ? 'background:rgba(248,113,113,.06)' : ''}">
      <div class="pms-stat-lbl">High priority</div>
      <div class="pms-stat-val" style="color:${high > 0 ? 'var(--red)' : 'var(--txt)'}">${high}</div>
    </div>
  `;
};

WO.filtered = function(wos) {
  let list = [...wos];
  const f = WO.activeFilter;
  if (f === 'open')        list = list.filter(w => w.status === 'open');
  if (f === 'in-progress') list = list.filter(w => w.status === 'in-progress');
  if (f === 'done')        list = list.filter(w => w.status === 'done');
  if (f === 'on-hold')     list = list.filter(w => w.status === 'on-hold');
  if (f === 'high')        list = list.filter(w => w.priority === 'high');
  if (f === 'engineering') list = list.filter(w => w.team === 'engineering');
  if (f === 'deck')        list = list.filter(w => w.team === 'deck');
  if (WO.searchQ) {
    const q = WO.searchQ.toLowerCase();
    list = list.filter(w =>
      w.title.toLowerCase().includes(q) ||
      w.zone.toLowerCase().includes(q) ||
      w.system.toLowerCase().includes(q) ||
      w.id.toLowerCase().includes(q)
    );
  }
  return list;
};

WO.renderList = function(wos) {
  const wrap = document.getElementById('wo-table-wrap');
  if (!wrap) return;
  const list = WO.filtered(wos);

  if (list.length === 0) {
    wrap.innerHTML = `
      <div class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M9 12h6M9 8h6M9 16h4"/>
        </svg>
        <div class="empty-title">No work orders</div>
        <div class="empty-sub">Adjust your filters or create a new work order</div>
      </div>`;
    return;
  }

  const thead = `<thead><tr>
    <th style="width:80px">ID</th>
    <th>Title</th>
    <th style="width:130px">System</th>
    <th style="width:80px">Priority</th>
    <th style="width:90px">Status</th>
    <th style="width:80px">Assignee</th>
    <th style="width:80px">Due</th>
  </tr></thead>`;

  const GRP = (t, count) => `<tr><td colspan="7" style="padding:10px 12px 6px;font-size:9px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.09em;background:var(--bg);border-bottom:.5px solid var(--bd)">
    <span class="badge b-${t}" style="margin-right:6px">${FM.teamLabel(t)}</span>
    <span style="font-weight:400;text-transform:none;letter-spacing:0">${count} work order${count!==1?'s':''}</span>
  </td></tr>`;

  let tbody;
  if (WO.activeFilter !== 'all') {
    tbody = list.map(w => WO.rowHTML(w)).join('');
  } else {
    const teams = ['engineering','deck','interior','charter'];
    tbody = teams
      .filter(t => list.some(w => w.team === t))
      .map(t => {
        const rows = list.filter(w => w.team === t);
        return GRP(t, rows.length) + rows.map(w => WO.rowHTML(w)).join('');
      }).join('');
  }

  wrap.innerHTML = `<div class="tbl-wrap"><table class="tbl">${thead}<tbody>${tbody}</tbody></table></div>`;

  wrap.querySelectorAll('tbody tr[data-id]').forEach(row => {
    row.addEventListener('click', () => WO.openPanel(row.dataset.id));
  });
};

WO.rowHTML = function(w) {
  const pBadge  = `<span class="badge b-${w.priority}">${FM.priorityLabel(w.priority)}</span>`;
  const sBadge  = WO.statusBadge(w.status);
  const dueStr  = w.due ? fmtDate(w.due) : '<span class="c-txt3">—</span>';
  const overdue = w.due && w.status !== 'done' && new Date(w.due) < new Date();

  return `
    <tr data-id="${w.id}" class="${WO.activeId === w.id ? 'selected' : ''}">
      <td class="tbl-mono">${w.id}</td>
      <td>
        <div class="tbl-title">${escHtml(w.title)}</div>
        <div class="tbl-sub">${escHtml(w.zone)}</div>
      </td>
      <td class="c-txt2 t-11">${escHtml(w.system)}</td>
      <td>${pBadge}</td>
      <td>${sBadge}</td>
      <td>
        <span style="width:20px;height:20px;border-radius:50%;background:${FM.crewColor(w.assignee)};
          display:inline-flex;align-items:center;justify-content:center;
          font-size:8px;font-weight:700;color:#080808;flex-shrink:0">
          ${FM.crewInitials(w.assignee)}
        </span>
      </td>
      <td class="${overdue ? 'c-red' : 'c-txt3'} t-11">${dueStr}</td>
    </tr>
  `;
};

WO.statusBadge = function(s) {
  const map = { open: 'b-open', 'in-progress': 'b-progress', done: 'b-done', 'on-hold': 'b-hold' };
  return `<span class="badge ${map[s] || 'b-open'}">${FM.statusLabel(s)}</span>`;
};

/* ── DETAIL PANEL ── */
WO.openPanel = function(id) {
  const w = FM.getWO(id);
  if (!w) return;
  WO.activeId = id;

  // Highlight row
  document.querySelectorAll('#wo-table-wrap tbody tr').forEach(r => {
    r.classList.toggle('selected', r.dataset.id === id);
  });

  const crew = FM.getCrew(w.assignee);
  const subtasksDone = w.subtasks.filter(s => s.done).length;
  const subtasksTotal = w.subtasks.length;
  const progress = subtasksTotal ? Math.round(subtasksDone / subtasksTotal * 100) : 0;

  const content = `
    <div class="panel-section">
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        ${WO.statusBadge(w.status)}
        <span class="badge b-${w.priority}">${FM.priorityLabel(w.priority)}</span>
        <span class="badge b-${w.team}">${FM.teamLabel(w.team)}</span>
      </div>
      <p style="font-size:13px;color:var(--txt2);line-height:1.65;margin-bottom:0">${escHtml(w.desc)}</p>
    </div>

    <div class="panel-section">
      <div class="panel-section-title">Details</div>
      <div class="panel-row"><span class="panel-row-key">Zone</span><span class="panel-row-val">${w.zone}</span></div>
      <div class="panel-row"><span class="panel-row-key">System</span><span class="panel-row-val">${w.system}</span></div>
      <div class="panel-row">
        <span class="panel-row-key">Assignee</span>
        <span class="panel-row-val" style="display:flex;align-items:center;gap:7px">
          <span style="width:22px;height:22px;border-radius:50%;background:${FM.crewColor(w.assignee)};
            display:inline-flex;align-items:center;justify-content:center;
            font-size:9px;font-weight:700;color:#080808">
            ${FM.crewInitials(w.assignee)}
          </span>
          ${FM.crewName(w.assignee)}
        </span>
      </div>
      <div class="panel-row"><span class="panel-row-key">Created</span><span class="panel-row-val c-txt2">${fmtDate(w.created)}</span></div>
      <div class="panel-row"><span class="panel-row-key">Due</span><span class="panel-row-val ${w.due && new Date(w.due) < new Date() ? 'c-red' : 'c-txt2'}">${w.due ? fmtDate(w.due) : '—'}</span></div>
    </div>

    ${subtasksTotal ? `
    <div class="panel-section">
      <div class="panel-section-title">
        Sub-tasks
        <span class="c-txt3 t-11" style="font-weight:400">${subtasksDone}/${subtasksTotal}</span>
        <div style="flex:1;background:var(--bg4);border-radius:2px;height:3px;max-width:80px">
          <div style="width:${progress}%;height:3px;border-radius:2px;background:${progress===100?'var(--grn)':'var(--or)'}"></div>
        </div>
      </div>
      <div>
        ${w.subtasks.map(s => `
          <div class="subtask" onclick="WO.toggleSubtask('${w.id}','${s.id}')">
            <div class="subtask-check ${s.done ? 'checked' : ''}">
              ${s.done ? '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#080808" stroke-width="2.5" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>' : ''}
            </div>
            <span class="subtask-text ${s.done ? 'done' : ''}">${escHtml(s.text)}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    ${w.parts.length ? `
    <div class="panel-section">
      <div class="panel-section-title">Parts required</div>
      ${w.parts.map(p => `
        <div style="font-size:12px;color:var(--txt2);padding:5px 0;border-bottom:.5px solid var(--bd)">
          <span style="font-family:var(--mono);color:var(--txt3);margin-right:6px">—</span>${escHtml(p)}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="panel-section">
      <div class="panel-section-title">Comments <span class="c-txt3 t-11" style="font-weight:400">${w.comments.length}</span></div>
      <div class="wo-comments">
        ${w.comments.length === 0 ? `<div class="c-txt3 t-12">No comments yet.</div>` : ''}
        ${w.comments.map(c => {
          const crew = FM.getCrew(c.author);
          return `
            <div class="wo-comment">
              <div class="wo-comment-av" style="background:${crew?.color||'#555'}">
                ${crew?.initials||'?'}
              </div>
              <div class="wo-comment-body">
                <div class="wo-comment-meta">${crew?.name||'Unknown'} · ${c.time}</div>
                <div class="wo-comment-text">${escHtml(c.text)}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <div style="margin-top:12px;display:flex;gap:8px;align-items:flex-end">
        <textarea class="inp" id="panel-comment" placeholder="Add a comment…" rows="2" style="margin-bottom:0;resize:none"></textarea>
        <button class="btn btn-ghost btn-sm" onclick="WO.addComment('${w.id}')">Post</button>
      </div>
    </div>

    <div class="panel-section">
      <div class="panel-section-title">Change status</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${['open','in-progress','on-hold','done'].map(s => `
          <button class="btn btn-ghost btn-xs ${w.status === s ? 'btn-primary' : ''}"
                  onclick="WO.setStatus('${w.id}','${s}')">
            ${FM.statusLabel(s)}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('panel-title').textContent = w.id + ' — ' + w.title.slice(0, 38) + (w.title.length > 38 ? '…' : '');
  openPanel(content);
};

WO.toggleSubtask = function(woId, subtaskId) {
  const w = FM.getWO(woId);
  if (!w) return;
  const s = w.subtasks.find(x => x.id === subtaskId);
  if (s) s.done = !s.done;
  WO.openPanel(woId);
  WO.renderList(WO.allWOs());
};

WO.addComment = function(woId) {
  const inp = document.getElementById('panel-comment');
  if (!inp || !inp.value.trim()) return;
  const w = FM.getWO(woId);
  if (!w) return;
  w.comments.push({
    author: 'c1',
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    text: inp.value.trim(),
  });
  WO.openPanel(woId);
  showToast('Comment added');
};

WO.setStatus = function(woId, status) {
  const w = FM.getWO(woId);
  if (!w) return;
  w.status = status;
  WO.openPanel(woId);
  WO.renderList(WO.allWOs());
  WO.renderStats(WO.allWOs());
  showToast('Status updated to ' + FM.statusLabel(status), 'ok');
};

/* ── NEW WORK ORDER MODAL ── */
WO.openNewModal = function() {
  const vessel = FM.currentVessel() || FM.vessels[0];
  if (!vessel) return;
  const zoneOpts = vessel.zones.map(z => `<option>${z}</option>`).join('');
  const sysOpts  = vessel.systems.map(s => `<option>${s}</option>`).join('');
  const crewOpts = FM.crew.filter(c => c.vessel === vessel.id)
    .map(c => `<option value="${c.id}">${c.name} — ${c.role}</option>`).join('');

  const body = `
    <div class="inp-group">
      <label class="inp-lbl">Title</label>
      <input class="inp" id="nwo-title" placeholder="Brief description of the issue">
    </div>
    <div class="inp-group">
      <label class="inp-lbl">Description</label>
      <textarea class="inp" id="nwo-desc" placeholder="More detail…"></textarea>
    </div>
    <div class="inp-row">
      <div class="inp-group" style="margin-bottom:0">
        <label class="inp-lbl">Zone</label>
        <select class="inp" id="nwo-zone"><option value="">Select zone</option>${zoneOpts}</select>
      </div>
      <div class="inp-group" style="margin-bottom:0">
        <label class="inp-lbl">System</label>
        <select class="inp" id="nwo-system"><option value="">Select system</option>${sysOpts}</select>
      </div>
    </div>
    <div class="inp-row" style="margin-top:14px">
      <div class="inp-group" style="margin-bottom:0">
        <label class="inp-lbl">Priority</label>
        <select class="inp" id="nwo-priority">
          <option value="high">High</option>
          <option value="medium" selected>Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div class="inp-group" style="margin-bottom:0">
        <label class="inp-lbl">Team</label>
        <select class="inp" id="nwo-team">
          <option value="engineering">Engineering</option>
          <option value="deck">Deck</option>
          <option value="interior">Interior</option>
          <option value="charter">Charter</option>
        </select>
      </div>
    </div>
    <div class="inp-row" style="margin-top:14px">
      <div class="inp-group" style="margin-bottom:0">
        <label class="inp-lbl">Assignee</label>
        <select class="inp" id="nwo-assignee"><option value="">Unassigned</option>${crewOpts}</select>
      </div>
      <div class="inp-group" style="margin-bottom:0">
        <label class="inp-lbl">Due date</label>
        <input class="inp" id="nwo-due" type="date">
      </div>
    </div>
  `;

  openModal(body, 'New work order');
  document.getElementById('modal-submit').textContent = 'Create work order';
  document.getElementById('modal-submit').onclick = WO.createNew;
};

WO.createNew = function() {
  const title = document.getElementById('nwo-title')?.value.trim();
  if (!title) { showToast('Title is required', 'err'); return; }

  const nextNum = Math.max(...FM.workOrders.map(w => parseInt(w.id.replace('WO-','')))) + 1;
  const id = 'WO-' + String(nextNum).padStart(3, '0');

  FM.workOrders.unshift({
    id,
    vessel: App.currentVesselId,
    title,
    desc: document.getElementById('nwo-desc')?.value.trim() || '',
    zone: document.getElementById('nwo-zone')?.value || '',
    system: document.getElementById('nwo-system')?.value || '',
    priority: document.getElementById('nwo-priority')?.value || 'medium',
    status: 'open',
    team: document.getElementById('nwo-team')?.value || 'engineering',
    assignee: document.getElementById('nwo-assignee')?.value || null,
    created: new Date().toISOString().slice(0, 10),
    due: document.getElementById('nwo-due')?.value || null,
    subtasks: [],
    comments: [],
    parts: [],
  });

  closeModal();
  WO.render();
  showToast(id + ' created', 'ok');

  // Queue for offline sync
  if (window.Offline) Offline.queueWrite('workOrders', id, FM.getWO(id));
};

/* ── FILTER WIRING ── */
WO.initFilters = function() {
  document.querySelectorAll('#wo-filters .fp').forEach(pill => {
    pill.addEventListener('click', function() {
      document.querySelectorAll('#wo-filters .fp').forEach(p => p.classList.remove('on'));
      this.classList.add('on');
      WO.activeFilter = this.dataset.f;
      WO.renderList(WO.allWOs());
    });
  });
};

WO.initSearch = function() {
  const inp = document.getElementById('wo-search');
  if (!inp) return;
  inp.addEventListener('input', function() {
    WO.searchQ = this.value.trim();
    WO.renderList(WO.allWOs());
  });
};

/* ── DATE UTIL ── */
function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
