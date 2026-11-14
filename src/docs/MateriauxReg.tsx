import {Fragment} from 'react';
import {fmt, useStore} from '../store';
import {DocHeader} from './primitives';
import {FlowSlot, type FlowUnit} from './flow';

const ROWS_PER_LOT = 35; // عدد الأسطر في ورقة «المواد» الأصلية (24–35 فارغة مرقّمة)

/** قائمة المواد محل الاستشارة — منقولة بأمانة عن ورقة «المواد» في الملف الأصلي:
 *  كل حصة بقسمها وجدولها (التعيين/الوحدة/الكمية الدنيا والقصوى/السعر المرجعي)
 *  مع الأسطر الفارغة المرقمة كما في الأصل — تُعرض كاملة حتى لو كانت الحصة خاوية. */
export function MateriauxRegDoc() {
  const {state} = useStore();
  const s = state.settings;
  const units: FlowUnit[] = [];

  units.push({
    key: 'head',
    node: (
      <div>
        <DocHeader />
        <div className="doc-title">المواد محل الإستشارة</div>
        <p style={{textAlign: 'justify', fontSize: '12pt'}}>
          المواد والكميات والأسعار المرجعية المعتمدة لعملية تموين مطعم المؤسسة — السنة المالية{' '}
          <b>{s.annee}</b> — إعلان رقم{' '}
          {s.numeroAnnonce > 0 ? String(s.numeroAnnonce).padStart(2, '0') : '.........'}/{s.annee}:
        </p>
      </div>
    ),
  });

  for (const lot of state.lots) {
    const n = Math.max(lot.materiaux.length, ROWS_PER_LOT);
    units.push({
      key: `lot-${lot.id}`,
      node: (
        <div>
          <div className="doc-title" style={{fontSize: '13.5pt', marginTop: '10pt', marginBottom: '4pt'}}>
            الحصة {String(lot.numero).padStart(2, '0')}: {lot.nom}
          </div>
          <table className="table-doc" style={{fontSize: '9.5pt'}}>
            <thead>
              <tr>
                <th style={{width: '6%'}}>الرقم</th>
                <th style={{width: '40%'}}>التعيين</th>
                <th style={{width: '12%'}}>الوحدة</th>
                <th style={{width: '13%'}}>الكمية الدنيا</th>
                <th style={{width: '13%'}}>الكمية القصوى</th>
                <th>السعر (دج)</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({length: n}, (_, i) => {
                const mm = lot.materiaux[i];
                return (
                  <Fragment key={mm?.id ?? `ph-${i}`}>
                    <td>{i + 1}</td>
                    <td style={{textAlign: 'right'}}>{mm?.designation || ''}</td>
                    <td>{mm?.unite || ''}</td>
                    <td>{mm ? fmt(mm.qteMin) : ''}</td>
                    <td>{mm ? fmt(mm.qteMax) : ''}</td>
                    <td>{mm ? fmt(mm.prixRef) : ''}</td>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ),
    });
  }

  if (state.lots.length === 0) {
    units.push({
      key: 'no-lots',
      node: (
        <p style={{textAlign: 'center', fontSize: '12pt'}}>
          لم تُسجَّل حصص بعد — أضفها من تبويب «الحصص والمواد».
        </p>
      ),
    });
  }

  return <FlowSlot key={`mreg-${state.lots.length}`} units={units} />;
}
