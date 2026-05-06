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
    if (d === null) return { label:'No expiry', color:'var(--txt3)' };
    if (d < 0)      return { label:'Expired',   color:'var(--red)' };
    if (d <= 30)    return { label:d+'d left',   color:'var(--red)' };
    if (d <= 90)    return { label:d+'d left',   color:'var(--yel)' };
    return               { label:'Valid',        color:'var(--grn)' };
  }
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
      <div style="max-width:1100px;padding:18px 20px 48px">

        <!-- Expiry alert -->
        ${expiring.length ? `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(251,191,36,.08);border:.5px solid rgba(251,191,36,.3);border-radius:8px;margin-bottom:20px">
          <svg viewBox="0 0 16 16" fill="var(--yel)" style="width:14px;height:14px;flex-shrink:0"><path d="M8 1a.5.5 0 01.443.27l6.5 12A.5.5 0 0114.5 14h-13a.5.5 0 01-.443-.73l6.5-12A.5.5 0 018 1zm0 4a.5.5 0 00-.5.5v3a.5.5 0 001 0v-3A.5.5 0 008 5zm0 6.5a.5.5 0 100 1 .5.5 0 000-1z"/></svg>
          <span style="font-size:12px;color:var(--yel);font-weight:500">${expiring.length} document${expiring.length > 1 ? 's' : ''} expiring within 90 days — review required</span>
        </div>` : ''}

        <!-- Tabs -->
        <div style="display:flex;gap:4px;margin-bottom:20px;border-bottom:.5px solid var(--bd)">
          ${CATS.map(c => `
            <button onclick="Documents.setTab('${c}')" class="tab-btn ${_tab===c ? 'tab-btn-active' : ''}">
              ${c}${c !== 'All' ? ` (${docs.filter(d=>d.category===c).length})` : ''}
            </button>`).join('')}
        </div>

        <!-- Add button -->
        <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
          <button class="btn btn-primary btn-sm" onclick="Documents.openAdd()">+ Add document</button>
        </div>

        <!-- Documents grid -->
        <div style="display:flex;flex-direction:column;gap:8px">
          ${visible.length ? visible.map(d => {
            const exp    = _expStatus(d.expires);
            const catCol = CAT_COLORS[d.category] || '#9CA3AF';
            return `
            <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:14px">
              <!-- Icon -->
              <div style="width:38px;height:38px;border-radius:8px;background:${catCol}18;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <svg viewBox="0 0 16 16" fill="${catCol}" style="width:18px;height:18px">
                  <path d="M4 1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4.5L9.5 1H4zm5 0v3.5H13M5 7h6M5 9h6M5 11h4"/>
                </svg>
              </div>
              <!-- Info -->
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:500;color:var(--txt);margin-bottom:3px">${escHtml(d.name)}</div>
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;background:${catCol}18;color:${catCol}">${escHtml(d.category)}</span>
                  <span style="font-size:10px;color:var(--txt3)">${escHtml(d.docRef)}</span>
                  ${d.notes ? `<span style="font-size:10px;color:var(--txt3)">· ${escHtml(d.notes)}</span>` : ''}
                </div>
              </div>
              <!-- Expiry -->
              <div style="text-align:right;flex-shrink:0;min-width:90px">
                <div style="font-size:11px;font-weight:600;color:${exp.color}">${exp.label}</div>
                ${d.expires ? `<div style="font-size:10px;color:var(--txt3)">${_fmtDate(d.expires)}</div>` : ''}
              </div>
              <!-- Actions -->
              <div style="display:flex;gap:6px;flex-shrink:0">
                <button class="btn btn-ghost btn-xs" onclick="Documents.openEdit('${d.id}')">Edit</button>
                <button class="btn btn-ghost btn-xs" onclick="Documents.view('${d.id}')">View ↗</button>
              </div>
            </div>`;
          }).join('') : `
          <div style="text-align:center;padding:40px;color:var(--txt3);font-size:12px;background:var(--bg2);border:.5px solid var(--bd);border-radius:10px">
            No ${_tab !== 'All' ? _tab.toLowerCase() + ' ' : ''}documents on file.
            <button class="btn btn-ghost btn-xs" style="margin-left:8px" onclick="Documents.openAdd()">Add document →</button>
          </div>`}
        </div>

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
