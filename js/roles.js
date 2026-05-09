/* ── ROLES MODULE ── */
const Roles = (() => {
  const DEFS = [
    { id: 'owner',   label: 'Owner',   desc: 'Full access to all modules',      color: '#F97316', rgb: '249,115,22'  },
    { id: 'captain', label: 'Captain', desc: 'Operations & compliance',          color: '#60A5FA', rgb: '96,165,250'  },
    { id: 'crew',    label: 'Crew',    desc: 'Essential operational access',     color: '#4ADE80', rgb: '74,222,128'  },
  ];

  function get() { return FM.role || 'owner'; }

  function set(role) {
    FM.role = role;
    _applyNav();
    _updateBadge();
    closeModal();
    // If current page is not allowed for the new role, go to dashboard
    const currentPage = window.App?.currentPage;
    if (currentPage) {
      const ni = document.querySelector(`.ni[data-page="${currentPage}"]`);
      const allowed = ni ? (ni.dataset.roles || '').split(',') : ['owner','captain','crew'];
      if (!allowed.includes(role)) {
        navTo('dashboard', document.querySelector('.ni[data-page=dashboard]'));
      }
    }
    showToast(`Viewing as ${DEFS.find(r => r.id === role)?.label}`);
  }

  function _applyNav() {
    const role = get();
    document.querySelectorAll('.ni[data-roles]').forEach(el => {
      const allowed = el.dataset.roles.split(',');
      el.style.display = allowed.includes(role) ? '' : 'none';
    });
    _reconcileSecLabels();
  }

  function _reconcileSecLabels() {
    const scroll = document.querySelector('.sb-scroll');
    if (!scroll) return;
    const children = [...scroll.children];
    let secEl = null;
    let hasVisible = false;

    for (const el of children) {
      if (el.classList.contains('sec-lbl')) {
        if (secEl) {
          const nat = secEl.getAttribute('data-nat-display') ?? '';
          secEl.style.display = hasVisible ? nat : 'none';
        }
        if (!el.hasAttribute('data-nat-display')) {
          el.setAttribute('data-nat-display', el.style.display || '');
        }
        secEl = el;
        hasVisible = false;
      } else if (el.classList.contains('ni') && el.style.display !== 'none') {
        hasVisible = true;
      }
    }
    if (secEl) {
      const nat = secEl.getAttribute('data-nat-display') ?? '';
      secEl.style.display = hasVisible ? nat : 'none';
    }
  }

  function _updateBadge() {
    const def = DEFS.find(r => r.id === get()) || DEFS[0];
    const badge = document.getElementById('role-badge');
    const dot   = document.getElementById('role-dot');
    const tbDot = document.getElementById('tb-role-dot');
    if (badge) { badge.textContent = def.label; badge.style.color = def.color; }
    if (dot)   dot.style.background = def.color;
    if (tbDot) tbDot.style.background = def.color;
  }

  function openSwitcher() {
    const current = get();
    openModal(`
      <div style="display:flex;flex-direction:column;gap:8px">
        ${DEFS.map(r => {
          const active = current === r.id;
          return `
          <button onclick="Roles.set('${r.id}')" style="display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:10px;border:.5px solid ${active ? r.color : 'var(--bd)'};background:${active ? `rgba(${r.rgb},.08)` : 'var(--bg3)'};cursor:pointer;width:100%;text-align:left;transition:all .15s" onmouseover="if(!'${active}')this.style.background='var(--bg4)'" onmouseout="if(!'${active}')this.style.background='${active ? `rgba(${r.rgb},.08)` : 'var(--bg3)'}'">
            <div style="width:9px;height:9px;border-radius:50%;background:${r.color};flex-shrink:0"></div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:600;color:${active ? r.color : 'var(--txt)'}">${r.label}</div>
              <div style="font-size:11px;color:var(--txt3);margin-top:1px">${r.desc}</div>
            </div>
            ${active ? `<svg viewBox="0 0 16 16" fill="${r.color}" style="width:13px;height:13px;flex-shrink:0"><path d="M13.5 3.5l-7 7-3.5-3.5-1 1L6.5 12.5l8-8-1-1z"/></svg>` : ''}
          </button>`;
        }).join('')}
        <p style="font-size:10px;color:var(--txt4);text-align:center;margin-top:4px">Role switching simulates user access levels</p>
      </div>
    `, 'Switch role view', { hideFooter: true });
  }

  function init() {
    if (!FM.role) FM.role = 'owner';
    _applyNav();
    _updateBadge();
  }

  return { get, set, openSwitcher, init, applyNav: _applyNav };
})();

window.Roles = Roles;
