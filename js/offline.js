/* ── FRAME MARINE — OFFLINE / INDEXEDDB ── */
'use strict';

const Offline = window.Offline = {};

const DB_NAME    = 'frame-marine';
const DB_VERSION = 1;

Offline._db = null;
Offline._queue = [];

Offline.init = async function() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('workOrders')) {
        db.createObjectStore('workOrders', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        const qs = db.createObjectStore('syncQueue', { keyPath: '_qid', autoIncrement: true });
        qs.createIndex('store', 'store');
      }
    };

    req.onsuccess = e => {
      Offline._db = e.target.result;
      Offline.loadCache();
      resolve();
    };

    req.onerror = () => reject(req.error);
  });
};

Offline.loadCache = async function() {
  if (!Offline._db) return;

  // Load cached work orders into FM
  const tx  = Offline._db.transaction('workOrders', 'readonly');
  const store = tx.objectStore('workOrders');

  return new Promise(resolve => {
    const req = store.getAll();
    req.onsuccess = () => {
      const cached = req.result;
      cached.forEach(wo => {
        const idx = FM.workOrders.findIndex(w => w.id === wo.id);
        if (idx >= 0) FM.workOrders[idx] = wo;
        else FM.workOrders.unshift(wo);
      });
      resolve();
    };
    req.onerror = resolve;
  });
};

Offline.write = async function(storeName, record) {
  if (!Offline._db) return;
  const tx    = Offline._db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  return new Promise((resolve, reject) => {
    const req = store.put(record);
    req.onsuccess = resolve;
    req.onerror   = () => reject(req.error);
  });
};

Offline.queueWrite = function(storeName, id, data) {
  const entry = {
    store: storeName,
    id,
    data,
    timestamp: Date.now(),
    synced: false,
  };
  Offline._queue.push(entry);

  if (navigator.onLine) {
    Offline.flush();
  }

  // Also persist locally
  if (Offline._db) Offline.write(storeName, data);
};

Offline.flush = async function() {
  if (!navigator.onLine) return;

  const pending = Offline._queue.filter(e => !e.synced);
  if (pending.length === 0) return;

  // In production: POST to API here
  // For now, simulate success
  pending.forEach(e => e.synced = true);
  Offline._queue = Offline._queue.filter(e => !e.synced);
};

Offline.pendingCount = function() {
  return Offline._queue.filter(e => !e.synced).length;
};

// Flush on reconnect
window.addEventListener('online', () => Offline.flush());

// Initialise
document.addEventListener('DOMContentLoaded', () => {
  Offline.init().catch(() => {
    // IndexedDB unavailable (private browsing etc.) — degrade gracefully
  });
});
