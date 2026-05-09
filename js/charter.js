/* ── CHARTER MODULE ── */
'use strict';

const Charter = window.Charter = {};

Charter._view      = 'list'; // 'list' | 'detail'
Charter._detailId  = null;
Charter._activeTab = 'overview';

/* ── HELPERS ── */
function _chFmt(s) {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + +d + ', ' + y;
}
function _chFmtShort(s) {
  if (!s) return '—';
  const [y, m, d] = s.split('-');
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + +d;
}
function _chStatusBadge(c) {
  if (c.status === 'active')   return '<span class="badge b-blue">Active</span>';
  if (c.status === 'upcoming') return '<span class="badge b-hold">Upcoming</span>';
  return '<span class="badge" style="background:var(--bg3);color:var(--txt3)">Completed</span>';
}
function _chMeta(label, val) {
  return `<div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;padding:10px 14px">
    <div style="font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">${label}</div>
    <div style="font-size:13px;color:var(--txt2)">${val}</div>
  </div>`;
}

/* ── PORT COORDINATES ── */
const _PORTS = {
  'gustavia':             [17.8961, -62.8511],
  'st. barths':           [17.9000, -62.8300],
  'st barths':            [17.9000, -62.8300],
  'île fourchue':         [17.9167, -62.8833],
  'colombier':            [17.9256, -62.8794],
  'colombier beach':      [17.9256, -62.8794],
  'grand cul-de-sac':     [17.9511, -62.7994],
  'sandy ground':         [18.2153, -63.0544],
  'anguilla':             [18.2204, -63.0686],
  'prickly pear':         [18.2306, -62.9933],
  'meads bay':            [18.2403, -63.0819],
  'dawn beach':           [18.0258, -63.0133],
  'st. maarten':          [18.0340, -63.0530],
  'st maarten':           [18.0340, -63.0530],
  'sint maarten':         [18.0340, -63.0530],
  'hamilton':             [32.2944, -64.7839],
  'bermuda':              [32.3078, -64.7505],
  'fort lauderdale':      [26.1224, -80.1373],
  'newport':              [41.4901, -71.3128],
  'antigua':              [17.1274, -61.8468],
  'chesapeake':           [38.7223, -76.3122],
  'miami':                [25.7617, -80.1918],
  'nassau':               [25.0480, -77.3561],
  'st. thomas':           [18.3381, -64.8941],
  'st thomas':            [18.3381, -64.8941],
  'tortola':              [18.4307, -64.6235],
  'virgin gorda':         [18.4985, -64.4377],
  'st. lucia':            [13.9094, -60.9789],
  'barbados':             [13.1939, -59.5432],
  'martinique':           [14.6415, -61.0242],
  'guadeloupe':           [16.3000, -61.5000],
  'turks':                [21.7000, -71.8000],
  'palma de mallorca':    [39.5696,   2.6502],
  'palma':                [39.5696,   2.6502],
  'mallorca':             [39.5696,   2.6502],
  'cabrera':              [39.1505,   2.9357],
  'ibiza':                [38.9067,   1.4321],
  'ibiza town':           [38.9067,   1.4321],
  'portofino':            [44.3031,   9.2083],
  'monaco':               [43.7384,   7.4246],
  'nice':                 [43.7102,   7.2620],
  'cannes':               [43.5528,   7.0174],
  'antibes':              [43.5804,   7.1282],
  'saint-tropez':         [43.2727,   6.6407],
  'st tropez':            [43.2727,   6.6407],
  'amalfi':               [40.6340,  14.6027],
  'capri':                [40.5534,  14.2427],
  'dubrovnik':            [42.6507,  18.0944],
  'split':                [43.5081,  16.4402],
  'corfu':                [39.6243,  19.9217],
  'mykonos':              [37.4467,  25.3289],
  'santorini':            [36.3932,  25.4615],
  'athens':               [37.9838,  23.7275],
};

function _lookupPort(str) {
  if (!str) return null;
  const s = str.toLowerCase().replace(/\s+/g, ' ').trim();
  if (_PORTS[s]) return _PORTS[s];
  // Try first segment before comma/dash
  const seg = s.split(/[,—–-]/)[0].trim();
  if (_PORTS[seg]) return _PORTS[seg];
  // Partial key match
  for (const [k, v] of Object.entries(_PORTS)) {
    if (s.includes(k) || k.includes(seg)) return v;
  }
  return null;
}

/* ── ROUTE MAP (Leaflet placeholder) ── */
function _routeMapEl() {
  return `<div id="charter-map" style="height:280px;border-radius:12px;overflow:hidden;margin-bottom:18px;border:.5px solid var(--bd);background:var(--bg3)"></div>`;
}

/* ── MINI SVG ROUTE (list hero cards only) ── */
function _routeMiniSVG(c) {
  const ports = (c.itinerary && c.itinerary.length)
    ? c.itinerary.map(d => d.location.split(/[,—]/)[0].trim())
    : [c.embark, c.disembark].filter(Boolean).map(p => p.split(',')[0].trim());
  if (ports.length < 2) return '';
  const W = 600, H = 56, padX = 50, n = ports.length;
  const xs = ports.map((_, i) => padX + i * (W - 2*padX) / (n-1));
  const ys = ports.map((_, i) => 20 + (i % 2 === 0 ? 0 : 10));
  let pathD = `M ${xs[0]},${ys[0]}`;
  for (let i = 1; i < n; i++) {
    const mx = xs[i-1] + (xs[i]-xs[i-1])*0.5;
    pathD += ` Q ${mx},${ys[i-1]} ${xs[i]},${ys[i]}`;
  }
  const dots = ports.map((p, i) => {
    const end = i === 0 || i === n-1;
    return `<circle cx="${xs[i]}" cy="${ys[i]}" r="${end?5:3}" fill="var(--bg)" stroke="${end?'#F97316':'rgba(249,115,22,.5)'}" stroke-width="1.5"/>
      <text x="${xs[i]}" y="${ys[i]+14}" text-anchor="middle" fill="rgba(255,255,255,.4)" font-size="8" font-family="inherit">${escHtml(p)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;overflow:visible;margin:10px 0 4px">
    <path d="${pathD}" fill="none" stroke="#F97316" stroke-width="1.5" stroke-dasharray="6,4" opacity=".6"/>
    ${dots}
  </svg>`;
}

/* ── LEAFLET MAP INIT ── */
Charter._map = null;

Charter._initMap = function(c, vessel) {
  const el = document.getElementById('charter-map');
  if (!el || typeof L === 'undefined') return;

  if (Charter._map) { Charter._map.remove(); Charter._map = null; }

  // Build ordered port list from itinerary or embark/disembark
  const rawPorts = (c.itinerary && c.itinerary.length)
    ? c.itinerary.map(d => d.location)
    : [c.embark, c.disembark].filter(Boolean);

  const points = [];
  rawPorts.forEach(loc => {
    // Skip pure "Sailing — X to Y" day-at-sea entries
    if (/^sailing\s*[—–-]/i.test(loc)) return;
    const coords = _lookupPort(loc);
    if (coords) {
      const label = loc.split(/[,—–]/)[0].trim();
      points.push({ coords, label, loc });
    }
  });

  if (points.length < 2) {
    el.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.25);font-size:12px">Map data unavailable for this route</div>';
    return;
  }

  const map = L.map(el, {
    zoomControl: true,
    attributionControl: false,
    scrollWheelZoom: false,
  });
  map.zoomControl.setPosition('bottomright');
  Charter._map = map;

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd', maxZoom: 19,
  }).addTo(map);

  const latlngs = points.map(p => p.coords);

  // Dashed orange route line
  L.polyline(latlngs, {
    color: '#F97316', weight: 2.5, opacity: 0.75, dashArray: '8 6',
  }).addTo(map);

  // Port markers
  points.forEach((p, i) => {
    const isEnd = i === 0 || i === points.length - 1;
    const sz = isEnd ? 12 : 8;
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${isEnd ? '#F97316' : 'rgba(249,115,22,.55)'};border:2px solid ${isEnd ? '#fff' : 'rgba(249,115,22,.8)'};box-shadow:0 0 ${isEnd ? 8 : 4}px rgba(249,115,22,.5)"></div>`,
      iconSize: [sz, sz], iconAnchor: [sz/2, sz/2],
    });
    const m = L.marker(p.coords, { icon }).addTo(map);
    m.bindTooltip(p.label, {
      permanent: isEnd,
      direction: i === 0 ? 'right' : i === points.length-1 ? 'left' : 'top',
      className: 'ch-map-tip',
      offset: [0, -sz/2 - 2],
    });
    if (!isEnd) m.openTooltip();
  });

  // Vessel position for active charters
  if (c.status === 'active' && c.start && c.end) {
    const prog = Math.min(1, Math.max(0,
      (Date.now() - new Date(c.start).getTime()) /
      (new Date(c.end).getTime() - new Date(c.start).getTime())
    ));
    const n = latlngs.length;
    const seg = prog * (n - 1);
    const i1 = Math.min(Math.floor(seg), n - 2);
    const t = seg - i1;
    const lat = latlngs[i1][0] + (latlngs[i1+1][0] - latlngs[i1][0]) * t;
    const lng = latlngs[i1][1] + (latlngs[i1+1][1] - latlngs[i1][1]) * t;

    const vesselIcon = L.divIcon({
      className: '',
      html: `<div style="position:relative;width:24px;height:24px">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(249,115,22,.15);animation:none"></div>
        <div style="position:absolute;inset:4px;border-radius:50%;background:rgba(249,115,22,.35);border:1.5px solid #F97316"></div>
        <div style="position:absolute;inset:9px;border-radius:50%;background:#F97316"></div>
      </div>`,
      iconSize: [24, 24], iconAnchor: [12, 12],
    });
    const vName = vessel ? vessel.name : 'Vessel';
    L.marker([lat, lng], { icon: vesselIcon }).addTo(map)
      .bindTooltip(vName, { permanent: true, direction: 'top', className: 'ch-map-tip', offset: [0, -14] })
      .openTooltip();
  }

  // Fit bounds with generous padding
  map.fitBounds(L.latLngBounds(latlngs).pad(0.25), { animate: false, maxZoom: 10 });
};

/* ── VISIBLE CHARTERS ── */
Charter._visible = function() {
  const all = FM.charters.filter(c =>
    App.currentVesselId === 'all' || App.currentVesselId === 'portfolio' || c.vessel === App.currentVesselId
  );
  const order = { active: 0, upcoming: 1, completed: 2 };
  return all.sort((a, b) => (order[a.status] - order[b.status]) || new Date(b.start) - new Date(a.start));
};

/* ── ENTRY POINT ── */
Charter.render = function() {
  if (Charter._view === 'detail' && Charter._detailId) {
    Charter._renderDetail();
  } else {
    Charter._renderList();
  }
};

/* ══════════════════════════════
   LIST VIEW
══════════════════════════════ */
Charter._renderList = function() {
  Charter._view = 'list';
  const wrap = document.getElementById('page-charter');
  if (!wrap) return;

  const charters = Charter._visible();
  const active    = charters.filter(c => c.status === 'active');
  const upcoming  = charters.filter(c => c.status === 'upcoming');
  const completed = charters.filter(c => c.status === 'completed');

  // Hero card for active charter(s)
  const heroHTML = active.map(c => {
    const vessel   = FM.vessels.find(v => v.id === c.vessel);
    const apaExp   = (c.apaExpenses || []).reduce((s, e) => s + e.amount, 0);
    const apaLeft  = c.apa ? c.apa - apaExp : null;
    const apaPct   = c.apa ? Math.min(100, Math.round(apaExp / c.apa * 100)) : 0;
    const nights   = c.start && c.end ? Math.round((new Date(c.end) - new Date(c.start)) / 864e5) : 0;
    const dayIn    = c.start ? Math.floor((Date.now() - new Date(c.start)) / 864e5) + 1 : null;
    const totalRev = c.fee + (c.apa || 0);
    const ports = (c.itinerary && c.itinerary.length)
      ? [c.itinerary[0].location, c.itinerary[c.itinerary.length-1].location]
      : [c.embark, c.disembark].filter(Boolean);

    return `
      <div onclick="Charter.openDetail('${c.id}')" style="cursor:pointer;background:linear-gradient(135deg,rgba(249,115,22,.07) 0%,rgba(249,115,22,.02) 100%);border:.5px solid rgba(249,115,22,.25);border-radius:14px;padding:20px 22px;margin-bottom:18px;transition:border-color .15s" onmouseover="this.style.borderColor='rgba(249,115,22,.5)'" onmouseout="this.style.borderColor='rgba(249,115,22,.25)'">

        <!-- Charter header -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;gap:12px">
          <div style="min-width:0">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px">
              <span style="font-size:10px;font-weight:700;letter-spacing:.07em;color:#F97316;background:rgba(249,115,22,.12);border:.5px solid rgba(249,115,22,.3);padding:2px 8px;border-radius:20px">● ACTIVE</span>
              ${dayIn ? `<span style="font-size:11px;color:var(--txt3)">Day ${dayIn} of ${nights}</span>` : ''}
            </div>
            <div style="font-size:18px;font-weight:700;color:var(--txt);letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(c.name)}</div>
            <div style="font-size:12px;color:var(--txt3);margin-top:3px">${vessel ? escHtml(vessel.name) : ''} · ${_chFmtShort(c.start)} – ${_chFmtShort(c.end)} · ${nights} nights${c.guests && c.guests.length ? ' · ' + c.guests.length + ' guests' : ''}</div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:11px;color:var(--txt4);margin-bottom:2px">Charter fee</div>
            <div style="font-size:20px;font-weight:700;color:var(--txt)">$${(c.fee/1000).toFixed(0)}k</div>
          </div>
        </div>

        <!-- Route mini -->
        ${ports.length >= 2 ? `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
          <div style="width:8px;height:8px;border-radius:50%;background:#F97316;flex-shrink:0"></div>
          <div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(249,115,22,.6),rgba(249,115,22,.2));position:relative">
            ${dayIn && nights ? `<div style="position:absolute;left:${Math.min(90,Math.round(dayIn/nights*100))}%;top:-4px;width:9px;height:9px;border-radius:50%;background:var(--bg);border:2px solid #F97316;transform:translateX(-50%)"></div>` : ''}
          </div>
          <div style="width:8px;height:8px;border-radius:50%;border:1.5px solid rgba(249,115,22,.5);flex-shrink:0"></div>
          <div style="font-size:11px;color:var(--txt3);white-space:nowrap">${escHtml(ports[0].split(',')[0])} → ${escHtml(ports[ports.length-1].split(',')[0])}</div>
        </div>` : ''}

        <!-- Stats row -->
        <div class="stat-4" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
          <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;padding:10px 12px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">APA balance</div>
            <div style="font-size:15px;font-weight:700;color:${apaLeft !== null && apaLeft < c.apa * 0.2 ? 'var(--red)' : 'var(--txt)'}">${apaLeft !== null ? '$' + apaLeft.toLocaleString() : '—'}</div>
            ${c.apa ? `<div style="margin-top:5px;height:3px;background:var(--bg4);border-radius:2px"><div style="height:100%;width:${100-apaPct}%;background:${apaPct > 90 ? 'var(--red)' : apaPct > 70 ? 'var(--yel)' : 'var(--grn)'};border-radius:2px"></div></div>` : ''}
          </div>
          <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;padding:10px 12px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">APA spent</div>
            <div style="font-size:15px;font-weight:700;color:var(--txt)">$${apaExp.toLocaleString()}</div>
            <div style="font-size:10px;color:var(--txt4);margin-top:2px">${apaPct}% of $${(c.apa/1000).toFixed(0)}k</div>
          </div>
          <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;padding:10px 12px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">Total revenue</div>
            <div style="font-size:15px;font-weight:700;color:var(--grn)">$${totalRev.toLocaleString()}</div>
            <div style="font-size:10px;color:var(--txt4);margin-top:2px">Fee + APA</div>
          </div>
          <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;padding:10px 12px">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">Broker</div>
            <div style="font-size:13px;font-weight:600;color:var(--txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.broker ? escHtml(c.broker.split(' ')[0]) : '—'}</div>
            <div style="font-size:10px;color:var(--txt4);margin-top:2px">${c.embark ? escHtml(c.embark.split(',')[0]) : ''}</div>
          </div>
        </div>
      </div>`;
  }).join('');

  // Upcoming + completed table rows
  const tableCharters = [...upcoming, ...completed];
  const rows = tableCharters.map(c => {
    const vessel  = FM.vessels.find(v => v.id === c.vessel);
    const apaExp  = (c.apaExpenses || []).reduce((s, e) => s + e.amount, 0);
    const apaLeft = c.apa ? c.apa - apaExp : null;
    return `<tr style="cursor:pointer" onclick="Charter.openDetail('${c.id}')">
      <td>
        <div style="font-size:13px;font-weight:500;color:var(--txt)">${escHtml(c.name)}</div>
        <div style="font-size:11px;color:var(--txt3);margin-top:1px">${_chFmtShort(c.start)} – ${_chFmtShort(c.end)}</div>
      </td>
      <td style="font-size:12px;color:var(--txt2)">${vessel ? escHtml(vessel.name) : '—'}</td>
      <td style="font-size:12px;color:var(--txt2)">${c.guests ? c.guests.length : 0}</td>
      <td style="font-size:12px;color:var(--txt2)">$${(c.fee / 1000).toFixed(0)}k</td>
      <td style="font-size:12px;color:${apaLeft !== null && c.apa && apaLeft / c.apa < 0.2 ? 'var(--red)' : 'var(--txt2)'}">${apaLeft !== null ? '$' + (apaLeft / 1000).toFixed(1) + 'k' : '—'}</td>
      <td style="font-size:12px;color:var(--txt2)">${c.broker ? escHtml(c.broker.split(' ')[0]) : '—'}</td>
      <td>${_chStatusBadge(c)}</td>
      <td onclick="event.stopPropagation()"><button class="btn btn-ghost btn-xs" onclick="Charter.remove('${c.id}')">Remove</button></td>
    </tr>`;
  }).join('');

  const totalRev = charters.reduce((s, c) => s + c.fee + (c.apa || 0), 0);

  wrap.innerHTML = `
    <div style="padding:0 0 60px">
      <!-- Stats bar inline (charter has no chrome stats yet) -->
      <div class="stat-5" style="display:grid;grid-template-columns:repeat(5,1fr);border-bottom:.5px solid var(--bd)">
        <div class="wo-stat"><div class="wo-stat-num">${charters.length}</div><div class="wo-stat-lbl">Total</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:var(--or)">${active.length}</div><div class="wo-stat-lbl">Active</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:#60A5FA">${upcoming.length}</div><div class="wo-stat-lbl">Upcoming</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:var(--txt3)">${completed.length}</div><div class="wo-stat-lbl">Completed</div></div>
        <div class="wo-stat" style="border-right:none"><div class="wo-stat-num" style="font-size:18px;color:var(--grn)">$${(totalRev/1000).toFixed(0)}k</div><div class="wo-stat-lbl">Total revenue</div></div>
      </div>

      <div style="padding:18px 20px 4px;display:flex;justify-content:flex-end">
        <button class="btn btn-primary btn-sm" onclick="Charter.openNew()">+ New charter</button>
      </div>

      <div style="padding:0 20px">
        ${charters.length === 0
          ? `<div class="empty"><div class="empty-title">No charters yet</div><div class="empty-sub">Add your first charter booking above</div></div>`
          : heroHTML + (tableCharters.length ? `
              ${active.length ? `<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--txt4);margin-bottom:10px">All charters</div>` : ''}
              <div class="tbl-wrap"><table class="tbl">
                <thead><tr>
                  <th>Charter</th><th style="width:120px">Vessel</th>
                  <th style="width:65px">Guests</th><th style="width:80px">Fee</th>
                  <th style="width:100px">APA left</th><th style="width:110px">Broker</th>
                  <th style="width:110px">Status</th><th style="width:70px"></th>
                </tr></thead>
                <tbody>${rows}</tbody>
              </table></div>` : '')}
      </div>
    </div>`;
};

/* ══════════════════════════════
   DETAIL VIEW
══════════════════════════════ */
Charter.openDetail = function(id) {
  Charter._view      = 'detail';
  Charter._detailId  = id;
  Charter._activeTab = 'overview';
  Charter._renderDetail();
};

Charter.showList = function() {
  if (Charter._map) { Charter._map.remove(); Charter._map = null; }
  Charter._view = 'list';
  Charter.render();
};

Charter.switchTab = function(tab) {
  Charter._activeTab = tab;
  Charter._renderDetail();
};

Charter._renderDetail = function() {
  const wrap = document.getElementById('page-charter');
  if (!wrap) return;
  const c = FM.charters.find(x => x.id === Charter._detailId);
  if (!c) { Charter._renderList(); return; }

  const vessel     = FM.vessels.find(v => v.id === c.vessel);
  const apaExp     = (c.apaExpenses || []).reduce((s, e) => s + e.amount, 0);
  const apaLeft    = c.apa ? c.apa - apaExp : null;
  const openReqs   = (FM.guestRequests || []).filter(r => r.charter === c.id && r.status === 'open').length;
  const pendingPay = c.quote ? c.quote.payments.filter(p => !p.paid).length : 0;

  const logCount = (c.captainLog || []).length;
  const tabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'guests',    label: `Guests${c.guests && c.guests.length ? ' (' + c.guests.length + ')' : ''}` },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'apa',       label: apaLeft !== null ? `APA ($${(apaLeft/1000).toFixed(0)}k left)` : 'APA' },
    { id: 'costs',     label: c.costs && c.costs.length ? `Costs (${c.costs.length})` : 'Costs' },
    { id: 'requests',  label: openReqs ? `Requests (${openReqs})` : 'Requests' },
    { id: 'documents', label: c.documents && c.documents.length ? `Documents (${c.documents.length})` : 'Documents' },
    { id: 'booking',   label: pendingPay ? `Booking ⚠` : 'Booking' },
    { id: 'statement', label: 'Statement' },
    { id: 'broker',    label: c.broker ? `Broker — ${c.broker.split(' ')[0]}` : 'Broker' },
    { id: 'log',       label: logCount ? `Captain's Log (${logCount})` : `Captain's Log` },
  ];

  const tabBar = tabs.map(t =>
    `<button class="tab-btn ${Charter._activeTab === t.id ? 'tab-btn-active' : ''}"
             onclick="Charter.switchTab('${t.id}')">${t.label}</button>`
  ).join('');

  let content = '';
  switch (Charter._activeTab) {
    case 'overview':   content = Charter._tabOverview(c, vessel, apaLeft); break;
    case 'guests':     content = Charter._tabGuests(c); break;
    case 'itinerary':  content = Charter._tabItinerary(c); break;
    case 'apa':        content = Charter._tabAPA(c, apaExp, apaLeft); break;
    case 'costs':      content = Charter._tabCosts(c); break;
    case 'requests':   content = Charter._tabRequests(c); break;
    case 'documents':  content = Charter._tabDocuments(c); break;
    case 'booking':    content = Charter._tabBooking(c); break;
    case 'statement':  content = Charter._tabStatement(c); break;
    case 'broker':     content = Charter._tabBroker(c); break;
    case 'log':        content = Charter._tabLog(c); break;
  }

  wrap.innerHTML = `
    <div style="padding:0 0 60px">
      <!-- Back bar -->
      <div style="display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:.5px solid var(--bd)">
        <button class="btn btn-ghost btn-sm" onclick="Charter.showList()" style="gap:6px">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="width:12px;height:12px"><path d="M10 4l-4 4 4 4"/></svg>
          All charters
        </button>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600;color:var(--txt);letter-spacing:-.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(c.name)}</div>
        </div>
        ${_chStatusBadge(c)}
        <button class="btn btn-danger btn-xs" onclick="Charter.remove('${c.id}')">Remove</button>
      </div>

      <!-- Tab bar -->
      <div style="display:flex;gap:4px;padding:0 20px;border-bottom:.5px solid var(--bd);overflow-x:auto">
        ${tabBar}
      </div>

      <!-- Tab content -->
      <div style="padding:20px">
        ${content}
      </div>
    </div>`;

  // Initialize Leaflet map after DOM is updated
  if (Charter._activeTab === 'overview') {
    setTimeout(() => Charter._initMap(c, vessel), 30);
  }
};

/* ── OVERVIEW TAB ── */
Charter._tabOverview = function(c, vessel, apaLeft) {
  const apaExp    = (c.apaExpenses || []).reduce((s, e) => s + e.amount, 0);
  const totalCosts = (c.costs || []).reduce((s, e) => s + e.amount, 0);
  const totalRev  = c.fee + (c.apa || 0);
  const nights    = c.start && c.end ? Math.round((new Date(c.end) - new Date(c.start)) / 864e5) : 0;
  const dayIn     = c.status === 'active' && c.start ? Math.floor((Date.now() - new Date(c.start)) / 864e5) + 1 : null;
  const apaPct    = c.apa ? Math.min(100, Math.round(apaExp / c.apa * 100)) : 0;
  const apaBarClr = apaPct > 90 ? 'var(--red)' : apaPct > 70 ? 'var(--yel)' : 'var(--grn)';
  const progPct   = c.status === 'active' && nights ? Math.min(100, Math.round((dayIn - 1) / nights * 100)) : 0;

  // Status-driven hero gradient
  const heroBg = c.status === 'active'
    ? 'linear-gradient(135deg,rgba(249,115,22,.1) 0%,rgba(249,115,22,.03) 100%)'
    : c.status === 'upcoming'
      ? 'linear-gradient(135deg,rgba(96,165,250,.08) 0%,rgba(96,165,250,.02) 100%)'
      : 'linear-gradient(135deg,var(--bg2) 0%,var(--bg3) 100%)';
  const heroBd = c.status === 'active' ? 'rgba(249,115,22,.3)' : c.status === 'upcoming' ? 'rgba(96,165,250,.25)' : 'var(--bd)';
  const heroClr = c.status === 'active' ? '#F97316' : c.status === 'upcoming' ? '#60A5FA' : 'var(--txt3)';

  return `
    <!-- Hero banner -->
    <div style="background:${heroBg};border:.5px solid ${heroBd};border-radius:14px;padding:20px 22px;margin-bottom:18px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px">
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            ${_chStatusBadge(c)}
            ${dayIn ? `<span style="font-size:11px;color:var(--txt3)">Day ${dayIn} of ${nights}</span>` : nights ? `<span style="font-size:11px;color:var(--txt3)">${nights} nights</span>` : ''}
          </div>
          <div style="font-size:20px;font-weight:700;color:var(--txt);letter-spacing:-.02em;line-height:1.2">${escHtml(c.name)}</div>
          <div style="font-size:12px;color:var(--txt3);margin-top:4px">${vessel ? escHtml(vessel.name) + ' · ' : ''}${_chFmt(c.start)} → ${_chFmt(c.end)}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:2px">Total revenue</div>
          <div style="font-size:22px;font-weight:700;color:var(--grn)">$${totalRev.toLocaleString()}</div>
          <div style="font-size:10px;color:var(--txt4);margin-top:1px">Fee + APA</div>
        </div>
      </div>
      ${c.status === 'active' && nights ? `
      <!-- Trip progress bar -->
      <div style="margin-bottom:4px">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--txt4);margin-bottom:5px">
          <span>${escHtml((c.embark || c.start || '').split(',')[0])}</span>
          <span style="color:${heroClr};font-weight:600">${progPct}% complete</span>
          <span>${escHtml((c.disembark || c.end || '').split(',')[0])}</span>
        </div>
        <div style="height:4px;background:var(--bg4);border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${progPct}%;background:${heroClr};border-radius:99px;transition:width .6s ease"></div>
        </div>
      </div>` : ''}
    </div>

    <!-- Route map (Leaflet — initialized post-render) -->
    ${_routeMapEl()}

    <!-- Financial section -->
    ${c.apa ? `
    <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:12px;padding:18px 20px;margin-bottom:18px">
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--txt4);margin-bottom:14px">APA account</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
        <div>
          <div style="font-size:9px;color:var(--txt4);margin-bottom:3px;text-transform:uppercase;letter-spacing:.06em">Advance</div>
          <div style="font-size:20px;font-weight:700;color:var(--txt)">$${c.apa.toLocaleString()}</div>
        </div>
        <div>
          <div style="font-size:9px;color:var(--txt4);margin-bottom:3px;text-transform:uppercase;letter-spacing:.06em">Spent</div>
          <div style="font-size:20px;font-weight:700;color:var(--or)">$${apaExp.toLocaleString()}</div>
        </div>
        <div>
          <div style="font-size:9px;color:var(--txt4);margin-bottom:3px;text-transform:uppercase;letter-spacing:.06em">Remaining</div>
          <div style="font-size:20px;font-weight:700;color:${apaLeft !== null && apaLeft / c.apa < 0.2 ? 'var(--red)' : 'var(--grn)'}">$${apaLeft !== null ? apaLeft.toLocaleString() : '—'}</div>
        </div>
      </div>
      <div style="background:var(--bg4);border-radius:99px;overflow:hidden;height:6px">
        <div style="height:100%;width:${apaPct}%;background:${apaBarClr};border-radius:99px;transition:width .5s ease"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--txt4);margin-top:5px">
        <span>${apaPct}% spent</span>
        <span>${100 - apaPct}% remaining</span>
      </div>
    </div>` : ''}

    <!-- Metadata grid -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:${totalCosts ? '14px' : '0'}">
      ${_chMeta('Charter fee', '$' + c.fee.toLocaleString() + ' ' + (c.currency || 'USD'))}
      ${_chMeta('Guests', c.guests ? c.guests.length + ' pax' : '—')}
      ${_chMeta('Duration', nights ? nights + ' nights' : '—')}
      ${_chMeta('Embarkation', c.embark ? escHtml(c.embark) : '—')}
      ${_chMeta('Disembarkation', c.disembark ? escHtml(c.disembark) : '—')}
      ${_chMeta('Broker', c.broker ? escHtml(c.broker) : '—')}
      ${c.brokerContact ? _chMeta('Broker contact', escHtml(c.brokerContact)) : _chMeta('Vessel', vessel ? escHtml(vessel.name) : '—')}
    </div>
    ${totalCosts ? `
    <div style="padding:12px 14px;background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;font-size:12px;color:var(--txt3)">
      Total charter costs logged: <strong style="color:var(--txt)">$${totalCosts.toLocaleString()}</strong>
    </div>` : ''}`;
};

/* ── FAVOURITE LOCATIONS ── */
const _FAV_LOCATIONS = [
  // Caribbean
  'Gustavia, St. Barths','Île Fourchue, St. Barths','Colombier Beach, St. Barths',
  'Grand Cul-de-Sac, St. Barths','Shoal Bay, Anguilla','Sandy Ground, Anguilla',
  'Prickly Pear Cays, Anguilla','Meads Bay, Anguilla','Marigot, St. Martin',
  'Simpson Bay, St. Maarten','English Harbour, Antigua','Falmouth Harbour, Antigua',
  'Rodney Bay, St. Lucia','Marigot Bay, St. Lucia','Bridgetown, Barbados',
  'Hamilton, Bermuda','St. George\'s, Bermuda','Nassau, Bahamas',
  'Staniel Cay, Bahamas','Norman\'s Cay, Bahamas',
  'Charlotte Amalie, St. Thomas','Cruz Bay, St. John',
  'Road Town, Tortola','The Baths, Virgin Gorda','Jost Van Dyke, BVI',
  // Mediterranean
  'Portofino, Italy','Porto Cervo, Sardinia','Capri, Italy',
  'Amalfi, Italy','Positano, Italy','Taormina, Sicily',
  'Monaco','Nice, France','Cannes, France','Antibes, France','Saint-Tropez, France',
  'Ibiza Town, Spain','Es Vedra, Ibiza','Formentera, Spain',
  'Palma de Mallorca, Spain','Menorca, Spain',
  'Dubrovnik, Croatia','Hvar, Croatia','Split, Croatia','Korčula, Croatia',
  'Santorini, Greece','Mykonos, Greece','Corfu, Greece','Hydra, Greece',
  // US East Coast
  'Fort Lauderdale, FL','Miami, FL','Newport, RI','Nantucket, MA','Block Island, RI',
];

/* ── GUESTS TAB ── */
Charter._tabGuests = function(c) {
  c.guests = c.guests || [];

  // Available guests not yet in this charter
  const taken = new Set(c.guests);
  const available = (FM.guests || []).filter(g => !taken.has(g.id));

  const guestCards = c.guests.map(gid => {
    const g = (FM.guests || []).find(x => x.id === gid);
    if (!g) return '';
    const age = g.dob ? Math.floor((new Date('2026-05-07') - new Date(g.dob)) / (365.25 * 864e5)) : null;
    const allergyFlag = g.allergies && g.allergies !== 'None';
    return `
      <div style="padding:16px;background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;position:relative">
        <div style="position:absolute;top:10px;right:10px;display:flex;gap:6px">
          <button onclick="Charter.openGuestPrefs('${g.id}','${c.id}')" class="btn btn-ghost btn-xs">Preferences</button>
          <button onclick="Charter.removeGuest('${c.id}','${g.id}')" style="background:none;border:none;cursor:pointer;color:var(--txt4);font-size:16px;line-height:1;padding:2px 4px;border-radius:4px" title="Remove guest" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--txt4)'">×</button>
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <div style="width:36px;height:36px;border-radius:50%;background:${g.color}22;color:${g.color};font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${g.initials}</div>
          <div style="padding-right:100px">
            <div style="font-size:13px;font-weight:600;color:var(--txt)">${escHtml(g.name)}${age ? `<span style="font-size:10px;font-weight:400;color:var(--txt4);margin-left:6px">age ${age}</span>` : ''}</div>
            <div style="font-size:11px;color:var(--txt3)">${escHtml(g.relation)} · ${escHtml(g.cabin || '—')}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;margin-bottom:8px">
          <div><span style="color:var(--txt4)">Dietary: </span><span style="color:var(--txt2)">${escHtml(g.dietary || '—')}</span></div>
          <div style="display:flex;align-items:center;gap:5px">
            ${allergyFlag ? `<span style="width:6px;height:6px;border-radius:50%;background:var(--red);flex-shrink:0;display:inline-block"></span>` : ''}
            <span><span style="color:var(--txt4)">Allergies: </span><span style="color:${allergyFlag ? 'var(--red)' : 'var(--txt2)'};font-weight:${allergyFlag ? '600' : '400'}">${escHtml(g.allergies || 'None')}</span></span>
          </div>
        </div>
        ${g.preferences ? `<div style="font-size:12px;color:var(--txt3);line-height:1.5;border-top:.5px solid var(--bd);padding-top:8px">${escHtml(g.preferences)}</div>` : ''}
      </div>`;
  }).join('');

  const addSection = `
    <div style="border:.5px dashed var(--bd);border-radius:10px;padding:18px 20px;background:var(--bg2)">
      <div style="font-size:11px;font-weight:600;color:var(--txt3);margin-bottom:12px;text-transform:uppercase;letter-spacing:.06em">Add guest</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${available.length ? `
        <div>
          <label style="font-size:10px;color:var(--txt4);display:block;margin-bottom:4px">Select existing guest</label>
          <div style="display:flex;gap:8px">
            <select id="guest-pick-${c.id}" style="flex:1;padding:8px 10px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none">
              <option value="">— choose —</option>
              ${available.map(g => `<option value="${g.id}">${escHtml(g.name)} (${escHtml(g.relation)})</option>`).join('')}
            </select>
            <button class="btn btn-primary btn-sm" onclick="Charter.addGuestFromSelect('${c.id}')">Add</button>
          </div>
        </div>
        <div style="text-align:center;font-size:10px;color:var(--txt4)">— or —</div>` : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <input id="new-guest-name-${c.id}" placeholder="Full name" style="padding:8px 10px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none">
          <input id="new-guest-relation-${c.id}" placeholder="Relation (e.g. Principal guest)" style="padding:8px 10px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none">
          <input id="new-guest-cabin-${c.id}" placeholder="Cabin" style="padding:8px 10px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none">
          <input id="new-guest-dietary-${c.id}" placeholder="Dietary requirements" style="padding:8px 10px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none">
        </div>
        <input id="new-guest-allergies-${c.id}" placeholder="Allergies (or 'None')" style="padding:8px 10px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none">
        <input id="new-guest-prefs-${c.id}" placeholder="Preferences & notes" style="padding:8px 10px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none">
        <button class="btn btn-ghost btn-sm" style="align-self:flex-start" onclick="Charter.addNewGuest('${c.id}')">+ Create new guest</button>
      </div>
    </div>`;

  return `
    <div style="display:flex;flex-direction:column;gap:12px">
      ${c.guests.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px">${guestCards}</div>` : ''}
      ${addSection}
    </div>`;
};

/* ── ITINERARY TAB ── */
Charter._tabItinerary = function(c) {
  c.itinerary = c.itinerary || [];

  // Compute next date for the add form
  let nextDate = c.start || '';
  if (c.itinerary.length) {
    const last = new Date(c.itinerary[c.itinerary.length-1].date + 'T00:00');
    last.setDate(last.getDate() + 1);
    nextDate = last.toISOString().slice(0,10);
  }

  const favOpts = _FAV_LOCATIONS.map(l => `<option value="${escHtml(l)}">`).join('');

  const rows = c.itinerary.map((d, i) => `
    <div style="display:grid;grid-template-columns:52px 1fr auto;gap:14px;align-items:start;padding:14px 0;border-bottom:.5px solid var(--bd)">
      <div style="text-align:center;padding-top:2px">
        <div style="font-size:9px;font-weight:700;color:var(--txt4);text-transform:uppercase;letter-spacing:.05em">Day</div>
        <div style="font-size:20px;font-weight:700;color:var(--or);line-height:1">${i + 1}</div>
        <div style="font-size:9px;color:var(--txt4);margin-top:1px">${_chFmt(d.date).slice(0,6)}</div>
      </div>
      <div>
        <div style="font-size:13px;font-weight:600;color:var(--txt);margin-bottom:4px">${escHtml(d.location)}</div>
        ${d.notes ? `<div style="font-size:12px;color:var(--txt3);line-height:1.65">${escHtml(d.notes)}</div>` : ''}
      </div>
      <button onclick="Charter.removeItinDay('${c.id}',${i})" style="background:none;border:none;cursor:pointer;color:var(--txt4);font-size:16px;padding:4px 6px;border-radius:4px;margin-top:2px;flex-shrink:0" title="Remove day" onmouseover="this.style.color='var(--red)'" onmouseout="this.style.color='var(--txt4)'">×</button>
    </div>`).join('');

  const addForm = `
    <div style="background:var(--bg2);border:.5px dashed var(--bd);border-radius:10px;padding:16px 18px;margin-top:4px">
      <div style="font-size:11px;font-weight:600;color:var(--txt3);margin-bottom:12px;text-transform:uppercase;letter-spacing:.06em">Add day</div>
      <div style="display:grid;grid-template-columns:160px 1fr;gap:10px;margin-bottom:10px">
        <div>
          <label style="font-size:10px;color:var(--txt4);display:block;margin-bottom:4px">Date</label>
          <input type="date" id="itin-date-${c.id}" value="${nextDate}" style="width:100%;padding:8px 10px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none;box-sizing:border-box">
        </div>
        <div>
          <label style="font-size:10px;color:var(--txt4);display:block;margin-bottom:4px">Location</label>
          <input id="itin-loc-${c.id}" list="fav-locs-${c.id}" placeholder="Type or pick a favourite…" autocomplete="off" style="width:100%;padding:8px 10px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none;box-sizing:border-box">
          <datalist id="fav-locs-${c.id}">${favOpts}</datalist>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <label style="font-size:10px;color:var(--txt4);display:block;margin-bottom:4px">Notes</label>
        <textarea id="itin-notes-${c.id}" rows="2" placeholder="Activities, timing, special instructions…" style="width:100%;padding:8px 10px;background:var(--bg3);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none;resize:vertical;font-family:inherit;box-sizing:border-box"></textarea>
      </div>
      <button class="btn btn-primary btn-sm" onclick="Charter.addItinDay('${c.id}')">+ Add to itinerary</button>
    </div>`;

  const printBtn = c.itinerary.length ? `
    <div style="display:flex;justify-content:flex-end;margin-bottom:6px">
      <button class="btn btn-ghost btn-sm" onclick="Charter.printItinerary('${c.id}')" style="display:flex;align-items:center;gap:6px">
        <svg viewBox="0 0 16 16" fill="currentColor" style="width:12px;height:12px"><path d="M4 2h8a1 1 0 011 1v3H3V3a1 1 0 011-1zM2 7h12a1 1 0 011 1v4a1 1 0 01-1 1h-1v-2H4v2H3a1 1 0 01-1-1V8a1 1 0 011-1zm9 2a.5.5 0 110 1 .5.5 0 010-1zM4 11h8v3H4v-3z"/></svg>
        Print itinerary
      </button>
    </div>` : '';

  return `
    <div>
      ${printBtn}
      ${c.itinerary.length ? `<div>${rows}</div>` : `<div style="color:var(--txt4);font-size:12px;padding:16px 0">No itinerary yet — add your first day below.</div>`}
      ${addForm}
    </div>`;
};

/* ── APA TAB ── */
Charter._tabAPA = function(c, apaExp, apaLeft) {
  const expenses = c.apaExpenses || [];
  const byCategory = {};
  expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });

  const expRows = expenses.map(e => `
    <tr>
      <td style="font-size:12px;color:var(--txt2)">${escHtml(e.category)}</td>
      <td style="font-size:12px;color:var(--txt)">${escHtml(e.desc)}</td>
      <td style="font-size:12px;color:var(--txt3)">${_chFmt(e.date)}</td>
      <td style="font-size:12px;color:var(--txt);text-align:right;font-weight:500">$${e.amount.toLocaleString()}</td>
    </tr>`).join('');

  const pct = c.apa ? Math.min(100, Math.round((apaExp / c.apa) * 100)) : 0;
  const barColor = pct > 90 ? 'var(--red)' : pct > 70 ? 'var(--yel)' : 'var(--grn)';

  return `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">
      ${_chMeta('APA advance', c.apa ? '$' + c.apa.toLocaleString() : '—')}
      ${_chMeta('Spent', '$' + apaExp.toLocaleString())}
      ${_chMeta('Remaining', apaLeft !== null ? '$' + apaLeft.toLocaleString() : '—')}
    </div>
    ${c.apa ? `<div style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt3);margin-bottom:6px"><span>APA utilisation</span><span>${pct}%</span></div>
      <div style="height:6px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${barColor};border-radius:3px;transition:width .4s"></div></div>
    </div>` : ''}
    ${expenses.length ? `<div class="tbl-wrap"><table class="tbl">
      <thead><tr><th style="width:120px">Category</th><th>Description</th><th style="width:110px">Date</th><th style="width:100px;text-align:right">Amount</th></tr></thead>
      <tbody>${expRows}</tbody>
      <tfoot><tr style="border-top:.5px solid var(--bd)">
        <td colspan="3" style="font-size:12px;font-weight:600;color:var(--txt);padding:10px 12px">Total spent</td>
        <td style="font-size:12px;font-weight:600;color:var(--txt);text-align:right;padding:10px 12px">$${apaExp.toLocaleString()}</td>
      </tr></tfoot>
    </table></div>` : `<div class="empty"><div class="empty-title">No APA expenses logged</div></div>`}`;
};

/* ── COSTS TAB ── */
Charter._tabCosts = function(c) {
  const costs = c.costs || [];
  const total = costs.reduce((s, e) => s + e.amount, 0);
  if (!costs.length) return `<div class="empty"><div class="empty-title">No costs logged</div></div>`;
  const rows = costs.map(e => `
    <tr>
      <td style="font-size:12px;color:var(--txt2)">${escHtml(e.category)}</td>
      <td style="font-size:12px;color:var(--txt)">${escHtml(e.desc)}</td>
      <td style="font-size:12px;color:var(--txt3)">${_chFmt(e.date)}</td>
      ${e.notes ? `<td style="font-size:11px;color:var(--txt4);max-width:180px">${escHtml(e.notes)}</td>` : '<td></td>'}
      <td style="font-size:12px;font-weight:500;color:var(--txt);text-align:right">$${e.amount.toLocaleString()}</td>
    </tr>`).join('');
  return `<div class="tbl-wrap"><table class="tbl">
    <thead><tr><th style="width:120px">Category</th><th>Description</th><th style="width:110px">Date</th><th style="width:180px">Notes</th><th style="width:100px;text-align:right">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr style="border-top:.5px solid var(--bd)">
      <td colspan="4" style="font-size:12px;font-weight:600;color:var(--txt);padding:10px 12px">Total</td>
      <td style="font-size:12px;font-weight:600;color:var(--txt);text-align:right;padding:10px 12px">$${total.toLocaleString()}</td>
    </tr></tfoot>
  </table></div>`;
};

/* ── REQUESTS TAB ── */
Charter._tabRequests = function(c) {
  const reqs = (FM.guestRequests || []).filter(r => r.charter === c.id);
  if (!reqs.length) return `<div class="empty"><div class="empty-title">No guest requests</div></div>`;
  const rows = reqs.map(r => {
    const g = (FM.guests || []).find(x => x.id === r.guest);
    const isDone = r.status === 'done';
    return `<div style="padding:14px;background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;margin-bottom:8px;opacity:${isDone ? '.7' : '1'}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:8px">
          ${g ? `<div style="width:24px;height:24px;border-radius:50%;background:${g.color}22;color:${g.color};font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${g.initials}</div>` : ''}
          <div>
            <div style="font-size:12px;font-weight:500;color:var(--txt)">${g ? escHtml(g.name) : 'Guest'}</div>
            <div style="font-size:10px;color:var(--txt4)">${escHtml(r.time)} · ${escHtml(r.type)}</div>
          </div>
        </div>
        <span class="badge ${isDone ? 'b-done' : 'b-high'}">${isDone ? 'Done' : 'Open'}</span>
      </div>
      <div style="font-size:12px;color:var(--txt2);line-height:1.5">${escHtml(r.text)}</div>
    </div>`;
  }).join('');
  return `<div>${rows}</div>`;
};

/* ── DOCUMENTS TAB ── */
Charter._tabDocuments = function(c) {
  const docs = c.documents || [];
  if (!docs.length) return `<div class="empty"><div class="empty-title">No documents added</div></div>`;
  const typeIcon = t => ({ contract:'📄', finance:'💰', regulatory:'🛂', safety:'🛡', preferences:'👥' }[t] || '📎');
  const rows = docs.map(d => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:.5px solid var(--bd)">
      <span style="font-size:18px">${typeIcon(d.type)}</span>
      <div style="flex:1">
        <div style="font-size:13px;color:var(--txt)">${escHtml(d.name)}</div>
        <div style="font-size:11px;color:var(--txt4);text-transform:capitalize;margin-top:1px">${escHtml(d.type)}</div>
      </div>
      <div style="font-size:11px;color:var(--txt3)">${d.date ? _chFmt(d.date) : '<span style="color:var(--yel)">Pending</span>'}</div>
    </div>`).join('');
  return `<div>${rows}</div>`;
};

/* ── BOOKING TAB ── */
Charter._tabBooking = function(c) {
  if (!c.quote) return `<div class="empty"><div class="empty-title">No booking details</div></div>`;
  const q = c.quote;
  const payRows = (q.payments || []).map(p => {
    const isPaid = p.paid;
    return `<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:.5px solid var(--bd)">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500;color:var(--txt)">${escHtml(p.label)}</div>
        <div style="font-size:11px;color:var(--txt3)">Due: ${_chFmt(p.due)}${isPaid && p.paidDate ? ' · Paid: ' + _chFmt(p.paidDate) : ''}</div>
      </div>
      <div style="font-size:14px;font-weight:600;color:var(--txt)">$${p.amount.toLocaleString()}</div>
      <span class="badge ${isPaid ? 'b-done' : 'b-high'}">${isPaid ? 'Paid' : 'Outstanding'}</span>
    </div>`;
  }).join('');

  const wire = (label, w) => w ? `
    <div style="margin-top:16px">
      <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:8px">${label}</div>
      <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;padding:14px;font-size:12px;line-height:1.8;color:var(--txt2)">
        <div><span style="color:var(--txt4)">Bank: </span>${escHtml(w.bank)}, ${escHtml(w.city)}</div>
        <div><span style="color:var(--txt4)">Account: </span>${escHtml(w.accountName)}</div>
        <div><span style="color:var(--txt4)">IBAN: </span><span style="font-family:var(--mono)">${escHtml(w.iban)}</span></div>
        <div><span style="color:var(--txt4)">SWIFT: </span><span style="font-family:var(--mono)">${escHtml(w.swift)}</span></div>
        <div><span style="color:var(--txt4)">Reference: </span><span style="font-family:var(--mono)">${escHtml(w.ref)}</span></div>
      </div>
    </div>` : '';

  return `
    <div style="margin-bottom:6px;display:flex;align-items:center;gap:8px">
      <span style="font-size:11px;color:var(--txt3)">Quote ref: <strong style="font-family:var(--mono);color:var(--txt2)">${q.ref}</strong></span>
      <span class="badge b-done" style="font-size:9px">${escHtml(q.status.replace('_', ' '))}</span>
    </div>
    ${payRows}
    ${wire('Charter fee wire details', q.wireCharter)}
    ${wire('APA wire details', q.wireAPA)}`;
};

/* ── STATEMENT TAB (MYBA Charter Account) ── */
Charter._tabStatement = function(c) {
  const q = c.quote || {};
  const apaExp = (c.apaExpenses || []).reduce((s, e) => s + e.amount, 0);
  const apaBalance = (c.apa || 0) - apaExp;

  const brokerCost = (c.costs || []).find(x => x.category === 'Broker');
  const brokerComm = brokerCost ? brokerCost.amount : Math.round((c.fee || 0) * 0.15);
  const brokerPct  = c.fee ? Math.round(brokerComm / c.fee * 100) : 15;

  const vatRate    = c._vatRate || 0;
  const vatAmount  = Math.round((c.fee || 0) * vatRate / 100);
  const netOwner   = (c.fee || 0) - brokerComm - vatAmount;
  const totalIn    = (c.fee || 0) - vatAmount + (c.apa || 0);

  const apaByCategory = {};
  (c.apaExpenses || []).forEach(e => { apaByCategory[e.category] = (apaByCategory[e.category] || 0) + e.amount; });

  const nights = c.start && c.end ? Math.round((new Date(c.end) - new Date(c.start)) / 864e5) : '—';
  const vessel = FM.vessels.find(v => v.id === c.vessel);
  const USD = n => '$' + Math.abs(n).toLocaleString('en-US');

  const row = (label, amount, sub, isDeduction) => `
    <div style="display:flex;justify-content:space-between;align-items:baseline;padding:9px 0;border-bottom:.5px solid var(--bd)">
      <div>
        <div style="font-size:12px;color:var(--txt2)">${label}</div>
        ${sub ? `<div style="font-size:10px;color:var(--txt4);margin-top:1px">${sub}</div>` : ''}
      </div>
      <div style="font-size:13px;font-weight:500;color:${isDeduction ? 'var(--txt3)' : 'var(--txt)'};font-family:var(--mono)">${isDeduction ? '(' + USD(amount) + ')' : USD(amount)}</div>
    </div>`;

  const total = (label, amount, color) => `
    <div style="display:flex;justify-content:space-between;align-items:baseline;padding:11px 0;margin-bottom:20px;border-top:.5px solid var(--bd)">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt3)">${label}</div>
      <div style="font-size:16px;font-weight:700;color:${color};font-family:var(--mono)">${USD(amount)}</div>
    </div>`;

  const vatOpts = [
    { label: 'No VAT — outside EU / exempt', rate: 0 },
    { label: 'Spain — 10% IVA', rate: 10 },
    { label: 'France — 10% TVA', rate: 10 },
    { label: 'Italy — 22% IVA', rate: 22 },
    { label: 'Greece — 12% VAT', rate: 12 },
    { label: 'Croatia — 25% PDV', rate: 25 },
  ];

  return `
    <div style="max-width:640px">
      <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:16px 20px;margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
          <div>
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:4px">MYBA Charter Account Statement</div>
            <div style="font-size:15px;font-weight:700;color:var(--txt)">${escHtml(c.name)}</div>
          </div>
          <div style="text-align:right;font-size:11px;color:var(--txt3)">
            <div style="font-weight:600">${q.ref || '—'}</div>
            <div style="font-size:10px;color:var(--txt4);margin-top:1px">${_chFmt(c.start)} – ${_chFmt(c.end)}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:11px;color:var(--txt2)">
          <div><span style="color:var(--txt4)">Vessel: </span>${vessel ? escHtml(vessel.name) : '—'}</div>
          <div><span style="color:var(--txt4)">Nights: </span>${nights}</div>
          <div><span style="color:var(--txt4)">Broker: </span>${c.broker ? escHtml(c.broker) : 'Direct'}</div>
        </div>
      </div>

      <div style="display:flex;align-items:center;gap:10px;margin-bottom:22px">
        <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt4);white-space:nowrap">VAT jurisdiction</label>
        <select onchange="Charter._setVAT('${c.id}',parseFloat(this.value))" style="flex:1;padding:7px 10px;background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;color:var(--txt);font-size:12px;outline:none">
          ${vatOpts.map(o => `<option value="${o.rate}" ${vatRate === o.rate ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>
      </div>

      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:4px">Income</div>
      ${row('Charter fee', c.fee || 0, 'Gross charter revenue', false)}
      ${vatRate > 0 ? row(`VAT — ${vatRate}%`, vatAmount, `${vatRate}% on charter fee`, true) : ''}
      ${row('APA advance received', c.apa || 0, 'Advance Provisioning Allowance', false)}
      ${total('Total received', totalIn, 'var(--txt)')}

      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:4px">Disbursements</div>
      ${row(`Broker commission — ${brokerPct}%`, brokerComm, `${c.broker || 'Broker'} · on charter fee`, true)}
      ${total('Net charter income to owner', netOwner, 'var(--grn)')}

      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:4px">APA account</div>
      ${row('APA advance received', c.apa || 0, '', false)}
      ${Object.entries(apaByCategory).map(([cat, amt]) => row(cat, amt, '', true)).join('')}
      ${apaExp > 0 ? `
        <div style="display:flex;justify-content:space-between;align-items:baseline;padding:9px 0;border-bottom:.5px solid var(--bd)">
          <div style="font-size:12px;font-weight:600;color:var(--txt2)">Total APA expenses</div>
          <div style="font-size:13px;font-weight:600;color:var(--txt);font-family:var(--mono)">(${USD(apaExp)})</div>
        </div>` : ''}
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding:11px 0;border-top:.5px solid var(--bd)">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--txt3)">${apaBalance >= 0 ? 'APA balance — return to charterers' : 'APA shortfall — due from charterers'}</div>
        <div style="font-size:16px;font-weight:700;color:${apaBalance >= 0 ? 'var(--txt)' : 'var(--red)'};font-family:var(--mono)">${USD(Math.abs(apaBalance))}</div>
      </div>

      <div style="margin-top:20px;padding-top:16px;border-top:.5px solid var(--bd);display:flex;justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="window.print()">Export statement</button>
      </div>
    </div>`;
};

Charter._setVAT = function(charterId, rate) {
  const c = FM.charters.find(x => x.id === charterId);
  if (c) { c._vatRate = rate; Charter._renderDetail(); }
};

/* ── BROKER TAB ── */
Charter._tabBroker = function(c) {
  if (!c.broker) return `<div class="empty"><div class="empty-title">No broker assigned</div><div class="empty-sub">This charter was booked directly without a broker.</div></div>`;

  const brokerCost = (c.costs || []).find(x => x.category === 'Broker');
  const brokerComm = brokerCost ? brokerCost.amount : Math.round((c.fee || 0) * 0.15);
  const brokerPct  = c.fee ? Math.round(brokerComm / c.fee * 100) : 15;
  const commPaid   = c.status === 'completed' || c.status === 'active';

  const contactRaw  = c.brokerContact || '';
  const emailMatch  = contactRaw.match(/<([^>]+)>/);
  const brokerEmail = emailMatch ? emailMatch[1] : '';
  const contactName = contactRaw.replace(/<[^>]+>/, '').replace(/\s*$/, '');

  const pendingDocs = (c.documents || []).filter(d => !d.date);
  const otherCharters = (FM.charters || []).filter(x => x.id !== c.id && x.broker === c.broker);

  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:10px">Broker</div>
        <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:16px;margin-bottom:14px">
          <div style="font-size:15px;font-weight:700;color:var(--txt);margin-bottom:6px">${escHtml(c.broker)}</div>
          ${contactName ? `<div style="font-size:12px;color:var(--txt2);margin-bottom:3px">${escHtml(contactName)}</div>` : ''}
          ${brokerEmail ? `<div style="font-size:11px;color:#60A5FA;font-family:var(--mono)">${escHtml(brokerEmail)}</div>` : ''}
        </div>

        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:10px">Commission</div>
        <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:.5px solid var(--bd)">
            <span style="font-size:12px;color:var(--txt3)">Rate</span>
            <span style="font-size:13px;font-weight:600;color:var(--txt)">${brokerPct}%</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:.5px solid var(--bd)">
            <span style="font-size:12px;color:var(--txt3)">Amount</span>
            <span style="font-size:13px;font-weight:600;color:var(--txt)">$${brokerComm.toLocaleString()}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0">
            <span style="font-size:12px;color:var(--txt3)">Status</span>
            <span class="badge ${commPaid ? 'b-done' : 'b-high'}">${commPaid ? 'Invoiced' : 'Pending'}</span>
          </div>
        </div>
      </div>

      <div>
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:10px">Outstanding from broker</div>
        <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:14px;margin-bottom:14px">
          ${pendingDocs.length
            ? pendingDocs.map(d => `
                <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:.5px solid var(--bd)">
                  <div style="width:6px;height:6px;border-radius:50%;background:var(--yel);flex-shrink:0"></div>
                  <div style="font-size:12px;color:var(--txt2)">${escHtml(d.name)}</div>
                </div>`).join('')
            : `<div style="font-size:12px;color:var(--grn)">All documents received</div>`}
        </div>

        ${otherCharters.length ? `
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--txt4);margin-bottom:10px">History with ${escHtml(c.broker.split(' ')[0])}</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${otherCharters.map(ch => `
              <div onclick="Charter.openDetail('${ch.id}')" style="background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;padding:10px 12px;cursor:pointer;transition:border-color .15s" onmouseover="this.style.borderColor='rgba(249,115,22,.4)'" onmouseout="this.style.borderColor='var(--bd)'">
                <div style="font-size:12px;font-weight:500;color:var(--txt);margin-bottom:3px">${escHtml(ch.name)}</div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="font-size:10px;color:var(--txt4)">${_chFmtShort(ch.start)} · $${(ch.fee/1000).toFixed(0)}k</span>
                  ${_chStatusBadge(ch)}
                </div>
              </div>`).join('')}
          </div>` : ''}
      </div>
    </div>`;
};

/* ── CAPTAIN'S LOG ── */
Charter._tabLog = function(c) {
  const entries = (c.captainLog || []).slice().reverse();
  const _fmt = ts => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  return `
    <div>
      <div style="background:var(--bg3);border:.5px solid var(--bd);border-radius:10px;padding:14px 16px;margin-bottom:20px">
        <div style="font-size:11px;font-weight:600;color:var(--txt);margin-bottom:8px">Add entry</div>
        <textarea id="log-entry-text" class="inp" rows="3" placeholder="Note conditions, incidents, guest feedback, port observations…" style="resize:vertical;font-size:13px;line-height:1.5"></textarea>
        <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
          <select id="log-entry-author" class="inp" style="flex:1;font-size:12px">
            <option value="Captain">Captain</option>
            ${(FM.crew || []).filter(m => m.vessel === c.vessel && (m.role === 'Captain' || m.role === 'Chief Officer' || m.role === 'First Officer')).map(m => `<option value="${escHtml(m.name)}">${escHtml(m.name)} — ${escHtml(m.role)}</option>`).join('')}
          </select>
          <button class="btn btn-primary btn-sm" onclick="Charter._addLogEntry('${c.id}')">Log entry</button>
        </div>
      </div>

      ${entries.length === 0
        ? `<div style="text-align:center;padding:48px 20px;color:var(--txt3);font-size:13px">No log entries yet.<br><span style="font-size:11px;color:var(--txt4)">Add the first entry above.</span></div>`
        : `<div style="display:flex;flex-direction:column;gap:0">
            ${entries.map((e, i) => `
              <div style="display:flex;gap:14px;padding:14px 0;${i < entries.length - 1 ? 'border-bottom:.5px solid var(--bd)' : ''}">
                <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:4px;padding-top:2px">
                  <div style="width:28px;height:28px;border-radius:50%;background:rgba(249,115,22,.12);color:var(--or);font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center">${escHtml((e.author || 'C').charAt(0))}</div>
                  ${i < entries.length - 1 ? '<div style="flex:1;width:.5px;background:var(--bd);min-height:20px"></div>' : ''}
                </div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                    <span style="font-size:12px;font-weight:600;color:var(--txt)">${escHtml(e.author || 'Captain')}</span>
                    <span style="font-size:10px;color:var(--txt4)">${_fmt(e.ts)}</span>
                  </div>
                  <div style="font-size:13px;color:var(--txt2);line-height:1.55;white-space:pre-wrap">${escHtml(e.text)}</div>
                </div>
              </div>`).join('')}
          </div>`}
    </div>`;
};

Charter._addLogEntry = function(charterId) {
  const text = (document.getElementById('log-entry-text')?.value || '').trim();
  if (!text) { showToast('Enter a note first', 'error'); return; }
  const author = document.getElementById('log-entry-author')?.value || 'Captain';
  const c = FM.charters.find(x => x.id === charterId);
  if (!c) return;
  if (!c.captainLog) c.captainLog = [];
  c.captainLog.push({ ts: Date.now(), author, text });
  Charter._renderDetail();
  Charter.switchTab('log');
  showToast('Entry logged');
};

/* ── GUEST PREFERENCE SHEET ── */
Charter.openGuestPrefs = function(guestId, charterId) {
  const g = (FM.guests || []).find(x => x.id === guestId);
  if (!g) return;
  const age = g.dob ? Math.floor((new Date('2026-05-07') - new Date(g.dob)) / (365.25 * 864e5)) : null;
  const allergyFlag = g.allergies && g.allergies !== 'None';

  openModal(`
    <div style="display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;align-items:center;gap:12px;padding-bottom:14px;border-bottom:.5px solid var(--bd)">
        <div style="width:44px;height:44px;border-radius:50%;background:${g.color}22;color:${g.color};font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">${g.initials}</div>
        <div>
          <div style="font-size:15px;font-weight:600;color:var(--txt)">${escHtml(g.name)}${age ? `<span style="font-size:11px;font-weight:400;color:var(--txt4);margin-left:8px">age ${age}</span>` : ''}</div>
          <div style="font-size:11px;color:var(--txt3);margin-top:2px">${escHtml(g.relation)}${g.cabin ? ' · ' + escHtml(g.cabin) : ''}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);display:block;margin-bottom:5px">Dietary requirements</label>
          <input id="gp-dietary" class="inp" value="${escHtml(g.dietary || '')}" placeholder="No restrictions">
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:${allergyFlag ? 'var(--red)' : 'var(--txt4)'};display:block;margin-bottom:5px">Allergies${allergyFlag ? ' ⚠' : ''}</label>
          <input id="gp-allergies" class="inp" value="${escHtml(g.allergies || '')}" placeholder="None" style="${allergyFlag ? 'border-color:rgba(248,113,113,.5)' : ''}">
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);display:block;margin-bottom:5px">Cabin assignment</label>
          <input id="gp-cabin" class="inp" value="${escHtml(g.cabin || '')}" placeholder="Master Stateroom">
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);display:block;margin-bottom:5px">Date of birth</label>
          <input id="gp-dob" class="inp" type="date" value="${g.dob || ''}">
        </div>
      </div>

      <div>
        <label style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);display:block;margin-bottom:5px">Preferences, activities & notes</label>
        <textarea id="gp-prefs" class="inp" rows="4" style="min-height:90px;resize:vertical">${escHtml(g.preferences || '')}</textarea>
        <div style="font-size:10px;color:var(--txt4);margin-top:4px">Watersports, cuisine, wine, wellness, special occasions, language…</div>
      </div>

      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="Charter._saveGuestPrefs('${guestId}','${charterId}')">Save preferences</button>
      </div>
    </div>
  `, escHtml(g.name) + ' — Preference sheet');
};

Charter._saveGuestPrefs = function(guestId, charterId) {
  const g = (FM.guests || []).find(x => x.id === guestId);
  if (!g) return;
  g.dietary     = document.getElementById('gp-dietary')?.value.trim()   || g.dietary;
  g.allergies   = document.getElementById('gp-allergies')?.value.trim() || g.allergies;
  g.cabin       = document.getElementById('gp-cabin')?.value.trim()     || g.cabin;
  g.dob         = document.getElementById('gp-dob')?.value              || g.dob;
  g.preferences = document.getElementById('gp-prefs')?.value.trim()    || g.preferences;
  closeModal();
  Charter._renderDetail();
  showToast('Preferences saved');
};

window.Charter = Charter;

/* ══════════════════════════════
   NEW CHARTER MODAL
══════════════════════════════ */
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
  const name  = document.getElementById('ch-name').value.trim();
  const start = document.getElementById('ch-start').value;
  const end   = document.getElementById('ch-end').value;
  if (!name || !start || !end) return;
  FM.charters.push({
    id: 'ch-' + Date.now(),
    vessel:    document.getElementById('ch-vessel').value,
    status:    document.getElementById('ch-status').value,
    name, start, end,
    fee:       parseInt(document.getElementById('ch-fee').value) || 0,
    apa:       parseInt(document.getElementById('ch-apa').value) || 0,
    broker:    document.getElementById('ch-broker').value.trim() || '',
    embark:    document.getElementById('ch-embark').value.trim() || '',
    disembark: document.getElementById('ch-disembark').value.trim() || '',
    guests: [], itinerary: [], documents: [], apaExpenses: [], costs: [],
    currency: 'USD',
  });
  closeModal();
  Charter._renderList();
  showToast('Charter added', 'ok');
};

Charter.remove = function(id) {
  const c = FM.charters.find(x => x.id === id);
  if (!c) return;
  FM.charters = FM.charters.filter(x => x.id !== id);
  Charter._renderList();
  showToast('Charter removed');
};

/* ══════════════════════════════
   GUEST MUTATIONS
══════════════════════════════ */
Charter.removeGuest = function(charId, guestId) {
  const c = FM.charters.find(x => x.id === charId);
  if (!c) return;
  c.guests = (c.guests || []).filter(id => id !== guestId);
  Charter._renderDetail();
};

Charter.addGuestFromSelect = function(charId) {
  const sel = document.getElementById('guest-pick-' + charId);
  if (!sel || !sel.value) return;
  const c = FM.charters.find(x => x.id === charId);
  if (!c) return;
  c.guests = c.guests || [];
  if (!c.guests.includes(sel.value)) c.guests.push(sel.value);
  Charter._renderDetail();
  showToast('Guest added');
};

Charter.addNewGuest = function(charId) {
  const name     = (document.getElementById('new-guest-name-' + charId) || {}).value?.trim();
  const relation = (document.getElementById('new-guest-relation-' + charId) || {}).value?.trim() || 'Guest';
  const cabin    = (document.getElementById('new-guest-cabin-' + charId) || {}).value?.trim();
  const dietary  = (document.getElementById('new-guest-dietary-' + charId) || {}).value?.trim() || 'No restrictions';
  const allergies = (document.getElementById('new-guest-allergies-' + charId) || {}).value?.trim() || 'None';
  const prefs    = (document.getElementById('new-guest-prefs-' + charId) || {}).value?.trim();
  if (!name) { showToast('Enter a guest name'); return; }

  const c = FM.charters.find(x => x.id === charId);
  if (!c) return;
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const colors   = ['#F97316','#60A5FA','#4ADE80','#A78BFA','#FACC15','#F87171','#22D3EE'];
  const color    = colors[FM.guests.length % colors.length];
  const id       = 'g' + (Date.now());
  FM.guests.push({ id, name, relation, initials, color, cabin, dietary, allergies, preferences: prefs, dob: '' });
  c.guests = c.guests || [];
  c.guests.push(id);
  Charter._renderDetail();
  showToast(name + ' added');
};

/* ══════════════════════════════
   ITINERARY MUTATIONS
══════════════════════════════ */
Charter.removeItinDay = function(charId, idx) {
  const c = FM.charters.find(x => x.id === charId);
  if (!c) return;
  c.itinerary = c.itinerary || [];
  c.itinerary.splice(idx, 1);
  Charter._renderDetail();
};

Charter.addItinDay = function(charId) {
  const c    = FM.charters.find(x => x.id === charId);
  const date = (document.getElementById('itin-date-' + charId) || {}).value;
  const loc  = (document.getElementById('itin-loc-'  + charId) || {}).value?.trim();
  const notes = (document.getElementById('itin-notes-' + charId) || {}).value?.trim();
  if (!c || !loc) { showToast('Enter a location'); return; }
  c.itinerary = c.itinerary || [];
  c.itinerary.push({ date: date || '', location: loc, notes: notes || '' });
  c.itinerary.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  Charter._renderDetail();
  // Re-init map since itinerary changed
  if (Charter._activeTab === 'overview') {
    const vessel = FM.vessels.find(v => v.id === c.vessel);
    setTimeout(() => Charter._initMap(c, vessel), 30);
  }
  showToast('Day added to itinerary');
};

/* ══════════════════════════════
   PRINT ITINERARY
══════════════════════════════ */
Charter.printItinerary = async function(charId) {
  const c = FM.charters.find(x => x.id === charId);
  if (!c || !(c.itinerary || []).length) { showToast('Add stops to the itinerary first'); return; }

  const vessel = FM.vessels.find(v => v.id === c.vessel);
  const nights = c.start && c.end ? Math.round((new Date(c.end) - new Date(c.start)) / 864e5) : 0;

  showToast('Preparing itinerary…');

  const WMO_DESC = {
    0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',
    45:'Foggy',48:'Icy fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',
    61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',73:'Snow',75:'Heavy snow',
    80:'Light showers',81:'Showers',82:'Heavy showers',95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm',
  };
  const WMO_ICON = {
    0:'☀️',1:'🌤',2:'⛅',3:'☁️',45:'🌫',48:'🌫',
    51:'🌦',53:'🌧',55:'🌧',61:'🌦',63:'🌧',65:'🌧',
    71:'❄️',73:'❄️',75:'❄️',80:'🌦',81:'🌧',82:'⛈',95:'⛈',96:'⛈',99:'⛈',
  };

  const RECS = {
    monaco:        { onshore:['Monte Carlo Casino','Oceanographic Museum',"Prince's Palace tour",'Café de Paris aperitivo','Port d\'Hercule superyacht walk'], onboard:['Stern-to berth at Port Hercule','Evening fireworks from anchorage','Tender to Casino Square'] },
    antibes:       { onshore:['Picasso Museum','Old town Saturday market (Cours Masséna)',"Cap d'Antibes coastal walk",'Biot village & glassblowing'], onboard:["Anchor off Juan-les-Pins","Water sports in the Baie des Anges",'Sundowner at the Cap'] },
    'saint-tropez':{ onshore:['Place des Lices morning market','Citadelle views','Pampelonne Beach clubs','Vieux Port rosé lunch'], onboard:['Pampelonne by tender','Sunset cruise along the Riviera','Anchor in Baie de Pampelonne'] },
    'st tropez':   { onshore:['Place des Lices morning market','Citadelle views','Pampelonne Beach clubs','Vieux Port rosé lunch'], onboard:['Pampelonne by tender','Sunset cruise along the Riviera','Anchor in Baie de Pampelonne'] },
    cannes:        { onshore:['La Croisette promenade','Marché Forville','Îles de Lérins day trip','Palais des Festivals'], onboard:['Snorkel at Île Sainte-Marguerite','Sunset at anchor off La Croisette'] },
    portofino:     { onshore:['Piazza Martiri hike to church','San Giorgio church at the point','Lunch at Il Pitosforo','Paraggi beach swimming'], onboard:['Kayak to the lighthouse','Swim at the castle cove','Tender to Paraggi Beach'] },
    capri:         { onshore:['Blue Grotto boat tour','Villa San Michele (Anacapri)','Chairlift to Monte Solaro','Piazzetta aperitivo at sunset'], onboard:['Faraglioni rock arch swim-through','Limoncello at anchor','Swim at Marina Piccola'] },
    amalfi:        { onshore:['Amalfi Cathedral & cloister','Ravello Villa Rufolo gardens','Lemon grove tour & limoncello','Grotta dello Smeraldo'], onboard:['Tender to Positano','Swim at Li Galli islets','Sunset cruising the Amalfi Coast'] },
    positano:      { onshore:['Church of Santa Maria Assunta','Boutique shopping on the cliffside','Fornillo beach','Walk to Praiano via the sea path'], onboard:["Snorkel at Buca di Bacco",'Morning swim at Li Galli islands','Evening anchorage with coast views'] },
    santorini:     { onshore:['Oia village & sunset walk','Akrotiri archaeological site','Wine tasting at Estate Argyros','Fira caldera ridge walk'], onboard:['Caldera anchorage at sunset','Red Beach by tender','Volcanic hot springs at Nea Kameni'] },
    mykonos:       { onshore:['Little Venice cocktails at sunset','Windmills of Kato Mili','Super Paradise Beach','Matoyianni Street boutiques'], onboard:['Delos island day trip by tender','Psarou Beach by water taxi','Swim at Paradise Beach at sunset'] },
    dubrovnik:     { onshore:['Walk the medieval city walls','Lokrum Island day trip','Game of Thrones filming locations tour','Stradun promenade & restaurants'], onboard:['Elaphiti Islands cruise','Swim at Lapad Bay','Sea kayak around the city walls'] },
    kotor:         { onshore:['Medieval Old Town walk','St Tryphon Cathedral','Fortification hike for sunset views','Cats of Kotor Museum'], onboard:['Bay of Kotor scenic anchorage','Perast & Our Lady of the Rocks','Blue Cave snorkelling by tender'] },
    hvar:          { onshore:['Hvar Town Fortress hike','Lavender fields of Stari Grad (June)','Stari Grad Plain UNESCO walk','Carpe Diem Beach Club'], onboard:['Pakleni Islands snorkel by tender','Sunset at Palmižana restaurant','Swim at Mekićevica hidden cove'] },
    barcelona:     { onshore:['Sagrada Família','La Boqueria market & tapas','Park Güell','Gothic Quarter bar crawl'], onboard:['Sunset cocktails in the marina','Barceloneta beach by tender','Nighttime city lights from the sea'] },
    palma:         { onshore:['La Seu Cathedral at dusk','Bellver Castle views','Mercat de l\'Olivar','Passeig des Born boutiques'], onboard:['Cala Portals Vells anchorage','Snorkel at Illetes Beach','Sunset at Portals Nous'] },
    ibiza:         { onshore:['Dalt Vila UNESCO old town','Ses Salines beach & flamingos','Sunset at Café del Mar','Formentera day trip by ferry'], onboard:["Anchor at Cala d'Hort (Es Vedrà views)",'Formentera crystal waters by tender','Las Salinas snorkel'] },
    'porto cervo': { onshore:['La Piazzetta evening aperitivo','Romazzino Beach','Pevero Golf Club','Cala di Volpe hotel beach lunch'], onboard:['La Maddalena archipelago cruise','Mortorio Island anchorage','Spargi Beach turquoise snorkel'] },
    sardinia:      { onshore:['Nuraghi Bronze Age towers','La Pelosa white-sand beach','Alghero Catalan old town','Bosa pastel riverside village'], onboard:['Maddalena archipelago cruise','Emerald Coast snorkelling','Lavezzi Islands at Corsica border'] },
    'st barths':   { onshore:["Gustavia duty-free boutiques","Colombier Beach hike (30 min)","Shell Beach sunset walk","Le Select — the legendary local bar"], onboard:['Anchor at Anse de Colombier','Fourchue island snorkel & swim','Sunset cocktails at anchor in the bay'] },
    'saint barths':{ onshore:["Gustavia duty-free boutiques","Colombier Beach hike","Shell Beach walk","Le Select bar"], onboard:['Anchor at Anse de Colombier','Fourchue island snorkel','Sunset cocktails at anchor'] },
    gustavia:      { onshore:["Boutique shopping along the port","Le Select bar (since 1949)","Wall House Museum","Shell Beach walk"], onboard:['Colombier Beach by tender','Fourchue island circumnavigation','Anse de Grande Saline swim'] },
    'st maarten':  { onshore:['Maho Beach (aircraft on approach)','Phillipsburg duty-free shopping','Grand Case gourmet dining strip','Orient Beach Club'], onboard:['Anchor off Happy Bay','Tintamarre Island snorkel','Pinel Island lunch by tender'] },
    antigua:       { onshore:["365 beaches — one for every day","English Harbour & Nelson's Dockyard","Shirley Heights Sunday BBQ & sunset","St John's Saturday market"], onboard:['Anchor at Great Bird Island','Green Island snorkel','Rendezvous Bay calm swim'] },
    tortola:       { onshore:['Sage Mountain National Park hike','Cane Garden Bay waterfront village','Callwood Rum Distillery','Road Town ferry connections'], onboard:['The Baths at Virgin Gorda','Jost Van Dyke snorkel & Soggy Dollar Bar','Cooper Island anchorage'] },
    'virgin gorda':{ onshore:["The Baths boulder grottos (sunrise)","Gorda Peak National Park hike","Savannah Bay quiet beach","Oil Nut Bay resort beach"], onboard:["Snorkel The Baths at first light","Leverick Bay anchorage","Anegada lobster run by tender"] },
    bermuda:       { onshore:['Horseshoe Bay pink sand beach','Crystal & Fantasy Caves','Royal Naval Dockyard & Clocktower Mall','St George\'s UNESCO town walk'], onboard:['Snorkel the Constellation & Montana wrecks','Tucker\'s Town anchorage','Ferry from Hamilton to Royal Dockyard'] },
    newport:       { onshore:["Cliff Walk (3.5 miles of coastline)",'Breakers Mansion guided tour','International Tennis Hall of Fame','Thames Street waterfront dining'], onboard:['Narragansett Bay sunset cruise','Second Beach swim','Jazz Festival anchorage (summer)'] },
    lisbon:        { onshore:["Alfama's Tram 28 & fado houses","LX Factory Sunday market","Pastéis de Belém by the river","Belém Tower & Jerónimos Monastery"], onboard:['Tagus River sunset cruise','Cascais by sea','Sesimbra Bay anchorage'] },
    madeira:       { onshore:['Levada walks & mountain trails','Funchal Mercado dos Lavradores','Monte toboggan ride & jardins','Pico do Arieiro sunrise at 1,818m'], onboard:['Desertas Islands wildlife cruise','Swim at Praia Formosa','Whale & dolphin watching year-round'] },
    maldives:      { onshore:['Sunset sandbank picnic setup','Malé Fish Market & Friday Mosque','Local island village cultural visit','Baa Atoll Biosphere Reserve walk'], onboard:['Snorkel with manta rays at Hanifaru Bay','Bioluminescent plankton night swim','Dive Maaya Thila for Tiger Sharks'] },
    seychelles:    { onshore:["Vallée de Mai — Coco de Mer palms (UNESCO)","Anse Source d'Argent, La Digue","Aldabra Atoll giant tortoise sanctuary","Victoria market & spice garden"], onboard:['Snorkel at Île Cocos','Anchor off Curieuse Island','Granite boulders sunset cruise'] },
    dubai:         { onshore:['Burj Khalifa & At The Top observation','Gold & Spice Souks of Deira','Arabian desert safari at sunset','Alserkal Avenue arts district'], onboard:['Dubai Creek sunset dhow cruise','Anchor off Palm Jumeirah','Water taxi to Dubai Marina Walk'] },
    phuket:        { onshore:['Phuket Old Town Sino-Portuguese walk','Wat Chalong temple','Big Buddha of Phuket','Patong Beach evening market'], onboard:['Similan Islands full-day snorkel trip','Phang Nga Bay sea caves by kayak','Phi Phi Islands by tender'] },
    thailand:      { onshore:["James Bond Island, Phang Nga Bay","Old Phuket Town architecture walk","Tiger Cave Temple climb (Krabi)","Night market at Ao Nang"], onboard:['Kayak through sea caves at Phang Nga','Snorkel at Similan Islands','Sunrise at Phi Phi Viewpoint by tender'] },
  };

  const getRecs = (location) => {
    const key = location.toLowerCase().replace(/[^a-z\s]/g, ' ').trim();
    const words = key.split(/\s+/);
    for (const k of Object.keys(RECS)) {
      if (words.some(w => w.length > 3 && k.includes(w))) return RECS[k];
      if (k.split(/[-\s]/).some(kw => words.includes(kw) && kw.length > 3)) return RECS[k];
    }
    return null;
  };

  const geocode = async (place) => {
    try {
      const r = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(place) + '&format=json&limit=1&accept-language=en');
      const j = await r.json();
      if (j[0]) return { lat: parseFloat(j[0].lat), lon: parseFloat(j[0].lon) };
    } catch {}
    return null;
  };

  const today = new Date().toISOString().slice(0, 10);
  const enriched = await Promise.all((c.itinerary || []).map(async (d) => {
    const geo = await geocode(d.location);
    let weather = null;
    if (geo && d.date) {
      try {
        const apiBase = d.date < today
          ? 'https://archive-api.open-meteo.com/v1/era5'
          : 'https://api.open-meteo.com/v1/forecast';
        const url = apiBase + '?latitude=' + geo.lat.toFixed(4) + '&longitude=' + geo.lon.toFixed(4) +
          '&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum&timezone=auto&start_date=' + d.date + '&end_date=' + d.date;
        const wd = await fetch(url).then(r => r.json());
        if (wd.daily && wd.daily.temperature_2m_max && wd.daily.temperature_2m_max[0] !== null) {
          weather = {
            max:    Math.round(wd.daily.temperature_2m_max[0]),
            min:    Math.round(wd.daily.temperature_2m_min[0]),
            code:   wd.daily.weathercode[0],
            precip: Math.round(wd.daily.precipitation_sum[0] * 10) / 10,
          };
        }
      } catch {}
    }
    return { ...d, geo, weather, recs: getRecs(d.location) };
  }));

  const coords  = enriched.filter(d => d.geo).map(d => [d.geo.lat, d.geo.lon]);
  const hasMap  = coords.length >= 1;
  const mapJson = JSON.stringify(coords);
  const guests  = (c.guests || []).map(gid => (FM.guests || []).find(x => x.id === gid)).filter(Boolean);

  const fmt = (s) => {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + +d + ', ' + y;
  };
  const esc = (s) => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  const dayCards = enriched.map((d, i) => {
    const icon    = WMO_ICON[d.weather?.code] ?? '';
    const desc    = WMO_DESC[d.weather?.code] ?? '';
    const weatherHtml = d.weather ? `
      <div style="display:flex;align-items:center;gap:14px;padding:10px 16px;background:#f8f8f6;border-radius:8px;margin-bottom:16px;font-family:'Helvetica Neue',Helvetica,sans-serif">
        <span style="font-size:26px;line-height:1">${icon}</span>
        <div>
          <div style="font-size:15px;font-weight:600;color:#1a1a1a">${d.weather.max}°C / ${d.weather.min}°C</div>
          <div style="font-size:11px;color:#888;margin-top:1px">${esc(desc)}${d.weather.precip > 0.2 ? ' · ' + d.weather.precip + 'mm rain' : ''}</div>
        </div>
      </div>` : '';
    const recsHtml = d.recs ? `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:14px">
        <div>
          <div style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#2563EB;margin-bottom:10px">On Shore</div>
          <ul style="margin:0;padding:0;list-style:none">${d.recs.onshore.map(r => `<li style="font-size:12px;color:#444;line-height:1.85;padding-left:14px;position:relative"><span style="position:absolute;left:0;color:#ccc">—</span>${esc(r)}</li>`).join('')}</ul>
        </div>
        <div>
          <div style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#0891b2;margin-bottom:10px">On Board</div>
          <ul style="margin:0;padding:0;list-style:none">${d.recs.onboard.map(r => `<li style="font-size:12px;color:#444;line-height:1.85;padding-left:14px;position:relative"><span style="position:absolute;left:0;color:#ccc">—</span>${esc(r)}</li>`).join('')}</ul>
        </div>
      </div>` : '';
    return `
      <div style="display:grid;grid-template-columns:56px 1fr;border-bottom:1px solid #efefef;padding:26px 0;page-break-inside:avoid">
        <div><div style="width:38px;height:38px;border-radius:50%;background:#F97316;color:#fff;font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:2px">${i+1}</div></div>
        <div style="padding-right:8px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
            <div style="font-size:22px;font-weight:700;letter-spacing:-.02em;color:#1a1a1a;line-height:1.15">${esc(d.location)}</div>
            <div style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:12px;color:#999;white-space:nowrap;margin-top:5px;margin-left:16px">${fmt(d.date)}</div>
          </div>
          ${d.notes ? `<div style="font-size:13px;color:#555;line-height:1.7;margin-bottom:14px">${esc(d.notes)}</div>` : ''}
          ${weatherHtml}
          ${recsHtml}
        </div>
      </div>`;
  }).join('');

  const guestTable = guests.length ? `
    <div style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#F97316;margin-bottom:14px">Guest list &amp; preferences</div>
    <table style="width:100%;border-collapse:collapse;font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:12px;margin-bottom:44px">
      <thead><tr style="border-bottom:1.5px solid #1a1a1a">
        <th style="text-align:left;padding:6px 10px 10px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#888;font-weight:600">Name</th>
        <th style="text-align:left;padding:6px 10px 10px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#888;font-weight:600">Relation</th>
        <th style="text-align:left;padding:6px 10px 10px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#888;font-weight:600">Cabin</th>
        <th style="text-align:left;padding:6px 10px 10px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#888;font-weight:600">Dietary</th>
        <th style="text-align:left;padding:6px 10px 10px;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#888;font-weight:600">Allergies</th>
      </tr></thead>
      <tbody>${guests.map(g => `<tr>
        <td style="padding:10px;border-bottom:1px solid #f0f0f0;vertical-align:top">${esc(g.name)}</td>
        <td style="padding:10px;border-bottom:1px solid #f0f0f0;vertical-align:top;color:#666">${esc(g.relation||'—')}</td>
        <td style="padding:10px;border-bottom:1px solid #f0f0f0;vertical-align:top;color:#666">${esc(g.cabin||'—')}</td>
        <td style="padding:10px;border-bottom:1px solid #f0f0f0;vertical-align:top;color:#666">${esc(g.dietary||'—')}</td>
        <td style="padding:10px;border-bottom:1px solid #f0f0f0;vertical-align:top${g.allergies&&g.allergies!=='None'?';color:#c22;font-weight:600':''}">${esc(g.allergies||'None')}</td>
      </tr>`).join('')}</tbody>
    </table>` : '';

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<title>${esc(c.name)} — Itinerary</title>
${hasMap ? '<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">' : ''}
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Georgia','Times New Roman',serif;color:#1a1a1a;background:#fff}
@media print{
  body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  @page{margin:0;size:A4}
  .no-print{display:none}
}
</style>
</head><body>

<!-- COVER -->
<div style="background:linear-gradient(155deg,#0a1628 0%,#1d3557 55%,#0a1628 100%);color:#fff;padding:60px 60px 52px;position:relative;overflow:hidden">
  <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#F97316,#fb923c,#F97316)"></div>
  <div style="position:absolute;top:40px;right:60px;font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.25)">FRAME</div>
  <div style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#F97316;margin-bottom:18px">Charter Itinerary</div>
  <div style="font-size:44px;font-weight:700;letter-spacing:-.025em;line-height:1.08;margin-bottom:8px">${esc(c.name)}</div>
  <div style="font-size:18px;color:rgba(255,255,255,.55);font-style:italic;margin-bottom:36px">${vessel ? esc(vessel.name) + (vessel.loa ? ' · ' + esc(vessel.loa) : '') : ''}</div>
  <div style="display:flex;gap:40px;flex-wrap:wrap">
    <div><div style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:5px">Embarkation</div><div style="font-size:14px">${esc(c.embark || enriched[0]?.location || '—')}</div></div>
    <div><div style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:5px">Disembarkation</div><div style="font-size:14px">${esc(c.disembark || enriched[enriched.length-1]?.location || '—')}</div></div>
    <div><div style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:5px">Departure</div><div style="font-size:14px">${fmt(c.start)}</div></div>
    <div><div style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:5px">Return</div><div style="font-size:14px">${fmt(c.end)}</div></div>
    ${nights ? `<div><div style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:5px">Duration</div><div style="font-size:14px">${nights} nights</div></div>` : ''}
    ${guests.length ? `<div><div style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.38);margin-bottom:5px">Guests</div><div style="font-size:14px">${guests.length} pax</div></div>` : ''}
  </div>
</div>

<!-- MAP -->
${hasMap ? `<div id="itin-map" style="height:320px;width:100%"></div>` : ''}

<!-- BODY -->
<div style="padding:44px 60px 64px">

  ${guestTable}

  <div style="font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:9px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#F97316;margin-bottom:4px">Day-by-day itinerary</div>
  <div>${dayCards}</div>

</div>

<!-- FOOTER -->
<div style="border-top:1px solid #efefef;padding:20px 60px;display:flex;align-items:center;justify-content:space-between;font-family:'Helvetica Neue',Helvetica,sans-serif;font-size:10px;color:#bbb">
  <span>Generated by Frame · ${esc(c.name)} · Confidential</span>
  <span>${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
</div>

${hasMap ? `<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>` : ''}
<script>
(function(){
  ${hasMap ? `
  var coords = ${mapJson};
  if (coords.length) {
    var map = L.map('itin-map',{zoomControl:false,attributionControl:false});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:18}).addTo(map);
    if (coords.length >= 2) {
      var line = L.polyline(coords,{color:'#F97316',weight:2.5,opacity:.75,dashArray:'10 7'}).addTo(map);
      map.fitBounds(line.getBounds(),{padding:[50,50]});
    } else {
      map.setView(coords[0],10);
    }
    coords.forEach(function(c,i){
      var icon = L.divIcon({
        html:'<div style="width:30px;height:30px;border-radius:50%;background:#F97316;color:#fff;font-family:Helvetica,sans-serif;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.25)">'+(i+1)+'</div>',
        className:'',iconSize:[30,30],iconAnchor:[15,15]
      });
      L.marker(c,{icon:icon}).addTo(map);
    });
  }
  ` : ''}
  setTimeout(function(){window.print();}, ${hasMap ? 3800 : 600});
})();
<\/script>
</body></html>`;

  showToast('Opening itinerary…');
  const w = window.open('', '_blank', 'width=1060,height=820');
  if (w) { w.document.write(html); w.document.close(); }
};
