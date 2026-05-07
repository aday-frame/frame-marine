/* ── SAFETY & ISM MODULE ── */
const Safety = (() => {
  let _tab = 'drills';

  const DRILL_TYPES = {
    'fire':         { label: 'Fire',          icon: '🔥', color: '#F87171' },
    'abandon-ship': { label: 'Abandon Ship',  icon: '🚨', color: '#F97316' },
    'man-overboard':{ label: 'Man Overboard', icon: '🔵', color: '#60A5FA' },
    'oil-spill':    { label: 'Oil Spill',     icon: '⚠️', color: '#FACC15' },
    'security':     { label: 'Security',      icon: '🔒', color: '#A78BFA' },
  };

  const NC_TYPES = {
    'non-conformance': 'Non-conformance',
    'near-miss':       'Near miss',
    'observation':     'Observation',
    'incident':        'Incident',
  };

  function fmtDate(s) {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + d + ', ' + y;
  }

  /* ── render ── */
  function render() {
    const wrap = document.getElementById('page-safety');
    if (!wrap) return;

    const vessel = FM.currentVessel();
    if (!vessel) { wrap.innerHTML = '<div style="padding:24px;color:var(--txt3)">No vessel selected.</div>'; return; }

    const drills   = (FM.drills || []).filter(d => d.vessel === vessel.id);
    const ncs      = (FM.nonConformances || []).filter(n => n.vessel === vessel.id);
    const meetings = (FM.safetyMeetings || []).filter(m => m.vessel === vessel.id);

    const openNCs    = ncs.filter(n => n.status === 'open').length;
    const scheduledD = drills.filter(d => d.status === 'scheduled').length;

    const completed = drills.filter(d => d.status === 'completed').length;

    wrap.innerHTML = `
      <div style="padding:0 0 40px">

        <!-- Stat bar -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);border-bottom:.5px solid var(--bd);margin-bottom:0">
          <div class="wo-stat"><div class="wo-stat-num" style="color:var(--grn)">${completed}</div><div class="wo-stat-lbl">Drills completed</div></div>
          <div class="wo-stat"><div class="wo-stat-num" style="color:var(--yel)">${scheduledD}</div><div class="wo-stat-lbl">Drills scheduled</div></div>
          <div class="wo-stat"><div class="wo-stat-num" style="${openNCs ? 'color:var(--red)' : ''}">${openNCs}</div><div class="wo-stat-lbl">Open non-conformances</div></div>
          <div class="wo-stat" style="border-right:none"><div class="wo-stat-num">${meetings.length}</div><div class="wo-stat-lbl">Safety meetings</div></div>
        </div>

        <!-- Tabs -->
        <div style="display:flex;gap:4px;padding:0 20px;margin-top:20px;margin-bottom:20px;border-bottom:.5px solid var(--bd)">
          <button onclick="Safety.tab('drills')"   id="st-drills"   class="tab-btn ${_tab==='drills'?'tab-btn-active':''}">Drills</button>
          <button onclick="Safety.tab('nc')"       id="st-nc"       class="tab-btn ${_tab==='nc'?'tab-btn-active':''}">Non-conformances ${openNCs?`<span class="ni-count ni-count-red" style="position:relative;top:-1px">${openNCs}</span>`:''}</button>
          <button onclick="Safety.tab('meetings')" id="st-meetings" class="tab-btn ${_tab==='meetings'?'tab-btn-active':''}">Safety meetings</button>
        </div>

        <div id="safety-content" style="padding:0 20px"></div>
      </div>

      ${_modalHtml()}
    `;

    _renderContent();
  }

  function _renderContent() {
    const el = document.getElementById('safety-content');
    if (!el) return;
    if (_tab === 'drills')   el.innerHTML = _drillsTab();
    else if (_tab === 'nc')  el.innerHTML = _ncTab();
    else                     el.innerHTML = _meetingsTab();
  }

  /* ── DRILLS TAB ── */
  function _drillsTab() {
    const vessel = FM.currentVessel();
    const drills = (FM.drills || []).filter(d => d.vessel === vessel.id)
      .sort((a, b) => b.date.localeCompare(a.date));

    const scheduled = drills.filter(d => d.status === 'scheduled');
    const completed = drills.filter(d => d.status === 'completed');

    const actions = `<div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:16px">
      <button class="btn btn-ghost btn-sm" onclick="Safety.openScheduleDrill()">Schedule drill</button>
      <button class="btn btn-primary btn-sm" onclick="Safety.openLogDrill()">Log drill</button>
    </div>`;

    if (!drills.length) return actions + `<div class="empty" style="padding:40px 0"><div class="empty-title">No drills yet</div><div class="empty-sub">Log or schedule your first drill above</div></div>`;

    const row = d => {
      const dt = DRILL_TYPES[d.type] || { label: d.type, icon: '📋', color: 'var(--txt3)' };
      const isSched = d.status === 'scheduled';
      const crewAvatars = (d.crew || []).slice(0,4).map(cid =>
        `<span style="width:20px;height:20px;border-radius:50%;background:${FM.crewColor(cid)}22;color:${FM.crewColor(cid)};font-size:8px;font-weight:700;display:inline-flex;align-items:center;justify-content:center" title="${FM.crewName(cid)}">${FM.crewInitials(cid)}</span>`
      ).join('');
      return `<tr>
        <td style="padding:8px 6px 8px 12px;width:40px">
          <div style="width:30px;height:30px;border-radius:7px;background:${dt.color}18;display:flex;align-items:center;justify-content:center;font-size:15px">${dt.icon}</div>
        </td>
        <td>
          <div style="font-size:13px;font-weight:500;color:var(--txt)">${dt.label} Drill</div>
          ${d.location ? `<div style="font-size:11px;color:var(--txt3);margin-top:1px">${escHtml(d.location)}</div>` : ''}
        </td>
        <td style="font-size:12px;color:var(--txt2);white-space:nowrap">${fmtDate(d.date)}</td>
        <td style="font-size:12px;color:var(--txt3)">${d.duration ? d.duration + ' min' : '—'}</td>
        <td style="font-size:12px;color:var(--txt2)">${d.conductor ? escHtml(FM.crewName(d.conductor)) : '—'}</td>
        <td><div style="display:flex;gap:3px">${crewAvatars}</div></td>
        <td><span class="badge ${isSched ? 'b-hold' : 'b-done'}">${isSched ? 'Scheduled' : 'Completed'}</span></td>
        <td><div style="display:flex;gap:5px">
          ${isSched ? `<button class="btn btn-ghost btn-xs" onclick="Safety.completeDrill('${d.id}')">Complete</button>` : ''}
          <button class="btn btn-ghost btn-xs" onclick="Safety.delDrill('${d.id}')">Remove</button>
        </div></td>
      </tr>`;
    };

    const section = (label, items) => items.length ? `
      <tr><td colspan="8" style="padding:10px 12px 6px;font-size:9px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.09em;background:var(--bg);border-bottom:.5px solid var(--bd)">${label}</td></tr>
      ${items.map(row).join('')}` : '';

    return actions + `<div class="tbl-wrap"><table class="tbl">
      <thead><tr>
        <th style="width:40px"></th>
        <th>Drill</th>
        <th style="width:110px">Date</th>
        <th style="width:80px">Duration</th>
        <th style="width:140px">Conducted by</th>
        <th style="width:80px">Crew</th>
        <th style="width:100px">Status</th>
        <th style="width:120px"></th>
      </tr></thead>
      <tbody>
        ${section('Scheduled', scheduled)}
        ${section('Completed', completed)}
      </tbody>
    </table></div>`;
  }

  /* ── NC TAB ── */
  function _ncTab() {
    const vessel = FM.currentVessel();
    const ncs = (FM.nonConformances || []).filter(n => n.vessel === vessel.id)
      .sort((a, b) => b.date.localeCompare(a.date));

    const actions = `<div style="display:flex;justify-content:flex-end;margin-bottom:16px">
      <button class="btn btn-primary btn-sm" onclick="Safety.openNC()">+ Raise report</button>
    </div>`;

    if (!ncs.length) return actions + `<div class="empty" style="padding:40px 0"><div class="empty-title">No reports yet</div><div class="empty-sub">All clear — raise a report above if needed</div></div>`;

    const rows = ncs.map(nc => {
      const isOpen = nc.status === 'open';
      return `<tr style="cursor:pointer" onclick="Safety._openNCDetail('${nc.id}')">
        <td><span style="font-family:var(--mono);font-size:10px;color:var(--txt3)">${escHtml(nc.ref)}</span></td>
        <td><span class="badge b-hold" style="font-size:9px">${NC_TYPES[nc.type]||nc.type}</span></td>
        <td>
          <div style="font-size:13px;font-weight:500;color:var(--txt)">${escHtml(nc.title)}</div>
          ${nc.description ? `<div style="font-size:11px;color:var(--txt3);margin-top:1px;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(nc.description)}</div>` : ''}
        </td>
        <td style="font-size:12px;color:var(--txt2);white-space:nowrap">${fmtDate(nc.date)}</td>
        <td style="font-size:12px;color:var(--txt2)">${escHtml(FM.crewName(nc.raisedBy))}</td>
        <td style="font-size:12px;color:var(--txt2)">${escHtml(FM.crewName(nc.assignee))}</td>
        <td><span class="badge ${isOpen ? 'b-high' : 'b-done'}">${isOpen ? 'Open' : 'Closed'}</span></td>
        <td onclick="event.stopPropagation()"><div style="display:flex;gap:5px">
          ${isOpen ? `<button class="btn btn-ghost btn-xs" onclick="Safety.closeNC('${nc.id}')">Close out</button>` : ''}
          <button class="btn btn-ghost btn-xs" onclick="Safety.delNC('${nc.id}')">Remove</button>
        </div></td>
      </tr>`;
    }).join('');

    return actions + `<div class="tbl-wrap"><table class="tbl">
      <thead><tr>
        <th style="width:90px">Ref</th>
        <th style="width:120px">Type</th>
        <th>Title</th>
        <th style="width:110px">Date</th>
        <th style="width:130px">Raised by</th>
        <th style="width:130px">Assignee</th>
        <th style="width:90px">Status</th>
        <th style="width:100px"></th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
  }

  function _openNCDetail(id) {
    const nc = (FM.nonConformances || []).find(n => n.id === id);
    if (!nc) return;
    const isOpen = nc.status === 'open';
    openPanel(`
      <div style="padding:20px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-family:var(--mono);font-size:10px;color:var(--txt3)">${escHtml(nc.ref)}</span>
          <span class="badge ${isOpen ? 'b-high' : 'b-done'}">${isOpen ? 'Open' : 'Closed'}</span>
          <span class="badge b-hold" style="font-size:9px">${NC_TYPES[nc.type]||nc.type}</span>
        </div>
        <div style="font-size:16px;font-weight:600;color:var(--txt);margin-bottom:12px;letter-spacing:-.01em">${escHtml(nc.title)}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
          <div style="background:var(--bg3);border-radius:8px;padding:10px 12px"><div style="font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">Date</div><div style="font-size:12px;color:var(--txt2)">${fmtDate(nc.date)}</div></div>
          <div style="background:var(--bg3);border-radius:8px;padding:10px 12px"><div style="font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">Raised by</div><div style="font-size:12px;color:var(--txt2)">${escHtml(FM.crewName(nc.raisedBy))}</div></div>
          <div style="background:var(--bg3);border-radius:8px;padding:10px 12px"><div style="font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">Assigned to</div><div style="font-size:12px;color:var(--txt2)">${escHtml(FM.crewName(nc.assignee))}</div></div>
          ${nc.closedDate ? `<div style="background:var(--bg3);border-radius:8px;padding:10px 12px"><div style="font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">Closed</div><div style="font-size:12px;color:var(--grn)">${fmtDate(nc.closedDate)}</div></div>` : ''}
        </div>
        ${nc.description ? `<div style="margin-bottom:16px"><div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:6px">Description</div><div style="font-size:13px;color:var(--txt2);line-height:1.6">${escHtml(nc.description)}</div></div>` : ''}
        ${nc.correctiveAction ? `<div style="padding:12px;background:var(--bg3);border-radius:8px;margin-bottom:16px"><div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:6px">Corrective action</div><div style="font-size:13px;color:var(--txt2);line-height:1.6">${escHtml(nc.correctiveAction)}</div></div>` : ''}
        <div style="display:flex;gap:8px;padding-top:16px;border-top:.5px solid var(--bd)">
          ${isOpen ? `<button class="btn btn-primary btn-sm" onclick="closePanel();Safety.closeNC('${nc.id}')">Close out</button>` : ''}
          <button class="btn btn-ghost btn-sm" onclick="closePanel()">Close</button>
        </div>
      </div>
    `);
  }

  /* ── MEETINGS TAB ── */
  function _meetingsTab() {
    const vessel = FM.currentVessel();
    const meetings = (FM.safetyMeetings || []).filter(m => m.vessel === vessel.id)
      .sort((a, b) => b.date.localeCompare(a.date));

    const actions = `<div style="display:flex;justify-content:flex-end;margin-bottom:16px">
      <button class="btn btn-primary btn-sm" onclick="Safety.openMeeting()">+ Log meeting</button>
    </div>`;

    if (!meetings.length) return actions + `<div class="empty" style="padding:40px 0"><div class="empty-title">No meetings logged</div><div class="empty-sub">Log your first safety meeting above</div></div>`;

    const rows = meetings.map(m => {
      const avatars = (m.attendees || []).slice(0, 5).map(cid =>
        `<span style="width:20px;height:20px;border-radius:50%;background:${FM.crewColor(cid)}22;color:${FM.crewColor(cid)};font-size:8px;font-weight:700;display:inline-flex;align-items:center;justify-content:center" title="${FM.crewName(cid)}">${FM.crewInitials(cid)}</span>`
      ).join('');
      return `<tr>
        <td>
          <div style="font-size:13px;font-weight:500;color:var(--txt)">${escHtml(m.topic)}</div>
          ${m.notes ? `<div style="font-size:11px;color:var(--txt3);margin-top:1px;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(m.notes)}</div>` : ''}
        </td>
        <td style="font-size:12px;color:var(--txt2);white-space:nowrap">${fmtDate(m.date)}</td>
        <td style="font-size:12px;color:var(--txt3)">${m.duration ? m.duration + ' min' : '—'}</td>
        <td style="font-size:12px;color:var(--txt2)">${escHtml(FM.crewName(m.conductor))}</td>
        <td><div style="display:flex;gap:3px">${avatars}${m.attendees && m.attendees.length > 5 ? `<span style="font-size:10px;color:var(--txt3);align-self:center;margin-left:3px">+${m.attendees.length-5}</span>` : ''}</div></td>
        <td><button class="btn btn-ghost btn-xs" onclick="Safety.delMeeting('${m.id}')">Remove</button></td>
      </tr>`;
    }).join('');

    return actions + `<div class="tbl-wrap"><table class="tbl">
      <thead><tr>
        <th>Topic</th>
        <th style="width:110px">Date</th>
        <th style="width:80px">Duration</th>
        <th style="width:150px">Conducted by</th>
        <th style="width:100px">Attendees</th>
        <th style="width:80px"></th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
  }

  /* ── MODAL ── */
  function _modalHtml() {
    return `<div id="safety-modal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.6);align-items:center;justify-content:center">
      <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:12px;width:520px;max-width:92vw;padding:24px;max-height:90vh;overflow-y:auto">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <div style="font-size:14px;font-weight:600;color:var(--txt)" id="safety-modal-title">Log drill</div>
          <button onclick="Safety.closeModal()" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:18px;line-height:1">×</button>
        </div>
        <div id="safety-modal-body"></div>
      </div>
    </div>`;
  }

  function _showModal(title, bodyHtml) {
    const modal = document.getElementById('safety-modal');
    if (!modal) return;
    document.getElementById('safety-modal-title').textContent = title;
    document.getElementById('safety-modal-body').innerHTML = bodyHtml;
    modal.style.display = 'flex';
  }

  function closeModal() {
    const modal = document.getElementById('safety-modal');
    if (modal) modal.style.display = 'none';
  }

  /* ── DRILL MODAL ── */
  function _drillForm(scheduled) {
    const vessel = FM.currentVessel();
    const crewList = (FM.crew || []).filter(c => c.vessel === (vessel && vessel.id));
    const typeOpts = Object.entries(DRILL_TYPES).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('');
    const crewOpts = crewList.map(c=>`<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer"><input type="checkbox" value="${c.id}" style="accent-color:var(--grn)"> <span style="font-size:12px;color:var(--txt)">${escHtml(c.name)}</span> <span style="font-size:10px;color:var(--txt3)">${escHtml(c.role)}</span></label>`).join('');
    return `
      <div style="margin-bottom:14px">
        <label class="inp-lbl">Drill type</label>
        <select class="inp" id="dm-type">${typeOpts}</select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div>
          <label class="inp-lbl">Date</label>
          <input class="inp" id="dm-date" type="date" value="${new Date().toISOString().slice(0,10)}">
        </div>
        <div>
          <label class="inp-lbl">Conducted by</label>
          <select class="inp" id="dm-conductor">${crewList.map(c=>`<option value="${c.id}">${escHtml(c.name)}</option>`).join('')}</select>
        </div>
      </div>
      ${!scheduled ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div>
          <label class="inp-lbl">Duration (minutes)</label>
          <input class="inp" id="dm-dur" type="number" placeholder="e.g. 25">
        </div>
        <div>
          <label class="inp-lbl">Location / scenario</label>
          <input class="inp" id="dm-loc" placeholder="e.g. Engine room">
        </div>
      </div>
      <div style="margin-bottom:14px">
        <label class="inp-lbl">Crew present</label>
        <div style="padding:8px 10px;background:var(--bg3);border-radius:8px;max-height:160px;overflow-y:auto">${crewOpts}</div>
      </div>
      <div style="margin-bottom:16px">
        <label class="inp-lbl">Notes</label>
        <textarea class="inp" id="dm-notes" rows="3" placeholder="Observations, deficiencies, actions…"></textarea>
      </div>` : ''}
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="Safety.closeModal()">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="Safety.saveDrill(${scheduled})">${scheduled?'Schedule drill':'Log drill'}</button>
      </div>
    `;
  }

  function openLogDrill()      { _showModal('Log completed drill', _drillForm(false)); }
  function openScheduleDrill() { _showModal('Schedule drill',      _drillForm(true));  }

  function saveDrill(scheduled) {
    const vessel = FM.currentVessel();
    const type   = document.getElementById('dm-type')?.value;
    const date   = document.getElementById('dm-date')?.value;
    const cond   = document.getElementById('dm-conductor')?.value;
    if (!date) { alert('Date is required.'); return; }

    const drill = {
      id: 'dr' + Date.now(), vessel: vessel.id, type, date, conductor: cond,
      crew: [], duration: null, location: '', notes: '',
      status: scheduled ? 'scheduled' : 'completed',
    };

    if (!scheduled) {
      drill.duration = parseInt(document.getElementById('dm-dur')?.value) || null;
      drill.location = document.getElementById('dm-loc')?.value.trim() || '';
      drill.notes    = document.getElementById('dm-notes')?.value.trim() || '';
      drill.crew     = [...document.querySelectorAll('#safety-modal-body input[type=checkbox]:checked')].map(cb => cb.value);
    }

    FM.drills.push(drill);
    closeModal();
    render();
  }

  function completeDrill(id) {
    const d = (FM.drills || []).find(x => x.id === id);
    if (!d) return;
    const vessel = FM.currentVessel();
    const crewList = (FM.crew || []).filter(c => c.vessel === (vessel && vessel.id));
    const crewOpts = crewList.map(c=>`<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer"><input type="checkbox" value="${c.id}" style="accent-color:var(--grn)"> <span style="font-size:12px;color:var(--txt)">${escHtml(c.name)}</span></label>`).join('');
    const dt = DRILL_TYPES[d.type] || { label: d.type };
    _showModal('Log ' + dt.label + ' Drill Complete', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div><label class="inp-lbl">Duration (min)</label><input class="inp" id="dm-dur" type="number" placeholder="25"></div>
        <div><label class="inp-lbl">Location</label><input class="inp" id="dm-loc" placeholder="Engine room"></div>
      </div>
      <div style="margin-bottom:14px">
        <label class="inp-lbl">Crew present</label>
        <div style="padding:8px 10px;background:var(--bg3);border-radius:8px;max-height:160px;overflow-y:auto">${crewOpts}</div>
      </div>
      <div style="margin-bottom:16px">
        <label class="inp-lbl">Notes</label>
        <textarea class="inp" id="dm-notes" rows="3" placeholder="Observations, deficiencies, actions…"></textarea>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="Safety.closeModal()">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="Safety._markComplete('${id}')">Save</button>
      </div>
    `);
  }

  function _markComplete(id) {
    const d = (FM.drills || []).find(x => x.id === id);
    if (!d) return;
    d.status   = 'completed';
    d.duration = parseInt(document.getElementById('dm-dur')?.value) || null;
    d.location = document.getElementById('dm-loc')?.value.trim() || '';
    d.notes    = document.getElementById('dm-notes')?.value.trim() || '';
    d.crew     = [...document.querySelectorAll('#safety-modal-body input[type=checkbox]:checked')].map(cb => cb.value);
    closeModal();
    render();
  }

  function delDrill(id) {
    if (!confirm('Remove this drill record?')) return;
    FM.drills = FM.drills.filter(d => d.id !== id);
    render();
  }

  /* ── NC MODAL ── */
  function openNC() {
    const vessel = FM.currentVessel();
    const crewList = (FM.crew || []).filter(c => c.vessel === (vessel && vessel.id));
    const crewOpts = crewList.map(c=>`<option value="${c.id}">${escHtml(c.name)} — ${escHtml(c.role)}</option>`).join('');
    const typeOpts = Object.entries(NC_TYPES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
    const nextRef  = 'NC-' + new Date().getFullYear() + '-' + String((FM.nonConformances||[]).length+1).padStart(3,'0');

    _showModal('Raise non-conformance / incident', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div><label class="inp-lbl">Reference</label><input class="inp" id="nc-ref" value="${nextRef}"></div>
        <div><label class="inp-lbl">Type</label><select class="inp" id="nc-type">${typeOpts}</select></div>
      </div>
      <div style="margin-bottom:14px">
        <label class="inp-lbl">Title</label>
        <input class="inp" id="nc-title" placeholder="Brief description of the event">
      </div>
      <div style="margin-bottom:14px">
        <label class="inp-lbl">Description</label>
        <textarea class="inp" id="nc-desc" rows="3" placeholder="What happened, when, where, who was involved…"></textarea>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div><label class="inp-lbl">Date</label><input class="inp" id="nc-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
        <div><label class="inp-lbl">Raised by</label><select class="inp" id="nc-raised">${crewOpts}</select></div>
      </div>
      <div style="margin-bottom:16px">
        <label class="inp-lbl">Assigned to (for corrective action)</label>
        <select class="inp" id="nc-assign">${crewOpts}</select>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="Safety.closeModal()">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="Safety.saveNC()">Raise report</button>
      </div>
    `);
  }

  function saveNC() {
    const title = document.getElementById('nc-title')?.value.trim();
    const desc  = document.getElementById('nc-desc')?.value.trim();
    if (!title) { alert('Title is required.'); return; }

    const vessel = FM.currentVessel();
    FM.nonConformances.push({
      id: 'nc' + Date.now(),
      vessel: vessel.id,
      ref:       document.getElementById('nc-ref')?.value.trim(),
      date:      document.getElementById('nc-date')?.value,
      type:      document.getElementById('nc-type')?.value,
      title,
      description: desc,
      raisedBy:  document.getElementById('nc-raised')?.value,
      assignee:  document.getElementById('nc-assign')?.value,
      status:    'open',
      correctiveAction: '',
      closedDate: null,
    });
    closeModal();
    render();
  }

  function closeNC(id) {
    const nc = (FM.nonConformances || []).find(n => n.id === id);
    if (!nc) return;
    _showModal('Close out — ' + nc.ref, `
      <div style="margin-bottom:6px;font-size:12px;color:var(--txt2)">${escHtml(nc.title)}</div>
      <div style="margin-bottom:14px">
        <label class="inp-lbl">Corrective action taken</label>
        <textarea class="inp" id="nc-ca" rows="4" placeholder="Describe the corrective action and any preventive measures implemented…">${escHtml(nc.correctiveAction||'')}</textarea>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="Safety.closeModal()">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="Safety._saveClose('${id}')">Mark closed</button>
      </div>
    `);
  }

  function _saveClose(id) {
    const nc = (FM.nonConformances || []).find(n => n.id === id);
    if (!nc) return;
    nc.correctiveAction = document.getElementById('nc-ca')?.value.trim() || '';
    nc.status     = 'closed';
    nc.closedDate = new Date().toISOString().slice(0,10);
    closeModal();
    render();
  }

  function delNC(id) {
    if (!confirm('Remove this report?')) return;
    FM.nonConformances = FM.nonConformances.filter(n => n.id !== id);
    render();
  }

  /* ── MEETING MODAL ── */
  function openMeeting() {
    const vessel = FM.currentVessel();
    const crewList = (FM.crew || []).filter(c => c.vessel === (vessel && vessel.id));
    const crewOpts = crewList.map(c=>`<option value="${c.id}">${escHtml(c.name)} — ${escHtml(c.role)}</option>`).join('');
    const checkboxes = crewList.map(c=>`<label style="display:flex;align-items:center;gap:8px;padding:6px 0;cursor:pointer"><input type="checkbox" value="${c.id}" checked style="accent-color:var(--grn)"> <span style="font-size:12px;color:var(--txt)">${escHtml(c.name)}</span></label>`).join('');

    _showModal('Log safety meeting', `
      <div style="margin-bottom:14px">
        <label class="inp-lbl">Topic / agenda</label>
        <input class="inp" id="sm-topic" placeholder="e.g. Emergency procedure review">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div><label class="inp-lbl">Date</label><input class="inp" id="sm-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
        <div><label class="inp-lbl">Duration (minutes)</label><input class="inp" id="sm-dur" type="number" placeholder="e.g. 30"></div>
      </div>
      <div style="margin-bottom:14px">
        <label class="inp-lbl">Conducted by</label>
        <select class="inp" id="sm-conductor">${crewOpts}</select>
      </div>
      <div style="margin-bottom:14px">
        <label class="inp-lbl">Attendees</label>
        <div style="padding:8px 10px;background:var(--bg3);border-radius:8px;max-height:160px;overflow-y:auto">${checkboxes}</div>
      </div>
      <div style="margin-bottom:16px">
        <label class="inp-lbl">Minutes / notes</label>
        <textarea class="inp" id="sm-notes" rows="3" placeholder="Key points discussed, decisions made, actions assigned…"></textarea>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="Safety.closeModal()">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="Safety.saveMeeting()">Save meeting</button>
      </div>
    `);
  }

  function saveMeeting() {
    const topic = document.getElementById('sm-topic')?.value.trim();
    if (!topic) { alert('Topic is required.'); return; }
    const vessel = FM.currentVessel();
    FM.safetyMeetings.push({
      id:        'sm' + Date.now(),
      vessel:    vessel.id,
      date:      document.getElementById('sm-date')?.value,
      conductor: document.getElementById('sm-conductor')?.value,
      attendees: [...document.querySelectorAll('#safety-modal-body input[type=checkbox]:checked')].map(cb => cb.value),
      topic,
      notes:     document.getElementById('sm-notes')?.value.trim() || '',
      duration:  parseInt(document.getElementById('sm-dur')?.value) || 0,
    });
    closeModal();
    render();
  }

  function delMeeting(id) {
    if (!confirm('Remove this meeting record?')) return;
    FM.safetyMeetings = FM.safetyMeetings.filter(m => m.id !== id);
    render();
  }

  function tab(t) {
    _tab = t;
    render();
  }

  return {
    render, tab, closeModal,
    openLogDrill, openScheduleDrill, saveDrill, completeDrill, _markComplete, delDrill,
    openNC, saveNC, closeNC, _saveClose, delNC, _openNCDetail,
    openMeeting, saveMeeting, delMeeting,
  };
})();

window.Safety = Safety;
