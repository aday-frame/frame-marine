/* ── BUDGET MODULE ── */
const Budget = (() => {
  const USD = n => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits:0, maximumFractionDigits:0 });
  let _editing = false;

  function _vessel() { return FM.currentVessel(); }

  function _actuals(year) {
    const v = _vessel();
    const vid = v ? v.id : null;
    const charters = (FM.charters || []).filter(c => (!vid || c.vessel === vid) && c.end >= year + '-01-01' && c.start <= year + '-12-31');
    const allCosts = charters.flatMap(c => c.costs || []);

    const catMap = { 'Fuel & Lubricants': 0, 'Provisioning': 0, 'Port & Marina Fees': 0 };
    allCosts.forEach(e => {
      if (e.category === 'Fuel')          catMap['Fuel & Lubricants']  = (catMap['Fuel & Lubricants']  || 0) + e.amount;
      if (e.category === 'Provisioning')  catMap['Provisioning']        = (catMap['Provisioning']        || 0) + e.amount;
      if (e.category === 'Port / marina') catMap['Port & Marina Fees']  = (catMap['Port & Marina Fees']  || 0) + e.amount;
    });
    return catMap;
  }

  function render() {
    const wrap = document.getElementById('page-budget');
    if (!wrap) return;
    const v   = _vessel();
    const vid = v ? v.id : null;
    const year = 2026;
    const rows  = (FM.budget || []).filter(b => (!vid || b.vessel === vid) && b.year === year);
    const actuals = _actuals(year);

    const totalBudgeted = rows.reduce((s, b) => s + b.budgeted, 0);
    const totalActual   = rows.reduce((s, b) => {
      const a = b.actualOverride !== null ? b.actualOverride : (actuals[b.category] || 0);
      return s + a;
    }, 0);
    const totalVariance = totalActual - totalBudgeted;

    wrap.innerHTML = `
      <div style="padding:18px 20px 48px">

        <!-- Actions -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <span style="font-size:11px;color:var(--txt3)">YTD ${year} · ${v ? v.name : 'All vessels'}</span>
          <button class="btn btn-ghost btn-sm" onclick="Budget.toggleEdit()">${_editing ? '✓ Done' : 'Edit budget'}</button>
        </div>

        <!-- KPIs -->
        <div class="kpi-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:28px">
          ${_kpi('Total budgeted', USD(totalBudgeted), 'annual operating budget')}
          ${_kpi('Spent YTD',      USD(totalActual),   'actual spend year-to-date', totalActual > totalBudgeted ? 'var(--red)' : 'var(--txt)')}
          ${_kpi(totalVariance >= 0 ? 'Over budget' : 'Under budget',
            (totalVariance >= 0 ? '+' : '') + USD(totalVariance),
            Math.round(Math.abs(totalVariance) / totalBudgeted * 100) + '% of budget',
            totalVariance > 0 ? 'var(--red)' : 'var(--grn)')}
        </div>

        <!-- Budget rows -->
        <div class="tbl-scroll" style="border-radius:10px;border:.5px solid var(--bd)">
        <div style="background:var(--bg2);border-radius:10px;overflow:hidden;min-width:520px">
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 90px;padding:8px 16px;background:var(--bg3);border-bottom:.5px solid var(--bd)">
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3)">Category</span>
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);text-align:right">Budget</span>
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);text-align:right">Actual</span>
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);text-align:right">Variance</span>
            <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);text-align:center">Used</span>
          </div>

          ${rows.map(b => {
            const actual   = b.actualOverride !== null ? b.actualOverride : (actuals[b.category] || 0);
            const variance = actual - b.budgeted;
            const pct      = b.budgeted > 0 ? Math.min(100, Math.round(actual / b.budgeted * 100)) : 0;
            const varColor = variance > 0 ? 'var(--red)' : variance < 0 ? 'var(--grn)' : 'var(--txt3)';
            const barColor = pct > 90 ? '#F87171' : pct > 70 ? '#FBBF24' : '#4ADE80';
            return `
            <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 90px;padding:12px 16px;border-bottom:.5px solid var(--bd);align-items:center">
              <div>
                <div style="font-size:12px;font-weight:500;color:var(--txt);margin-bottom:5px">${escHtml(b.category)}</div>
                <div style="height:4px;background:var(--bg4);border-radius:2px;overflow:hidden">
                  <div style="height:100%;width:${pct}%;background:${barColor};border-radius:2px;transition:width .4s"></div>
                </div>
              </div>
              <div style="text-align:right">
                ${_editing
                  ? `<input class="inp" style="width:90px;text-align:right;font-size:12px;padding:4px 8px"
                       id="bud-edit-${b.id}" value="${b.budgeted}" type="number" min="0">`
                  : `<span style="font-size:12px;color:var(--txt2)">${USD(b.budgeted)}</span>`}
              </div>
              <div style="text-align:right;font-size:12px;font-weight:500;color:var(--txt)">${USD(actual)}</div>
              <div style="text-align:right;font-size:12px;font-weight:600;color:${varColor}">
                ${variance > 0 ? '+' : ''}${USD(variance)}
              </div>
              <div style="text-align:center;font-size:12px;font-weight:600;color:${varColor}">${pct}%</div>
            </div>`;
          }).join('')}

          <!-- Totals row -->
          <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 90px;padding:12px 16px;background:var(--bg3);font-weight:600">
            <span style="font-size:12px;color:var(--txt)">Total</span>
            <span style="text-align:right;font-size:12px;color:var(--txt)">${USD(totalBudgeted)}</span>
            <span style="text-align:right;font-size:12px;color:var(--txt)">${USD(totalActual)}</span>
            <span style="text-align:right;font-size:13px;font-weight:700;color:${totalVariance>0?'var(--red)':'var(--grn)'}">${totalVariance>0?'+':''}${USD(totalVariance)}</span>
            <span style="text-align:center;font-size:12px;color:${totalActual>totalBudgeted?'var(--red)':'var(--grn)'}">${Math.round(totalActual/totalBudgeted*100)}%</span>
          </div>
        </div>
        </div>

        ${_editing ? `
        <div style="margin-top:12px;display:flex;justify-content:flex-end">
          <button class="btn btn-primary btn-sm" onclick="Budget.saveBudget()">Save budget</button>
        </div>` : ''}

        <!-- Note -->
        <div style="margin-top:16px;font-size:11px;color:var(--txt3)">
          Actuals for Fuel, Provisioning, and Port fees are pulled from charter cost records.
          Other categories use manually set actuals. Revenue and charter commissions are tracked in the Owner view.
        </div>

      </div>
    `;
  }

  function _kpi(label, val, sub, color) {
    return `
      <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:16px">
        <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:6px">${label}</div>
        <div style="font-size:22px;font-weight:500;color:${color || 'var(--txt)'};margin-bottom:2px">${val}</div>
        <div style="font-size:10px;color:var(--txt3)">${sub}</div>
      </div>`;
  }

  function toggleEdit() {
    if (_editing) saveBudget();
    else { _editing = true; render(); }
  }

  function saveBudget() {
    const v   = _vessel();
    const vid = v ? v.id : null;
    (FM.budget || []).filter(b => !vid || b.vessel === vid).forEach(b => {
      const el = document.getElementById('bud-edit-' + b.id);
      if (el) b.budgeted = parseInt(el.value) || b.budgeted;
    });
    _editing = false;
    render();
    showToast('Budget saved');
  }

  return { render, toggleEdit, saveBudget };
})();

window.Budget = Budget;
