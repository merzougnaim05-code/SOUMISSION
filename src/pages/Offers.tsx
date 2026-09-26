import {useState} from 'react';
import {fmt, offerTotals, rankLot, useStore} from '../store';
import {Btn, Section} from '../ui';

/** العروض: تسجيل أسعار متعهد على حصة */
export function OffersPage() {
  const {state, setOffers} = useStore();
  const [bidderId, setBidderId] = useState(state.bidders[0]?.id ?? '');
  const [lotId, setLotId] = useState(state.lots[0].id);

  const lot = state.lots.find((l) => l.id === lotId) ?? state.lots[0];
  const offer = state.offers.find((o) => o.bidderId === bidderId && o.lotId === lot.id);
  const totals = offerTotals(lot, offer);

  const setPrice = (materiauId: string, p: number) => {
    const others = state.offers.filter((o) => !(o.bidderId === bidderId && o.lotId === lot.id));
    const prix = {...(offer?.prix ?? {}), [materiauId]: p};
    setOffers([...others, {bidderId, lotId: lot.id, prix}]);
  };

  const fillFromRef = () => {
    const prix: Record<string, number> = {};
    for (const mm of lot.materiaux) prix[mm.id] = mm.prixRef;
    const others = state.offers.filter((o) => !(o.bidderId === bidderId && o.lotId === lot.id));
    setOffers([...others, {bidderId, lotId: lot.id, prix}]);
  };

  const bidder = state.bidders.find((b) => b.id === bidderId);

  return (
    <div>
      <Section title="تسجيل العروض المقدمة (الأسعار الوحدوية بكامل الرسوم)">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div>
            <label className="app-label">المتعهد</label>
            <select className="app-input min-w-[220px]" value={bidderId} onChange={(e) => setBidderId(e.target.value)}>
              {state.bidders.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nom || '(بدون اسم)'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="app-label">الحصة</label>
            <select className="app-input min-w-[220px]" value={lotId} onChange={(e) => setLotId(e.target.value)}>
              {state.lots.map((l) => (
                <option key={l.id} value={l.id}>
                  الحصة {String(l.numero).padStart(2, '0')}: {l.nom}
                </option>
              ))}
            </select>
          </div>
          <Btn variant="ghost" small onClick={fillFromRef}>
            تعبئة بالأسعار المرجعية (للتجربة)
          </Btn>
        </div>

        {state.bidders.length === 0 ? (
          <p className="text-sm text-slate-500">أضف متعهدين أولاً من صفحة «المتعهدون».</p>
        ) : (
          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border border-slate-100 rounded-lg">
            <table className="w-full text-sm sticky-head">
              <thead>
                <tr className="bg-slate-50 text-slate-600 sticky top-0">
                  <th className="p-2 w-10">الرقم</th>
                  <th className="p-2 text-right">تعيين المادة</th>
                  <th className="p-2 w-20">الوحدة</th>
                  <th className="p-2 w-24">كمية دنيا</th>
                  <th className="p-2 w-24">كمية قصوى</th>
                  <th className="p-2 w-40">السعر الوحدوي (دج)</th>
                  <th className="p-2 w-36">مجموع أدنى (دج)</th>
                  <th className="p-2 w-36">مجموع أقصى (دج)</th>
                </tr>
              </thead>
              <tbody>
                {lot.materiaux.map((mm, i) => {
                  const p = offer?.prix[mm.id] ?? 0;
                  return (
                    <tr key={mm.id} className="border-t border-slate-100">
                      <td className="p-1 text-center text-slate-500">{i + 1}</td>
                      <td className="p-1">{mm.designation}</td>
                      <td className="p-1 text-center">{mm.unite}</td>
                      <td className="p-1 text-center">{fmt(mm.qteMin)}</td>
                      <td className="p-1 text-center">{fmt(mm.qteMax)}</td>
                      <td className="p-1">
                        <input
                          type="number"
                          className="app-input"
                          dir="ltr"
                          style={{textAlign: 'center'}}
                          value={p || ''}
                          onChange={(e) => setPrice(mm.id, Number(e.target.value) || 0)}
                        />
                      </td>
                      <td className="p-1 text-center">{p ? fmt(p * mm.qteMin) : '—'}</td>
                      <td className="p-1 text-center">{p ? fmt(p * mm.qteMax) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-teal-50 font-bold border-t-2 border-teal-700">
                  <td colSpan={6} className="p-2 text-center">
                    المجموع
                  </td>
                  <td className="p-2 text-center">{fmt(totals.min)}</td>
                  <td className="p-2 text-center">{fmt(totals.max)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {offer && !totals.complete && (
          <p className="text-amber-700 text-xs mt-2 font-semibold">
            ⚠ العرض غير مكتمل: يجب إدخال سعر لكل المواد حتى يُحتسب في التقييم.
          </p>
        )}
      </Section>
    </div>
  );
}

/** التقييم: ترتيب العروض والفائزون لكل حصة */
export function EvaluationPage() {
  const {state} = useStore();

  return (
    <div>
      {state.lots.map((lot) => {
        const ranked = rankLot(lot, state.bidders, state.offers);
        const hasComplete = ranked.some((r) => r.totals.complete);
        return (
          <Section key={lot.id} title={`الحصة ${String(lot.numero).padStart(2, '0')}: ${lot.nom}`}>
            {!hasComplete ? (
              <p className="text-sm text-slate-500">لا توجد عروض مكتملة على هذه الحصة.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-600">
                    <th className="p-2 w-14">الترتيب</th>
                    <th className="p-2 text-right">المتعهد</th>
                    <th className="p-2 w-44">المبلغ الأدنى (دج)</th>
                    <th className="p-2 w-44">المبلغ الأقصى (دج)</th>
                    <th className="p-2 w-28">النتيجة</th>
                  </tr>
                </thead>
                <tbody>
                  {[...ranked]
                    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
                    .map(({bidder, totals, rank}) => (
                      <tr key={bidder.id} className={`border-t border-slate-100 ${rank === 1 ? 'bg-teal-50' : ''}`}>
                        <td className="p-2 text-center font-bold">{rank ?? '—'}</td>
                        <td className="p-2 font-semibold">{bidder.nom || '(بدون اسم)'}</td>
                        <td className="p-2 text-center">{totals.complete ? fmt(totals.min) : '—'}</td>
                        <td className="p-2 text-center">{totals.complete ? fmt(totals.max) : '—'}</td>
                        <td className="p-2 text-center">
                          {rank === 1 ? (
                            <span className="bg-teal-700 text-white text-xs px-2 py-1 rounded-full">
                              الفائز بالمنح المؤقت
                            </span>
                          ) : !totals.complete ? (
                            <span className="text-amber-600 text-xs">غير مكتمل</span>
                          ) : (
                            <span className="text-slate-400 text-xs">مرفوض</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </Section>
        );
      })}
    </div>
  );
}
