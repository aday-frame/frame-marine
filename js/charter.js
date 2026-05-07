/* ── CHARTER MODULE ── */
'use strict';

const Charter = window.Charter = {};

/* ── HELPERS ── */
function _chFmt(s) {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + +d + ', ' + y;
}

function _chStatus(c) {
  if (c.status === 'active')    return '<span class="badge b-blue">Active</span>';
  if (c.status === 'upcoming')  return '<span class="badge b-hold">Upcoming</span>';
  return '<span class="badge" style="background:var(--bg3);color:var(--txt3)">Completed</span>';
}

Charter._visible = function() {
  const all = FM.charters.filter(c =>
    App.currentVesselId === 'all' || App.currentVesselId === 'portfolio' || c.vessel === App.currentVesselId
  );
  const order = { active: 0, upcoming: 1, completed: 2 };
  return all.sort((a, b) => (order[a.status] - order[b.status]) || new Date(b.start) - new Date(a.start));
};

/* ── LIST PAGE ── */
Charter.render = function() {
  const wrap = document.getElementById('page-charter');
  if (!wrap) return;

  const charters = Charter._visible();
  const active    = charters.filter(c => c.status === 'active').length;
  const upcoming  = charters.filter(c => c.status === 'upcoming').length;
  const completed = charters.filter(c => c.status === 'completed').length;

  const rows = charters.map(c => {
    const vessel = FM.vessels.find(v => v.id === c.vessel);
    const apaExp = (c.apaExpenses || []).reduce((s, e) => s + e.amount, 0);
    const apaLeft = c.apa ? c.apa - apaExp : null;
    return `<tr style="cursor:pointer" onclick="Charter.openDetail('${c.id}')">
      <td>
        <div style="font-size:13px;font-weight:500;color:var(--txt)">${escHtml(c.name)}</div>
        <div style="font-size:11px;color:var(--txt3);margin-top:1px">${_chFmt(c.start)} – ${_chFmt(c.end)}</div>
      </td>
      <td style="font-size:12px;color:var(--txt2)">${vessel ? escHtml(vessel.name) : '—'}</td>
      <td style="font-size:12px;color:var(--txt2)">${c.guests ? c.guests.length : 0}</td>
      <td style="font-size:12px;color:var(--txt2)">$${(c.fee / 1000).toFixed(0)}k</td>
      <td style="font-size:12px;color:var(--txt2)">${apaLeft !== null ? '$' + (apaLeft / 1000).toFixed(0) + 'k left' : '—'}</td>
      <td style="font-size:12px;color:var(--txt2)">${c.broker ? escHtml(c.broker.split(' ')[0]) : '—'}</td>
      <td>${_chStatus(c)}</td>
      <td onclick="event.stopPropagation()">
        <button class="btn btn-ghost btn-xs" onclick="Charter.remove('${c.id}')">Remove</button>
      </td>
    </tr>`;
  }).join('');

  const empty = `<div class="empty"><div class="empty-title">No charters yet</div><div class="empty-sub">Add your first charter booking above</div></div>`;

  wrap.innerHTML = `
    <div style="padding:0 0 60px">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);border-bottom:.5px solid var(--bd);margin-bottom:0">
        <div class="wo-stat"><div class="wo-stat-num">${charters.length}</div><div class="wo-stat-lbl">Total</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:#2dd4bf">${active}</div><div class="wo-stat-lbl">Active</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:var(--yel)">${upcoming}</div><div class="wo-stat-lbl">Upcoming</div></div>
        <div class="wo-stat" style="border-right:none"><div class="wo-stat-num" style="color:var(--txt3)">${completed}</div><div class="wo-stat-lbl">Completed</div></div>
      </div>

      <div style="display:flex;justify-content:flex-end;padding:16px 20px">
        <button class="btn btn-primary btn-sm" onclick="Charter.openNew()">+ New charter</button>
      </div>

      ${charters.length === 0 ? `<div style="padding:0 20px">${empty}</div>` : `<div class="tbl-wrap"><table class="tbl">
        <thead><tr>
          <th>Charter</th>
          <th style="width:120px">Vessel</th>
          <th style="width:70px">Guests</th>
          <th style="width:80px">Fee</th>
          <th style="width:100px">APA</th>
          <th style="width:110px">Broker</th>
          <th style="width:110px">Status</th>
          <th style="width:80px"></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table></div>`}
    </div>`;
};

/* ── DETAIL PANEL ── */
Charter.openDetail = function(id) {
  const c = FM.charters.find(x => x.id === id);
  if (!c) return;

  const vessel   = FM.vessels.find(v => v.id === c.vessel);
  const apaExp   = (c.apaExpenses || []).reduce((s, e) => s + e.amount, 0);
  const apaLeft  = c.apa ? c.apa - apaExp : null;

  const meta = (label, val) =>
    `<div style="background:var(--bg3);border-radius:8px;padding:10px 12px">
      <div style="font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">${label}</div>
      <div style="font-size:12px;color:var(--txt2)">${val}</div>
    </div>`;

  const itineraryRows = (c.itinerary || []).map(d =>
    `<div style="display:flex;gap:10px;padding:8px 0;border-bottom:.5px solid var(--bd)">
      <div style="font-size:11px;color:var(--txt3);white-space:nowrap;width:60px;flex-shrink:0">${_chFmt(d.date).slice(0,6)}</div>
      <div>
        <div style="font-size:12px;font-weight:500;color:var(--txt)">${escHtml(d.location)}</div>
        ${d.notes ? `<div style="font-size:11px;color:var(--txt3);margin-top:2px">${escHtml(d.notes)}</div>` : ''}
      </div>
    </div>`
  ).join('');

  const docRows = (c.documents || []).map(d =>
    `<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:.5px solid var(--bd)">
      <div style="font-size:12px;color:var(--txt)">${escHtml(d.name)}</div>
      <div style="font-size:10px;color:var(--txt4)">${d.date ? _chFmt(d.date) : 'Pending'}</div>
    </div>`
  ).join('');

  openPanel(`
    <div style="padding:20px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        ${_chStatus(c)}
      </div>
      <div style="font-size:16px;font-weight:600;color:var(--txt);margin-bottom:16px;letter-spacing:-.01em">${escHtml(c.name)}</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px">
        ${meta('Start', _chFmt(c.start))}
        ${meta('End', _chFmt(c.end))}
        ${meta('Vessel', vessel ? escHtml(vessel.name) : '—')}
        ${meta('Guests', c.guests ? c.guests.length + ' pax' : '—')}
        ${meta('Charter fee', '$' + c.fee.toLocaleString() + ' ' + (c.currency || 'USD'))}
        ${c.apa ? meta('APA balance', '$' + (apaLeft || 0).toLocaleString() + ' remaining') : ''}
        ${meta('Broker', c.broker ? escHtml(c.broker) : '—')}
        ${meta('Embark', c.embark ? escHtml(c.embark) : '—')}
        ${meta('Disembark', c.disembark ? escHtml(c.disembark) : '—')}
      </div>

      ${c.itinerary && c.itinerary.length ? `
        <div style="margin-bottom:20px">
          <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:8px">Itinerary</div>
          ${itineraryRows}
        </div>` : ''}

      ${c.documents && c.documents.length ? `
        <div style="margin-bottom:20px">
          <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:8px">Documents</div>
          ${docRows}
        </div>` : ''}

      <div style="display:flex;gap:8px;padding-top:16px;border-top:.5px solid var(--bd)">
        <button class="btn btn-ghost btn-sm" onclick="closePanel()">Close</button>
        <button class="btn btn-danger btn-sm" style="margin-left:auto" onclick="closePanel();Charter.remove('${c.id}')">Remove</button>
      </div>
    </div>
  `);
};

/* ── NEW CHARTER MODAL ── */
Charter.openNew = function() {
  const vesselOpts = FM.vessels.map(v => `<option value="${v.id}">${escHtml(v.name)}</option>`).join('');
  openModal(`
    <form onsubmit="Charter.save(event)" style="display:flex;flex-direction:column;gap:14px">
      <div>
        <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Charter name *</label>
        <input class="inp" id="ch-name" placeholder="e.g. Bermuda Summer — Day Family" required>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Vessel *</label>
          <select class="inp" id="ch-vessel">${vesselOpts}</select>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Status</label>
          <select class="inp" id="ch-status">
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Start date *</label>
          <input class="inp" id="ch-start" type="date" required>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">End date *</label>
          <input class="inp" id="ch-end" type="date" required>
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Charter fee (USD)</label>
          <input class="inp" id="ch-fee" type="number" placeholder="185000">
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">APA advance (USD)</label>
          <input class="inp" id="ch-apa" type="number" placeholder="37000">
        </div>
      </div>
      <div>
        <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Broker</label>
        <input class="inp" id="ch-broker" placeholder="e.g. Burgess Yachts">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Embarkation port</label>
          <input class="inp" id="ch-embark" placeholder="Gustavia, St. Barths">
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--txt3);display:block;margin-bottom:5px">Disembarkation port</label>
          <input class="inp" id="ch-disembark" placeholder="Hamilton, Bermuda">
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
        <button type="button" class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm">Add charter</button>
      </div>
    </form>
  `, 'New charter');
};

Charter.save = function(e) {
  e.preventDefault();
  const name = document.getElementById('ch-name').value.trim();
  const start = document.getElementById('ch-start').value;
  const end   = document.getElementById('ch-end').value;
  if (!name || !start || !end) return;

  FM.charters.push({
    id:         'ch-' + Date.now(),
    vessel:     document.getElementById('ch-vessel').value,
    status:     document.getElementById('ch-status').value,
    name,
    start,
    end,
    fee:        parseInt(document.getElementById('ch-fee').value) || 0,
    apa:        parseInt(document.getElementById('ch-apa').value) || 0,
    broker:     document.getElementById('ch-broker').value.trim() || '',
    embark:     document.getElementById('ch-embark').value.trim() || '',
    disembark:  document.getElementById('ch-disembark').value.trim() || '',
    guests:     [],
    itinerary:  [],
    documents:  [],
    apaExpenses:[],
    costs:      [],
    currency:   'USD',
  });

  closeModal();
  Charter.render();
  showToast('Charter added', 'ok');
};

Charter.remove = function(id) {
  const c = FM.charters.find(x => x.id === id);
  if (!c || !confirm('Remove "' + c.name + '"?')) return;
  FM.charters = FM.charters.filter(x => x.id !== id);
  Charter.render();
  showToast('Charter removed');
};
