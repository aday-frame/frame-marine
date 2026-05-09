/* ── GLOBAL SEARCH (Cmd+K) ── */
const Search = (() => {
  let _open = false;
  let _idx  = -1;

  /* ── index sources ── */
  function _index() {
    const results = [];

    // Work orders
    (FM.workOrders || []).forEach(w => {
      results.push({
        type:    'work-order',
        label:   w.title,
        sub:     w.zone + (w.system ? ' · ' + w.system : '') + ' · ' + w.status,
        badge:   'Work order',
        color:   'var(--or)',
        id:      w.id,
        vessel:  w.vessel,
        action() {
          const v = FM.vessels.find(v => v.id === this.vessel);
          if (v && FM.currentVesselId !== v.id) switchVessel(v.id);
          navTo('work-orders', document.querySelector('.ni[data-page=work-orders]'));
          setTimeout(() => WO.openPanel(this.id), 80);
        },
      });
    });

    // Property work orders
    (FM.propertyWorkOrders || []).forEach(w => {
      const prop = (FM.properties || []).find(p => p.id === w.property);
      results.push({
        type:  'prop-work-order',
        label: w.title,
        sub:   (prop ? prop.name + ' · ' : '') + w.room + ' · ' + w.status,
        badge: 'Property issue',
        color: '#4ADE80',
        id:    w.id,
        propId: w.property,
        action() {
          Properties.switchTo(this.propId);
          setTimeout(() => { navTo('prop-workorders', document.querySelector('.ni[data-page=prop-workorders]')); setTimeout(() => Properties.openWODetail(this.id), 80); }, 80);
        },
      });
    });

    // Crew
    (FM.crew || []).filter(c => c.id !== 'c1').forEach(c => {
      results.push({
        type:  'crew',
        label: c.name,
        sub:   c.role + (c.vessel ? ' · ' + (FM.vessels.find(v=>v.id===c.vessel)?.name || c.vessel) : ''),
        badge: 'Crew',
        color: '#60A5FA',
        id:    c.id,
        action() {
          navTo('team', document.querySelector('.ni[data-page=team]'));
        },
      });
    });

    // Inventory
    (FM.inventory || []).forEach(i => {
      results.push({
        type:  'inventory',
        label: i.name,
        sub:   i.category + ' · ' + i.location + ' · ' + i.qty + ' ' + i.unit,
        badge: 'Inventory',
        color: '#FACC15',
        id:    i.id,
        action() {
          navTo('inventory', document.querySelector('.ni[data-page=inventory]'));
          setTimeout(() => Inventory.openDetail(this.id), 80);
        },
      });
    });

    // Vessel documents
    (FM.vesselDocs || []).forEach(d => {
      results.push({
        type:  'document',
        label: d.name,
        sub:   d.category + (d.expires ? ' · Expires ' + d.expires : ''),
        badge: 'Document',
        color: '#A78BFA',
        id:    d.id,
        action() {
          navTo('documents', document.querySelector('.ni[data-page=documents]'));
        },
      });
    });

    // Property documents
    (FM.propertyDocs || []).forEach(d => {
      const prop = (FM.properties || []).find(p => p.id === d.property);
      results.push({
        type:  'prop-document',
        label: d.name,
        sub:   (prop ? prop.name + ' · ' : '') + d.category,
        badge: 'Prop. doc',
        color: '#4ADE80',
        id:    d.id,
        propId: d.property,
        action() {
          Properties.switchTo(this.propId);
          setTimeout(() => navTo('prop-documents', document.querySelector('.ni[data-page=prop-documents]')), 80);
        },
      });
    });

    // Vessels
    (FM.vessels || []).forEach(v => {
      results.push({
        type:  'vessel',
        label: v.name,
        sub:   v.type + ' · ' + v.loa + ' · ' + v.port,
        badge: 'Vessel',
        color: '#60A5FA',
        id:    v.id,
        action() {
          switchVessel(this.id);
          navTo('dashboard', document.querySelector('.ni[data-page=dashboard]'));
        },
      });
    });

    // Properties
    (FM.properties || []).forEach(p => {
      results.push({
        type:  'property',
        label: p.name,
        sub:   p.type + ' · ' + p.location,
        badge: 'Property',
        color: '#4ADE80',
        id:    p.id,
        action() {
          Properties.switchTo(this.id);
        },
      });
    });

    // Charters
    (FM.charters || []).forEach(c => {
      results.push({
        type:  'charter',
        label: c.name || c.title || c.id,
        sub:   (c.guests ? c.guests + ' guests · ' : '') + (c.start || ''),
        badge: 'Charter',
        color: 'var(--or)',
        id:    c.id,
        action() {
          navTo('charter', document.querySelector('.ni[data-page=charter]'));
        },
      });
    });

    // Property staff
    (FM.propertyStaff || []).forEach(s => {
      const prop = (FM.properties || []).find(p => p.id === s.property);
      results.push({
        type:  'staff',
        label: s.name,
        sub:   s.role + (prop ? ' · ' + prop.name : ''),
        badge: 'Staff',
        color: '#4ADE80',
        id:    s.id,
        propId: s.property,
        action() {
          Properties.switchTo(this.propId);
          setTimeout(() => navTo('prop-staff', document.querySelector('.ni[data-page=prop-staff]')), 80);
        },
      });
    });

    return results;
  }

  function _match(item, q) {
    const q2 = q.toLowerCase();
    return item.label.toLowerCase().includes(q2) || item.sub.toLowerCase().includes(q2);
  }

  /* ── render ── */
  function _render(q) {
    const overlay = document.getElementById('search-overlay');
    if (!overlay) return;

    if (!q) {
      overlay.querySelector('#search-results').innerHTML = `
        <div style="text-align:center;padding:32px 20px;color:var(--txt3);font-size:12px">
          Search work orders, crew, inventory, documents, properties…
        </div>`;
      _idx = -1;
      return;
    }

    const all     = _index();
    const matches = all.filter(r => _match(r, q)).slice(0, 12);

    if (!matches.length) {
      overlay.querySelector('#search-results').innerHTML = `
        <div style="text-align:center;padding:32px 20px;color:var(--txt3);font-size:12px">No results for "<strong style="color:var(--txt)">${escHtml(q)}</strong>"</div>`;
      _idx = -1;
      return;
    }

    // Group by badge type
    const groups = {};
    matches.forEach(r => {
      const g = r.badge;
      if (!groups[g]) groups[g] = [];
      groups[g].push(r);
    });

    let html = '';
    let globalI = 0;
    Object.entries(groups).forEach(([grp, items]) => {
      html += `<div style="padding:6px 14px 2px;font-size:9px;font-weight:700;color:var(--txt4);text-transform:uppercase;letter-spacing:.09em">${escHtml(grp)}</div>`;
      items.forEach(r => {
        html += `
          <div class="sr-row" data-si="${globalI}" onclick="Search._pick(${globalI})" onmouseover="Search._hover(${globalI})" style="display:flex;align-items:center;gap:12px;padding:8px 14px;cursor:pointer;border-radius:0;transition:background .08s">
            <div style="width:28px;height:28px;border-radius:7px;background:${r.color}18;display:flex;align-items:center;justify-content:center;flex-shrink:0">
              ${_icon(r.type, r.color)}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:500;color:var(--txt);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${_highlight(r.label, q)}</div>
              <div style="font-size:11px;color:var(--txt3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px">${escHtml(r.sub)}</div>
            </div>
            <span style="font-size:9px;font-weight:700;letter-spacing:.05em;color:${r.color};flex-shrink:0;opacity:.7">${escHtml(r.badge.toUpperCase())}</span>
          </div>`;
        globalI++;
      });
    });

    overlay.querySelector('#search-results').innerHTML = html;
    // Store matches on overlay for _pick
    overlay._matches = matches;
    _idx = -1;
    _setActive(-1);
  }

  function _highlight(text, q) {
    if (!q) return escHtml(text);
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escHtml(text).replace(new RegExp(escaped, 'gi'), m => `<mark style="background:rgba(249,115,22,.25);color:var(--or);border-radius:2px">${m}</mark>`);
  }

  function _icon(type, color) {
    const c = `fill="${color}" style="width:13px;height:13px"`;
    if (type === 'work-order' || type === 'prop-work-order')
      return `<svg viewBox="0 0 16 16" ${c}><path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 2v1h8V5H4zm0 3v1h8V8H4zm0 3v1h5v-1H4z"/></svg>`;
    if (type === 'crew' || type === 'staff')
      return `<svg viewBox="0 0 16 16" ${c}><path d="M5 4a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zM1 13.5a6 6 0 0114 0v.5H1v-.5z"/></svg>`;
    if (type === 'inventory')
      return `<svg viewBox="0 0 16 16" ${c}><path d="M2 2h12a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1zm0 5h12a1 1 0 011 1v2a1 1 0 01-1 1H2a1 1 0 01-1-1V8a1 1 0 011-1zm0 5h7a1 1 0 011 1v1a1 1 0 01-1 1H2a1 1 0 01-1-1v-1a1 1 0 011-1z"/></svg>`;
    if (type === 'document' || type === 'prop-document')
      return `<svg viewBox="0 0 16 16" ${c}><path d="M2 3a1 1 0 011-1h3.586a1 1 0 01.707.293L8.707 3.707A1 1 0 019.414 4H13a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V3z"/></svg>`;
    if (type === 'vessel')
      return `<svg viewBox="0 0 16 16" ${c}><path d="M1 10l2-5h10l2 5H1zm3-3h8l-1 2H5L4 7zm3-5a1 1 0 011 1v1H7V3a1 1 0 011-1z"/></svg>`;
    if (type === 'property')
      return `<svg viewBox="0 0 16 16" ${c}><path d="M8 1L1 6.5V7h1v7h4v-4h4v4h4V7h1v-.5L8 1zm0 1.5l5 3.7V7H3V6.2L8 2.5z"/></svg>`;
    if (type === 'charter')
      return `<svg viewBox="0 0 16 16" ${c}><path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V6.414a1 1 0 00-.293-.707L11 3l-1.293-1.293A1 1 0 009 1.586V2H4z"/></svg>`;
    return `<svg viewBox="0 0 16 16" ${c}><circle cx="8" cy="8" r="6"/></svg>`;
  }

  /* ── keyboard nav ── */
  function _setActive(i) {
    _idx = i;
    document.querySelectorAll('#search-results .sr-row').forEach((el, j) => {
      el.style.background = j === i ? 'var(--bg3)' : '';
    });
  }

  function _hover(i) { _setActive(i); }

  function _pick(i) {
    const overlay = document.getElementById('search-overlay');
    if (!overlay) return;
    const matches = overlay._matches || [];
    const item = matches[i];
    if (!item) return;
    close();
    item.action();
  }

  /* ── open / close ── */
  function open() {
    const overlay = document.getElementById('search-overlay');
    if (!overlay) return;
    _open = true;
    overlay.style.display = 'flex';
    const inp = document.getElementById('search-input');
    if (inp) { inp.value = ''; inp.focus(); }
    _render('');
    requestAnimationFrame(() => overlay.style.opacity = '1');
  }

  function close() {
    const overlay = document.getElementById('search-overlay');
    if (!overlay) return;
    _open = false;
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.style.display = 'none'; }, 150);
  }

  function toggle() { _open ? close() : open(); }

  /* ── global keyboard handler ── */
  function _onKey(e) {
    const isMac  = navigator.platform.toUpperCase().includes('MAC');
    const cmdKey = isMac ? e.metaKey : e.ctrlKey;

    if (cmdKey && e.key === 'k') {
      e.preventDefault();
      toggle();
      return;
    }

    if (!_open) return;

    const rows = document.querySelectorAll('#search-results .sr-row');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      _setActive(Math.min(_idx + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      _setActive(Math.max(_idx - 1, 0));
    } else if (e.key === 'Enter') {
      if (_idx >= 0) { e.preventDefault(); _pick(_idx); }
    } else if (e.key === 'Escape') {
      close();
    }
  }

  function init() {
    document.addEventListener('keydown', _onKey);
    const inp = document.getElementById('search-input');
    if (inp) {
      inp.addEventListener('input', () => _render(inp.value.trim()));
    }
    // Close on backdrop click
    const overlay = document.getElementById('search-overlay');
    if (overlay) {
      overlay.addEventListener('mousedown', e => {
        if (e.target === overlay) close();
      });
    }
  }

  return { open, close, toggle, init, _pick, _hover };
})();

window.Search = Search;
