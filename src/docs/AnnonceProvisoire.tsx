import {fmt, rankLot, useStore} from '../store';
import {DocHeader, FreeAt, Page} from './primitives';

/** إعلان عن المنح المؤقت للاتفاقية — منقول بأمانة من ورقة «الاعلان عن المنح المؤقت»
 *  في الملف الأصلي: جدول الفائزين بالمنح المؤقت مع رقم التعريف الجبائي ومبلغ العرض
 *  بعد المراجعة، وحق الطعن في أجل أقصاه 10 أيام. تُعرض كل الحصص دائماً —
 *  بالفائز أو بحقول منقّطة إن لم يُحدد بعد. */
export function AnnonceProvisoireDoc() {
  const {state} = useStore();
  const s = state.settings;
  const rows = state.lots.map((lot) => {
    const ranked = rankLot(lot, state.bidders, state.offers);
    const w = ranked.find((r) => r.rank === 1);
    return {lot, bidder: w?.bidder, total: w?.totals};
  });

  return (
    <Page>
      <DocHeader />
      <div className="doc-title">إعـــلان عـن المنــح المؤقت للاتفاقية</div>
      <ul style={{listStyle: 'none', paddingRight: '6pt'}} className="space-y-2">
        <li style={{textAlign: 'justify'}}>
          * تطبيقا لأحكام المادتين 52 و65 من المرسوم الرئاسي رقم 15/247 المؤرخ في 16/09/2015 المتضمن تنظيم
          الصفقات العمومية وتفويضات المرفق العام.
        </li>
        <li style={{textAlign: 'justify'}}>
          * بنــــاء على قرار لجنة فتح الأظرفة وتقييم العروض المنتخبة بموجب مقرر رقم ......... بتاريخ
          ......... .
        </li>
      </ul>
      <p style={{textAlign: 'justify'}}>
        يعلن السيد مدير <b>{s.institution}</b> إلى كافة المتعهدين المشاركين في الاستشارة رقم:{' '}
        {s.numeroAnnonce > 0 ? String(s.numeroAnnonce).padStart(2, '0') : '.........'} بتاريخ:{' '}
        {s.dateAnnonce ? s.dateAnnonce : '.........'} المتعلقة عملية تموين مطعم المؤسسة خلال سنة:{' '}
        <b>{s.annee}</b>، أن المنح المؤقت للاتفاقية يكون لصالح المتعهدين الفائزين بالحصص التالية:
      </p>
      <ul style={{listStyle: 'none', paddingRight: '14pt'}} className="mb-2">
        {state.lots.map((l) => (
          <li key={l.id} style={{fontSize: '12.5pt'}}>
            - الحصة {String(l.numero).padStart(2, '0')}: {l.nom}
          </li>
        ))}
      </ul>

      <table className="table-doc">
        <thead>
          <tr>
            <th style={{width: '26%'}}>عنوان العملية</th>
            <th style={{width: '32%'}}>المتعهد الفائز</th>
            <th style={{width: '22%'}}>رقم التعريف الجبائي</th>
            <th>مبلغ العرض بعد المراجعة (دج)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({lot, bidder, total}) => (
            <tr key={lot.id}>
              <td>{lot.nom}</td>
              <td style={{fontWeight: 700}}>{bidder?.nom || '..........................'}</td>
              <td>{bidder?.nif?.trim() ? bidder.nif : '..........................'}</td>
              <td>{total && total.complete ? fmt(total.max) : '..........................'}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4}>لم تُسجَّل حصص بعد — أضفها من تبويب «الحصص والمواد».</td>
            </tr>
          )}
        </tbody>
      </table>

      <ul style={{listStyle: 'none', paddingRight: '4pt', fontSize: '12.5pt'}} className="mt-5 space-y-2">
        <li style={{textAlign: 'justify'}}>
          * وعليه فإن المعنيين مدعوون إلى التقرب من المؤسسة لغرض استكمال إجراءات التعاقد.
        </li>
        <li style={{textAlign: 'justify'}}>
          * كل من لديه اعتراض من المشاركين الذين قدموا عروضاً وفق دفتر الشروط أن يتقدم بطعن إلى مجلس
          التربية والتوجيه في أجل أقصاه 10 أيام من تاريخ انعقاد جلسة دراسة العروض والمنح المؤقت
          للاتفاقيات.
        </li>
      </ul>

      <FreeAt />
      <div className="text-center mt-8" style={{fontWeight: 700}}>
        مدير المؤسسة
      </div>
    </Page>
  );
}
