/* ── HOURS OF REST MODULE ── */
const Hours = (() => {
  let _crewId = null;

  function _vessel() { return FM.currentVessel(); }
  function _crewList() {
    const v = _vessel();
    return (FM.crew || []).filter(c => c.id !== 'c1' && (!v || c.vessel === v.id));
  }
  function _records(crewId) {
    const v = _vessel();
    return (FM.hoursOfRest || []).filter(r => r.crewId === crewId && (!v || r.vessel === v.id));
  }

  function _last7() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date('2026-05-06');
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0,10));
    }
    return days;
  }

  function _fmtDay(dateStr) {
    const [y, m, d] = dateStr.split('-');
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(dateStr).getDay()] + ' ' +
           parseInt(d) + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1];
  }

  function _violation(rec) {
    if (!rec) return null;
    if (rec.restHours < 10) return 'Less than 10h rest in 24h';
    return null;
  }

  function render() {
    const wrap = document.getElementById('page-hours');
    if (!wrap) return;
    const crew = _crewList();
    if (!crew.length) {
      wrap.innerHTML = `<div style="padding:40px;text-align:center;color:var(--txt3)">No crew on record.</div>`;
      return;
    }
    if (!_crewId || !crew.find(c => c.id === _crewId)) _crewId = crew[0].id;
    const selected = crew.find(c => c.id === _crewId);
    const days     = _last7();
    const recs     = _records(_crewId);
    const weekRest = recs.filter(r => days.includes(r.date)).reduce((s, r) => s + r.restHours, 0);
    const weekViolations = recs.filter(r => days.includes(r.date) && _violation(r));

    wrap.innerHTML = `
      <div style="max-width:860px;padding:18px 20px 48px">

        <!-- Header -->
        <div style="margin-bottom:24px">
          <div style="font-size:20px;font-weight:500;color:var(--txt)">Hours of Rest</div>
          <div style="font-size:11px;color:var(--txt3);margin-top:2px">IMO/STCW compliance · Last 7 days</div>
        </div>

        <!-- IMO rules banner -->
        <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:14px 16px;margin-bottom:20px;display:flex;gap:24px;flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--blu)"></div>
            <span style="font-size:11px;color:var(--txt2)"><strong>Rule 1:</strong> Minimum <strong>10 hours</strong> rest in any 24-hour period</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--blu)"></div>
            <span style="font-size:11px;color:var(--txt2)"><strong>Rule 2:</strong> Minimum <strong>77 hours</strong> rest in any 7-day period</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:8px;height:8px;border-radius:50%;background:var(--blu)"></div>
            <span style="font-size:11px;color:var(--txt2)"><strong>Rule 3:</strong> Rest may be split into <strong>no more than 2 periods</strong>, one ≥ 6h</span>
          </div>
        </div>

        <!-- Crew selector -->
        <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
          ${crew.map(c => {
            const crewRecs = _records(c.id);
            const crewDays = _last7();
            const hasViolation = crewRecs.some(r => crewDays.includes(r.date) && _violation(r));
            const sel = c.id === _crewId;
            return `
            <button onclick="Hours.selectCrew('${c.id}')"
              style="display:flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px;cursor:pointer;border:1.5px solid;transition:all .15s;
                     ${sel ? 'background:var(--bg2);border-color:var(--txt2)' : 'background:transparent;border-color:var(--bd)'}">
              <div style="width:26px;height:26px;border-radius:50%;background:${c.color};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#080808;flex-shrink:0">${c.initials}</div>
              <div style="text-align:left">
                <div style="font-size:12px;font-weight:${sel?'600':'400'};color:var(--txt)">${escHtml(c.name.split(' ')[0])}</div>
                <div style="font-size:9px;color:var(--txt3)">${escHtml(c.role)}</div>
              </div>
              ${hasViolation ? `<span style="width:7px;height:7px;border-radius:50%;background:var(--red);flex-shrink:0"></span>` : ''}
            </button>`;
          }).join('')}
        </div>

        <!-- Week status -->
        <div class="kpi-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:14px 16px">
            <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:4px">Week rest hours</div>
            <div style="font-size:22px;font-weight:500;color:${weekRest >= 77 ? 'var(--grn)' : 'var(--red)'}">${weekRest}h</div>
            <div style="font-size:10px;color:var(--txt3)">Min 77h required · ${weekRest >= 77 ? '✓ Compliant' : '⚠ ' + (77 - weekRest) + 'h short'}</div>
          </div>
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:14px 16px">
            <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:4px">Daily violations</div>
            <div style="font-size:22px;font-weight:500;color:${weekViolations.length ? 'var(--red)' : 'var(--grn)'}">${weekViolations.length}</div>
            <div style="font-size:10px;color:var(--txt3)">${weekViolations.length ? 'Days with <10h rest' : 'All days compliant'}</div>
          </div>
          <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:14px 16px">
            <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:4px">Status</div>
            <div style="font-size:14px;font-weight:600;margin-top:4px;color:${weekViolations.length || weekRest < 77 ? 'var(--red)' : 'var(--grn)'}">
              ${weekViolations.length || weekRest < 77 ? '⚠ Attention' : '✓ Compliant'}
            </div>
            <div style="font-size:10px;color:var(--txt3)">${escHtml(selected.name.split(' ')[0])}'s 7-day record</div>
          </div>
        </div>

        <!-- Daily log -->
        <div style="border-radius:10px;overflow:hidden;margin-bottom:16px;border:.5px solid var(--bd)">
        <div class="tbl-scroll">
        <div style="background:var(--bg2);min-width:560px">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:.5px solid var(--bd)">
            <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3)">Daily record — ${escHtml(selected.name)}</span>
            <button class="btn btn-primary btn-sm" onclick="Hours.openLog()">+ Log hours</button>
          </div>
          ${days.map(date => {
            const rec  = recs.find(r => r.date === date);
            const viol = rec ? _violation(rec) : null;
            const isToday = date === '2026-05-06';
            return `
            <div style="display:grid;grid-template-columns:160px 1fr 1fr 80px 120px;align-items:center;padding:11px 16px;border-bottom:.5px solid var(--bd);${isToday ? 'background:var(--bg3)' : ''}">
              <div>
                <div style="font-size:12px;font-weight:${isToday?'600':'400'};color:${isToday?'var(--txt)':'var(--txt2)'}">${_fmtDay(date)}</div>
                ${isToday ? `<div style="font-size:9px;color:var(--or);font-weight:600">TODAY</div>` : ''}
              </div>
              ${rec ? `
                <div>
                  <div style="font-size:10px;color:var(--txt3);margin-bottom:3px">Work</div>
                  <div style="font-size:14px;font-weight:600;color:var(--txt)">${rec.workHours}h</div>
                </div>
                <div>
                  <div style="font-size:10px;color:var(--txt3);margin-bottom:3px">Rest</div>
                  <div style="font-size:14px;font-weight:600;color:${rec.restHours < 10 ? 'var(--red)' : 'var(--grn)'}">${rec.restHours}h</div>
                </div>
                <div>
                  <div style="height:6px;background:var(--bg4);border-radius:3px;overflow:hidden;width:60px">
                    <div style="height:100%;width:${Math.round(rec.restHours/24*100)}%;background:${rec.restHours<10?'var(--red)':'var(--grn)'};border-radius:3px"></div>
                  </div>
                  <div style="font-size:9px;color:var(--txt3);margin-top:2px">${Math.round(rec.restHours/24*100)}% rest</div>
                </div>
                <div style="text-align:right">
                  ${viol
                    ? `<span style="font-size:10px;font-weight:600;color:var(--red);background:rgba(239,68,68,.1);padding:3px 8px;border-radius:4px">⚠ Violation</span>`
                    : `<span style="font-size:10px;font-weight:600;color:var(--grn)">✓ OK</span>`}
                </div>
              ` : `
                <div style="grid-column:span 3;font-size:11px;color:var(--txt3);font-style:italic">No hours logged</div>
                <div style="text-align:right">
                  <button class="btn btn-ghost btn-xs" onclick="Hours.openLog('${date}')">Log</button>
                </div>
              `}
            </div>`;
          }).join('')}
        </div>
        </div>
        </div>

        <div style="font-size:11px;color:var(--txt3)">
          Hours of rest must be logged daily per STCW regulation VIII/1. Violations must be reported to the Master and corrected immediately.
        </div>
      </div>
    `;
  }

  function selectCrew(id) { _crewId = id; render(); }

  function openLog(date) {
    openModal(`
      <div style="display:flex;flex-direction:column;gap:14px">
        <div>
          <label class="inp-lbl">Date</label>
          <input class="inp" id="hor-date" type="date" value="${date || '2026-05-06'}">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label class="inp-lbl">Work hours</label>
            <input class="inp" id="hor-work" type="number" min="0" max="24" step="0.5" placeholder="e.g. 10">
          </div>
          <div>
            <label class="inp-lbl">Rest hours (auto)</label>
            <input class="inp" id="hor-rest" type="number" min="0" max="24" step="0.5" placeholder="Will auto-calculate">
          </div>
        </div>
        <div style="background:var(--bg3);border-radius:6px;padding:10px;font-size:11px;color:var(--txt3)">
          Work + Rest must equal 24. If you enter work hours, rest is calculated automatically.
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Hours.saveLog()">Save entry</button>
        </div>
      </div>
    `, 'Log hours of rest');

    const workEl = document.getElementById('hor-work');
    const restEl = document.getElementById('hor-rest');
    if (workEl && restEl) {
      workEl.addEventListener('input', () => {
        const w = parseFloat(workEl.value);
        if (!isNaN(w) && w >= 0 && w <= 24) restEl.value = (24 - w).toFixed(1);
      });
    }
  }

  function saveLog() {
    const date  = document.getElementById('hor-date')?.value;
    const work  = parseFloat(document.getElementById('hor-work')?.value);
    const rest  = parseFloat(document.getElementById('hor-rest')?.value);
    if (!date || isNaN(work) || isNaN(rest)) { showToast('Fill in date and hours', 'error'); return; }
    if (Math.abs(work + rest - 24) > 0.1) { showToast('Work + rest must equal 24 hours', 'error'); return; }
    if (!FM.hoursOfRest) FM.hoursOfRest = [];
    const v = _vessel();
    const existing = FM.hoursOfRest.find(r => r.crewId === _crewId && r.date === date);
    if (existing) {
      existing.workHours = work;
      existing.restHours = rest;
    } else {
      FM.hoursOfRest.push({ id:'hor-' + Date.now(), vessel: v ? v.id : 'v1', crewId:_crewId, date, workHours:work, restHours:rest });
    }
    closeModal();
    render();
    const viol = rest < 10 ? '⚠ Violation — less than 10h rest' : '';
    showToast(viol || 'Hours logged ✓');
  }

  return { render, selectCrew, openLog, saveLog };
})();

window.Hours = Hours;
