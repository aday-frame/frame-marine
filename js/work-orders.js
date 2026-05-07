/* ── FRAME MARINE — WORK ORDERS ── */
'use strict';

const WO = window.WO = {};

WO.activeFilter = 'all';
WO.searchQ = '';
WO.activeId = null;
WO._pendingSubtasks = null;

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
    <div class="wo-stat">
      <div class="wo-stat-num" style="color:var(--or)">${open}</div>
      <div class="wo-stat-lbl">Open</div>
    </div>
    <div class="wo-stat">
      <div class="wo-stat-num">${progress}</div>
      <div class="wo-stat-lbl">In progress</div>
    </div>
    <div class="wo-stat">
      <div class="wo-stat-num" style="color:var(--yel)">${hold}</div>
      <div class="wo-stat-lbl">On hold</div>
    </div>
    <div class="wo-stat" style="${high > 0 ? 'background:rgba(248,113,113,.04)' : ''}">
      <div class="wo-stat-num" style="color:${high > 0 ? 'var(--red)' : 'var(--txt)'}">${high}</div>
      <div class="wo-stat-lbl">High priority</div>
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
    <th style="width:72px">ID</th>
    <th>Title</th>
    <th style="width:90px">Priority</th>
    <th style="width:100px">Status</th>
    <th style="width:36px"></th>
    <th style="width:76px">Due</th>
  </tr></thead>`;

  const GRP = (t, count) => `<tr class="wo-grp"><td colspan="6">
    <div class="wo-grp-inner">
      <span class="badge b-${t}">${FM.teamLabel(t)}</span>
      <span class="wo-grp-count">${count} work order${count!==1?'s':''}</span>
    </div>
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

  wrap.innerHTML = `<div class="wo-list-wrap"><table class="wo-tbl">${thead}<tbody>${tbody}</tbody></table></div>`;

  wrap.querySelectorAll('tbody tr[data-id]').forEach(row => {
    row.addEventListener('click', () => WO.openPanel(row.dataset.id));
  });
};

WO.rowHTML = function(w) {
  const pBadge  = `<span class="badge b-${w.priority}">${FM.priorityLabel(w.priority)}</span>`;
  const sBadge  = WO.statusBadge(w.status);
  const dueStr  = w.due ? fmtDate(w.due) : '—';
  const overdue = w.due && w.status !== 'done' && new Date(w.due) < new Date();
  const subtasksDone  = w.subtasks.filter(s => s.done).length;
  const subtasksTotal = w.subtasks.length;

  return `
    <tr data-id="${w.id}" class="${WO.activeId === w.id ? 'selected' : ''}">
      <td><span class="wo-id">${w.id}</span></td>
      <td class="wo-title-cell">
        <div class="wo-title">${escHtml(w.title)}</div>
        <div class="wo-sub">
          <span>${escHtml(w.zone)}</span>
          ${w.zone && w.system ? '<span class="wo-sub-dot"></span>' : ''}
          <span>${escHtml(w.system)}</span>
          ${subtasksTotal ? `<span class="wo-sub-dot"></span><span>${subtasksDone}/${subtasksTotal}</span>` : ''}
        </div>
      </td>
      <td>${pBadge}</td>
      <td>${sBadge}</td>
      <td>
        <span class="wo-av" style="background:${FM.crewColor(w.assignee)}">
          ${FM.crewInitials(w.assignee)}
        </span>
      </td>
      <td style="font-size:12px;color:${overdue ? 'var(--red)' : 'var(--txt3)'}">
        ${dueStr}
      </td>
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
    <!-- Status + badges -->
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">
      ${WO.statusBadge(w.status)}
      <span class="badge b-${w.priority}">${FM.priorityLabel(w.priority)}</span>
      <span class="badge b-${w.team}">${FM.teamLabel(w.team)}</span>
    </div>

    <!-- Description -->
    ${w.desc ? `<p style="font-size:13px;color:var(--txt2);line-height:1.7;margin-bottom:20px;letter-spacing:-.01em">${escHtml(w.desc)}</p>` : ''}

    <!-- Details -->
    <div class="panel-section">
      <div class="panel-section-title">Details</div>
      <div class="panel-row">
        <span class="panel-row-key">Assignee</span>
        <span class="panel-row-val" style="display:flex;align-items:center;gap:7px">
          <span class="wo-av" style="background:${FM.crewColor(w.assignee)}">${FM.crewInitials(w.assignee)}</span>
          ${FM.crewName(w.assignee)}
        </span>
      </div>
      <div class="panel-row"><span class="panel-row-key">Zone</span><span class="panel-row-val">${escHtml(w.zone)}</span></div>
      <div class="panel-row"><span class="panel-row-key">System</span><span class="panel-row-val">${escHtml(w.system)}</span></div>
      <div class="panel-row"><span class="panel-row-key">Created</span><span class="panel-row-val c-txt2">${fmtDate(w.created)}</span></div>
      <div class="panel-row"><span class="panel-row-key">Due</span>
        <span class="panel-row-val ${w.due && new Date(w.due) < new Date() && w.status !== 'done' ? 'c-red' : 'c-txt2'}">${w.due ? fmtDate(w.due) : '—'}</span>
      </div>
    </div>

    <!-- Subtasks -->
    ${subtasksTotal ? `
    <div class="panel-section">
      <div class="panel-section-title">
        Sub-tasks
        <span style="color:var(--txt3);font-weight:400;font-size:11px">${subtasksDone}/${subtasksTotal}</span>
        <div style="flex:1;background:var(--bg5);border-radius:2px;height:2px;max-width:72px">
          <div style="width:${progress}%;height:2px;border-radius:2px;background:${progress===100?'var(--grn)':'var(--or)'}"></div>
        </div>
      </div>
      ${w.subtasks.map(s => `
        <div class="subtask" onclick="WO.toggleSubtask('${w.id}','${s.id}')">
          <div class="subtask-check ${s.done ? 'checked' : ''}">
            ${s.done ? '<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#060606" stroke-width="2.5" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>' : ''}
          </div>
          <span class="subtask-text ${s.done ? 'done' : ''}">${escHtml(s.text)}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Parts -->
    ${w.parts.length ? `
    <div class="panel-section">
      <div class="panel-section-title">Parts required</div>
      ${w.parts.map(p => `
        <div style="font-size:12px;color:var(--txt2);padding:7px 0;border-bottom:.5px solid var(--bd);display:flex;gap:8px;align-items:center">
          <span style="font-family:var(--mono);font-size:10px;color:var(--txt4)">—</span>
          ${escHtml(p)}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Status -->
    <div class="panel-section">
      <div class="panel-section-title">Status</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        ${['open','in-progress','on-hold','done'].map(s => `
          <button class="btn btn-xs ${w.status === s ? 'btn-primary' : 'btn-ghost'}"
                  onclick="WO.setStatus('${w.id}','${s}')">
            ${FM.statusLabel(s)}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Comments -->
    <div class="panel-section">
      <div class="panel-section-title">Comments${w.comments.length ? ` <span style="color:var(--txt3);font-weight:400;font-size:11px">${w.comments.length}</span>` : ''}</div>
      <div class="wo-comments">
        ${w.comments.length === 0 ? `<p style="font-size:12px;color:var(--txt3)">No comments yet.</p>` : ''}
        ${w.comments.map(c => {
          const cr = FM.getCrew(c.author);
          return `
            <div class="wo-comment">
              <div class="wo-comment-av" style="background:${cr?.color||'#555'}">${cr?.initials||'?'}</div>
              <div class="wo-comment-body">
                <div class="wo-comment-meta">${cr?.name||'Unknown'} · ${c.time}</div>
                <div class="wo-comment-text">${escHtml(c.text)}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <div style="margin-top:12px;display:flex;gap:8px;align-items:flex-end">
        <textarea class="inp" id="panel-comment" placeholder="Add a comment…" rows="2" style="margin-bottom:0;resize:none;flex:1"></textarea>
        <button class="btn btn-ghost btn-sm" style="flex-shrink:0" onclick="WO.addComment('${w.id}')">Post</button>
      </div>
    </div>
  `;

  const titleEl = document.getElementById('panel-title');
  titleEl.innerHTML = `<span style="font-family:var(--mono);font-size:11px;color:var(--txt3);font-weight:400;letter-spacing:0;margin-right:8px">${w.id}</span>${escHtml(w.title.slice(0,44))}${w.title.length > 44 ? '…' : ''}`;
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
WO.openNewModal = function(prefill) {
  const vessel = FM.currentVessel() || FM.vessels[0];
  if (!vessel) return;
  const p = prefill || {};
  const zoneOpts = vessel.zones.map(z => `<option>${z}</option>`).join('');
  const sysOpts  = vessel.systems.map(s => `<option value="${s}"${p.system === s ? ' selected' : ''}>${s}</option>`).join('');
  const crewOpts = FM.crew.filter(c => c.vessel === vessel.id)
    .map(c => `<option value="${c.id}">${c.name} — ${c.role}</option>`).join('');
  const teamOpts = ['engineering','deck','interior','charter']
    .map(t => `<option value="${t}"${p.team === t ? ' selected' : ''}>${FM.teamLabel(t)}</option>`).join('');
  const prioOpts = [['high','High'],['medium','Medium'],['low','Low']]
    .map(([v,l]) => `<option value="${v}"${(p.priority||'medium') === v ? ' selected' : ''}>${l}</option>`).join('');

  const body = `
    <div class="inp-group">
      <label class="inp-lbl">Title</label>
      <input class="inp" id="nwo-title" placeholder="Brief description of the issue" value="${p.title ? escHtml(p.title) : ''}">
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
        <select class="inp" id="nwo-priority">${prioOpts}</select>
      </div>
      <div class="inp-group" style="margin-bottom:0">
        <label class="inp-lbl">Team</label>
        <select class="inp" id="nwo-team">${teamOpts}</select>
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
    ${p.steps ? `<div style="background:var(--bg3);border-radius:6px;padding:10px 12px;font-size:11px;color:var(--txt3);margin-top:4px">
      <div style="font-weight:600;color:var(--txt2);margin-bottom:4px">Template: ${escHtml(p.title)}</div>
      ${p.steps.slice(0,3).map(s => `<div style="padding:2px 0">· ${escHtml(s)}</div>`).join('')}
      ${p.steps.length > 3 ? `<div style="color:var(--txt4)">+${p.steps.length - 3} more steps</div>` : ''}
    </div>` : ''}
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

  const subtasks = (WO._pendingSubtasks || []).map((text, i) => ({ id: 'st-' + i, text, done: false }));
  WO._pendingSubtasks = null;

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
    subtasks,
    comments: [],
    parts: [],
  });

  closeModal();
  WO.render();
  WO.openPanel(id);
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
