import {useHeat} from '../../heatStore';
import {fmt} from '../../store';
import {tafqitDZD} from '../../tafqit';
import {HeatHeader, HPage, HSign} from './primitives';
import type {HeatOffer} from '../../types';

/** جدول الأسعار الوحدوية + التفصيل الكمي والتقديري (لمقاولة محددة أو فارغ كنموذج) */
export function HeatPrix({entrepreneurId}: {entrepreneurId: string}) {
  const {state} = useHeat();
  const s = state.settings;
  const e = state.entrepreneurs.find((x) => x.id === entrepreneurId);
  const offer: HeatOffer | undefined = state.offers.find((o) => o.entrepreneurId === entrepreneurId);

  return (
    <HPage>
      <HeatHeader />
      {e?.nom ? (
        <div className="text-center mb-1" style={{fontWeight: 700}}>
          المقاولة: {e.nom}
        </div>
      ) : null}
      <div className="doc-title">جدول الأسعار الوحدوية</div>
      <div className="text-center mb-2" style={{fontSize: '11pt'}}>
        المشروع: {s.projet} — استشارة رقم {s.numeroConsultation}
      </div>

      <table className="table-doc" style={{fontSize: '9.5pt'}}>
        <thead>
          <tr>
            <th style={{width: '5%'}}>N°</th>
            <th>Désignation des ouvrages</th>
            <th style={{width: '7%'}}>Uté</th>
            <th style={{width: '10%'}}>Prix Unitaire (دج)</th>
            <th style={{width: '22%'}}>Prix Unitaire بالحروف</th>
          </tr>
        </thead>
        <tbody>
          {state.ouvrages.map((o, i) => {
            const p = offer?.prix[o.id];
            return (
              <tr key={o.id}>
                <td>{i + 1}</td>
                <td style={{textAlign: 'left', direction: 'ltr'}}>{o.designation}</td>
                <td>{o.unite}</td>
                <td style={{fontWeight: 700}}>{p ? fmt(p) : ''}</td>
                <td style={{fontSize: '8.5pt'}}>{p ? tafqitDZD(p) : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 text-sm">
        {s.commune === 'وادي الماء' ? 'OUED ELMA' : s.commune} LE: ..............................
      </div>
      <div className="text-center mt-6" style={{fontWeight: 700}}>
        LE SOUMISSIONNAIRE
      </div>
    </HPage>
  );
}

/** التفصيل الكمي والتقديري — DQE مع HT/TVA/TTC */
export function HeatDQE({entrepreneurId}: {entrepreneurId: string}) {
  const {state} = useHeat();
  const s = state.settings;
  const e = state.entrepreneurs.find((x) => x.id === entrepreneurId);
  const offer = state.offers.find((o) => o.entrepreneurId === entrepreneurId);

  let ht = 0;
  const rows = state.ouvrages.map((o, i) => {
    const p = offer?.prix[o.id] || 0;
    const montant = p * o.qte;
    ht += montant;
    return {i: i + 1, o, p, montant};
  });
  const tvaAmount = Math.round(ht * (s.tva / 100));
  const ttc = ht + tvaAmount;
  const arrondi = Math.round(ttc / 1000) * 1000;

  return (
    <HPage>
      <HeatHeader />
      {e?.nom ? (
        <div className="text-center mb-1" style={{fontWeight: 700}}>
          المقاولة: {e.nom}
        </div>
      ) : null}
      <div className="doc-title">التفصيل الكمي والتقديري</div>
      <div className="text-center mb-2" style={{fontSize: '11pt'}}>
        Détail Quantitatif et Estimatif — المشروع: {s.projet}
      </div>

      <table className="table-doc" style={{fontSize: '9.5pt'}}>
        <thead>
          <tr>
            <th style={{width: '5%'}}>N°</th>
            <th>Désignation des Travaux</th>
            <th style={{width: '6%'}}>Uté</th>
            <th style={{width: '7%'}}>Qté</th>
            <th style={{width: '12%'}}>Prix Unitaire</th>
            <th style={{width: '14%'}}>Montant</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.o.id}>
              <td>{r.i}</td>
              <td style={{textAlign: 'left', direction: 'ltr'}}>{r.o.designation}</td>
              <td>{r.o.unite}</td>
              <td>{fmt(r.o.qte)}</td>
              <td>{r.p ? fmt(r.p) : ''}</td>
              <td>{r.p ? fmt(r.montant) : ''}</td>
            </tr>
          ))}
          <tr style={{fontWeight: 700, background: '#eef2f4'}}>
            <td colSpan={5} style={{textAlign: 'right'}}>
              Total H.T — المجموع خارج الرسوم
            </td>
            <td>{ht ? fmt(ht) : ''}</td>
          </tr>
          <tr>
            <td colSpan={5} style={{textAlign: 'right'}}>
              TVA {s.tva}%
            </td>
            <td>{ht ? fmt(tvaAmount) : ''}</td>
          </tr>
          <tr style={{fontWeight: 700, background: '#eef2f4'}}>
            <td colSpan={5} style={{textAlign: 'right'}}>
              Total T.T.C — المجموع بكل الرسوم
            </td>
            <td>{ht ? fmt(ttc) : ''}</td>
          </tr>
          <tr style={{fontWeight: 700}}>
            <td colSpan={5} style={{textAlign: 'right'}}>
              ARRONDI A — التقريب إلى
            </td>
            <td>{ht ? fmt(arrondi) : ''}</td>
          </tr>
        </tbody>
      </table>

      {ht > 0 && (
        <div className="mt-3" style={{fontSize: '11pt'}}>
          <div>المبلغ خارج الرسوم بالحروف: {tafqitDZD(ht)}</div>
          <div>
            المبلغ بكل الرسوم بعد التقريب بالحروف: {tafqitDZD(arrondi)}
          </div>
        </div>
      )}

      <div className="mt-4 text-sm">
        Fait à {s.commune === 'وادي الماء' ? 'Merouana' : s.commune} le: ..............................
      </div>
      <HSign right="LE SOUMISSIONNAIRE — المتعهد" />
    </HPage>
  );
}
