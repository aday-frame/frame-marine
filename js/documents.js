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
    return `<tr>
      <td style="font-weight:500;color:var(--txt)">${escHtml(d.name)}${d.notes ? `<div style="font-size:10px;color:var(--txt3);font-weight:400;margin-top:1px">${escHtml(d.notes)}</div>` : ''}</td>
      <td style="font-family:var(--mono);font-size:10px;color:var(--txt3)">${escHtml(d.docRef || '—')}</td>
      <td style="color:var(--txt3)">${d.uploadedAt || '—'}</td>
      <td style="color:${exp.color};font-weight:${d.expires ? '500' : '400'}">${_fmtDate(d.expires)}</td>
      <td><span class="badge ${exp.cls}" style="font-size:9px">${exp.label}</span></td>
      <td><div style="display:flex;gap:6px">
        <button class="btn btn-ghost btn-xs" onclick="Documents.openEdit('${d.id}')">Edit</button>
        <button class="btn btn-ghost btn-xs" onclick="Documents.view('${d.id}')">View ↗</button>
      </div></td>
    </tr>`;
  }

  const _THEAD = `<thead><tr><th>Document</th><th>Doc ref</th><th>Uploaded</th><th>Expires</th><th>Status</th><th></th></tr></thead>`;
  const _GRP   = n => `<tr><td colspan="6" style="padding:10px 12px 6px;font-size:9px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.09em;background:var(--bg);border-bottom:.5px solid var(--bd)">${escHtml(n)}</td></tr>`;
  function _fmtDate(s) {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + d + ', ' + y;
  }

  function render() {
    const wrap = document.getElementById('page-documents');
    if (!wrap) return;
    const docs    = _docs();
    const visible = _tab === 'All' ? docs : docs.filter(d => d.category === _tab);
    const expiring = docs.filter(d => { const dd = _daysUntil(d.expires); return dd !== null && dd <= 90; });

    wrap.innerHTML = `
      <div style="padding:18px 20px 48px">

        <!-- Expiry alert -->
        ${expiring.length ? `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(251,191,36,.08);border:.5px solid rgba(251,191,36,.3);border-radius:8px;margin-bottom:20px">
          <svg viewBox="0 0 16 16" fill="var(--yel)" style="width:14px;height:14px;flex-shrink:0"><path d="M8 1a.5.5 0 01.443.27l6.5 12A.5.5 0 0114.5 14h-13a.5.5 0 01-.443-.73l6.5-12A.5.5 0 018 1zm0 4a.5.5 0 00-.5.5v3a.5.5 0 001 0v-3A.5.5 0 008 5zm0 6.5a.5.5 0 100 1 .5.5 0 000-1z"/></svg>
          <span style="font-size:12px;color:var(--yel);font-weight:500">${expiring.length} document${expiring.length > 1 ? 's' : ''} expiring within 90 days — review required</span>
        </div>` : ''}

        <!-- Tabs -->
        <div style="display:flex;gap:4px;margin-bottom:20px;border-bottom:.5px solid var(--bd);padding-bottom:0">
          ${CATS.map(c => `
            <button onclick="Documents.setTab('${c}')" class="tab-btn ${_tab===c ? 'tab-btn-active' : ''}">
              ${c}${c !== 'All' ? ` (${docs.filter(d=>d.category===c).length})` : ''}
            </button>`).join('')}
        </div>

        <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
          <button class="btn btn-primary btn-sm" onclick="Documents.openAdd()">+ Add document</button>
        </div>

        ${(() => {
          if (!visible.length) return `<div style="color:var(--txt3);font-size:13px;padding:20px 0">No ${_tab !== 'All' ? _tab.toLowerCase() + ' ' : ''}documents on file. <button class="btn btn-ghost btn-xs" style="margin-left:8px" onclick="Documents.openAdd()">Add document →</button></div>`;
          const cats = _tab === 'All' ? [...new Set(visible.map(d => d.category))] : null;
          const tbody = cats
            ? cats.map(cat => _GRP(cat) + visible.filter(d => d.category === cat).map(_docRow).join('')).join('')
            : visible.map(_docRow).join('');
          return `<div class="tbl-wrap"><table class="tbl">${_THEAD}<tbody>${tbody}</tbody></table></div>`;
        })()}

      </div>
    `;
  }

  function setTab(t) { _tab = t; render(); }

  function view(id) {
    const d = (FM.vesselDocs || []).find(x => x.id === id);
    if (!d) return;
    openModal(`
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><div style="font-size:10px;color:var(--txt3);margin-bottom:2px">Document ref</div><div style="font-size:12px;font-family:var(--mono)">${escHtml(d.docRef)}</div></div>
          <div><div style="font-size:10px;color:var(--txt3);margin-bottom:2px">Category</div><div style="font-size:12px">${escHtml(d.category)}</div></div>
          <div><div style="font-size:10px;color:var(--txt3);margin-bottom:2px">Uploaded</div><div style="font-size:12px">${d.uploadedAt ? d.uploadedAt : '—'}</div></div>
          <div><div style="font-size:10px;color:var(--txt3);margin-bottom:2px">Expires</div><div style="font-size:12px">${d.expires ? d.expires : 'No expiry'}</div></div>
        </div>
        ${d.notes ? `<div><div style="font-size:10px;color:var(--txt3);margin-bottom:2px">Notes</div><div style="font-size:12px;color:var(--txt2)">${escHtml(d.notes)}</div></div>` : ''}
        <div style="background:var(--bg3);border-radius:8px;padding:16px;text-align:center;font-size:11px;color:var(--txt3)">
          📄 ${escHtml(d.docRef)}.pdf<br>
          <button class="btn btn-ghost btn-sm" style="margin-top:10px" onclick="showToast('File download coming soon')">Download PDF</button>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="closeModal()" style="align-self:flex-end">Close</button>
      </div>
    `, escHtml(d.name));
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
          📎 File upload coming soon — for now, enter the document details to track it
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
