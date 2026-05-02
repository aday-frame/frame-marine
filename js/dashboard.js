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

Dash.renderUpcoming = function() {
  const wrap = document.getElementById('dash-upcoming');
  if (!wrap) return;
  wrap.style.cssText = 'width:100%';

  const colorMap = { or:'var(--or)', eng:'var(--eng)', red:'var(--red)', blu:'var(--blu)', grn:'var(--grn)' };
  const typeLabel = { charter:'Charter', maintenance:'Maintenance', regulatory:'Regulatory', logistics:'Logistics' };
  const now   = new Date('2026-05-01T00:00:00');
  const year  = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon-first

  function eventsForDay(d) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return (FM.events||[]).filter(e => e.vessel === App.currentVesselId && e.start <= ds && e.end >= ds);
  }

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d);

  const monthLabel = firstDay.toLocaleDateString('en-GB', { month:'long', year:'numeric' });
  const monthEvents = (FM.events||[]).filter(e => e.vessel === App.currentVesselId && e.start.startsWith('2026-05'));

  wrap.innerHTML = `
    <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:var(--r12);overflow:hidden">
      <!-- Month header -->
      <div style="padding:14px 16px 10px;border-bottom:.5px solid var(--bd)">
        <div style="font-size:14px;font-weight:600;color:var(--txt)">${monthLabel}</div>
      </div>
      <!-- Day headers -->
      <div style="display:grid;grid-template-columns:repeat(7,1fr);padding:8px 10px 4px">
        ${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<div style="text-align:center;font-size:10px;color:var(--txt4);font-weight:600">${d}</div>`).join('')}
      </div>
      <!-- Day cells -->
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;padding:0 10px 10px">
        ${cells.map(d => {
          if (!d) return `<div></div>`;
          const dayEvts = eventsForDay(d);
          const isToday = d === now.getDate();
          const hasBg = dayEvts.length > 0;
          return `<div style="padding:6px 4px;text-align:center;border-radius:6px;
                       background:${isToday ? 'var(--or)' : hasBg ? 'var(--bg4)' : 'transparent'};
                       position:relative">
            <div style="font-size:12px;font-weight:${isToday?'700':'400'};color:${isToday?'#080808':'var(--txt)'};">${d}</div>
            <div style="display:flex;justify-content:center;gap:2px;margin-top:3px;min-height:5px">
              ${dayEvts.slice(0,3).map(e=>`<div style="width:5px;height:5px;border-radius:50%;background:${isToday?'rgba(8,8,8,.5)':colorMap[e.color]||'var(--txt3)'}"></div>`).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
      <!-- Event list -->
      <div style="border-top:.5px solid var(--bd);padding:12px 16px">
        <div style="font-size:9px;font-weight:700;color:var(--txt4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px">This month · ${monthEvents.length} events</div>
        <div style="display:flex;flex-direction:column;gap:1px">
          ${monthEvents.length ? monthEvents.map(e => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:7px;cursor:pointer;transition:background var(--t1)"
                 onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''"
                 onclick="${e.wo ? `WO&&WO.openPanel&&WO.openPanel('${e.wo}')` : `navTo('calendar',document.querySelector('[data-page=calendar]'))`}">
              <div style="width:8px;height:8px;border-radius:50%;background:${colorMap[e.color]||'var(--txt3)'};flex-shrink:0"></div>
              <div style="flex:1;min-width:0">
                <div style="font-size:12px;font-weight:500;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.title}</div>
                <div style="font-size:10px;color:var(--txt3)">${fmtDateLong(e.start)}${e.end!==e.start?' → '+fmtDateLong(e.end):''}</div>
              </div>
              <span style="font-size:9px;font-weight:600;color:${colorMap[e.color]||'var(--txt4)'};white-space:nowrap;flex-shrink:0;text-transform:uppercase;letter-spacing:.06em">${typeLabel[e.type]||e.type}</span>
            </div>`).join('') : `<div style="padding:16px;text-align:center;font-size:12px;color:var(--txt4)">No events this month</div>`}
        </div>
      </div>
    </div>`;
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
