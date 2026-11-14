import {Fragment, useState} from 'react';
import {fmt, fmtDate, rankLot, useStore} from '../store';
import {DocHeader, Page, SignRow} from './primitives';

/** كشف التقييم التفصيلي لكل حصة — منقول بأمانة من ورقة «التقييم 00» في الملف الأصلي:
 *  المواد بكمياتها القصوى × السعر الوحدوي والمبلغ عند كل متعهد، ثم المجموع العام
 *  والترتيب حسب أقل مبلغ، وتوقيع أعضاء المجلس. */
export function EvalGridDoc({lotId}: {lotId: string}) {
  const {state} = useStore();
  const s = state.settings;
  const [pageLotId, setPageLotId] = useState(lotId);
  const lot = state.lots.find((l) => l.id === pageLotId) ?? state.lots[0];

  // المتعهدين الذين قدموا سعراً واحداً على الأقل على هذه الحصة
  const cols = state.bidders.filter((b) =>
    state.offers.some((o) => o.bidderId === b.id && o.lotId === lot.id && Object.keys(o.prix).length > 0),
  );
  const ranked = rankLot(lot, state.bidders, state.offers);
  const rankOf = (bidderId: string) => ranked.find((r) => r.bidder.id === bidderId)?.rank;

  const priceOf = (bidderId: string, matId: string): number | null => {
    const o = state.offers.find((x) => x.bidderId === bidderId && x.lotId === lot.id);
    const p = o?.prix[matId];
    return p && p > 0 ? p : null;
  };
  /** مجموع المبالغ: null إن كان العرض ناقصاً (مادة بلا سعر) */
  const totalOf = (bidderId: string): number | null => {
    let sum = 0;
    for (const mm of lot.materiaux) {
      const p = priceOf(bidderId, mm.id);
      if (p === null) return null;
      sum += p * mm.qteMax;
    }
    return sum;
  };

  const committeeNames = [state.committee.president, ...state.committee.membres].filter((m) => m?.trim());

  return (
    <Page>
      <DocHeader />
      <div className="doc-title">كشف تقييم عملية تموين مطعم المؤسسة</div>

      <table className="table-doc mb-3 no-print">
        <tbody>
          <tr>
            {state.lots.map((l) => (
              <td
                key={l.id}
                onClick={() => setPageLotId(l.id)}
                className="cursor-pointer"
                style={{fontWeight: l.id === pageLotId ? 700 : 400, background: l.id === pageLotId ? '#dde9ec' : '#fff'}}
              >
                الحصة {String(l.numero).padStart(2, '0')}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <div className="text-center mb-1" style={{fontWeight: 700, fontSize: '13pt'}}>
        الحصة {String(lot.numero).padStart(2, '0')}: {lot.nom} — للسنة المالية: {s.annee}
      </div>
      <div className="text-center mb-2" style={{fontWeight: 700, fontSize: '11.5pt'}}>
        الكشف الكمي والتقديري للتقييم
      </div>

      <table className="table-doc" style={{fontSize: '9pt'}}>
        <thead>
          <tr>
            <th rowSpan={2} style={{width: '4%'}}>
              الرقم
            </th>
            <th rowSpan={2} style={{width: '20%'}}>
              التعيين
            </th>
            <th rowSpan={2} style={{width: '6%'}}>
              الوحدة
            </th>
            <th rowSpan={2} style={{width: '6%'}}>
              الكمية القصوى
            </th>
            {cols.map((b) => (
              <th key={b.id} colSpan={2}>
                {b.nom}
              </th>
            ))}
          </tr>
          <tr>
            {cols.map((b) => (
              <Fragment key={b.id}>
                <th style={{width: '6.5%'}}>سعر-و</th>
                <th style={{width: '8%'}}>المبلغ</th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {lot.materiaux.map((mm, i) => (
            <tr key={mm.id}>
              <td>{i + 1}</td>
              <td style={{textAlign: 'right'}}>{mm.designation}</td>
              <td>{mm.unite}</td>
              <td>{fmt(mm.qteMax)}</td>
              {cols.map((b) => {
                const p = priceOf(b.id, mm.id);
                return (
                  <Fragment key={b.id}>
                    <td>{p === null ? '—' : fmt(p)}</td>
                    <td style={{fontWeight: 600}}>{p === null ? '—' : fmt(p * mm.qteMax)}</td>
                  </Fragment>
                );
              })}
            </tr>
          ))}
          <tr style={{background: '#e8eef0', fontWeight: 700}}>
            <td colSpan={4} style={{fontSize: '10pt'}}>
              المجموع العام والترتيب حسب أقل مبلغ
            </td>
            {cols.map((b) => {
              const t = totalOf(b.id);
              return (
                <Fragment key={b.id}>
                  <td style={{fontSize: '9.5pt'}}>{t === null ? '—' : ''}</td>
                  <td style={{fontSize: '9.5pt'}}>
                    {t === null ? 'غير مكتمل' : `${fmt(t)} (${rankOf(b.id) ?? '—'})`}
                  </td>
                </Fragment>
              );
            })}
          </tr>
        </tbody>
      </table>

      {cols.length === 0 && (
        <p className="mt-3" style={{textAlign: 'center', fontSize: '12pt'}}>
          لا توجد عروض مسجلة على هذه الحصة — أدخل الأسعار من تبويب «العروض».
        </p>
      )}

      <div className="mt-4" style={{fontSize: '11pt'}}>
        <b>أعضاء المجلس:</b> {committeeNames.length > 0 ? committeeNames.join('، ') : '..........................'}
      </div>
      {s.dateSessionConseil && <div style={{fontSize: '11pt'}}>انعقدت جلسة التقييم بتاريخ: {fmtDate(s.dateSessionConseil)}</div>}
      <SignRow right="الإمضاء" left="المدير" />
    </Page>
  );
}
