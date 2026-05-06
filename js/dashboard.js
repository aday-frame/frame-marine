/* ── FRAME MARINE — CAPTAIN'S BRIEF DASHBOARD ── */
'use strict';

const Dash = window.Dash = {};
Dash._ack = Dash._ack || new Set();

const _T = '2026-05-06'; // today reference for demo

/* ─── Helpers ───────────────────────────────────────────── */
function _du(s)  { if (!s) return null; return Math.ceil((new Date(s) - new Date(_T)) / 86400000); }
function _addD(d, n) { const x = new Date(d + 'T00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0,10); }
function _f(s)   { if (!s) return '—'; const [,m,d] = s.split('-'); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1]+' '+parseInt(d); }
function _dayFull(s) {
  const d = new Date(s + 'T00:00');
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()] + ' ' +
    d.getDate() + ' ' +
    ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()] + ' ' +
    d.getFullYear();
}
const _pill = (txt, color, bg) =>
  `<span style="display:inline-flex;align-items:center;font-size:11px;font-weight:500;padding:5px 11px;border-radius:20px;white-space:nowrap;background:${bg};color:${color}">${txt}</span>`;

/* ─── Main render ───────────────────────────────────────── */
Dash.render = function () {
  const wrap = document.getElementById('page-dashboard');
  if (!wrap) return;

  const v = FM.currentVessel();
  if (!v) {
    wrap.innerHTML = '<div style="padding:40px;text-align:center;color:var(--txt3)">No vessel selected.</div>';
    return;
  }

  /* data */
  const openWOs     = FM.openWOs(v.id);
  const highWOs     = openWOs.filter(w => w.priority === 'high');
  const overdueWOs  = openWOs.filter(w => w.due && w.due < _T);
  const crewAll     = (FM.crew || []).filter(c => c.vessel === v.id && c.id !== 'c1');
  const onboard     = crewAll.filter(c => c.status === 'onboard');
  const sensors     = FM.sensors?.[v.id];
  const warnEng     = sensors ? sensors.engines.filter(e => e.status === 'warn' || e.status === 'crit') : [];
  const violations  = (FM.hoursOfRest || [])
    .filter(r => r.vessel === v.id && r.date === _T && r.restHours < 10)
    .map(r => ({ ...r, _crew: crewAll.find(c => c.id === r.crewId) }));
  const docs         = (FM.vesselDocs || []).filter(d => d.vessel === v.id);
  const expiredDocs  = docs.filter(d => { const x = _du(d.expires); return x !== null && x < 0; });
  const expiringDocs = docs.filter(d => { const x = _du(d.expires); return x !== null && x >= 0 && x <= 90; });

  const inProgress  = openWOs.filter(w => w.status === 'in-progress');

  const futureEnd   = _addD(_T, 14);
  const todayEvts   = (FM.events || []).filter(e => e.vessel === v.id && e.start <= _T && e.end >= _T);
  const upcoming    = (FM.events || [])
    .filter(e => e.vessel === v.id && e.start > _T && e.start <= futureEnd)
    .sort((a,b) => a.start.localeCompare(b.start)).slice(0, 6);
  const nextCharter = (FM.events || [])
    .filter(e => e.vessel === v.id && e.type === 'charter' && e.end >= _T)
    .sort((a,b) => a.start.localeCompare(b.start))[0];

  /* alerts */
  const alerts = [];
  overdueWOs.forEach(w => alerts.push({ sev:'red',   title:w.title, sub:'Work order · Due '+_f(w.due)+' · Overdue', go:"navTo('work-orders',document.querySelector('[data-page=work-orders]'))" }));
  violations.forEach(r => r._crew && alerts.push({ sev:'red',   title:r._crew.name+' — Hours violation', sub:r.restHours+'h rest · minimum 10h required', go:"navTo('hours',document.querySelector('[data-page=hours]'))" }));
  warnEng.forEach(e => alerts.push({ sev:e.status==='crit'?'red':'amber', title:e.name+' — '+e.status.toUpperCase(), sub:'Current: '+e.value+(e.unit?' '+e.unit:''), go:"navTo('monitoring',document.querySelector('[data-page=monitoring]'))" }));
  highWOs.filter(w => !overdueWOs.includes(w)).forEach(w => alerts.push({ sev:'amber', title:w.title, sub:'High priority · Due '+_f(w.due), go:"navTo('work-orders',document.querySelector('[data-page=work-orders]'))" }));

  const allOK = alerts.length === 0;

  /* health tiles */
  const tiles = [
    { label:'Engines',      page:'monitoring',  sev:warnEng.length?'red':'ok',                                   val:warnEng.length?warnEng.length+' warning'+(warnEng.length>1?'s':''):'Normal',                     sub:'Port & starboard',    icon:'M2 6h12v4H2V6zm1 1v2h2V7H3zm3 0v2h2V7H6zm3 0v2h2V7H9zm3 0v2h2V7h-2z' },
    { label:'Crew',         page:'team',        sev:violations.length?'red':'ok',                                 val:onboard.length+' onboard',                                                                         sub:violations.length?violations.length+' violation'+(violations.length>1?'s':''):'All compliant', icon:'M5 4a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zM1 13.5a6 6 0 0114 0v.5H1v-.5z' },
    { label:'Documents',    page:'documents',   sev:expiredDocs.length?'red':expiringDocs.length?'amber':'ok',   val:expiredDocs.length?expiredDocs.length+' expired':expiringDocs.length?expiringDocs.length+' expiring':'All valid',           sub:'Certs & vessel docs', icon:'M4 1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4.5L9.5 1H4zm5 0v3.5H13' },
    { label:'Work orders',  page:'work-orders', sev:overdueWOs.length?'red':highWOs.length?'amber':'ok',         val:openWOs.length+' open',                                                                            sub:overdueWOs.length?overdueWOs.length+' overdue':highWOs.length?highWOs.length+' high priority':'No urgent items', icon:'M2 3a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 2v1h8V5H4zm0 3v1h8V8H4zm0 3v1h5v-1H4z' },
  ];

  /* ── HTML ─────────────────────────────────────────────── */
  wrap.innerHTML = `
    <div class="_dashwrap" style="max-width:1060px;padding:0 22px 60px;margin:0 auto">

      <!-- Brief header -->
      <div style="padding:22px 0 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;border-bottom:.5px solid var(--bd);margin-bottom:20px">
        <div>
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--txt3);margin-bottom:4px">Captain's brief</div>
          <div style="font-size:22px;font-weight:500;color:var(--txt);letter-spacing:-.02em">${_dayFull(_T)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:7px;height:7px;border-radius:50%;background:var(--grn)"></div>
          <span style="font-size:13px;font-weight:500;color:var(--txt)">${escHtml(v.name)}</span>
          <span style="font-size:12px;color:var(--txt3)">· ${escHtml(v.type)} · ${escHtml(v.port)}</span>
        </div>
      </div>

      <!-- Status pills -->
      <div style="display:flex;gap:6px;margin-bottom:20px;flex-wrap:wrap">
        ${_pill(onboard.length+' crew onboard', 'var(--txt2)', 'var(--bg3)')}
        ${_pill(openWOs.length+' open work orders', openWOs.length > 2 ? 'var(--yel)' : 'var(--txt2)', openWOs.length > 2 ? 'var(--yel-bg)' : 'var(--bg3)')}
        ${_pill(nextCharter ? 'Next charter: '+_f(nextCharter.start) : 'No charters scheduled', 'var(--or)', 'var(--or-bg)')}
        ${_pill(allOK ? '✓ All systems nominal' : '⚠ '+alerts.length+' item'+(alerts.length!==1?'s':'')+' need attention', allOK ? 'var(--grn)' : 'var(--red)', allOK ? 'var(--grn-bg)' : 'var(--red-bg)')}
      </div>

      <!-- Two-column brief grid -->
      <div class="_briefgrid" style="display:grid;grid-template-columns:1fr 292px;gap:14px;margin-bottom:14px">

        <!-- Left: alerts + schedule -->
        <div style="display:flex;flex-direction:column;gap:12px">

          <!-- Alerts card -->
          <div style="background:var(--bg2);border:.5px solid ${allOK?'var(--bd)':'var(--red-bd)'};border-radius:10px;overflow:hidden">
            <div style="padding:10px 14px;border-bottom:.5px solid var(--bd);display:flex;align-items:center;gap:8px">
              <div style="width:6px;height:6px;border-radius:50%;background:${allOK?'var(--grn)':'var(--red)'}"></div>
              <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:${allOK?'var(--txt3)':'var(--red)'}">
                ${allOK ? 'All clear' : 'Needs attention · '+alerts.length}
              </span>
            </div>
            ${alerts.length ? alerts.map(a => `
              <div onclick="${a.go}" style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-bottom:.5px solid var(--bd);cursor:pointer" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''">
                <div style="width:6px;height:6px;border-radius:50%;background:${a.sev==='red'?'var(--red)':'var(--yel)'};flex-shrink:0"></div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:12px;font-weight:500;color:var(--txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(a.title)}</div>
                  <div style="font-size:10px;color:var(--txt3)">${escHtml(a.sub)}</div>
                </div>
                <svg viewBox="0 0 16 16" style="width:11px;height:11px;color:var(--txt4);flex-shrink:0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 3l5 5-5 5"/></svg>
              </div>`).join('') : `
              <div style="padding:18px 14px;display:flex;align-items:center;gap:10px">
                <span style="font-size:18px">✓</span>
                <span style="font-size:12px;color:var(--txt3)">No urgent items — vessel running normally.</span>
              </div>`}
          </div>

          <!-- Today & upcoming -->
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;overflow:hidden">
            <div style="padding:10px 14px;border-bottom:.5px solid var(--bd)">
              <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt3)">Today & next 14 days</span>
            </div>
            ${[...todayEvts, ...upcoming].length ? [...todayEvts, ...upcoming].map(e => {
              const ec = e.type==='charter'?'var(--or)':e.type==='maintenance'?'var(--eng)':e.type==='regulatory'?'var(--red)':'var(--grn)';
              const isToday = e.start <= _T && e.end >= _T;
              return `<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-bottom:.5px solid var(--bd);${isToday?'background:var(--bg3)':''}">
                <div style="width:3px;height:34px;border-radius:2px;background:${ec};flex-shrink:0"></div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:12px;font-weight:500;color:var(--txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(e.title)}</div>
                  <div style="font-size:10px;color:var(--txt3)">${_f(e.start)}${e.end&&e.end!==e.start?' → '+_f(e.end):''}${isToday?' · <strong style="color:var(--or)">TODAY</strong>':''}</div>
                </div>
                <span style="font-size:9px;font-weight:600;padding:2px 7px;border-radius:4px;background:${e.type==='charter'?'var(--or-bg)':'var(--bg4)'};color:${e.type==='charter'?'var(--or)':'var(--txt3)'};text-transform:capitalize;white-space:nowrap;flex-shrink:0">${e.type}</span>
              </div>`;
            }).join('') : `<div style="padding:18px 14px"><span style="font-size:12px;color:var(--txt3)">Nothing coming up in the next 14 days.</span></div>`}
            <div style="padding:8px 14px">
              <button class="btn btn-ghost btn-xs" onclick="navTo('calendar',document.querySelector('[data-page=calendar]'))">View full calendar →</button>
            </div>
          </div>

        </div><!-- /left -->

        <!-- Right: health tiles + crew -->
        <div style="display:flex;flex-direction:column;gap:10px">

          ${tiles.map(h => {
            const sc = h.sev==='red'?'var(--red)':h.sev==='amber'?'var(--yel)':'var(--grn)';
            const bc = h.sev==='red'?'var(--red-bd)':h.sev==='amber'?'var(--yel-bd)':'var(--bd)';
            const ic = h.sev==='red'?'var(--red-bg)':h.sev==='amber'?'var(--yel-bg)':'var(--bg3)';
            return `<div onclick="navTo('${h.page}',document.querySelector('[data-page=${h.page}]'))" style="background:var(--bg2);border:.5px solid ${bc};border-radius:10px;padding:12px 14px;cursor:pointer;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background='var(--bg2)'">
              <div style="width:32px;height:32px;border-radius:8px;background:${ic};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <svg viewBox="0 0 16 16" fill="${sc}" style="width:13px;height:13px"><path d="${h.icon}"/></svg>
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:2px">${h.label}</div>
                <div style="font-size:13px;font-weight:600;color:${sc}">${h.val}</div>
                <div style="font-size:10px;color:var(--txt3)">${h.sub}</div>
              </div>
              <svg viewBox="0 0 16 16" style="width:10px;height:10px;color:var(--txt4);flex-shrink:0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 3l5 5-5 5"/></svg>
            </div>`;
          }).join('')}

          <!-- Crew at a glance -->
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:12px 14px">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt3);margin-bottom:10px">Crew</div>
            <div style="display:flex;flex-direction:column;gap:6px">
              ${crewAll.map(c => `
                <div style="display:flex;align-items:center;gap:8px;opacity:${c.status==='onboard'?'1':'.4'}">
                  <div style="width:22px;height:22px;border-radius:50%;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#080808;flex-shrink:0">${c.initials}</div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:11px;font-weight:500;color:var(--txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(c.name)}</div>
                    <div style="font-size:9px;color:var(--txt3)">${escHtml(c.role)}</div>
                  </div>
                  <div style="width:6px;height:6px;border-radius:50%;background:${c.status==='onboard'?'var(--grn)':'var(--txt4)'}"></div>
                </div>`).join('')}
            </div>
            <button class="btn btn-ghost btn-xs" style="margin-top:10px;width:100%;justify-content:center" onclick="navTo('team',document.querySelector('[data-page=team]'))">Manage crew →</button>
          </div>

        </div><!-- /right -->

      </div><!-- /brief grid -->

      <!-- Open work orders -->
      <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;overflow:hidden">
        <div style="padding:10px 14px;border-bottom:.5px solid var(--bd);display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt3)">Open work orders</span>
          <button class="btn btn-ghost btn-xs" onclick="navTo('work-orders',document.querySelector('[data-page=work-orders]'))">View all</button>
        </div>
        ${openWOs.length ? openWOs.slice(0,5).map(w => {
          const ass  = crewAll.find(c => c.id === w.assignee);
          const late = w.due && w.due < _T;
          const pc   = w.priority==='high'?'var(--red)':w.priority==='medium'?'var(--yel)':'var(--txt4)';
          return `<div onclick="navTo('work-orders',document.querySelector('[data-page=work-orders]'))" class="_wogrid" style="display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:12px;padding:10px 14px;border-bottom:.5px solid var(--bd);cursor:pointer" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''">
            <div style="width:6px;height:6px;border-radius:50%;background:${pc}"></div>
            <div style="min-width:0">
              <div style="font-size:12px;font-weight:500;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escHtml(w.title)}</div>
              <div style="font-size:10px;color:var(--txt3)">${escHtml(w.zone)} · ${escHtml(w.system)}</div>
            </div>
            ${ass ? `<div style="width:22px;height:22px;border-radius:50%;background:${ass.color};display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#080808;flex-shrink:0">${ass.initials}</div>` : '<div></div>'}
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:10px;font-weight:${late?'600':'400'};color:${late?'var(--red)':'var(--txt3)'}">${w.due?_f(w.due):'No due date'}</div>
              ${late ? '<div style="font-size:9px;color:var(--red)">Overdue</div>' : ''}
            </div>
          </div>`;
        }).join('') : `<div style="padding:24px;text-align:center;font-size:12px;color:var(--txt3)">No open work orders — looking good.</div>`}
      </div>

    </div>
  `;

  /* inject responsive rule once */
  if (!document.getElementById('_dash_css')) {
    const s = document.createElement('style');
    s.id = '_dash_css';
    s.textContent = [
      '@media(max-width:900px){._briefgrid{grid-template-columns:1fr!important}}',
      '@media(max-width:768px){._dashwrap{padding:0 14px 60px!important}}',
      '@media(max-width:768px){._wogrid{grid-template-columns:auto 1fr auto!important}}',
    ].join('');
    document.head.appendChild(s);
  }
};

Dash.acknowledge = function (key) { Dash._ack.add(key); Dash.render(); };
