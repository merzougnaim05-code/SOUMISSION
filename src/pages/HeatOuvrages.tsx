import type {Ouvrage} from '../types';
import {useHeat} from '../heatStore';
import {Btn, NumInput, Section} from '../ui';

/** بنود الأشغال (Détail quantitatif) */
export function HeatOuvragesPage() {
  const {state, setOuvrages} = useHeat();

  const update = (id: string, fn: (o: Ouvrage) => void) =>
    setOuvrages(state.ouvrages.map((o) => (o.id === id ? (() => {const c = {...o}; fn(c); return c;})() : o)));

  return (
    <Section
      title="بنود الأشغال (التفصيل الكمي)"
      actions={
        <Btn
          small
          onClick={() =>
            setOuvrages([...state.ouvrages, {id: `o${Date.now()}`, designation: '', unite: 'U', qte: 1, prixRef: 0}])
          }
        >
          + إضافة بند
        </Btn>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="p-2 w-10">N°</th>
              <th className="p-2 text-left">Désignation des ouvrages</th>
              <th className="p-2 w-20">Uté</th>
              <th className="p-2 w-24">Qté</th>
              <th className="p-2 w-32">Prix U (دج)</th>
              <th className="p-2 w-32">Montant (دج)</th>
              <th className="p-2 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {state.ouvrages.map((o, i) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="p-1 text-center text-slate-500">{i + 1}</td>
                <td className="p-1">
                  <textarea
                    className="app-input text-left"
                    dir="ltr"
                    rows={2}
                    value={o.designation}
                    onChange={(e) => update(o.id, (c) => (c.designation = e.target.value))}
                  />
                </td>
                <td className="p-1">
                  <input className="app-input" value={o.unite} onChange={(e) => update(o.id, (c) => (c.unite = e.target.value))} />
                </td>
                <td className="p-1">
                  <NumInput value={o.qte} onChange={(v) => update(o.id, (c) => (c.qte = v))} />
                </td>
                <td className="p-1">
                  <NumInput value={o.prixRef} onChange={(v) => update(o.id, (c) => (c.prixRef = v))} />
                </td>
                <td className="p-1 text-center font-semibold">{(o.qte * o.prixRef).toLocaleString('fr-DZ')}</td>
                <td className="p-1 text-center">
                  <button
                    className="text-rose-500 hover:text-rose-700 text-lg leading-none"
                    onClick={() => setOuvrages(state.ouvrages.filter((x) => x.id !== o.id))}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-teal-50 font-bold border-t-2 border-teal-700">
              <td colSpan={5} className="p-2 text-center">
                Total H.T (بالأسعار المرجعية)
              </td>
              <td className="p-2 text-center">
                {state.ouvrages.reduce((a, o) => a + o.qte * o.prixRef, 0).toLocaleString('fr-DZ')}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Section>
  );
}
