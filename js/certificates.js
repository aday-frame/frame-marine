/* ── CERTIFICATES MODULE ── */
const Certs = (() => {
  let _tab = 'vessel';

  const today = new Date();

  function daysUntil(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return Math.ceil((d - today) / 86400000);
  }

  function certStatus(expires) {
    const d = daysUntil(expires);
    if (d === null) return { label: 'No expiry', cls: 'b-done', color: 'var(--txt3)' };
    if (d < 0)   return { label: 'Expired',    cls: 'b-high',     color: 'var(--red)' };
    if (d <= 30)  return { label: d + 'd',      cls: 'b-high',     color: 'var(--red)' };
    if (d <= 60)  return { label: d + 'd',      cls: 'b-medium',   color: 'var(--or)' };
    if (d <= 90)  return { label: d + 'd',      cls: 'b-hold',     color: 'var(--yel)' };
    return { label: 'Valid',   cls: 'b-done',   color: 'var(--grn)' };
  }

  function fmtDate(s) {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + d + ', ' + y;
  }

  /* ── expiring count for dashboard badge ── */
  function expiringCount() {
    const v = FM.currentVesselId;
    const vc = (FM.vesselCerts || []).filter(c => c.vessel === v);
    const cc = (FM.crewCerts || []).filter(c => {
      const cr = FM.getCrew(c.crewId);
      return cr && cr.vessel === v;
    });
    return [...vc, ...cc].filter(c => {
      const d = daysUntil(c.expires);
      return d !== null && d <= 90;
    }).length;
  }
  window.certsExpiringCount = expiringCount;

  /* ── render ── */
  function render() {
    const wrap = document.getElementById('page-certificates');
    if (!wrap) return;

    const vessel = FM.currentVessel();
    if (!vessel) { wrap.innerHTML = '<div style="padding:24px;color:var(--txt3)">No vessel selected.</div>'; return; }

    const vc = (FM.vesselCerts || []).filter(c => c.vessel === vessel.id);
    const cc = (FM.crewCerts || []).filter(c => {
      const cr = FM.getCrew(c.crewId);
      return cr && cr.vessel === vessel.id;
    });

    const alertCount = [...vc, ...cc].filter(c => {
      const d = daysUntil(c.expires);
      return d !== null && d <= 90;
    }).length;

    wrap.innerHTML = `
      <div style="max-width:1100px;padding:18px 20px 40px">

        <!-- Summary bar -->
        ${alertCount ? `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(248,113,113,.08);border:.5px solid rgba(248,113,113,.25);border-radius:8px;margin-bottom:20px">
          <svg viewBox="0 0 16 16" fill="var(--red)" style="width:14px;height:14px;flex-shrink:0"><path d="M8 1a.5.5 0 01.443.27l6.5 12A.5.5 0 0114.5 14h-13a.5.5 0 01-.443-.73l6.5-12A.5.5 0 018 1zm0 4a.5.5 0 00-.5.5v3a.5.5 0 001 0v-3A.5.5 0 008 5zm0 6.5a.5.5 0 100 1 .5.5 0 000-1z"/></svg>
          <span style="font-size:12px;color:var(--red);font-weight:500">${alertCount} certificate${alertCount>1?'s':''} expiring within 90 days — review required</span>
        </div>` : ''}

        <!-- Tabs -->
        <div style="display:flex;gap:4px;margin-bottom:20px;border-bottom:.5px solid var(--bd);padding-bottom:0">
          <button onclick="Certs.tab('vessel')"  id="ct-vessel" class="tab-btn ${_tab==='vessel'?'tab-btn-active':''}">Vessel (${vc.length})</button>
          <button onclick="Certs.tab('crew')"    id="ct-crew"   class="tab-btn ${_tab==='crew'?'tab-btn-active':''}">Crew (${cc.length})</button>
        </div>

        <div id="certs-content"></div>
      </div>

      ${_modalHtml()}
    `;

    _renderContent();
    updateSidebarBadge();
  }

  function _renderContent() {
    const el = document.getElementById('certs-content');
    if (!el) return;
    if (_tab === 'vessel') el.innerHTML = _vesselTab();
    else el.innerHTML = _crewTab();
  }

  function _vesselTab() {
    const vessel = FM.currentVessel();
    if (!vessel) return '';
    const certs = (FM.vesselCerts || []).filter(c => c.vessel === vessel.id);
    const cats = [...new Set(certs.map(c => c.category))];

    let html = `<div style="display:flex;justify-content:flex-end;margin-bottom:14px">
      <button class="btn btn-primary btn-sm" onclick="Certs.openAdd('vessel')">+ Add certificate</button>
    </div>`;

    cats.forEach(cat => {
      const catCerts = certs.filter(c => c.category === cat);
      html += `<div style="margin-bottom:20px">
        <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:8px">${escHtml(cat)}</div>
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr>
              <th>Certificate</th><th>Issuer</th><th>Doc ref</th><th>Issued</th><th>Expires</th><th>Status</th><th></th>
            </tr></thead>
            <tbody>
              ${catCerts.map(c => {
                const s = certStatus(c.expires);
                return `<tr>
                  <td style="font-weight:500;color:var(--txt)">${escHtml(c.name)}</td>
                  <td style="color:var(--txt2)">${escHtml(c.issuer)}</td>
                  <td style="font-family:var(--mono);font-size:10px;color:var(--txt3)">${escHtml(c.docRef||'—')}</td>
                  <td style="color:var(--txt3)">${fmtDate(c.issued)}</td>
                  <td style="color:${s.color};font-weight:${c.expires?'500':'400'}">${fmtDate(c.expires)}</td>
                  <td><span class="badge ${s.cls}" style="font-size:9px">${s.label}</span></td>
                  <td><button class="btn btn-ghost btn-xs" onclick="Certs.del('${c.id}','vessel')">Remove</button></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    });

    if (!certs.length) html += `<div style="color:var(--txt3);font-size:13px;padding:20px 0">No vessel certificates yet. Add the first one above.</div>`;
    return html;
  }

  function _crewTab() {
    const vessel = FM.currentVessel();
    if (!vessel) return '';
    const crew = (FM.crew || []).filter(c => c.vessel === vessel.id);

    let html = `<div style="display:flex;justify-content:flex-end;margin-bottom:14px">
      <button class="btn btn-primary btn-sm" onclick="Certs.openAdd('crew')">+ Add certificate</button>
    </div>`;

    crew.forEach(cr => {
      const certs = (FM.crewCerts || []).filter(c => c.crewId === cr.id);
      const alertCerts = certs.filter(c => { const d = daysUntil(c.expires); return d !== null && d <= 90; });

      html += `<div style="margin-bottom:24px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="width:28px;height:28px;border-radius:50%;background:${cr.color}22;color:${cr.color};font-size:10px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0">${cr.initials}</div>
          <div>
            <div style="font-size:13px;font-weight:500;color:var(--txt)">${escHtml(cr.name)}</div>
            <div style="font-size:10px;color:var(--txt3)">${escHtml(cr.role)}</div>
          </div>
          ${alertCerts.length ? `<span class="badge b-high" style="font-size:9px;margin-left:4px">${alertCerts.length} expiring</span>` : ''}
        </div>
        ${certs.length ? `<div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>Certificate</th><th>Category</th><th>Issuer</th><th>Doc ref</th><th>Expires</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${certs.map(c => {
                const s = certStatus(c.expires);
                return `<tr>
                  <td style="font-weight:500;color:var(--txt)">${escHtml(c.name)}</td>
                  <td style="color:var(--txt2)">${escHtml(c.category)}</td>
                  <td style="color:var(--txt3)">${escHtml(c.issuer)}</td>
                  <td style="font-family:var(--mono);font-size:10px;color:var(--txt3)">${escHtml(c.docRef||'—')}</td>
                  <td style="color:${s.color};font-weight:${c.expires?'500':'400'}">${fmtDate(c.expires)}</td>
                  <td><span class="badge ${s.cls}" style="font-size:9px">${s.label}</span></td>
                  <td><button class="btn btn-ghost btn-xs" onclick="Certs.del('${c.id}','crew')">Remove</button></td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>` : `<div style="font-size:12px;color:var(--txt3);padding:6px 0">No certificates on file.</div>`}
      </div>`;
    });

    return html;
  }

  function _modalHtml() {
    return `<div id="cert-modal" style="display:none;position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center">
      <div style="background:var(--bg2);border:.5px solid var(--bd);border-radius:12px;width:480px;max-width:92vw;padding:24px;max-height:90vh;overflow-y:auto">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <div style="font-size:14px;font-weight:600;color:var(--txt)" id="cert-modal-title">Add certificate</div>
          <button onclick="Certs.closeModal()" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:18px;line-height:1">×</button>
        </div>
        <div id="cert-modal-body"></div>
      </div>
    </div>`;
  }

  function openAdd(type) {
    const vessel = FM.currentVessel();
    const modal = document.getElementById('cert-modal');
    if (!modal) return;

    const crewOptions = type === 'crew'
      ? (FM.crew || []).filter(c => c.vessel === (vessel && vessel.id))
          .map(c => `<option value="${c.id}">${escHtml(c.name)} — ${escHtml(c.role)}</option>`).join('')
      : '';

    const vesselCategories = ['Registry','ISM','SOLAS','Flag State','Insurance','Class','MARPOL','Other'];
    const crewCategories   = ['STCW','Medical','Flag','GMDSS','Other'];
    const cats = type === 'vessel' ? vesselCategories : crewCategories;

    document.getElementById('cert-modal-title').textContent = type === 'vessel' ? 'Add vessel certificate' : 'Add crew certificate';
    document.getElementById('cert-modal-body').innerHTML = `
      ${type === 'crew' ? `<div style="margin-bottom:14px">
        <label class="inp-lbl">Crew member</label>
        <select class="inp" id="cm-crew">${crewOptions}</select>
      </div>` : ''}
      <div style="margin-bottom:14px">
        <label class="inp-lbl">Certificate name</label>
        <input class="inp" id="cm-name" placeholder="e.g. Safety Equipment Certificate">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div>
          <label class="inp-lbl">Category</label>
          <select class="inp" id="cm-cat">${cats.map(c=>`<option>${c}</option>`).join('')}</select>
        </div>
        <div>
          <label class="inp-lbl">Doc / cert reference</label>
          <input class="inp" id="cm-ref" placeholder="e.g. BV-2024-0001">
        </div>
      </div>
      <div>
        <label class="inp-lbl">Issuing authority</label>
        <input class="inp" id="cm-issuer" placeholder="e.g. Bureau Veritas">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:14px 0">
        <div>
          <label class="inp-lbl">Issue date</label>
          <input class="inp" id="cm-issued" type="date">
        </div>
        <div>
          <label class="inp-lbl">Expiry date <span style="color:var(--txt3)">(leave blank if none)</span></label>
          <input class="inp" id="cm-expires" type="date">
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
        <button class="btn btn-ghost btn-sm" onclick="Certs.closeModal()">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="Certs.save('${type}')">Save certificate</button>
      </div>
    `;

    modal.style.display = 'flex';
  }

  function closeModal() {
    const modal = document.getElementById('cert-modal');
    if (modal) modal.style.display = 'none';
  }

  function save(type) {
    const name    = document.getElementById('cm-name')?.value.trim();
    const cat     = document.getElementById('cm-cat')?.value;
    const ref     = document.getElementById('cm-ref')?.value.trim();
    const issuer  = document.getElementById('cm-issuer')?.value.trim();
    const issued  = document.getElementById('cm-issued')?.value;
    const expires = document.getElementById('cm-expires')?.value || null;

    if (!name) { alert('Certificate name is required.'); return; }

    const vessel = FM.currentVessel();
    if (type === 'vessel') {
      const id = 'vc' + Date.now();
      FM.vesselCerts.push({ id, vessel: vessel.id, name, category: cat, issuer, issued, expires, docRef: ref });
    } else {
      const crewId = document.getElementById('cm-crew')?.value;
      const id = 'cc' + Date.now();
      FM.crewCerts.push({ id, crewId, name, category: cat, issuer, issued, expires, docRef: ref });
    }

    closeModal();
    render();
  }

  function del(id, type) {
    if (!confirm('Remove this certificate?')) return;
    if (type === 'vessel') FM.vesselCerts = FM.vesselCerts.filter(c => c.id !== id);
    else FM.crewCerts = FM.crewCerts.filter(c => c.id !== id);
    render();
  }

  function tab(t) {
    _tab = t;
    render();
  }

  function updateSidebarBadge() {
    const n = expiringCount();
    const el = document.getElementById('sb-cert-count');
    if (el) { el.textContent = n; el.style.display = n ? '' : 'none'; }
  }

  return { render, tab, openAdd, closeModal, save, del, updateSidebarBadge, expiringCount };
})();

window.Certs = Certs;
