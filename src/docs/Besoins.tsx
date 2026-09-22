import {useState} from 'react';
import {fmt, useStore} from '../store';
import {DocHeader, FreeAt, Page, SignRow} from './primitives';

/** كشف التقديرات الإدارية للاحتياجات — لكل حصة */
export function BesoinsDoc({lotId}: {lotId: string}) {
  const {state} = useStore();
  const s = state.settings;
  const [pageLotId, setPageLotId] = useState(lotId);
  const lot = state.lots.find((l) => l.id === pageLotId) ?? state.lots[0];

  return (
    <>
      <Page>
        <DocHeader />
        <div className="doc-title">كشف التقديرات الإدارية للاحتياجات</div>

        <table className="table-doc mb-4">
          <tbody>
            {state.lots.map((l) => (
              <tr key={l.id}>
                <td style={{fontWeight: 700, width: '22%'}}>الحصة {String(l.numero).padStart(2, '0')}:</td>
                <td className={l.id === lot.id ? 'font-bold' : ''}>
                  {l.nom} للسنة المالية {s.annee}
                </td>
                <td style={{width: '18%'}}>
                  <button
                    className="no-print text-xs underline text-teal-800"
                    onClick={() => setPageLotId(l.id)}
                  >
                    عرض هذه الحصة
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-center mb-2" style={{fontWeight: 700, fontSize: '14pt'}}>
          الحصة {String(lot.numero).padStart(2, '0')}: {lot.nom} للسنة المالية {s.annee}
        </div>

        <table className="table-doc">
          <thead>
            <tr>
              <th style={{width: '6%'}}>الرقم</th>
              <th>تعيين المادة</th>
              <th style={{width: '10%'}}>الوحدة</th>
              <th style={{width: '13%'}}>الكمية المقترحة خلال السنة الحالية</th>
              <th style={{width: '13%'}}>المبلغ الوحدوي بكامل الرسوم (دج)</th>
              <th style={{width: '12%'}}>الحدود الدنيا</th>
              <th style={{width: '12%'}}>الحدود القصوى</th>
              <th style={{width: '13%'}}>مجموع السعر الأدنى (دج)</th>
              <th style={{width: '13%'}}>مجموع السعر الأقصى (دج)</th>
            </tr>
          </thead>
          <tbody>
            {lot.materiaux.map((mm, i) => (
              <tr key={mm.id}>
                <td>{i + 1}</td>
                <td style={{textAlign: 'right'}}>{mm.designation}</td>
                <td>{mm.unite}</td>
                <td>{fmt(mm.qteMax)}</td>
                <td>{fmt(mm.prixRef)}</td>
                <td>{fmt(mm.qteMin)}</td>
                <td>{fmt(mm.qteMax)}</td>
                <td>{fmt(mm.qteMin * mm.prixRef)}</td>
                <td>{fmt(mm.qteMax * mm.prixRef)}</td>
              </tr>
            ))}
            <tr style={{fontWeight: 700, background: '#eef2f4'}}>
              <td colSpan={7}>المجموع</td>
              <td>{fmt(lot.materiaux.reduce((a, mm) => a + mm.qteMin * mm.prixRef, 0))}</td>
              <td>{fmt(lot.materiaux.reduce((a, mm) => a + mm.qteMax * mm.prixRef, 0))}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-6 text-sm">
          حرر بـ: <b>{s.commune}</b> في: ..............................
        </div>
        <SignRow right="الآمر بالصرف" />
      </Page>
    </>
  );
}
