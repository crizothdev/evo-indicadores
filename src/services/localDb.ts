import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js';

const DB_NAME = 'evo_indicadores_backup';
const DB_VERSION = 1;

let db: SqlJsDatabase | null = null;
let initPromise: Promise<void> | null = null;

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore('backup');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction('backup', 'readonly');
    const store = tx.objectStore('backup');
    const req = store.get('database');
    req.onsuccess = () => {
      resolve(req.result ?? null);
      idb.close();
    };
    req.onerror = () => {
      reject(req.error);
      idb.close();
    };
  });
}

async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction('backup', 'readwrite');
    const store = tx.objectStore('backup');
    const req = store.put(data, 'database');
    req.onsuccess = () => {
      resolve();
      idb.close();
    };
    req.onerror = () => {
      reject(req.error);
      idb.close();
    };
  });
}

let persistTimeout: ReturnType<typeof setTimeout> | null = null;
function schedulePersist() {
  if (persistTimeout) clearTimeout(persistTimeout);
  persistTimeout = setTimeout(() => {
    persistTimeout = null;
    if (!db) return;
    try {
      const data = db.export();
      saveToIndexedDB(data);
    } catch {
      // silent
    }
  }, 2000);
}

export async function initDatabase(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs();
    const saved = await loadFromIndexedDB();
    if (saved) {
      db = new SQL.Database(saved);
    } else {
      db = new SQL.Database();
    }

    db.run(`CREATE TABLE IF NOT EXISTS documents (
      collection TEXT NOT NULL,
      id TEXT NOT NULL,
      data TEXT NOT NULL,
      updatedAt TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (collection, id)
    )`);

    db.run(`CREATE INDEX IF NOT EXISTS idx_documents_collection ON documents(collection)`);
  })();

  return initPromise;
}

function ensureDb(): SqlJsDatabase {
  if (!db) throw new Error('Local DB not initialized. Call initDatabase() first.');
  return db;
}

export async function writeDoc(collection: string, id: string, data: Record<string, unknown>): Promise<void> {
  const d = ensureDb();
  const json = JSON.stringify({ ...data, id });
  d.run(
    `INSERT OR REPLACE INTO documents (collection, id, data, updatedAt) VALUES (?, ?, ?, datetime('now'))`,
    [collection, id, json]
  );
  schedulePersist();
}

export async function deleteDoc(collection: string, id: string): Promise<void> {
  const d = ensureDb();
  d.run(`DELETE FROM documents WHERE collection = ? AND id = ?`, [collection, id]);
  schedulePersist();
}

export async function readDocs<T = Record<string, unknown>>(collection: string): Promise<T[]> {
  const d = ensureDb();
  const results = d.exec(`SELECT id, data FROM documents WHERE collection = ? ORDER BY rowid`, [collection]);
  if (results.length === 0) return [];
  return results[0].values.map((row: any) => {
    const parsed = JSON.parse(row[1] as string);
    return { ...parsed, id: row[0] } as T;
  });
}

export async function readDoc<T = Record<string, unknown>>(collection: string, id: string): Promise<T | null> {
  const d = ensureDb();
  const results = d.exec(`SELECT id, data FROM documents WHERE collection = ? AND id = ?`, [collection, id]);
  if (results.length === 0 || results[0].values.length === 0) return null;
  const row = results[0].values[0];
  const parsed = JSON.parse(row[1] as string);
  return { ...parsed, id: row[0] } as T;
}

export async function readDocsWhere<T = Record<string, unknown>>(
  collection: string,
  field: string,
  value: unknown
): Promise<T[]> {
  const all = await readDocs<T>(collection);
  return all.filter((doc: any) => doc[field] === value);
}
