/* ── FRAME MARINE — DASHBOARD ── */
'use strict';

const Dash = window.Dash = {};

Dash.render = function() {
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
      <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;
           background:var(--grn-bg);border:.5px solid var(--grn-bd);border-radius:10px">
        <span class="dot dot-grn dot-pulse"></span>
        <span style="font-size:13px;color:var(--grn)">All systems nominal</span>
      </div>`;
    return;
  }

  wrap.innerHTML = alerts.map(a => `
    <div class="card-alert" style="justify-content:space-between;align-items:flex-start">
      <div style="flex:1">
        <div style="font-size:12px;font-weight:600;color:var(--red);margin-bottom:2px">${a.title}</div>
        <div class="alert-strip-sub">${a.sub}</div>
        <div class="alert-strip-time" style="margin-top:3px">${a.time}</div>
      </div>
      <button onclick="Dash.acknowledge('${a.key}')"
              style="flex-shrink:0;margin-left:12px;padding:4px 10px;font-size:10px;font-weight:600;
                     background:var(--red-bg);border:.5px solid var(--red-bd);border-radius:6px;
                     color:var(--red);cursor:pointer;white-space:nowrap">
        Acknowledge
      </button>
    </div>
  `).join('');
};

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
  const wrap = document.getElementById('dash-vessels');
  if (!wrap) return;

  if (App.currentVesselId === 'all') {
    // Fleet overview — all vessel cards
    wrap.innerHTML = FM.vessels.map(v => _vesselCardHTML(v)).join('');
  } else {
    // Single vessel + tender mini-cards
    const v = FM.currentVessel();
    if (!v) return;
    const tenders = (FM.fleet || []).filter(f => f.vessel === v.id);
    const typeIcon = t => t.type==='PWC'?'🚤':t.type==='Seabob'?'🤿':'⛵';
    const fuelLabel = t => t.fuel === 'electric' ? 'Battery' : 'Fuel';
    const fuelColor = pct => pct < 30 ? 'var(--red)' : pct < 60 ? 'var(--yel)' : 'var(--grn)';
    const statusMap = {'in-water':'b-done','davits':'b-progress','swim-platform':'b-done','charged':'b-done'};
    const labelMap  = {'in-water':'In water','davits':'On davits','swim-platform':'Deployed','charged':'Charged'};
    const fl = (n) => n === 'electric' ? 'Battery' : 'Fuel';
    wrap.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:16px">
        ${_vesselCardHTML(v)}
        ${tenders.length ? `
        <div>
          <div style="font-size:9px;font-weight:600;color:var(--txt4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px">Tender &amp; small craft</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${tenders.map(t => {
              const fc = fuelColor(t.fuelPct);
              return `
              <div onclick="navTo('fleet',document.querySelector('[data-page=fleet]'))"
                   style="padding:14px;background:var(--bg2);border:.5px solid var(--bd);border-radius:var(--r10);cursor:pointer;transition:background var(--t1)"
                   onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='var(--bg2)'">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
                  <span style="font-size:26px;flex-shrink:0">${typeIcon(t)}</span>
                  <div style="min-width:0;flex:1">
                    <div style="font-size:13px;font-weight:600;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.name}</div>
                    <span class="badge ${statusMap[t.status]||'b-hold'}" style="font-size:9px;margin-top:3px;display:inline-block">${labelMap[t.status]||t.status}</span>
                  </div>
                </div>
                <div style="font-size:10px;color:var(--txt3);margin-bottom:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.year} ${t.make} ${t.model}</div>
                <div style="display:flex;align-items:flex-end;gap:12px">
                  <div style="flex-shrink:0">
                    <div style="font-size:9px;color:var(--txt4);margin-bottom:2px">Hours</div>
                    <div style="font-size:16px;font-weight:600;color:var(--txt);line-height:1">${t.hours.toLocaleString()}</div>
                  </div>
                  <div style="flex:1;min-width:0">
                    <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--txt3);margin-bottom:4px">
                      <span>${fl(t.fuel)}</span><span style="color:${fc};font-weight:600">${t.fuelPct}%</span>
                    </div>
                    <div style="height:5px;background:var(--bg4);border-radius:3px;overflow:hidden">
                      <div style="height:100%;width:${t.fuelPct}%;background:${fc};border-radius:3px"></div>
                    </div>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>` : ''}
      </div>`;
  }
};

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
  const padZ = n => String(n).padStart(2,'0');
  const dateStr = d => `${year}-${padZ(month+1)}-${padZ(d)}`;

  let gridHtml = '';
  for (let i = offset - 1; i >= 0; i--) {
    gridHtml += `<div class="cal-month-cell other-month"><div class="cal-day-num">${prevDays - i}</div></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = dateStr(d);
    const dayEvts = (FM.events||[]).filter(e => e.vessel === App.currentVesselId && e.start <= ds && e.end >= ds);
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

  const colorVars = { or:'var(--or)', eng:'var(--eng)', red:'var(--red)', blu:'var(--blu)', grn:'var(--grn)' };
  const typeLabels = { charter:'Charter', maintenance:'Maintenance', regulatory:'Regulatory', logistics:'Logistics' };
  const upEvents = (FM.events||[])
    .filter(e => e.vessel === App.currentVesselId && e.end >= todayStr)
    .sort((a,b) => a.start.localeCompare(b.start));

  wrap.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 220px;border:.5px solid var(--bd);border-radius:var(--r12);overflow:hidden;background:var(--bg)">
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
          ${['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d=>`<div class="cal-dow">${d}</div>`).join('')}
        </div>
        <div class="cal-month-grid" style="flex:none">${gridHtml}</div>
      </div>
      <div class="cal-upcoming-panel">
        <div class="cal-upcoming-hdr">Upcoming</div>
        <div class="cal-upcoming-list">
          ${upEvents.map(e => {
            const s = new Date(e.start+'T00:00'), en = new Date(e.end+'T00:00');
            const fmt = d => d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
            const range = e.start===e.end ? fmt(s) : `${fmt(s)} – ${fmt(en)}`;
            return `<div class="cal-up-item">
              <div class="cal-up-date" style="color:${colorVars[e.color]}">${range}</div>
              <div class="cal-up-title">${e.title}</div>
              <div class="cal-up-meta">${typeLabels[e.type]||e.type}${e.wo?' · '+e.wo:''}</div>
            </div>`;
          }).join('') || '<div style="padding:16px;font-size:12px;color:var(--txt4)">No upcoming events</div>'}
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
