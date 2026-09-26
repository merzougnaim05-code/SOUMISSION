import {useState} from 'react';
import {fmt, rankLot, useStore} from '../store';
import {tafqitDZD} from '../tafqit';
import {DocHeader, Page, SignRow} from './primitives';

/** جدول مقارنة العروض لكل حصة */
export function ComparaisonDoc({lotId}: {lotId: string}) {
  const {state} = useStore();
  const s = state.settings;
  const [pageLotId, setPageLotId] = useState(lotId);
  const lot = state.lots.find((l) => l.id === pageLotId) ?? state.lots[0];
  const ranked = rankLot(lot, state.bidders, state.offers);
  const winners = ranked.filter((r) => r.rank === 1);

  return (
    <>
      <Page>
        <DocHeader />
        <div className="doc-title">جدول مقارنة العروض</div>

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

        <div className="text-center mb-3" style={{fontWeight: 700, fontSize: '14pt'}}>
          الحصة {String(lot.numero).padStart(2, '0')}: {lot.nom} — السنة المالية {s.annee}
        </div>

        <table className="table-doc" style={{fontSize: '10.5pt'}}>
          <thead>
            <tr>
              <th style={{width: '30%'}}>المتعهد</th>
              <th style={{width: '14%'}}>المبلغ الأدنى (دج)</th>
              <th style={{width: '14%'}}>المبلغ الأقصى (دج)</th>
              <th style={{width: '10%'}}>الترتيب</th>
              <th>الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map(({bidder, totals, rank}) => (
              <tr key={bidder.id}>
                <td style={{textAlign: 'right', fontWeight: 600}}>{bidder.nom}</td>
                <td>{totals.complete ? fmt(totals.min) : '—'}</td>
                <td>{totals.complete ? fmt(totals.max) : '—'}</td>
                <td style={{fontWeight: 700}}>{rank ?? '—'}</td>
                <td style={{fontSize: '9.5pt'}}>
                  {totals.complete
                    ? rank === 1
                      ? `العرض الأقل ثمناً — المبلغ الأقصى بالحروف: ${tafqitDZD(totals.max)}`
                      : ''
                    : 'عرض غير مكتمل'}
                </td>
              </tr>
            ))}
            {ranked.length === 0 && (
              <tr>
                <td colSpan={5}>لا توجد عروض مسجلة على هذه الحصة.</td>
              </tr>
            )}
          </tbody>
        </table>

        {winners.length > 0 && (
          <p className="mt-4" style={{textAlign: 'justify', fontSize: '12.5pt'}}>
            بناءً على المقارنة أعلاه، يتقدم العرض المقدم من طرف{' '}
            <b>{winners.map((w) => w.bidder.nom).join(' و')}</b> كأحسن عرض من حيث المزايا الاقتصادية (العرض
            الأقل ثمناً) على هذه الحصة.
          </p>
        )}

        <SignRow right="رئيس اللجنة" left="عضو اللجنة" />
      </Page>
    </>
  );
}
