import {fmt} from '../../store';
import {rankHeat, useHeat} from '../../heatStore';
import {tafqitDZD} from '../../tafqit';
import {HeatHeader, HPage, HSign} from './primitives';

/** جدول مقارنة وتقييم العروض (تقني + مالي + ترتيب) */
export function HeatComparaison() {
  const {state} = useHeat();
  const s = state.settings;
  const ranked = rankHeat(state);

  return (
    <HPage>
      <HeatHeader />
      <div className="doc-title">جدول مقارنة وتقييم العروض</div>
      <div className="text-center mb-2" style={{fontSize: '11pt'}}>
        استشارة رقم {s.numeroConsultation} — {s.projet}
      </div>

      <table className="table-doc" style={{fontSize: '10pt'}}>
        <thead>
          <tr>
            <th rowSpan={2}>المقاولة</th>
            <th colSpan={4}>التقييم التقني (40 نقطة)</th>
            <th colSpan={4}>العرض المالي (دج)</th>
            <th rowSpan={2} style={{width: '8%'}}>
              الترتيب
            </th>
          </tr>
          <tr>
            <th style={{width: '9%'}}>بشرية /15</th>
            <th style={{width: '9%'}}>مادية /20</th>
            <th style={{width: '9%'}}>آجال /5</th>
            <th style={{width: '9%'}}>المجموع</th>
            <th style={{width: '13%'}}>H.T</th>
            <th style={{width: '11%'}}>TVA</th>
            <th style={{width: '13%'}}>T.T.C</th>
            <th style={{width: '9%'}}>المدة (يوم)</th>
          </tr>
        </thead>
        <tbody>
          {[...ranked]
            .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
            .map(({entrepreneur, totals, tech, rank}) => (
              <tr key={entrepreneur.id} className={rank === 1 ? 'font-bold' : ''}>
                <td style={{textAlign: 'right'}}>{entrepreneur.nom || '(بدون اسم)'}</td>
                <td>{tech.humaines}</td>
                <td>{tech.materielles}</td>
                <td>{tech.delai}</td>
                <td style={{fontWeight: 700}}>{tech.total}</td>
                <td>{totals.complete ? fmt(totals.ht) : '—'}</td>
                <td>{totals.complete ? fmt(totals.tvaAmount) : '—'}</td>
                <td>{totals.complete ? fmt(totals.ttc) : '—'}</td>
                <td>{entrepreneur.delaiPropose}</td>
                <td style={{fontWeight: 700}}>{rank ?? '—'}</td>
              </tr>
            ))}
          {ranked.length === 0 && (
            <tr>
              <td colSpan={10}>لا توجد عروض مسجلة.</td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="mt-3" style={{fontSize: '11pt', textAlign: 'justify'}}>
        العلامة الدنيا للتأهيل التقني: 20 نقطة من 40. تمنح الاستشارة للمتعهد المؤهل تقنياً الذي يقدم أقل عرض مالي
        (T.T.C)، وفي حالة تساوي عرضين ماليين يُسند المشروع للمقاولة التي قدمت أقل آجال، وفي حالة تساوي الآجال
        تُمنح لصاحب أعلى نقطة تقنية.
      </p>

      <HSign right="رئيس اللجنة" left="عضو اللجنة" />
    </HPage>
  );
}

/** إعلان نتائج الاستشارة */
export function HeatResultats() {
  const {state} = useHeat();
  const s = state.settings;
  const ranked = rankHeat(state);
  const winner = ranked.find((r) => r.rank === 1);

  return (
    <HPage>
      <HeatHeader />
      <div className="doc-title">إعــــلان عن نتائج الاستشارة</div>
      <p style={{textAlign: 'justify', fontSize: '12.5pt'}}>
        يعلن مدير {s.institutionShort} عن نتائج الاستشارة رقم {s.numeroConsultation} المتعلقة بـ{s.projet}،
        والتي أسفرت عن ما يلي:
      </p>

      <table className="table-doc mt-2">
        <thead>
          <tr>
            <th style={{width: '12%'}}>الرقم</th>
            <th style={{width: '40%'}}>المشروع</th>
            <th>المقاولة الفائزة</th>
          </tr>
        </thead>
        <tbody>
          {winner ? (
            <tr>
              <td>1</td>
              <td>{s.projet}</td>
              <td style={{fontWeight: 700}}>{winner.entrepreneur.nom}</td>
            </tr>
          ) : (
            <tr>
              <td colSpan={3}>لم يُحدد فائز بعد — سجّل العروض وأكمل التقييم.</td>
            </tr>
          )}
        </tbody>
      </table>

      {winner && (
        <p className="mt-3" style={{textAlign: 'justify', fontSize: '12pt'}}>
          بمبلغ إجمالي بكل الرسوم قدره: <b>{fmt(winner.totals.ttc)} دج</b> ({tafqitDZD(winner.totals.ttc)})
          ومدة إنجاز {winner.entrepreneur.delaiPropose} يوماً.
        </p>
      )}

      <ul style={{listStyle: 'none', fontSize: '12pt'}} className="mt-3 space-y-2">
        <li style={{textAlign: 'justify'}}>
          * وعليه فإن المعني مدعو إلى التقرب من المؤسسة لغرض استكمال إجراءات التعاقد.
        </li>
        <li style={{textAlign: 'justify'}}>
          * يمكن للمشاركين الذين لم يتم اختيارهم والراغبين في الاطلاع على النتائج المفصلة التقرب من مصالح المؤسسة
          في أجل أقصاه ثلاثة (03) أيام، ويمكن لكل متعهد يحتج على المنح المؤقت أن يرفع طعناً في أجل عشرة (10)
          أيام ابتداءً من تاريخ أول نشر للإعلان عن المنح المؤقت.
        </li>
      </ul>

      <div className="mt-6 text-sm">
        {s.commune} في: ..............................
      </div>
      <div className="text-center mt-8" style={{fontWeight: 700}}>
        مدير الثانوية
      </div>
    </HPage>
  );
}
