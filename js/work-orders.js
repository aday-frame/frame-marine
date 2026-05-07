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
  WO.initViewSwitcher();
  if (WO.view === 'todo') WO.renderTodo();
  else WO.renderList(wos);
};

WO._mobTabsHTML = function() {
  return `<div class="wo-mob-tabs">
    <button class="wo-mob-tab${WO.mobTab !== 'done' ? ' active' : ''}" data-tab="todo">To Do</button>
    <button class="wo-mob-tab${WO.mobTab === 'done' ? ' active' : ''}" data-tab="done">Done</button>
  </div>`;
};

WO._bindMobTabs = function(wrap) {
  wrap.querySelectorAll('.wo-mob-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      WO.mobTab = btn.dataset.tab;
      WO.activeFilter = WO.mobTab === 'done' ? 'done' : 'all';
      WO.renderList(WO.allWOs());
    });
  });
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
      <div class="wo-stat-num" style="color:var(--txt)">${progress}</div>
      <div class="wo-stat-lbl">In progress</div>
    </div>
    <div class="wo-stat">
      <div class="wo-stat-num" style="color:var(--yel)">${hold}</div>
      <div class="wo-stat-lbl">On hold</div>
    </div>
    <div class="wo-stat" style="${high > 0 ? 'background:rgba(248,113,113,.05);' : ''}">
      <div class="wo-stat-num" style="color:${high > 0 ? 'var(--red)' : 'var(--txt3)'}">${high}</div>
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

WO.sortCol  = 'id';
WO.sortDir  = 'desc';
WO.view     = 'table';
WO.mobTab   = 'todo';

WO.renderList = function(wos) {
  const wrap = document.getElementById('wo-table-wrap');
  if (!wrap) return;
  let list = WO.filtered(wos);

  // Sort
  list = [...list].sort((a, b) => {
    let av = a[WO.sortCol] || '', bv = b[WO.sortCol] || '';
    if (WO.sortCol === 'id') { av = parseInt(av.replace('WO-','')); bv = parseInt(bv.replace('WO-','')); }
    if (av < bv) return WO.sortDir === 'asc' ? -1 :  1;
    if (av > bv) return WO.sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  // Mobile: render card list instead of table
  if (window.innerWidth <= 768) {
    WO.renderMobCards(wrap, list);
    return;
  }

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

  const col = (key, label, width) => {
    const active = WO.sortCol === key;
    const arrow  = active ? (WO.sortDir === 'asc' ? ' ↑' : ' ↓') : '';
    const style  = width ? `style="width:${width}"` : '';
    return `<th ${style} class="wo-th${active?' wo-th-active':''}" data-sort="${key}">${label}${arrow}</th>`;
  };

  const thead = `<thead><tr>
    ${col('title','Title')}
    ${col('id','ID','76px')}
    ${col('status','Status','110px')}
    ${col('priority','Priority','100px')}
    <th style="width:96px">Team</th>
    <th style="width:130px">System</th>
    <th style="width:34px"></th>
    ${col('due','Due','84px')}
  </tr></thead>`;

  const tbody = list.map(w => WO.rowHTML(w)).join('');

  wrap.innerHTML = `<div class="wo-list-wrap"><table class="wo-tbl">${thead}<tbody>${tbody}</tbody></table></div>`;

  wrap.querySelectorAll('tbody tr[data-id]').forEach(row => {
    row.addEventListener('click', () => WO.openPanel(row.dataset.id));
  });
  wrap.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const k = th.dataset.sort;
      if (WO.sortCol === k) WO.sortDir = WO.sortDir === 'asc' ? 'desc' : 'asc';
      else { WO.sortCol = k; WO.sortDir = 'asc'; }
      WO.renderList(WO.allWOs());
    });
  });
};

WO.rowHTML = function(w) {
  const pColors = { high: 'var(--red)', medium: '#f59e0b', low: 'var(--txt4)' };
  const pDot    = `<span class="wo-pip" style="background:${pColors[w.priority]}"></span>${FM.priorityLabel(w.priority)}`;
  const sBadge  = WO.statusBadge(w.status);
  const dueStr  = w.due ? fmtDate(w.due) : '—';
  const overdue = w.due && w.status !== 'done' && new Date(w.due) < new Date();
  const subtasksDone  = w.subtasks.filter(s => s.done).length;
  const subtasksTotal = w.subtasks.length;

  return `
    <tr data-id="${w.id}" class="${WO.activeId === w.id ? 'selected' : ''}">
      <td class="wo-title-cell">
        <div class="wo-title">${escHtml(w.title)}</div>
        <div class="wo-sub">
          ${w.zone ? `<span>${escHtml(w.zone)}</span>` : ''}
          ${w.zone && w.system ? '<span class="wo-sub-dot"></span>' : ''}
          ${w.system ? `<span>${escHtml(w.system)}</span>` : ''}
          ${subtasksTotal ? `<span class="wo-sub-dot"></span><span>${subtasksDone}/${subtasksTotal} tasks</span>` : ''}
        </div>
      </td>
      <td><span class="wo-id">${w.id}</span></td>
      <td>${sBadge}</td>
      <td><span class="wo-priority-label">${pDot}</span></td>
      <td><span class="badge b-${w.team}">${FM.teamLabel(w.team)}</span></td>
      <td style="font-size:12px;color:var(--txt3);max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(w.system)||'—'}</td>
      <td><span class="wo-av" style="background:${FM.crewColor(w.assignee)}" title="${FM.crewName(w.assignee)}">${FM.crewInitials(w.assignee)}</span></td>
      <td style="font-size:12px;color:${overdue ? 'var(--red)' : 'var(--txt3)'};white-space:nowrap">${dueStr}</td>
    </tr>
  `;
};

WO.statusBadge = function(s) {
  const map = { open: 'b-open', 'in-progress': 'b-progress', done: 'b-done', 'on-hold': 'b-hold' };
  return `<span class="badge ${map[s] || 'b-open'}">${FM.statusLabel(s)}</span>`;
};

/* ── MOBILE CARD LIST ── */
WO.renderMobCards = function(wrap, list) {
  const pColors = { high: 'var(--red)', medium: '#f59e0b', low: 'var(--txt4)' };
  const pLabels = { high: 'High', medium: 'Medium', low: 'Low' };

  const cards = list.map(w => {
    const pc      = pColors[w.priority] || 'var(--txt4)';
    const overdue = w.due && w.status !== 'done' && w.due < '2026-05-07';
    const dueStr  = w.due ? fmtDate(w.due) : null;
    const cr      = FM.getCrew(w.assignee);
    const subtasksDone  = (w.subtasks || []).filter(s => s.done).length;
    const subtasksTotal = (w.subtasks || []).length;
    const img     = (w.images || [])[0];

    const thumbEl = img
      ? `<img class="wo-mob-thumb" src="${escHtml(img)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const placeholderEl = `<div class="wo-mob-thumb-ph" style="${img ? 'display:none' : ''}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--txt3)" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M9 5l1.5-2h3L15 5"/></svg>
      </div>`;

    return `
      <div class="wo-mob-card-row" data-id="${w.id}">
        <div class="wo-mob-thumb-wrap">${thumbEl}${placeholderEl}</div>
        <div class="wo-mob-card-body">
          <div class="wo-mob-card-title">${escHtml(w.title)}</div>
          <div class="wo-mob-card-meta">
            <span class="wo-id" style="font-size:10px">${w.id}</span>
            ${w.system ? `<span class="wo-mob-dot">·</span><span>${escHtml(w.system)}</span>` : ''}
            ${subtasksTotal ? `<span class="wo-mob-dot">·</span><span>${subtasksDone}/${subtasksTotal} tasks</span>` : ''}
          </div>
          <div class="wo-mob-card-foot">
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              ${WO.statusBadge(w.status)}
              <span class="wo-mob-pri" style="color:${pc}">
                <span class="wo-pip" style="background:${pc}"></span>${pLabels[w.priority]}
              </span>
              ${overdue ? `<span class="wo-mob-overdue">Overdue</span>` : (dueStr ? `<span class="wo-mob-due">${dueStr}</span>` : '')}
            </div>
            ${cr ? `<div class="wo-av" style="background:${cr.color};flex-shrink:0" title="${escHtml(cr.name)}">${cr.initials}</div>` : ''}
          </div>
        </div>
        <svg class="wo-mob-chevron" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 3l5 5-5 5"/></svg>
      </div>`;
  }).join('');

  const empty = `<div style="padding:40px 24px;text-align:center;color:var(--txt3);font-size:13px">No work orders</div>`;

  wrap.innerHTML = `${WO._mobTabsHTML()}<div class="wo-mob-list">${list.length ? cards : empty}</div>`;
  WO._bindMobTabs(wrap);
  wrap.querySelectorAll('.wo-mob-card-row').forEach(row => {
    row.addEventListener('click', () => WO.openPanel(row.dataset.id));
  });
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

    <!-- Photos -->
    <div class="panel-section">
      <div class="panel-section-title" style="display:flex;align-items:center;justify-content:space-between">
        Photos
        <label class="btn btn-ghost btn-xs" style="cursor:pointer">
          + Add photo
          <input type="file" accept="image/*" multiple style="display:none" onchange="WO.addPhotos('${w.id}', this)">
        </label>
      </div>
      <div class="wo-photo-grid" id="wo-photos-${w.id}">
        ${(w.images || []).length === 0 ? `
          <label class="wo-photo-empty" style="cursor:pointer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--txt4)" stroke-width="1.4" stroke-linecap="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M9 5l1.5-2h3L15 5"/></svg>
            <span style="font-size:11px;color:var(--txt4);margin-top:4px">Tap to add photos</span>
            <input type="file" accept="image/*" multiple style="display:none" onchange="WO.addPhotos('${w.id}', this)">
          </label>` :
          (w.images || []).map((src, i) => `
            <div class="wo-photo-thumb" onclick="WO.viewPhoto('${w.id}',${i})">
              <img src="${escHtml(src)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">
            </div>`).join('')
        }
      </div>
    </div>

    <!-- Parts -->
    ${w.parts.length ? `
    <div class="panel-section">
      <div class="panel-section-title">Parts required</div>
      ${w.parts.map(p => `
        <div style="font-size:12px;color:var(--txt2);padding:7px 0;border-bottom:.5px solid var(--bd);display:flex;gap:8px;align-items:center">
          <span style="font-size:10px;color:var(--txt4)">·</span>
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

WO.addPhotos = function(woId, input) {
  const w = FM.getWO(woId);
  if (!w || !input.files.length) return;
  if (!w.images) w.images = [];
  const files = Array.from(input.files);
  let loaded = 0;
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      w.images.push(e.target.result);
      loaded++;
      if (loaded === files.length) {
        WO.openPanel(woId);
        WO.renderList(WO.allWOs());
        showToast(files.length === 1 ? 'Photo added' : files.length + ' photos added', 'ok');
      }
    };
    reader.readAsDataURL(file);
  });
};

WO.viewPhoto = function(woId, index) {
  const w = FM.getWO(woId);
  if (!w || !w.images || !w.images[index]) return;
  openModal(`
    <div style="text-align:center">
      <img src="${w.images[index]}" alt="" style="max-width:100%;max-height:60vh;border-radius:8px;display:block;margin:0 auto">
      <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;flex-wrap:wrap">
        ${w.images.length > 1 ? `
          ${index > 0 ? `<button class="btn btn-ghost btn-sm" onclick="closeModal();WO.viewPhoto('${woId}',${index-1})">← Prev</button>` : ''}
          <span style="font-size:12px;color:var(--txt3);align-self:center">${index+1} / ${w.images.length}</span>
          ${index < w.images.length-1 ? `<button class="btn btn-ghost btn-sm" onclick="closeModal();WO.viewPhoto('${woId}',${index+1})">Next →</button>` : ''}
        ` : ''}
        <button class="btn btn-ghost btn-sm" style="color:var(--red)" onclick="WO.deletePhoto('${woId}',${index})">Delete</button>
        <button class="btn btn-ghost btn-sm" onclick="closeModal()">Close</button>
      </div>
    </div>
  `, 'Photo ${index+1} of ${w.images.length}');
};

WO.deletePhoto = function(woId, index) {
  const w = FM.getWO(woId);
  if (!w || !w.images) return;
  w.images.splice(index, 1);
  closeModal();
  WO.openPanel(woId);
  WO.renderList(WO.allWOs());
  showToast('Photo removed');
};

/* ── VIEW SWITCHER ── */
WO.initViewSwitcher = function() {
  const actions = document.getElementById('page-actions');
  if (!actions || actions.querySelector('.wo-view-sw')) return;
  const sw = document.createElement('div');
  sw.className = 'wo-view-sw';
  sw.innerHTML = `
    <button class="wo-vsw-btn ${WO.view==='todo'?'active':''}" data-v="todo" title="To Do view">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <rect x="2" y="2" width="5" height="12" rx="1"/><rect x="9" y="2" width="5" height="12" rx="1"/>
      </svg>
    </button>
    <button class="wo-vsw-btn ${WO.view==='table'?'active':''}" data-v="table" title="Table view">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <rect x="1" y="1" width="14" height="14" rx="2"/>
        <path d="M1 5h14M1 9h14M1 13h14M5 5v8M11 5v8"/>
      </svg>
    </button>
  `;
  actions.prepend(sw);
  sw.querySelectorAll('.wo-vsw-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      WO.view = btn.dataset.v;
      WO.activeId = null;
      sw.querySelectorAll('.wo-vsw-btn').forEach(b => b.classList.toggle('active', b.dataset.v === WO.view));
      WO.render();
    });
  });
};

/* ── TO DO VIEW ── */
WO.renderTodo = function() {
  const wrap = document.getElementById('wo-table-wrap');
  if (!wrap) return;
  const list = WO.filtered(WO.allWOs());

  const cards = list.length === 0
    ? `<div class="empty"><div class="empty-title">No work orders</div></div>`
    : list.map(w => WO.todoCardHTML(w)).join('');

  const detail = WO.activeId
    ? WO.todoDetailHTML(FM.getWO(WO.activeId))
    : `<div class="wo-todo-empty"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".25"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12h6M9 8h6M9 16h4"/></svg><p>Select a work order</p></div>`;

  wrap.innerHTML = `${WO._mobTabsHTML()}
    <div class="wo-todo-layout">
      <div class="wo-todo-sidebar" id="wo-todo-sidebar">
        <div class="wo-todo-hdr">
          <span class="wo-todo-count">${list.length} work orders</span>
        </div>
        <div class="wo-todo-cards">${cards}</div>
      </div>
      <div class="wo-todo-detail" id="wo-todo-detail">${detail}</div>
    </div>`;

  WO._bindMobTabs(wrap);
  wrap.querySelectorAll('.wo-card').forEach(c => {
    c.addEventListener('click', () => {
      WO.activeId = c.dataset.id;
      wrap.querySelectorAll('.wo-card').forEach(x => x.classList.toggle('active', x.dataset.id === WO.activeId));
      document.getElementById('wo-todo-detail').innerHTML = WO.todoDetailHTML(FM.getWO(WO.activeId));
      WO.bindTodoDetail();
    });
  });
  WO.bindTodoDetail();
};

WO.todoCardHTML = function(w) {
  const pColors = { high: 'var(--red)', medium: '#f59e0b', low: 'var(--txt3)' };
  const dueStr  = w.due ? fmtDate(w.due) : null;
  const overdue = w.due && w.status !== 'done' && new Date(w.due) < new Date();
  return `
    <div class="wo-card ${WO.activeId === w.id ? 'active' : ''}" data-id="${w.id}">
      <div class="wo-card-body">
        <div class="wo-card-title">${escHtml(w.title)}</div>
        <div class="wo-card-meta">${FM.crewName(w.assignee)||'Unassigned'} · ${escHtml(w.zone||w.system||'')}</div>
        <div class="wo-card-foot">
          ${WO.statusBadge(w.status)}
          <span class="wo-id" style="margin-left:auto">${w.id}</span>
          ${dueStr ? `<span style="font-size:11px;color:${overdue?'var(--red)':'var(--txt3)'}">${dueStr}</span>` : ''}
        </div>
      </div>
    </div>`;
};

WO.todoDetailHTML = function(w) {
  if (!w) return '';
  const pColors  = { high: 'var(--red)', medium: '#f59e0b', low: 'var(--txt3)' };
  const statuses = ['open','in-progress','on-hold','done'];
  const subtasksDone  = w.subtasks.filter(s => s.done).length;
  const subtasksTotal = w.subtasks.length;
  const progress      = subtasksTotal ? Math.round(subtasksDone/subtasksTotal*100) : 0;

  return `
    <div class="wo-detail-wrap">
      <div class="wo-detail-hdr">
        <div>
          <div class="wo-detail-title">${escHtml(w.title)}</div>
          <div class="wo-detail-id"><span class="wo-id">${w.id}</span> · Created ${fmtDate(w.created)}</div>
        </div>
      </div>

      <div class="wo-detail-section">
        <div class="wo-detail-label">Status</div>
        <div class="wo-status-tabs">
          ${statuses.map(s => `
            <button class="wo-status-tab ${w.status===s?'active':''}" data-status="${s}" data-woid="${w.id}">
              ${FM.statusLabel(s)}
            </button>`).join('')}
        </div>
      </div>

      <div class="wo-detail-grid">
        <div class="wo-detail-field">
          <div class="wo-detail-label">Priority</div>
          <div class="wo-detail-val">
            <span class="wo-pip" style="background:${pColors[w.priority]}"></span>
            ${FM.priorityLabel(w.priority)}
          </div>
        </div>
        <div class="wo-detail-field">
          <div class="wo-detail-label">Team</div>
          <div class="wo-detail-val"><span class="badge b-${w.team}">${FM.teamLabel(w.team)}</span></div>
        </div>
        <div class="wo-detail-field">
          <div class="wo-detail-label">Assigned To</div>
          <div class="wo-detail-val" style="display:flex;align-items:center;gap:7px">
            <span class="wo-av" style="background:${FM.crewColor(w.assignee)}">${FM.crewInitials(w.assignee)}</span>
            ${FM.crewName(w.assignee)||'—'}
          </div>
        </div>
        <div class="wo-detail-field">
          <div class="wo-detail-label">Zone</div>
          <div class="wo-detail-val">${escHtml(w.zone)||'—'}</div>
        </div>
        <div class="wo-detail-field">
          <div class="wo-detail-label">System</div>
          <div class="wo-detail-val">${escHtml(w.system)||'—'}</div>
        </div>
        <div class="wo-detail-field">
          <div class="wo-detail-label">Due</div>
          <div class="wo-detail-val" style="color:${w.due&&new Date(w.due)<new Date()&&w.status!=='done'?'var(--red)':'inherit'}">
            ${w.due ? fmtDate(w.due) : '—'}
          </div>
        </div>
      </div>

      ${w.desc ? `
      <div class="wo-detail-section">
        <div class="wo-detail-label">Description</div>
        <p class="wo-detail-desc">${escHtml(w.desc)}</p>
      </div>` : ''}

      ${subtasksTotal ? `
      <div class="wo-detail-section">
        <div class="wo-detail-label" style="display:flex;align-items:center;gap:8px">
          Sub-tasks
          <span style="color:var(--txt3);font-weight:400">${subtasksDone}/${subtasksTotal}</span>
          <div style="flex:1;background:var(--bg5);border-radius:2px;height:2px;max-width:60px">
            <div style="width:${progress}%;height:2px;border-radius:2px;background:${progress===100?'var(--grn)':'var(--or)'}"></div>
          </div>
        </div>
        ${w.subtasks.map(s => `
          <div class="subtask" onclick="WO.toggleSubtaskTodo('${w.id}','${s.id}')">
            <div class="subtask-check ${s.done?'checked':''}">
              ${s.done?'<svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>':''}
            </div>
            <span class="subtask-text ${s.done?'done':''}">${escHtml(s.text)}</span>
          </div>`).join('')}
      </div>` : ''}

      <div class="wo-detail-section">
        <div class="wo-detail-label">Comments ${w.comments.length ? `<span style="color:var(--txt3);font-weight:400">${w.comments.length}</span>` : ''}</div>
        <div class="wo-comments">
          ${w.comments.length===0 ? `<p style="font-size:12px;color:var(--txt3)">No comments yet.</p>` : ''}
          ${w.comments.map(c => {
            const cr = FM.getCrew(c.author);
            return `<div class="wo-comment">
              <div class="wo-comment-av" style="background:${cr?.color||'#555'}">${cr?.initials||'?'}</div>
              <div class="wo-comment-body">
                <div class="wo-comment-meta">${cr?.name||'Unknown'} · ${c.time}</div>
                <div class="wo-comment-text">${escHtml(c.text)}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:8px;align-items:flex-end;margin-top:12px">
          <textarea class="inp" id="todo-comment" placeholder="Add a comment…" rows="2" style="margin-bottom:0;resize:none;flex:1"></textarea>
          <button class="btn btn-ghost btn-sm" style="flex-shrink:0" onclick="WO.addCommentTodo('${w.id}')">Post</button>
        </div>
      </div>
    </div>`;
};

WO.bindTodoDetail = function() {
  document.querySelectorAll('.wo-status-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const w = FM.getWO(btn.dataset.woid);
      if (!w) return;
      w.status = btn.dataset.status;
      WO.renderStats(WO.allWOs());
      const detail = document.getElementById('wo-todo-detail');
      if (detail) detail.innerHTML = WO.todoDetailHTML(w);
      WO.bindTodoDetail();
      const sidebar = document.getElementById('wo-todo-sidebar');
      if (sidebar) {
        const card = sidebar.querySelector(`.wo-card[data-id="${w.id}"] .badge`);
        if (card) card.outerHTML = WO.statusBadge(w.status);
      }
      showToast('Status updated', 'ok');
    });
  });
};

WO.addCommentTodo = function(woId) {
  const inp = document.getElementById('todo-comment');
  if (!inp || !inp.value.trim()) return;
  const w = FM.getWO(woId);
  if (!w) return;
  w.comments.push({ author:'c1', time: new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}), text:inp.value.trim() });
  document.getElementById('wo-todo-detail').innerHTML = WO.todoDetailHTML(w);
  WO.bindTodoDetail();
  showToast('Comment added');
};

WO.toggleSubtaskTodo = function(woId, subtaskId) {
  const w = FM.getWO(woId);
  if (!w) return;
  const s = w.subtasks.find(x => x.id === subtaskId);
  if (s) s.done = !s.done;
  document.getElementById('wo-todo-detail').innerHTML = WO.todoDetailHTML(w);
  WO.bindTodoDetail();
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
