/* ── OWNER DASHBOARD MODULE ── */
const Owner = (() => {

  const USD = n => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const Kf  = n => (n >= 0 ? '+' : '-') + '$' + (Math.abs(n)/1000).toFixed(1) + 'k';

  function fmtDate(s) {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + d + ' ' + y;
  }

  function daysUntil(s) {
    if (!s) return null;
    return Math.ceil((new Date(s) - new Date()) / 86400000);
  }

  function render() {
    const wrap = document.getElementById('page-owner');
    if (!wrap) return;

    const vessel   = FM.currentVessel();
    const charters = (FM.charters || []).filter(c => !vessel || c.vessel === vessel.id);

    // ── P&L per charter
    const charterPL = charters.map(c => {
      const revenue = c.fee || 0;
      const costs   = (c.costs || []).reduce((s, e) => s + e.amount, 0);
      return { ...c, revenue, costs, net: revenue - costs };
    });

    const ytd2026 = charterPL.filter(c => c.end >= '2026-01-01');
    const totalRev   = ytd2026.reduce((s, c) => s + c.revenue, 0);
    const totalCosts = ytd2026.reduce((s, c) => s + c.costs,   0);
    const totalNet   = totalRev - totalCosts;
    const charterDays = ytd2026.reduce((s, c) => {
      return s + Math.max(0, Math.round((new Date(c.end) - new Date(c.start)) / 86400000));
    }, 0);

    // ── Fleet status
    const fleet  = (FM.fleet  || []).filter(f => !vessel || f.vessel === vessel.id);
    const wos    = (FM.workOrders || []).filter(w => (!vessel || w.vessel === vessel.id) && w.status !== 'done');
    const svcDue = fleet.filter(f => (f.nextServiceHours - f.hours) <= 30).length;

    // ── Compliance
    const vc = (FM.vesselCerts || []).filter(c => !vessel || c.vessel === vessel.id);
    const cc = (FM.crewCerts  || []).filter(c => {
      const cr = FM.getCrew(c.crewId);
      return cr && (!vessel || cr.vessel === vessel.id);
    });
    const expiringCerts = [...vc, ...cc].filter(c => {
      const d = daysUntil(c.expires);
      return d !== null && d <= 90;
    });
    const openNCs = (FM.nonConformances || []).filter(n => (!vessel || n.vessel === vessel.id) && n.status === 'open');
    const overdueD = (FM.drills || []).filter(d => (!vessel || d.vessel === vessel.id) && d.status === 'scheduled' && d.date < new Date().toISOString().slice(0,10));

    // ── Spend by category
    const allCosts = charters.flatMap(c => c.costs || []);
    const catMap = {};
    allCosts.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    const catTotal = Object.values(catMap).reduce((s, v) => s + v, 0);
    const catSorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

    const complianceOk = expiringCerts.length === 0 && openNCs.length === 0 && overdueD.length === 0;
    const now = new Date();
    const reportDate = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();

    wrap.innerHTML = `
      <div style="padding:18px 20px 48px">

        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
          <div>
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:4px">Owner Report</div>
            <div style="font-size:20px;font-weight:500;color:var(--txt)">${vessel ? escHtml(vessel.name) : 'All Vessels'}</div>
            <div style="font-size:11px;color:var(--txt3)">As of ${reportDate} · YTD figures include all charters ending in 2026</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="window.open('insurance-report.html','_blank')">
            <svg viewBox="0 0 16 16" fill="currentColor" style="width:12px;height:12px;margin-right:4px"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.5 3.5h1V9h-1V4.5zm0 5h1v1h-1v-1z"/></svg>
            Insurance report ↗
          </button>
        </div>

        <!-- KPI row -->
        <div class="_ownerkpi" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px">
          ${_kpi('YTD Revenue',   USD(totalRev),   'charter fees received',        'var(--grn)')}
          ${_kpi('YTD Costs',     USD(totalCosts), 'operational expenses',         'var(--or)')}
          ${_kpi('YTD Net P&L',   (totalNet>=0?'+':'')+USD(totalNet), 'after all costs', totalNet >= 0 ? 'var(--grn)' : 'var(--red)')}
          ${_kpi('Charter Days',  charterDays + 'd', 'YTD · ' + ytd2026.length + ' charters', 'var(--txt)')}
        </div>

        <!-- Two-column: P&L table + Compliance/Fleet -->
        <div class="_ownergrid" style="display:grid;grid-template-columns:1fr 380px;gap:20px;margin-bottom:28px;align-items:start">

          <!-- Charter P&L -->
          <div>
            <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:10px">Charter P&L</div>
            <div class="tbl-wrap">
              <table class="tbl">
                <thead><tr>
                  <th>Charter</th><th>Status</th><th>Fee</th><th>Costs</th><th>Net</th><th>Margin</th>
                </tr></thead>
                <tbody>
                  ${charterPL.map(c => {
                    const margin = c.revenue > 0 ? Math.round(c.net / c.revenue * 100) : 0;
                    const statusCol = c.status === 'active' ? 'var(--pur)' : c.status === 'upcoming' ? 'var(--or)' : 'var(--grn)';
                    const statusLbl = c.status === 'active' ? 'Active' : c.status === 'upcoming' ? 'Upcoming' : 'Completed';
                    return `<tr>
                      <td>
                        <div style="font-weight:500;color:var(--txt);font-size:12px">${escHtml(c.name.split(' — ')[0])}</div>
                        <div style="font-size:10px;color:var(--txt3)">${fmtDate(c.start)} → ${fmtDate(c.end)}</div>
                      </td>
                      <td><span style="font-size:10px;font-weight:600;color:${statusCol}">${statusLbl}</span></td>
                      <td style="font-weight:500;color:var(--txt)">${USD(c.revenue)}</td>
                      <td style="color:var(--or)">${c.costs ? USD(c.costs) : '—'}</td>
                      <td style="font-weight:600;color:${c.net>=0?'var(--grn)':'var(--red)'}">${c.costs ? (c.net>=0?'+':'')+USD(c.net) : '—'}</td>
                      <td style="color:${margin>=50?'var(--grn)':'var(--yel)'}">${c.costs ? margin+'%' : '—'}</td>
                    </tr>`;
                  }).join('')}
                </tbody>
                <tfoot>
                  <tr style="border-top:.5px solid var(--bd)">
                    <td colspan="2" style="font-weight:600;color:var(--txt);font-size:11px">YTD Total</td>
                    <td style="font-weight:600;color:var(--txt)">${USD(totalRev)}</td>
                    <td style="font-weight:600;color:var(--or)">${USD(totalCosts)}</td>
                    <td style="font-weight:700;color:${totalNet>=0?'var(--grn)':'var(--red)'};font-size:13px">${(totalNet>=0?'+':'')+USD(totalNet)}</td>
                    <td style="font-weight:600;color:var(--txt)">${totalRev > 0 ? Math.round(totalNet/totalRev*100) + '%' : '—'}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Right column: Fleet + Compliance -->
          <div style="display:flex;flex-direction:column;gap:16px">

            <!-- Fleet status -->
            <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:16px">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:12px">Fleet status</div>
              ${fleet.map(f => {
                const craftWOs = wos.filter(w => [f.name,f.make,f.model].some(t => w.title.toLowerCase().includes(t.toLowerCase())));
                const hoursLeft = f.nextServiceHours - f.hours;
                const svcColor  = hoursLeft <= 0 ? 'var(--red)' : hoursLeft <= 30 ? 'var(--yel)' : 'var(--grn)';
                return `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:.5px solid var(--bd)">
                  <div>
                    <div style="font-size:12px;font-weight:500;color:var(--txt)">${escHtml(f.name)}</div>
                    <div style="font-size:10px;color:var(--txt3)">${f.hours.toLocaleString()}h · next svc <span style="color:${svcColor}">${hoursLeft > 0 ? hoursLeft+'h' : 'OVERDUE'}</span></div>
                  </div>
                  <div style="text-align:right">
                    ${craftWOs.length ? `<span class="badge b-high" style="font-size:9px">${craftWOs.length} WO${craftWOs.length>1?'s':''}</span>` : `<span style="font-size:10px;color:var(--grn)">✓</span>`}
                  </div>
                </div>`;
              }).join('')}
              <div style="margin-top:10px;display:flex;justify-content:space-between">
                <span style="font-size:11px;color:var(--txt3)">Open work orders</span>
                <span style="font-size:12px;font-weight:600;color:${wos.length?'var(--red)':'var(--grn)'}">${wos.length}</span>
              </div>
            </div>

            <!-- Compliance health -->
            <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:16px;border-color:${complianceOk?'var(--bd)':'rgba(248,113,113,.3)'}">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3)">Compliance health</div>
                <span style="font-size:10px;font-weight:600;color:${complianceOk?'var(--grn)':'var(--red)'}">${complianceOk?'✓ All clear':'⚠ Attention'}</span>
              </div>
              ${_compRow('Certs expiring (90d)', expiringCerts.length, expiringCerts.length ? 'b-high' : 'b-done', expiringCerts.length ? 'var(--red)' : 'var(--grn)')}
              ${_compRow('Open non-conformances', openNCs.length, openNCs.length ? 'b-high' : 'b-done', openNCs.length ? 'var(--red)' : 'var(--grn)')}
              ${_compRow('Overdue drills', overdueD.length, overdueD.length ? 'b-medium' : 'b-done', overdueD.length ? 'var(--or)' : 'var(--grn)')}
              ${_compRow('Vessel certs on file', vc.length, 'b-done', 'var(--grn)')}
              ${_compRow('Crew certs on file', cc.length, 'b-done', 'var(--grn)')}
            </div>
          </div>
        </div>

        <!-- Spend by category -->
        ${catSorted.length ? `<div>
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:12px">Spend by category — all charters</div>
          <div style="display:flex;flex-direction:column;gap:8px;max-width:600px">
            ${catSorted.map(([cat, amt]) => {
              const pct = catTotal > 0 ? Math.round(amt / catTotal * 100) : 0;
              const colors = { 'Broker':'#A78BFA', 'Provisioning':'#4ADE80', 'Fuel':'#60A5FA', 'Port / marina':'#FACC15', 'Crew':'#F97316', 'Other':'#9CA3AF' };
              const col = colors[cat] || '#9CA3AF';
              return `<div style="display:flex;align-items:center;gap:10px">
                <div style="width:110px;font-size:11px;color:var(--txt2);flex-shrink:0">${escHtml(cat)}</div>
                <div style="flex:1;height:6px;background:var(--bg3);border-radius:3px;overflow:hidden">
                  <div style="height:100%;width:${pct}%;background:${col};border-radius:3px"></div>
                </div>
                <div style="width:70px;font-size:11px;color:var(--txt);text-align:right;flex-shrink:0">${USD(amt)}</div>
                <div style="width:30px;font-size:10px;color:var(--txt3);flex-shrink:0">${pct}%</div>
              </div>`;
            }).join('')}
          </div>
        </div>` : ''}

      </div>
    `;
  }

  function _kpi(label, val, sub, color) {
    return `<div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:16px">
      <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:6px">${label}</div>
      <div style="font-size:22px;font-weight:500;color:${color};margin-bottom:2px">${val}</div>
      <div style="font-size:10px;color:var(--txt3)">${sub}</div>
    </div>`;
  }

  function _compRow(label, val, badgeCls, valColor) {
    return `<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:.5px solid var(--bd)">
      <span style="font-size:11px;color:var(--txt2)">${label}</span>
      <span style="font-size:12px;font-weight:600;color:${valColor}">${val}</span>
    </div>`;
  }

  if (!document.getElementById('_owner_css')) {
    const s = document.createElement('style');
    s.id = '_owner_css';
    s.textContent = '@media(max-width:768px){._ownergrid{grid-template-columns:1fr!important}._ownerkpi{grid-template-columns:1fr 1fr!important}}';
    document.head.appendChild(s);
  }

  return { render };
})();

window.Owner = Owner;
