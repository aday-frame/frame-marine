/* ── FRAME MARINE — REPORTS ── */
'use strict';

const Reports = window.Reports = (() => {
  let _range = 'all';
  const USD = n => '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const TODAY = '2026-05-07';

  function _vessel() { return FM.currentVessel(); }

  function _wos() {
    const v = _vessel();
    const all = v ? FM.vesselWOs(v.id) : FM.workOrders;
    if (_range === 'all') return all;
    const cutoff = new Date(TODAY);
    if (_range === 'month') cutoff.setDate(cutoff.getDate() - 30);
    if (_range === 'week')  cutoff.setDate(cutoff.getDate() - 7);
    return all.filter(w => new Date(w.created) >= cutoff);
  }

  function _charters() {
    const v = _vessel();
    return (FM.charters || []).filter(c => (!v || c.vessel === v.id) && c.end >= '2026-01-01');
  }

  function _daysBetween(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }

  function _bar(val, max, color) {
    const pct = max > 0 ? Math.round(val / max * 100) : 0;
    return `<div class="rep-bar-track"><div class="rep-bar-fill" style="width:${pct}%;background:${color}"></div></div>`;
  }

  function _monthlyWOs(wos) {
    const arr = Array(12).fill(0);
    wos.forEach(w => {
      if (!w.created || !w.created.startsWith('2026')) return;
      const m = parseInt(w.created.split('-')[1]) - 1;
      if (m >= 0 && m < 12) arr[m]++;
    });
    return arr;
  }

  function render() {
    const wrap = document.getElementById('page-reports');
    if (!wrap) return;

    const wos    = _wos();
    const total  = wos.length;
    const done   = wos.filter(w => w.status === 'done').length;
    const open   = wos.filter(w => w.status === 'open').length;
    const inProg = wos.filter(w => w.status === 'in-progress').length;
    const onHold = wos.filter(w => w.status === 'on-hold').length;
    const overdue = wos.filter(w => w.due && w.status !== 'done' && new Date(w.due) < new Date(TODAY)).length;
    const high   = wos.filter(w => w.priority === 'high' && w.status !== 'done').length;

    const doneWOs = wos.filter(w => w.status === 'done');
    const avgDays = doneWOs.length
      ? Math.round(doneWOs.reduce((s, w) => s + _daysBetween(w.created, w.due || w.created), 0) / doneWOs.length)
      : null;

    const charters   = _charters();
    const totalRev   = charters.reduce((s, c) => s + (c.fee || 0) + (c.apa || 0), 0);
    const completePct = total > 0 ? Math.round(done / total * 100) : 0;

    /* ── Crew workload ── */
    const priHours = { high: 8, medium: 4, low: 2 };
    const crewMap  = {};
    wos.forEach(w => {
      if (!w.assignee) return;
      if (!crewMap[w.assignee]) crewMap[w.assignee] = { open:0, inProg:0, done:0, overdue:0, hours:0 };
      const cm = crewMap[w.assignee];
      if (w.status === 'open')         cm.open++;
      else if (w.status === 'in-progress') cm.inProg++;
      else if (w.status === 'done')    cm.done++;
      if (w.due && w.status !== 'done' && new Date(w.due) < new Date(TODAY)) cm.overdue++;
      cm.hours += w.estimatedHours || priHours[w.priority] || 2;
    });
    const crewRows = Object.entries(crewMap)
      .map(([id, c]) => ({ id, ...c, total: c.open + c.inProg + c.done }))
      .sort((a, b) => b.total - a.total);
    const maxCrew  = Math.max(...crewRows.map(r => r.total), 1);

    /* ── By system ── */
    const sysMap = {};
    wos.forEach(w => { if (w.system) sysMap[w.system] = (sysMap[w.system] || 0) + 1; });
    const sysList = Object.entries(sysMap).sort((a, b) => b[1] - a[1]);
    const maxSys  = Math.max(...sysList.map(r => r[1]), 1);

    /* ── By priority ── */
    const priBars = [
      { label: 'High',   count: wos.filter(w => w.priority === 'high').length,   color: 'var(--red)' },
      { label: 'Medium', count: wos.filter(w => w.priority === 'medium').length, color: 'var(--yel)' },
      { label: 'Low',    count: wos.filter(w => w.priority === 'low').length,    color: 'var(--txt4)' },
    ];
    const maxPri = Math.max(...priBars.map(r => r.count), 1);

    /* ── Monthly trend ── */
    const allVesselWOs = _vessel() ? FM.vesselWOs(_vessel().id) : FM.workOrders;
    const monthlyWOs   = _monthlyWOs(allVesselWOs);
    const maxMonthWO   = Math.max(...monthlyWOs, 1);

    /* ── Recent completions ── */
    const recentDone = [...doneWOs]
      .sort((a, b) => (b.due || '').localeCompare(a.due || ''))
      .slice(0, 6);

    const rangeToggle = `
      <div style="display:flex;gap:3px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;padding:3px">
        ${['week','month','all'].map(r =>
          `<button style="padding:4px 12px;border:none;border-radius:6px;background:${_range===r?'var(--bg5)':'transparent'};color:${_range===r?'var(--txt)':'var(--txt3)'};font-size:11px;font-weight:500;cursor:pointer;transition:background .12s" onclick="Reports.setRange('${r}')">${r==='all'?'All time':r.charAt(0).toUpperCase()+r.slice(1)}</button>`
        ).join('')}
      </div>`;

    wrap.innerHTML = `
      <div style="padding:0 0 60px">

        <!-- Hero KPIs -->
        <div class="stat-4" style="display:grid;grid-template-columns:repeat(4,1fr);border-bottom:.5px solid var(--bd)">

          <div style="padding:20px 22px;border-right:.5px solid var(--bd)">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt4);margin-bottom:6px">Work orders</div>
            <div style="font-size:26px;font-weight:700;color:var(--txt);letter-spacing:-.02em;margin-bottom:3px">${total}</div>
            <div style="font-size:11px;color:var(--txt4)">${open} open · ${inProg} in progress</div>
          </div>

          <div style="padding:20px 22px;border-right:.5px solid var(--bd)">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt4);margin-bottom:6px">Completion</div>
            <div style="font-size:26px;font-weight:700;color:var(--grn);letter-spacing:-.02em;margin-bottom:3px">${completePct}%</div>
            <div style="font-size:11px;color:var(--txt4)">${done} done · ${avgDays !== null ? avgDays + 'd avg' : 'no data'}</div>
          </div>

          <div style="padding:20px 22px;border-right:.5px solid var(--bd)${overdue||high ? ';background:rgba(248,113,113,.04)' : ''}">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt4);margin-bottom:6px">Issues</div>
            <div style="font-size:26px;font-weight:700;color:${overdue ? 'var(--red)' : 'var(--txt3)'};letter-spacing:-.02em;margin-bottom:3px">${overdue}</div>
            <div style="font-size:11px;color:var(--txt4)">${overdue} overdue · ${high} high priority open</div>
          </div>

          <div style="padding:20px 22px">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt4);margin-bottom:6px">Charter revenue</div>
            <div style="font-size:26px;font-weight:700;color:var(--grn);letter-spacing:-.02em;margin-bottom:3px">${USD(totalRev)}</div>
            <div style="font-size:11px;color:var(--txt4)">${charters.length} charter${charters.length !== 1 ? 's' : ''} · YTD 2026</div>
          </div>
        </div>

        <!-- Monthly WO trend chart -->
        <div style="padding:18px 20px;border-bottom:.5px solid var(--bd)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3)">Work orders created — 2026</div>
            ${rangeToggle}
          </div>
          <div style="display:flex;align-items:flex-end;gap:6px;height:80px">
            ${MONTHS.map((m, i) => {
              const cnt = monthlyWOs[i];
              const pct = Math.round(cnt / maxMonthWO * 100);
              const isFuture = i > 4;
              return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
                <div style="width:100%;flex:1;display:flex;align-items:flex-end;min-height:64px">
                  <div style="width:100%;height:${Math.max(pct,2)}%;background:${cnt ? 'var(--or)' : 'var(--bg4)'};border-radius:3px 3px 0 0;opacity:${isFuture ? '.3' : '1'};transition:height .4s;min-height:2px" title="${m}: ${cnt} WO${cnt !== 1 ? 's' : ''}"></div>
                </div>
                <div style="font-size:9px;color:${cnt && !isFuture ? 'var(--txt3)' : 'var(--txt4)'};font-weight:${cnt && !isFuture ? '600' : '400'}">${m}</div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Two-column section: Crew workload + Status breakdown -->
        <div class="col-2" style="display:grid;grid-template-columns:1fr 1fr;border-bottom:.5px solid var(--bd)">

          <!-- Crew workload -->
          <div style="padding:18px 20px;border-right:.5px solid var(--bd)">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:14px">Crew workload</div>
            ${crewRows.length === 0 ? `<div style="font-size:12px;color:var(--txt4);padding:8px 0">No assigned work orders</div>` : crewRows.map(r => {
              const cr = FM.getCrew(r.id);
              if (!cr) return '';
              return `
                <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:.5px solid var(--bd)">
                  <div class="wo-av" style="background:${cr.color};flex-shrink:0">${cr.initials}</div>
                  <div style="flex:1;min-width:0">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
                      <span style="font-size:12px;font-weight:500;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(cr.name)}</span>
                      <span style="font-size:11px;color:var(--txt3);flex-shrink:0;margin-left:6px">${r.total}</span>
                    </div>
                    ${_bar(r.total, maxCrew, cr.color)}
                    <div style="display:flex;gap:8px;margin-top:4px;font-size:10px;flex-wrap:wrap">
                      ${r.open ? `<span style="color:var(--or)">${r.open} open</span>` : ''}
                      ${r.inProg ? `<span style="color:var(--txt)">${r.inProg} in prog</span>` : ''}
                      ${r.done ? `<span style="color:var(--grn)">${r.done} done</span>` : ''}
                      ${r.overdue ? `<span style="color:var(--red)">${r.overdue} overdue</span>` : ''}
                    </div>
                  </div>
                </div>`;
            }).join('')}
          </div>

          <!-- Status breakdown + By priority -->
          <div style="padding:18px 20px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:14px">Status breakdown</div>

            <div class="stat-4" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px">
              ${[
                { label: 'Open',        val: open,   color: 'var(--or)' },
                { label: 'In progress', val: inProg, color: 'var(--txt)' },
                { label: 'On hold',     val: onHold, color: 'var(--yel)' },
                { label: 'Done',        val: done,   color: 'var(--grn)' },
              ].map(s => `
                <div style="text-align:center;padding:10px 6px;background:var(--bg3);border-radius:8px">
                  <div style="font-size:20px;font-weight:700;color:${s.color};letter-spacing:-.02em;margin-bottom:3px">${s.val}</div>
                  <div style="font-size:9px;color:var(--txt4);font-weight:500;text-transform:uppercase;letter-spacing:.06em">${s.label}</div>
                </div>`).join('')}
            </div>

            ${total > 0 ? `
            <div style="height:8px;border-radius:4px;overflow:hidden;display:flex;margin-bottom:20px">
              ${open   ? `<div style="flex:${open};background:var(--or)" title="Open: ${open}"></div>` : ''}
              ${inProg ? `<div style="flex:${inProg};background:rgba(255,255,255,.25)" title="In progress: ${inProg}"></div>` : ''}
              ${onHold ? `<div style="flex:${onHold};background:var(--yel)" title="On hold: ${onHold}"></div>` : ''}
              ${done   ? `<div style="flex:${done};background:var(--grn)" title="Done: ${done}"></div>` : ''}
            </div>` : ''}

            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:12px">By priority</div>
            ${priBars.map(p => `
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
                <div style="font-size:11px;color:${p.color};font-weight:600;width:52px;flex-shrink:0">${p.label}</div>
                <div style="flex:1">${_bar(p.count, maxPri, p.color)}</div>
                <div style="font-size:12px;font-weight:600;color:var(--txt);width:24px;text-align:right;flex-shrink:0">${p.count}</div>
              </div>`).join('')}
          </div>

        </div>

        <!-- By system -->
        <div style="padding:18px 20px;border-bottom:.5px solid var(--bd)">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:14px">By system</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${sysList.length === 0
              ? `<div style="font-size:12px;color:var(--txt4)">No work orders with system assigned</div>`
              : sysList.map(([sys, count]) => `
                <div style="display:flex;align-items:center;gap:10px">
                  <div style="font-size:12px;color:var(--txt2);width:160px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(sys)}</div>
                  <div style="flex:1">${_bar(count, maxSys, 'var(--or)')}</div>
                  <div style="font-size:12px;font-weight:600;color:var(--txt);width:24px;text-align:right;flex-shrink:0">${count}</div>
                </div>`).join('')}
          </div>
        </div>

        <!-- Recent completions -->
        ${recentDone.length ? `
        <div style="padding:18px 20px">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:14px">Recently completed</div>
          <div style="border:.5px solid var(--bd);border-radius:10px;overflow:hidden">
            ${recentDone.map((w, i) => {
              const cr   = FM.getCrew(w.assignee);
              const days = w.due ? _daysBetween(w.created, w.due) : null;
              return `
                <div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:${i < recentDone.length - 1 ? '.5px solid var(--bd)' : 'none'};cursor:pointer" onclick="navTo('work-orders',document.querySelector('.ni[data-page=work-orders]'));WO.openPanel('${w.id}')">
                  <div style="width:22px;height:22px;border-radius:6px;background:rgba(74,222,128,.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="var(--grn)" stroke-width="2.5" stroke-linecap="round"><path d="M3 8l4 4 6-6"/></svg>
                  </div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:12px;font-weight:500;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(w.title)}</div>
                    <div style="display:flex;align-items:center;gap:6px;margin-top:2px;font-size:10px;color:var(--txt4)">
                      <span class="wo-id" style="font-size:9px">${escHtml(w.id)}</span>
                      ${cr ? `<span>·</span><span>${escHtml(cr.name)}</span>` : ''}
                      ${days !== null ? `<span>·</span><span>${days}d</span>` : ''}
                    </div>
                  </div>
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="var(--txt4)" stroke-width="1.5" stroke-linecap="round"><path d="M6 3l5 5-5 5"/></svg>
                </div>`;
            }).join('')}
          </div>
        </div>` : ''}

      </div>`;
  }

  function setRange(r) {
    _range = r;
    render();
  }

  return { render, setRange };
})();
