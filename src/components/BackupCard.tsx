import {useEffect, useRef, useState} from 'react';
import {autoSnapshot, downloadFullJSON, importFullJSON, listSnapshots, restoreSnapshot, saveSnapshot, type Snapshot} from '../backup';
import {Section} from '../ui';
/** بطاقة حماية البيانات: لقطات تلقائية (آخر 10) + نسخة JSON كاملة بضغطة.
 *  تُركَّب في صفحتي المدخل للوحدتين — تعمل على مخزني التموين والأشغال معاً. */
export function BackupCard() {
  const [snaps, setSnaps] = useState<Snapshot[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => {
    listSnapshots().then(setSnaps).catch(() => setSnaps([]));
  };
  useEffect(() => {
    refresh();
  }, []);

  const snapshotNow = async () => {
    setBusy(true);
    try {
      await saveSnapshot();
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const restore = async (s: Snapshot) => {
    const d = new Date(s.ts);
    const when = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(
      d.getHours(),
    ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    if (!confirm(`استعادة نسخة ${when}؟\nسيتم استبدال بيانات الوحدتين الحالية كاملة وإعادة تحميل الصفحة.`)) return;
    try {
      await restoreSnapshot(s.id as number);
    } catch (e) {
      alert('فشلت الاستعادة: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const importJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!confirm(`استيراد نسخة «${f.name}»؟\nسيتم استبدال بيانات الوحدتين الحالية كاملة وإعادة تحميل الصفحة.`)) {
      e.target.value = '';
      return;
    }
    try {
      await importFullJSON(f);
    } catch (err) {
      alert('فشل الاستيراد: ' + (err instanceof Error ? err.message : String(err)));
    }
    e.target.value = '';
  };

  return (
    <Section title="🛡️ حماية البيانات — النسخ الاحتياطية">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-sm font-bold hover:brightness-110 transition"
          onClick={() => void snapshotNow()}
          disabled={busy}
        >
          💾 أخذ نسخة الآن
        </button>
        <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-sm font-semibold hover:bg-slate-50 transition" onClick={downloadFullJSON}>
          ⬇ تحميل نسخة كاملة (JSON)
        </button>
        <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-sm font-semibold hover:bg-slate-50 transition" onClick={() => fileRef.current?.click()}>
          ⬆ استيراد نسخة (JSON)
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={(e) => void importJSON(e)} />
        <span className="text-xs text-slate-400">تُؤخذ لقطة تلقائية كل 6 ساعات على الأكثر (آخر 10 نسخ)</span>
      </div>
      {snaps.length === 0 ? (
        <p className="text-sm text-slate-400">لا توجد لقطات محفوظة بعد — اضغط «أخذ نسخة الآن» أو انتظر اللقطة التلقائية.</p>
      ) : (
        <div className="space-y-1">
          {snaps.map((s) => {
            const d = new Date(s.ts);
            const when = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} - ${String(
              d.getHours(),
            ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            return (
              <div key={s.id} className="flex items-center gap-2 text-sm border border-slate-100 rounded-lg px-3 py-1.5">
                <span>🗄️ نسخة من {when}</span>
                <div className="flex-1" />
                <button className="text-teal-700 text-xs font-bold underline underline-offset-2" onClick={() => void restore(s)}>
                  استعادة
                </button>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-slate-400 mt-2">
        البيانات تبقى على هذا الجهاز فقط — النسخة JSON هي نسختك الخارجية: حمّلها بعد كل جلسة عمل مهمة واحفظها خارج
        المتصفح.
      </p>
    </Section>
  );
}

/** تُستدعى من موفّري الحالة عند كل تغيير — تشغّل اللقطة التلقائية (بدون انتظار) */
export function scheduleAutoBackup() {
  void autoSnapshot();
}
