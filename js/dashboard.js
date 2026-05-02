/* ── FRAME MARINE — DASHBOARD ── */
'use strict';

const Dash = window.Dash = {};

Dash.render = function() {
  Dash.renderHero();
  Dash.renderAlerts();
  Dash.renderVessels();
  Dash.renderUpcoming();
  Dash.renderRecentWOs();
};

Dash._ack = Dash._ack || new Set();

Dash.acknowledge = function(key) {
  Dash._ack.add(key);
  Dash.renderAlerts();
};

/* ── VESSEL HERO (single-vessel mode) ── */

Dash.renderHero = function() {
  const wrap = document.getElementById('dash-hero');
  if (!wrap) return;

  if (App.currentVesselId === 'all') {
    wrap.innerHTML = '';
    wrap.style.display = 'none';
    return;
  }
  wrap.style.display = '';

  const v = FM.currentVessel();
  if (!v) return;

  const wos        = FM.openWOs(v.id);
  const high       = wos.filter(w => w.priority === 'high').length;
  const sensors    = FM.sensors[v.id];
  const critSensors = sensors ? sensors.engines.filter(e => e.status === 'warn' || e.status === 'crit').length : 0;
  const crew       = (FM.crew || []).filter(c => c.vessel === v.id && c.status === 'onboard');

  const today = '2026-05-01';
  const nextEv = (FM.events || [])
    .filter(e => e.vessel === v.id && e.type === 'charter' && e.start >= today)
    .sort((a, b) => a.start.localeCompare(b.start))[0];
  const fmtShort = d => new Date(d + 'T00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const hasAlert = critSensors > 0;

  wrap.innerHTML = `
    <div style="display:flex;background:var(--bg2);border:.5px solid var(--bd);border-radius:var(--r12);overflow:hidden;height:195px">

      <!-- Photo -->
      ${v.photo ? `
      <div style="width:374px;flex-shrink:0;overflow:hidden">
        <img src="${v.photo}" alt="${v.name}" style="width:100%;height:100%;object-fit:cover;object-position:center 35%;display:block" onerror="this.parentElement.style.display='none'">
      </div>` : ''}

      <!-- Center: name + stats + crew -->
      <div style="flex:1;min-width:0;padding:18px 22px;display:flex;flex-direction:column;justify-content:space-between;border-left:.5px solid var(--bd)">
        <div>
          <div style="font-size:22px;font-weight:600;color:var(--txt);letter-spacing:-.02em;line-height:1;margin-bottom:4px">${v.name}</div>
          <div style="font-size:12px;color:var(--txt3)">${v.type} · ${v.loa} · ${v.port}</div>
        </div>
        <div style="display:flex;gap:22px">
          <div>
            <div style="font-size:20px;font-weight:300;color:${high ? 'var(--red)' : 'var(--txt)'};line-height:1;margin-bottom:3px">${wos.length}</div>
            <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3)">Open WOs</div>
          </div>
          <div>
            <div style="font-size:20px;font-weight:300;color:${high ? 'var(--or)' : 'var(--txt)'};line-height:1;margin-bottom:3px">${high}</div>
            <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3)">High priority</div>
          </div>
          <div>
            <div style="font-size:15px;font-weight:500;color:var(--txt);line-height:1;margin-bottom:3px">${nextEv ? fmtShort(nextEv.start) : '—'}</div>
            <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3)">Next charter</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          ${crew.length ? `
          <div style="display:flex;align-items:center;gap:8px">
            <div style="display:flex">
              ${crew.slice(0, 6).map(c => `<div class="vessel-hero-av" style="background:${c.color}" title="${c.name} — ${c.role}">${c.initials}</div>`).join('')}
            </div>
            <span style="font-size:11px;color:var(--txt3)">${crew.length} onboard</span>
          </div>` : '<div></div>'}
          <div style="display:flex;align-items:center;gap:6px">
            <span style="width:6px;height:6px;border-radius:50%;background:${v.color};display:inline-block"></span>
            <span style="font-size:10px;color:var(--txt4)">${v.flag} · ${v.mmsi}</span>
          </div>
        </div>
      </div>

      <!-- Right: alerts panel -->
      <div style="width:346px;flex-shrink:0;display:flex;flex-direction:column;overflow:hidden;border-left:.5px solid var(--red-bd);background:var(--red-bg)">
        <div style="padding:10px 14px 9px;border-bottom:.5px solid var(--red-bd);flex-shrink:0">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--red)">Active alerts</div>
        </div>
        <div id="dash-alerts" style="flex:1;overflow-y:auto;padding:8px 10px;display:flex;flex-direction:column;gap:6px"></div>
      </div>

    </div>`;
};

/* ── ALERTS ── */

Dash.renderAlerts = function() {
  const wrap = document.getElementById('dash-alerts');
  if (!wrap) return;

  const all = [];

  const sensors = FM.sensors[App.currentVesselId];
  if (sensors) {
    sensors.engines.forEach(e => {
      if (e.status === 'warn' || e.status === 'crit') {
        all.push({
          key: 'engine-' + e.name,
          title: e.name + ' — ' + (e.coolant > 88 ? `High coolant temp ${e.coolant}°C` : 'Warning'),
          sub: 'WO-001 open · Dmitri Koval assigned',
          time: '2 min ago',
        });
      }
    });

    sensors.climate.forEach(c => {
      if (c.status === 'crit') {
        all.push({
          key: 'climate-' + c.zone,
          title: c.zone + ' — A/C not cooling (' + c.temp + '°C / set ' + c.setpt + '°C)',
          sub: 'WO-003 in progress',
          time: '1h ago',
        });
      }
    });

    sensors.bilge.forEach(b => {
      if (b.status === 'warn') {
        all.push({
          key: 'bilge-' + b.zone,
          title: 'Bilge elevated — ' + b.zone + ' (' + b.level + '%)',
          sub: 'Source investigation needed',
          time: '30 min ago',
        });
      }
    });
  }

  const alerts = all.filter(a => !Dash._ack.has(a.key));

  if (alerts.length === 0) {
    wrap.innerHTML = `
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center">
        <span class="dot dot-grn dot-pulse"></span>
        <span style="font-size:11px;color:var(--grn);font-weight:500">All systems nominal</span>
      </div>`;
    return;
  }

  wrap.innerHTML = alerts.map(a => `
    <div style="background:rgba(239,68,68,.1);border:.5px solid var(--red-bd);border-radius:8px;padding:8px 10px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px">
        <div style="min-width:0;flex:1">
          <div style="font-size:11px;font-weight:600;color:var(--red);margin-bottom:2px;line-height:1.3">${a.title}</div>
          <div style="font-size:10px;color:var(--txt2);line-height:1.3">${a.sub}</div>
          <div style="font-size:9px;color:var(--txt3);margin-top:2px">${a.time}</div>
        </div>
        <button onclick="Dash.acknowledge('${a.key}')"
                style="flex-shrink:0;padding:3px 8px;font-size:9px;font-weight:600;
                       background:var(--red-bg);border:.5px solid var(--red-bd);border-radius:5px;
                       color:var(--red);cursor:pointer;white-space:nowrap">Ack</button>
      </div>
    </div>
  `).join('');
};

/* ── VESSEL CARDS (fleet view) / TENDERS (single vessel) ── */

function _vesselCardHTML(v) {
  const wos  = FM.openWOs(v.id);
  const high = wos.filter(w => w.priority === 'high').length;
  const sensors = FM.sensors[v.id];
  const critSensors = sensors ? sensors.engines.filter(e => e.status === 'warn' || e.status === 'crit').length : 0;
  return `
    <div class="vessel-card" onclick="switchVessel('${v.id}');navTo('work-orders',document.querySelector('.ni[data-page=work-orders]'))">
      ${v.photo ? `<div class="vessel-card-photo"><img src="${v.photo}" alt="${v.name}" onerror="this.parentElement.style.display='none'"></div>` : ''}
      <div class="vessel-card-top">
        <span class="vessel-card-dot" style="background:${v.color}"></span>
        <div>
          <div class="vessel-card-name">${v.name}</div>
          <div class="vessel-card-type">${v.type} · ${v.loa} · ${v.port}</div>
        </div>
        <span class="badge ${critSensors ? 'b-critical' : wos.length ? 'b-medium' : 'b-done'}" style="margin-left:auto">
          ${critSensors ? '● Alert' : wos.length ? wos.length + ' open' : 'Clear'}
        </span>
      </div>
      <div class="vessel-card-stats">
        <div class="vessel-card-stat">
          <div class="vessel-card-stat-val ${high ? 'red' : ''}">${wos.length}</div>
          <div class="vessel-card-stat-lbl">Open WOs</div>
        </div>
        <div class="vessel-card-stat">
          <div class="vessel-card-stat-val ${high ? 'or' : ''}">${high}</div>
          <div class="vessel-card-stat-lbl">High priority</div>
        </div>
        <div class="vessel-card-stat">
          <div class="vessel-card-stat-val ${critSensors ? 'red' : 'grn'}">${critSensors || '—'}</div>
          <div class="vessel-card-stat-lbl">Alerts</div>
        </div>
      </div>
    </div>`;
}

Dash.renderVessels = function() {
  const wrap     = document.getElementById('dash-vessels');
  const upcoming = document.getElementById('dash-upcoming');
  if (!wrap) return;

  if (App.currentVesselId === 'all') {
    if (upcoming) upcoming.style.display = 'none';
    wrap.innerHTML = `
      <div class="dash-section-title">All vessels</div>
      <div class="vessel-cards">${FM.vessels.map(v => _vesselCardHTML(v)).join('')}</div>`;
    return;
  }

  // Single vessel: show tenders only (vessel itself is in the hero)
  if (upcoming) upcoming.style.display = '';

  const v = FM.currentVessel();
  if (!v) { wrap.innerHTML = ''; return; }

  const tenders = (FM.fleet || []).filter(f => f.vessel === v.id);
  if (!tenders.length) { wrap.innerHTML = ''; return; }

  const typeIcon  = t => t.type === 'PWC' ? '🚤' : t.type === 'Seabob' ? '🤿' : t.type === 'Tender' ? '⛵' : '🛥️';
  const fuelColor = pct => pct < 30 ? 'var(--red)' : pct < 60 ? 'var(--yel)' : 'var(--grn)';
  const statusMap = { 'in-water': 'b-done', 'davits': 'b-progress', 'swim-platform': 'b-done', 'charged': 'b-done' };
  const labelMap  = { 'in-water': 'In water', 'davits': 'On davits', 'swim-platform': 'Deployed', 'charged': 'Charged' };
  const fl        = n => n === 'electric' ? 'Battery' : 'Fuel';

  wrap.innerHTML = `
    <div class="dash-section-title">Tender &amp; small craft</div>
    <div style="display:grid;grid-template-columns:repeat(${tenders.length},1fr);gap:10px">
      ${tenders.map(t => {
        const fc = fuelColor(t.fuelPct);
        const hoursToSvc = t.nextServiceHours - t.hours;
        const svcUrgent  = hoursToSvc <= 30;
        const tWOs = (FM.workOrders || []).filter(w => w.vessel === v.id && w.status !== 'done' && w.zone === 'Tender Garage');
        return `
        <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:var(--r10);overflow:hidden">
          <div style="padding:12px 14px 11px">
            <div style="display:flex;align-items:flex-start;gap:9px;margin-bottom:9px">
              <div style="min-width:0;flex:1">
                <div style="font-size:13px;font-weight:600;color:var(--txt);line-height:1.2">${t.name}</div>
                <div style="font-size:10px;color:var(--txt3);margin-top:2px">${t.year} ${t.make} ${t.model}</div>
              </div>
              <div style="display:flex;align-items:center;gap:5px;flex-shrink:0;margin-top:1px">
                ${tWOs.length ? `<span style="font-size:9px;font-weight:700;background:var(--or-bg);color:var(--or);border:.5px solid var(--or-bd);border-radius:5px;padding:2px 6px;cursor:pointer" onclick="navTo('work-orders',document.querySelector('[data-page=work-orders]'))">${tWOs.length} WO</span>` : ''}
                <span class="badge ${statusMap[t.status] || 'b-hold'}" style="font-size:9px">${labelMap[t.status] || t.status}</span>
              </div>
            </div>
            <div style="display:flex;align-items:flex-end;gap:12px">
              <div style="flex-shrink:0">
                <div style="font-size:18px;font-weight:600;color:var(--txt);line-height:1">${t.hours.toLocaleString()}</div>
                <div style="font-size:9px;color:var(--txt4);text-transform:uppercase;letter-spacing:.05em;margin-top:2px">Hrs${svcUrgent ? ` · <span style="color:var(--yel)">Svc in ${hoursToSvc}h</span>` : ''}</div>
              </div>
              <div style="flex:1;min-width:0">
                <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--txt3);margin-bottom:4px">
                  <span>${fl(t.fuel)}</span><span style="color:${fc};font-weight:600">${t.fuelPct}%</span>
                </div>
                <div style="height:4px;background:var(--bg4);border-radius:3px;overflow:hidden">
                  <div style="height:100%;width:${t.fuelPct}%;background:${fc};border-radius:3px;transition:width .3s"></div>
                </div>
              </div>
            </div>
          </div>
          <div style="display:flex;border-top:.5px solid var(--bd)">
            <button onclick="fleetLogHours('${t.id}','${t.name}')" style="flex:1;padding:7px 2px;font-size:10px;font-weight:500;color:var(--txt2);background:transparent;border:none;border-right:.5px solid var(--bd);cursor:pointer" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='transparent'">Log hrs</button>
            <button onclick="${t.fuel === 'electric' ? `fleetCharge('${t.id}','${t.name}')` : `fleetFuelUp('${t.id}','${t.name}')`}" style="flex:1;padding:7px 2px;font-size:10px;font-weight:500;color:var(--txt2);background:transparent;border:none;border-right:.5px solid var(--bd);cursor:pointer" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='transparent'">${t.fuel === 'electric' ? 'Charge' : 'Fuel up'}</button>
            <button onclick="WO.openNewModal()" style="flex:1;padding:7px 2px;font-size:10px;font-weight:500;color:var(--or);background:transparent;border:none;cursor:pointer" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='transparent'">+ WO</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
};

/* ── CALENDAR ── */

Dash._calYear  = 2026;
Dash._calMonth = 4; // May

Dash.renderUpcoming = function() { Dash.renderDashCal(); };

Dash.renderDashCal = function() {
  const wrap = document.getElementById('dash-upcoming');
  if (!wrap) return;

  const year  = Dash._calYear;
  const month = Dash._calMonth;
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const todayStr   = '2026-05-01';

  const firstDow   = new Date(year, month, 1).getDay();
  const offset     = firstDow === 0 ? 6 : firstDow - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays   = new Date(year, month, 0).getDate();
  const padZ = n => String(n).padStart(2, '0');
  const dateStr = d => `${year}-${padZ(month + 1)}-${padZ(d)}`;

  let gridHtml = '';
  for (let i = offset - 1; i >= 0; i--) {
    gridHtml += `<div class="cal-month-cell other-month"><div class="cal-day-num">${prevDays - i}</div></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = dateStr(d);
    const dayEvts = (FM.events || []).filter(e => e.vessel === App.currentVesselId && e.start <= ds && e.end >= ds);
    const isToday = ds === todayStr;
    gridHtml += `<div class="cal-month-cell${isToday ? ' today' : ''}">
      <div class="cal-day-num">${d}</div>
      ${dayEvts.map(e => `<div class="cal-pill cal-pill-${e.color}" title="${e.title}">${e.title}</div>`).join('')}
    </div>`;
  }
  const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
  for (let i = 1; i <= totalCells - offset - daysInMonth; i++) {
    gridHtml += `<div class="cal-month-cell other-month"><div class="cal-day-num">${i}</div></div>`;
  }

  const colorVars = { or: 'var(--or)', eng: 'var(--eng)', red: 'var(--red)', blu: 'var(--blu)', grn: 'var(--grn)' };
  const typeLabels = { charter: 'Charter', maintenance: 'Maintenance', regulatory: 'Regulatory', logistics: 'Logistics' };
  const upEvents = (FM.events || [])
    .filter(e => e.vessel === App.currentVesselId && e.end >= todayStr)
    .sort((a, b) => a.start.localeCompare(b.start));

  wrap.innerHTML = `
    <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:var(--r12);overflow:hidden;padding:14px">
    <div style="display:grid;grid-template-columns:1fr 200px;border:.5px solid var(--bd);border-radius:var(--r10);overflow:hidden;background:var(--bg)">
      <div style="display:flex;flex-direction:column;border-right:.5px solid var(--bd);overflow:hidden">
        <div class="cal-month-hdr">
          <div class="cal-month-nav">
            <button class="cal-nav-btn" onclick="dashCalNav(-1)">&#8249;</button>
            <button class="cal-nav-btn" onclick="dashCalNav(1)">&#8250;</button>
          </div>
          <span class="cal-month-title">${monthNames[month]} ${year}</span>
          <div class="cal-month-legend">
            <div class="cal-legend-item"><div class="cal-legend-dot" style="background:var(--or)"></div>Charter</div>
            <div class="cal-legend-item"><div class="cal-legend-dot" style="background:var(--eng)"></div>Maintenance</div>
            <div class="cal-legend-item"><div class="cal-legend-dot" style="background:var(--red)"></div>Regulatory</div>
            <div class="cal-legend-item"><div class="cal-legend-dot" style="background:var(--grn)"></div>Logistics</div>
          </div>
        </div>
        <div class="cal-month-dow">
          ${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => `<div class="cal-dow">${d}</div>`).join('')}
        </div>
        <div class="cal-month-grid" style="flex:none">${gridHtml}</div>
      </div>
      <div class="cal-upcoming-panel">
        <div class="cal-upcoming-hdr">Upcoming</div>
        <div class="cal-upcoming-list">
          ${upEvents.map(e => {
            const s = new Date(e.start + 'T00:00'), en = new Date(e.end + 'T00:00');
            const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            const range = e.start === e.end ? fmt(s) : `${fmt(s)} – ${fmt(en)}`;
            return `<div class="cal-up-item">
              <div class="cal-up-date" style="color:${colorVars[e.color]}">${range}</div>
              <div class="cal-up-title">${e.title}</div>
              <div class="cal-up-meta">${typeLabels[e.type] || e.type}${e.wo ? ' · ' + e.wo : ''}</div>
            </div>`;
          }).join('') || '<div style="padding:16px;font-size:12px;color:var(--txt4)">No upcoming events</div>'}
        </div>
      </div>
    </div>
    </div>`;
};

window.dashCalNav = function(dir) {
  Dash._calMonth += dir;
  if (Dash._calMonth < 0)  { Dash._calMonth = 11; Dash._calYear--; }
  if (Dash._calMonth > 11) { Dash._calMonth = 0;  Dash._calYear++; }
  Dash.renderDashCal();
};

/* ── RECENT WORK ORDERS ── */

Dash.renderRecentWOs = function() {
  const wrap = document.getElementById('dash-recent-wos');
  if (!wrap) return;

  const wos = FM.vesselWOs(App.currentVesselId)
    .filter(w => w.status !== 'done')
    .slice(0, 5);

  wrap.innerHTML = `
    <table class="tbl">
      <thead>
        <tr>
          <th style="width:80px">ID</th>
          <th>Title</th>
          <th style="width:120px">Zone</th>
          <th style="width:80px">Priority</th>
          <th style="width:90px">Status</th>
        </tr>
      </thead>
      <tbody>
        ${wos.map(w => `
          <tr onclick="navTo('work-orders',document.querySelector('[data-page=work-orders]'));setTimeout(()=>WO.openPanel('${w.id}'),80)">
            <td class="tbl-mono">${w.id}</td>
            <td><div class="tbl-title">${escHtml(w.title)}</div></td>
            <td class="c-txt2 t-11">${w.zone}</td>
            <td><span class="badge b-${w.priority}">${FM.priorityLabel(w.priority)}</span></td>
            <td>${WO.statusBadge(w.status)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

function fmtDateLong(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
