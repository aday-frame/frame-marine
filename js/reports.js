/* ── FRAME MARINE — REPORTS ── */
'use strict';

const Reports = window.Reports = (() => {
  let _range = 'all';

  function _wos() {
    const vid = window.App ? App.currentVesselId : 'v1';
    const all = vid === 'all' ? FM.workOrders : FM.vesselWOs(vid);
    if (_range === 'all') return all;
    const cutoff = new Date('2026-05-07');
    if (_range === 'month') cutoff.setDate(cutoff.getDate() - 30);
    if (_range === 'week')  cutoff.setDate(cutoff.getDate() - 7);
    return all.filter(w => new Date(w.created) >= cutoff);
  }

  function _daysBetween(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }

  function _bar(val, max, color) {
    const pct = max > 0 ? Math.round(val / max * 100) : 0;
    return `<div class="rep-bar-track"><div class="rep-bar-fill" style="width:${pct}%;background:${color}"></div></div>`;
  }

  function render() {
    const wrap = document.getElementById('page-reports');
    if (!wrap) return;

    const wos   = _wos();
    const total = wos.length;
    const open  = wos.filter(w => w.status === 'open').length;
    const inProg = wos.filter(w => w.status === 'in-progress').length;
    const done  = wos.filter(w => w.status === 'done').length;
    const onHold = wos.filter(w => w.status === 'on-hold').length;
    const overdue = wos.filter(w => w.due && w.status !== 'done' && new Date(w.due) < new Date('2026-05-07')).length;
    const high  = wos.filter(w => w.priority === 'high' && w.status !== 'done').length;

    const doneWOs = wos.filter(w => w.status === 'done');
    const avgDays = doneWOs.length
      ? Math.round(doneWOs.reduce((s, w) => s + _daysBetween(w.created, w.due || w.created), 0) / doneWOs.length)
      : null;

    /* ── Crew workload ── */
    const crewMap = {};
    wos.forEach(w => {
      if (!w.assignee) return;
      if (!crewMap[w.assignee]) crewMap[w.assignee] = { open:0, inProg:0, done:0, overdue:0 };
      const cm = crewMap[w.assignee];
      if (w.status === 'open') cm.open++;
      else if (w.status === 'in-progress') cm.inProg++;
      else if (w.status === 'done') cm.done++;
      if (w.due && w.status !== 'done' && new Date(w.due) < new Date('2026-05-07')) cm.overdue++;
    });

    const crewRows = Object.entries(crewMap)
      .map(([id, c]) => ({ id, ...c, total: c.open + c.inProg + c.done }))
      .sort((a, b) => b.open - a.open || b.inProg - a.inProg);
    const maxCrew = Math.max(...crewRows.map(r => r.total), 1);

    /* ── By system ── */
    const sysMap = {};
    wos.forEach(w => {
      if (!w.system) return;
      sysMap[w.system] = (sysMap[w.system] || 0) + 1;
    });
    const sysList = Object.entries(sysMap).sort((a, b) => b[1] - a[1]);
    const maxSys  = Math.max(...sysList.map(r => r[1]), 1);

    /* ── By priority ── */
    const priBars = [
      { label: 'High',   count: wos.filter(w => w.priority === 'high').length,   color: 'var(--red)' },
      { label: 'Medium', count: wos.filter(w => w.priority === 'medium').length, color: '#f59e0b' },
      { label: 'Low',    count: wos.filter(w => w.priority === 'low').length,    color: 'var(--txt4)' },
    ];
    const maxPri = Math.max(...priBars.map(r => r.count), 1);

    /* ── Recent completions ── */
    const recentDone = [...doneWOs]
      .sort((a, b) => (b.due || '').localeCompare(a.due || ''))
      .slice(0, 6);

    wrap.innerHTML = `
      <div class="rep-wrap">

        <!-- Header + range picker -->
        <div class="rep-hdr">
          <div>
            <div class="rep-title">Work Order Reports</div>
            <div class="rep-sub">Track workload, completion and trends</div>
          </div>
          <div class="rep-range">
            <button class="rep-range-btn ${_range==='week'?'active':''}" onclick="Reports.setRange('week')">Week</button>
            <button class="rep-range-btn ${_range==='month'?'active':''}" onclick="Reports.setRange('month')">Month</button>
            <button class="rep-range-btn ${_range==='all'?'active':''}" onclick="Reports.setRange('all')">All time</button>
          </div>
        </div>

        <!-- Summary stats -->
        <div class="rep-stats">
          <div class="rep-stat">
            <div class="rep-stat-num">${total}</div>
            <div class="rep-stat-lbl">Total</div>
          </div>
          <div class="rep-stat">
            <div class="rep-stat-num" style="color:var(--grn)">${done}</div>
            <div class="rep-stat-lbl">Completed</div>
          </div>
          <div class="rep-stat" style="${overdue ? 'background:rgba(248,113,113,.06)' : ''}">
            <div class="rep-stat-num" style="color:${overdue ? 'var(--red)' : 'var(--txt3)'}">${overdue}</div>
            <div class="rep-stat-lbl">Overdue</div>
          </div>
          <div class="rep-stat" style="${high ? 'background:rgba(248,113,113,.04)' : ''}">
            <div class="rep-stat-num" style="color:${high ? 'var(--or)' : 'var(--txt3)'}">${high}</div>
            <div class="rep-stat-lbl">High priority open</div>
          </div>
          <div class="rep-stat">
            <div class="rep-stat-num">${avgDays !== null ? avgDays + 'd' : 'N/A'}</div>
            <div class="rep-stat-lbl">Avg completion</div>
          </div>
        </div>

        <!-- Crew workload -->
        <div class="rep-section">
          <div class="rep-section-title">
            Crew workload
            <span class="rep-section-sub">who has what on their plate</span>
          </div>
          ${crewRows.length === 0 ? `<div class="rep-empty">No assigned work orders</div>` : crewRows.map(r => {
            const cr = FM.getCrew(r.id);
            if (!cr) return '';
            return `
              <div class="rep-crew-row">
                <div class="rep-crew-left">
                  <div class="wo-av" style="background:${cr.color}">${cr.initials}</div>
                  <div class="rep-crew-info">
                    <div class="rep-crew-name">${escHtml(cr.name)}</div>
                    <div class="rep-crew-role">${escHtml(cr.role)}</div>
                  </div>
                </div>
                <div class="rep-crew-bars">
                  ${_bar(r.total, maxCrew, cr.color)}
                  <div class="rep-crew-counts">
                    ${r.open ? `<span style="color:var(--or)">${r.open} open</span>` : ''}
                    ${r.inProg ? `<span style="color:var(--txt)">${r.inProg} in progress</span>` : ''}
                    ${r.done ? `<span style="color:var(--grn)">${r.done} done</span>` : ''}
                    ${r.overdue ? `<span style="color:var(--red)">${r.overdue} overdue</span>` : ''}
                  </div>
                </div>
              </div>`;
          }).join('')}
        </div>

        <!-- By system -->
        <div class="rep-section">
          <div class="rep-section-title">
            By system
            <span class="rep-section-sub">where is the most work happening</span>
          </div>
          ${sysList.map(([sys, count]) => `
            <div class="rep-sys-row">
              <div class="rep-sys-lbl">${escHtml(sys)}</div>
              <div class="rep-sys-bar-wrap">
                ${_bar(count, maxSys, 'var(--or)')}
              </div>
              <div class="rep-sys-count">${count}</div>
            </div>
          `).join('')}
        </div>

        <!-- By priority -->
        <div class="rep-section">
          <div class="rep-section-title">
            By priority
            <span class="rep-section-sub">all work orders in this view</span>
          </div>
          ${priBars.map(p => `
            <div class="rep-sys-row">
              <div class="rep-sys-lbl" style="color:${p.color}">${p.label}</div>
              <div class="rep-sys-bar-wrap">
                ${_bar(p.count, maxPri, p.color)}
              </div>
              <div class="rep-sys-count">${p.count}</div>
            </div>
          `).join('')}
        </div>

        <!-- Completion breakdown -->
        <div class="rep-section">
          <div class="rep-section-title">Status breakdown</div>
          <div class="rep-donut-row">
            <div class="rep-donut-stat">
              <div class="rep-donut-dot" style="background:var(--or)"></div>
              <div class="rep-donut-lbl">Open</div>
              <div class="rep-donut-val">${open}</div>
            </div>
            <div class="rep-donut-stat">
              <div class="rep-donut-dot" style="background:var(--txt)"></div>
              <div class="rep-donut-lbl">In progress</div>
              <div class="rep-donut-val">${inProg}</div>
            </div>
            <div class="rep-donut-stat">
              <div class="rep-donut-dot" style="background:var(--yel)"></div>
              <div class="rep-donut-lbl">On hold</div>
              <div class="rep-donut-val">${onHold}</div>
            </div>
            <div class="rep-donut-stat">
              <div class="rep-donut-dot" style="background:var(--grn)"></div>
              <div class="rep-donut-lbl">Completed</div>
              <div class="rep-donut-val">${done}</div>
            </div>
          </div>
          ${total > 0 ? `
          <div class="rep-progress-stack">
            <div style="flex:${open};background:var(--or)" title="Open: ${open}"></div>
            <div style="flex:${inProg};background:var(--txt)" title="In progress: ${inProg}"></div>
            <div style="flex:${onHold};background:var(--yel)" title="On hold: ${onHold}"></div>
            <div style="flex:${done};background:var(--grn)" title="Completed: ${done}"></div>
          </div>` : ''}
        </div>

        <!-- Recent completions -->
        ${recentDone.length ? `
        <div class="rep-section">
          <div class="rep-section-title">Recently completed</div>
          ${recentDone.map(w => {
            const cr = FM.getCrew(w.assignee);
            const days = w.due ? _daysBetween(w.created, w.due) : null;
            return `
              <div class="rep-done-row" onclick="navTo('work-orders',document.querySelector('.ni[data-page=work-orders]'));WO.openPanel('${w.id}')">
                <div class="rep-done-icon">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="var(--grn)" stroke-width="2" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>
                </div>
                <div class="rep-done-body">
                  <div class="rep-done-title">${escHtml(w.title)}</div>
                  <div class="rep-done-meta">
                    <span class="wo-id" style="font-size:10px">${w.id}</span>
                    ${cr ? `<span>·</span><span>${escHtml(cr.name)}</span>` : ''}
                    ${days !== null ? `<span>·</span><span>${days}d to complete</span>` : ''}
                  </div>
                </div>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 3l5 5-5 5"/></svg>
              </div>`;
          }).join('')}
        </div>` : ''}

      </div>
    `;
  }

  function setRange(r) {
    _range = r;
    render();
  }

  return { render, setRange };
})();
