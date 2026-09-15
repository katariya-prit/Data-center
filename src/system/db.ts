// ============================================================
// IndexedDB layer — local-first storage.
// Badha changes (create/update/delete) pehla ahiya queue thay,
// pachi syncAllChanges() explicit call thay tyare j backend ma jay.
// ============================================================

const DB_NAME = "webos_explorer_db";
const DB_VERSION = 1;
const STORE_LOCAL_NODES = "localNodes";   // navi banaveli, haju un-synced files/folders
const STORE_PENDING_OPS = "pendingOps";   // content-update / delete queue

export interface FileNodeLite {
  id: string;
  diskId: string;
  parentId: string | null;
  name: string;
  type: "file" | "folder";
  path: string;
  contentId?: string | null;
  language?: string;
  content?: string;
  metadata?: { size: number; version: number; [key: string]: any };
  [key: string]: any;
}

export interface PendingOp {
  opId: string;
  type: "content-update" | "delete";
  nodeId: string;
  contentId?: string | null;
  data?: string; // navu content, type === "content-update" hoy tyare
  timestamp: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_LOCAL_NODES)) {
        db.createObjectStore(STORE_LOCAL_NODES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_PENDING_OPS)) {
        db.createObjectStore(STORE_PENDING_OPS, { keyPath: "opId" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest
): Promise<T> {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
}

// -------- Local (un-synced) nodes: create karta j vappay chhe --------

export async function saveToIndexedDB(node: FileNodeLite): Promise<void> {
  await withStore(STORE_LOCAL_NODES, "readwrite", (store) => store.put(node));
}

export async function getIndexedDBNodes(): Promise<FileNodeLite[]> {
  return withStore<FileNodeLite[]>(STORE_LOCAL_NODES, "readonly", (store) => store.getAll());
}

export async function updateIndexedDBNodeContent(nodeId: string, content: string): Promise<void> {
  const nodes = await getIndexedDBNodes();
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return;
  await saveToIndexedDB({ ...node, content });
}

export async function removeIndexedDBNode(nodeId: string): Promise<void> {
  await withStore(STORE_LOCAL_NODES, "readwrite", (store) => store.delete(nodeId));
}

export async function clearIndexedDB(): Promise<void> {
  await withStore(STORE_LOCAL_NODES, "readwrite", (store) => store.clear());
}

// -------- Pending ops: already-synced items par thayela changes --------

export async function queuePendingOp(op: Omit<PendingOp, "opId" | "timestamp">): Promise<void> {
  // ek j nodeId mate content-update already queued hoy to, jodi purano hatavi navo lakho (dedupe)
  const existing = await getPendingOps();
  const filtered = existing.filter(
    (o) => !(o.nodeId === op.nodeId && o.type === op.type)
  );
  const newOp: PendingOp = { ...op, opId: `${op.type}-${op.nodeId}`, timestamp: Date.now() };
  await withStore(STORE_PENDING_OPS, "readwrite", (store) => store.put(newOp));
  // dedupe cleanup (jo koi purana duplicate reh gaya hoy)
  for (const o of filtered) {
    if (o.opId !== newOp.opId) continue;
  }
}

export async function getPendingOps(): Promise<PendingOp[]> {
  return withStore<PendingOp[]>(STORE_PENDING_OPS, "readonly", (store) => store.getAll());
}

export async function removePendingOp(opId: string): Promise<void> {
  await withStore(STORE_PENDING_OPS, "readwrite", (store) => store.delete(opId));
}

export async function clearPendingOps(): Promise<void> {
  await withStore(STORE_PENDING_OPS, "readwrite", (store) => store.clear());
}

// -------- Total pending count (Explorer + GlobalDock badge mate) --------

export async function getPendingCount(): Promise<number> {
  const [localNodes, pendingOps] = await Promise.all([getIndexedDBNodes(), getPendingOps()]);
  return localNodes.length + pendingOps.length;
}