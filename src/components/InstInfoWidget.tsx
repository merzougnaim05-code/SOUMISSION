// زر «معطيات المؤسسة» — ودجت عام لأي تطبيق React
// يستقبل الهوية الرسمية للمؤسسة من البوابة عبر جزء الرابط (#inst=...) عند الفتح،
// ويحفظها محلياً في هذا المتصفح فقط (localStorage)، ثم يطبّقها على مفاتيح
// localStorage التي يحددها التطبيق. لا يوجد أي اتصال بخادم أو مركز خارجي،
// ولا تظهر المعطيات لأي مستخدم آخر.
import { useEffect, useState } from 'react';

const LS_MECANO = 'instInfoMecanoV1';
const LS_APPLIED = 'instInfoAppliedAtV1';
const LS_INFO = 'instInfoV1';
const LS_UPDATED = 'instInfoUpdatedAtV1';

export interface InstInfoTarget {
  /** مفتاح localStorage الذي يحوي بيانات التطبيق */
  storageKey: string;
  /** مسار الكائن داخل المفتاح (مثل institution أو settings أو meta) — فارغ = الجذر */
  subPath?: string;
  /** hubField → اسم الحقل في إعدادات التطبيق */
  fields: { [hubField: string]: string };
  /** الحقول الرقمية (يُستخرج منها العدد من سنة مثل 2025/2026) */
  numeric?: string[];
}

interface StoredInfo {
  [field: string]: unknown;
}

function getLS(k: string): string | null {
  try { return localStorage.getItem(k); } catch { return null; }
}
function setLS(k: string, v: string | null) {
  try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* ignore */ }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

// فكّ حمولة #inst=... : base64url (دون حشو) لنص JSON مشفّر بـ UTF-8
function decodeHashPayload(payload: string): { info: StoredInfo; updatedAt: string } | null {
  try {
    let b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const text = new TextDecoder('utf-8').decode(bytes);
    const parsed: unknown = JSON.parse(text);
    if (!isPlainObject(parsed)) return null;
    const info = (parsed as Record<string, unknown>).info;
    if (!isPlainObject(info)) return null;
    const updatedAt = typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '';
    return { info: info as StoredInfo, updatedAt };
  } catch { return null; }
}

// قراءة المعطيات المحفوظة محلياً في هذا المتصفح
function loadStoredInfo(): { info: StoredInfo; updatedAt: string } | null {
  try {
    const raw = getLS(LS_INFO);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isPlainObject(parsed)) return null;
    return { info: parsed as StoredInfo, updatedAt: getLS(LS_UPDATED) || '' };
  } catch { return null; }
}

function getContainer(obj: Record<string, unknown>, subPath?: string): Record<string, unknown> | null {
  if (!subPath) return obj;
  let cur: unknown = obj;
  for (const part of subPath.split('.')) {
    if (!cur || typeof cur !== 'object') return null;
    cur = (cur as Record<string, unknown>)[part];
  }
  if (!cur || typeof cur !== 'object' || Array.isArray(cur)) return null;
  return cur as Record<string, unknown>;
}

// مثل getContainer لكنه ينشئ المسار إن غاب (لمفتاح جديد لم يُحفظ بعد)
function ensureContainer(obj: Record<string, unknown>, subPath?: string): Record<string, unknown> | null {
  if (!subPath) return obj;
  let cur: Record<string, unknown> = obj;
  for (const part of subPath.split('.')) {
    const next = cur[part];
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      const fresh: Record<string, unknown> = {};
      cur[part] = fresh;
      cur = fresh;
    } else {
      cur = next as Record<string, unknown>;
    }
  }
  return cur;
}

function applyInfo(targets: InstInfoTarget[], info: StoredInfo): string[] {
  const applied: string[] = [];
  for (const t of targets) {
    // مفتاح جديد: أنشئ الكائن ومسار الحاوية من الصفر حتى تُطبَّق المعطيات دون انتظار أول حفظ
    let obj: Record<string, unknown>;
    const raw = getLS(t.storageKey);
    if (!raw) {
      obj = {};
    } else {
      try {
        obj = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        continue;
      }
      if (!obj || typeof obj !== 'object' || Array.isArray(obj)) continue;
    }
    try {
      const container = ensureContainer(obj, t.subPath);
      if (!container) continue;
      Object.entries(t.fields).forEach(([hubField, appField]) => {
        const v = info[hubField];
        if (v === undefined || v === null || String(v).trim() === '') return;
        if (t.numeric && t.numeric.indexOf(appField) !== -1) {
          const n = parseInt(String(v), 10);
          if (!isNaN(n)) container[appField] = n;
        } else {
          container[appField] = String(v);
        }
        applied.push(appField);
      });
      setLS(t.storageKey, JSON.stringify(obj));
    } catch { /* تجاهل مفتاحًا تالفًا */ }
  }
  return applied;
}

// هل قيم التطبيق المطبّقة تطابق فعلاً المعطيات الواصلة؟ الختم الزمني وحده
// لا يكفي: قد تتغيّر المعطيات دون أن يتقدّم الختم (حمولة اختبار مثلاً)،
// أو تُمسح قيم التطبيق بعد تطبيقها — عندها يجب إعادة التطبيق لا تخطّيه.
function targetsMatchStored(targets: InstInfoTarget[], info: StoredInfo): boolean {
  for (const t of targets) {
    const raw = getLS(t.storageKey);
    if (!raw) return false;
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return false;
    }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
    const container = getContainer(obj, t.subPath);
    if (!container) return false;
    for (const [hubField, appField] of Object.entries(t.fields)) {
      const v = info[hubField];
      if (v === undefined || v === null || String(v).trim() === '') continue;
      if (String(container[appField] ?? '') !== String(v)) return false;
    }
  }
  return true;
}

export function InstInfoWidget({ appName, targets }: { appName: string; targets: InstInfoTarget[] }) {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<StoredInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // تطبيق صامت تلقائي عند الإقلاع: المعطيات القادمة من البوابة عبر الرابط
  // تُحفظ محلياً ثم تُكتب مباشرة في مفاتيح التطبيق (طلب صريح من المستخدم)
  useEffect(() => {
    const boot = () => {
      // رقم ميكانوغرافي يمرَّر من البوابة في الرابط (?mecano=...) — يُحفظ محلياً دون أي اتصال خارجي
      try {
        const q = new URLSearchParams(window.location.search).get('mecano');
        if (q) {
          const m = q.trim().toLowerCase().replace(/\s+/g, '-');
          if (/^[a-z0-9._-]{3,32}$/.test(m)) {
            setLS(LS_MECANO, m);
            const u = new URL(window.location.href);
            u.searchParams.delete('mecano');
            window.history.replaceState(null, '', u.pathname + u.search + u.hash);
          }
        }
      } catch { /* تجاهل */ }
      // حمولة المعطيات في جزء الرابط (#inst=...) — تُفكّ وتُحفظ محلياً ثم يُزال الجزء من شريط العنوان
      try {
        const hash = window.location.hash || '';
        const match = hash.match(/inst=([^&]+)/);
        if (match) {
          const decoded = decodeHashPayload(match[1]);
          if (decoded) {
            setLS(LS_INFO, JSON.stringify(decoded.info));
            const mec = decoded.info.mecano;
            if (mec !== undefined && mec !== null && String(mec).trim() !== '') {
              setLS(LS_MECANO, String(mec).trim().toLowerCase().replace(/\s+/g, '-'));
            }
            setLS(LS_UPDATED, decoded.updatedAt || new Date().toISOString());
          }
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch { /* تجاهل */ }
      // تطبيق المعطيات المحفوظة محلياً إن لم تُطبَّق بعد؛ يُتخطّى فقط إن كان
      // الختم غير أحدث وكانت القيم مطابقة فعلاً (الختم وحده لا يكفي).
      const stored = loadStoredInfo();
      if (!stored) return;
      const storedAt = stored.updatedAt;
      const mine = getLS(LS_APPLIED) || '';
      const upToDate = storedAt !== '' && mine !== '' && new Date(storedAt) <= new Date(mine);
      if (upToDate && targetsMatchStored(targets, stored.info)) return;
      const applied = applyInfo(targets, stored.info);
      setLS(LS_APPLIED, storedAt);
      if (applied.length > 0) { location.reload(); return; }
    };
    boot();
    // الإقلاع مرة واحدة عند التركيب
  }, []);

  const openPanel = () => {
    const stored = loadStoredInfo();
    setInfo(stored ? stored.info : null);
    setOpen(true);
    setMsg(null);
  };

  const doApply = (infoToApply: StoredInfo) => {
    setBusy(true);
    const applied = applyInfo(targets, infoToApply);
    setLS(LS_APPLIED, getLS(LS_UPDATED) || new Date().toISOString());
    setBusy(false);
    setMsg({ text: `✓ طُبّقت الحقول على ${appName}: ${applied.length ? applied.join('، ') : 'لا حقول مطابقة'}`, ok: true });
    setTimeout(() => location.reload(), 800);
  };

  const fields: [string, string][] = [
    ['institution', 'اسم المؤسسة'],
    ['wilaya', 'الولاية'],
    ['direction', 'المديرية'],
    ['daira', 'الدائرة'],
    ['commune', 'البلدية'],
    ['mecano', 'الرقم الميكانوغرافي'],
    ['account', 'رقم الحساب'],
    ['ordonnateurCode', 'رمز الآمر بالصرف'],
    ['academicYear', 'السنة الدراسية/المالية'],
  ];

  return (
    <>
      {/* زر الشريط العلوي — أسفل الشريط مباشرة وسط الصفحة، تسمية «معطيات المؤسسة» */}
      <button
        onClick={openPanel}
        title="معطيات المؤسسة الرسمية — محفوظة محلياً في هذا المتصفح"
        className="no-print fixed top-[58px] left-1/2 -translate-x-1/2 z-[9999] rounded-full text-white shadow-lg border-2 border-amber-400 transition-transform hover:-translate-y-0.5 h-[36px] px-3 grid place-items-center"
        style={{ background: 'linear-gradient(145deg,#065f46,#047857 55%,#134e4a)' }}
        dir="rtl"
      >
        <span className="flex items-center gap-1.5 text-[12px] font-black whitespace-nowrap">
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
          </svg>
          معطيات المؤسسة
        </span>
      </button>

      {/* الزر العائم — أسفل اليسار بجانب زر الاتصال، تسمية «معطيات المؤسسة» */}
      <button
        onClick={openPanel}
        title="معطيات المؤسسة الرسمية — محفوظة محلياً في هذا المتصفح"
        className="no-print fixed bottom-[18px] left-[140px] h-[52px] z-[9999] rounded-2xl grid place-items-center text-white shadow-lg border-2 border-amber-400 transition-transform hover:-translate-y-0.5 px-3"
        style={{ background: 'linear-gradient(145deg,#065f46,#047857 55%,#134e4a)' }}
        dir="rtl"
      >
        <span className="flex items-center gap-2 text-[13px] font-black whitespace-nowrap">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
          </svg>
          معطيات المؤسسة
        </span>
      </button>

      {/* اللوحة */}
      {open && (
        <div className="no-print fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }} dir="rtl">
          <div className="bg-white w-full max-w-md rounded-2xl border border-emerald-200 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-l from-emerald-950 via-emerald-900 to-teal-950 text-white border-b-4 border-amber-500 px-4 py-2.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">🏛 معطيات المؤسسة — {appName}</h3>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/30 text-xs">✕</button>
            </div>
            <div className="p-4 space-y-3 max-h-[55vh] overflow-y-auto">
              {!info && (
                <div className="text-xs font-bold px-3 py-2 rounded-xl border bg-rose-50 text-rose-700 border-rose-200">
                  لا توجد معطيات محفوظة في هذا المتصفح — افتح هذا التطبيق من البوابة بعد حفظ معطيات المؤسسة فيها
                </div>
              )}
              {info && (
                <div className="border border-slate-200 rounded-xl p-3 space-y-1.5 bg-slate-50">
                  {fields.map(([k, label]) => (
                    <div key={k} className="flex justify-between gap-2 text-[11px]">
                      <span className="text-slate-500 font-bold whitespace-nowrap">{label}:</span>
                      <span className="text-slate-800 font-bold break-all text-left">{String(info[k] ?? '—') || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
              {info && (
                <button
                  onClick={() => doApply(info)}
                  disabled={busy}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm px-3 py-2 rounded-xl transition-colors"
                >
                  تطبيق هذه المعطيات على {appName}
                </button>
              )}
              {msg && (
                <div className={`text-xs font-bold px-3 py-2 rounded-xl border ${msg.ok ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                  {msg.text}
                </div>
              )}
              <p className="text-[10px] text-slate-400 leading-5">
                المعطيات تصل من البوابة عبر رابط الفتح وتُحفظ في هذا المتصفح فقط — لا تُرفع إلى أي خادم ولا تظهر لمستخدمين آخرين.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
