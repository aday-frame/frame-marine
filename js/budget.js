/* ── BUDGET MODULE ── */
const Budget = (() => {
  const USD  = n => '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const USDk = n => (Math.abs(n) >= 1000 ? (n < 0 ? '-' : '') + '$' + (Math.abs(n)/1000).toFixed(0) + 'k' : USD(n));
  let _editing = false;
  let _budTab  = 'budget';

  function _vessel() { return FM.currentVessel(); }

  function _charters() {
    const v = _vessel();
    return (FM.charters || []).filter(c => !v || c.vessel === v.id);
  }

  function _rows() {
    const v = _vessel();
    return (FM.budget || []).filter(b => (!v || b.vessel === v.id) && b.year === 2026);
  }

  function _charterActuals(rows) {
    const allCosts = _charters().flatMap(c => c.costs || []);
    const map = { 'Fuel & Lubricants': 0, 'Provisioning': 0, 'Port & Marina Fees': 0 };
    allCosts.forEach(e => {
      if (e.category === 'Fuel')          map['Fuel & Lubricants']  += e.amount;
      if (e.category === 'Provisioning')  map['Provisioning']        += e.amount;
      if (e.category === 'Port / marina') map['Port & Marina Fees']  += e.amount;
    });
    return map;
  }

  function _getActual(b, actuals) {
    return b.actualOverride !== null ? b.actualOverride : (actuals[b.category] || 0);
  }

  // Monthly revenue from charters (by end month, 2026 only)
  function _monthlyRev() {
    const arr = Array(12).fill(0);
    _charters().forEach(c => {
      if (!c.end || c.end < '2026-01-01') return;
      const m = parseInt(c.end.split('-')[1]) - 1;
      if (m >= 0 && m < 12) arr[m] += (c.fee || 0) + (c.apa || 0);
    });
    return arr;
  }

  function render() {
    const wrap = document.getElementById('page-budget');
    if (!wrap) return;

    const rows    = _rows();
    const actuals = _charterActuals(rows);

    const totalBudgeted = rows.reduce((s, b) => s + b.budgeted, 0);
    const totalActual   = rows.reduce((s, b) => s + _getActual(b, actuals), 0);
    const totalVariance = totalActual - totalBudgeted;

    // Revenue from charters
    const charters   = _charters().filter(c => c.end >= '2026-01-01');
    const totalRev    = charters.reduce((s, c) => s + (c.fee || 0) + (c.apa || 0), 0);
    const netPL       = totalRev - totalActual;

    const monthlyRev = _monthlyRev();
    const maxMonthRev = Math.max(...monthlyRev, 1);
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyBudget = totalBudgeted / 12;

    wrap.innerHTML = `
      <div style="padding:0 0 60px">

        <!-- Tab switcher -->
        <div style="display:flex;gap:6px;padding:16px 20px 0;border-bottom:.5px solid var(--bd);margin-bottom:0">
          <button onclick="Budget.setTab('budget')" style="padding:7px 16px;border-radius:7px 7px 0 0;border:.5px solid ${_budTab==='budget'?'var(--or)':'var(--bd)'};border-bottom:none;background:${_budTab==='budget'?'var(--bg3)':'transparent'};color:${_budTab==='budget'?'var(--txt)':'var(--txt3)'};font-size:12px;font-weight:600;cursor:pointer">Budget</button>
          <button onclick="Budget.setTab('voyages')" style="padding:7px 16px;border-radius:7px 7px 0 0;border:.5px solid ${_budTab==='voyages'?'var(--or)':'var(--bd)'};border-bottom:none;background:${_budTab==='voyages'?'var(--bg3)':'transparent'};color:${_budTab==='voyages'?'var(--txt)':'var(--txt3)'};font-size:12px;font-weight:600;cursor:pointer">Voyages</button>
        </div>

        ${_budTab === 'voyages' ? _renderVoyages() : `
        <!-- Hero KPIs -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);border-bottom:.5px solid var(--bd)">
          ${_heroKpi('Charter revenue', totalRev, 'YTD 2026 · fee + APA', 'var(--grn)', true)}
          ${_heroKpi('Operating costs', totalActual, 'actual spend year-to-date', 'var(--or)', true)}
          ${_heroKpiNet('Net P&L', netPL, totalRev)}
        </div>

        <!-- Monthly revenue chart -->
        <div style="padding:18px 20px;border-bottom:.5px solid var(--bd)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3)">Monthly charter revenue — 2026</div>
            <div style="display:flex;align-items:center;gap:14px;font-size:10px;color:var(--txt4)">
              <span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:var(--grn);display:inline-block"></span>Revenue</span>
              <span style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:rgba(249,115,22,.35);display:inline-block"></span>Monthly budget</span>
            </div>
          </div>
          <div style="display:flex;align-items:flex-end;gap:6px;height:96px">
            ${MONTHS.map((m, i) => {
              const rev = monthlyRev[i];
              const revPct = Math.round(rev / maxMonthRev * 100);
              const budPct = Math.round(monthlyBudget / maxMonthRev * 100);
              const isFuture = i > 4; // after May
              return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">
                <div style="width:100%;flex:1;display:flex;align-items:flex-end;gap:2px;position:relative;min-height:80px">
                  <div style="flex:1;height:${Math.max(revPct, 2)}%;background:${rev ? 'var(--grn)' : 'var(--bg4)'};border-radius:3px 3px 0 0;opacity:${isFuture ? '.3' : '1'};transition:height .4s;min-height:2px" title="${m}: ${USD(rev)}"></div>
                  <div style="position:absolute;bottom:0;left:0;right:0;height:${Math.max(budPct,1)}%;background:rgba(249,115,22,.18);border-radius:3px 3px 0 0;border-top:.5px dashed rgba(249,115,22,.4);pointer-events:none"></div>
                </div>
                <div style="font-size:9px;color:${rev && !isFuture ? 'var(--txt3)' : 'var(--txt4)'};font-weight:${rev && !isFuture ? '600' : '400'}">${m}</div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Budget table -->
        <div style="padding:18px 20px 4px;display:flex;align-items:center;justify-content:space-between">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3)">Operating budget · 2026</div>
          <button class="btn btn-ghost btn-sm" onclick="Budget.toggleEdit()">${_editing ? '✓ Done' : 'Edit budget'}</button>
        </div>

        <div style="padding:0 20px">
          <div class="tbl-wrap" style="border-radius:10px"><div style="border:.5px solid var(--bd);border-radius:10px;overflow:hidden;min-width:520px">
            <!-- Table header -->
            <div style="display:grid;grid-template-columns:2fr 110px 110px 100px 72px;padding:8px 16px;background:var(--bg3);border-bottom:.5px solid var(--bd)">
              ${['Category','Budgeted','Actual YTD','Variance','Used'].map((h, i) =>
                `<span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);${i>0?'text-align:right':''}">${h}</span>`
              ).join('')}
            </div>

            ${rows.map(b => {
              const actual   = _getActual(b, actuals);
              const variance = actual - b.budgeted;
              const pct      = b.budgeted > 0 ? Math.min(100, Math.round(actual / b.budgeted * 100)) : 0;
              const varClr   = variance > 0 ? 'var(--red)' : variance < 0 ? 'var(--grn)' : 'var(--txt3)';
              const barClr   = pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--yel)' : 'var(--grn)';
              return `
              <div style="display:grid;grid-template-columns:2fr 110px 110px 100px 72px;padding:11px 16px;border-bottom:.5px solid var(--bd);align-items:center">
                <div>
                  <div style="font-size:12px;font-weight:500;color:var(--txt);margin-bottom:5px">${escHtml(b.category)}</div>
                  <div style="height:3px;background:var(--bg4);border-radius:2px;overflow:hidden;max-width:200px">
                    <div style="height:100%;width:${pct}%;background:${barClr};border-radius:2px;transition:width .4s"></div>
                  </div>
                </div>
                <div style="text-align:right">
                  ${_editing
                    ? `<input style="width:88px;padding:4px 8px;background:var(--bg3);border:.5px solid var(--bd);border-radius:6px;color:var(--txt);font-size:12px;text-align:right;outline:none" id="bud-edit-${b.id}" value="${b.budgeted}" type="number" min="0">`
                    : `<span style="font-size:12px;color:var(--txt2)">${USD(b.budgeted)}</span>`}
                </div>
                <div style="text-align:right;font-size:12px;font-weight:500;color:var(--txt)">${USD(actual)}</div>
                <div style="text-align:right;font-size:12px;font-weight:600;color:${varClr}">${variance > 0 ? '+' : ''}${USD(variance)}</div>
                <div style="text-align:right;font-size:12px;font-weight:600;color:${varClr}">${pct}%</div>
              </div>`;
            }).join('')}

            <!-- Totals -->
            <div style="display:grid;grid-template-columns:2fr 110px 110px 100px 72px;padding:12px 16px;background:var(--bg3);border-top:.5px solid var(--bd)">
              <span style="font-size:12px;font-weight:700;color:var(--txt)">Total operating</span>
              <span style="text-align:right;font-size:12px;font-weight:600;color:var(--txt)">${USD(totalBudgeted)}</span>
              <span style="text-align:right;font-size:12px;font-weight:600;color:var(--txt)">${USD(totalActual)}</span>
              <span style="text-align:right;font-size:13px;font-weight:700;color:${totalVariance>0?'var(--red)':'var(--grn)'}">${totalVariance>0?'+':''}${USD(totalVariance)}</span>
              <span style="text-align:right;font-size:12px;font-weight:600;color:${totalActual>totalBudgeted?'var(--red)':'var(--grn)'}">${Math.round(totalActual/totalBudgeted*100)}%</span>
            </div>
          </div></div>

          ${_editing ? `<div style="margin-top:10px;display:flex;justify-content:flex-end"><button class="btn btn-primary btn-sm" onclick="Budget.saveBudget()">Save budget</button></div>` : ''}

          <div style="margin-top:14px;font-size:11px;color:var(--txt4);line-height:1.6">
            Fuel, Provisioning, and Port fees are pulled from charter cost records. Other categories use manually set actuals. Revenue includes charter fees and APA advances.
          </div>
        </div>
        `}
      </div>`;
  }

  function _heroKpi(label, val, sub, color, prefix) {
    return `<div style="padding:20px 24px;border-right:.5px solid var(--bd)">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt4);margin-bottom:6px">${label}</div>
      <div style="font-size:26px;font-weight:700;color:${color};letter-spacing:-.02em;margin-bottom:3px">${prefix ? '$' : ''}${val >= 0 ? val.toLocaleString() : '—'}</div>
      <div style="font-size:11px;color:var(--txt4)">${sub}</div>
    </div>`;
  }

  function _heroKpiNet(label, net, rev) {
    const pct  = rev > 0 ? Math.round(net / rev * 100) : 0;
    const clr  = net >= 0 ? 'var(--grn)' : 'var(--red)';
    return `<div style="padding:20px 24px">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt4);margin-bottom:6px">${label}</div>
      <div style="font-size:26px;font-weight:700;color:${clr};letter-spacing:-.02em;margin-bottom:3px">${net >= 0 ? '+' : ''}$${Math.abs(net).toLocaleString()}</div>
      <div style="font-size:11px;color:var(--txt4)">${pct >= 0 ? '+' : ''}${pct}% margin · after operating costs</div>
    </div>`;
  }

  function setTab(t) { _budTab = t; render(); }

  function _renderVoyages() {
    const v = _vessel();
    const voyages = (FM.voyages || []).filter(voy => !v || voy.vessel === v.id);
    const TYPE_CLR = { cruise:'var(--grn)', delivery:'var(--or)', race:'var(--blue,#60A5FA)' };
    const fmtDate = d => { if (!d) return '—'; const [,m,dy] = d.split('-'); const MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return MO[+m-1]+' '+dy; };

    if (!voyages.length) return `<div style="padding:40px 20px;text-align:center;color:var(--txt3);font-size:13px">No voyages recorded for this vessel.</div>`;

    return `<div style="padding:16px 20px 0">
      ${voyages.map(voy => {
        const total = (voy.costs||[]).reduce((s,c)=>s+c.amount,0);
        const clr = TYPE_CLR[voy.type] || 'var(--txt3)';
        return `<div style="border:.5px solid var(--bd);border-radius:10px;margin-bottom:12px;overflow:hidden">
          <div style="padding:14px 16px;border-bottom:.5px solid var(--bd);display:flex;align-items:center;gap:10px">
            <div style="flex:1">
              <div style="font-size:14px;font-weight:600;color:var(--txt);margin-bottom:2px">${escHtml(voy.name)}</div>
              <div style="font-size:11px;color:var(--txt4)">${fmtDate(voy.start)} – ${fmtDate(voy.end)}${voy.distance?' · '+voy.distance+' nm':''}</div>
            </div>
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:${clr};background:${clr}22;padding:3px 8px;border-radius:4px">${voy.type}</span>
            <div style="text-align:right">
              <div style="font-size:15px;font-weight:700;color:var(--txt)">$${total.toLocaleString()}</div>
              <div style="font-size:10px;color:var(--txt4)">total cost</div>
            </div>
          </div>
          <div style="padding:10px 16px;display:flex;flex-wrap:wrap;gap:8px">
            ${(voy.costs||[]).map(c=>`<div style="background:var(--bg3);border-radius:6px;padding:6px 10px">
              <div style="font-size:9px;color:var(--txt4);margin-bottom:2px">${escHtml(c.category)}</div>
              <div style="font-size:13px;font-weight:600;color:var(--txt)">$${c.amount.toLocaleString()}</div>
            </div>`).join('')}
          </div>
          ${voy.notes ? `<div style="padding:0 16px 12px;font-size:11px;color:var(--txt4)">${escHtml(voy.notes)}</div>` : ''}
        </div>`;
      }).join('')}
    </div>`;
  }

  function toggleEdit() {
    if (_editing) saveBudget();
    else { _editing = true; render(); }
  }

  function saveBudget() {
    _rows().forEach(b => {
      const el = document.getElementById('bud-edit-' + b.id);
      if (el) b.budgeted = parseInt(el.value) || b.budgeted;
    });
    _editing = false;
    render();
    showToast('Budget saved');
  }

  return { render, setTab, toggleEdit, saveBudget };
})();

window.Budget = Budget;
