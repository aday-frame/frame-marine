/* ── CHARTER MODULE ── */
'use strict';

const Charter = window.Charter = {};

Charter._view      = 'list'; // 'list' | 'detail'
Charter._detailId  = null;
Charter._activeTab = 'overview';

/* ── HELPERS ── */
function _chFmt(s) {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + +d + ', ' + y;
}
function _chStatusBadge(c) {
  if (c.status === 'active')   return '<span class="badge b-blue">Active</span>';
  if (c.status === 'upcoming') return '<span class="badge b-hold">Upcoming</span>';
  return '<span class="badge" style="background:var(--bg3);color:var(--txt3)">Completed</span>';
}
function _chMeta(label, val) {
  return `<div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;padding:10px 14px">
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">${label}</div>
    <div style="font-size:13px;color:var(--txt2)">${val}</div>
  </div>`;
}

/* ── VISIBLE CHARTERS ── */
Charter._visible = function() {
  const all = FM.charters.filter(c =>
    App.currentVesselId === 'all' || App.currentVesselId === 'portfolio' || c.vessel === App.currentVesselId
  );
  const order = { active: 0, upcoming: 1, completed: 2 };
  return all.sort((a, b) => (order[a.status] - order[b.status]) || new Date(b.start) - new Date(a.start));
};

/* ── ENTRY POINT ── */
Charter.render = function() {
  if (Charter._view === 'detail' && Charter._detailId) {
    Charter._renderDetail();
  } else {
    Charter._renderList();
  }
};

/* ══════════════════════════════
   LIST VIEW
══════════════════════════════ */
Charter._renderList = function() {
  Charter._view = 'list';
  const wrap = document.getElementById('page-charter');
  if (!wrap) return;

  const charters = Charter._visible();
  const active    = charters.filter(c => c.status === 'active').length;
  const upcoming  = charters.filter(c => c.status === 'upcoming').length;
  const completed = charters.filter(c => c.status === 'completed').length;

  const rows = charters.map(c => {
    const vessel  = FM.vessels.find(v => v.id === c.vessel);
    const apaExp  = (c.apaExpenses || []).reduce((s, e) => s + e.amount, 0);
    const apaLeft = c.apa ? c.apa - apaExp : null;
    return `<tr style="cursor:pointer" onclick="Charter.openDetail('${c.id}')">
      <td>
        <div style="font-size:13px;font-weight:500;color:var(--txt)">${escHtml(c.name)}</div>
        <div style="font-size:11px;color:var(--txt3);margin-top:1px">${_chFmt(c.start)} – ${_chFmt(c.end)}</div>
      </td>
      <td style="font-size:12px;color:var(--txt2)">${vessel ? escHtml(vessel.name) : '—'}</td>
      <td style="font-size:12px;color:var(--txt2)">${c.guests ? c.guests.length : 0}</td>
      <td style="font-size:12px;color:var(--txt2)">$${(c.fee / 1000).toFixed(0)}k</td>
      <td style="font-size:12px;color:var(--txt2)">${apaLeft !== null ? '$' + (apaLeft / 1000).toFixed(0) + 'k left' : '—'}</td>
      <td style="font-size:12px;color:var(--txt2)">${c.broker ? escHtml(c.broker.split(' ')[0]) : '—'}</td>
      <td>${_chStatusBadge(c)}</td>
      <td onclick="event.stopPropagation()">
        <button class="btn btn-ghost btn-xs" onclick="Charter.remove('${c.id}')">Remove</button>
      </td>
    </tr>`;
  }).join('');

  wrap.innerHTML = `
    <div style="padding:0 0 60px">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);border-bottom:.5px solid var(--bd)">
        <div class="wo-stat"><div class="wo-stat-num">${charters.length}</div><div class="wo-stat-lbl">Total</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:#2dd4bf">${active}</div><div class="wo-stat-lbl">Active</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:var(--yel)">${upcoming}</div><div class="wo-stat-lbl">Upcoming</div></div>
        <div class="wo-stat" style="border-right:none"><div class="wo-stat-num" style="color:var(--txt3)">${completed}</div><div class="wo-stat-lbl">Completed</div></div>
      </div>
      <div style="display:flex;justify-content:flex-end;padding:16px 20px">
        <button class="btn btn-primary btn-sm" onclick="Charter.openNew()">+ New charter</button>
      </div>
      ${charters.length === 0
        ? `<div style="padding:0 20px"><div class="empty"><div class="empty-title">No charters yet</div><div class="empty-sub">Add your first charter booking above</div></div></div>`
        : `<div class="tbl-wrap"><table class="tbl">
            <thead><tr>
              <th>Charter</th>
              <th style="width:120px">Vessel</th>
              <th style="width:65px">Guests</th>
              <th style="width:80px">Fee</th>
              <th style="width:100px">APA</th>
              <th style="width:110px">Broker</th>
              <th style="width:110px">Status</th>
              <th style="width:80px"></th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table></div>`}
    </div>`;
};

/* ══════════════════════════════
   DETAIL VIEW
══════════════════════════════ */
Charter.openDetail = function(id) {
  Charter._view      = 'detail';
  Charter._detailId  = id;
  Charter._activeTab = 'overview';
  Charter._renderDetail();
};

Charter.showList = function() {
  Charter._view = 'list';
  Charter.render();
};

Charter.switchTab = function(tab) {
  Charter._activeTab = tab;
  Charter._renderDetail();
};

Charter._renderDetail = function() {
  const wrap = document.getElementById('page-charter');
  if (!wrap) return;
  const c = FM.charters.find(x => x.id === Charter._detailId);
  if (!c) { Charter._renderList(); return; }

  const vessel     = FM.vessels.find(v => v.id === c.vessel);
  const apaExp     = (c.apaExpenses || []).reduce((s, e) => s + e.amount, 0);
  const apaLeft    = c.apa ? c.apa - apaExp : null;
  const openReqs   = (FM.guestRequests || []).filter(r => r.charter === c.id && r.status === 'open').length;
  const pendingPay = c.quote ? c.quote.payments.filter(p => !p.paid).length : 0;

  const tabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'guests',    label: `Guests${c.guests && c.guests.length ? ' (' + c.guests.length + ')' : ''}` },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'apa',       label: apaLeft !== null ? `APA ($${(apaLeft/1000).toFixed(0)}k left)` : 'APA' },
    { id: 'costs',     label: c.costs && c.costs.length ? `Costs (${c.costs.length})` : 'Costs' },
    { id: 'requests',  label: openReqs ? `Requests (${openReqs})` : 'Requests' },
    { id: 'documents', label: c.documents && c.documents.length ? `Documents (${c.documents.length})` : 'Documents' },
    { id: 'booking',   label: pendingPay ? `Booking ⚠` : 'Booking' },
  ];

  const tabBar = tabs.map(t =>
    `<button class="tab-btn ${Charter._activeTab === t.id ? 'tab-btn-active' : ''}"
             onclick="Charter.switchTab('${t.id}')">${t.label}</button>`
  ).join('');

  let content = '';
  switch (Charter._activeTab) {
    case 'overview':   content = Charter._tabOverview(c, vessel, apaLeft); break;
    case 'guests':     content = Charter._tabGuests(c); break;
    case 'itinerary':  content = Charter._tabItinerary(c); break;
    case 'apa':        content = Charter._tabAPA(c, apaExp, apaLeft); break;
    case 'costs':      content = Charter._tabCosts(c); break;
    case 'requests':   content = Charter._tabRequests(c); break;
    case 'documents':  content = Charter._tabDocuments(c); break;
    case 'booking':    content = Charter._tabBooking(c); break;
  }

  wrap.innerHTML = `
    <div style="padding:0 0 60px">
      <!-- Back bar -->
      <div style="display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:.5px solid var(--bd)">
        <button class="btn btn-ghost btn-sm" onclick="Charter.showList()" style="gap:6px">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:12px;height:12px"><path d="M10 4l-4 4 4 4"/></svg>
          All charters
        </button>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600;color:var(--txt);letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(c.name)}</div>
        </div>
        ${_chStatusBadge(c)}
        <button class="btn btn-danger btn-xs" onclick="Charter.remove('${c.id}')">Remove</button>
      </div>

      <!-- Tab bar -->
      <div style="display:flex;gap:4px;padding:0 20px;border-bottom:.5px solid var(--bd);overflow-x:auto">
        ${tabBar}
      </div>

      <!-- Tab content -->
      <div style="padding:20px">
        ${content}
      </div>
    </div>`;
};

/* ── OVERVIEW TAB ── */
Charter._tabOverview = function(c, vessel, apaLeft) {
  const apaExp = (c.apaExpenses || []).reduce((s, e) => s + e.amount, 0);
  const totalCosts = (c.costs || []).reduce((s, e) => s + e.amount, 0);
  return `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
      ${_chMeta('Charter fee', '$' + c.fee.toLocaleString() + ' ' + (c.currency || 'USD'))}
      ${_chMeta('APA advance', c.apa ? '$' + c.apa.toLocaleString() : '—')}
      ${_chMeta('APA balance', apaLeft !== null ? '$' + apaLeft.toLocaleString() + ' remaining' : '—')}
      ${_chMeta('Start', _chFmt(c.start))}
      ${_chMeta('End', _chFmt(c.end))}
      ${_chMeta('Duration', c.start && c.end ? Math.round((new Date(c.end)-new Date(c.start))/(864e5)) + ' nights' : '—')}
      ${_chMeta('Vessel', vessel ? escHtml(vessel.name) : '—')}
      ${_chMeta('Guests', c.guests ? c.guests.length + ' pax' : '—')}
      ${_chMeta('Broker', c.broker ? escHtml(c.broker) : '—')}
      ${_chMeta('Embarkation', c.embark ? escHtml(c.embark) : '—')}
      ${_chMeta('Disembarkation', c.disembark ? escHtml(c.disembark) : '—')}
      ${c.brokerContact ? _chMeta('Broker contact', escHtml(c.brokerContact)) : ''}
    </div>
    ${totalCosts ? `<div style="padding:12px 14px;background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;font-size:12px;color:var(--txt3)">
      Total charter costs logged: <strong style="color:var(--txt)">$${totalCosts.toLocaleString()}</strong>
    </div>` : ''}`;
};

/* ── GUESTS TAB ── */
Charter._tabGuests = function(c) {
  if (!c.guests || !c.guests.length) {
    return `<div class="empty"><div class="empty-title">No guests added</div></div>`;
  }
  const guestCards = c.guests.map(gid => {
    const g = (FM.guests || []).find(x => x.id === gid);
    if (!g) return '';
    return `<div style="padding:16px;background:var(--bg2);border:.5px solid var(--bd);border-radius:10px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        <div style="width:36px;height:36px;border-radius:50%;background:${g.color}22;color:${g.color};font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${g.initials}</div>
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--txt)">${escHtml(g.name)}</div>
          <div style="font-size:11px;color:var(--txt3)">${escHtml(g.relation)} · ${escHtml(g.cabin || '—')}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">
        <div><span style="color:var(--txt4)">Dietary: </span><span style="color:var(--txt2)">${escHtml(g.dietary || '—')}</span></div>
        <div><span style="color:var(--txt4)">Allergies: </span><span style="color:${g.allergies && g.allergies !== 'None' ? 'var(--red)' : 'var(--txt2)'}">${escHtml(g.allergies || 'None')}</span></div>
      </div>
      ${g.preferences ? `<div style="margin-top:8px;font-size:12px;color:var(--txt3);line-height:1.5">${escHtml(g.preferences)}</div>` : ''}
    </div>`;
  }).join('');
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">${guestCards}</div>`;
};

/* ── ITINERARY TAB ── */
Charter._tabItinerary = function(c) {
  if (!c.itinerary || !c.itinerary.length) {
    return `<div class="empty"><div class="empty-title">No itinerary added</div></div>`;
  }
  const rows = c.itinerary.map((d, i) => `
    <div style="display:grid;grid-template-columns:40px 1fr;gap:16px;padding:14px 0;border-bottom:.5px solid var(--bd)">
      <div style="text-align:center">
        <div style="font-size:9px;font-weight:700;color:var(--txt4);text-transform:uppercase">Day</div>
        <div style="font-size:18px;font-weight:600;color:#2dd4bf">${i + 1}</div>
        <div style="font-size:9px;color:var(--txt4)">${_chFmt(d.date).slice(0,6)}</div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:600;color:var(--txt);margin-bottom:4px">${escHtml(d.location)}</div>
        ${d.notes ? `<div style="font-size:12px;color:var(--txt3);line-height:1.6">${escHtml(d.notes)}</div>` : ''}
      </div>
    </div>`).join('');
  return `<div>${rows}</div>`;
};

/* ── APA TAB ── */
Charter._tabAPA = function(c, apaExp, apaLeft) {
  const expenses = c.apaExpenses || [];
  const byCategory = {};
  expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });

  const expRows = expenses.map(e => `
    <tr>
      <td style="font-size:12px;color:var(--txt2)">${escHtml(e.category)}</td>
      <td style="font-size:12px;color:var(--txt)">${escHtml(e.desc)}</td>
      <td style="font-size:12px;color:var(--txt3)">${_chFmt(e.date)}</td>
      <td style="font-size:12px;color:var(--txt);text-align:right;font-weight:500">$${e.amount.toLocaleString()}</td>
    </tr>`).join('');

  const pct = c.apa ? Math.min(100, Math.round((apaExp / c.apa) * 100)) : 0;
  const barColor = pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--yel)' : '#2dd4bf';

  return `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
      ${_chMeta('APA advance', c.apa ? '$' + c.apa.toLocaleString() : '—')}
      ${_chMeta('Spent', '$' + apaExp.toLocaleString())}
      ${_chMeta('Remaining', apaLeft !== null ? '$' + apaLeft.toLocaleString() : '—')}
    </div>
    ${c.apa ? `<div style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt3);margin-bottom:6px"><span>APA utilisation</span><span>${pct}%</span></div>
      <div style="height:6px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${barColor};border-radius:3px;transition:width .4s"></div></div>
    </div>` : ''}
    ${expenses.length ? `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th style="width:120px">Category</th><th>Description</th><th style="width:110px">Date</th><th style="width:100px;text-align:right">Amount</th></tr></thead>
      <tbody>${expRows}</tbody>
      <tfoot><tr style="border-top:.5px solid var(--bd)">
        <td colspan="3" style="font-size:12px;font-weight:600;color:var(--txt);padding:10px 12px">Total spent</td>
        <td style="font-size:12px;font-weight:600;color:var(--txt);text-align:right;padding:10px 12px">$${apaExp.toLocaleString()}</td>
      </tr></tfoot>
    </table></div>` : `<div class="empty"><div class="empty-title">No APA expenses logged</div></div>`}`;
};

/* ── COSTS TAB ── */
Charter._tabCosts = function(c) {
  const costs = c.costs || [];
  const total = costs.reduce((s, e) => s + e.amount, 0);
  if (!costs.length) return `<div class="empty"><div class="empty-title">No costs logged</div></div>`;
  const rows = costs.map(e => `
    <tr>
      <td style="font-size:12px;color:var(--txt2)">${escHtml(e.category)}</td>
      <td style="font-size:12px;color:var(--txt)">${escHtml(e.desc)}</td>
      <td style="font-size:12px;color:var(--txt3)">${_chFmt(e.date)}</td>
      ${e.notes ? `<td style="font-size:11px;color:var(--txt4);max-width:180px">${escHtml(e.notes)}</td>` : '<td></td>'}
      <td style="font-size:12px;font-weight:500;color:var(--txt);text-align:right">$${e.amount.toLocaleString()}</td>
    </tr>`).join('');
  return `<div class="tbl-wrap"><table class="tbl">
    <thead><tr><th style="width:120px">Category</th><th>Description</th><th style="width:110px">Date</th><th style="width:180px">Notes</th><th style="width:100px;text-align:right">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr style="border-top:.5px solid var(--bd)">
      <td colspan="4" style="font-size:12px;font-weight:600;color:var(--txt);padding:10px 12px">Total</td>
      <td style="font-size:12px;font-weight:600;color:var(--txt);text-align:right;padding:10px 12px">$${total.toLocaleString()}</td>
    </tr></tfoot>
  </table></div>`;
};

/* ── REQUESTS TAB ── */
Charter._tabRequests = function(c) {
  const reqs = (FM.guestRequests || []).filter(r => r.charter === c.id);
  if (!reqs.length) return `<div class="empty"><div class="empty-title">No guest requests</div></div>`;
  const rows = reqs.map(r => {
    const g = (FM.guests || []).find(x => x.id === r.guest);
    const isDone = r.status === 'done';
    return `<div style="padding:14px;background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;margin-bottom:8px;opacity:${isDone ? '.7' : '1'}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          ${g ? `<div style="width:24px;height:24px;border-radius:50%;background:${g.color}22;color:${g.color};font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${g.initials}</div>` : ''}
          <div>
            <div style="font-size:12px;font-weight:500;color:var(--txt)">${g ? escHtml(g.name) : 'Guest'}</div>
            <div style="font-size:10px;color:var(--txt4)">${escHtml(r.time)} · ${escHtml(r.type)}</div>
          </div>
        </div>
        <span class="badge ${isDone ? 'b-done' : 'b-high'}">${isDone ? 'Done' : 'Open'}</span>
      </div>
      <div style="font-size:12px;color:var(--txt2);line-height:1.5">${escHtml(r.text)}</div>
    </div>`;
  }).join('');
  return `<div>${rows}</div>`;
};

/* ── DOCUMENTS TAB ── */
Charter._tabDocuments = function(c) {
  const docs = c.documents || [];
  if (!docs.length) return `<div class="empty"><div class="empty-title">No documents added</div></div>`;
  const typeIcon = t => ({ contract:'📄', finance:'💰', regulatory:'🛂', safety:'🛡', preferences:'👥' }[t] || '📎');
  const rows = docs.map(d => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:.5px solid var(--bd)">
      <span style="font-size:18px">${typeIcon(d.type)}</span>
      <div style="flex:1">
        <div style="font-size:13px;color:var(--txt)">${escHtml(d.name)}</div>
        <div style="font-size:11px;color:var(--txt4);text-transform:capitalize;margin-top:1px">${escHtml(d.type)}</div>
      </div>
      <div style="font-size:11px;color:var(--txt3)">${d.date ? _chFmt(d.date) : '<span style="color:var(--yel)">Pending</span>'}</div>
    </div>`).join('');
  return `<div>${rows}</div>`;
};

/* ── BOOKING TAB ── */
Charter._tabBooking = function(c) {
  if (!c.quote) return `<div class="empty"><div class="empty-title">No booking details</div></div>`;
  const q = c.quote;
  const payRows = (q.payments || []).map(p => {
    const isPaid = p.paid;
    return `<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:.5px solid var(--bd)">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500;color:var(--txt)">${escHtml(p.label)}</div>
        <div style="font-size:11px;color:var(--txt3)">Due: ${_chFmt(p.due)}${isPaid && p.paidDate ? ' · Paid: ' + _chFmt(p.paidDate) : ''}</div>
      </div>
      <div style="font-size:14px;font-weight:600;color:var(--txt)">$${p.amount.toLocaleString()}</div>
      <span class="badge ${isPaid ? 'b-done' : 'b-high'}">${isPaid ? 'Paid' : 'Outstanding'}</span>
    </div>`;
  }).join('');

  const wire = (label, w) => w ? `
    <div style="margin-top:16px">
      <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:8px">${label}</div>
      <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;padding:14px;font-size:12px;line-height:1.8;color:var(--txt2)">
        <div><span style="color:var(--txt4)">Bank: </span>${escHtml(w.bank)}, ${escHtml(w.city)}</div>
        <div><span style="color:var(--txt4)">Account: </span>${escHtml(w.accountName)}</div>
        <div><span style="color:var(--txt4)">IBAN: </span><span style="font-family:var(--mono)">${escHtml(w.iban)}</span></div>
        <div><span style="color:var(--txt4)">SWIFT: </span><span style="font-family:var(--mono)">${escHtml(w.swift)}</span></div>
        <div><span style="color:var(--txt4)">Reference: </span><span style="font-family:var(--mono)">${escHtml(w.ref)}</span></div>
      </div>
    </div>` : '';

  return `
    <div style="margin-bottom:6px;display:flex;align-items:center;gap:8px">
      <span style="font-size:11px;color:var(--txt3)">Quote ref: <strong style="font-family:var(--mono);color:var(--txt2)">${q.ref}</strong></span>
      <span class="badge b-done" style="font-size:9px">${escHtml(q.status.replace('_', ' '))}</span>
    </div>
    ${payRows}
    ${wire('Charter fee wire details', q.wireCharter)}
    ${wire('APA wire details', q.wireAPA)}`;
};

/* ══════════════════════════════
   NEW CHARTER MODAL
══════════════════════════════ */
Charter.openNew = function() {
  const vesselOpts = FM.vessels.map(v => `<option value="${v.id}">${escHtml(v.name)}</option>`).join('');
  openModal(`
    <form onsubmit="Charter.save(event)" style="display:flex;flex-direction:column;gap:14px">
      <div>
        <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Charter name *</label>
        <input class="inp" id="ch-name" placeholder="e.g. Bermuda Summer — Day Family" required>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Vessel *</label>
          <select class="inp" id="ch-vessel">${vesselOpts}</select>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Status</label>
          <select class="inp" id="ch-status">
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Start date *</label>
          <input class="inp" id="ch-start" type="date" required>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">End date *</label>
          <input class="inp" id="ch-end" type="date" required>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Charter fee (USD)</label>
          <input class="inp" id="ch-fee" type="number" placeholder="185000">
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">APA advance (USD)</label>
          <input class="inp" id="ch-apa" type="number" placeholder="37000">
        </div>
      </div>
      <div>
        <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Broker</label>
        <input class="inp" id="ch-broker" placeholder="e.g. Burgess Yachts">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Embarkation port</label>
          <input class="inp" id="ch-embark" placeholder="Gustavia, St. Barths">
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Disembarkation port</label>
          <input class="inp" id="ch-disembark" placeholder="Hamilton, Bermuda">
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
        <button type="button" class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm">Add charter</button>
      </div>
    </form>
  `, 'New charter');
};

Charter.save = function(e) {
  e.preventDefault();
  const name  = document.getElementById('ch-name').value.trim();
  const start = document.getElementById('ch-start').value;
  const end   = document.getElementById('ch-end').value;
  if (!name || !start || !end) return;
  FM.charters.push({
    id: 'ch-' + Date.now(),
    vessel:    document.getElementById('ch-vessel').value,
    status:    document.getElementById('ch-status').value,
    name, start, end,
    fee:       parseInt(document.getElementById('ch-fee').value) || 0,
    apa:       parseInt(document.getElementById('ch-apa').value) || 0,
    broker:    document.getElementById('ch-broker').value.trim() || '',
    embark:    document.getElementById('ch-embark').value.trim() || '',
    disembark: document.getElementById('ch-disembark').value.trim() || '',
    guests: [], itinerary: [], documents: [], apaExpenses: [], costs: [],
    currency: 'USD',
  });
  closeModal();
  Charter._renderList();
  showToast('Charter added', 'ok');
};

Charter.remove = function(id) {
  const c = FM.charters.find(x => x.id === id);
  if (!c || !confirm('Remove "' + c.name + '"?')) return;
  FM.charters = FM.charters.filter(x => x.id !== id);
  Charter._renderList();
  showToast('Charter removed');
};
