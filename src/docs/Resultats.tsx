import {rankLot, useStore} from '../store';
import {DocHeader, FreeAt, Page} from './primitives';

/** إعلان نتائج الاستشارة — المنح المؤقت للاتفاقية */
export function ResultatsDoc() {
  const {state} = useStore();
  const s = state.settings;

  // كل الحصص تُعرض دائماً — الفائز أو حقل منقّط إن لم يُحدد بعد
  const rows = state.lots.map((lot) => {
    const ranked = rankLot(lot, state.bidders, state.offers);
    const w = ranked.find((r) => r.rank === 1);
    return {lot, winner: w?.bidder};
  });

  return (
    <Page>
      <DocHeader />
      <div className="doc-title" style={{marginTop: '12pt'}}>
        إعــــلان
      </div>
      <p>
        يعلن السيد مدير <b>{s.institution}</b> عن نتائج الاستشارة المتضمنة عملية تموين المؤسسة بـ:{' '}
        <b>{state.lots.map((l) => l.nom).join(' و')}</b> للسنة المالية <b>{s.annee}</b>، والتي أسفرت عن ما
        يلي:
      </p>

      <div className="text-center mt-3 mb-2" style={{fontWeight: 700}}>
        جدول المتعهدين الفائزين بالمنح المؤقت للاتفاقية
      </div>
      <table className="table-doc">
        <thead>
          <tr>
            <th style={{width: '10%'}}>الرقم</th>
            <th style={{width: '40%'}}>الحصة</th>
            <th>المتعهد الفائز</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({lot, winner}, i) => (
            <tr key={lot.id}>
              <td>{i + 1}</td>
              <td>{lot.nom}</td>
              <td style={{fontWeight: 700}}>{winner?.nom || '..........................'}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3}>لم تُسجَّل حصص بعد — أضفها من تبويب «الحصص والمواد».</td>
            </tr>
          )}
        </tbody>
      </table>

      <ul style={{listStyle: 'none', paddingRight: '4pt', fontSize: '12.5pt'}} className="mt-5 space-y-2">
        <li style={{textAlign: 'justify'}}>
          * وعليه فإن المعنيين مدعوون إلى التقرب من المؤسسة لغرض استكمال إجراءات التعاقد.
        </li>
        <li style={{textAlign: 'justify'}}>
          * كل من لديه اعتراض من المشاركين الذين قدموا عروضاً وفق دفتر الشروط أن يتقدم بطعن إلى مجلس التربية
          والتوجيه في أجل أقصاه 10 أيام من تاريخ انعقاد جلسة دراسة العروض والمنح المؤقت للاتفاقيات.
        </li>
      </ul>

      <FreeAt />
      <div className="text-center mt-8" style={{fontWeight: 700}}>
        مدير المؤسسة
      </div>
    </Page>
  );
}
