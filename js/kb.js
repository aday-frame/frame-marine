/* ── KNOWLEDGE BASE MODULE ── */
const KB = (() => {
  let _system = 'all';
  let _search  = '';
  let _article = null;

  const SYSTEMS = [
    { id:'all',        label:'All systems',           icon:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><circle cx="8" cy="8" r="6"/><path d="M5 8h6M8 5v6"/></svg>' },
    { id:'propulsion', label:'Engines & Propulsion',  icon:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 7h1V5l2-1h2V3h2v1h2l2 1v2h1v2h-1v2l-2 1H9v1H7v-1H5l-2-1V9H2V7zm3 1a3 3 0 006 0 3 3 0 00-6 0zm3-1a1 1 0 100 2 1 1 0 000-2z" opacity=".85"/></svg>' },
    { id:'electrical', label:'Electrical',             icon:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M9 1L5 9h4l-2 6 6-8H9L11 1z" opacity=".9"/></svg>' },
    { id:'navigation', label:'Navigation',             icon:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" opacity=".9"/></svg>' },
    { id:'plumbing',   label:'Plumbing & Watermaker', icon:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M8 2v8m0 0a3 3 0 000 4 3 3 0 000-4z"/></svg>' },
    { id:'hvac',       label:'HVAC & Climate',         icon:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M8 2v12M4 4l4 4 4-4M4 12l4-4 4 4"/></svg>' },
    { id:'safety',     label:'Safety & Fire',          icon:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L2 3.5v4C2 11 5 14 8 15c3-1 6-4 6-7.5v-4L8 1zm-.5 4h1v3.5h-1V5zm0 4.5h1v1h-1V9.5z" opacity=".9"/></svg>' },
    { id:'deck',       label:'Deck & Exterior',        icon:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 2L2 8h2v5h4v-3h4v3h4V8h2L8 2z" opacity=".85"/></svg>' },
    { id:'avit',       label:'AV & IT',                icon:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><rect x="2" y="3" width="12" height="8" rx="1"/><path d="M5 14h6M8 11v3"/></svg>' },
  ];

  const SYS_COLORS = {
    propulsion: '#F97316', electrical: '#FACC15', navigation: '#60A5FA',
    plumbing:   '#34D399', hvac:       '#A78BFA', safety:     '#F87171',
    deck:       '#4ADE80', avit:       '#38BDF8',
  };

  function _articles() {
    let arts = (FM.kbArticles || []).filter(a => !a.vessel || a.vessel === FM.currentVesselId || FM.currentVesselId === 'all');
    if (_system !== 'all') arts = arts.filter(a => a.system === _system);
    if (_search.trim()) {
      const q = _search.trim().toLowerCase();
      arts = arts.filter(a =>
        a.title.toLowerCase().includes(q) ||
        (a.summary || '').toLowerCase().includes(q) ||
        (a.content || '').toLowerCase().includes(q)
      );
    }
    return arts;
  }

  function _sysLabel(id) {
    const s = SYSTEMS.find(s => s.id === id);
    return s ? s.label : id;
  }

  function _fmtDate(s) {
    if (!s) return '';
    const [y, m, d] = s.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + d + ', ' + y;
  }

  function render() {
    const wrap = document.getElementById('page-kb');
    if (!wrap) return;

    if (_article) {
      _renderArticle(wrap);
      return;
    }

    const arts = _articles();
    const isMob = window.innerWidth <= 768;

    wrap.innerHTML = `
      <div class="kb-wrap">
        ${isMob ? '' : _sidebarHTML()}
        <div class="kb-main">
          <div class="kb-topbar">
            <div class="kb-search-wrap">
              <svg viewBox="0 0 16 16" fill="none" stroke="var(--txt3)" stroke-width="1.4" stroke-linecap="round" style="width:14px;height:14px;flex-shrink:0"><circle cx="6.5" cy="6.5" r="4"/><path d="M10 10l3 3"/></svg>
              <input class="kb-search" type="text" placeholder="Search articles..." value="${escHtml(_search)}"
                oninput="KB.search(this.value)">
            </div>
            ${isMob ? `<div class="kb-sys-pills">${SYSTEMS.map(s =>
              `<button class="kb-pill${s.id===_system?' kb-pill-active':''}" onclick="KB.setSystem('${s.id}')">${s.label}</button>`
            ).join('')}</div>` : ''}
          </div>

          ${arts.length === 0 ? `
            <div style="padding:40px 20px;text-align:center;color:var(--txt3)">
              <div style="font-size:28px;margin-bottom:8px">📖</div>
              <div style="font-size:14px">No articles found</div>
              ${_search ? `<button class="btn btn-ghost" style="margin-top:12px" onclick="KB.search('')">Clear search</button>` : ''}
            </div>` : `
          <div class="kb-grid">
            ${arts.map(_cardHTML).join('')}
          </div>`}
        </div>
      </div>
    `;
  }

  function _sidebarHTML() {
    return `<div class="kb-sidebar">
      <div class="kb-sidebar-title">Systems</div>
      ${SYSTEMS.map(s => `
        <button class="kb-nav-item${s.id===_system?' active':''}" onclick="KB.setSystem('${s.id}')">
          <span class="kb-nav-icon" style="color:${s.id==='all'?'var(--txt3)':SYS_COLORS[s.id]||'var(--txt3)'}">
            ${s.icon}
          </span>
          <span class="kb-nav-lbl">${s.label}</span>
        </button>`).join('')}
    </div>`;
  }

  function _cardHTML(a) {
    const color = SYS_COLORS[a.system] || 'var(--txt3)';
    const stepCount = (a.steps || []).length;
    return `
      <button class="kb-card" onclick="KB.open('${a.id}')">
        <div class="kb-card-top">
          <span class="kb-card-sys" style="background:${color}18;color:${color}">${_sysLabel(a.system)}</span>
          ${stepCount ? `<span style="font-size:10px;color:var(--txt3)">${stepCount} steps</span>` : ''}
        </div>
        <div class="kb-card-title">${escHtml(a.title)}</div>
        <div class="kb-card-summary">${escHtml(a.summary)}</div>
        <div class="kb-card-meta">
          <span>${a.author || ''}</span>
          <span>${a.updatedAt ? 'Updated ' + _fmtDate(a.updatedAt) : ''}</span>
        </div>
      </button>`;
  }

  function _renderArticle(wrap) {
    const a = (FM.kbArticles || []).find(x => x.id === _article);
    if (!a) { _article = null; render(); return; }

    const color = SYS_COLORS[a.system] || 'var(--txt3)';

    const stepsHTML = (a.steps || []).length ? `
      <div class="kb-art-section">
        <div class="kb-art-section-title">Steps</div>
        <ol class="kb-steps">
          ${a.steps.map(s => `<li class="kb-step">${escHtml(s)}</li>`).join('')}
        </ol>
      </div>` : '';

    const notesHTML = (a.notes || []).length ? `
      <div class="kb-art-section">
        <div class="kb-art-section-title">Notes & tips</div>
        ${a.notes.map(n => `
          <div class="kb-note">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="width:13px;height:13px;flex-shrink:0;color:var(--yel)"><circle cx="8" cy="8" r="6"/><path d="M8 7v4"/><circle cx="8" cy="5.5" r=".5" fill="currentColor" stroke="none"/></svg>
            <span>${escHtml(n)}</span>
          </div>`).join('')}
      </div>` : '';

    const bodyHTML = (a.body || []).length ? `
      <div class="kb-art-section">
        ${a.body.map(b => `
          <div class="kb-body-block">
            <div class="kb-body-heading">${escHtml(b.heading)}</div>
            <ul class="kb-body-list">
              ${b.items.map(i => `<li>${escHtml(i)}</li>`).join('')}
            </ul>
          </div>`).join('')}
      </div>` : '';

    wrap.innerHTML = `
      <div class="kb-art-wrap">
        <div class="kb-art-header">
          <button class="btn btn-ghost btn-sm" onclick="KB.back()" style="gap:4px">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" style="width:13px;height:13px"><path d="M10 3L5 8l5 5"/></svg>
            Back
          </button>
          <span class="kb-card-sys" style="background:${color}18;color:${color};font-size:11px;padding:3px 8px;border-radius:20px">${_sysLabel(a.system)}</span>
        </div>

        <div class="kb-art-body">
          <h1 class="kb-art-title">${escHtml(a.title)}</h1>
          <div class="kb-art-meta">
            ${a.author ? `<span>${escHtml(a.author)}</span>` : ''}
            ${a.updatedAt ? `<span>Updated ${_fmtDate(a.updatedAt)}</span>` : ''}
          </div>

          ${a.summary ? `<div class="kb-art-summary">${escHtml(a.summary)}</div>` : ''}

          ${a.content ? `<div class="kb-art-content">${escHtml(a.content)}</div>` : ''}

          ${stepsHTML}
          ${bodyHTML}
          ${notesHTML}
        </div>
      </div>
    `;
  }

  function open(id) {
    _article = id;
    render();
  }

  function back() {
    _article = null;
    render();
  }

  function setSystem(sys) {
    _system = sys;
    _article = null;
    render();
  }

  function search(q) {
    _search = q;
    _article = null;
    render();
  }

  return { render, open, back, setSystem, search };
})();
