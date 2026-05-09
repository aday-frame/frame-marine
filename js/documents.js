/* ── DOCUMENT VAULT MODULE ── */
const Documents = (() => {
  const CATS = ['All','Registration','Insurance','Contracts','Manuals'];
  const CAT_COLORS = { Registration:'#60A5FA', Insurance:'#A78BFA', Contracts:'#4ADE80', Manuals:'#FACC15' };
  let _tab = 'All';

  function _vessel() { return FM.currentVessel(); }
  function _docs() {
    const v = _vessel();
    return (FM.vesselDocs || []).filter(d => !v || d.vessel === v.id);
  }
  function _daysUntil(s) {
    if (!s) return null;
    return Math.ceil((new Date(s) - new Date('2026-05-06')) / 86400000);
  }
  function _expStatus(expires) {
    const d = _daysUntil(expires);
    if (d === null) return { label:'No expiry', color:'var(--txt3)', cls:'b-done' };
    if (d < 0)      return { label:'Expired',   color:'var(--red)', cls:'b-high' };
    if (d <= 30)    return { label:d+'d left',  color:'var(--red)', cls:'b-high' };
    if (d <= 90)    return { label:d+'d left',  color:'var(--yel)', cls:'b-medium' };
    return               { label:'Valid',       color:'var(--grn)', cls:'b-done' };
  }

  function _docRow(d) {
    const exp = _expStatus(d.expires);
    return `<tr style="cursor:pointer" onclick="Documents.view('${d.id}')">
      <td style="font-weight:500;color:var(--txt)">${escHtml(d.name)}${d.notes ? `<div style="font-size:10px;color:var(--txt3);font-weight:400;margin-top:1px">${escHtml(d.notes)}</div>` : ''}</td>
      <td style="font-family:var(--mono);font-size:10px;color:var(--txt3)">${escHtml(d.docRef || '—')}</td>
      <td style="color:var(--txt3)">${d.uploadedAt || '—'}</td>
      <td style="color:${exp.color};font-weight:${d.expires ? '500' : '400'}">${_fmtDate(d.expires)}</td>
      <td><span class="badge ${exp.cls}" style="font-size:9px">${exp.label}</span></td>
    </tr>`;
  }

  const _THEAD = `<thead><tr><th>Document</th><th>Doc ref</th><th>Uploaded</th><th>Expires</th><th>Status</th></tr></thead>`;
  const _GRP   = n => `<tr><td colspan="6" style="padding:10px 12px 6px;font-size:9px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.09em;background:var(--bg);border-bottom:.5px solid var(--bd)">${escHtml(n)}</td></tr>`;
  function _fmtDate(s) {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + d + ', ' + y;
  }

  function _alertBanner(expiring) {
    if (!expiring.length) return '';
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(251,191,36,.08);border:.5px solid rgba(251,191,36,.3);border-radius:8px;margin-bottom:16px">
      <svg viewBox="0 0 16 16" fill="var(--yel)" style="width:14px;height:14px;flex-shrink:0"><path d="M8 1a.5.5 0 01.443.27l6.5 12A.5.5 0 0114.5 14h-13a.5.5 0 01-.443-.73l6.5-12A.5.5 0 018 1zm0 4a.5.5 0 00-.5.5v3a.5.5 0 001 0v-3A.5.5 0 008 5zm0 6.5a.5.5 0 100 1 .5.5 0 000-1z"/></svg>
      <span style="font-size:12px;color:var(--yel);font-weight:500">${expiring.length} document${expiring.length > 1 ? 's' : ''} expiring within 90 days. Give them a look.</span>
    </div>`;
  }

  function _tabBar(docs) {
    return `<div style="display:flex;gap:4px;margin-bottom:16px;border-bottom:.5px solid var(--bd)">
      ${CATS.map(c => `<button onclick="Documents.setTab('${c}')" class="tab-btn ${_tab===c ? 'tab-btn-active' : ''}">${c}${c !== 'All' ? ` (${docs.filter(d=>d.category===c).length})` : ''}</button>`).join('')}
    </div>`;
  }

  function _docCard(d) {
    const exp = _expStatus(d.expires);
    const CAT_COL = { Registration:'#60A5FA', Insurance:'#A78BFA', Contracts:'#4ADE80', Manuals:'#FACC15' };
    const col = CAT_COL[d.category] || 'var(--txt3)';
    return `
      <div class="doc-mob-card" style="cursor:pointer" onclick="Documents.view('${d.id}')">
        <div class="doc-mob-icon" style="background:${col}22;color:${col}">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3a1 1 0 011-1h3.586a1 1 0 01.707.293L8.707 3.707A1 1 0 019.414 4H13a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V3z"/></svg>
        </div>
        <div class="doc-mob-body">
          <div class="doc-mob-title">${escHtml(d.name)}</div>
          <div class="doc-mob-meta">
            <span class="badge ${exp.cls}" style="font-size:9px">${exp.label}</span>
            ${d.expires ? `<span style="font-size:11px;color:var(--txt3)">${_fmtDate(d.expires)}</span>` : ''}
            <span style="font-size:11px;color:var(--txt4)">${escHtml(d.category)}</span>
          </div>
        </div>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--txt4)" stroke-width="1.5" stroke-linecap="round" style="flex-shrink:0"><path d="M6 3l5 5-5 5"/></svg>
      </div>`;
  }

  function render() {
    const wrap = document.getElementById('page-documents');
    if (!wrap) return;
    const docs    = _docs();
    const visible = _tab === 'All' ? docs : docs.filter(d => d.category === _tab);
    const expiring = docs.filter(d => { const dd = _daysUntil(d.expires); return dd !== null && dd <= 90; });
    const expired  = docs.filter(d => { const dd = _daysUntil(d.expires); return dd !== null && dd < 0; });
    const valid    = docs.filter(d => { const dd = _daysUntil(d.expires); return dd === null || dd >= 0; });

    // Populate shared stats bar
    const docsStatsEl = document.getElementById('docs-stats');
    if (docsStatsEl) {
      docsStatsEl.style.gridTemplateColumns = 'repeat(4,1fr)';
      docsStatsEl.innerHTML = `
        <div class="wo-stat"><div class="wo-stat-num">${docs.length}</div><div class="wo-stat-lbl">Total</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:var(--grn)">${valid.length}</div><div class="wo-stat-lbl">Valid</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="${expiring.length?'color:var(--yel)':''}">${expiring.length}</div><div class="wo-stat-lbl">Expiring (90d)</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="${expired.length?'color:var(--red)':''}">${expired.length}</div><div class="wo-stat-lbl">Expired</div></div>`;
    }
    // Sync filter pill
    document.querySelectorAll('#docs-filters .fp').forEach(p => p.classList.toggle('on', p.dataset.df === _tab));

    const isMob = window.innerWidth <= 768;

    const listContent = (() => {
      if (!visible.length) return `<div style="color:var(--txt3);font-size:13px;padding:20px 0">No ${_tab !== 'All' ? _tab.toLowerCase() + ' ' : ''}documents on file. <button class="btn btn-ghost btn-xs" style="margin-left:8px" onclick="Documents.openAdd()">Add document</button></div>`;
      if (isMob) {
        const cats = _tab === 'All' ? [...new Set(visible.map(d => d.category))] : [_tab];
        return cats.map(cat => {
          const items = visible.filter(d => d.category === cat);
          if (!items.length) return '';
          return `<div class="doc-mob-group-lbl">${escHtml(cat)}</div>${items.map(_docCard).join('')}`;
        }).join('');
      }
      const cats = _tab === 'All' ? [...new Set(visible.map(d => d.category))] : null;
      const tbody = cats
        ? cats.map(cat => _GRP(cat) + visible.filter(d => d.category === cat).map(_docRow).join('')).join('')
        : visible.map(_docRow).join('');
      return `<div class="tbl-wrap"><table class="tbl">${_THEAD}<tbody>${tbody}</tbody></table></div>`;
    })();

    wrap.innerHTML = `
      <div style="padding:18px 20px 80px">
        ${_alertBanner(expiring)}
        <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
          <button class="btn btn-primary btn-sm" onclick="Documents.openAdd()">+ Add document</button>
        </div>
        ${listContent}
      </div>
    `;
  }

  function setTab(t) { _tab = t; render(); }

  function _docPreviewHTML(d) {
    const exp = _expStatus(d.expires);
    const v   = FM.currentVessel() || FM.vessels[0];
    const vName = v ? v.name : 'Lady M';
    const flag  = v ? v.flag : 'CYM';

    const header = `
      <div style="background:var(--bg3);border-radius:8px 8px 0 0;padding:16px 20px;border:.5px solid var(--bd);border-bottom:none">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div>
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--txt4);margin-bottom:4px">${escHtml(d.category)} · ${escHtml(d.docRef)}</div>
            <div style="font-size:16px;font-weight:600;color:var(--txt);letter-spacing:-.01em">${escHtml(d.name)}</div>
          </div>
          <span class="badge ${exp.cls}">${exp.label}</span>
        </div>
      </div>`;

    const metaRow = `
      <div class="tbl-wrap" style="border-radius:0 0 8px 8px;margin-bottom:20px"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:.5px solid var(--bd);border-top:none;border-radius:0 0 8px 8px;overflow:hidden;min-width:300px">
        <div style="padding:10px 14px;border-right:.5px solid var(--bd)">
          <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">Vessel</div>
          <div style="font-size:12px;color:var(--txt)">${escHtml(vName)}</div>
        </div>
        <div style="padding:10px 14px;border-right:.5px solid var(--bd)">
          <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">Expiry</div>
          <div style="font-size:12px;color:${exp.color}">${d.expires ? _fmtDate(d.expires) : 'No expiry'}</div>
        </div>
        <div style="padding:10px 14px">
          <div style="font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt4);margin-bottom:3px">Updated</div>
          <div style="font-size:12px;color:var(--txt)">${d.uploadedAt || 'On file'}</div>
        </div>
      </div></div>`;

    let body = '';

    if (d.category === 'Registration') {
      body = `
        <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;padding:20px;font-size:12px;line-height:1.8;color:var(--txt2)">
          <div style="text-align:center;margin-bottom:20px;padding-bottom:16px;border-bottom:.5px solid var(--bd)">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.15em;color:var(--txt4);margin-bottom:8px">Certificate of Registry</div>
            <div style="font-size:18px;font-weight:700;color:var(--txt);letter-spacing:-.01em">${escHtml(vName)}</div>
            <div style="font-size:11px;color:var(--txt3);margin-top:2px">Flag State: ${flag} &nbsp;·&nbsp; Official Number: ${v?.mmsi || '319123456'}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px 24px">
            <div><span style="color:var(--txt3)">Vessel type</span><br><strong style="color:var(--txt)">${v?.type || 'Motor Yacht'}</strong></div>
            <div><span style="color:var(--txt3)">LOA</span><br><strong style="color:var(--txt)">${v?.loa || '48m'}</strong></div>
            <div><span style="color:var(--txt3)">Home port</span><br><strong style="color:var(--txt)">${v?.port || 'Gustavia, St. Barths'}</strong></div>
            <div><span style="color:var(--txt3)">MMSI</span><br><strong style="color:var(--txt);font-family:var(--mono)">${v?.mmsi || '319123456'}</strong></div>
            <div><span style="color:var(--txt3)">Flag state</span><br><strong style="color:var(--txt)">Cayman Islands (CYM)</strong></div>
            <div><span style="color:var(--txt3)">Gross tonnage</span><br><strong style="color:var(--txt)">499 GT</strong></div>
          </div>
          <div style="margin-top:20px;padding-top:16px;border-top:.5px solid var(--bd);font-size:10px;color:var(--txt4);text-align:center">
            Issued by the Cayman Islands Shipping Registry &nbsp;·&nbsp; Document ref: ${escHtml(d.docRef)}
          </div>
        </div>`;
    } else if (d.category === 'Insurance') {
      body = `
        <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;padding:20px;font-size:12px;line-height:1.8;color:var(--txt2)">
          <div style="margin-bottom:16px;padding-bottom:14px;border-bottom:.5px solid var(--bd)">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--txt4);margin-bottom:6px">Policy Summary</div>
            <div style="font-size:15px;font-weight:600;color:var(--txt)">${escHtml(d.name)}</div>
            <div style="font-size:11px;color:var(--txt3);margin-top:2px">${v?.insurer || 'Pantaenius Yacht Insurance'} &nbsp;·&nbsp; ${v?.policyNumber || 'PAN-2026-MY-004821'}</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 24px;margin-bottom:16px">
            <div><span style="color:var(--txt3)">Insured vessel</span><br><strong style="color:var(--txt)">${escHtml(vName)}</strong></div>
            <div><span style="color:var(--txt3)">Insured value</span><br><strong style="color:var(--txt)">${v?.insuredValue || '$12,500,000'}</strong></div>
            <div><span style="color:var(--txt3)">Policy period</span><br><strong style="color:var(--txt)">1 Jan 2026 – ${_fmtDate(v?.policyExpiry || '2026-12-31')}</strong></div>
            <div><span style="color:var(--txt3)">Coverage type</span><br><strong style="color:var(--txt)">Hull & Machinery, P&I</strong></div>
            <div><span style="color:var(--txt3)">Navigation area</span><br><strong style="color:var(--txt)">Worldwide</strong></div>
            <div><span style="color:var(--txt3)">Deductible</span><br><strong style="color:var(--txt)">$25,000</strong></div>
          </div>
          <div style="background:var(--bg3);border-radius:6px;padding:12px;font-size:11px;color:var(--txt3)">
            <strong style="color:var(--txt2);display:block;margin-bottom:4px">Coverage includes</strong>
            Hull &amp; Machinery · Total loss · Salvage · Collision liability · Personal accident · Medical expenses · Crew liability
          </div>
        </div>`;
    } else if (d.category === 'Manuals') {
      body = `
        <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;padding:20px;font-size:12px;line-height:1.8;color:var(--txt2)">
          <div style="margin-bottom:14px;padding-bottom:12px;border-bottom:.5px solid var(--bd)">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--txt4);margin-bottom:4px">Technical Manual</div>
            <div style="font-size:15px;font-weight:600;color:var(--txt)">${escHtml(d.name)}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px">
            ${['Introduction & safety warnings','Technical specifications','Installation & commissioning','Operating procedures','Routine maintenance schedule','Fault diagnosis & troubleshooting','Spare parts list','Warranty information'].map((s, i) => `
              <div style="display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:6px;background:var(--bg3);cursor:pointer">
                <span style="font-size:10px;font-weight:600;color:var(--txt4);font-family:var(--mono);width:28px;flex-shrink:0">${String(i+1).padStart(2,'0')}</span>
                <span style="flex:1;color:var(--txt2)">${s}</span>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--txt4)" stroke-width="1.5" stroke-linecap="round"><path d="M6 3l5 5-5 5"/></svg>
              </div>`).join('')}
          </div>
          <div style="margin-top:14px;font-size:10px;color:var(--txt4);text-align:center">Ref: ${escHtml(d.docRef)} &nbsp;·&nbsp; ${d.notes || 'Technical documentation'}</div>
        </div>`;
    } else {
      body = `
        <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:8px;padding:20px;font-size:12px;line-height:1.8;color:var(--txt2)">
          <div style="margin-bottom:14px;padding-bottom:12px;border-bottom:.5px solid var(--bd)">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--txt4);margin-bottom:4px">${escHtml(d.category)}</div>
            <div style="font-size:15px;font-weight:600;color:var(--txt)">${escHtml(d.name)}</div>
          </div>
          ${d.notes ? `<p style="margin-bottom:14px;color:var(--txt2)">${escHtml(d.notes)}</p>` : ''}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px 20px">
            <div><span style="color:var(--txt3)">Reference</span><br><span style="font-family:var(--mono);font-size:11px;color:var(--txt)">${escHtml(d.docRef)}</span></div>
            <div><span style="color:var(--txt3)">Category</span><br><strong style="color:var(--txt)">${escHtml(d.category)}</strong></div>
            <div><span style="color:var(--txt3)">Vessel</span><br><strong style="color:var(--txt)">${escHtml(vName)}</strong></div>
            <div><span style="color:var(--txt3)">Status</span><br><span class="badge ${exp.cls}" style="font-size:10px">${exp.label}</span></div>
          </div>
        </div>`;
    }

    return header + metaRow + body;
  }

  function view(id) {
    const d = (FM.vesselDocs || []).find(x => x.id === id);
    if (!d) return;
    const titleEl = document.getElementById('panel-title');
    if (titleEl) titleEl.textContent = d.name;
    openPanel(`
      ${_docPreviewHTML(d)}
      ${d.notes && d.category !== 'Manuals' ? `<div style="margin-top:14px;padding:12px 14px;background:var(--bg3);border-radius:8px;font-size:12px;color:var(--txt3)">${escHtml(d.notes)}</div>` : ''}
      <div style="display:flex;gap:8px;margin-top:20px">
        <button class="btn btn-ghost btn-sm" onclick="Documents.openEdit('${id}');closePanel()">Edit</button>
      </div>
    `);
  }

  function openAdd() { _showModal(); }
  function openEdit(id) {
    const d = (FM.vesselDocs || []).find(x => x.id === id);
    if (d) _showModal(d);
  }

  function _showModal(doc) {
    const editing = !!doc;
    openModal(`
      <div style="display:flex;flex-direction:column;gap:14px">
        <div>
          <label class="inp-lbl">Document name</label>
          <input class="inp" id="doc-name" value="${doc ? escHtml(doc.name) : ''}" placeholder="e.g. Certificate of Registry">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label class="inp-lbl">Category</label>
            <select class="inp" id="doc-cat">
              ${['Registration','Insurance','Contracts','Manuals'].map(c =>
                `<option value="${c}" ${doc && doc.category===c ? 'selected':''}>${c}</option>`
              ).join('')}
            </select>
          </div>
          <div>
            <label class="inp-lbl">Document reference</label>
            <input class="inp" id="doc-ref" value="${doc ? escHtml(doc.docRef) : ''}" placeholder="e.g. COR-2024-001">
          </div>
        </div>
        <div>
          <label class="inp-lbl">Expiry date <span style="color:var(--txt3);font-weight:400">(leave blank if no expiry)</span></label>
          <input class="inp" id="doc-exp" type="date" value="${doc && doc.expires ? doc.expires : ''}">
        </div>
        <div>
          <label class="inp-lbl">Notes</label>
          <input class="inp" id="doc-notes" value="${doc ? escHtml(doc.notes) : ''}" placeholder="Optional notes about this document">
        </div>
        <div style="background:var(--bg3);border-radius:8px;padding:12px;font-size:11px;color:var(--txt3);text-align:center">
          📎 File upload coming soon. For now, enter the document details to track it.
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          ${editing ? `<button class="btn btn-ghost btn-sm" onclick="Documents.del('${doc.id}')">Delete</button>` : ''}
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Documents.save('${doc ? doc.id : ''}')">
            ${editing ? 'Save changes' : 'Add document'}
          </button>
        </div>
      </div>
    `, editing ? 'Edit document' : 'Add document');
  }

  function save(id) {
    const name  = document.getElementById('doc-name')?.value.trim();
    const cat   = document.getElementById('doc-cat')?.value;
    const ref   = document.getElementById('doc-ref')?.value.trim();
    const exp   = document.getElementById('doc-exp')?.value || null;
    const notes = document.getElementById('doc-notes')?.value.trim();
    if (!name) { showToast('Document name is required', 'error'); return; }
    if (!FM.vesselDocs) FM.vesselDocs = [];
    if (id) {
      const d = FM.vesselDocs.find(x => x.id === id);
      if (d) Object.assign(d, { name, category:cat, docRef:ref, expires:exp, notes });
    } else {
      const v = _vessel();
      FM.vesselDocs.push({ id:'vd-' + Date.now(), vessel: v ? v.id : 'v1', name, category:cat, docRef:ref||('DOC-'+Date.now()), expires:exp, uploadedAt:'2026-05-06', notes });
    }
    closeModal();
    render();
    showToast(id ? 'Document updated' : 'Document added');
  }

  function del(id) {
    FM.vesselDocs = (FM.vesselDocs || []).filter(d => d.id !== id);
    closeModal();
    render();
    showToast('Document removed');
  }

  return { render, setTab, view, openAdd, openEdit, save, del };
})();

window.Documents = Documents;
