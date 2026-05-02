/* ── FRAME MARINE — MONITORING ── */
'use strict';

const Mon = window.Mon = {};

Mon.render = function() {
  const s = FM.sensors[App.currentVesselId];
  if (!s) {
    document.getElementById('mon-body').innerHTML =
      `<div class="empty"><div class="empty-title">No sensor data for this vessel</div></div>`;
    return;
  }
  Mon.renderStats(s);
  Mon.renderEngines(s);
  Mon.renderBilge(s);
  Mon.renderClimate(s);
  Mon.renderPower(s);
};

Mon.renderStats = function(s) {
  const bar = document.getElementById('mon-stats');
  if (!bar) return;

  const critEngines = s.engines.filter(e => e.status === 'crit').length;
  const warnEngines = s.engines.filter(e => e.status === 'warn').length;
  const critBilge   = s.bilge.filter(b => b.status === 'crit').length;
  const warnBilge   = s.bilge.filter(b => b.status === 'warn').length;
  const critClimate = s.climate.filter(c => c.status === 'crit').length;

  bar.style.gridTemplateColumns = 'repeat(5,1fr)';
  bar.innerHTML = `
    <div class="stat">
      <div class="stat-lbl">Shore power</div>
      <div class="stat-val ${s.power.shorepower ? 'grn' : 'red'}">${s.power.shorepower ? 'ON' : 'OFF'}</div>
    </div>
    <div class="stat">
      <div class="stat-lbl">Load</div>
      <div class="stat-val">${s.power.load_kw} <span style="font-size:13px;color:var(--txt3)">kW</span></div>
    </div>
    <div class="stat">
      <div class="stat-lbl">Engine alerts</div>
      <div class="stat-val ${critEngines ? 'red' : warnEngines ? 'or' : 'grn'}">${critEngines + warnEngines || '—'}</div>
    </div>
    <div class="stat">
      <div class="stat-lbl">Bilge alerts</div>
      <div class="stat-val ${critBilge ? 'red' : warnBilge ? 'or' : 'grn'}">${critBilge + warnBilge || '—'}</div>
    </div>
    <div class="stat">
      <div class="stat-lbl">Climate alerts</div>
      <div class="stat-val ${critClimate ? 'red' : 'grn'}">${critClimate || '—'}</div>
    </div>
  `;
};

Mon.renderEngines = function(s) {
  const wrap = document.getElementById('mon-engines');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="dash-section-title">Propulsion &amp; Generators</div>
    <div class="engine-grid">
      ${s.engines.map(e => `
        <div class="engine-card ${e.status}">
          <div class="engine-name">
            ${e.name}
            <span class="dot dot-${e.status === 'ok' ? 'grn' : e.status === 'warn' ? 'or' : e.status === 'standby' ? 'txt3' : 'red'} dot-pulse"></span>
          </div>
          <div class="engine-metrics">
            <div>
              <div class="engine-metric-lbl">RPM</div>
              <div class="engine-metric-val ${e.rpm === 0 ? '' : 'ok'}">${e.rpm === 0 ? 'Off' : e.rpm}</div>
            </div>
            <div>
              <div class="engine-metric-lbl">Coolant °C</div>
              <div class="engine-metric-val ${e.coolant > 90 ? 'crit' : e.coolant > 85 ? 'warn' : 'ok'}">${e.coolant}°</div>
            </div>
            <div>
              <div class="engine-metric-lbl">Oil °C</div>
              <div class="engine-metric-val ${e.oil > 100 ? 'crit' : e.oil > 90 ? 'warn' : 'ok'}">${e.oil}°</div>
            </div>
            <div>
              <div class="engine-metric-lbl">Hours</div>
              <div class="engine-metric-val">${e.hours.toLocaleString()}</div>
            </div>
          </div>
          ${e.status === 'warn' ? `
            <div style="margin-top:10px;padding:6px 8px;background:var(--or-bg);border-radius:6px;font-size:11px;color:var(--or)">
              ⚠ High coolant temp — WO-001 open
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
};

Mon.renderBilge = function(s) {
  const wrap = document.getElementById('mon-bilge');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="dash-section-title">Bilge levels</div>
    <div class="card" style="padding:14px 16px">
      ${s.bilge.map(b => `
        <div class="bilge-row">
          <div class="bilge-zone">${b.zone}</div>
          <div class="bilge-bar-wrap">
            <div class="bilge-bar ${b.status}" style="width:${Math.min(b.level * 5, 100)}%"></div>
          </div>
          <div class="bilge-val ${b.status === 'warn' ? 'c-or' : b.status === 'crit' ? 'c-red' : 'c-txt2'}">${b.level}%</div>
          <div class="bilge-pump">
            <span class="dot dot-${b.status === 'ok' ? 'grn' : 'or'}" style="width:5px;height:5px"></span>
            ${b.pump}
          </div>
        </div>
      `).join('')}
    </div>
  `;
};

Mon.renderClimate = function(s) {
  const wrap = document.getElementById('mon-climate');
  if (!wrap) return;

  wrap.innerHTML = `
    <div class="dash-section-title">Climate — zone temperatures</div>
    <div class="sensor-grid">
      ${s.climate.map(c => `
        <div class="sensor-card ${c.status}">
          <div class="sensor-dot dot-${c.status === 'ok' ? 'grn' : c.status === 'warn' ? 'or' : 'red'} dot-pulse"></div>
          <div class="sensor-zone">${c.zone}</div>
          <div class="sensor-type">Temperature · Humidity</div>
          <div class="sensor-val ${c.status}">${c.temp}°C</div>
          <div class="sensor-setpt">Set ${c.setpt}°C · ${c.humid}% RH</div>
          ${c.status === 'crit' ? `
            <div style="margin-top:8px;font-size:10px;color:var(--red)">
              A/C not reaching setpoint — WO-003
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
};

Mon.renderPower = function(s) {
  const wrap = document.getElementById('mon-power');
  if (!wrap) return;
  const p = s.power;
  const f = s.fuel;
  const fuelPct = Math.round(f.current_l / f.capacity_l * 100);

  wrap.innerHTML = `
    <div class="dash-section-title">Power &amp; Fuel</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px">
      ${[
        { lbl: 'Shore power', val: p.shorepower ? p.shorevoltage + 'V / ' + p.shorecurrent + 'A' : 'Disconnected', cls: p.shorepower ? 'ok' : 'crit' },
        { lbl: 'System load', val: p.load_kw + ' kW', cls: 'ok' },
        { lbl: 'House battery', val: p.battery_house + '%', cls: p.battery_house > 50 ? 'ok' : p.battery_house > 25 ? 'warn' : 'crit' },
        { lbl: 'Start battery', val: p.battery_start + '%', cls: 'ok' },
        { lbl: 'Fuel — total', val: fuelPct + '% (' + (f.current_l / 1000).toFixed(1) + 'kL)', cls: fuelPct > 40 ? 'ok' : fuelPct > 20 ? 'warn' : 'crit' },
        { lbl: 'Inverter', val: p.inverter, cls: 'ok' },
      ].map(item => `
        <div class="sensor-card">
          <div class="sensor-zone">${item.lbl}</div>
          <div class="sensor-val ${item.cls}" style="font-size:18px">${item.val}</div>
        </div>
      `).join('')}
    </div>

    <div class="dash-section-title" style="margin-top:16px">Fuel tanks</div>
    <div class="card" style="padding:14px 16px">
      ${[
        { zone: 'Main — Port', pct: f.main_port },
        { zone: 'Main — Starboard', pct: f.main_stbd },
        { zone: 'Day tank', pct: f.day_tank },
      ].map(t => `
        <div class="bilge-row">
          <div class="bilge-zone">${t.zone}</div>
          <div class="bilge-bar-wrap">
            <div class="bilge-bar ${t.pct < 20 ? 'crit' : t.pct < 35 ? 'warn' : ''}" style="width:${t.pct}%;background:${t.pct > 40 ? 'var(--grn)' : t.pct > 20 ? 'var(--or)' : 'var(--red)'}"></div>
          </div>
          <div class="bilge-val">${t.pct}%</div>
          <div class="bilge-pump c-txt3"></div>
        </div>
      `).join('')}
    </div>
  `;
};
