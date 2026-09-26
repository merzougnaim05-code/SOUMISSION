import type {Lot, Materiau} from '../types';
import {useStore} from '../store';
import {Btn, NumInput, Section} from '../ui';

export function LotsPage() {
  const {state, setLots} = useStore();

  const updateLot = (lotId: string, fn: (lot: Lot) => void) => {
    setLots(state.lots.map((l) => (l.id === lotId ? structuredCloneWithFn(l, fn) : l)));
  };

  return (
    <div>
      {state.lots.map((lot) => (
        <Section
          key={lot.id}
          title={`الحصة ${String(lot.numero).padStart(2, '0')}: ${lot.nom} (${lot.materiaux.length} مادة)`}
          actions={
            <Btn
              small
              onClick={() =>
                updateLot(lot.id, (l) =>
                  l.materiaux.push({
                    id: `m${Date.now()}`,
                    designation: '',
                    unite: '1كغ',
                    qteMin: 0,
                    qteMax: 0,
                    prixRef: 0,
                  }),
                )
              }
            >
              + إضافة مادة
            </Btn>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="p-2 w-10">الرقم</th>
                  <th className="p-2 text-right">تعيين المادة</th>
                  <th className="p-2 w-24">الوحدة</th>
                  <th className="p-2 w-28">الكمية الدنيا</th>
                  <th className="p-2 w-28">الكمية القصوى</th>
                  <th className="p-2 w-28">السعر المرجعي (دج)</th>
                  <th className="p-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {lot.materiaux.map((mm, i) => (
                  <tr key={mm.id} className="border-t border-slate-100">
                    <td className="p-1 text-center text-slate-500">{i + 1}</td>
                    <td className="p-1">
                      <input
                        className="app-input"
                        value={mm.designation}
                        onChange={(e) =>
                          updateLot(lot.id, (l) => {
                            const target = l.materiaux.find((x) => x.id === mm.id) as Materiau;
                            target.designation = e.target.value;
                          })
                        }
                      />
                    </td>
                    <td className="p-1">
                      <input
                        className="app-input"
                        value={mm.unite}
                        onChange={(e) =>
                          updateLot(lot.id, (l) => {
                            const target = l.materiaux.find((x) => x.id === mm.id) as Materiau;
                            target.unite = e.target.value;
                          })
                        }
                      />
                    </td>
                    <td className="p-1">
                      <NumInput
                        value={mm.qteMin}
                        onChange={(v) =>
                          updateLot(lot.id, (l) => {
                            const target = l.materiaux.find((x) => x.id === mm.id) as Materiau;
                            target.qteMin = v;
                          })
                        }
                      />
                    </td>
                    <td className="p-1">
                      <NumInput
                        value={mm.qteMax}
                        onChange={(v) =>
                          updateLot(lot.id, (l) => {
                            const target = l.materiaux.find((x) => x.id === mm.id) as Materiau;
                            target.qteMax = v;
                          })
                        }
                      />
                    </td>
                    <td className="p-1">
                      <NumInput
                        value={mm.prixRef}
                        onChange={(v) =>
                          updateLot(lot.id, (l) => {
                            const target = l.materiaux.find((x) => x.id === mm.id) as Materiau;
                            target.prixRef = v;
                          })
                        }
                      />
                    </td>
                    <td className="p-1 text-center">
                      <button
                        className="text-rose-500 hover:text-rose-700 text-lg leading-none"
                        title="حذف"
                        onClick={() =>
                          updateLot(lot.id, (l) => {
                            l.materiaux = l.materiaux.filter((x) => x.id !== mm.id);
                          })
                        }
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ))}
    </div>
  );
}

function structuredCloneWithFn(lot: Lot, fn: (l: Lot) => void): Lot {
  const copy: Lot = {
    ...lot,
    materiaux: lot.materiaux.map((mm) => ({...mm})),
  };
  fn(copy);
  return copy;
}
