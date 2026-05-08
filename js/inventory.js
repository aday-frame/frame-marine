/* ── INVENTORY MODULE ── */
const Inventory = (() => {
  const CATS = ['All','Engineering','Safety','Provisions','Deck'];
  const CAT_COLORS = { Engineering:'#22D3EE', Safety:'#F87171', Provisions:'#4ADE80', Deck:'#FACC15' };
  let _tab = 'All';
  const _thumb = i => i.photo
    ? `<img src="${i.photo}" alt="" style="width:36px;height:36px;border-radius:6px;object-fit:cover;display:block">`
    : `<div style="width:36px;height:36px;border-radius:6px;background:${CAT_COLORS[i.category]||'#555'}22;display:flex;align-items:center;justify-content:center;font-size:16px">${i.icon||'📦'}</div>`;

  function _vessel() { return FM.currentVessel(); }
  function _items() {
    const v = _vessel();
    return (FM.inventory || []).filter(i => !v || i.vessel === v.id);
  }
  function _fmt(n) { return n.toLocaleString('en-US', { style:'currency', currency:'USD', minimumFractionDigits:0, maximumFractionDigits:0 }); }

  function render() {
    const wrap = document.getElementById('page-inventory');
    if (!wrap) return;
    const items = _items();
    const low   = items.filter(i => i.qty <= i.reorderAt && i.qty > 0);
    const out   = items.filter(i => i.qty === 0);
    const totalVal = items.reduce((s, i) => s + (i.qty * (i.cost || 0)), 0);
    const visible = _tab === 'All' ? items : items.filter(i => i.category === _tab);

    // Populate shared stats bar
    const invStatsEl = document.getElementById('inv-stats');
    if (invStatsEl) {
      invStatsEl.style.gridTemplateColumns = 'repeat(4,1fr)';
      invStatsEl.innerHTML = `
        <div class="wo-stat"><div class="wo-stat-num">${items.length}</div><div class="wo-stat-lbl">Total items</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:var(--yel)">${low.length}</div><div class="wo-stat-lbl">Low stock</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="color:var(--red)">${out.length}</div><div class="wo-stat-lbl">Out of stock</div></div>
        <div class="wo-stat"><div class="wo-stat-num" style="font-size:18px">${_fmt(totalVal)}</div><div class="wo-stat-lbl">Total value</div></div>`;
    }
    // Sync filter pill
    document.querySelectorAll('#inv-filters .fp').forEach(p => p.classList.toggle('on', p.dataset.inv === _tab));

    wrap.innerHTML = `
      <div style="padding:18px 20px 48px">

        <!-- Low stock alert -->
        ${low.length || out.length ? `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(251,191,36,.08);border:.5px solid rgba(251,191,36,.3);border-radius:8px;margin-bottom:16px">
          <svg viewBox="0 0 16 16" fill="var(--yel)" style="width:14px;height:14px;flex-shrink:0"><path d="M8 1a.5.5 0 01.443.27l6.5 12A.5.5 0 0114.5 14h-13a.5.5 0 01-.443-.73l6.5-12A.5.5 0 018 1zm0 4a.5.5 0 00-.5.5v3a.5.5 0 001 0v-3A.5.5 0 008 5zm0 6.5a.5.5 0 100 1 .5.5 0 000-1z"/></svg>
          <span style="font-size:12px;color:var(--yel);font-weight:500">${out.length ? out.length + ' out of stock · ' : ''}${low.length} low stock</span>
        </div>` : ''}

        <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
          <button class="btn btn-primary btn-sm" onclick="Inventory.openAdd()">+ Add item</button>
        </div>

        ${(() => {
          const GRP_HDR = n => `<tr><td colspan="7" style="padding:10px 12px 6px;font-size:9px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.09em;background:var(--bg);border-bottom:.5px solid var(--bd)">${escHtml(n)}</td></tr>`;
          const THEAD   = `<thead><tr><th style="width:44px"></th><th>Item</th><th>Quantity</th><th>Reorder at</th><th>Location</th><th>Unit cost</th><th></th></tr></thead>`;
          const EMPTY   = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--txt3);font-size:12px">No ${_tab !== 'All' ? _tab.toLowerCase() + ' ' : ''}items on record. <button class="btn btn-ghost btn-xs" style="margin-left:8px" onclick="Inventory.openAdd()">Add item →</button></td></tr>`;

          function invRow(i) {
            const isLow = i.qty <= i.reorderAt;
            const isOut = i.qty === 0;
            const col   = isOut ? 'var(--red)' : isLow ? 'var(--yel)' : 'var(--grn)';
            return `<tr onclick="Inventory.openDetail('${i.id}')" style="cursor:pointer">
              <td onclick="event.stopPropagation()" style="padding:8px 6px 8px 12px">${_thumb(i)}</td>
              <td style="font-weight:500;color:var(--txt)">${escHtml(i.name)}
                ${isOut ? `<div style="font-size:10px;color:var(--red);font-weight:600">Out of stock</div>`
                        : isLow ? `<div style="font-size:10px;color:var(--yel);font-weight:600">Low stock</div>` : ''}
              </td>
              <td><span style="font-size:14px;font-weight:600;color:${col}">${i.qty}</span> <span style="font-size:11px;color:var(--txt3)">${escHtml(i.unit)}</span></td>
              <td style="color:var(--txt3)">${i.reorderAt} ${escHtml(i.unit)}</td>
              <td style="color:var(--txt2)">${escHtml(i.location)}</td>
              <td style="color:var(--txt2)">${_fmt(i.cost)}</td>
              <td onclick="event.stopPropagation()"><div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-xs" onclick="Inventory.use('${i.id}')">Use</button>
                <button class="btn btn-ghost btn-xs" onclick="Inventory.openEdit('${i.id}')">Edit</button>
              </div></td>
            </tr>`;
          }

          if (!visible.length) return `<div style="color:var(--txt3);font-size:13px;padding:20px 0">No ${_tab !== 'All' ? _tab.toLowerCase() + ' ' : ''}items on record. <button class="btn btn-ghost btn-xs" style="margin-left:8px" onclick="Inventory.openAdd()">Add item →</button></div>`;

          const cats = _tab === 'All' ? [...new Set(items.map(i => i.category))] : null;
          const tbody = cats
            ? cats.map(cat => GRP_HDR(cat) + items.filter(i => i.category === cat).map(invRow).join('')).join('')
            : visible.map(invRow).join('');

          return `<div class="tbl-wrap"><table class="tbl">${THEAD}<tbody>${tbody || EMPTY}</tbody></table></div>`;
        })()}
      </div>
    `;
  }

  function setTab(t) { _tab = t; render(); }

  function use(id) {
    const item = (FM.inventory || []).find(i => i.id === id);
    if (!item) return;
    if (item.qty <= 0) { showToast('Already at zero', 'error'); return; }
    item.qty--;
    render();
    showToast(`Used 1 × ${item.name}`);
  }

  function openAdd() { _showModal(); }
  function openEdit(id) {
    const item = (FM.inventory || []).find(i => i.id === id);
    if (item) _showModal(item);
  }

  function openDetail(id) {
    const i = (FM.inventory || []).find(x => x.id === id);
    if (!i) return;
    const isLow = i.qty <= i.reorderAt;
    const isOut = i.qty === 0;
    const col   = isOut ? 'var(--red)' : isLow ? 'var(--yel)' : 'var(--grn)';
    document.getElementById('panel-title').textContent = i.name;
    openPanel(`
      ${i.photo ? `<div style="height:200px;overflow:hidden;margin:-18px -18px 18px;border-bottom:.5px solid var(--bd)"><img src="${i.photo}" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></div>` : ''}

      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
        ${_thumb(i)}
        <div>
          <div style="font-size:17px;font-weight:600;color:var(--txt)">${escHtml(i.name)}</div>
          <div style="font-size:12px;color:var(--txt3);margin-top:2px">${i.category} · ${escHtml(i.location)}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:20px">
        <div style="background:var(--bg3);border-radius:8px;padding:12px">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:4px">On hand</div>
          <div style="font-size:22px;font-weight:700;color:${col}">${i.qty} <span style="font-size:13px;font-weight:400;color:var(--txt3)">${escHtml(i.unit)}</span></div>
          ${isOut ? `<div style="font-size:10px;color:var(--red);font-weight:600;margin-top:2px">Out of stock</div>` : isLow ? `<div style="font-size:10px;color:var(--yel);font-weight:600;margin-top:2px">Low — reorder soon</div>` : ''}
        </div>
        <div style="background:var(--bg3);border-radius:8px;padding:12px">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:4px">Reorder at</div>
          <div style="font-size:22px;font-weight:700;color:var(--txt)">${i.reorderAt} <span style="font-size:13px;font-weight:400;color:var(--txt3)">${escHtml(i.unit)}</span></div>
        </div>
        <div style="background:var(--bg3);border-radius:8px;padding:12px">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:4px">Unit cost</div>
          <div style="font-size:16px;font-weight:600;color:var(--txt)">${_fmt(i.cost)}</div>
        </div>
        <div style="background:var(--bg3);border-radius:8px;padding:12px">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--txt3);margin-bottom:4px">Total value</div>
          <div style="font-size:16px;font-weight:600;color:var(--txt)">${_fmt(i.qty * i.cost)}</div>
        </div>
      </div>

      <div style="display:flex;gap:8px;margin-bottom:20px">
        <button class="btn btn-primary btn-sm" onclick="Inventory.use('${i.id}');closePanel();Inventory.render()">Use 1</button>
        <button class="btn btn-ghost btn-sm" onclick="closePanel();Inventory.openEdit('${i.id}')">Edit item</button>
      </div>
    `);
  }

  function _showModal(item) {
    const editing = !!item;
    openModal(`
      <div style="display:flex;flex-direction:column;gap:14px">
        <div>
          <label class="inp-lbl">Item name</label>
          <input class="inp" id="inv-name" value="${item ? escHtml(item.name) : ''}" placeholder="e.g. Engine Oil 15W-40">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <label class="inp-lbl">Category</label>
            <select class="inp" id="inv-cat">
              ${['Engineering','Safety','Provisions','Deck'].map(c =>
                `<option value="${c}" ${item && item.category===c ? 'selected' : ''}>${c}</option>`
              ).join('')}
            </select>
          </div>
          <div>
            <label class="inp-lbl">Unit</label>
            <input class="inp" id="inv-unit" value="${item ? escHtml(item.unit) : ''}" placeholder="e.g. L, units, bottles">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <div>
            <label class="inp-lbl">Quantity on hand</label>
            <input class="inp" id="inv-qty" type="number" min="0" value="${item ? item.qty : ''}">
          </div>
          <div>
            <label class="inp-lbl">Reorder at</label>
            <input class="inp" id="inv-reorder" type="number" min="0" value="${item ? item.reorderAt : ''}">
          </div>
          <div>
            <label class="inp-lbl">Unit cost (USD)</label>
            <input class="inp" id="inv-cost" type="number" min="0" step="0.01" value="${item ? item.cost : ''}">
          </div>
        </div>
        <div>
          <label class="inp-lbl">Storage location</label>
          <input class="inp" id="inv-loc" value="${item ? escHtml(item.location) : ''}" placeholder="e.g. ER Locker A2">
        </div>
        <div>
          <label class="inp-lbl">Photo URL <span style="color:var(--txt4);font-weight:400">(optional)</span></label>
          <input class="inp" id="inv-photo" value="${item?.photo ? escHtml(item.photo) : ''}" placeholder="https://...">
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
          ${editing ? `<button class="btn btn-ghost btn-sm" onclick="Inventory.del('${item.id}')">Delete</button>` : ''}
          <button class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary btn-sm" onclick="Inventory.save('${item ? item.id : ''}')">
            ${editing ? 'Save changes' : 'Add item'}
          </button>
        </div>
      </div>
    `, editing ? 'Edit item' : 'Add inventory item');
  }

  function save(id) {
    const name    = document.getElementById('inv-name')?.value.trim();
    const cat     = document.getElementById('inv-cat')?.value;
    const unit    = document.getElementById('inv-unit')?.value.trim();
    const qty     = parseInt(document.getElementById('inv-qty')?.value) || 0;
    const reorder = parseInt(document.getElementById('inv-reorder')?.value) || 0;
    const cost    = parseFloat(document.getElementById('inv-cost')?.value) || 0;
    const loc     = document.getElementById('inv-loc')?.value.trim();
    const photo   = document.getElementById('inv-photo')?.value.trim() || undefined;
    if (!name || !unit) { showToast('Name and unit are required', 'error'); return; }
    if (!FM.inventory) FM.inventory = [];
    if (id) {
      const item = FM.inventory.find(i => i.id === id);
      if (item) Object.assign(item, { name, category:cat, unit, qty, reorderAt:reorder, cost, location:loc, photo });
    } else {
      const v = _vessel();
      FM.inventory.push({ id:'inv-' + Date.now(), vessel: v ? v.id : 'v1', name, category:cat, unit, qty, reorderAt:reorder, cost, location:loc, photo });
    }
    closeModal();
    render();
    showToast(id ? 'Item updated' : 'Item added');
  }

  function del(id) {
    FM.inventory = (FM.inventory || []).filter(i => i.id !== id);
    closeModal();
    render();
    showToast('Item removed');
  }

  return { render, setTab, use, openAdd, openEdit, openDetail, save, del };
})();

window.Inventory = Inventory;
