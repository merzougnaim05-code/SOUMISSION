import {Fragment, useState} from 'react';
import {fmt, rankLot, useStore} from '../store';
import {DocHeader, Page, SignRow} from './primitives';

/** جدول العروض المقدمة — منقول بأمانة من ورقة «العروض المقدمة» في الملف الأصلي:
 *  لائحة المتعهدين ومبالغ عروضهم على الحصة بعمودين متجاورين (كما في السجل الأصلي). */
export function OffresRecuesDoc({lotId}: {lotId: string}) {
  const {state} = useStore();
  const s = state.settings;
  const [pageLotId, setPageLotId] = useState(lotId);
  const lot = state.lots.find((l) => l.id === pageLotId) ?? state.lots[0];
  const ranked = rankLot(lot, state.bidders, state.offers);

  // كل المتعهدين (المسجلين في الاستشارة) مع مبلغ عرضهم إن وُجد
  const rows = state.bidders.map((b) => {
    const r = ranked.find((x) => x.bidder.id === b.id);
    return {nom: b.nom, total: r?.totals.complete ? r.totals.max : null};
  });
  const half = Math.ceil(rows.length / 2);
  const right = rows.slice(0, half);
  const left = rows.slice(half);
  const nRows = Math.max(right.length, left.length, 6); // ستة أسطر كحد أدنى كما في السجل الأصلي

  const cell = (i: number) => {
    const r = rows[i];
    if (!r) return {num: String(i + 1), nom: '..........................', montant: ''};
    return {
      num: String(i + 1),
      nom: r.nom || '..........................',
      montant: r.total !== null && r.total !== undefined ? fmt(r.total) : '—',
    };
  };

  return (
    <Page>
      <DocHeader />
      <div className="doc-title">جدول العروض المقدمة</div>

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

      <div className="text-center mb-2" style={{fontWeight: 700, fontSize: '13pt'}}>
        الحصة {String(lot.numero).padStart(2, '0')}: {lot.nom} — السنة المالية {s.annee}
      </div>

      <table className="table-doc" style={{fontSize: '10.5pt'}}>
        <thead>
          <tr>
            <th style={{width: '6%'}}>الرقم</th>
            <th style={{width: '24%'}}>المتعهد</th>
            <th style={{width: '20%'}}>المبلغ (دج)</th>
            <th style={{width: '6%'}}>الرقم</th>
            <th style={{width: '24%'}}>المتعهد</th>
            <th>المبلغ (دج)</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({length: nRows}, (_, i) => (
            <Fragment key={i}>
              {(() => {
                const a = cell(i);
                const b = cell(half + i);
                const empty = !a.nom && !b.nom;
                if (empty && i >= 6) return null;
                return (
                  <tr>
                    <td>{a.num}</td>
                    <td style={{textAlign: 'right'}}>{a.nom}</td>
                    <td>{a.montant}</td>
                    <td>{b.num}</td>
                    <td style={{textAlign: 'right'}}>{b.nom}</td>
                    <td>{b.montant}</td>
                  </tr>
                );
              })()}
            </Fragment>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6}>لا يوجد متعهدين مسجلين — أدخلهم من تبويب «المتعهدون».</td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="mt-3" style={{textAlign: 'justify', fontSize: '11.5pt'}}>
        المبالغ المدونة هي مجموع العروض المالية المقدمة من طرف كل متعهد على هذه الحصة حسب جداول الأسعار
        الوحدوية المودعة، وتُثبت في هذا السجل عند جلسة فتح الأظرفة.
      </p>
      <SignRow right="عضو اللجنة" left="رئيس اللجنة" />
    </Page>
  );
}
