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
      <div style="max-width:900px;padding:18px 20px 48px">

        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <div>
            <div style="font-size:20px;font-weight:500;color:var(--txt)">Inventory</div>
            <div style="font-size:11px;color:var(--txt3);margin-top:2px">${items.length} items · ${_vessel() ? _vessel().name : 'All vessels'}</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="Inventory.openAdd()">+ Add item</button>
        </div>

        <!-- Low stock alert -->
        ${low.length ? `
        <div style="background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.3);border-radius:10px;padding:14px 16px;margin-bottom:20px;display:flex;align-items:flex-start;gap:12px">
          <span style="font-size:16px;line-height:1">⚠</span>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:600;color:var(--yel);margin-bottom:4px">${low.length} item${low.length > 1 ? 's' : ''} at or below reorder level</div>
            <div style="font-size:11px;color:var(--txt3)">${low.map(i => escHtml(i.name)).join(' · ')}</div>
          </div>
        </div>` : ''}

        <!-- Category tabs -->
        <div style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap">
          ${CATS.map(c => `
            <button onclick="Inventory.setTab('${c}')"
              style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid;transition:all .15s;
                     ${_tab===c ? 'background:var(--txt);color:var(--bg);border-color:var(--txt)' : 'background:transparent;color:var(--txt2);border-color:var(--bd)'}">
              ${c} ${c !== 'All' ? `<span style="font-size:10px;opacity:.7">${items.filter(i=>i.category===c).length}</span>` : ''}
            </button>`).join('')}
        </div>

        <!-- Items table -->
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr>
              <th>Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Reorder at</th>
              <th>Location</th>
              <th>Unit cost</th>
              <th></th>
            </tr></thead>
            <tbody>
              ${visible.length ? visible.map(i => {
                const isLow  = i.qty <= i.reorderAt;
                const isOut  = i.qty === 0;
                const col    = isOut ? 'var(--red)' : isLow ? 'var(--yel)' : 'var(--grn)';
                const catCol = CAT_COLORS[i.category] || '#9CA3AF';
                return `<tr>
                  <td>
                    <div style="font-weight:500;color:var(--txt);font-size:12px">${escHtml(i.name)}</div>
                    ${isOut ? `<div style="font-size:10px;color:var(--red);font-weight:600">OUT OF STOCK</div>`
                            : isLow ? `<div style="font-size:10px;color:var(--yel);font-weight:600">Low stock — reorder</div>` : ''}
                  </td>
                  <td>
                    <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;background:${catCol}20;color:${catCol}">
                      ${escHtml(i.category)}
                    </span>
                  </td>
                  <td>
                    <span style="font-size:14px;font-weight:600;color:${col}">${i.qty}</span>
                    <span style="font-size:11px;color:var(--txt3)"> ${escHtml(i.unit)}</span>
                  </td>
                  <td style="font-size:12px;color:var(--txt3)">${i.reorderAt} ${escHtml(i.unit)}</td>
                  <td style="font-size:11px;color:var(--txt2)">${escHtml(i.location)}</td>
                  <td style="font-size:12px;color:var(--txt2)">${_fmt(i.cost)}</td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button class="btn btn-ghost btn-xs" onclick="Inventory.use('${i.id}')" title="Use one">Use</button>
                      <button class="btn btn-ghost btn-xs" onclick="Inventory.openEdit('${i.id}')">Edit</button>
                    </div>
                  </td>
                </tr>`;
              }).join('') : `
              <tr><td colspan="7" style="text-align:center;padding:32px;color:var(--txt3);font-size:12px">
                No ${_tab !== 'All' ? _tab.toLowerCase() + ' ' : ''}items on record.
                <button class="btn btn-ghost btn-xs" style="margin-left:8px" onclick="Inventory.openAdd()">Add item →</button>
              </td></tr>`}
            </tbody>
          </table>
        </div>

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
