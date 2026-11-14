import {fmt, fmtDate, rankLot, useStore} from '../store';
import {DocHeader, Page} from './primitives';

/** معلومات عن الممونين الذين تم اختيارهم في استشارة تموين المؤسسة —
 *  منقولة بأمانة عن ورقة «معلومات عن المتعهدين» في الملف الأصلي: جدول الفائزين
 *  بالحصص مع سجلاتهم التجارية والجبائية والبنكية + فترة العقد وجلسة الاستشارة.
 *  كل الحصص تُعرض دائماً — بالفائز أو بحقول منقّطة إن لم يُحدد بعد. */
export function MouninsRegDoc() {
  const {state} = useStore();
  const s = state.settings;
  const rows = state.lots.map((lot) => {
    const ranked = rankLot(lot, state.bidders, state.offers);
    const w = ranked.find((r) => r.rank === 1);
    return {lot, b: w?.bidder};
  });

  return (
    <Page>
      <DocHeader />
      <div className="doc-title">معلومات تخص الممونين الذين تم اختيارهم في استشارة تموين مطعم المؤسسة</div>
      <p style={{textAlign: 'justify', fontSize: '12pt'}}>
        السنة المالية: <b>{s.annee}</b> — البلدية: <b>{s.commune || '.........'}</b> — تسمية المؤسسة:{' '}
        <b>{s.institution || '.........'}</b> — اسم ولقب الآمر بالصرف: <b>{s.ordonnateur || '.........'}</b>
      </p>

      <table className="table-doc" style={{fontSize: '8.5pt', marginTop: '6pt'}}>
        <thead>
          <tr>
            <th style={{width: '4%'}}>الرقم</th>
            <th style={{width: '13%'}}>المادة</th>
            <th style={{width: '15%'}}>الممون</th>
            <th style={{width: '12%'}}>رقم السجل التجاري</th>
            <th style={{width: '11%'}}>النشاط</th>
            <th style={{width: '11%'}}>رقم البطاقة الضريبية</th>
            <th style={{width: '11%'}}>الرقم الجبائي</th>
            <th style={{width: '12%'}}>رقم الحساب البنكي</th>
            <th style={{width: '6%'}}>البنك</th>
            <th>الوكالة</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({lot, b}, i) => (
            <tr key={lot.id}>
              <td>{i + 1}</td>
              <td style={{textAlign: 'right'}}>{lot.nom}</td>
              <td style={{fontWeight: 700}}>{b?.nom || '..........................'}</td>
              <td>{b?.rc?.trim() ? b.rc : ''}</td>
              <td>{b?.activite?.trim() ? b.activite : ''}</td>
              <td>{b?.nis?.trim() ? b.nis : ''}</td>
              <td>{b?.nif?.trim() ? b.nif : ''}</td>
              <td>{b?.rib?.trim() ? b.rib : ''}</td>
              <td>{b?.banque?.trim() ? b.banque : ''}</td>
              <td>{b?.agence?.trim() ? b.agence : ''}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={10}>لم تُسجَّل حصص بعد — أضفها من تبويب «الحصص والمواد».</td>
            </tr>
          )}
        </tbody>
      </table>

      <table className="table-doc" style={{fontSize: '11pt', marginTop: '10pt'}}>
        <tbody>
          <tr>
            <th style={{width: '25%'}}>فتـــــــــــــــــــــــــرة العقد</th>
            <th>انعقدت جلسة الإستشارة</th>
          </tr>
          <tr>
            <td>
              من: <b>{s.contractFrom ? fmtDate(s.contractFrom) : '.........'}</b>
              <br />
              إلى: <b>{s.contractTo ? fmtDate(s.contractTo) : '.........'}</b>
            </td>
            <td>
              يوم: <b>{s.dateSessionConseil ? fmtDate(s.dateSessionConseil) : '.........'}</b>
              <br />
              على الساعة: <b>{s.heureOuverture || '.........'}</b>
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{textAlign: 'justify', fontSize: '11.5pt', marginTop: '8pt'}}>
        يُنجز ملف لكل متعهد فائز في الاستشارة يتضمن الاتفاقية وجدول الأسعار المعتمد بعد التصحيح ووثائق
        التعاقد.
      </p>
      <div style={{fontSize: '10.5pt', marginTop: '4pt'}}>
        إجمالي المبالغ الممنوحة:{' '}
        <b>
          {(() => {
            let sum = 0;
            let any = false;
            for (const lot of state.lots) {
              const ranked = rankLot(lot, state.bidders, state.offers);
              const w = ranked.find((r) => r.rank === 1);
              if (w?.totals.complete) {
                sum += w.totals.max;
                any = true;
              }
            }
            return any ? `${fmt(sum)} دج` : '.........';
          })()}
        </b>
      </div>
    </Page>
  );
}
