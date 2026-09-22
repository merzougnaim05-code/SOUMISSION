import {useState} from 'react';
import {fmt} from '../store';
import {heatTotals, rankHeat, useHeat} from '../heatStore';
import {Btn, Section} from '../ui';

/** تسجيل الأسعار الوحدوية لمقاولة */
export function HeatOffersPage() {
  const {state, setOffers} = useHeat();
  const [id, setId] = useState(state.entrepreneurs[0]?.id ?? '');
  const e = state.entrepreneurs.find((x) => x.id === id);
  const offer = state.offers.find((o) => o.entrepreneurId === id);
  const totals = heatTotals(state.ouvrages, offer, state.settings.tva);

  const setPrice = (ouvrageId: string, p: number) => {
    const others = state.offers.filter((o) => o.entrepreneurId !== id);
    setOffers([...others, {entrepreneurId: id, prix: {...(offer?.prix ?? {}), [ouvrageId]: p}}]);
  };
  const fillRef = () => {
    const prix: Record<string, number> = {};
    for (const o of state.ouvrages) prix[o.id] = o.prixRef;
    const others = state.offers.filter((o) => o.entrepreneurId !== id);
    setOffers([...others, {entrepreneurId: id, prix}]);
  };

  return (
    <Section title="تسجيل العروض المالية (الأسعار الوحدوية خارج الرسوم)">
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="app-label">المقاولة</label>
          <select className="app-input min-w-[240px]" value={id} onChange={(ev) => setId(ev.target.value)}>
            {state.entrepreneurs.length === 0 && <option value="">(أضف مقاولات أولاً)</option>}
            {state.entrepreneurs.map((x) => (
              <option key={x.id} value={x.id}>
                {x.nom || '(بدون اسم)'}
              </option>
            ))}
          </select>
        </div>
        <Btn variant="ghost" small onClick={fillRef}>
          تعبئة بالأسعار المرجعية (للتجربة)
        </Btn>
      </div>

      {e ? (
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border border-slate-100 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 sticky top-0">
                <th className="p-2 w-10">N°</th>
                <th className="p-2 text-left">Désignation</th>
                <th className="p-2 w-16">Uté</th>
                <th className="p-2 w-16">Qté</th>
                <th className="p-2 w-36">Prix U (دج)</th>
                <th className="p-2 w-36">Montant (دج)</th>
              </tr>
            </thead>
            <tbody>
              {state.ouvrages.map((o, i) => {
                const p = offer?.prix[o.id] ?? 0;
                return (
                  <tr key={o.id} className="border-t border-slate-100">
                    <td className="p-1 text-center text-slate-500">{i + 1}</td>
                    <td className="p-1 text-left" dir="ltr" style={{fontSize: '0.75rem'}}>
                      {o.designation}
                    </td>
                    <td className="p-1 text-center">{o.unite}</td>
                    <td className="p-1 text-center">{o.qte}</td>
                    <td className="p-1">
                      <input
                        type="number"
                        className="app-input"
                        dir="ltr"
                        style={{textAlign: 'center'}}
                        value={p || ''}
                        onChange={(ev) => setPrice(o.id, Number(ev.target.value) || 0)}
                      />
                    </td>
                    <td className="p-1 text-center">{p ? fmt(p * o.qte) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-teal-50 font-bold border-t-2 border-teal-700">
                <td colSpan={4} className="p-2 text-center">
                  Total H.T
                </td>
                <td colSpan={2} className="p-2 text-center">
                  {fmt(totals.ht)} — TVA {state.settings.tva}%: {fmt(totals.tvaAmount)} — T.T.C:{' '}
                  {fmt(totals.ttc)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-500">أضف مقاولات أولاً من صفحة «المقاولات».</p>
      )}
    </Section>
  );
}

/** التقييم النهائي: تقني + مالي + الترتيب */
export function HeatEvaluationPage() {
  const {state} = useHeat();
  const ranked = rankHeat(state);

  return (
    <Section title="تقييم العروض (تقني ثم مالي)">
      {ranked.length === 0 ? (
        <p className="text-sm text-slate-500">أضف مقاولات وأسعاراً أولاً.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="p-2 w-12">الترتيب</th>
              <th className="p-2 text-right">المقاولة</th>
              <th className="p-2 w-16">بشرية</th>
              <th className="p-2 w-16">مادية</th>
              <th className="p-2 w-16">آجال</th>
              <th className="p-2 w-20">تقني/40</th>
              <th className="p-2 w-28">H.T (دج)</th>
              <th className="p-2 w-28">T.T.C (دج)</th>
              <th className="p-2 w-20">المدة</th>
              <th className="p-2 w-32">النتيجة</th>
            </tr>
          </thead>
          <tbody>
            {[...ranked]
              .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
              .map(({entrepreneur, totals, tech, rank}) => (
                <tr key={entrepreneur.id} className={`border-t border-slate-100 ${rank === 1 ? 'bg-teal-50' : ''}`}>
                  <td className="p-2 text-center font-bold">{rank ?? '—'}</td>
                  <td className="p-2 font-semibold">{entrepreneur.nom || '(بدون اسم)'}</td>
                  <td className="p-2 text-center">{tech.humaines}</td>
                  <td className="p-2 text-center">{tech.materielles}</td>
                  <td className="p-2 text-center">{tech.delai}</td>
                  <td className={`p-2 text-center font-bold ${tech.qualified ? 'text-teal-700' : 'text-rose-600'}`}>
                    {tech.total}
                  </td>
                  <td className="p-2 text-center">{totals.complete ? fmt(totals.ht) : '—'}</td>
                  <td className="p-2 text-center">{totals.complete ? fmt(totals.ttc) : '—'}</td>
                  <td className="p-2 text-center">{entrepreneur.delaiPropose}</td>
                  <td className="p-2 text-center">
                    {rank === 1 ? (
                      <span className="bg-teal-700 text-white text-xs px-2 py-1 rounded-full">الفائزة</span>
                    ) : !tech.qualified ? (
                      <span className="text-rose-600 text-xs">مقصاة تقنياً</span>
                    ) : !totals.complete ? (
                      <span className="text-amber-600 text-xs">عرض غير مكتمل</span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Section>
  );
}
