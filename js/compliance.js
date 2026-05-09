/* ── FRAME MARINE — COMPLIANCE ENGINE ── */
'use strict';

const Compliance = window.Compliance = (() => {
  let _tab = 'overview';
  let _cat  = 'All';
  let _pscCat = 'All';

  const TODAY = '2026-05-07';

  const CAT_ORDER = ['Flag State', 'MLC 2006', 'MARPOL', 'PSC', 'LY3'];
  const CAT_COLORS = {
    'Flag State': '#60A5FA', 'MLC 2006': '#34D399', 'MARPOL': '#FACC15',
    'PSC': '#F97316', 'LY3': '#A78BFA',
  };

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    return Math.round((new Date(dateStr) - new Date(TODAY)) / 864e5);
  }
  function fmtDate(s) {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + +d + ', ' + y;
  }
  function itemStatus(item) {
    if (item.status === 'overdue') return 'overdue';
    if (!item.expiryDate) return 'current';
    const d = daysUntil(item.expiryDate);
    if (d < 0)  return 'overdue';
    if (d < 60) return 'due-soon';
    return 'current';
  }
  function statusBadge(s) {
    if (s === 'overdue')  return '<span class="badge b-high">Overdue</span>';
    if (s === 'due-soon') return '<span class="badge b-hold">Due soon</span>';
    return '<span class="badge b-done">Current</span>';
  }
  function pscBadge(s) {
    if (s === 'fail') return '<span class="badge b-high">Fail</span>';
    if (s === 'warn') return '<span class="badge b-hold">Action</span>';
    return '<span class="badge b-done">✓</span>';
  }

  function vesselItems() {
    const vid = App.currentVesselId === 'all' ? 'v1' : App.currentVesselId;
    return (FM.complianceItems || []).filter(i => i.vessel === vid);
  }

  /* ── ENTRY POINT ── */
  function render() {
    const wrap = document.getElementById('page-compliance');
    if (!wrap) return;

    const items   = vesselItems();
    const overdue = items.filter(i => itemStatus(i) === 'overdue');
    const dueSoon = items.filter(i => itemStatus(i) === 'due-soon');
    const current = items.filter(i => itemStatus(i) === 'current');
    const psc     = FM.pscChecklist || [];
    const pscFail = psc.filter(p => p.status === 'fail').length;
    const pscWarn = psc.filter(p => p.status === 'warn').length;
    const pscOk   = psc.filter(p => p.status === 'ok').length;

    const tabs = ['overview', 'certificates', 'psc', 'mlc', 'marpol', 'flags'];
    const tabLabels = {
      overview:     'Overview',
      certificates: `Certificates${overdue.length + dueSoon.length ? ` (${overdue.length + dueSoon.length})` : ''}`,
      psc:          `PSC Prep${pscFail + pscWarn ? ` (${pscFail + pscWarn})` : ''}`,
      mlc:          'MLC 2006',
      marpol:       'MARPOL',
      flags:        'Courtesy Flags',
    };
    const tabBar = tabs.map(t =>
      `<button class="tab-btn ${_tab === t ? 'tab-btn-active' : ''}" onclick="Compliance._setTab('${t}')">${tabLabels[t]}</button>`
    ).join('');

    let content = '';
    if (_tab === 'overview')     content = _renderOverview(items, overdue, dueSoon, pscFail, pscWarn, pscOk);
    if (_tab === 'certificates') content = _renderCerts(items);
    if (_tab === 'psc')          content = _renderPSC(psc);
    if (_tab === 'mlc')          content = _renderMLC(items.filter(i => i.category === 'MLC 2006'));
    if (_tab === 'marpol')       content = _renderMARPOL(items.filter(i => i.category === 'MARPOL'));
    if (_tab === 'flags')        content = _renderFlags();

    const scoreNum = Math.round(pscOk / Math.max(psc.length, 1) * 100);
    const scoreColor = pscFail ? 'var(--red)' : pscWarn ? 'var(--or)' : 'var(--green)';

    wrap.innerHTML = `
      <div style="padding:0 0 80px">
        <div class="stat-5" style="display:grid;grid-template-columns:repeat(5,1fr);border-bottom:.5px solid var(--bd)">
          <div class="wo-stat"><div class="wo-stat-num" style="color:${overdue.length ? 'var(--red)' : 'var(--txt)'}">${overdue.length}</div><div class="wo-stat-lbl">Overdue</div></div>
          <div class="wo-stat"><div class="wo-stat-num" style="color:${dueSoon.length ? 'var(--or)' : 'var(--txt)'}">${dueSoon.length}</div><div class="wo-stat-lbl">Due &lt;60 days</div></div>
          <div class="wo-stat"><div class="wo-stat-num">${current.length}</div><div class="wo-stat-lbl">Current</div></div>
          <div class="wo-stat"><div class="wo-stat-num" style="color:${scoreColor}">${scoreNum}%</div><div class="wo-stat-lbl">PSC score</div></div>
          <div class="wo-stat" style="border-right:none"><div class="wo-stat-num">${escHtml(FM.flagState?.flag || '—')}</div><div class="wo-stat-lbl" style="font-size:9px">Flag state</div></div>
        </div>
        <div style="display:flex;gap:4px;padding:0 20px;border-bottom:.5px solid var(--bd);overflow-x:auto">${tabBar}</div>
        <div style="padding:20px">${content}</div>
      </div>`;
  }

  /* ── OVERVIEW ── */
  function _renderOverview(items, overdue, dueSoon, pscFail, pscWarn, pscOk) {
    const fs = FM.flagState || {};
    const flagCard = `
      <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:16px 20px;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <div style="width:36px;height:36px;background:linear-gradient(135deg,#1d4ed8,#60A5FA);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px">🏴</div>
          <div>
            <div style="font-size:14px;font-weight:600;color:var(--txt)">${escHtml(fs.flag || '—')}</div>
            <div style="font-size:11px;color:var(--txt3)">${escHtml(fs.authority || '—')}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
          <div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4)">IMO Number</div><div style="font-size:12px;color:var(--txt);font-family:var(--mono)">${escHtml(fs.imo || '—')}</div></div>
          <div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4)">Call Sign</div><div style="font-size:12px;color:var(--txt);font-family:var(--mono)">${escHtml(fs.callSign || '—')}</div></div>
          <div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4)">Class Society</div><div style="font-size:12px;color:var(--txt)">${escHtml(fs.surveyor || '—')}</div></div>
          <div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4)">Gross Tonnage</div><div style="font-size:12px;color:var(--txt)">${fs.grossTonnage || '—'} GT</div></div>
          <div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4)">MMSI</div><div style="font-size:12px;color:var(--txt);font-family:var(--mono)">${escHtml(fs.mmsi || '—')}</div></div>
          <div><div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4)">Port of Registry</div><div style="font-size:12px;color:var(--txt)">${escHtml(fs.certPort || '—')}</div></div>
        </div>
      </div>`;

    const alerts = [...overdue, ...dueSoon].map(item => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:.5px solid var(--bd)">
        <div style="width:8px;height:8px;border-radius:50%;background:${itemStatus(item) === 'overdue' ? 'var(--red)' : 'var(--or)'};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:500;color:var(--txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(item.title)}</div>
          <div style="font-size:10px;color:var(--txt4)">${escHtml(item.category)} · ${item.expiryDate ? 'Expires ' + fmtDate(item.expiryDate) : 'Review required'}</div>
        </div>
        ${statusBadge(itemStatus(item))}
        <button class="btn btn-ghost btn-xs" onclick="Compliance._setTab('certificates')">View</button>
      </div>`).join('') || '<div style="font-size:12px;color:var(--txt3);padding:16px 0">No items requiring immediate action.</div>';

    const pscRow = `
      <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:16px 20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div style="font-size:13px;font-weight:600;color:var(--txt)">PSC Readiness</div>
          <button class="btn btn-ghost btn-xs" onclick="Compliance._setTab('psc')">Full checklist →</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center">
          <div style="background:${pscFail ? 'rgba(248,113,113,.1)' : 'var(--bg2)'};border-radius:8px;padding:12px 8px">
            <div style="font-size:22px;font-weight:300;color:${pscFail ? 'var(--red)' : 'var(--txt3)'}">${pscFail}</div>
            <div style="font-size:10px;color:var(--txt4)">Must fix</div>
          </div>
          <div style="background:${pscWarn ? 'rgba(251,191,36,.1)' : 'var(--bg2)'};border-radius:8px;padding:12px 8px">
            <div style="font-size:22px;font-weight:300;color:${pscWarn ? 'var(--or)' : 'var(--txt3)'}">${pscWarn}</div>
            <div style="font-size:10px;color:var(--txt4)">Action needed</div>
          </div>
          <div style="background:rgba(52,211,153,.1);border-radius:8px;padding:12px 8px">
            <div style="font-size:22px;font-weight:300;color:var(--green)">${pscOk}</div>
            <div style="font-size:10px;color:var(--txt4)">Ready</div>
          </div>
        </div>
      </div>`;

    const catSummary = CAT_ORDER.map(cat => {
      const catItems = items.filter(i => i.category === cat);
      const catOv = catItems.filter(i => itemStatus(i) === 'overdue').length;
      const catDs = catItems.filter(i => itemStatus(i) === 'due-soon').length;
      const color = catOv ? 'var(--red)' : catDs ? 'var(--or)' : 'var(--green)';
      const label = catOv ? `${catOv} overdue` : catDs ? `${catDs} due soon` : 'All current';
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:.5px solid var(--bd)">
          <div style="width:8px;height:8px;border-radius:50%;background:${CAT_COLORS[cat] || 'var(--txt3)'};flex-shrink:0"></div>
          <div style="flex:1;font-size:12px;font-weight:500;color:var(--txt)">${cat}</div>
          <div style="font-size:11px;color:${color}">${label}</div>
          <div style="font-size:10px;color:var(--txt4)">${catItems.length} items</div>
        </div>`;
    }).join('');

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
        <div>
          ${flagCard}
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:10px">Compliance categories</div>
          <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:0 16px">${catSummary}</div>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:10px">Action required</div>
          <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:0 16px;margin-bottom:20px">${alerts}</div>
          ${pscRow}
        </div>
      </div>`;
  }

  /* ── CERTIFICATES ── */
  function _renderCerts(items) {
    const cats = ['All', ...CAT_ORDER];
    const pills = cats.map(c =>
      `<button class="pill ${_cat === c ? 'pill-active' : ''}" onclick="Compliance._setCat('${c}')">${c}</button>`
    ).join('');

    const filtered = _cat === 'All' ? items : items.filter(i => i.category === _cat);
    const sorted = [...filtered].sort((a, b) => {
      const sa = itemStatus(a), sb = itemStatus(b);
      const order = { overdue: 0, 'due-soon': 1, current: 2 };
      return (order[sa] ?? 3) - (order[sb] ?? 3);
    });

    const rows = sorted.map(item => {
      const st = itemStatus(item);
      const d  = item.expiryDate ? daysUntil(item.expiryDate) : null;
      const dLabel = d === null ? '—' : d < 0 ? `${Math.abs(d)}d overdue` : `${d}d`;
      const dColor = st === 'overdue' ? 'var(--red)' : st === 'due-soon' ? 'var(--or)' : 'var(--txt3)';
      return `
        <div style="display:grid;grid-template-columns:14px 1fr auto auto auto;gap:12px;align-items:center;padding:12px 0;border-bottom:.5px solid var(--bd)">
          <div style="width:8px;height:8px;border-radius:50%;background:${CAT_COLORS[item.category] || 'var(--txt3)'}"></div>
          <div>
            <div style="font-size:12px;font-weight:500;color:var(--txt)">${escHtml(item.title)}</div>
            <div style="font-size:10px;color:var(--txt4)">${escHtml(item.ref)} · ${escHtml(item.authority)}</div>
            ${item.notes ? `<div style="font-size:10px;color:var(--txt3);margin-top:2px">${escHtml(item.notes)}</div>` : ''}
          </div>
          <div style="text-align:right;min-width:80px">
            <div style="font-size:11px;color:var(--txt3)">${item.expiryDate ? fmtDate(item.expiryDate) : 'No expiry'}</div>
            <div style="font-size:10px;color:${dColor}">${dLabel}</div>
          </div>
          ${statusBadge(st)}
          <button class="btn btn-ghost btn-xs" onclick="Compliance._editItem('${item.id}')">Edit</button>
        </div>`;
    }).join('') || '<div style="font-size:12px;color:var(--txt3);padding:20px 0">No items in this category.</div>';

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
        <div style="display:flex;gap:6px;flex-wrap:wrap">${pills}</div>
        <button class="btn btn-primary btn-sm" onclick="Compliance._addItem()">+ Add certificate</button>
      </div>
      <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:0 16px">${rows}</div>`;
  }

  /* ── PSC PREP ── */
  function _renderPSC(psc) {
    const cats = ['All', ...new Set(psc.map(p => p.category))];
    const pills = cats.map(c =>
      `<button class="pill ${_pscCat === c ? 'pill-active' : ''}" onclick="Compliance._setPSCCat('${c}')">${c}</button>`
    ).join('');

    const filtered = _pscCat === 'All' ? psc : psc.filter(p => p.category === _pscCat);
    const fail = filtered.filter(p => p.status === 'fail').length;
    const warn = filtered.filter(p => p.status === 'warn').length;
    const ok   = filtered.filter(p => p.status === 'ok').length;

    const rows = filtered.map(item => `
      <div style="display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:10px 0;border-bottom:.5px solid var(--bd)">
        <div>
          <div style="font-size:12px;font-weight:500;color:var(--txt)">${escHtml(item.item)}</div>
          ${item.notes ? `<div style="font-size:10px;color:${item.status === 'fail' ? 'var(--red)' : item.status === 'warn' ? 'var(--or)' : 'var(--txt4)'}">${escHtml(item.notes)}</div>` : ''}
        </div>
        ${pscBadge(item.status)}
        <select class="inp" style="font-size:11px;padding:3px 6px;width:90px;height:26px" onchange="Compliance._updatePSC('${item.id}',this.value)">
          <option value="ok"   ${item.status === 'ok'   ? 'selected' : ''}>✓ Ready</option>
          <option value="warn" ${item.status === 'warn' ? 'selected' : ''}>⚠ Action</option>
          <option value="fail" ${item.status === 'fail' ? 'selected' : ''}>✗ Fail</option>
        </select>
      </div>`).join('');

    const lastPSC = (FM.complianceItems || []).find(i => i.category === 'PSC' && i.title.startsWith('Last PSC'));

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
        <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:16px">
          <div style="font-size:12px;font-weight:600;color:var(--txt);margin-bottom:10px">Last inspection</div>
          ${lastPSC ? `
            <div style="font-size:11px;color:var(--txt3);margin-bottom:4px">${escHtml(lastPSC.authority)}</div>
            <div style="font-size:11px;color:var(--txt)">${fmtDate(lastPSC.issueDate)}</div>
            <div style="font-size:11px;color:var(--green);margin-top:6px">${escHtml(lastPSC.notes)}</div>
          ` : '<div style="font-size:11px;color:var(--txt3)">No inspection on record</div>'}
        </div>
        <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:16px">
          <div style="font-size:12px;font-weight:600;color:var(--txt);margin-bottom:10px">Current readiness</div>
          <div style="display:flex;gap:16px">
            <div style="text-align:center"><div style="font-size:20px;color:${fail ? 'var(--red)' : 'var(--txt3)'}">${fail}</div><div style="font-size:9px;color:var(--txt4)">Fail</div></div>
            <div style="text-align:center"><div style="font-size:20px;color:${warn ? 'var(--or)' : 'var(--txt3)'}">${warn}</div><div style="font-size:9px;color:var(--txt4)">Action</div></div>
            <div style="text-align:center"><div style="font-size:20px;color:var(--green)">${ok}</div><div style="font-size:9px;color:var(--txt4)">Ready</div></div>
          </div>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <div style="display:flex;gap:6px;flex-wrap:wrap">${pills}</div>
      </div>
      <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:0 16px">${rows}</div>`;
  }

  /* ── MLC 2006 ── */
  function _renderMLC(mlcItems) {
    const hoursData = _buildHoursCompliance();
    const crewRows  = (FM.crew || []).map(c => {
      const hd   = hoursData[c.id] || { violations: 0, avgRest: 11 };
      const viol = hd.violations;
      const color = viol > 2 ? 'var(--red)' : viol > 0 ? 'var(--or)' : 'var(--green)';
      return `
        <div style="display:grid;grid-template-columns:28px 1fr auto auto;gap:10px;align-items:center;padding:10px 0;border-bottom:.5px solid var(--bd)">
          <div class="crew-av" style="width:28px;height:28px;font-size:10px;background:${c.color}">${c.initials}</div>
          <div>
            <div style="font-size:12px;font-weight:500;color:var(--txt)">${escHtml(c.name)}</div>
            <div style="font-size:10px;color:var(--txt4)">${escHtml(c.role)}</div>
          </div>
          <div style="font-size:11px;color:${color};text-align:right">${viol > 0 ? viol + ' violation' + (viol !== 1 ? 's' : '') : 'Compliant'}</div>
          <div style="font-size:10px;color:var(--txt4)">${hd.avgRest}h avg rest</div>
        </div>`;
    }).join('');

    const certRows = mlcItems.map(item => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:.5px solid var(--bd)">
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:500;color:var(--txt)">${escHtml(item.title)}</div>
          <div style="font-size:10px;color:var(--txt4)">${escHtml(item.ref)} · ${item.expiryDate ? 'Exp: ' + fmtDate(item.expiryDate) : 'Ongoing'}</div>
          ${item.notes ? `<div style="font-size:10px;color:var(--txt3);margin-top:2px">${escHtml(item.notes)}</div>` : ''}
        </div>
        ${statusBadge(itemStatus(item))}
      </div>`).join('');

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:10px">MLC certificates & documents</div>
          <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:0 16px;margin-bottom:20px">${certRows}</div>
          <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:16px">
            <div style="font-size:12px;font-weight:600;color:var(--txt);margin-bottom:8px">MLC Standard requirements (GT ≤500)</div>
            ${[
              ['Title 1', 'Minimum age — 16 yrs (18 for watch), no night work under 18', true],
              ['Title 2', 'SEAs signed — 12-month max term for offshore voyages', true],
              ['Title 3', 'Accommodation — compliant with Reg 3.1 cabin sizes', true],
              ['Title 3', 'Food & catering — nutritional and dietary requirements met', true],
              ['Title 4', 'Medical care — first aid kit, medical guide on board', true],
              ['Title 4', 'Repatriation — policy documented, costs covered by owner', true],
              ['Title 5', 'ISM integrated with MLC requirements', true],
            ].map(([cat, req, ok]) => `
              <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:.5px solid var(--bd)">
                <span class="badge" style="background:var(--bg4);color:var(--txt4);font-size:9px;padding:1px 5px;white-space:nowrap">${cat}</span>
                <div style="flex:1;font-size:11px;color:var(--txt)">${req}</div>
                <span class="badge ${ok ? 'b-done' : 'b-high'}">${ok ? '✓' : '✗'}</span>
              </div>`).join('')}
          </div>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:10px">Hours of rest compliance — last 7 days</div>
          <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:0 16px;margin-bottom:16px">${crewRows}</div>
          <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:16px">
            <div style="font-size:12px;font-weight:600;color:var(--txt);margin-bottom:10px">STCW / ILO 180 limits</div>
            ${[
              ['Min rest in 24h', '10 hours (max 14h work)'],
              ['Min rest in 77h', '77 hours (any 7-day period)'],
              ['Max work in 24h', '14 hours'],
              ['Max work in 77h', '72 hours'],
              ['Rest periods', 'No more than 2 splits (minimum 6h in one period)'],
            ].map(([rule, val]) => `
              <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:.5px solid var(--bd)">
                <div style="font-size:11px;color:var(--txt)">${rule}</div>
                <div style="font-size:11px;color:var(--txt3);font-family:var(--mono)">${val}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  /* ── MARPOL ── */
  function _renderMARPOL(marpolItems) {
    const certRows = marpolItems.map(item => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:.5px solid var(--bd)">
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:500;color:var(--txt)">${escHtml(item.title)}</div>
          <div style="font-size:10px;color:var(--txt4)">${escHtml(item.ref)} · ${item.expiryDate ? 'Exp: ' + fmtDate(item.expiryDate) : 'Ongoing'}</div>
          ${item.notes ? `<div style="font-size:10px;color:var(--txt3);margin-top:2px">${escHtml(item.notes)}</div>` : ''}
        </div>
        ${statusBadge(itemStatus(item))}
      </div>`).join('');

    const annexes = [
      { ann: 'I', title: 'Oil pollution prevention', icon: '🛢️', status: 'ok', detail: 'IOPP Certificate current. ORB maintained. Bilge separator fitted. 15ppm overboard limit enforced.' },
      { ann: 'II', title: 'Noxious liquid substances', icon: '⚗️', status: 'na', detail: 'Not applicable — no NLS carried on a commercial yacht.' },
      { ann: 'IV', title: 'Sewage pollution prevention', icon: '🚿', status: 'ok', detail: 'ISPP Certificate current. Marine sanitation device fitted. No discharge in territorial waters or within 3nm.' },
      { ann: 'V', title: 'Garbage management', icon: '♻️', status: 'ok', detail: 'Garbage Management Plan on board. Segregated bins — food, plastic, paper, glass. Shore reception used in all ports.' },
      { ann: 'VI', title: 'Air pollution prevention', icon: '💨', status: 'ok', detail: 'Diesel engines compliant with Tier II NOx limits. Sulphur content compliant. No ODS refrigerants.' },
    ];

    const annexRows = annexes.map(a => `
      <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:.5px solid var(--bd)">
        <div style="font-size:20px;width:32px;text-align:center;flex-shrink:0">${a.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
            <span style="font-size:10px;font-weight:700;color:var(--txt4);font-family:var(--mono)">Annex ${a.ann}</span>
            <span style="font-size:12px;font-weight:500;color:var(--txt)">${a.title}</span>
          </div>
          <div style="font-size:11px;color:var(--txt3)">${a.detail}</div>
        </div>
        <span class="badge ${a.status === 'ok' ? 'b-done' : 'b-hold'}">${a.status === 'ok' ? 'Compliant' : 'N/A'}</span>
      </div>`).join('');

    return `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start">
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:10px">MARPOL certificates</div>
          <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:0 16px">${certRows}</div>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:10px">MARPOL annexes compliance</div>
          <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:0 16px">${annexRows}</div>
        </div>
      </div>`;
  }

  /* ── HOURS COMPLIANCE HELPER ── */
  function _buildHoursCompliance() {
    const result = {};
    (FM.crew || []).forEach(c => {
      const entries = (FM.hoursLog || []).filter(h => h.crew === c.id);
      let violations = 0;
      const rests = entries.map(h => h.restHours || 10);
      const avgRest = rests.length ? Math.round(rests.reduce((a,b) => a+b, 0) / rests.length) : 11;
      entries.forEach(h => { if ((h.restHours || 10) < 10) violations++; });
      result[c.id] = { violations, avgRest };
    });
    return result;
  }

  /* ── COURTESY FLAGS ── */
  function _renderFlags() {
    const regions = [
      { name: 'Mediterranean', flags: [
        { emoji: '🇫🇷', name: 'France' }, { emoji: '🇪🇸', name: 'Spain' }, { emoji: '🇮🇹', name: 'Italy' },
        { emoji: '🇬🇷', name: 'Greece' }, { emoji: '🇭🇷', name: 'Croatia' }, { emoji: '🇲🇪', name: 'Montenegro' },
        { emoji: '🇸🇮', name: 'Slovenia' }, { emoji: '🇦🇱', name: 'Albania' }, { emoji: '🇲🇹', name: 'Malta' },
        { emoji: '🇲🇨', name: 'Monaco' }, { emoji: '🇨🇾', name: 'Cyprus' }, { emoji: '🇹🇷', name: 'Turkey' },
        { emoji: '🇬🇮', name: 'Gibraltar' }, { emoji: '🇲🇦', name: 'Morocco' }, { emoji: '🇹🇳', name: 'Tunisia' },
        { emoji: '🇱🇾', name: 'Libya' }, { emoji: '🇪🇬', name: 'Egypt' }, { emoji: '🇮🇱', name: 'Israel' },
        { emoji: '🇱🇧', name: 'Lebanon' },
      ]},
      { name: 'North Atlantic & Northern Europe', flags: [
        { emoji: '🇬🇧', name: 'United Kingdom' }, { emoji: '🇵🇹', name: 'Portugal' }, { emoji: '🇮🇪', name: 'Ireland' },
        { emoji: '🇳🇱', name: 'Netherlands' }, { emoji: '🇧🇪', name: 'Belgium' }, { emoji: '🇩🇪', name: 'Germany' },
        { emoji: '🇩🇰', name: 'Denmark' }, { emoji: '🇸🇪', name: 'Sweden' }, { emoji: '🇳🇴', name: 'Norway' },
        { emoji: '🇫🇮', name: 'Finland' }, { emoji: '🇮🇸', name: 'Iceland' },
      ]},
      { name: 'Caribbean', flags: [
        { emoji: '🇧🇸', name: 'Bahamas' }, { emoji: '🇨🇺', name: 'Cuba' }, { emoji: '🇯🇲', name: 'Jamaica' },
        { emoji: '🇩🇴', name: 'Dominican Republic' }, { emoji: '🇭🇹', name: 'Haiti' },
        { emoji: '🇵🇷', name: 'Puerto Rico' }, { emoji: '🇻🇮', name: 'US Virgin Islands' },
        { emoji: '🇻🇬', name: 'British Virgin Islands' }, { emoji: '🇦🇬', name: 'Antigua & Barbuda' },
        { emoji: '🇰🇳', name: 'St Kitts & Nevis' }, { emoji: '🇱🇨', name: 'Saint Lucia' },
        { emoji: '🇻🇨', name: 'St Vincent & Grenadines' }, { emoji: '🇬🇩', name: 'Grenada' },
        { emoji: '🇧🇧', name: 'Barbados' }, { emoji: '🇹🇹', name: 'Trinidad & Tobago' },
        { emoji: '🇲🇶', name: 'Martinique (FR)' }, { emoji: '🇬🇵', name: 'Guadeloupe (FR)' },
        { emoji: '🇸🇽', name: 'Sint Maarten' }, { emoji: '🇨🇼', name: 'Curaçao' },
        { emoji: '🇧🇿', name: 'Belize' }, { emoji: '🇵🇦', name: 'Panama' },
      ]},
      { name: 'Americas', flags: [
        { emoji: '🇺🇸', name: 'United States' }, { emoji: '🇨🇦', name: 'Canada' }, { emoji: '🇲🇽', name: 'Mexico' },
        { emoji: '🇨🇴', name: 'Colombia' }, { emoji: '🇻🇪', name: 'Venezuela' }, { emoji: '🇧🇷', name: 'Brazil' },
        { emoji: '🇦🇷', name: 'Argentina' }, { emoji: '🇺🇾', name: 'Uruguay' }, { emoji: '🇨🇱', name: 'Chile' },
        { emoji: '🇵🇪', name: 'Peru' }, { emoji: '🇪🇨', name: 'Ecuador' },
      ]},
      { name: 'Middle East & Indian Ocean', flags: [
        { emoji: '🇦🇪', name: 'UAE' }, { emoji: '🇴🇲', name: 'Oman' }, { emoji: '🇧🇭', name: 'Bahrain' },
        { emoji: '🇶🇦', name: 'Qatar' }, { emoji: '🇸🇦', name: 'Saudi Arabia' }, { emoji: '🇯🇴', name: 'Jordan' },
        { emoji: '🇸🇨', name: 'Seychelles' }, { emoji: '🇲🇺', name: 'Mauritius' }, { emoji: '🇲🇻', name: 'Maldives' },
        { emoji: '🇰🇪', name: 'Kenya' }, { emoji: '🇹🇿', name: 'Tanzania' }, { emoji: '🇿🇦', name: 'South Africa' },
        { emoji: '🇲🇬', name: 'Madagascar' }, { emoji: '🇲🇿', name: 'Mozambique' },
      ]},
      { name: 'Asia-Pacific', flags: [
        { emoji: '🇸🇬', name: 'Singapore' }, { emoji: '🇹🇭', name: 'Thailand' }, { emoji: '🇲🇾', name: 'Malaysia' },
        { emoji: '🇮🇩', name: 'Indonesia' }, { emoji: '🇵🇭', name: 'Philippines' }, { emoji: '🇻🇳', name: 'Vietnam' },
        { emoji: '🇯🇵', name: 'Japan' }, { emoji: '🇨🇳', name: 'China' }, { emoji: '🇭🇰', name: 'Hong Kong' },
        { emoji: '🇰🇷', name: 'South Korea' }, { emoji: '🇦🇺', name: 'Australia' }, { emoji: '🇳🇿', name: 'New Zealand' },
        { emoji: '🇫🇯', name: 'Fiji' }, { emoji: '🇵🇫', name: 'French Polynesia' },
      ]},
    ];

    return `
      <div style="margin-bottom:12px;padding:10px 14px;background:rgba(249,115,22,.07);border:.5px solid rgba(249,115,22,.2);border-radius:8px;font-size:12px;color:var(--txt2);line-height:1.5">
        <strong style="color:var(--or)">Courtesy flag protocol:</strong> Fly the courtesy flag of the nation whose territorial waters you are in, from the starboard spreader or yardarm. Replace promptly upon entry. Do not fly a courtesy flag in international waters.
      </div>
      ${regions.map(r => `
        <div style="margin-bottom:24px">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:10px;padding-bottom:8px;border-bottom:.5px solid var(--bd)">${r.name}</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px">
            ${[...r.flags].sort((a,b) => a.name.localeCompare(b.name)).map(f => `
              <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px">
                <span style="font-size:22px;line-height:1;flex-shrink:0">${f.emoji}</span>
                <span style="font-size:11px;color:var(--txt2);line-height:1.3">${f.name}</span>
              </div>`).join('')}
          </div>
        </div>`).join('')}`;
  }

  /* ── ACTIONS ── */
  const _setTab    = t => { _tab = t; render(); };
  const _setCat    = c => { _cat = c; render(); };
  const _setPSCCat = c => { _pscCat = c; render(); };

  function _updatePSC(id, status) {
    const item = (FM.pscChecklist || []).find(p => p.id === id);
    if (item) { item.status = status; render(); }
  }

  function _editItem(id) {
    const item = (FM.complianceItems || []).find(i => i.id === id);
    if (!item) return;
    openModal(`
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="inp-group">
          <label class="inp-lbl">Notes / status update</label>
          <textarea class="inp" id="ci-notes" rows="3">${escHtml(item.notes || '')}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="inp-group">
            <label class="inp-lbl">Expiry date</label>
            <input class="inp" id="ci-expiry" type="date" value="${item.expiryDate || ''}">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Survey due</label>
            <input class="inp" id="ci-survey" type="date" value="${item.surveyDue || ''}">
          </div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Compliance._saveItem('${id}')">Save</button>
        </div>
      </div>
    `, escHtml(item.title));
  }

  function _saveItem(id) {
    const item = (FM.complianceItems || []).find(i => i.id === id);
    if (!item) return;
    item.notes     = document.getElementById('ci-notes')?.value.trim() || item.notes;
    item.expiryDate = document.getElementById('ci-expiry')?.value || item.expiryDate;
    item.surveyDue  = document.getElementById('ci-survey')?.value || item.surveyDue;
    closeModal();
    render();
    showToast('Certificate updated', 'ok');
  }

  function _addItem() {
    const catOpts = CAT_ORDER.map(c => `<option>${c}</option>`).join('');
    openModal(`
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="inp-group" style="grid-column:1/-1">
            <label class="inp-lbl">Certificate / document title</label>
            <input class="inp" id="nci-title" placeholder="e.g. Safety Management Certificate">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Category</label>
            <select class="inp" id="nci-cat">${catOpts}</select>
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Reference number</label>
            <input class="inp" id="nci-ref" placeholder="e.g. SMC-KY-2026-001">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Issuing authority</label>
            <input class="inp" id="nci-auth" placeholder="e.g. Bureau Veritas">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Issue date</label>
            <input class="inp" id="nci-issue" type="date">
          </div>
          <div class="inp-group">
            <label class="inp-lbl">Expiry date</label>
            <input class="inp" id="nci-expiry" type="date">
          </div>
        </div>
        <div class="inp-group">
          <label class="inp-lbl">Notes</label>
          <textarea class="inp" id="nci-notes" rows="2" placeholder="Renewal conditions, survey requirements…"></textarea>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Compliance._saveNewItem()">Add certificate</button>
        </div>
      </div>
    `, 'Add compliance item');
  }

  function _saveNewItem() {
    const title = document.getElementById('nci-title')?.value.trim();
    if (!title) { showToast('Enter a title', 'error'); return; }
    FM.complianceItems = FM.complianceItems || [];
    const vid = App.currentVesselId === 'all' ? 'v1' : App.currentVesselId;
    FM.complianceItems.push({
      id: 'ci-' + Date.now(), vessel: vid,
      category:   document.getElementById('nci-cat')?.value || 'Flag State',
      title,
      ref:        document.getElementById('nci-ref')?.value.trim() || '',
      issueDate:  document.getElementById('nci-issue')?.value || null,
      expiryDate: document.getElementById('nci-expiry')?.value || null,
      authority:  document.getElementById('nci-auth')?.value.trim() || '',
      surveyDue:  null, status: 'current',
      notes:      document.getElementById('nci-notes')?.value.trim() || '',
      docs: [],
    });
    closeModal();
    render();
    showToast(title + ' added', 'ok');
  }

  return {
    render,
    _setTab, _setCat, _setPSCCat,
    _updatePSC, _editItem, _saveItem,
    _addItem, _saveNewItem,
  };
})();
