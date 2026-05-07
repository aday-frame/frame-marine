/* ── FRAME MARINE — CHARTER MODULE ── */
'use strict';

const Charter = window.Charter = {};

Charter.selectedId = null;
Charter.activeTab  = 'overview';

/* ── ENTRY POINT ── */
Charter.render = function() {
  const charters = Charter._visible();
  if (!Charter.selectedId || !charters.find(c => c.id === Charter.selectedId)) {
    Charter.selectedId = charters.length ? charters[0].id : null;
  }
  Charter.renderSidebar();
  Charter.renderDetail();
};

Charter._visible = function() {
  const all = FM.charters.filter(c =>
    App.currentVesselId === 'all' || c.vessel === App.currentVesselId
  );
  const order = { active: 0, upcoming: 1, completed: 2 };
  return all.sort((a, b) =>
    (order[a.status] - order[b.status]) || new Date(b.start) - new Date(a.start)
  );
};

/* ── SIDEBAR: charter list ── */
Charter.renderSidebar = function() {
  const wrap = document.getElementById('charter-sb');
  if (!wrap) return;

  const charters = Charter._visible();

  wrap.innerHTML = `
    <div style="padding:0 4px 8px">
      <button class="btn btn-ghost btn-sm" style="width:100%;justify-content:center"
              onclick="Charter.openNewModal()">+ New charter</button>
    </div>
    ${charters.map(c => {
      const sel = Charter.selectedId === c.id;
      const statusColor = c.status === 'active' ? 'var(--pur)' : c.status === 'upcoming' ? 'var(--or)' : 'var(--txt4)';
      const statusLabel = c.status === 'active' ? '● Active' : c.status === 'upcoming' ? 'Upcoming' : 'Done';
      const [title] = c.name.split(' — ');
      return `
        <div class="ni${sel ? ' active' : ''}" onclick="Charter.select('${c.id}')"
             style="flex-direction:column;align-items:stretch;gap:3px;height:auto;padding:10px 10px;cursor:pointer">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px">
            <span style="font-size:12px;font-weight:500;color:var(--txt);line-height:1.3;flex:1;min-width:0"
                  class="truncate">${escHtml(title)}</span>
            <span style="font-size:9px;font-weight:600;color:${statusColor};white-space:nowrap;flex-shrink:0">${statusLabel}</span>
          </div>
          <div style="font-size:10px;color:var(--txt3)">${_fmtMD(c.start)} – ${_fmtMD(c.end)}</div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <span style="font-size:10px;color:var(--txt4)">$${(c.fee / 1000).toFixed(0)}k · ${c.broker.split(' ')[0]}</span>
            ${c.guests.length ? `<span style="font-size:10px;color:var(--txt4)">${c.guests.length} guests</span>` : ''}
          </div>
        </div>`;
    }).join('')}
  `;
};

Charter.select = function(id) {
  Charter.selectedId = id;
  Charter.activeTab  = 'overview';
  navTo('charter', null, true);
};

/* ── DETAIL PANEL ── */
Charter.renderDetail = function() {
  const wrap = document.getElementById('charter-detail');
  if (!wrap) return;

  const c = Charter.selectedId ? FM.charters.find(x => x.id === Charter.selectedId) : null;
  if (!c) {
    wrap.innerHTML = `<div class="empty" style="padding:80px 0"><div class="empty-title">Select a charter</div></div>`;
    return;
  }

  const openReqs = FM.guestRequests.filter(r => r.charter === c.id && r.status === 'open').length;

  const outstandingPayments = c.quote ? c.quote.payments.filter(p => !p.paid).length : 0;
  const totalCosts  = (c.costs || []).reduce((s, e) => s + e.amount, 0);
  const apaExpenses = (c.apaExpenses || []).reduce((s, e) => s + e.amount, 0);
  const apaBalance  = (c.apa || 0) - apaExpenses;
  const tabs = [
    { id: 'overview',   label: 'Overview' },
    { id: 'guests',     label: c.guests.length ? `Guests (${c.guests.length})` : 'Guests' },
    { id: 'itinerary',  label: 'Itinerary' },
    { id: 'apa',        label: c.apa ? `APA ($${(apaBalance/1000).toFixed(0)}k left)` : 'APA' },
    { id: 'costs',      label: totalCosts ? `Costs ($${(totalCosts/1000).toFixed(0)}k)` : 'Costs' },
    { id: 'requests',   label: openReqs ? `Requests (${openReqs})` : 'Requests' },
    { id: 'documents',  label: `Documents (${c.documents.length})` },
    { id: 'booking',    label: outstandingPayments ? `Booking <span style="color:var(--red);font-weight:700">(${outstandingPayments} due)</span>` : 'Booking' },
  ];

  const statusStyle = c.status === 'active'
    ? 'background:var(--pur-bg);color:var(--pur);border-color:var(--pur-bd)'
    : '';
  const statusLabel = c.status === 'active' ? '● Active' : c.status === 'upcoming' ? 'Upcoming' : 'Completed';
  const badgeClass  = c.status === 'active' ? '' : c.status === 'upcoming' ? 'b-open' : 'b-done';

  wrap.innerHTML = `
    <!-- Header -->
    <div style="border-bottom:.5px solid var(--bd);padding:18px 24px 0;flex-shrink:0">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:12px">
        <div style="min-width:0;flex:1">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
            <span class="badge ${badgeClass}" style="${statusStyle}">${statusLabel}</span>
            <span style="font-size:11px;color:var(--txt3)">${escHtml(c.broker)}</span>
          </div>
          <div style="font-size:20px;font-weight:500;color:var(--txt);margin-bottom:4px">${escHtml(c.name)}</div>
          <div style="font-size:12px;color:var(--txt3)">
            ${_fmtDateLong(c.start)} → ${_fmtDateLong(c.end)}
            <span style="color:var(--bd2);margin:0 4px">·</span>
            <span style="color:var(--txt2)">${escHtml(c.embark)}</span>
            <span style="color:var(--txt3);margin:0 4px">→</span>
            <span style="color:var(--txt2)">${escHtml(c.disembark)}</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0">
          <div style="text-align:right">
            <div style="font-size:22px;font-weight:300;color:var(--pur)">$${(c.fee / 1000).toFixed(0)}k</div>
            <div style="font-size:10px;color:var(--txt3)">charter fee</div>
          </div>
          ${c.status === 'active'
            ? `<button class="btn btn-sm" style="background:var(--pur);color:#080808;font-weight:600"
                       onclick="window.open('guest.html','_blank')">Guest portal ↗</button>`
            : ''}
        </div>
      </div>
      <!-- Tab bar -->
      <div style="display:flex;gap:0;margin:0 -24px;padding:0 24px">
        ${tabs.map(t => `
          <button onclick="Charter.switchTab('${t.id}')"
                  style="padding:7px 14px;font-size:12px;
                         font-weight:${Charter.activeTab === t.id ? '600' : '400'};
                         color:${Charter.activeTab === t.id ? 'var(--txt)' : 'var(--txt3)'};
                         border:none;background:none;cursor:pointer;white-space:nowrap;
                         border-bottom:2px solid ${Charter.activeTab === t.id ? 'var(--or)' : 'transparent'};
                         margin-bottom:-1px">
            ${t.label}
          </button>`).join('')}
      </div>
    </div>
    <!-- Tab content -->
    <div id="charter-tab-content" style="padding:20px 24px;overflow-y:auto;flex:1"></div>
  `;

  Charter._renderTab();
};

Charter.switchTab = function(tab) {
  Charter.activeTab = tab;
  Charter.renderDetail();
};

Charter._renderTab = function() {
  const fn = {
    overview:  Charter.renderOverview,
    guests:    Charter.renderGuests,
    itinerary: Charter.renderItinerary,
    apa:       Charter.renderAPA,
    costs:     Charter.renderCosts,
    requests:  Charter.renderRequests,
    documents: Charter.renderDocuments,
    booking:   Charter.renderBooking,
  }[Charter.activeTab];
  if (fn) fn();
};

/* ── OVERVIEW TAB ── */
Charter.renderOverview = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  const wrap = document.getElementById('charter-tab-content');
  if (!c || !wrap) return;

  const openReqs  = FM.guestRequests.filter(r => r.charter === c.id && r.status === 'open').length;
  const totalDays = Math.round((new Date(c.end) - new Date(c.start)) / 86400000);
  const pctSpent  = c.apa > 0 ? Math.min(100, Math.round(c.apaSpent / c.apa * 100)) : 0;

  const apaBreakdown = c.apaSpent > 0 ? [
    { cat: 'Fuel',                   pct: 0.50 },
    { cat: 'Provisioning',           pct: 0.31 },
    { cat: 'Port fees',              pct: 0.10 },
    { cat: 'Watersports equipment',  pct: 0.05 },
    { cat: 'Crew gratuity advance',  pct: 0.04 },
  ].map(e => ({ ...e, amount: Math.round(c.apaSpent * e.pct) })) : [];

  wrap.innerHTML = `
    <!-- Stats -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px">
      ${[
        { lbl: 'Guests', val: c.guests.length || '—', sub: 'on board' },
        { lbl: 'Days', val: totalDays, sub: 'total' },
        { lbl: 'Open requests', val: openReqs || '—', sub: 'from guests', hi: openReqs > 0 },
        { lbl: 'APA remaining',
          val: '$' + ((c.apa - c.apaSpent) / 1000).toFixed(1) + 'k',
          sub: 'of $' + (c.apa / 1000).toFixed(0) + 'k' },
      ].map(s => `
        <div class="stat" style="border:.5px solid var(--bd);border-radius:10px">
          <div class="stat-lbl">${s.lbl}</div>
          <div class="stat-val" style="${s.hi ? 'color:var(--or)' : ''}">${s.val}</div>
          <div class="stat-lbl">${s.sub}</div>
        </div>
      `).join('')}
    </div>

    <!-- APA tracker -->
    <div class="dash-section-title">APA tracker</div>
    <div class="card" style="padding:16px;margin-bottom:20px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div>
          <span style="font-size:20px;font-weight:300;color:var(--txt)">$${c.apaSpent.toLocaleString()}</span>
          <span style="font-size:12px;color:var(--txt3)"> spent of $${c.apa.toLocaleString()} APA</span>
        </div>
        <span style="font-size:13px;color:var(--pur)">$${(c.apa - c.apaSpent).toLocaleString()} remaining</span>
      </div>
      <div style="background:var(--bg4);border-radius:4px;height:6px;margin-bottom:14px">
        <div style="width:${pctSpent}%;height:6px;border-radius:4px;background:var(--pur)"></div>
      </div>
      ${apaBreakdown.length ? apaBreakdown.map(e => `
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:7px 0;border-bottom:.5px solid var(--bd);font-size:12px">
          <span class="c-txt2">${e.cat}</span>
          <span style="font-family:var(--mono);color:var(--txt)">$${e.amount.toLocaleString()}</span>
        </div>
      `).join('') : `<div style="font-size:12px;color:var(--txt3);text-align:center;padding:6px">No APA expenses logged yet</div>`}
    </div>

    <!-- Details -->
    <div class="dash-section-title">Charter details</div>
    <div class="card" style="padding:0 16px">
      ${[
        { lbl: 'Embark port',    val: c.embark },
        { lbl: 'Disembark port', val: c.disembark },
        { lbl: 'Broker',         val: c.broker },
        { lbl: 'Broker contact', val: c.brokerContact.replace(/<[^>]+>/g, '').trim() },
      ].map(r => `
        <div style="display:flex;gap:16px;padding:9px 0;border-bottom:.5px solid var(--bd);font-size:12px">
          <span style="width:110px;color:var(--txt3);flex-shrink:0">${r.lbl}</span>
          <span class="c-txt2">${escHtml(r.val)}</span>
        </div>
      `).join('')}
    </div>
  `;
};

/* ── COSTS TAB ── */
Charter.renderCosts = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  const wrap = document.getElementById('charter-tab-content');
  if (!c || !wrap) return;
  if (!c.costs) c.costs = [];

  const costs = c.costs;
  const totalCosts = costs.reduce((s, e) => s + e.amount, 0);
  const net = c.fee - totalCosts;
  const cats = ['Fuel','Provisioning','Port / marina','Broker','Crew','APA expenses','Other'];

  const fmtAmt = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0 });
  const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

  wrap.innerHTML = `
    <div style="padding:18px 24px">

      <!-- Add cost button -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="font-size:13px;font-weight:500;color:var(--txt)">Cost ledger</div>
        <button class="btn btn-ghost btn-sm" onclick="Charter.openAddCost()">+ Add cost</button>
      </div>

      <!-- Cost rows -->
      ${costs.length === 0 ? `
        <div class="empty" style="padding:40px 0">
          <div class="empty-title">No costs logged</div>
          <div class="empty-sub">Add fuel, provisioning, broker fees and other expenses</div>
        </div>
      ` : `
        <div style="border:.5px solid var(--bd);border-radius:10px;overflow:hidden;margin-bottom:20px">
          <div style="display:grid;grid-template-columns:120px 1fr 90px 70px 24px;gap:0;border-bottom:.5px solid var(--bd);padding:8px 14px;background:var(--bg2)">
            <div style="font-size:10px;font-weight:600;color:var(--txt3);text-transform:uppercase;letter-spacing:.06em">Category</div>
            <div style="font-size:10px;font-weight:600;color:var(--txt3);text-transform:uppercase;letter-spacing:.06em">Description</div>
            <div style="font-size:10px;font-weight:600;color:var(--txt3);text-transform:uppercase;letter-spacing:.06em;text-align:right">Amount</div>
            <div style="font-size:10px;font-weight:600;color:var(--txt3);text-transform:uppercase;letter-spacing:.06em">Date</div>
            <div></div>
          </div>
          ${costs.map(e => `
            <div style="display:grid;grid-template-columns:120px 1fr 90px 70px 24px;gap:0;padding:10px 14px;border-bottom:.5px solid var(--bd);align-items:center"
                 onmouseover="this.style.background='var(--bg2)'" onmouseout="this.style.background=''">
              <div style="font-size:11px;color:var(--txt3)">${escHtml(e.category)}</div>
              <div>
                <div style="font-size:12px;color:var(--txt)">${escHtml(e.desc)}</div>
                ${e.notes ? `<div style="font-size:10px;color:var(--txt3);margin-top:1px">${escHtml(e.notes)}</div>` : ''}
              </div>
              <div style="font-size:12px;font-family:var(--mono);color:var(--txt);text-align:right">${fmtAmt(e.amount)}</div>
              <div style="font-size:11px;color:var(--txt3)">${fmtDate(e.date)}</div>
              <button onclick="Charter.deleteCost('${c.id}','${e.id}')"
                style="background:none;border:none;cursor:pointer;color:var(--txt4);padding:0;font-size:14px;line-height:1"
                onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--txt4)'"
                title="Remove">×</button>
            </div>
          `).join('')}
        </div>
      `}

      <!-- Summary -->
      <div style="border:.5px solid var(--bd);border-radius:10px;overflow:hidden">
        <div style="padding:10px 16px;display:flex;justify-content:space-between;border-bottom:.5px solid var(--bd)">
          <span style="font-size:12px;color:var(--txt3)">Charter fee</span>
          <span style="font-size:12px;font-family:var(--mono);color:var(--txt)">${fmtAmt(c.fee)}</span>
        </div>
        ${c.apa > 0 ? `
        <div style="padding:10px 16px;display:flex;justify-content:space-between;border-bottom:.5px solid var(--bd)">
          <span style="font-size:12px;color:var(--txt3)">APA received</span>
          <span style="font-size:12px;font-family:var(--mono);color:var(--txt)">${fmtAmt(c.apa)}</span>
        </div>` : ''}
        <div style="padding:10px 16px;display:flex;justify-content:space-between;border-bottom:.5px solid var(--bd)">
          <span style="font-size:12px;color:var(--txt3)">Total costs logged</span>
          <span style="font-size:12px;font-family:var(--mono);color:var(--red)">−${fmtAmt(totalCosts)}</span>
        </div>
        <div style="padding:12px 16px;display:flex;justify-content:space-between;background:var(--bg2)">
          <span style="font-size:13px;font-weight:600;color:var(--txt)">Net (fee − costs)</span>
          <span style="font-size:13px;font-weight:600;font-family:var(--mono);color:${net >= 0 ? 'var(--grn)' : 'var(--red)'}">${net >= 0 ? '' : '−'}${fmtAmt(Math.abs(net))}</span>
        </div>
      </div>

    </div>
  `;
};

Charter.openAddCost = function() {
  const cats = ['Fuel','Provisioning','Port / marina','Broker','Crew','APA expenses','Other'];
  const body = `
    <div class="inp-group">
      <label class="inp-lbl">Category</label>
      <select class="inp" id="cost-cat">${cats.map(c => `<option>${c}</option>`).join('')}</select>
    </div>
    <div class="inp-group">
      <label class="inp-lbl">Description</label>
      <input class="inp" id="cost-desc" placeholder="e.g. Pre-charter fuel fill — Gustavia">
    </div>
    <div class="inp-row">
      <div class="inp-group" style="margin-bottom:0">
        <label class="inp-lbl">Amount (USD)</label>
        <input class="inp" id="cost-amount" type="number" min="0" placeholder="0">
      </div>
      <div class="inp-group" style="margin-bottom:0">
        <label class="inp-lbl">Date</label>
        <input class="inp" id="cost-date" type="date" value="${new Date().toISOString().slice(0,10)}">
      </div>
    </div>
    <div class="inp-group" style="margin-top:14px">
      <label class="inp-lbl">Notes</label>
      <input class="inp" id="cost-notes" placeholder="Optional note">
    </div>
  `;
  openModal(body, 'Add cost');
  document.getElementById('modal-submit').textContent = 'Add cost';
  document.getElementById('modal-submit').onclick = () => Charter.saveCost(Charter.selectedId);
};

Charter.saveCost = function(charterId) {
  const c = FM.charters.find(x => x.id === charterId);
  if (!c) return;
  const desc = document.getElementById('cost-desc')?.value.trim();
  const amount = parseFloat(document.getElementById('cost-amount')?.value) || 0;
  if (!desc) { showToast('Description required', 'err'); return; }
  if (!c.costs) c.costs = [];
  c.costs.push({
    id: 'cost-' + Date.now(),
    category: document.getElementById('cost-cat')?.value || 'Other',
    desc,
    amount,
    date: document.getElementById('cost-date')?.value || '',
    notes: document.getElementById('cost-notes')?.value.trim() || '',
  });
  closeModal();
  Charter.renderDetail();
  Charter.activeTab = 'costs';
  Charter._renderTab();
  showToast('Cost added', 'ok');
};

Charter.deleteCost = function(charterId, costId) {
  const c = FM.charters.find(x => x.id === charterId);
  if (!c || !c.costs) return;
  c.costs = c.costs.filter(e => e.id !== costId);
  Charter._renderTab();
  showToast('Cost removed');
};
window.Charter = Charter;

/* ── GUESTS TAB ── */
Charter.renderGuests = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  const wrap = document.getElementById('charter-tab-content');
  if (!c || !wrap) return;

  if (!c.guests.length) {
    wrap.innerHTML = `<div class="empty"><div class="empty-title">No guests added yet</div>
      <div class="empty-sub">Guest preference sheets will appear here once submitted</div></div>`;
    return;
  }

  const guests = c.guests.map(id => FM.charterGuest(id)).filter(Boolean);

  const dietRows = [
    { label: 'Vegetarian',      test: g => g.dietary.toLowerCase().includes('vegetarian') },
    { label: 'Vegan',           test: g => g.dietary.toLowerCase().includes('vegan') },
    { label: 'Pescatarian',     test: g => g.dietary.toLowerCase().includes('pescatarian') },
    { label: 'No alcohol',      test: g => g.preferences.toLowerCase().includes('no alcohol') },
    { label: 'Nut allergy',     test: g => g.allergies.toLowerCase().includes('nut') },
    { label: 'Shellfish allergy', test: g => g.allergies.toLowerCase().includes('shellfish') },
    { label: 'Gluten-free',     test: g => g.allergies.toLowerCase().includes('gluten') },
    { label: 'Dairy-free',      test: g => g.allergies.toLowerCase().includes('dairy') },
  ].map(r => ({ ...r, guests: guests.filter(r.test).map(g => g.name) }))
   .filter(r => r.guests.length);

  wrap.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;margin-bottom:24px">
      ${guests.map(g => `
        <div class="card" style="padding:16px">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:50%;background:${g.color};
                 display:flex;align-items:center;justify-content:center;
                 font-size:13px;font-weight:700;color:#080808;flex-shrink:0">${g.initials}</div>
            <div>
              <div style="font-size:13px;font-weight:500;color:var(--txt)">${escHtml(g.name)}</div>
              <div style="font-size:11px;color:var(--txt3)">${escHtml(g.relation)} · ${escHtml(g.cabin)}</div>
            </div>
          </div>
          ${[
            { lbl: 'Dietary',   val: g.dietary,     warn: false },
            { lbl: 'Allergies', val: g.allergies,    warn: g.allergies !== 'None' },
            { lbl: 'Notes',     val: g.preferences,  warn: false },
          ].map(row => `
            <div style="display:flex;gap:8px;align-items:flex-start;padding:6px 0;border-top:.5px solid var(--bd)">
              <span style="font-size:10px;width:56px;color:var(--txt3);flex-shrink:0;padding-top:1px">${row.lbl}</span>
              <span style="font-size:11px;color:${row.warn ? 'var(--red)' : 'var(--txt2)'};line-height:1.5">${escHtml(row.val)}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>

    ${dietRows.length ? `
      <div class="dash-section-title">Dietary summary</div>
      <div class="card" style="padding:0 16px">
        ${dietRows.map(r => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;
                      border-bottom:.5px solid var(--bd);font-size:12px">
            <span class="badge" style="background:var(--pur-bg);color:var(--pur);flex-shrink:0">${r.label}</span>
            <span class="c-txt2">${r.guests.join(', ')}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
};

/* ── ITINERARY TAB ── */
Charter.renderItinerary = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  const wrap = document.getElementById('charter-tab-content');
  if (!c || !wrap) return;

  if (!c.itinerary.length) {
    wrap.innerHTML = `<div class="empty"><div class="empty-title">No itinerary confirmed yet</div>
      <div class="empty-sub">Itinerary will appear here once agreed with the broker</div></div>`;
    return;
  }

  const today = '2026-05-01';

  wrap.innerHTML = `
    <div style="max-width:660px">
      ${c.itinerary.map((day, i) => {
        const isPast    = day.date < today;
        const isCurrent = day.date === today;
        return `
          <div style="display:flex;gap:16px">
            <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:28px">
              <div style="width:11px;height:11px;border-radius:50%;flex-shrink:0;margin-top:18px;
                   background:${isCurrent ? 'var(--pur)' : isPast ? 'var(--grn)' : 'var(--bg5)'};
                   border:.5px solid ${isCurrent ? 'var(--pur-bd)' : isPast ? 'var(--grn-bd)' : 'var(--bd2)'};
                   box-shadow:${isCurrent ? '0 0 0 3px var(--pur-bg)' : 'none'}"></div>
              ${i < c.itinerary.length - 1
                ? `<div style="width:1px;flex:1;min-height:8px;background:${isPast ? 'var(--grn-bd)' : 'var(--bd2)'};margin:3px 0"></div>`
                : ''}
            </div>
            <div style="flex:1;padding:12px 0 ${i < c.itinerary.length - 1 ? '4px' : '0'}">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap">
                <span style="font-size:10px;font-family:var(--mono);color:${isCurrent ? 'var(--pur)' : 'var(--txt3)'}">
                  ${_fmtDateFull(day.date)}
                </span>
                ${isCurrent ? `<span class="badge" style="background:var(--pur-bg);color:var(--pur);font-size:9px">TODAY</span>` : ''}
                ${isPast ? `<span style="font-size:10px;color:var(--grn)">✓</span>` : ''}
              </div>
              <div style="font-size:14px;font-weight:500;color:${isPast ? 'var(--txt2)' : 'var(--txt)'};margin-bottom:4px">
                ${escHtml(day.location)}
              </div>
              <div style="font-size:12px;color:var(--txt3);line-height:1.6">${escHtml(day.notes)}</div>
            </div>
          </div>`;
      }).join('')}
    </div>
  `;
};

/* ── REQUESTS TAB ── */
Charter.renderRequests = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  const wrap = document.getElementById('charter-tab-content');
  if (!c || !wrap) return;

  const reqs = FM.guestRequests.filter(r => r.charter === c.id);
  if (!reqs.length) {
    wrap.innerHTML = `<div class="empty"><div class="empty-title">No guest requests</div>
      <div class="empty-sub">Requests from guests via the portal will appear here</div></div>`;
    return;
  }

  const open = reqs.filter(r => r.status === 'open');
  const done = reqs.filter(r => r.status === 'done');
  const typeColors = {
    'F&B': 'var(--pur)', 'Watersports': 'var(--blu)',
    'Wellness': 'var(--grn)', 'Excursion': 'var(--yel)', 'Other': 'var(--txt3)',
  };

  const reqHTML = list => list.map(r => {
    const g    = FM.charterGuest(r.guest);
    const crew = FM.getCrew(r.assignee);
    const tc   = typeColors[r.type] || 'var(--txt3)';
    return `
      <div class="card" style="padding:14px 16px;margin-bottom:8px;${r.status === 'open' ? 'border-color:var(--pur-bd)' : ''}">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div style="width:32px;height:32px;border-radius:50%;background:${g?.color || '#555'};
               display:flex;align-items:center;justify-content:center;
               font-size:10px;font-weight:700;color:#080808;flex-shrink:0">${g?.initials || '?'}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap">
              <span style="font-size:12px;font-weight:500;color:var(--txt)">${g?.name || 'Guest'}</span>
              <span style="font-size:10px;color:var(--txt3)">${r.time}</span>
              <span class="badge" style="background:${tc}20;color:${tc};font-size:9px">${r.type}</span>
            </div>
            <div style="font-size:13px;color:var(--txt2);line-height:1.6;margin-bottom:8px">${escHtml(r.text)}</div>
            <div style="display:flex;align-items:center;gap:8px">
              ${crew ? `<span style="font-size:11px;color:var(--txt3)">→ ${crew.name}</span>` : ''}
              <div style="margin-left:auto;display:flex;gap:6px">
                ${r.status === 'open' ? `
                  <button class="btn btn-ghost btn-xs" onclick="Charter.resolveRequest('${r.id}')">Mark done</button>
                  <button class="btn btn-xs" style="background:var(--pur);color:#080808;font-weight:600"
                          onclick="WO.openNewModal()">Create WO</button>
                ` : `<span style="font-size:11px;color:var(--grn)">✓ Done</span>`}
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');

  wrap.innerHTML = `
    ${open.length ? `<div class="dash-section-title">Open — needs action</div>${reqHTML(open)}` : ''}
    ${done.length ? `<div class="dash-section-title"${open.length ? ' style="margin-top:16px"' : ''}>Resolved</div>${reqHTML(done)}` : ''}
  `;
};

Charter.resolveRequest = function(id) {
  const r = FM.guestRequests.find(x => x.id === id);
  if (r) r.status = 'done';
  Charter.renderRequests();
  showToast('Request marked done', 'ok');
};

/* ── DOCUMENTS TAB ── */
Charter.renderDocuments = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  const wrap = document.getElementById('charter-tab-content');
  if (!c || !wrap) return;

  const iconMap = {
    contract:    `<path d="M4 1h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V3a2 2 0 012-2zm1 4h6v1H5V5zm0 3h6v1H5V8zm0 3h4v1H5v-1z"/>`,
    finance:     `<path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 4v.75H10a.75.75 0 010 1.5H8.75V9h1a.75.75 0 010 1.5H8.75V11a.75.75 0 01-1.5 0v-.5H6a.75.75 0 010-1.5h1.25V7.25H6a.75.75 0 010-1.5h1.25V5a.75.75 0 011.5 0z"/>`,
    regulatory:  `<path d="M8 1l1.5 3.5L13 5l-2.5 2.5.5 3.5L8 9l-3 2 .5-3.5L3 5l3.5-.5L8 1z"/>`,
    safety:      `<path d="M8 1L2 4v5c0 3.5 2.5 6.5 6 7.5C14 15.5 14 9 14 9V4L8 1z"/>`,
    preferences: `<path d="M5 4a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zM1 13.5a6 6 0 0114 0v.5H1v-.5z"/>`,
  };

  wrap.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:8px;max-width:540px">
      ${c.documents.map(doc => `
        <div class="card" style="padding:14px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:border-color var(--t1)"
             onmouseenter="this.style.borderColor='var(--pur-bd)'" onmouseleave="this.style.borderColor=''">
          <div style="width:34px;height:34px;border-radius:8px;background:var(--pur-bg);border:.5px solid var(--pur-bd);
               display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <svg viewBox="0 0 16 16" fill="var(--pur)" style="width:13px;height:13px">
              ${iconMap[doc.type] || iconMap.contract}
            </svg>
          </div>
          <div style="flex:1;min-width:0">
            <div class="truncate" style="font-size:13px;font-weight:500;color:var(--txt);margin-bottom:2px">${escHtml(doc.name)}</div>
            <div style="font-size:11px;color:var(--txt3)">
              ${doc.date
                ? _fmtDateLong(doc.date)
                : `<span style="color:var(--or)">Pending</span>`}
            </div>
          </div>
          <div style="flex-shrink:0">
            ${doc.date
              ? `<span style="font-size:10px;color:var(--grn)">✓ Filed</span>`
              : `<button class="btn btn-ghost btn-xs" onclick="showToast('Upload — coming soon')">Upload</button>`}
          </div>
        </div>
      `).join('')}
      <button class="btn btn-ghost btn-sm" style="margin-top:4px;width:100%;justify-content:center"
              onclick="showToast('Add document — coming soon')">+ Add document</button>
    </div>

    <div style="margin-top:24px;max-width:540px">
      <div class="dash-section-title">Broker</div>
      <div class="card" style="padding:14px 16px">
        <div style="font-size:13px;font-weight:500;color:var(--txt);margin-bottom:4px">${escHtml(c.broker)}</div>
        <div style="font-size:12px;color:var(--txt3)">${escHtml(c.brokerContact)}</div>
      </div>
    </div>
  `;
};

/* ── BOOKING TAB ── */
Charter.renderBooking = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  const wrap = document.getElementById('charter-tab-content');
  if (!c || !wrap) return;

  const q = c.quote;
  if (!q) {
    wrap.innerHTML = `<div class="empty"><div class="empty-title">No quote yet</div>
      <div class="empty-sub">Create a quote to start the booking process</div>
      <button class="btn btn-sm" style="margin-top:12px" onclick="showToast('Quote builder — coming soon')">+ Create quote</button></div>`;
    return;
  }

  const statuses = ['draft','sent','accepted','deposit_paid','confirmed','completed'];
  const statusLabels = { draft:'Draft', sent:'Sent', accepted:'Accepted', deposit_paid:'Deposit In', confirmed:'Confirmed', completed:'Complete' };
  const statusColors = { draft:'var(--txt4)', sent:'var(--or)', accepted:'var(--pur)', deposit_paid:'var(--blu)', confirmed:'var(--grn)', completed:'var(--grn)' };
  const currentIdx = statuses.indexOf(q.status);

  const apaAlloc = [
    { cat: 'Fuel & lubricants',              pct: 45 },
    { cat: 'Provisioning & beverages',       pct: 30 },
    { cat: 'Port dues & marina fees',        pct: 12 },
    { cat: 'Water toys & watersports hire',  pct:  5 },
    { cat: 'Communications & satellite',     pct:  4 },
    { cat: 'Miscellaneous / crew advance',   pct:  4 },
  ].map(a => ({ ...a, amount: Math.round(c.apa * a.pct / 100) }));

  const totalPaid       = q.payments.filter(p => p.paid).reduce((s, p) => s + p.amount, 0);
  const totalOutstanding = q.payments.filter(p => !p.paid).reduce((s, p) => s + p.amount, 0);
  const pendingCharter  = q.payments.filter(p => !p.paid && p.wire === 'charter').reduce((s, p) => s + p.amount, 0);
  const pendingAPA      = q.payments.filter(p => !p.paid && p.wire === 'apa').reduce((s, p) => s + p.amount, 0);
  const vessel          = FM.vessels.find(v => v.id === c.vessel) || {};

  const actionBtn = () => {
    if (q.status === 'draft')        return `<button class="btn btn-sm" style="background:var(--or);color:#080808;font-weight:600" onclick="Charter.sendQuote()">Send quote →</button>`;
    if (q.status === 'sent')         return `<button class="btn btn-sm" style="background:var(--pur);color:#080808;font-weight:600" onclick="Charter.acceptQuote()">Mark accepted</button>`;
    if (q.status === 'accepted')     return `<button class="btn btn-sm" style="background:var(--blu);color:#080808;font-weight:600" onclick="Charter.markDepositPaid()">Mark deposit received</button>`;
    if (q.status === 'deposit_paid') return `<button class="btn btn-sm" style="background:var(--grn);color:#080808;font-weight:600" onclick="Charter.markConfirmed()">Mark balance received</button>`;
    return '';
  };

  wrap.innerHTML = `
    <!-- Status workflow -->
    <div class="card" style="padding:14px 18px;margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:0">
          ${statuses.filter(s => s !== 'completed').map((s, i) => {
            const done = i <= currentIdx && q.status !== 'draft' || s === q.status;
            const past = i < currentIdx;
            const curr = s === q.status;
            const col  = past || curr ? statusColors[s] : 'var(--bd2)';
            return `
              ${i > 0 ? `<div style="flex-shrink:0;width:24px;height:1px;background:${past ? statusColors[statuses[i-1]] : 'var(--bd2)'}"></div>` : ''}
              <div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0">
                <div style="width:8px;height:8px;border-radius:50%;
                     background:${past || curr ? col : 'var(--bg4)'};
                     border:.5px solid ${col};
                     ${curr ? 'box-shadow:0 0 0 3px '+col+'25' : ''}"></div>
                <span style="font-size:9px;font-weight:${curr?'700':'400'};color:${past||curr?col:'var(--txt4)'};white-space:nowrap">${statusLabels[s]}</span>
              </div>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${actionBtn()}
          <button class="btn btn-ghost btn-sm" onclick="Charter._emailQuote()">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" style="width:12px;height:12px"><path d="M1 3.5l7 4.5 7-4.5M1 3.5h14v9H1z"/></svg>
            Email
          </button>
          <button class="btn btn-ghost btn-sm" onclick="Charter.exportPDF()">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" style="width:12px;height:12px"><path d="M8 2v8M5 7l3 3 3-3M3 13h10"/></svg>
            PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Quote document -->
    <div class="quote-doc" style="margin-bottom:16px;max-width:700px">

      <!-- Doc header -->
      <div class="quote-doc-hdr">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px">
          <div>
            <div style="font-size:9px;font-weight:700;color:var(--pur);text-transform:uppercase;letter-spacing:.12em;margin-bottom:6px">Charter Quotation</div>
            <div style="font-size:19px;font-weight:500;color:var(--txt)">${escHtml(c.name)}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:3px">${_fmtDateLong(c.start)} – ${_fmtDateLong(c.end)}</div>
            <div style="font-size:11px;color:var(--txt3);margin-top:1px">${escHtml(c.embark)} → ${escHtml(c.disembark)} · ${c.guests.length || '?'} guests</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:10px;color:var(--txt3)">Ref: <span style="font-family:var(--mono)">${q.ref}</span></div>
            <div style="font-size:10px;color:var(--txt3);margin-top:1px">Issued ${_fmtDateLong(q.issued)}</div>
            <div style="font-size:10px;color:var(--txt3);margin-top:8px;font-weight:500">${escHtml(vessel.name || '')}</div>
            <div style="font-size:10px;color:var(--txt3)">${escHtml(vessel.type || '')} · ${escHtml(vessel.loa || '')}</div>
            <div style="font-size:10px;color:var(--txt3)">Flag: ${escHtml(vessel.flag || '')}</div>
          </div>
        </div>
      </div>

      <!-- Fee breakdown -->
      <div class="quote-doc-section">
        <div class="quote-section-lbl">Charter fee breakdown</div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:.5px solid var(--bd)">
          <span style="font-size:12px;color:var(--txt2)">Charter fee — gross, MYBA standard terms</span>
          <span style="font-family:var(--mono);font-size:13px;color:var(--txt)">$${c.fee.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:8px 0;border-bottom:.5px solid var(--bd)">
          <div>
            <div style="font-size:12px;color:var(--txt2)">APA — Advance Provisioning Allowance</div>
            <div style="font-size:10px;color:var(--txt3);margin-top:2px">${Math.round(c.apa / c.fee * 100)}% of charter fee · spent at cost, unused portion refunded</div>
          </div>
          <span style="font-family:var(--mono);font-size:13px;color:var(--txt)">$${c.apa.toLocaleString()}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0">
          <span style="font-size:14px;font-weight:600;color:var(--txt)">Total charter package</span>
          <span style="font-family:var(--mono);font-size:18px;font-weight:300;color:var(--pur)">$${(c.fee + c.apa).toLocaleString()}</span>
        </div>
      </div>

      <!-- APA breakdown -->
      <div class="quote-doc-section">
        <div class="quote-section-lbl">APA allocation — estimated at time of quote ($${c.apa.toLocaleString()} total)</div>
        <div style="font-size:10px;color:var(--txt3);margin-bottom:10px;line-height:1.5">
          The APA is advanced to the captain and held in a dedicated account. All expenditure is receipted.
          A full APA statement is provided within 48 hours of disembarkation. Unspent balance is refunded directly to the charter party.
        </div>
        ${apaAlloc.map(a => `
          <div style="display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:.5px solid var(--bd)">
            <span style="font-size:11px;color:var(--txt2);flex:1">${escHtml(a.cat)}</span>
            <div style="width:70px;height:3px;background:var(--bg4);border-radius:2px;overflow:hidden;flex-shrink:0">
              <div style="height:100%;width:${a.pct}%;background:var(--pur);border-radius:2px"></div>
            </div>
            <span style="font-size:10px;color:var(--txt3);width:26px;text-align:right;flex-shrink:0">${a.pct}%</span>
            <span style="font-family:var(--mono);font-size:11px;color:var(--txt);width:62px;text-align:right;flex-shrink:0">~$${a.amount.toLocaleString()}</span>
          </div>
        `).join('')}
      </div>

      <!-- Payment schedule -->
      <div class="quote-doc-section">
        <div class="quote-section-lbl">Payment schedule</div>
        ${q.payments.map(p => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:.5px solid var(--bd);gap:10px">
            <div style="flex:1">
              <div style="font-size:12px;color:var(--txt2)">${escHtml(p.label)}</div>
              <div style="font-size:10px;color:var(--txt3);margin-top:1px">
                Due: ${_fmtDateLong(p.due)}${p.paid && p.paidDate ? ` · Received ${_fmtDateLong(p.paidDate)}` : ''}
              </div>
            </div>
            <span style="font-family:var(--mono);font-size:13px;color:var(--txt);flex-shrink:0">$${p.amount.toLocaleString()}</span>
            ${p.paid
              ? `<span style="font-size:10px;color:var(--grn);font-weight:600;flex-shrink:0">✓ Paid</span>`
              : `<span class="badge b-critical" style="flex-shrink:0">Outstanding</span>`}
          </div>
        `).join('')}
        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0">
          <span style="font-size:11px;color:var(--txt3)">Total outstanding</span>
          <span style="font-family:var(--mono);font-size:14px;font-weight:500;color:${totalOutstanding > 0 ? 'var(--red)' : 'var(--grn)'}">
            ${totalOutstanding > 0 ? '$' + totalOutstanding.toLocaleString() : '✓ All received'}
          </span>
        </div>
      </div>

      <!-- Terms -->
      <div class="quote-doc-section" style="border-bottom:none;padding-bottom:20px">
        <div class="quote-section-lbl">Terms & conditions</div>
        <div style="font-size:10px;color:var(--txt3);line-height:1.7">
          ${[
            'Governed by the MYBA Charter Agreement (latest edition). All amounts in USD.',
            '50% deposit due within 7 days of signing to secure the booking.',
            'Balance due no later than 30 days before embarkation date.',
            'APA advance transferred to captain\'s account no later than embarkation date.',
            'Cancellation: 50% of charter fee retained within 60 days; 100% within 30 days of charter start.',
            'The vessel carries full P&I, hull & machinery, and passenger liability insurance.',
            'Applicable port taxes and local dues charged to APA at cost.',
            'This quotation is valid for 21 days from the date of issue.',
          ].map(t => `<div style="display:flex;gap:8px;padding:2px 0"><span style="color:var(--pur);flex-shrink:0">·</span>${escHtml(t)}</div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Wire transfer instructions -->
    <div class="quote-section-lbl" style="margin-bottom:10px">Wire transfer instructions</div>

    <div class="wire-box" style="margin-bottom:10px;max-width:700px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;gap:10px">
        <div>
          <div style="font-size:9px;font-weight:700;color:var(--pur);text-transform:uppercase;letter-spacing:.12em">Wire 1 — Charter fee</div>
          ${pendingCharter > 0
            ? `<div style="font-size:12px;color:var(--red);font-weight:500;margin-top:3px">$${pendingCharter.toLocaleString()} outstanding</div>`
            : `<div style="font-size:11px;color:var(--grn);margin-top:3px">✓ All payments received</div>`}
        </div>
        <button class="btn btn-ghost btn-xs" onclick="Charter._copyWire(1)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" style="width:10px;height:10px"><path d="M10 2H3v10h7V2zM6 2V1h7v10h-2"/></svg>
          Copy
        </button>
      </div>
      ${[
        { lbl: 'Pay to',          val: q.wireCharter.accountName, mono: false },
        { lbl: 'Bank',            val: q.wireCharter.bank + ', ' + q.wireCharter.city, mono: false },
        { lbl: 'IBAN',            val: q.wireCharter.iban,         mono: true },
        { lbl: 'SWIFT / BIC',     val: q.wireCharter.swift,        mono: true },
        { lbl: 'Reference',       val: q.wireCharter.ref,          mono: true },
      ].map(r => `
        <div style="display:flex;gap:14px;padding:5px 0;border-top:.5px solid var(--bd)">
          <span style="font-size:10px;color:var(--txt3);width:90px;flex-shrink:0;padding-top:1px">${r.lbl}</span>
          <span style="font-size:11px;color:var(--txt);font-family:${r.mono ? 'var(--mono)' : 'inherit'};letter-spacing:${r.mono ? '.02em' : 'normal'}">${escHtml(r.val)}</span>
        </div>
      `).join('')}
    </div>

    <div class="wire-box" style="max-width:700px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;gap:10px">
        <div>
          <div style="font-size:9px;font-weight:700;color:var(--pur);text-transform:uppercase;letter-spacing:.12em">Wire 2 — APA advance</div>
          ${pendingAPA > 0
            ? `<div style="font-size:12px;color:var(--red);font-weight:500;margin-top:3px">$${pendingAPA.toLocaleString()} outstanding</div>`
            : `<div style="font-size:11px;color:var(--grn);margin-top:3px">✓ APA advance received</div>`}
        </div>
        <button class="btn btn-ghost btn-xs" onclick="Charter._copyWire(2)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" style="width:10px;height:10px"><path d="M10 2H3v10h7V2zM6 2V1h7v10h-2"/></svg>
          Copy
        </button>
      </div>
      ${[
        { lbl: 'Pay to',      val: q.wireAPA.accountName,              mono: false },
        { lbl: 'Bank',        val: q.wireAPA.bank + ', ' + q.wireAPA.city, mono: false },
        { lbl: 'IBAN',        val: q.wireAPA.iban,                     mono: true },
        { lbl: 'SWIFT / BIC', val: q.wireAPA.swift,                    mono: true },
        { lbl: 'Reference',   val: q.wireAPA.ref,                      mono: true },
      ].map(r => `
        <div style="display:flex;gap:14px;padding:5px 0;border-top:.5px solid var(--bd)">
          <span style="font-size:10px;color:var(--txt3);width:90px;flex-shrink:0;padding-top:1px">${r.lbl}</span>
          <span style="font-size:11px;color:var(--txt);font-family:${r.mono ? 'var(--mono)' : 'inherit'};letter-spacing:${r.mono ? '.02em' : 'normal'}">${escHtml(r.val)}</span>
        </div>
      `).join('')}
    </div>

    <!-- Acceptance banner for 'sent' status -->
    ${q.status === 'sent' ? `
    <div style="margin-top:16px;max-width:700px;padding:20px 24px;background:var(--pur-bg);border:.5px solid var(--pur-bd);border-radius:12px;text-align:center">
      <div style="font-size:13px;font-weight:500;color:var(--txt);margin-bottom:4px">Charter party ready to confirm?</div>
      <div style="font-size:11px;color:var(--txt3);margin-bottom:14px">Clicking accept acknowledges agreement to all terms above and triggers the deposit payment schedule.</div>
      <button class="btn" style="background:var(--pur);color:#080808;font-weight:700;padding:10px 28px;font-size:13px;border-radius:8px" onclick="Charter.acceptQuote()">
        Accept charter agreement ✓
      </button>
    </div>
    ` : ''}
  `;
};

/* ── BOOKING ACTIONS ── */
Charter.sendQuote = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  if (!c?.quote) return;
  c.quote.status = 'sent';
  c.quote.sentDate = '2026-05-01';
  Charter.renderDetail();
  showToast(`Quote ${c.quote.ref} sent to ${c.broker}`, 'ok');
};

Charter._emailQuote = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  if (!c) return;
  const email = c.brokerContact.match(/<([^>]+)>/)?.[1] || c.broker;
  showToast(`Quote emailed to ${email}`);
};

Charter.acceptQuote = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  if (!c?.quote) return;
  c.quote.status = 'accepted';
  c.quote.acceptedDate = '2026-05-01';
  Charter.renderDetail();
  Charter.renderSidebar();
  showToast('Charter accepted — awaiting deposit', 'ok');
};

Charter.markDepositPaid = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  if (!c?.quote) return;
  const dep = c.quote.payments.find(p => p.id === 'dep');
  if (dep) { dep.paid = true; dep.paidDate = '2026-05-01'; }
  c.quote.status = 'deposit_paid';
  Charter.renderDetail();
  Charter.renderSidebar();
  showToast('Deposit marked received', 'ok');
};

Charter.markConfirmed = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  if (!c?.quote) return;
  const bal = c.quote.payments.find(p => p.id === 'bal');
  if (bal) { bal.paid = true; bal.paidDate = '2026-05-01'; }
  c.quote.status = 'confirmed';
  Charter.renderDetail();
  Charter.renderSidebar();
  showToast('Charter confirmed — balance received', 'ok');
};

Charter._copyWire = function(num) {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  if (!c?.quote) return;
  const w = num === 1 ? c.quote.wireCharter : c.quote.wireAPA;
  const text = [
    `Pay to: ${w.accountName}`,
    `Bank: ${w.bank}, ${w.city}`,
    `IBAN: ${w.iban}`,
    `SWIFT/BIC: ${w.swift}`,
    `Reference: ${w.ref}`,
  ].join('\n');
  navigator.clipboard?.writeText(text)
    .then(() => showToast('Wire details copied to clipboard', 'ok'))
    .catch(() => showToast('Copy not available — please copy manually'));
};

/* ── NEW CHARTER ── */
Charter.openNewModal = function() {
  const vesselOptions = (FM.vessels || []).map(v => `<option value="${v.id}">${v.name}</option>`).join('');
  const inp = 'padding:8px 10px;border:.5px solid var(--bd2);border-radius:6px;background:var(--bg);color:var(--txt);font-size:13px;width:100%';
  const lbl = 'display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--txt2)';
  openModal(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <span style="font-weight:600;font-size:15px">New charter</span>
      <button style="background:none;border:none;font-size:18px;cursor:pointer;color:var(--txt2)" onclick="closeModal()">×</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <label style="${lbl}">Charter name / principal guest
        <input id="nc-name" type="text" style="${inp}" placeholder="e.g. Smith Family Charter">
      </label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label style="${lbl}">Start date
          <input id="nc-start" type="date" style="${inp}">
        </label>
        <label style="${lbl}">End date
          <input id="nc-end" type="date" style="${inp}">
        </label>
      </div>
      <label style="${lbl}">Vessel
        <select id="nc-vessel" style="${inp}">${vesselOptions}</select>
      </label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <label style="${lbl}">Charter fee (USD)
          <input id="nc-fee" type="number" style="${inp}" placeholder="0" min="0">
        </label>
        <label style="${lbl}">Est. guests
          <input id="nc-guests" type="number" style="${inp}" placeholder="0" min="1" max="24">
        </label>
      </div>
      <label style="${lbl}">Broker / agent
        <input id="nc-broker" type="text" style="${inp}" placeholder="e.g. Fraser Yachts">
      </label>
      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="btn btn-primary" onclick="Charter.submitNew()">Create charter</button>
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      </div>
    </div>`);
};

Charter.submitNew = function() {
  const name   = document.getElementById('nc-name').value.trim();
  const start  = document.getElementById('nc-start').value;
  const end    = document.getElementById('nc-end').value;
  const vessel = document.getElementById('nc-vessel').value;
  const fee    = parseFloat(document.getElementById('nc-fee').value) || 0;
  const broker = document.getElementById('nc-broker').value.trim() || 'Direct';
  if (!name || !start || !end) { showToast('Name, start and end date required'); return; }
  if (start >= end) { showToast('End date must be after start date'); return; }
  const id = 'ch-' + Date.now();
  FM.charters.push({
    id, vessel, name, status: 'upcoming',
    start, end, embark: 'TBD', disembark: 'TBD',
    fee, apa: Math.round(fee * 0.20),
    broker, brokerContact: '',
    guests: [], itinerary: [], documents: [],
    quote: null,
  });
  closeModal();
  Charter.selectedId = id;
  Charter.renderSidebar();
  Charter.renderDetail();
  showToast('Charter created', 'ok');
};

/* ── PDF EXPORT ── */
Charter.exportPDF = function() {
  const c = FM.charters.find(x => x.id === Charter.selectedId);
  if (!c?.quote) { showToast('No booking quote to export'); return; }
  const q = c.quote;
  const vessel = FM.vessels.find(v => v.id === c.vessel) || {};
  const outstanding = q.payments.filter(p => !p.paid).reduce((s, p) => s + p.amount, 0);
  const apaAlloc = [
    { cat: 'Fuel & lubricants',             pct: 45 },
    { cat: 'Provisioning & beverages',      pct: 30 },
    { cat: 'Port dues & marina fees',       pct: 12 },
    { cat: 'Water toys & watersports hire', pct:  5 },
    { cat: 'Communications & satellite',    pct:  4 },
    { cat: 'Miscellaneous / crew advance',  pct:  4 },
  ].map(a => ({ ...a, amount: Math.round(c.apa * a.pct / 100) }));

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Booking — ${c.name}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:system-ui,-apple-system,sans-serif;color:#111;background:#fff;padding:40px;font-size:12px;line-height:1.5}
      h2{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#888;margin:18px 0 10px}
      .hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:1px solid #e0e0e0;margin-bottom:6px}
      .section{border:1px solid #e0e0e0;border-radius:8px;padding:14px 18px;margin-bottom:14px}
      .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:.5px solid #eee;gap:16px}
      .row:last-child{border-bottom:none}
      .lbl{color:#777;flex-shrink:0}
      .val{font-weight:500;text-align:right}
      .mono{font-family:'SF Mono',Consolas,monospace;letter-spacing:.02em}
      .wire-lbl{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#7c3aed;margin-bottom:10px}
      .badge-paid{color:#16a34a;font-weight:700;font-size:10px}
      .badge-due{background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700}
      .tc{font-size:10px;color:#888;line-height:1.7;margin-top:8px}
      .print-btn{margin-top:20px;padding:8px 20px;background:#7c3aed;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px}
      @media print{.print-btn{display:none}}
    </style>
  </head><body>
    <div class="hdr">
      <div>
        <div style="font-size:20px;font-weight:600;margin-bottom:4px">${c.name}</div>
        <div style="color:#666;font-size:11px">${vessel.name || ''} · ${vessel.type || ''} · ${vessel.loa || ''}</div>
        <div style="color:#666;font-size:11px">${c.embark} → ${c.disembark}</div>
        <div style="color:#666;font-size:11px">Broker: ${c.broker}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:24px;font-weight:600;color:#7c3aed">$${c.fee.toLocaleString()}</div>
        <div style="font-size:10px;color:#888">charter fee</div>
        <div style="font-size:11px;color:#888;margin-top:4px">Ref: ${q.ref} · Issued: ${q.issued}</div>
      </div>
    </div>
    <div class="section">
      <h2>Charter details</h2>
      <div class="row"><span class="lbl">Charter period</span><span class="val">${c.start} – ${c.end}</span></div>
      <div class="row"><span class="lbl">Guests</span><span class="val">${c.guests.length}</span></div>
      <div class="row"><span class="lbl">Charter fee</span><span class="val mono">$${c.fee.toLocaleString()}</span></div>
      <div class="row"><span class="lbl">APA (${Math.round(c.apa / c.fee * 100)}%)</span><span class="val mono">$${c.apa.toLocaleString()}</span></div>
      <div class="row" style="font-weight:600;font-size:13px"><span class="lbl" style="color:#111">Total</span><span class="val mono">$${(c.fee + c.apa).toLocaleString()}</span></div>
    </div>
    <div class="section">
      <h2>APA allocation</h2>
      ${apaAlloc.map(a => `<div class="row"><span class="lbl">${a.cat} (${a.pct}%)</span><span class="val mono">$${a.amount.toLocaleString()}</span></div>`).join('')}
    </div>
    <div class="section">
      <h2>Payment schedule</h2>
      ${q.payments.map(p => `
        <div class="row" style="align-items:center">
          <div style="flex:1"><div style="font-weight:500">${p.label}</div>
            <div style="font-size:10px;color:#888">Due: ${p.due}${p.paid && p.paidDate ? ' · Received: ' + p.paidDate : ''}</div></div>
          <span class="mono" style="font-size:13px;margin-right:12px">$${p.amount.toLocaleString()}</span>
          ${p.paid ? '<span class="badge-paid">✓ Paid</span>' : '<span class="badge-due">Outstanding</span>'}
        </div>`).join('')}
      <div class="row" style="font-weight:600;font-size:13px;border-bottom:none;margin-top:4px">
        <span class="lbl" style="color:#111">Total outstanding</span>
        <span class="mono" style="color:${outstanding > 0 ? '#dc2626' : '#16a34a'}">${outstanding > 0 ? '$' + outstanding.toLocaleString() : '✓ All received'}</span>
      </div>
    </div>
    <div class="section">
      <div class="wire-lbl">Wire 1 — Charter fee</div>
      <div class="row"><span class="lbl">Pay to</span><span class="val">${q.wireCharter.accountName}</span></div>
      <div class="row"><span class="lbl">Bank</span><span class="val">${q.wireCharter.bank}, ${q.wireCharter.city}</span></div>
      <div class="row"><span class="lbl">IBAN</span><span class="val mono">${q.wireCharter.iban}</span></div>
      <div class="row"><span class="lbl">SWIFT/BIC</span><span class="val mono">${q.wireCharter.swift}</span></div>
      <div class="row"><span class="lbl">Reference</span><span class="val mono">${q.wireCharter.ref}</span></div>
    </div>
    <div class="section">
      <div class="wire-lbl">Wire 2 — APA advance</div>
      <div class="row"><span class="lbl">Pay to</span><span class="val">${q.wireAPA.accountName}</span></div>
      <div class="row"><span class="lbl">Bank</span><span class="val">${q.wireAPA.bank}, ${q.wireAPA.city}</span></div>
      <div class="row"><span class="lbl">IBAN</span><span class="val mono">${q.wireAPA.iban}</span></div>
      <div class="row"><span class="lbl">SWIFT/BIC</span><span class="val mono">${q.wireAPA.swift}</span></div>
      <div class="row"><span class="lbl">Reference</span><span class="val mono">${q.wireAPA.ref}</span></div>
    </div>
    <div class="tc">
      Governed by the MYBA Charter Agreement (latest edition). All amounts in USD. 50% deposit due within 7 days of signing.
      Balance due no later than 30 days before embarkation. APA advance transferred to captain no later than embarkation.
      Cancellation: 50% retained within 60 days; 100% within 30 days of charter start. Valid 21 days from issue.
    </div>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </body></html>`);
  win.document.close();
};

/* ── APA TAB ── */
Charter.renderAPA = function() {
  const c    = FM.charters.find(x => x.id === Charter.selectedId);
  const wrap = document.getElementById('charter-tab-content');
  if (!c || !wrap) return;

  const expenses   = c.apaExpenses || [];
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const received   = c.apa || 0;
  const balance    = received - totalSpent;
  const pct        = received > 0 ? Math.min(100, Math.round(totalSpent / received * 100)) : 0;
  const balColor   = balance < 0 ? 'var(--red)' : balance < received * 0.15 ? 'var(--yel)' : 'var(--grn)';
  const USD = n => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  function fmtD(s) {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + d;
  }

  // Category breakdown
  const catMap = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });

  wrap.innerHTML = `
    <!-- APA summary -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px">
      <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:14px">
        <div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">APA Received</div>
        <div style="font-size:22px;font-weight:500;color:var(--txt)">${USD(received)}</div>
      </div>
      <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:14px">
        <div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Spent</div>
        <div style="font-size:22px;font-weight:500;color:var(--or)">${USD(totalSpent)}</div>
      </div>
      <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:14px">
        <div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Balance</div>
        <div style="font-size:22px;font-weight:500;color:${balColor}">${balance >= 0 ? USD(balance) : '-'+USD(balance)}</div>
      </div>
    </div>

    <!-- Progress bar -->
    <div style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--txt3);margin-bottom:5px">
        <span>APA utilisation</span><span>${pct}%</span>
      </div>
      <div style="height:6px;background:var(--bg3);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${balColor};border-radius:3px;transition:width .3s"></div>
      </div>
    </div>

    <!-- Category breakdown -->
    ${Object.keys(catMap).length ? `<div style="margin-bottom:20px">
      <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:8px">By category</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([cat,amt]) => `
          <div style="padding:6px 12px;background:var(--bg3);border:.5px solid var(--bd);border-radius:20px">
            <span style="font-size:11px;color:var(--txt2)">${escHtml(cat)}</span>
            <span style="font-size:11px;font-weight:600;color:var(--txt);margin-left:6px">${USD(amt)}</span>
          </div>`).join('')}
      </div>
    </div>` : ''}

    <!-- Expense table -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3)">Expense log</div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" onclick="Charter.printAPAStatement('${c.id}')">Export statement</button>
        <button class="btn btn-primary btn-sm" onclick="Charter.openAPAExpense('${c.id}')">+ Add expense</button>
      </div>
    </div>

    ${expenses.length ? `<div class="tbl-wrap">
      <table class="tbl">
        <thead><tr><th>Date</th><th>Category</th><th>Description</th><th style="text-align:right">Amount</th><th></th></tr></thead>
        <tbody>
          ${expenses.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(e => `<tr>
            <td style="color:var(--txt3);white-space:nowrap">${fmtD(e.date)}</td>
            <td><span style="font-size:10px;color:var(--txt2)">${escHtml(e.category)}</span></td>
            <td style="color:var(--txt)">${escHtml(e.desc)}</td>
            <td style="text-align:right;font-weight:500;color:var(--or)">${USD(e.amount)}</td>
            <td><button class="btn btn-ghost btn-xs" onclick="Charter.delAPAExpense('${c.id}','${e.id}')">Remove</button></td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr><td colspan="3" style="font-weight:600;color:var(--txt)">Total spent</td>
              <td style="text-align:right;font-weight:700;color:var(--or)">${USD(totalSpent)}</td><td></td></tr>
        </tfoot>
      </table>
    </div>` : `<div style="font-size:13px;color:var(--txt3);padding:16px 0">No expenses logged yet. Add the first one above.</div>`}

    <!-- Add expense modal -->
    <div id="apa-modal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.6);align-items:center;justify-content:center">
      <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:12px;width:440px;max-width:92vw;padding:24px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
          <div style="font-size:14px;font-weight:600;color:var(--txt)">Add APA expense</div>
          <button onclick="document.getElementById('apa-modal').style.display='none'" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:18px">×</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
          <div><label class="inp-lbl">Category</label>
            <select class="inp" id="apa-cat">
              <option>Fuel</option><option>Provisioning</option><option>Port / marina</option>
              <option>Crew</option><option>Watersports</option><option>Excursions</option><option>Other</option>
            </select></div>
          <div><label class="inp-lbl">Date</label><input class="inp" id="apa-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
        </div>
        <div style="margin-bottom:12px"><label class="inp-lbl">Description</label><input class="inp" id="apa-desc" placeholder="e.g. Gustavia fuel dock top-up"></div>
        <div style="margin-bottom:18px"><label class="inp-lbl">Amount (USD)</label><input class="inp" id="apa-amount" type="number" placeholder="0.00"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('apa-modal').style.display='none'">Cancel</button>
          <button class="btn btn-primary btn-sm" id="apa-save-btn">Save expense</button>
        </div>
      </div>
    </div>
  `;
};

Charter.openAPAExpense = function(charterId) {
  const modal = document.getElementById('apa-modal');
  if (!modal) return;
  document.getElementById('apa-save-btn').onclick = () => Charter.saveAPAExpense(charterId);
  modal.style.display = 'flex';
};

Charter.saveAPAExpense = function(charterId) {
  const c    = FM.charters.find(x => x.id === charterId);
  if (!c) return;
  const desc   = document.getElementById('apa-desc')?.value.trim();
  const amount = parseFloat(document.getElementById('apa-amount')?.value);
  if (!desc || isNaN(amount) || amount <= 0) { alert('Description and a valid amount are required.'); return; }

  if (!c.apaExpenses) c.apaExpenses = [];
  c.apaExpenses.push({
    id:       'apa-' + Date.now(),
    category: document.getElementById('apa-cat')?.value,
    desc,
    amount,
    date:     document.getElementById('apa-date')?.value,
  });
  c.apaSpent = c.apaExpenses.reduce((s, e) => s + e.amount, 0);

  document.getElementById('apa-modal').style.display = 'none';
  Charter.renderAPA();
  Charter.renderDetail();
};

Charter.delAPAExpense = function(charterId, expId) {
  const c = FM.charters.find(x => x.id === charterId);
  if (!c || !confirm('Remove this expense?')) return;
  c.apaExpenses = (c.apaExpenses || []).filter(e => e.id !== expId);
  c.apaSpent    = c.apaExpenses.reduce((s, e) => s + e.amount, 0);
  Charter.renderAPA();
  Charter.renderDetail();
};

Charter.printAPAStatement = function(charterId) {
  const c = FM.charters.find(x => x.id === charterId);
  if (!c) return;
  const expenses   = c.apaExpenses || [];
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const balance    = (c.apa || 0) - totalSpent;
  const USD = n => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtD = s => { if (!s) return '—'; const [y,m,d]=s.split('-'); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1]+' '+d+', '+y; };
  const vessel = FM.currentVessel();

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>APA Statement — ${c.name}</title>
  <style>
    * { margin:0;padding:0;box-sizing:border-box }
    body { font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif;color:#111;padding:48px;font-size:12px;line-height:1.5 }
    h1 { font-size:22px;font-weight:400;margin-bottom:4px }
    .sub { color:#666;font-size:12px;margin-bottom:32px }
    .section { margin-bottom:28px }
    .section-title { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#999;margin-bottom:10px;border-bottom:1px solid #eee;padding-bottom:6px }
    .meta { display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px }
    .meta-item label { font-size:10px;color:#999;text-transform:uppercase;letter-spacing:.06em;display:block;margin-bottom:2px }
    .meta-item span { font-size:14px;font-weight:500 }
    table { width:100%;border-collapse:collapse }
    th { text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#999;padding:6px 8px;border-bottom:1px solid #eee }
    td { padding:8px;border-bottom:1px solid #f5f5f5;font-size:12px }
    .amt { text-align:right;font-variant-numeric:tabular-nums }
    tfoot td { font-weight:700;border-top:2px solid #111;border-bottom:none;padding-top:10px }
    .summary { margin-top:24px;background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px }
    .summary-item label { font-size:10px;color:#999;display:block;margin-bottom:2px }
    .summary-item span { font-size:18px;font-weight:500 }
    .balance-pos { color:#16a34a }
    .balance-neg { color:#dc2626 }
    @media print { body { padding:24px } button { display:none } }
    button { margin-top:24px;padding:10px 20px;background:#111;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px }
  </style></head><body>
  <h1>APA Settlement Statement</h1>
  <div class="sub">${escHtml(c.name)} · ${vessel ? escHtml(vessel.name) : ''} · Issued ${fmtD(new Date().toISOString().slice(0,10))}</div>
  <div class="meta">
    <div class="meta-item"><label>Charter dates</label><span>${fmtD(c.start)} – ${fmtD(c.end)}</span></div>
    <div class="meta-item"><label>APA received</label><span>${USD(c.apa || 0)}</span></div>
    <div class="meta-item"><label>Broker</label><span>${escHtml(c.broker)}</span></div>
  </div>
  <div class="section">
    <div class="section-title">Expense log</div>
    <table>
      <thead><tr><th>Date</th><th>Category</th><th>Description</th><th class="amt">Amount</th></tr></thead>
      <tbody>
        ${expenses.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(e=>`<tr>
          <td>${fmtD(e.date)}</td><td>${escHtml(e.category)}</td><td>${escHtml(e.desc)}</td><td class="amt">${USD(e.amount)}</td>
        </tr>`).join('')}
      </tbody>
      <tfoot><tr><td colspan="3">Total expenses</td><td class="amt">${USD(totalSpent)}</td></tr></tfoot>
    </table>
  </div>
  <div class="summary">
    <div class="summary-item"><label>APA received</label><span>${USD(c.apa || 0)}</span></div>
    <div class="summary-item"><label>Total spent</label><span>${USD(totalSpent)}</span></div>
    <div class="summary-item"><label>Balance ${balance >= 0 ? 'to return' : 'due from charterer'}</label>
      <span class="${balance >= 0 ? 'balance-pos' : 'balance-neg'}">${USD(Math.abs(balance))}</span></div>
  </div>
  <button onclick="window.print()">Print / Save as PDF</button>
  </body></html>`);
  win.document.close();
};

/* ── PRIVATE HELPERS ── */
function _fmtDateLong(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function _fmtDateFull(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' });
}

function _fmtMD(d) {
  if (!d) return '';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
