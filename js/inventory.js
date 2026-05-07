/* ── INVENTORY MODULE ── */
const Inventory = (() => {
  const CATS = ['All','Engineering','Safety','Provisions','Deck'];
  const CAT_COLORS = { Engineering:'#22D3EE', Safety:'#F87171', Provisions:'#4ADE80', Deck:'#FACC15' };
  let _tab = 'All';

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
    const low   = items.filter(i => i.qty <= i.reorderAt);
    const visible = _tab === 'All' ? items : items.filter(i => i.category === _tab);

    wrap.innerHTML = `
      <div style="padding:18px 20px 48px">

        <!-- Low stock alert -->
        ${low.length ? `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(251,191,36,.08);border:.5px solid rgba(251,191,36,.3);border-radius:8px;margin-bottom:20px">
          <svg viewBox="0 0 16 16" fill="var(--yel)" style="width:14px;height:14px;flex-shrink:0"><path d="M8 1a.5.5 0 01.443.27l6.5 12A.5.5 0 0114.5 14h-13a.5.5 0 01-.443-.73l6.5-12A.5.5 0 018 1zm0 4a.5.5 0 00-.5.5v3a.5.5 0 001 0v-3A.5.5 0 008 5zm0 6.5a.5.5 0 100 1 .5.5 0 000-1z"/></svg>
          <span style="font-size:12px;color:var(--yel);font-weight:500">${low.length} item${low.length > 1 ? 's' : ''} at or below reorder level — restock required</span>
        </div>` : ''}

        <!-- Tabs -->
        <div style="display:flex;gap:4px;margin-bottom:20px;border-bottom:.5px solid var(--bd);padding-bottom:0">
          ${CATS.map(c => `
            <button onclick="Inventory.setTab('${c}')" class="tab-btn ${_tab===c ? 'tab-btn-active' : ''}">
              ${c}${c !== 'All' ? ` (${items.filter(i=>i.category===c).length})` : ''}
            </button>`).join('')}
        </div>

        <div style="display:flex;justify-content:flex-end;margin-bottom:14px">
          <button class="btn btn-primary btn-sm" onclick="Inventory.openAdd()">+ Add item</button>
        </div>

        ${(() => {
          const GRP_HDR = n => `<tr><td colspan="6" style="padding:10px 12px 6px;font-size:9px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:.09em;background:var(--bg);border-bottom:.5px solid var(--bd)">${escHtml(n)}</td></tr>`;
          const THEAD   = `<thead><tr><th>Item</th><th>Quantity</th><th>Reorder at</th><th>Location</th><th>Unit cost</th><th></th></tr></thead>`;
          const EMPTY   = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--txt3);font-size:12px">No ${_tab !== 'All' ? _tab.toLowerCase() + ' ' : ''}items on record. <button class="btn btn-ghost btn-xs" style="margin-left:8px" onclick="Inventory.openAdd()">Add item →</button></td></tr>`;

          function invRow(i) {
            const isLow = i.qty <= i.reorderAt;
            const isOut = i.qty === 0;
            const col   = isOut ? 'var(--red)' : isLow ? 'var(--yel)' : 'var(--grn)';
            return `<tr>
              <td style="font-weight:500;color:var(--txt)">${escHtml(i.name)}
                ${isOut ? `<div style="font-size:10px;color:var(--red);font-weight:600">Out of stock</div>`
                        : isLow ? `<div style="font-size:10px;color:var(--yel);font-weight:600">Low stock — reorder</div>` : ''}
              </td>
              <td><span style="font-size:14px;font-weight:600;color:${col}">${i.qty}</span> <span style="font-size:11px;color:var(--txt3)">${escHtml(i.unit)}</span></td>
              <td style="color:var(--txt3)">${i.reorderAt} ${escHtml(i.unit)}</td>
              <td style="color:var(--txt2)">${escHtml(i.location)}</td>
              <td style="color:var(--txt2)">${_fmt(i.cost)}</td>
              <td><div style="display:flex;gap:6px">
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

        <!-- Value summary -->
        ${items.length ? `
        <div style="margin-top:16px;display:flex;gap:20px;font-size:11px;color:var(--txt3)">
          <span>Total items: <strong style="color:var(--txt)">${items.length}</strong></span>
          <span>Total value: <strong style="color:var(--txt)">${_fmt(items.reduce((s,i) => s + i.qty * i.cost, 0))}</strong></span>
          <span>Low stock: <strong style="color:${low.length ? 'var(--yel)' : 'var(--grn)'}">${low.length}</strong></span>
        </div>` : ''}

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
    if (!name || !unit) { showToast('Name and unit are required', 'error'); return; }
    if (!FM.inventory) FM.inventory = [];
    if (id) {
      const item = FM.inventory.find(i => i.id === id);
      if (item) Object.assign(item, { name, category:cat, unit, qty, reorderAt:reorder, cost, location:loc });
    } else {
      const v = _vessel();
      FM.inventory.push({ id:'inv-' + Date.now(), vessel: v ? v.id : 'v1', name, category:cat, unit, qty, reorderAt:reorder, cost, location:loc });
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

  return { render, setTab, use, openAdd, openEdit, save, del };
})();

window.Inventory = Inventory;
