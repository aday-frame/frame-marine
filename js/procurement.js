/* ── FRAME MARINE — PROCUREMENT ── */
'use strict';

const Procurement = window.Procurement = (() => {
  let _tab = 'overview';
  let _cellarCat = 'All';
  let _vendorCat = 'All';
  let _provDetail = null;
  let _poDetail = null;

  const TODAY = '2026-05-07';

  const CAT_COLORS = {
    'Champagne': '#F97316', 'White Wine': '#FACC15', 'Red Wine': '#F87171',
    'Rosé Wine': '#F472B6', 'Spirits': '#A78BFA', 'Water & Soft Drinks': '#4ADE80',
    'Technical': '#60A5FA', 'Interior': '#A78BFA', 'Food': '#4ADE80',
    'Wine & Spirits': '#F97316', 'Provisioning': '#4ADE80', 'Other': '#94A3B8',
  };

  const PO_STATUS = {
    draft:      { label: 'Draft',      cls: 'b-hold' },
    ordered:    { label: 'Ordered',    cls: 'b-blue' },
    'in-transit': { label: 'In transit', cls: 'b-blue' },
    received:   { label: 'Received',   cls: 'b-done' },
    cancelled:  { label: 'Cancelled',  cls: 'b-high' },
  };

  const PROV_STATUS = {
    draft:      { label: 'Draft',     cls: 'b-hold' },
    sent:       { label: 'Sent',      cls: 'b-blue' },
    confirmed:  { label: 'Confirmed', cls: 'b-blue' },
    delivered:  { label: 'Delivered', cls: 'b-done' },
  };

  function USD(n) { return '$' + (+n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
  function fmtDate(s) {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + +d + ', ' + y;
  }

  function stockStatus(item) {
    if (item.par === 0) return 'special';
    if (item.qty === 0) return 'out';
    if (item.qty < item.par * 0.5) return 'low';
    if (item.qty < item.par) return 'below';
    return 'ok';
  }
  function stockBadge(item) {
    const s = stockStatus(item);
    if (s === 'out')     return '<span class="badge b-high">Out</span>';
    if (s === 'low')     return '<span class="badge b-high">Low</span>';
    if (s === 'below')   return '<span class="badge b-hold">Below PAR</span>';
    if (s === 'special') return '<span class="badge" style="background:var(--bg4);color:var(--txt3)">Special</span>';
    return '<span class="badge b-done">In stock</span>';
  }

  function vesselCellar() {
    const vid = App.currentVesselId === 'all' ? 'v1' : App.currentVesselId;
    return (FM.cellar || []).filter(i => i.vessel === vid || !i.vessel);
  }
  function vesselPOs() {
    const vid = App.currentVesselId === 'all' ? null : App.currentVesselId;
    return (FM.purchaseOrders || []).filter(p => !vid || p.vessel === vid);
  }
  function vesselPRs() {
    const vid = App.currentVesselId === 'all' ? null : App.currentVesselId;
    return (FM.provisioningRequests || []).filter(r => !vid || r.vessel === vid);
  }

  /* ── ENTRY POINT ── */
  function render() {
    const wrap = document.getElementById('page-procurement');
    if (!wrap) return;

    const cellar   = vesselCellar();
    const pos      = vesselPOs();
    const prs      = vesselPRs();
    const lowStock = cellar.filter(i => ['out','low','below'].includes(stockStatus(i)));
    const openPOs  = pos.filter(p => p.status !== 'received' && p.status !== 'cancelled');
    const cellarVal = cellar.reduce((s, i) => s + i.qty * i.cost, 0);
    const monthSpend = pos.filter(p => p.ordered && p.ordered.startsWith('2026-05')).reduce((s, p) => s + p.items.reduce((a, i) => a + i.total, 0), 0);
    const upcomingPR = prs.filter(r => r.status === 'draft' || r.status === 'sent');

    const tabs = ['overview','cellar','provisioning','orders','vendors'];
    const tabLabels = {
      overview:    'Overview',
      cellar:      `Cellar & Bar${lowStock.length ? ` (${lowStock.length} low)` : ''}`,
      provisioning:`Provisioning${upcomingPR.length ? ` (${upcomingPR.length})` : ''}`,
      orders:      `Orders${openPOs.length ? ` (${openPOs.length})` : ''}`,
      vendors:     'Vendors',
    };

    const tabBar = tabs.map(t =>
      `<button class="tab-btn ${_tab === t ? 'tab-btn-active' : ''}" onclick="Procurement._setTab('${t}')">${tabLabels[t]}</button>`
    ).join('');

    let content = '';
    if (_tab === 'overview')     content = _renderOverview(cellar, pos, prs, lowStock, openPOs, cellarVal, monthSpend, upcomingPR);
    if (_tab === 'cellar')       content = _renderCellar(cellar);
    if (_tab === 'provisioning') content = _renderProvisioning(prs);
    if (_tab === 'orders')       content = _renderOrders(pos);
    if (_tab === 'vendors')      content = _renderVendors();

    wrap.innerHTML = `
      <div style="padding:0 0 80px">
        <div class="stat-5" style="display:grid;grid-template-columns:repeat(5,1fr);border-bottom:.5px solid var(--bd)">
          <div class="wo-stat"><div class="wo-stat-num" style="color:${openPOs.length ? 'var(--or)' : 'var(--txt)'}">${openPOs.length}</div><div class="wo-stat-lbl">Open orders</div></div>
          <div class="wo-stat"><div class="wo-stat-num" style="color:${lowStock.length ? 'var(--red)' : 'var(--txt)'}">${lowStock.length}</div><div class="wo-stat-lbl">Low stock</div></div>
          <div class="wo-stat"><div class="wo-stat-num" style="font-size:17px">${USD(cellarVal)}</div><div class="wo-stat-lbl">Cellar value</div></div>
          <div class="wo-stat"><div class="wo-stat-num" style="font-size:17px">${USD(monthSpend)}</div><div class="wo-stat-lbl">May spend</div></div>
          <div class="wo-stat" style="border-right:none"><div class="wo-stat-num" style="color:${upcomingPR.length ? '#60A5FA' : 'var(--txt)'}">${upcomingPR.length}</div><div class="wo-stat-lbl">Pending provisioning</div></div>
        </div>
        <div style="display:flex;gap:4px;padding:0 20px;border-bottom:.5px solid var(--bd);overflow-x:auto">${tabBar}</div>
        <div style="padding:20px">${content}</div>
      </div>`;
  }

  /* ── OVERVIEW ── */
  function _renderOverview(cellar, pos, prs, lowStock, openPOs, cellarVal, monthSpend, upcomingPR) {
    const lowRows = lowStock.slice(0, 6).map(item => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:.5px solid var(--bd)">
        <div style="width:8px;height:8px;border-radius:50%;background:${CAT_COLORS[item.category] || 'var(--or)'};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:500;color:var(--txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(item.name)}</div>
          <div style="font-size:10px;color:var(--txt4)">${escHtml(item.category)} · Bin ${escHtml(item.bin)}</div>
        </div>
        <div style="font-size:12px;color:var(--txt3);white-space:nowrap">${item.qty} / PAR ${item.par}</div>
        ${stockBadge(item)}
        <button class="btn btn-ghost btn-xs" onclick="Procurement._orderItem('${item.id}')">Order</button>
      </div>`).join('');

    const prRows = upcomingPR.map(pr => {
      const charter = (FM.charters || []).find(c => c.id === pr.charter);
      const total = pr.items.reduce((s, i) => s + i.total, 0);
      return `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:.5px solid var(--bd);cursor:pointer" onclick="Procurement._setTab('provisioning')">
          <div style="flex:1;min-width:0">
            <div style="font-size:12px;font-weight:500;color:var(--txt)">${charter ? escHtml(charter.name) : 'No charter'}</div>
            <div style="font-size:10px;color:var(--txt4)">Delivery: ${fmtDate(pr.deliveryDate)} · ${pr.items.length} items</div>
          </div>
          <div style="font-size:12px;font-weight:600;color:var(--txt)">${USD(total)}</div>
          <span class="badge ${PROV_STATUS[pr.status]?.cls || 'b-hold'}">${PROV_STATUS[pr.status]?.label || pr.status}</span>
        </div>`;
    }).join('');

    const recentPOs = pos.slice(0, 4).map(po => {
      const vendor = (FM.vendors || []).find(v => v.id === po.vendor);
      const total = po.items.reduce((s, i) => s + i.total, 0);
      return `
        <tr onclick="Procurement._openPO('${po.id}')" style="cursor:pointer">
          <td style="font-size:12px;font-weight:500;color:var(--txt)">${escHtml(po.ref)}</td>
          <td style="font-size:12px;color:var(--txt2)">${vendor ? escHtml(vendor.name.split(' ')[0]) : '—'}</td>
          <td style="font-size:12px;color:var(--txt2)">${escHtml(po.category)}</td>
          <td style="font-size:12px;color:var(--txt);text-align:right">${USD(total)}</td>
          <td><span class="badge ${PO_STATUS[po.status]?.cls || 'b-hold'}">${PO_STATUS[po.status]?.label || po.status}</span></td>
        </tr>`;
    }).join('');

    return `
      <div class="col-2" style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div>
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:10px">Low stock — ${lowStock.length} items</div>
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:0 14px">
            ${lowStock.length ? lowRows : '<div style="padding:16px 0;font-size:12px;color:var(--txt3)">All items at or above PAR level</div>'}
          </div>
        </div>
        <div>
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:10px">Pending provisioning</div>
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:0 14px;margin-bottom:20px">
            ${upcomingPR.length ? prRows : '<div style="padding:16px 0;font-size:12px;color:var(--txt3)">No pending provisioning requests</div>'}
          </div>
        </div>
      </div>
      <div style="margin-top:4px">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:10px">Recent purchase orders</div>
        ${pos.length ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>Ref</th><th>Vendor</th><th>Category</th><th style="text-align:right">Total</th><th>Status</th></tr></thead>
          <tbody>${recentPOs}</tbody>
        </table></div>` : '<div style="color:var(--txt4);font-size:12px">No purchase orders yet</div>'}
      </div>`;
  }

  /* ── CELLAR & BAR ── */
  function _renderCellar(cellar) {
    const cats = ['All', ...new Set(cellar.map(i => i.category))];
    const filtered = _cellarCat === 'All' ? cellar : cellar.filter(i => i.category === _cellarCat);
    const totalVal = filtered.reduce((s, i) => s + i.qty * i.cost, 0);
    const lowCount = filtered.filter(i => ['out','low','below'].includes(stockStatus(i))).length;

    const filterPills = cats.map(c => `
      <button onclick="Procurement._setCellarCat('${c}')" style="padding:5px 12px;border-radius:20px;border:.5px solid ${_cellarCat === c ? '#F97316' : 'var(--bd)'};background:${_cellarCat === c ? 'rgba(249,115,22,.1)' : 'var(--bg2)'};color:${_cellarCat === c ? '#F97316' : 'var(--txt3)'};font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap">${c}</button>`
    ).join('');

    const items = filtered.map(item => {
      const s = stockStatus(item);
      const pct = item.par > 0 ? Math.min(100, Math.round(item.qty / item.par * 100)) : 100;
      const barColor = s === 'out' ? 'var(--red)' : s === 'low' ? 'var(--red)' : s === 'below' ? 'var(--yel)' : 'var(--grn)';
      const dot = CAT_COLORS[item.category] || 'var(--or)';
      return `
        <div style="background:var(--bg2);border:.5px solid ${s === 'out' || s === 'low' ? 'rgba(248,113,113,.25)' : 'var(--bd)'};border-radius:10px;padding:14px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;gap:8px">
            <div style="min-width:0">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                <div style="width:7px;height:7px;border-radius:50%;background:${dot};flex-shrink:0"></div>
                <div style="font-size:11px;color:var(--txt4)">${escHtml(item.category)}</div>
              </div>
              <div style="font-size:13px;font-weight:600;color:var(--txt);line-height:1.3">${escHtml(item.name)}</div>
              <div style="font-size:10px;color:var(--txt4);margin-top:2px">${escHtml(item.producer)}${item.vintage ? ' · ' + item.vintage : ''}${item.region ? ' · ' + escHtml(item.region) : ''}</div>
            </div>
            ${stockBadge(item)}
          </div>
          ${item.par > 0 ? `
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--txt4);margin-bottom:4px">
              <span>${item.qty} ${item.unit}s on board</span><span>PAR ${item.par}</span>
            </div>
            <div style="height:4px;background:var(--bg4);border-radius:2px"><div style="height:100%;width:${pct}%;background:${barColor};border-radius:2px;transition:width .3s"></div></div>
          </div>` : `<div style="font-size:10px;color:var(--txt4);margin-bottom:10px">${item.qty} ${item.unit}s · Special order item</div>`}
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div style="font-size:10px;color:var(--txt4)">Bin ${escHtml(item.bin)} · ${USD(item.cost)}/${item.unit}</div>
            <div style="display:flex;gap:6px">
              <button class="btn btn-ghost btn-xs" onclick="Procurement._logConsumption('${item.id}')" title="Log consumption">−1</button>
              <button class="btn btn-ghost btn-xs" onclick="Procurement._orderItem('${item.id}')">Order</button>
            </div>
          </div>
        </div>`;
    }).join('');

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:12px;flex-wrap:wrap">
        <div style="display:flex;gap:6px;flex-wrap:wrap">${filterPills}</div>
        <div style="display:flex;align-items:center;gap:14px">
          <span style="font-size:11px;color:var(--txt3)">${filtered.length} items · ${USD(totalVal)} value${lowCount ? ` · <span style="color:var(--red)">${lowCount} low</span>` : ''}</span>
          <button class="btn btn-primary btn-sm" onclick="Procurement._addCellarItem()">+ Add item</button>
        </div>
      </div>
      ${filtered.length
        ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px">${items}</div>`
        : `<div class="empty"><div class="empty-title">No items in this category</div></div>`}`;
  }

  /* ── PROVISIONING ── */
  function _renderProvisioning(prs) {
    if (_provDetail) return _renderProvDetail(_provDetail);

    const upcoming = (FM.charters || []).filter(c => {
      const vid = App.currentVesselId === 'all' ? null : App.currentVesselId;
      return (!vid || c.vessel === vid) && (c.status === 'upcoming' || c.status === 'active');
    });

    const rows = prs.map(pr => {
      const charter = (FM.charters || []).find(c => c.id === pr.charter);
      const vendor = (FM.vendors || []).find(v => v.id === pr.vendor);
      const total = pr.items.reduce((s, i) => s + i.total, 0);
      return `
        <tr onclick="Procurement._openPR('${pr.id}')" style="cursor:pointer">
          <td>
            <div style="font-size:13px;font-weight:500;color:var(--txt)">${charter ? escHtml(charter.name) : '—'}</div>
            <div style="font-size:10px;color:var(--txt4);margin-top:1px">${pr.items.length} items · ${escHtml(pr.notes.slice(0,60))}${pr.notes.length > 60 ? '…' : ''}</div>
          </td>
          <td style="font-size:12px;color:var(--txt2)">${vendor ? escHtml(vendor.name.split(' ').slice(0,2).join(' ')) : 'No vendor'}</td>
          <td style="font-size:12px;color:var(--txt2)">${fmtDate(pr.deliveryDate)}</td>
          <td style="font-size:12px;font-weight:600;color:var(--txt);text-align:right">${USD(total)}</td>
          <td><span class="badge ${PROV_STATUS[pr.status]?.cls || 'b-hold'}">${PROV_STATUS[pr.status]?.label || pr.status}</span></td>
        </tr>`;
    }).join('');

    const autoGenOpts = upcoming.map(c =>
      `<option value="${c.id}">${escHtml(c.name)} — ${c.start}</option>`
    ).join('');

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div style="font-size:13px;font-weight:600;color:var(--txt)">${prs.length} provisioning request${prs.length !== 1 ? 's' : ''}</div>
        <div style="display:flex;gap:8px">
          ${upcoming.length ? `
          <div style="display:flex;gap:6px;align-items:center">
            <select id="pr-charter-sel" style="padding:6px 10px;background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none">
              ${autoGenOpts}
            </select>
            <button class="btn btn-ghost btn-sm" onclick="Procurement._autoGen(document.getElementById('pr-charter-sel').value)">Auto-generate from guests</button>
          </div>` : ''}
          <button class="btn btn-primary btn-sm" onclick="Procurement._newPR()">+ New request</button>
        </div>
      </div>
      ${prs.length ? `<div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Charter</th><th>Vendor</th><th>Delivery</th><th style="text-align:right">Total</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : `<div class="empty"><div class="empty-title">No provisioning requests</div><div class="empty-sub">Auto-generate one from an upcoming charter's guest preferences</div></div>`}`;
  }

  function _renderProvDetail(prId) {
    const pr = (FM.provisioningRequests || []).find(r => r.id === prId);
    if (!pr) { _provDetail = null; return _renderProvisioning(vesselPRs()); }

    const charter = (FM.charters || []).find(c => c.id === pr.charter);
    const vendor = (FM.vendors || []).find(v => v.id === pr.vendor);
    const total = pr.items.reduce((s, i) => s + i.total, 0);

    // Dietary flags from guests
    const guests = charter ? (charter.guests || []).map(id => (FM.guests || []).find(g => g.id === id)).filter(Boolean) : [];
    const flags = [];
    if (guests.some(g => (g.dietary||'').toLowerCase().includes('vegan'))) flags.push({ color: 'var(--grn)', text: 'Vegan required' });
    if (guests.some(g => (g.dietary||'').toLowerCase().includes('vegetarian'))) flags.push({ color: '#4ADE80', text: 'Vegetarian required' });
    if (guests.some(g => (g.allergies||'').toLowerCase().includes('gluten'))) flags.push({ color: 'var(--yel)', text: 'Gluten-free required' });
    if (guests.some(g => (g.allergies||'').toLowerCase().includes('shellfish'))) flags.push({ color: 'var(--red)', text: 'Shellfish allergy' });
    if (guests.some(g => (g.allergies||'').toLowerCase().includes('nut'))) flags.push({ color: 'var(--red)', text: 'Nut allergy' });
    if (guests.some(g => (g.allergies||'').toLowerCase().includes('dairy'))) flags.push({ color: 'var(--yel)', text: 'Dairy-free required' });

    const itemRows = pr.items.map(item => `
      <tr>
        <td style="font-size:12px;color:var(--txt2)">${escHtml(item.category)}</td>
        <td style="font-size:12px;color:var(--txt)">${escHtml(item.desc)}</td>
        <td style="font-size:12px;color:var(--txt3);text-align:center">${item.qty} ${escHtml(item.unit)}</td>
        <td style="font-size:12px;color:var(--txt3);text-align:right">${USD(item.unitCost)}</td>
        <td style="font-size:12px;font-weight:600;color:var(--txt);text-align:right">${USD(item.total)}</td>
      </tr>`).join('');

    const vendorOpts = (FM.vendors || []).filter(v => ['Provisioning','Wine & Spirits'].includes(v.category))
      .map(v => `<option value="${v.id}" ${pr.vendor === v.id ? 'selected' : ''}>${escHtml(v.name)}</option>`).join('');

    return `
      <div>
        <button class="btn btn-ghost btn-sm" onclick="Procurement._closePR()" style="margin-bottom:16px;gap:6px">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:12px;height:12px"><path d="M10 4l-4 4 4 4"/></svg>
          All provisioning
        </button>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:16px">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt4);margin-bottom:8px">Charter</div>
            <div style="font-size:14px;font-weight:600;color:var(--txt);margin-bottom:4px">${charter ? escHtml(charter.name) : '—'}</div>
            <div style="font-size:11px;color:var(--txt3)">Delivery: ${fmtDate(pr.deliveryDate)}</div>
            ${flags.length ? `<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:5px">${flags.map(f => `<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;color:${f.color};background:${f.color}15;border:.5px solid ${f.color}40;padding:2px 8px;border-radius:12px"><span style="width:5px;height:5px;border-radius:50%;background:${f.color}"></span>${f.text}</span>`).join('')}</div>` : ''}
          </div>
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:16px">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt4);margin-bottom:8px">Vendor</div>
            ${vendor
              ? `<div style="font-size:14px;font-weight:600;color:var(--txt);margin-bottom:2px">${escHtml(vendor.name)}</div><div style="font-size:11px;color:var(--txt3)">${escHtml(vendor.contact)} · ${escHtml(vendor.leadTime)}</div>`
              : `<select onchange="Procurement._setPRVendor('${pr.id}',this.value)" style="width:100%;padding:7px 10px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none"><option value="">— select vendor —</option>${vendorOpts}</select>`}
            <div style="margin-top:10px;display:flex;gap:6px">
              <span class="badge ${PROV_STATUS[pr.status]?.cls || 'b-hold'}">${PROV_STATUS[pr.status]?.label || pr.status}</span>
              ${pr.status === 'draft' ? `<button class="btn btn-primary btn-xs" onclick="Procurement._advancePR('${pr.id}','sent')">Send to vendor</button>` : ''}
              ${pr.status === 'sent' || pr.status === 'confirmed' ? `<button class="btn btn-primary btn-xs" onclick="Procurement._advancePR('${pr.id}','delivered')">Mark delivered</button>` : ''}
            </div>
          </div>
        </div>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th style="width:120px">Category</th><th>Description</th><th style="text-align:center;width:80px">Qty</th><th style="text-align:right;width:80px">Unit</th><th style="text-align:right;width:90px">Total</th></tr></thead>
          <tbody>${itemRows}</tbody>
          <tfoot><tr style="border-top:.5px solid var(--bd)">
            <td colspan="4" style="font-size:12px;font-weight:700;color:var(--txt);padding:10px 12px">Total</td>
            <td style="font-size:14px;font-weight:700;color:var(--txt);text-align:right;padding:10px 12px">${USD(total)}</td>
          </tr></tfoot>
        </table></div>
        <div style="margin-top:14px;padding:12px 14px;background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;font-size:12px;color:var(--txt3)">${escHtml(pr.notes)}</div>
      </div>`;
  }

  /* ── ORDERS ── */
  function _renderOrders(pos) {
    if (_poDetail) return _renderPODetail(_poDetail);

    const statuses = ['all','draft','ordered','in-transit','received'];
    const [_poFilter, setPoFilter] = (() => { let f = 'all'; return [() => f, v => { f = v; }]; })();

    const rows = pos.map(po => {
      const vendor = (FM.vendors || []).find(v => v.id === po.vendor);
      const total = po.items.reduce((s, i) => s + i.total, 0);
      return `
        <tr onclick="Procurement._openPO('${po.id}')" style="cursor:pointer">
          <td style="font-size:12px;font-weight:600;color:var(--txt);font-family:var(--mono)">${escHtml(po.ref)}</td>
          <td>
            <div style="font-size:12px;font-weight:500;color:var(--txt)">${vendor ? escHtml(vendor.name.split(' ').slice(0,2).join(' ')) : '—'}</div>
            ${po.woRef ? `<div style="font-size:10px;color:var(--txt4)">WO: ${escHtml(po.woRef)}</div>` : ''}
          </td>
          <td style="font-size:12px;color:var(--txt2)">${escHtml(po.category)}</td>
          <td style="font-size:12px;color:var(--txt3)">${po.ordered ? fmtDate(po.ordered) : '—'}</td>
          <td style="font-size:12px;color:var(--txt3)">${po.expected ? fmtDate(po.expected) : '—'}</td>
          <td style="font-size:12px;font-weight:600;color:var(--txt);text-align:right">${USD(total)}</td>
          <td><span class="badge ${PO_STATUS[po.status]?.cls || 'b-hold'}">${PO_STATUS[po.status]?.label || po.status}</span></td>
        </tr>`;
    }).join('');

    return `
      <div style="display:flex;align-items:center;justify-content:flex-end;margin-bottom:14px">
        <button class="btn btn-primary btn-sm" onclick="Procurement._newPO()">+ New purchase order</button>
      </div>
      ${pos.length ? `<div class="tbl-wrap"><table class="tbl">
        <thead><tr><th>Ref</th><th>Vendor</th><th>Category</th><th>Ordered</th><th>Expected</th><th style="text-align:right">Total</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>` : `<div class="empty"><div class="empty-title">No purchase orders</div><div class="empty-sub">Create one from a low-stock alert or from scratch</div></div>`}`;
  }

  function _renderPODetail(poId) {
    const po = (FM.purchaseOrders || []).find(p => p.id === poId);
    if (!po) { _poDetail = null; return _renderOrders(vesselPOs()); }

    const vendor = (FM.vendors || []).find(v => v.id === po.vendor);
    const total = po.items.reduce((s, i) => s + i.total, 0);

    const itemRows = po.items.map(item => `
      <tr>
        <td style="font-size:12px;color:var(--txt)">${escHtml(item.desc)}</td>
        <td style="font-size:11px;color:var(--txt4);font-family:var(--mono)">${escHtml(item.partNo || '—')}</td>
        <td style="font-size:12px;color:var(--txt3);text-align:center">${item.qty}</td>
        <td style="font-size:12px;color:var(--txt3);text-align:right">${USD(item.unitCost)}</td>
        <td style="font-size:12px;font-weight:600;color:var(--txt);text-align:right">${USD(item.total)}</td>
      </tr>`).join('');

    return `
      <div>
        <button class="btn btn-ghost btn-sm" onclick="Procurement._closePO()" style="margin-bottom:16px;gap:6px">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:12px;height:12px"><path d="M10 4l-4 4 4 4"/></svg>
          All orders
        </button>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;gap:12px">
          <div>
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:3px">Purchase order</div>
            <div style="font-size:18px;font-weight:700;color:var(--txt);font-family:var(--mono)">${escHtml(po.ref)}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="badge ${PO_STATUS[po.status]?.cls || 'b-hold'}">${PO_STATUS[po.status]?.label || po.status}</span>
            ${po.status === 'draft' ? `<button class="btn btn-primary btn-sm" onclick="Procurement._advancePO('${po.id}','ordered')">Submit order</button>` : ''}
            ${po.status === 'ordered' || po.status === 'in-transit' ? `<button class="btn btn-primary btn-sm" onclick="Procurement._advancePO('${po.id}','received')">Mark received</button>` : ''}
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px">
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;padding:12px 14px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt4);margin-bottom:6px">Vendor</div>
            <div style="font-size:13px;font-weight:600;color:var(--txt)">${vendor ? escHtml(vendor.name) : '—'}</div>
            ${vendor ? `<div style="font-size:11px;color:var(--txt3);margin-top:2px">${escHtml(vendor.contact)}</div>` : ''}
          </div>
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;padding:12px 14px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt4);margin-bottom:6px">Dates</div>
            <div style="font-size:11px;color:var(--txt2)"><span style="color:var(--txt4)">Ordered: </span>${po.ordered ? fmtDate(po.ordered) : '—'}</div>
            <div style="font-size:11px;color:var(--txt2);margin-top:2px"><span style="color:var(--txt4)">Expected: </span>${po.expected ? fmtDate(po.expected) : '—'}</div>
            ${po.received ? `<div style="font-size:11px;color:var(--grn);margin-top:2px"><span style="color:var(--txt4)">Received: </span>${fmtDate(po.received)}</div>` : ''}
          </div>
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;padding:12px 14px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt4);margin-bottom:6px">Reference</div>
            <div style="font-size:11px;color:var(--txt2)">${escHtml(po.category)}${po.woRef ? `<span style="color:var(--txt4)"> · WO: ${escHtml(po.woRef)}</span>` : ''}</div>
            ${po.notes ? `<div style="font-size:11px;color:var(--txt3);margin-top:4px">${escHtml(po.notes)}</div>` : ''}
          </div>
        </div>
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>Description</th><th style="width:120px">Part no.</th><th style="text-align:center;width:60px">Qty</th><th style="text-align:right;width:80px">Unit cost</th><th style="text-align:right;width:90px">Total</th></tr></thead>
          <tbody>${itemRows}</tbody>
          <tfoot><tr style="border-top:.5px solid var(--bd)">
            <td colspan="4" style="font-size:12px;font-weight:700;color:var(--txt);padding:10px 12px">Total</td>
            <td style="font-size:15px;font-weight:700;color:var(--txt);text-align:right;padding:10px 12px">${USD(total)}</td>
          </tr></tfoot>
        </table></div>
      </div>`;
  }

  /* ── VENDORS ── */
  function _renderVendors() {
    const vendors = FM.vendors || [];
    const cats = ['All', ...new Set(vendors.map(v => v.category))];
    const filtered = _vendorCat === 'All' ? vendors : vendors.filter(v => v.category === _vendorCat);

    const filterPills = cats.map(c => `
      <button onclick="Procurement._setVendorCat('${c}')" style="padding:5px 12px;border-radius:20px;border:.5px solid ${_vendorCat === c ? '#F97316' : 'var(--bd)'};background:${_vendorCat === c ? 'rgba(249,115,22,.1)' : 'var(--bg2)'};color:${_vendorCat === c ? '#F97316' : 'var(--txt3)'};font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap">${c}</button>`
    ).join('');

    const cards = filtered.map(v => {
      const vPOs = (FM.purchaseOrders || []).filter(p => p.vendor === v.id);
      const totalSpend = vPOs.reduce((s, p) => s + p.items.reduce((a, i) => a + i.total, 0), 0);
      const stars = '★'.repeat(v.rating) + '☆'.repeat(5 - v.rating);
      return `
        <div style="background:var(--bg2);border:.5px solid ${v.preferred ? 'rgba(249,115,22,.25)' : 'var(--bd)'};border-radius:12px;padding:16px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px;gap:8px">
            <div style="min-width:0">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                ${v.preferred ? `<span style="font-size:9px;font-weight:700;color:#F97316;background:rgba(249,115,22,.1);border:.5px solid rgba(249,115,22,.3);padding:1px 7px;border-radius:12px;letter-spacing:.06em">PREFERRED</span>` : ''}
                <span style="font-size:10px;color:var(--txt4)">${escHtml(v.category)}</span>
              </div>
              <div style="font-size:14px;font-weight:700;color:var(--txt)">${escHtml(v.name)}</div>
              <div style="font-size:11px;color:var(--txt3);margin-top:1px">${escHtml(v.location)}</div>
            </div>
            <div style="font-size:12px;color:var(--or);white-space:nowrap">${stars}</div>
          </div>
          <div style="font-size:11px;color:var(--txt3);line-height:1.55;margin-bottom:12px">${escHtml(v.specialty)}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;margin-bottom:12px">
            <div><span style="color:var(--txt4)">Contact: </span><span style="color:var(--txt2)">${escHtml(v.contact)}</span></div>
            <div><span style="color:var(--txt4)">Lead time: </span><span style="color:var(--txt2)">${escHtml(v.leadTime)}</span></div>
            <div style="grid-column:1/-1"><span style="color:var(--txt4)">Email: </span><span style="color:#60A5FA;font-family:var(--mono);font-size:10px">${escHtml(v.email)}</span></div>
          </div>
          ${v.notes ? `<div style="font-size:10px;color:var(--txt4);border-top:.5px solid var(--bd);padding-top:8px;margin-bottom:10px;line-height:1.5">${escHtml(v.notes)}</div>` : ''}
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div style="font-size:10px;color:var(--txt4)">${vPOs.length} order${vPOs.length !== 1 ? 's' : ''} · ${USD(totalSpend)} total</div>
            <button class="btn btn-ghost btn-xs" onclick="Procurement._newPOForVendor('${v.id}')">New order</button>
          </div>
        </div>`;
    }).join('');

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div style="display:flex;gap:6px;flex-wrap:wrap">${filterPills}</div>
        <button class="btn btn-primary btn-sm" onclick="Procurement._addVendor()">+ Add vendor</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">${cards}</div>`;
  }

  function _addDays(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0,10);
  }

  /* ── ACTIONS ── */
  const _setTab       = t  => { _tab = t; _provDetail = null; _poDetail = null; render(); };
  const _setCellarCat = c  => { _cellarCat = c; render(); };
  const _setVendorCat = c  => { _vendorCat = c; render(); };
  const _openPR       = id => { _provDetail = id; _tab = 'provisioning'; render(); };
  const _closePR      = () => { _provDetail = null; render(); };
  const _openPO       = id => { _poDetail = id; _tab = 'orders'; render(); };
  const _closePO      = () => { _poDetail = null; render(); };

  function _logConsumption(itemId) {
    const item = (FM.cellar || []).find(i => i.id === itemId);
    if (!item) return;
    if (item.qty <= 0) { showToast('None in stock', 'error'); return; }
    item.qty = Math.max(0, item.qty - 1);
    const charter = FM.activeCharter ? FM.activeCharter() : null;
    (FM.cellarLog || []).unshift({ id: 'cl-' + Date.now(), itemId, charter: charter?.id || null, qty: 1, date: TODAY, note: 'Logged consumption', crew: 'c1' });
    render();
    showToast(item.name + ' — 1 ' + item.unit + ' logged', 'ok');
  }

  function _orderItem(itemId) {
    const item = (FM.cellar || []).find(i => i.id === itemId);
    if (!item) return;
    const reorderQty = Math.max(1, (item.par || 0) - item.qty);
    const vendor = (FM.vendors || []).find(v =>
      (['Champagne','White Wine','Red Wine','Spirits','Water & Soft Drinks'].includes(item.category)
        ? v.category === 'Wine & Spirits' || v.category === 'Provisioning'
        : v.category === 'Technical') && v.preferred
    ) || null;

    openModal(`
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;padding:12px 14px">
          <div style="font-size:13px;font-weight:600;color:var(--txt)">${escHtml(item.name)}</div>
          <div style="font-size:11px;color:var(--txt3);margin-top:2px">${escHtml(item.category)} · Bin ${escHtml(item.bin)} · ${USD(item.cost)}/${item.unit}</div>
          <div style="font-size:11px;color:var(--txt3);margin-top:2px">On board: ${item.qty} · PAR: ${item.par}</div>
        </div>
        <div class="inp-group">
          <label class="inp-lbl">Vendor</label>
          <select class="inp" id="order-vendor">
            <option value="">— select —</option>
            ${(FM.vendors||[]).map(v => `<option value="${v.id}" ${vendor && vendor.id === v.id ? 'selected' : ''}>${escHtml(v.name)}</option>`).join('')}
          </select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="inp-group">
            <label class="inp-lbl">Quantity to order</label>
            <input class="inp" id="order-qty" type="number" value="${reorderQty}" min="1">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Expected delivery</label>
            <input class="inp" id="order-delivery" type="date" value="${vendor ? _addDays(TODAY, parseInt(vendor.leadTime) || 5) : ''}">
          </div>
        </div>
        <div class="inp-group">
          <label class="inp-lbl">Notes</label>
          <input class="inp" id="order-notes" placeholder="Any special instructions">
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Procurement._submitQuickOrder('${itemId}')">Create purchase order</button>
        </div>
      </div>
    `, 'Order: ' + item.name);
  };

  function _submitQuickOrder(itemId) {
    const item  = (FM.cellar || []).find(i => i.id === itemId);
    const vendorId = document.getElementById('order-vendor')?.value;
    const qty   = parseInt(document.getElementById('order-qty')?.value) || 1;
    const delivery = document.getElementById('order-delivery')?.value;
    const notes = document.getElementById('order-notes')?.value.trim() || '';
    if (!vendorId) { showToast('Select a vendor', 'error'); return; }
    const vendor = (FM.vendors||[]).find(v => v.id === vendorId);
    const ref = 'PO-2026-' + String((FM.purchaseOrders||[]).length + 4).padStart(3,'0');
    FM.purchaseOrders = FM.purchaseOrders || [];
    FM.purchaseOrders.unshift({
      id: 'po-' + Date.now(), vessel: App.currentVesselId === 'all' ? 'v1' : App.currentVesselId,
      vendor: vendorId, category: item.category, ref, status: 'ordered',
      created: TODAY, ordered: TODAY, expected: delivery || null, received: null,
      woRef: null, notes: notes || `Restock: ${item.name}`,
      items: [{ desc: `${item.name} × ${qty}`, partNo: '', qty, unitCost: item.cost, total: qty * item.cost }],
    });
    closeModal();
    _poDetail = null;
    _tab = 'orders';
    render();
    showToast('PO created — ' + ref, 'ok');
  };

  function _advancePO(poId, newStatus) {
    const po = (FM.purchaseOrders||[]).find(p => p.id === poId);
    if (!po) return;
    po.status = newStatus;
    if (newStatus === 'ordered') po.ordered = TODAY;
    if (newStatus === 'received') po.received = TODAY;
    render();
    showToast('Order ' + (PO_STATUS[newStatus]?.label || newStatus).toLowerCase(), 'ok');
  };

  function _advancePR(prId, newStatus) {
    const pr = (FM.provisioningRequests||[]).find(r => r.id === prId);
    if (!pr) return;
    pr.status = newStatus;
    render();
    showToast('Provisioning ' + (PROV_STATUS[newStatus]?.label || newStatus).toLowerCase(), 'ok');
  };

  function _setPRVendor(prId, vendorId) {
    const pr = (FM.provisioningRequests||[]).find(r => r.id === prId);
    if (pr) { pr.vendor = vendorId || null; render(); }
  };

  function _autoGen(charterId) {
    if (!charterId) { showToast('Select a charter first', 'error'); return; }
    const charter = (FM.charters||[]).find(c => c.id === charterId);
    if (!charter) return;

    const guests = (charter.guests||[]).map(id => (FM.guests||[]).find(g => g.id === id)).filter(Boolean);
    const nights = charter.start && charter.end ? Math.round((new Date(charter.end) - new Date(charter.start)) / 864e5) : 7;
    const gc = guests.length || 4;

    // Dietary flags
    const isVegan = guests.some(g => (g.dietary||'').toLowerCase().includes('vegan'));
    const isVeg   = guests.some(g => (g.dietary||'').toLowerCase().includes('vegetarian'));
    const hasGF   = guests.some(g => (g.allergies||'').toLowerCase().includes('gluten'));
    const hasDairy = guests.some(g => (g.allergies||'').toLowerCase().includes('dairy'));
    const hasShell = guests.some(g => (g.allergies||'').toLowerCase().includes('shellfish'));

    // Extract specific preferences
    const allPrefs = guests.map(g => (g.preferences||'').toLowerCase()).join(' ');
    const items = [];

    items.push({ id: 'ai-0', category: 'Food', desc: `Premium provisions — ${nights} nights, ${gc} guests`, qty: 1, unit: 'package', unitCost: 1400 * nights, total: 1400 * nights });
    if (isVegan) {
      const vNames = guests.filter(g => (g.dietary||'').toLowerCase().includes('vegan')).map(g => g.name.split(' ')[0]).join(', ');
      items.push({ id: 'ai-1', category: 'Food', desc: `Vegan selections — ${vNames}`, qty: 1, unit: 'order', unitCost: 350 * nights, total: 350 * nights });
    }
    if (isVeg && !isVegan) {
      const vNames = guests.filter(g => (g.dietary||'').toLowerCase().includes('vegetarian') && !(g.dietary||'').toLowerCase().includes('vegan')).map(g => g.name.split(' ')[0]).join(', ');
      items.push({ id: 'ai-2', category: 'Food', desc: `Vegetarian selections — ${vNames}`, qty: 1, unit: 'order', unitCost: 200 * nights, total: 200 * nights });
    }
    if (hasGF) items.push({ id: 'ai-3', category: 'Food', desc: 'Gluten-free alternatives throughout', qty: 1, unit: 'note', unitCost: 0, total: 0 });
    if (hasShell) items.push({ id: 'ai-4', category: 'Food', desc: 'Shellfish-free menu required — strict allergy', qty: 1, unit: 'note', unitCost: 0, total: 0 });

    // Champagne base
    items.push({ id: 'ai-5', category: 'Champagne', desc: 'Veuve Clicquot NV × ' + (gc * 2), qty: gc * 2, unit: 'bottle', unitCost: 75, total: gc * 2 * 75 });

    // Specific wine preferences
    if (allPrefs.includes('glenfarclas') || allPrefs.includes('single malt') || allPrefs.includes('whisky')) {
      const g = guests.find(x => (x.preferences||'').toLowerCase().includes('glenfarclas') || (x.preferences||'').toLowerCase().includes('whisky'));
      items.push({ id: 'ai-6', category: 'Spirits', desc: `Glenfarclas 25yr × 2 (${g ? g.name.split(' ')[0] : 'guest'} preference)`, qty: 2, unit: 'bottle', unitCost: 320, total: 640 });
    }
    if (allPrefs.includes('barolo') || allPrefs.includes('brunello') || allPrefs.includes('italian wine')) {
      items.push({ id: 'ai-7', category: 'Red Wine', desc: 'Barolo Brunate 2019 × 6', qty: 6, unit: 'bottle', unitCost: 95, total: 570 });
    }
    if (allPrefs.includes('burgundy') || allPrefs.includes('pinot noir')) {
      items.push({ id: 'ai-8', category: 'Red Wine', desc: 'Gevrey-Chambertin 2020 × 4', qty: 4, unit: 'bottle', unitCost: 135, total: 540 });
    }
    if (allPrefs.includes('bordeaux') || allPrefs.includes('margaux') || allPrefs.includes('petrus')) {
      items.push({ id: 'ai-9', category: 'Red Wine', desc: 'Château Léoville Barton 2018 × 4', qty: 4, unit: 'bottle', unitCost: 110, total: 440 });
    }
    if (allPrefs.includes('krug') || allPrefs.includes('prestige champagne')) {
      items.push({ id: 'ai-10', category: 'Champagne', desc: 'Krug Grande Cuvée NV × 4', qty: 4, unit: 'bottle', unitCost: 220, total: 880 });
    }

    // Low cellar items
    const vid = charter.vessel || 'v1';
    const lowCellar = (FM.cellar||[]).filter(i => (i.vessel === vid || !i.vessel) && i.par > 0 && i.qty < i.par * 0.6).slice(0,3);
    lowCellar.forEach((item, idx) => {
      const need = item.par - item.qty;
      items.push({ id: 'ai-low-'+idx, category: item.category, desc: `Restock: ${item.name} × ${need}`, qty: need, unit: item.unit, unitCost: item.cost, total: need * item.cost });
    });

    items.push({ id: 'ai-water', category: 'Water & Soft Drinks', desc: 'Evian 1.5L × ' + (gc * nights * 2), qty: gc * nights * 2, unit: 'bottle', unitCost: 3.5, total: gc * nights * 2 * 3.5 });

    const total = items.reduce((s, i) => s + i.total, 0);
    const newPR = {
      id: 'pr-' + Date.now(), charter: charterId, vessel: charter.vessel || 'v1',
      status: 'draft', created: TODAY, vendor: 'v-pf', deliveryDate: charter.start,
      notes: `Auto-generated from guest preferences — ${charter.name}. ${guests.length} guests · ${nights} nights.`,
      items,
    };
    FM.provisioningRequests = FM.provisioningRequests || [];
    FM.provisioningRequests.unshift(newPR);
    _provDetail = newPR.id;
    _tab = 'provisioning';
    render();
    showToast('Provisioning list generated — ' + USD(total), 'ok');
  };

  function _newPO(vendorId) {
    const vendorOpts = (FM.vendors||[]).map(v => `<option value="${v.id}" ${v.id === vendorId ? 'selected' : ''}>${escHtml(v.name)} (${v.category})</option>`).join('');
    const catOpts = ['Technical','Wine & Spirits','Provisioning','Interior','Fuel','Other'].map(c => `<option>${c}</option>`).join('');
    openModal(`
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="inp-group" style="grid-column:1/-1">
            <label class="inp-lbl">Vendor</label>
            <select class="inp" id="npo-vendor">${vendorOpts}</select>
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Category</label>
            <select class="inp" id="npo-cat">${catOpts}</select>
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Expected delivery</label>
            <input class="inp" id="npo-delivery" type="date">
          </div>
        </div>
        <div class="inp-group">
          <label class="inp-lbl">Notes / WO reference</label>
          <input class="inp" id="npo-notes" placeholder="e.g. For WO-007, urgent pre-charter">
        </div>
        <div id="npo-lines">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:8px">Line items</div>
          <div id="npo-line-list">
            <div class="npo-line" style="display:grid;grid-template-columns:1fr 60px 80px auto;gap:8px;margin-bottom:6px">
              <input class="inp" placeholder="Description" style="font-size:12px">
              <input class="inp" placeholder="Qty" type="number" style="font-size:12px" value="1" min="1">
              <input class="inp" placeholder="Unit $" type="number" style="font-size:12px" min="0">
              <button type="button" onclick="this.closest('.npo-line').remove()" style="background:none;border:none;cursor:pointer;color:var(--txt4);font-size:16px;padding:0 4px">×</button>
            </div>
          </div>
          <button type="button" class="btn btn-ghost btn-xs" onclick="Procurement._addPOLine()" style="margin-top:4px">+ Add line</button>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Procurement._savePO()">Create order</button>
        </div>
      </div>
    `, 'New purchase order');
  };

  const _newPOForVendor = v => _newPO(v);

  function _addPOLine() {
    const list = document.getElementById('npo-line-list');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'npo-line';
    div.style.cssText = 'display:grid;grid-template-columns:1fr 60px 80px auto;gap:8px;margin-bottom:6px';
    div.innerHTML = `<input class="inp" placeholder="Description" style="font-size:12px"><input class="inp" placeholder="Qty" type="number" style="font-size:12px" value="1" min="1"><input class="inp" placeholder="Unit $" type="number" style="font-size:12px" min="0"><button type="button" onclick="this.closest('.npo-line').remove()" style="background:none;border:none;cursor:pointer;color:var(--txt4);font-size:16px;padding:0 4px">×</button>`;
    list.appendChild(div);
  };

  function _savePO() {
    const vendorId = document.getElementById('npo-vendor')?.value;
    const cat      = document.getElementById('npo-cat')?.value;
    const delivery = document.getElementById('npo-delivery')?.value;
    const notes    = document.getElementById('npo-notes')?.value.trim() || '';
    if (!vendorId) { showToast('Select a vendor', 'error'); return; }

    const lines = [...document.querySelectorAll('#npo-line-list .npo-line')].map(row => {
      const inputs = row.querySelectorAll('input');
      const desc = inputs[0]?.value.trim();
      const qty  = parseInt(inputs[1]?.value) || 1;
      const unit = parseFloat(inputs[2]?.value) || 0;
      return desc ? { desc, partNo: '', qty, unitCost: unit, total: qty * unit } : null;
    }).filter(Boolean);

    if (!lines.length) { showToast('Add at least one line item', 'error'); return; }

    const ref = 'PO-2026-' + String((FM.purchaseOrders||[]).length + 4).padStart(3,'0');
    FM.purchaseOrders = FM.purchaseOrders || [];
    FM.purchaseOrders.unshift({
      id: 'po-' + Date.now(), vessel: App.currentVesselId === 'all' ? 'v1' : App.currentVesselId,
      vendor: vendorId, category: cat, ref, status: 'draft',
      created: TODAY, ordered: null, expected: delivery || null, received: null,
      woRef: null, notes, items: lines,
    });
    closeModal();
    _tab = 'orders';
    _poDetail = null;
    render();
    showToast('Purchase order created — ' + ref, 'ok');
  };

  function _addCellarItem() {
    const catOpts = ['Champagne','White Wine','Red Wine','Rosé Wine','Spirits','Beer','Water & Soft Drinks','Other'].map(c => `<option>${c}</option>`).join('');
    openModal(`
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="inp-group" style="grid-column:1/-1">
            <label class="inp-lbl">Name</label>
            <input class="inp" id="nc-name" placeholder="e.g. Château Margaux 2019">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Category</label>
            <select class="inp" id="nc-cat">${catOpts}</select>
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Producer</label>
            <input class="inp" id="nc-producer" placeholder="e.g. Château Margaux">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Vintage / expression</label>
            <input class="inp" id="nc-vintage" placeholder="e.g. 2019 or NV">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Region</label>
            <input class="inp" id="nc-region" placeholder="e.g. Bordeaux, France">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Qty on board</label>
            <input class="inp" id="nc-qty" type="number" value="1" min="0">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">PAR level</label>
            <input class="inp" id="nc-par" type="number" value="6" min="0">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Cost per bottle / unit ($)</label>
            <input class="inp" id="nc-cost" type="number" placeholder="0.00" min="0">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Bin location</label>
            <input class="inp" id="nc-bin" placeholder="e.g. C-E1">
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Procurement._saveCellarItem()">Add to cellar</button>
        </div>
      </div>
    `, 'Add cellar item');
  };

  function _saveCellarItem() {
    const name = document.getElementById('nc-name')?.value.trim();
    if (!name) { showToast('Enter a name', 'error'); return; }
    FM.cellar = FM.cellar || [];
    FM.cellar.push({
      id: 'cel-' + Date.now(),
      vessel: App.currentVesselId === 'all' ? 'v1' : App.currentVesselId,
      category: document.getElementById('nc-cat')?.value || 'Other',
      name,
      producer: document.getElementById('nc-producer')?.value.trim() || '',
      vintage: document.getElementById('nc-vintage')?.value.trim() || '',
      region: document.getElementById('nc-region')?.value.trim() || '',
      qty: parseInt(document.getElementById('nc-qty')?.value) || 0,
      par: parseInt(document.getElementById('nc-par')?.value) || 0,
      unit: 'bottle',
      bin: document.getElementById('nc-bin')?.value.trim() || '—',
      cost: parseFloat(document.getElementById('nc-cost')?.value) || 0,
    });
    closeModal();
    render();
    showToast(name + ' added to cellar', 'ok');
  };

  function _addVendor() {
    const catOpts = ['Technical','Provisioning','Wine & Spirits','Interior','Fuel','Other'].map(c => `<option>${c}</option>`).join('');
    openModal(`
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="inp-group" style="grid-column:1/-1">
            <label class="inp-lbl">Vendor name</label>
            <input class="inp" id="nv-name" placeholder="e.g. National Marine Suppliers">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Category</label>
            <select class="inp" id="nv-cat">${catOpts}</select>
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Location</label>
            <input class="inp" id="nv-location" placeholder="City, Country">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Contact name</label>
            <input class="inp" id="nv-contact" placeholder="Full name">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Email</label>
            <input class="inp" id="nv-email" type="email" placeholder="email@vendor.com">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Phone</label>
            <input class="inp" id="nv-phone" placeholder="+1 954 555 0000">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Lead time</label>
            <input class="inp" id="nv-lead" placeholder="e.g. 2–4 days">
          </div>
        </div>
        <div class="inp-group">
          <label class="inp-lbl">Specialty</label>
          <input class="inp" id="nv-specialty" placeholder="What they supply">
        </div>
        <div class="inp-group">
          <label class="inp-lbl">Notes</label>
          <textarea class="inp" id="nv-notes" rows="2" placeholder="Account terms, special instructions…"></textarea>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Procurement._saveVendor()">Add vendor</button>
        </div>
      </div>
    `, 'Add vendor');
  };

  function _saveVendor() {
    const name = document.getElementById('nv-name')?.value.trim();
    if (!name) { showToast('Enter vendor name', 'error'); return; }
    FM.vendors = FM.vendors || [];
    FM.vendors.push({
      id: 'v-' + Date.now(),
      name, preferred: false, rating: 4,
      category:  document.getElementById('nv-cat')?.value || 'Other',
      location:  document.getElementById('nv-location')?.value.trim() || '',
      contact:   document.getElementById('nv-contact')?.value.trim() || '',
      email:     document.getElementById('nv-email')?.value.trim() || '',
      phone:     document.getElementById('nv-phone')?.value.trim() || '',
      leadTime:  document.getElementById('nv-lead')?.value.trim() || '',
      specialty: document.getElementById('nv-specialty')?.value.trim() || '',
      notes:     document.getElementById('nv-notes')?.value.trim() || '',
    });
    closeModal();
    render();
    showToast(name + ' added', 'ok');
  };

  function _newPR() {
    const charterOpts = (FM.charters||[]).map(c => `<option value="${c.id}">${escHtml(c.name)}</option>`).join('');
    const vendorOpts  = (FM.vendors||[]).filter(v => v.category === 'Provisioning' || v.category === 'Wine & Spirits').map(v => `<option value="${v.id}">${escHtml(v.name)}</option>`).join('');
    openModal(`
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="inp-group">
          <label class="inp-lbl">Charter</label>
          <select class="inp" id="npr-charter">${charterOpts}</select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="inp-group">
            <label class="inp-lbl">Vendor</label>
            <select class="inp" id="npr-vendor"><option value="">— select later —</option>${vendorOpts}</select>
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Delivery date</label>
            <input class="inp" id="npr-delivery" type="date">
          </div>
        </div>
        <div class="inp-group">
          <label class="inp-lbl">Notes</label>
          <textarea class="inp" id="npr-notes" rows="2" placeholder="Dietary flags, special instructions…"></textarea>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Procurement._savePR()">Create request</button>
        </div>
      </div>
    `, 'New provisioning request');
  };

  function _savePR() {
    const charterId = document.getElementById('npr-charter')?.value;
    const charter = (FM.charters||[]).find(c => c.id === charterId);
    FM.provisioningRequests = FM.provisioningRequests || [];
    const newPR = {
      id: 'pr-' + Date.now(), charter: charterId, vessel: charter?.vessel || 'v1',
      status: 'draft', created: TODAY, vendor: document.getElementById('npr-vendor')?.value || null,
      deliveryDate: document.getElementById('npr-delivery')?.value || null,
      notes: document.getElementById('npr-notes')?.value.trim() || '',
      items: [],
    };
    FM.provisioningRequests.unshift(newPR);
    closeModal();
    _provDetail = newPR.id;
    _tab = 'provisioning';
    render();
    showToast('Provisioning request created', 'ok');
  };

  return {
    render,
    _setTab, _setCellarCat, _setVendorCat,
    _openPR, _closePR, _openPO, _closePO,
    _logConsumption, _orderItem, _submitQuickOrder,
    _advancePO, _advancePR, _setPRVendor, _autoGen,
    _newPO, _newPOForVendor, _addPOLine, _savePO,
    _addCellarItem, _saveCellarItem,
    _addVendor, _saveVendor,
    _newPR, _savePR,
  };
})();
