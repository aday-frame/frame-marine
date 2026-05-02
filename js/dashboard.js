/* ── FRAME MARINE — DASHBOARD ── */
'use strict';

const Dash = window.Dash = {};

Dash.render = function() {
  Dash.renderAlerts();
  Dash.renderVessels();
  Dash.renderUpcoming();
  Dash.renderRecentWOs();
};

Dash.renderAlerts = function() {
  const wrap = document.getElementById('dash-alerts');
  if (!wrap) return;

  const alerts = [];

  // Check sensor alerts for current vessel
  const sensors = FM.sensors[App.currentVesselId];
  if (sensors) {
    sensors.engines.forEach(e => {
      if (e.status === 'warn' || e.status === 'crit') {
        alerts.push({
          type: e.status,
          title: e.name + ' — ' + (e.coolant > 88 ? `High coolant temp ${e.coolant}°C` : 'Warning'),
          sub: 'WO-001 open · Dmitri Koval assigned',
          time: '2 min ago',
        });
      }
    });

    sensors.climate.forEach(c => {
      if (c.status === 'crit') {
        alerts.push({
          type: 'warn',
          title: c.zone + ' — A/C not cooling (' + c.temp + '°C / set ' + c.setpt + '°C)',
          sub: 'WO-003 in progress',
          time: '1h ago',
        });
      }
    });

    sensors.bilge.forEach(b => {
      if (b.status === 'warn') {
        alerts.push({
          type: 'warn',
          title: 'Bilge elevated — ' + b.zone + ' (' + b.level + '%)',
          sub: 'Source investigation needed',
          time: '30 min ago',
        });
      }
    });
  }

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
    <div class="${a.type === 'crit' ? 'card-alert' : 'card-warn'}">
      <div>
        <div class="${a.type === 'crit' ? 'alert-strip-title' : ''}"
             style="font-size:12px;font-weight:600;color:${a.type === 'crit' ? 'var(--red)' : 'var(--or)'};margin-bottom:2px">
          ${a.title}
        </div>
        <div class="alert-strip-sub">${a.sub}</div>
      </div>
      <div class="alert-strip-time">${a.time}</div>
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
    wrap.innerHTML = `
      <div style="display:grid;grid-template-columns:300px 1fr;gap:16px;align-items:start">
        ${_vesselCardHTML(v)}
        <div>
          <div style="font-size:9px;font-weight:600;color:var(--txt4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:10px">Tender & small craft</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${tenders.map(t => `
              <div onclick="navTo('fleet',document.querySelector('[data-page=fleet]'))" style="display:flex;align-items:center;gap:14px;padding:12px 16px;background:var(--bg2);border:.5px solid var(--bd);border-radius:var(--r10);cursor:pointer;transition:background var(--t1)" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='var(--bg2)'">
                <div style="font-size:28px;width:40px;text-align:center;flex-shrink:0">${typeIcon(t)}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
                    <span style="font-size:13px;font-weight:500;color:var(--txt)">${t.name}</span>
                    <span class="badge ${statusMap[t.status]||'b-hold'}" style="font-size:9px">${labelMap[t.status]||t.status}</span>
                  </div>
                  <div style="font-size:11px;color:var(--txt3)">${t.year} ${t.make} ${t.model} · ${t.engine}</div>
                </div>
                <div style="display:flex;gap:20px;flex-shrink:0;align-items:center">
                  <div style="text-align:right">
                    <div style="font-size:11px;color:var(--txt3);margin-bottom:2px">Hours</div>
                    <div style="font-size:14px;font-weight:500;color:var(--txt)">${t.hours.toLocaleString()}</div>
                  </div>
                  <div style="width:80px">
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--txt3);margin-bottom:4px">
                      <span>${fuelLabel(t)}</span><span style="color:${fuelColor(t.fuelPct)}">${t.fuelPct}%</span>
                    </div>
                    <div style="height:4px;background:var(--bg4);border-radius:2px;overflow:hidden">
                      <div style="height:100%;width:${t.fuelPct}%;background:${fuelColor(t.fuelPct)};border-radius:2px"></div>
                    </div>
                  </div>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }
};

Dash.renderUpcoming = function() {
  const wrap = document.getElementById('dash-upcoming');
  if (!wrap) return;

  const colorMap = { or:'var(--or)', eng:'var(--eng)', red:'var(--red)', blu:'var(--blu)', grn:'var(--grn)' };
  const now   = new Date('2026-05-01T00:00:00');
  const year  = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startDow = (firstDay.getDay() + 6) % 7; // Mon-first

  function eventsForDay(d) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return (FM.events||[]).filter(e => e.start <= ds && e.end >= ds);
  }

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(d);

  const monthLabel = firstDay.toLocaleDateString('en-GB', { month:'long', year:'numeric' });

  wrap.innerHTML = `
    <div style="font-size:12px;font-weight:500;color:var(--txt);margin-bottom:10px">${monthLabel}</div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px">
      ${['M','T','W','T','F','S','S'].map(d=>`<div style="text-align:center;font-size:9px;color:var(--txt3);font-weight:600;padding:2px 0">${d}</div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:14px">
      ${cells.map(d => {
        if (!d) return `<div></div>`;
        const dayEvts = eventsForDay(d);
        const isToday = d === now.getDate();
        const dots = dayEvts.slice(0,3).map(e=>`<div style="width:4px;height:4px;border-radius:50%;background:${colorMap[e.color]||'var(--txt3)'}"></div>`).join('');
        return `<div style="padding:3px 2px;text-align:center;border-radius:4px;${isToday?'background:var(--or);':dayEvts.length?'background:var(--bg3);':''}">
          <div style="font-size:11px;color:${isToday?'#080808':'var(--txt)'};font-weight:${isToday?'600':'400'};line-height:1.4">${d}</div>
          <div style="display:flex;justify-content:center;gap:2px;margin-top:1px">${dots}</div>
        </div>`;
      }).join('')}
    </div>
    <div style="font-size:9px;font-weight:600;color:var(--txt4);text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">This month</div>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${(FM.events||[]).filter(e=>e.start.startsWith('2026-05')).slice(0,5).map(e=>`
        <div style="display:flex;align-items:flex-start;gap:8px;cursor:pointer" onclick="${e.wo?`WO&&WO.openPanel&&WO.openPanel('${e.wo}')`:``}">
          <div style="width:6px;height:6px;border-radius:50%;background:${colorMap[e.color]||'var(--txt3)'};flex-shrink:0;margin-top:4px"></div>
          <div>
            <div style="font-size:12px;color:var(--txt2)">${e.title}</div>
            <div style="font-size:10px;color:var(--txt3)">${fmtDateLong(e.start)}${e.end!==e.start?' → '+fmtDateLong(e.end):''}</div>
          </div>
        </div>`).join('')}
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
