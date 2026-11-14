/** النسخ الاحتياطية: لقطات تلقائية في IndexedDB + نسخة JSON كاملة بضغطة.
 *  اللقطة تحفظ مخزني الوحدتين (التموين والأشغال) كما هما في localStorage —
 *  والاستعادة تعيد كتابتهما وتعيد تحميل الصفحة. البيانات لا تترك جهازك أبداً. */

const DB_NAME = 'estichara-backup';
const STORE = 'snapshots';
const CANTEEN_KEY = 'estichara-state-v2';
const HEAT_KEY = 'estichara-heat-v2';
const MAX_BACKUPS = 10;
const MIN_GAP_MS = 6 * 60 * 60 * 1000; // لقطة تلقائية واحدة كل 6 ساعات على الأكثر

export interface Snapshot {
  id?: number;
  ts: number;
  canteen: string;
  heat: string;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, {keyPath: 'id', autoIncrement: true});
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

export async function listSnapshots(): Promise<Snapshot[]> {
  try {
    const rows = await run<Snapshot[]>('readonly', (s) => s.getAll());
    return (rows ?? []).sort((a, b) => b.ts - a.ts);
  } catch {
    return [];
  }
}

/** لقطة جديدة الآن (يدوياً أو آلياً) — ثم حذف القديمة الزائدة */
export async function saveSnapshot(): Promise<void> {
  const snap: Snapshot = {
    ts: Date.now(),
    canteen: localStorage.getItem(CANTEEN_KEY) ?? '',
    heat: localStorage.getItem(HEAT_KEY) ?? '',
  };
  await run('readwrite', (s) => s.add(snap));
  const all = await listSnapshots();
  for (const old of all.slice(MAX_BACKUPS)) {
    if (old.id !== undefined) await run('readwrite', (s) => s.delete(old.id as number));
  }
}

/** لقطة تلقائية: تُستدعى عند أي تغيير في الحالة — تمر مرة كل 6 ساعات على الأكثر */
export async function autoSnapshot(): Promise<void> {
  try {
    const all = await listSnapshots();
    const last = all[0];
    if (last && Date.now() - last.ts < MIN_GAP_MS) return;
    await saveSnapshot();
  } catch {
    /* IndexedDB قد يكون محظوراً — لا شيء حرج، الحفظ الأساسي في localStorage */
  }
}

/** استعادة لقطة: تعيد كتابة المخزنين ثم تحميل الصفحة من جديد */
export async function restoreSnapshot(id: number): Promise<void> {
  const all = await listSnapshots();
  const snap = all.find((x) => x.id === id);
  if (!snap) throw new Error('النسخة غير موجودة');
  if (snap.canteen) localStorage.setItem(CANTEEN_KEY, snap.canteen);
  if (snap.heat) localStorage.setItem(HEAT_KEY, snap.heat);
  location.reload();
}

/** تحميل نسخة JSON كاملة (الوحدتان معاً) إلى جهازك */
export function downloadFullJSON(): void {
  const payload = {
    app: 'برنامج الاستشارات',
    version: 3,
    exportedAt: new Date().toISOString(),
    canteen: JSON.parse(localStorage.getItem(CANTEEN_KEY) ?? 'null'),
    heat: JSON.parse(localStorage.getItem(HEAT_KEY) ?? 'null'),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const d = new Date();
  a.download = `نسخة-الاستشارات-الكاملة-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** استيراد نسخة JSON كاملة — يستبدل البيانات الحالية (يتطلب تأكيداً من الواجهة) */
export async function importFullJSON(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text) as {canteen?: unknown; heat?: unknown};
  if (!data || (data.canteen === undefined && data.heat === undefined)) {
    throw new Error('الملف ليس نسخة صالحة من برنامج الاستشارات');
  }
  if (data.canteen) localStorage.setItem(CANTEEN_KEY, JSON.stringify(data.canteen));
  if (data.heat) localStorage.setItem(HEAT_KEY, JSON.stringify(data.heat));
  location.reload();
}
