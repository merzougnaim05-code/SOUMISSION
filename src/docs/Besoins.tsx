import {useState} from 'react';
import {fmt, useStore} from '../store';
import {DocHeader, FreeAt, Page, SignRow} from './primitives';

/** عرض المبلغ بصيغة 00,00 (بمنزلتين عشريتين إلزاميتين — السنتيمات) */
function fmtC(n: number): string {
  return new Intl.NumberFormat('fr-DZ', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(n || 0);
}

/** كشف التقديرات الإدارية للاحتياجات — كل حصة في صفحة A4 مستقلة */
export function BesoinsDoc() {
  const {state} = useStore();
  const s = state.settings;
  const [centimes, setCentimes] = useState(true);
  const f = centimes ? fmtC : fmt;

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
  };

  return (
    <>
      {/* شريط أدوات للشاشة فقط (لا يظهر عند الطباعة) */}
      <div className="no-print mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCentimes((v) => !v)}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
            centimes
              ? 'bg-teal-700 text-white border-teal-800'
              : 'bg-white text-teal-800 border-teal-300'
          }`}
          title="عرض كل الأسعار بمنزلتين عشريتين (00,00)"
        >
          🪙 السعر بالسنتيمات (00,00): {centimes ? 'نشط' : 'معطّل'}
        </button>
        {state.lots.length > 1 && (
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500">الانتقال إلى:</span>
            {state.lots.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => jumpTo(`besoins-${l.id}`)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
              >
                الحصة {String(l.numero).padStart(2, '0')}
              </button>
            ))}
          </span>
        )}
      </div>

      {state.lots.map((lot) => (
        <Page key={lot.id} id={`besoins-${lot.id}`}>
          <DocHeader />
          <div className="doc-title">كشف التقديرات الإدارية للاحتياجات</div>
          <div className="text-center mb-3" style={{fontWeight: 700, fontSize: '13pt'}}>
            الحصة {String(lot.numero).padStart(2, '0')}: {lot.nom} للسنة المالية {s.annee}
          </div>

          <table className="table-doc">
            <thead>
              <tr>
                <th style={{width: '4%'}}>الرقم</th>
                <th style={{width: '32%'}}>تعيين المادة</th>
                <th style={{width: '7%'}}>الوحدة</th>
                <th style={{width: '9%'}}>الكمية المقترحة خلال السنة الحالية</th>
                <th style={{width: '10%'}}>المبلغ الوحدوي بكامل الرسوم (دج)</th>
                <th style={{width: '9%'}}>الحدود الدنيا</th>
                <th style={{width: '9%'}}>الحدود القصوى</th>
                <th style={{width: '10%'}}>مجموع السعر الأدنى (دج)</th>
                <th style={{width: '10%'}}>مجموع السعر الأقصى (دج)</th>
              </tr>
            </thead>
            <tbody>
              {lot.materiaux.map((mm, i) => (
                <tr key={mm.id}>
                  <td>{i + 1}</td>
                  <td style={{textAlign: 'right'}}>{mm.designation}</td>
                  <td>{mm.unite}</td>
                  <td>{fmt(mm.qteMax)}</td>
                  <td>{f(mm.prixRef)}</td>
                  <td>{fmt(mm.qteMin)}</td>
                  <td>{fmt(mm.qteMax)}</td>
                  <td>{f(mm.qteMin * mm.prixRef)}</td>
                  <td>{f(mm.qteMax * mm.prixRef)}</td>
                </tr>
              ))}
              <tr style={{fontWeight: 700, background: '#eef2f4'}}>
                <td colSpan={7}>المجموع</td>
                <td>{f(lot.materiaux.reduce((a, mm) => a + mm.qteMin * mm.prixRef, 0))}</td>
                <td>{f(lot.materiaux.reduce((a, mm) => a + mm.qteMax * mm.prixRef, 0))}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6 text-sm">
            حرر بـ: <b>{s.commune}</b> في: <span style={{letterSpacing: 2}}>....</span> /{' '}
            <span style={{letterSpacing: 2}}>....</span> / {s.annee || '......'}
          </div>
          <SignRow right="الآمر بالصرف" />
          <FreeAt />
        </Page>
      ))}
    </>
  );
}
