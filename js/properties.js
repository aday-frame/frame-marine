/* ── PROPERTIES MODULE ── */
const Properties = (() => {
  const PROP_ICON = `<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L1 6.5V7h1v7h4v-4h4v4h4V7h1v-.5L8 1zm0 1.5l5 3.7V7H3V6.2L8 2.5z" opacity=".9"/></svg>`;

  const PRIORITY_COLOR = { high: 'var(--red)', medium: 'var(--or)', low: 'var(--txt3)' };
  const STATUS_COLOR   = { open: 'var(--or)', 'in-progress': '#60A5FA', done: 'var(--grn)' };
  const STATUS_LABEL   = { open: 'Open', 'in-progress': 'In progress', done: 'Done' };
  const CAT_COLOR      = { Lease: '#60A5FA', Insurance: '#4ADE80', Contracts: '#F97316', Compliance: '#F87171', Other: '#A78BFA' };

  let _woFilter = 'all';
  let _docTab   = 'All';

  /* ── context ── */
  function current() {
    return FM.currentPropertyId ? FM.properties.find(p => p.id === FM.currentPropertyId) : null;
  }

  function switchTo(propId) {
    FM.currentPropertyId = propId;
    _syncSidebar(true);
    _syncVesselPicker();
    navTo('prop-overview', document.querySelector('.ni[data-page=prop-overview]'));
  }

  function clearContext() {
    FM.currentPropertyId = null;
    _syncSidebar(false);
    _syncVesselPicker();
    Roles.applyNav();
    navTo('dashboard', document.querySelector('.ni[data-page=dashboard]'));
  }

  function _syncVesselPicker() {
    const prop = current();
    const nameEl = document.getElementById('vessel-picker-name');
    const typeEl = document.getElementById('vessel-picker-type');
    const dotEl  = document.getElementById('vessel-picker-dot');
    if (!nameEl) return;
    if (prop) {
      nameEl.textContent = prop.name;
      typeEl.textContent = prop.type + ' · ' + prop.location;
      if (dotEl) dotEl.style.background = prop.color || '#4ADE80';
    } else {
      const v = FM.currentVessel();
      if (v) {
        nameEl.textContent = v.name;
        typeEl.textContent = v.type;
        if (dotEl) dotEl.style.background = v.color || 'var(--or)';
      }
    }
  }

  function _syncSidebar(inProp) {
    const prop = current();

    // Context banner
    const banner  = document.getElementById('prop-ctx-banner');
    const nameEl  = document.getElementById('prop-ctx-name');
    const locEl   = document.getElementById('prop-ctx-loc');
    if (banner) banner.style.display = inProp ? '' : 'none';
    if (nameEl && prop) nameEl.textContent = prop.name;
    if (locEl  && prop) locEl.textContent  = prop.location;

    // Property nav items
    document.querySelectorAll('.ni[data-ctx="property"]').forEach(el => {
      el.style.display = inProp ? '' : 'none';
    });
    const propSec = document.getElementById('prop-nav-sec');
    if (propSec) propSec.style.display = inProp ? '' : 'none';

    // Marine nav items — hide when in property context
    document.querySelectorAll('.ni[data-roles]').forEach(el => {
      if (inProp) el.style.display = 'none';
    });
    // Marine sec-lbls — hide when in property
    document.querySelectorAll('.sec-lbl:not(#prop-nav-sec)').forEach(el => {
      el.style.display = inProp ? 'none' : '';
    });
  }

  /* ── helpers ── */
  function _propWOs(propId) {
    return (FM.propertyWorkOrders || []).filter(w => w.property === (propId || FM.currentPropertyId));
  }
  function _propDocs(propId) {
    return (FM.propertyDocs || []).filter(d => d.property === (propId || FM.currentPropertyId));
  }
  function _propBookings(propId) {
    return (FM.propertyBookings || []).filter(b => b.property === (propId || FM.currentPropertyId));
  }
  function _propStaff(propId) {
    return (FM.propertyStaff || []).filter(s => s.property === (propId || FM.currentPropertyId));
  }
  function _fmtDate(s) {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m - 1] + ' ' + +d;
  }
  function _fmtCcy(n) { return '$' + n.toLocaleString('en-US'); }
  function _daysUntil(s) {
    if (!s) return null;
    return Math.round((new Date(s) - new Date('2026-05-07')) / 86400000);
  }

  /* ── OVERVIEW ── */
  function renderOverview() {
    const wrap = document.getElementById('page-prop-overview');
    if (!wrap) return;
    const prop = current();
    if (!prop) return;
    const wos      = _propWOs(prop.id);
    const bookings = _propBookings(prop.id);
    const staff    = _propStaff(prop.id);
    const docs     = _propDocs(prop.id);
    const activeBooking = bookings.find(b => b.status === 'active');
    const nextBooking   = bookings.find(b => b.status === 'confirmed');
    const openWOs  = wos.filter(w => w.status !== 'done');
    const highWOs  = openWOs.filter(w => w.priority === 'high');

    // Populate stats bar
    const statsEl = document.getElementById('prop-stats');
    if (statsEl) {
      const isOcc = prop.status === 'occupied';
      statsEl.style.gridTemplateColumns = 'repeat(4,1fr)';
      statsEl.innerHTML = `
        <div class="wo-stat"><div class="wo-stat-num" style="${isOcc ? 'color:var(--grn)' : 'color:var(--txt3)'}">${isOcc ? prop.guests : '—'}</div><div class="wo-stat-lbl">${isOcc ? 'Guests' : 'Vacant'}</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="${openWOs.length ? 'color:var(--or)' : ''}">${openWOs.length}</div><div class="wo-stat-lbl">Open issues</div></div>
        <div class="wo-stat"><div class="wo-stat-num">${staff.length}</div><div class="wo-stat-lbl">Staff</div></div>
        <div class="wo-stat"><div class="wo-stat-num">${docs.length}</div><div class="wo-stat-lbl">Documents</div></div>`;
    }

    wrap.innerHTML = `<div style="padding:20px 20px 60px;max-width:none">

      <!-- Current booking card -->
      ${activeBooking ? `
      <div style="background:linear-gradient(135deg,rgba(74,222,128,.06) 0%,rgba(74,222,128,.02) 100%);border:.5px solid rgba(74,222,128,.2);border-radius:12px;padding:16px 18px;margin-bottom:20px;display:flex;align-items:center;gap:14px">
        <div style="width:40px;height:40px;border-radius:10px;background:rgba(74,222,128,.1);border:.5px solid rgba(74,222,128,.2);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg viewBox="0 0 16 16" fill="none" stroke="#4ADE80" stroke-width="1.4" stroke-linecap="round" style="width:16px;height:16px"><rect x="2" y="3" width="12" height="11" rx="1"/><path d="M5 1v3M11 1v3M2 7h12"/></svg>
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:var(--txt)">${escHtml(activeBooking.guest)}</div>
          <div style="font-size:11px;color:var(--txt3);margin-top:2px">${_fmtDate(activeBooking.checkIn)} – ${_fmtDate(activeBooking.checkOut)} · ${activeBooking.guests} guest${activeBooking.guests > 1 ? 's' : ''}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:14px;font-weight:700;color:var(--grn)">${_fmtCcy(activeBooking.rate)}</div>
          <div style="font-size:10px;color:var(--txt4)">Active stay</div>
        </div>
      </div>` : `
      <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:12px">
        <div style="font-size:12px;color:var(--txt3)">Property is vacant</div>
        <button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="Properties.openAddBooking()">+ Add booking</button>
      </div>`}

      <div class="grid-2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">

        <!-- Open work orders -->
        <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:12px;padding:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-size:12px;font-weight:600;color:var(--txt)">Open issues</div>
            <button class="btn btn-ghost btn-xs" onclick="navTo('prop-workorders',document.querySelector('.ni[data-page=prop-workorders]'))">View all →</button>
          </div>
          ${openWOs.length ? openWOs.slice(0, 4).map(w => `
            <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:.5px solid var(--bd)" onclick="Properties.openWODetail('${w.id}')" style="cursor:pointer">
              <div style="width:6px;height:6px;border-radius:50%;background:${PRIORITY_COLOR[w.priority] || 'var(--txt3)'};flex-shrink:0"></div>
              <div style="flex:1;min-width:0;font-size:12px;color:var(--txt2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(w.title)}</div>
              <span style="font-size:10px;font-weight:600;color:${STATUS_COLOR[w.status]};flex-shrink:0">${STATUS_LABEL[w.status]}</span>
            </div>`).join('') : `<div style="font-size:12px;color:var(--txt4);padding:12px 0;text-align:center">No open issues — all clear ✓</div>`}
        </div>

        <!-- Upcoming bookings -->
        <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:12px;padding:16px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
            <div style="font-size:12px;font-weight:600;color:var(--txt)">Upcoming bookings</div>
            <button class="btn btn-ghost btn-xs" onclick="navTo('prop-bookings',document.querySelector('.ni[data-page=prop-bookings]'))">View all →</button>
          </div>
          ${bookings.filter(b => b.status === 'confirmed').slice(0, 3).map(b => `
            <div style="padding:7px 0;border-bottom:.5px solid var(--bd)">
              <div style="font-size:12px;color:var(--txt);font-weight:500">${escHtml(b.guest)}</div>
              <div style="font-size:11px;color:var(--txt3);margin-top:2px">${_fmtDate(b.checkIn)} – ${_fmtDate(b.checkOut)} · ${_fmtCcy(b.rate)}</div>
            </div>`).join('') || `<div style="font-size:12px;color:var(--txt4);padding:12px 0;text-align:center">No upcoming bookings</div>`}
        </div>
      </div>

      <!-- Staff row -->
      <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:12px;padding:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="font-size:12px;font-weight:600;color:var(--txt)">On-site staff</div>
          <button class="btn btn-ghost btn-xs" onclick="navTo('prop-staff',document.querySelector('.ni[data-page=prop-staff]'))">View all →</button>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          ${staff.map(s => `
            <div style="display:flex;align-items:center;gap:9px;padding:8px 12px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px">
              <div style="width:30px;height:30px;border-radius:50%;background:${s.color};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#080808;flex-shrink:0">${s.initials}</div>
              <div>
                <div style="font-size:12px;font-weight:500;color:var(--txt)">${escHtml(s.name)}</div>
                <div style="font-size:10px;color:var(--txt3)">${escHtml(s.role)}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  /* ── WORK ORDERS ── */
  function renderWorkOrders() {
    const wrap = document.getElementById('page-prop-workorders');
    if (!wrap) return;
    const prop = current();
    if (!prop) return;
    const wos = _propWOs(prop.id);
    const open   = wos.filter(w => w.status === 'open').length;
    const inProg = wos.filter(w => w.status === 'in-progress').length;
    const done   = wos.filter(w => w.status === 'done').length;

    const statsEl = document.getElementById('prop-wo-stats');
    if (statsEl) {
      statsEl.style.gridTemplateColumns = 'repeat(4,1fr)';
      statsEl.innerHTML = `
        <div class="wo-stat"><div class="wo-stat-num">${wos.length}</div><div class="wo-stat-lbl">Total</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:var(--or)">${open}</div><div class="wo-stat-lbl">Open</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:#60A5FA">${inProg}</div><div class="wo-stat-lbl">In progress</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:var(--grn)">${done}</div><div class="wo-stat-lbl">Done</div></div>`;
    }

    // Sync filter pill
    document.querySelectorAll('#prop-wo-filters .fp').forEach(p => p.classList.toggle('on', p.dataset.pwf === _woFilter));

    const visible = _woFilter === 'all' ? wos : wos.filter(w => w.status === _woFilter);
    wrap.innerHTML = `<div style="padding:18px 20px 60px">
      <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
        <button class="btn btn-primary btn-sm" onclick="Properties.openAddWO()">+ Add issue</button>
      </div>
      ${visible.length ? `
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Issue</th><th>Room</th><th>Priority</th><th>Status</th><th>Due</th><th></th></tr></thead>
        <tbody>
          ${visible.map(w => {
            const d = _daysUntil(w.due);
            const dueColor = d !== null && d < 0 ? 'var(--red)' : d !== null && d <= 3 ? 'var(--yel)' : 'var(--txt3)';
            return `<tr onclick="Properties.openWODetail('${w.id}')" style="cursor:pointer">
              <td style="font-weight:500;color:var(--txt);max-width:280px"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(w.title)}</div><div style="font-size:10px;color:var(--txt3);margin-top:1px">${escHtml(w.system)}</div></td>
              <td style="color:var(--txt2)">${escHtml(w.room)}</td>
              <td><span style="font-size:11px;font-weight:600;color:${PRIORITY_COLOR[w.priority]}">${w.priority.charAt(0).toUpperCase() + w.priority.slice(1)}</span></td>
              <td><span style="font-size:11px;font-weight:600;color:${STATUS_COLOR[w.status]}">${STATUS_LABEL[w.status]}</span></td>
              <td style="color:${dueColor};font-size:12px">${_fmtDate(w.due)}</td>
              <td onclick="event.stopPropagation()"><button class="btn btn-ghost btn-xs" onclick="Properties.openWODetail('${w.id}')">View</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>` : `
      <div style="text-align:center;padding:48px;color:var(--txt3);font-size:13px">
        No ${_woFilter !== 'all' ? _woFilter + ' ' : ''}issues. <button class="btn btn-ghost btn-xs" style="margin-left:8px" onclick="Properties.openAddWO()">Add issue →</button>
      </div>`}
    </div>`;
  }

  /* ── DOCUMENTS ── */
  function renderDocuments() {
    const wrap = document.getElementById('page-prop-documents');
    if (!wrap) return;
    const prop = current();
    if (!prop) return;
    const docs = _propDocs(prop.id);

    const statsEl = document.getElementById('prop-doc-stats');
    if (statsEl) {
      const expiring = docs.filter(d => { const n = _daysUntil(d.expires); return n !== null && n >= 0 && n <= 60; }).length;
      const expired  = docs.filter(d => { const n = _daysUntil(d.expires); return n !== null && n < 0; }).length;
      statsEl.style.gridTemplateColumns = 'repeat(3,1fr)';
      statsEl.innerHTML = `
        <div class="wo-stat"><div class="wo-stat-num">${docs.length}</div><div class="wo-stat-lbl">Documents</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="${expiring ? 'color:var(--yel)' : ''}">${expiring}</div><div class="wo-stat-lbl">Expiring soon</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="${expired ? 'color:var(--red)' : ''}">${expired}</div><div class="wo-stat-lbl">Expired</div></div>`;
    }
    document.querySelectorAll('#prop-doc-filters .fp').forEach(p => p.classList.toggle('on', p.dataset.pdf === _docTab));

    const visible = _docTab === 'All' ? docs : docs.filter(d => d.category === _docTab);
    wrap.innerHTML = `<div style="padding:18px 20px 60px">
      <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
        <button class="btn btn-primary btn-sm" onclick="Properties.openAddDoc()">+ Add document</button>
      </div>
      ${visible.length ? `
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Document</th><th>Category</th><th>Expires</th><th>Notes</th></tr></thead>
        <tbody>
          ${visible.map(d => {
            const n = _daysUntil(d.expires);
            const isExp  = n !== null && n < 0;
            const isSoon = n !== null && n >= 0 && n <= 60;
            const expColor = isExp ? 'var(--red)' : isSoon ? 'var(--yel)' : 'var(--txt3)';
            return `<tr>
              <td style="font-weight:500;color:var(--txt)">${escHtml(d.name)}</td>
              <td><span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:4px;background:${CAT_COLOR[d.category] || '#888'}18;color:${CAT_COLOR[d.category] || 'var(--txt3)'}">${escHtml(d.category)}</span></td>
              <td style="color:${expColor};font-size:12px">${d.expires ? _fmtDate(d.expires) + (isExp ? ' · Expired' : isSoon ? ' · Expiring' : '') : '—'}</td>
              <td style="color:var(--txt3);font-size:11px">${escHtml(d.notes || '')}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>` : `<div style="text-align:center;padding:48px;color:var(--txt3);font-size:13px">No documents in this category.</div>`}
    </div>`;
  }

  /* ── BOOKINGS ── */
  function renderBookings() {
    const wrap = document.getElementById('page-prop-bookings');
    if (!wrap) return;
    const prop = current();
    if (!prop) return;
    const bookings = _propBookings(prop.id);

    const statsEl = document.getElementById('prop-booking-stats');
    if (statsEl) {
      const active = bookings.filter(b => b.status === 'active').length;
      const confirmed = bookings.filter(b => b.status === 'confirmed').length;
      const totalRev = bookings.reduce((s, b) => s + b.rate, 0);
      statsEl.style.gridTemplateColumns = 'repeat(3,1fr)';
      statsEl.innerHTML = `
        <div class="wo-stat"><div class="wo-stat-num" style="${active ? 'color:var(--grn)' : ''}">${active}</div><div class="wo-stat-lbl">Active now</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:#60A5FA">${confirmed}</div><div class="wo-stat-lbl">Confirmed</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="font-size:18px">${_fmtCcy(totalRev)}</div><div class="wo-stat-lbl">Total bookings</div></div>`;
    }

    const STATUS_BADGE = {
      active:    { label: 'Active', color: 'var(--grn)', bg: 'rgba(74,222,128,.08)' },
      confirmed: { label: 'Confirmed', color: '#60A5FA', bg: 'rgba(96,165,250,.08)' },
      completed: { label: 'Completed', color: 'var(--txt3)', bg: 'var(--bg3)' },
    };

    wrap.innerHTML = `<div style="padding:18px 20px 60px">
      <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
        <button class="btn btn-primary btn-sm" onclick="Properties.openAddBooking()">+ Add booking</button>
      </div>
      ${bookings.length ? `
      <div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Guest / Group</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Rate</th><th>Source</th><th>Status</th></tr></thead>
        <tbody>
          ${bookings.map(b => {
            const badge = STATUS_BADGE[b.status] || STATUS_BADGE.confirmed;
            return `<tr>
              <td style="font-weight:500;color:var(--txt)">${escHtml(b.guest)}</td>
              <td style="color:var(--txt2)">${_fmtDate(b.checkIn)}</td>
              <td style="color:var(--txt2)">${_fmtDate(b.checkOut)}</td>
              <td style="color:var(--txt2)">${b.guests}</td>
              <td style="font-weight:600;color:var(--txt)">${_fmtCcy(b.rate)}</td>
              <td style="color:var(--txt3);font-size:11px">${escHtml(b.source)}</td>
              <td><span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:20px;background:${badge.bg};color:${badge.color}">${badge.label}</span></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table></div>` : `<div style="text-align:center;padding:48px;color:var(--txt3);font-size:13px">No bookings on record. <button class="btn btn-ghost btn-xs" style="margin-left:8px" onclick="Properties.openAddBooking()">Add booking →</button></div>`}
    </div>`;
  }

  /* ── STAFF ── */
  function renderStaff() {
    const wrap = document.getElementById('page-prop-staff');
    if (!wrap) return;
    const prop = current();
    if (!prop) return;
    const staff = _propStaff(prop.id);

    const statsEl = document.getElementById('prop-staff-stats');
    if (statsEl) {
      statsEl.style.gridTemplateColumns = 'repeat(2,1fr)';
      statsEl.innerHTML = `
        <div class="wo-stat"><div class="wo-stat-num">${staff.length}</div><div class="wo-stat-lbl">Total staff</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:var(--grn)">${staff.filter(s=>s.status==='onsite').length}</div><div class="wo-stat-lbl">On-site</div></div>`;
    }

    wrap.innerHTML = `<div style="padding:18px 20px 60px">
      <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
        <button class="btn btn-primary btn-sm" onclick="Properties.openAddStaff()">+ Add staff</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${staff.map(s => `
          <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--bg2);border:.5px solid var(--bd);border-radius:10px">
            <div style="width:40px;height:40px;border-radius:50%;background:${s.color};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#080808;flex-shrink:0">${s.initials}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:14px;font-weight:600;color:var(--txt)">${escHtml(s.name)}</div>
              <div style="font-size:12px;color:var(--txt3);margin-top:2px">${escHtml(s.role)}</div>
            </div>
            ${s.phone ? `<a href="tel:${escHtml(s.phone)}" style="font-size:12px;color:var(--txt3);text-decoration:none" onclick="event.stopPropagation()">${escHtml(s.phone)}</a>` : ''}
            <span style="font-size:11px;font-weight:600;padding:4px 10px;border-radius:20px;background:${s.status==='onsite'?'rgba(74,222,128,.1)':'var(--bg3)'};color:${s.status==='onsite'?'var(--grn)':'var(--txt3)'}">
              ${s.status === 'onsite' ? 'On-site' : 'Off-site'}
            </span>
          </div>`).join('')}
        ${!staff.length ? `<div style="text-align:center;padding:48px;color:var(--txt3);font-size:13px">No staff on record.</div>` : ''}
      </div>
    </div>`;
  }

  /* ── DETAIL PANELS ── */
  function openWODetail(id) {
    const w = (FM.propertyWorkOrders || []).find(x => x.id === id);
    if (!w) return;
    document.getElementById('panel-title').textContent = w.id;
    openPanel(`
      <div style="display:flex;flex-direction:column;gap:14px">
        <div>
          <div style="font-size:16px;font-weight:600;color:var(--txt);margin-bottom:4px">${escHtml(w.title)}</div>
          <div style="font-size:12px;color:var(--txt3)">${escHtml(w.room)} · ${escHtml(w.system)}</div>
        </div>
        <div style="display:flex;gap:8px">
          <span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;background:${PRIORITY_COLOR[w.priority]}18;color:${PRIORITY_COLOR[w.priority]}">${w.priority.charAt(0).toUpperCase() + w.priority.slice(1)} priority</span>
          <span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:4px;background:${STATUS_COLOR[w.status]}18;color:${STATUS_COLOR[w.status]}">${STATUS_LABEL[w.status]}</span>
        </div>
        ${w.desc ? `<div style="font-size:13px;color:var(--txt2);line-height:1.6">${escHtml(w.desc)}</div>` : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div style="background:var(--bg3);border-radius:8px;padding:11px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:3px">Due date</div>
            <div style="font-size:14px;font-weight:600;color:var(--txt)">${_fmtDate(w.due)}</div>
          </div>
          <div style="background:var(--bg3);border-radius:8px;padding:11px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:3px">Created</div>
            <div style="font-size:14px;font-weight:600;color:var(--txt)">${_fmtDate(w.created)}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button class="btn btn-primary btn-sm" onclick="Properties._markDone('${w.id}')">Mark done</button>
          <button class="btn btn-ghost btn-sm" onclick="closePanel()">Close</button>
        </div>
      </div>
    `);
  }

  function _markDone(id) {
    const w = (FM.propertyWorkOrders || []).find(x => x.id === id);
    if (w) { w.status = 'done'; closePanel(); renderWorkOrders(); showToast('Issue resolved'); }
  }

  /* ── MODALS ── */
  function openAddWO() {
    const prop = current();
    if (!prop) return;
    const rooms   = (prop.rooms   || []).map(r => `<option>${r}</option>`).join('');
    const systems = (prop.systems || []).map(s => `<option>${s}</option>`).join('');
    openModal(`
      <div style="display:flex;flex-direction:column;gap:12px">
        <div><label class="inp-lbl">Title</label><input class="inp" id="pwo-title" placeholder="Describe the issue"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="inp-lbl">Room</label><select class="inp" id="pwo-room">${rooms}</select></div>
          <div><label class="inp-lbl">System</label><select class="inp" id="pwo-sys">${systems}</select></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="inp-lbl">Priority</label><select class="inp" id="pwo-pri"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option></select></div>
          <div><label class="inp-lbl">Due date</label><input class="inp" id="pwo-due" type="date"></div>
        </div>
        <div><label class="inp-lbl">Description <span style="color:var(--txt4);font-weight:400">(optional)</span></label><textarea class="inp" id="pwo-desc" rows="3" style="resize:none;font-family:inherit"></textarea></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Properties.saveWO()">Add issue</button>
        </div>
      </div>
    `, 'Add issue');
  }

  function saveWO() {
    const prop  = current();
    const title = document.getElementById('pwo-title')?.value.trim();
    if (!title) { showToast('Title is required', 'error'); return; }
    const wo = {
      id:       'PWO-' + String(Date.now()).slice(-4),
      property: prop.id,
      title,
      room:     document.getElementById('pwo-room')?.value || '',
      system:   document.getElementById('pwo-sys')?.value  || '',
      priority: document.getElementById('pwo-pri')?.value  || 'medium',
      desc:     document.getElementById('pwo-desc')?.value.trim() || '',
      due:      document.getElementById('pwo-due')?.value  || null,
      status:   'open',
      created:  '2026-05-07',
    };
    FM.propertyWorkOrders = FM.propertyWorkOrders || [];
    FM.propertyWorkOrders.push(wo);
    closeModal();
    renderWorkOrders();
    showToast('Issue added');
  }

  function openAddBooking() {
    openModal(`
      <div style="display:flex;flex-direction:column;gap:12px">
        <div><label class="inp-lbl">Guest / Group name</label><input class="inp" id="pb-guest" placeholder="e.g. Smith Family"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="inp-lbl">Check-in</label><input class="inp" id="pb-in" type="date"></div>
          <div><label class="inp-lbl">Check-out</label><input class="inp" id="pb-out" type="date"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="inp-lbl">Number of guests</label><input class="inp" id="pb-guests" type="number" min="1" value="2"></div>
          <div><label class="inp-lbl">Rate (USD)</label><input class="inp" id="pb-rate" type="number" min="0" placeholder="e.g. 12000"></div>
        </div>
        <div><label class="inp-lbl">Source</label><input class="inp" id="pb-src" value="Direct" placeholder="Direct / Castello Mgmt / etc."></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Properties.saveBooking()">Add booking</button>
        </div>
      </div>
    `, 'Add booking');
  }

  function saveBooking() {
    const prop  = current();
    const guest = document.getElementById('pb-guest')?.value.trim();
    if (!guest) { showToast('Guest name is required', 'error'); return; }
    FM.propertyBookings = FM.propertyBookings || [];
    FM.propertyBookings.push({
      id:       'pb-' + Date.now(),
      property: prop.id,
      guest,
      checkIn:  document.getElementById('pb-in')?.value   || null,
      checkOut: document.getElementById('pb-out')?.value  || null,
      guests:   parseInt(document.getElementById('pb-guests')?.value) || 1,
      rate:     parseFloat(document.getElementById('pb-rate')?.value) || 0,
      source:   document.getElementById('pb-src')?.value.trim() || 'Direct',
      status:   'confirmed',
    });
    closeModal();
    renderBookings();
    showToast('Booking added');
  }

  function openAddStaff() {
    openModal(`
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="inp-lbl">Name</label><input class="inp" id="ps-name" placeholder="Full name"></div>
          <div><label class="inp-lbl">Role</label><input class="inp" id="ps-role" placeholder="e.g. Housekeeper"></div>
        </div>
        <div><label class="inp-lbl">Phone</label><input class="inp" id="ps-phone" type="tel" placeholder="+1 555 000 0000"></div>
        <div><label class="inp-lbl">Email <span style="color:var(--txt4);font-weight:400">(optional)</span></label><input class="inp" id="ps-email" type="email"></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Properties.saveStaff()">Add staff</button>
        </div>
      </div>
    `, 'Add staff member');
  }

  function saveStaff() {
    const prop = current();
    const name = document.getElementById('ps-name')?.value.trim();
    if (!name) { showToast('Name is required', 'error'); return; }
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const colors   = ['#F97316','#60A5FA','#4ADE80','#A78BFA','#FACC15','#F87171'];
    FM.propertyStaff = FM.propertyStaff || [];
    FM.propertyStaff.push({
      id:       'ps-' + Date.now(),
      property: prop.id,
      name,
      role:     document.getElementById('ps-role')?.value.trim()  || '',
      phone:    document.getElementById('ps-phone')?.value.trim() || '',
      email:    document.getElementById('ps-email')?.value.trim() || '',
      status:   'onsite',
      initials,
      color: colors[FM.propertyStaff.length % colors.length],
    });
    closeModal();
    renderStaff();
    showToast('Staff member added');
  }

  function openAddDoc() {
    const cats = ['Lease','Insurance','Contracts','Compliance','Other'];
    openModal(`
      <div style="display:flex;flex-direction:column;gap:12px">
        <div><label class="inp-lbl">Document name</label><input class="inp" id="pd-name" placeholder="e.g. Buildings Insurance 2026"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="inp-lbl">Category</label><select class="inp" id="pd-cat">${cats.map(c=>`<option>${c}</option>`).join('')}</select></div>
          <div><label class="inp-lbl">Expires <span style="color:var(--txt4);font-weight:400">(optional)</span></label><input class="inp" id="pd-exp" type="date"></div>
        </div>
        <div><label class="inp-lbl">Notes <span style="color:var(--txt4);font-weight:400">(optional)</span></label><input class="inp" id="pd-notes" placeholder="Provider, policy number, etc."></div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Properties.saveDoc()">Add document</button>
        </div>
      </div>
    `, 'Add document');
  }

  function saveDoc() {
    const prop = current();
    const name = document.getElementById('pd-name')?.value.trim();
    if (!name) { showToast('Name is required', 'error'); return; }
    FM.propertyDocs = FM.propertyDocs || [];
    FM.propertyDocs.push({
      id:       'pd-' + Date.now(),
      property: prop.id,
      name,
      category: document.getElementById('pd-cat')?.value   || 'Other',
      expires:  document.getElementById('pd-exp')?.value   || null,
      notes:    document.getElementById('pd-notes')?.value.trim() || '',
    });
    closeModal();
    renderDocuments();
    showToast('Document added');
  }

  /* ── router ── */
  function onNavTo(pageId) {
    if (pageId === 'prop-overview')   renderOverview();
    if (pageId === 'prop-workorders') renderWorkOrders();
    if (pageId === 'prop-documents')  renderDocuments();
    if (pageId === 'prop-bookings')   renderBookings();
    if (pageId === 'prop-staff')      renderStaff();
  }

  function setWOFilter(f) { _woFilter = f; renderWorkOrders(); }
  function setDocTab(t)   { _docTab   = t; renderDocuments(); }

  return {
    switchTo, clearContext, onNavTo,
    renderOverview, renderWorkOrders, renderDocuments, renderBookings, renderStaff,
    openWODetail, _markDone,
    openAddWO, saveWO,
    openAddBooking, saveBooking,
    openAddStaff, saveStaff,
    openAddDoc, saveDoc,
    setWOFilter, setDocTab,
  };
})();

window.Properties = Properties;
