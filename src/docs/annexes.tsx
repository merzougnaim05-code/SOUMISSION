import {useStore} from '../store';
import {tafqitDZD} from '../tafqit';
import {DocHeader, FreeAt, Page} from './primitives';
import {fmt, offerTotals, rankLot, fmtDate} from '../store';
import type {Lot} from '../types';

/* طبق الأصل ورقة «4» → التصريح بالنزاهة */
export function NyzahaDoc({bidderId}: {bidderId: string}) {
  const {state} = useStore();
  const b = state.bidders.find((x) => x.id === bidderId);
  return (
    <Page>
      <DocHeader />
      <div className="doc-title">التصريــح بالنزاهة</div>
      <p style={{fontSize: '12.5pt', whiteSpace: 'pre-line'}}>
        {'طبقا لأحكام المرسوم الرئاسي رقم 23-12، مؤرخ في: 18 محرم عام 1445 الموافق 5 غشت سنة 2023.\nطبقا لأحكام المرسوم الرئاسي رقم 15-247، مؤرخ في: 06 ذو الحجة عام 1436 الموافق 16 سبتمبر سنة 2015.\nطبقا لأحكام المادة 51 من المرسوم الرئاسي رقم 10-236 المؤرخة في 28 شوال عام 1431 الموافق 7 اكتوبر سنة 2010 المعدل والمتمم بالمرسوم الرئاسي رقم 12-23 مؤرخ في 18 يناير 2012 المتضمن تنظيم الصفقات العمومية، وتطبيقا للقرار مؤرخ في 23 ربيع الثاني عام 1432 الموافق 28 مارس سنة 2011 يحدد نماذج رسالة العرض والتصريح بالاكتتاب والتصريح بالنزاهة.'}
      </p>
      <p style={{fontSize: '13pt', marginTop: '10pt'}}>انا الموقع (ة) أسفله:</p>
      <p style={{fontSize: '13pt'}}>
        اللقب والاسم: <span className="doc-fill" style={{minWidth: '70mm'}}>{b?.gerant || ''}</span>
      </p>
      <p style={{fontSize: '13pt'}}>
        المتصرف باسم ولحساب: <span className="doc-fill" style={{minWidth: '60mm'}}>{b?.nom || ''}</span>
      </p>
      {(
        [
          'أصرح بشرفي بأنه لم أكن أنا شخصيا، ولا أحد من مستخدمي، أو ممثلين عني أو معاملين ثانويين لي، محل متابعات قضائية بسبب الرشوة أو محاولة رشوة أعوان عموميين',
          'التزم بعدم اللجوء إلى أي أفعال أو مناورات ترمي إلى تقديم وعد لعون عمومي بمنح أو تخصيص، بصفة مباشرة أو غير مباشرة، أما لنفسه أو لكيان آخر، مكافأة أو امتياز مهما كانت طبيعته، بمناسبة تحضير صفقة أو عقد أو ملحق أو التفاوض بشارع ذلك أو إبرامه أو تنفيذه',
          'أصرح أني على علم أن اكتشاف أدلة خطيرة ومطابقة لانحياز أو فساد، قبل أو أثناء أو بعد إجراء إبرام صفقة أو عقد أو ملحق يشكل سببا كافيا لإلغاء الصفقة أو العقد أو الملحق المعني، من شأنه كذلك أن يكون سببا كافيا لاتخاذ أي تدبير ردعي آخر، يمكن أن يصل حد التسجيل في قائمة المتعاملين الاقتصاديين الممنوعين من المشاركة في الصفقات العمومية وفسخ الصفقة أو العقد و/أو المتابعات القضائية',
          'أشهد بأن المعلومات المذكورة أعلاه صحيحة تحت طائلة التعرض لتطبيق العقوبات المنصوص عليها في المادة 216 من الأمر 66-156 المؤرخ في 8 يونيو سنة 1966 والمتضمن قانون العقوبات، المعدل والمتمم.',
        ]
      ).map((t, i) => (
        <p key={i} style={{fontSize: '12.5pt', textAlign: 'justify', marginTop: i === 0 ? '10pt' : '2pt'}}>
          {t}
        </p>
      ))}
      <div className="mt-8 text-sm">
        حـرر بـ: ..................................... في: ......................................
      </div>
      <div className="text-center mt-10" style={{fontWeight: 700}}>
        المتعهــــــــــــــــــــــــــــد
        <div style={{fontWeight: 400, marginTop: '6pt'}}>(إسم وصفة الموقع و ختم المتعهد)</div>
      </div>
      <p className="mt-12" style={{fontSize: '11pt', fontFamily: 'var(--doc-font)'}}>
        <b>ملاحظة:</b> في حالة تجمع، يقدم كل عضو التصريح بالنزاهة الخاص به. وفي حالة المعاملة الثانوية يقدم كل متعامل
        ثانوي التصريح بالنزاهة الخاص به.
      </p>
    </Page>
  );
}

/* طبق الأصل ورقة «إقرار» (إقرار1..4) — إقرار بالمطابقة مع جدول أسعار الاتفاقية */
export function IqrarDoc({lotId, bidderId}: {lotId: string; bidderId: string}) {
  const {state} = useStore();
  const s = state.settings;
  const lot = state.lots.find((l) => l.id === lotId) ?? state.lots[0];
  const bidder = state.bidders.find((x) => x.id === bidderId);
  const offer = state.offers.find((o) => o.bidderId === bidderId && o.lotId === lot?.id);
  const totals = offerTotals(lot, offer);
  return (
    <Page>
      <DocHeader />
      <div className="doc-title">إقـــــــــرار</div>
      <p style={{fontSize: '13pt'}}>
        أنا الممضي (ة) أسفله السيد (ة): <span className="doc-fill" style={{minWidth: '60mm'}}>{bidder?.gerant || ''}</span>
      </p>
      <p style={{fontSize: '13pt'}}>
        المقدم (ة) لعرض تموين مطعم: <span className="doc-fill" style={{minWidth: '55mm'}}>{s.institution}</span>
      </p>
      <p style={{fontSize: '13pt'}}>
        بمادة: <span className="doc-fill" style={{minWidth: '70mm'}}>{lot?.nom}</span>
      </p>
      <p style={{fontSize: '12.5pt', textAlign: 'justify', marginTop: '6pt'}}>
        أقر بمطابقة الأسعار الواردة في هذا الجدول للعرض المالي الذي قدمته في ملف المشاركة في استشارة تموين مطعم المؤسسة
        للسنة المالية <b>{s.annee}</b>.
      </p>
      <div className="text-center mt-3 mb-2" style={{fontWeight: 700}}>
        جدول أسعار الاتفاقية
      </div>
      <table className="table-doc">
        <thead>
          <tr>
            <th style={{width: '8%'}}>الرقم</th>
            <th style={{width: '37%'}}>التعيين</th>
            <th style={{width: '13%'}}>الوحدة</th>
            <th style={{width: '16%'}}>السعر الوحدوي</th>
            <th>السعر الوحدوي بالأحرف</th>
          </tr>
        </thead>
        <tbody>
          {lot?.materiaux.map((m, i) => (
            <tr key={m.id}>
              <td>{i + 1}</td>
              <td style={{textAlign: 'right'}}>{m.designation}</td>
              <td>{m.unite}</td>
              <td>{fmt(offer?.prix[m.id] || 0)}</td>
              <td>{offer?.prix[m.id] ? tafqitDZD(offer.prix[m.id]) : '.................'}</td>
            </tr>
          ))}
          <tr style={{fontWeight: 700}}>
            <td colSpan={4}>مجموع السعر الوحدوي:</td>
            <td>{fmt(totals.max)}</td>
          </tr>
        </tbody>
      </table>
      <p style={{marginTop: '8pt', fontSize: '12.5pt'}}>
        حدد مجموع السعر الوحدوي بمبلغ قدره:{' '}
        <span className="doc-fill" style={{minWidth: '70mm'}}>
          {totals.max > 0 ? tafqitDZD(totals.max) : ''}
        </span>
      </p>
      <p style={{marginTop: '10pt', fontSize: '12.5pt'}}>
        <b>ملاحظة:</b> هذه الأسعار صالحة للفترة الممتدة من: {fmtDate(s.contractFrom)} إلى: {fmtDate(s.contractTo)}
      </p>
      <div className="flex justify-between mt-14 text-sm">
        <div className="text-center min-w-[40%]">
          <div style={{fontWeight: 700}}>ختم وتوقيع الممون</div>
        </div>
        <div className="text-center min-w-[40%]">
          <div style={{fontWeight: 700}}>تأشيرة مدير المؤسسة</div>
        </div>
      </div>
    </Page>
  );
}

/* طبق الأصل ورقة «6» — جدول الأسعار بالمعامل */
export function CoefficientDoc({lotId}: {lotId: string}) {
  const {state} = useStore();
  const s = state.settings;
  const lot = state.lots.find((l) => l.id === lotId) ?? state.lots[0];
  return (
    <Page>
      <DocHeader />
      <div className="doc-title" style={{fontSize: '13pt'}}>
        جدول الأسعار بالمعامل المتضمن عملية تموين مطعم {s.institution} — {lot?.nom} للسنة المالية: {s.annee}
      </div>
      <table className="table-doc">
        <thead>
          <tr>
            <th style={{width: '8%'}}>الرقم</th>
            <th style={{width: '34%'}}>التعيين</th>
            <th style={{width: '12%'}}>الوحدة</th>
            <th style={{width: '15%'}}>السعر الوحدوي</th>
            <th style={{width: '10%'}}>المعامل</th>
            <th style={{width: '15%'}}>السعر بالمعامل</th>
            <th>السعر بالمعامل بالأحرف</th>
          </tr>
        </thead>
        <tbody>
          {lot?.materiaux.map((m, i) => (
            <tr key={m.id}>
              <td>{i + 1}</td>
              <td style={{textAlign: 'right'}}>{m.designation}</td>
              <td>{m.unite}</td>
              <td>..........</td>
              <td>100</td>
              <td>..........</td>
              <td>.................</td>
            </tr>
          ))}
          <tr style={{fontWeight: 700}}>
            <td colSpan={6}>مجموع السعر بالمعامل:</td>
            <td>..............</td>
          </tr>
        </tbody>
      </table>
      <p style={{marginTop: '8pt', fontSize: '12.5pt'}}>
        حدد مجموع السعر بالمعامل بمبلغ قدره:{' '}
        <span className="doc-fill" style={{minWidth: '70mm'}}>
          &nbsp;
        </span>
      </p>
      <div className="text-center mt-16 text-sm">
        بــ: ................................ في: ......................................
        <div style={{fontWeight: 700, marginTop: '14pt'}}>(إسم وصفة الموقع و ختم المتعهد)</div>
      </div>
    </Page>
  );
}

/* طبق الأصل ورقة «المصادقة على دفتر الشروط» */
export function ConseilCahierDoc() {
  const {state} = useStore();
  const s = state.settings;
  const {president, membres} = state.committee;
  return (
    <Page>
      <DocHeader />
      <div style={{textAlign: 'left', fontSize: '11pt'}}>السنة الدراسية: {s.annee - 1} / {s.annee}</div>
      <div className="doc-title">محضر مجلس التوجيه و التسيير</div>
      <p>
        في يوم <span className="doc-fill" style={{minWidth: '28mm'}}>&nbsp;</span> عام{' '}
        <b>{s.annee - 1}</b> وعلى الساعة: <span className="doc-fill" style={{minWidth: '18mm'}}>&nbsp;</span>
      </p>
      <p>
        اجتمع أعضاء مجلس التوجيه والتسيير برئاسة السيد:<b>{' ' + president + ' '}</b> للمصادقة على دفاتر الشروط لتموين
        مطعم المؤسسة.
      </p>
      <div style={{fontWeight: 700}} className="mt-2">
        الأعضاء الحاضرون:
      </div>
      <table className="table-doc mt-2">
        <thead>
          <tr>
            <th style={{width: '45%'}}>اللقب و الاســـــــم</th>
            <th style={{width: '35%'}}>الوظيفة</th>
            <th>الحضور والغياب</th>
          </tr>
        </thead>
        <tbody>
          {[president, ...membres].map((n, i) => (
            <tr key={i}>
              <td>{n}</td>
              <td>...</td>
              <td>حاضر</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{fontWeight: 700}} className="mt-3">
        جـــــدول الأعمــــــال:
      </div>
      <p>* المصادقة على دفتر الشروط لتموين مطعم المؤسسة بـ:</p>
      <ul style={{listStyle: 'none', paddingRight: '14pt'}}>
        {state.lots.map((l) => (
          <li key={l.id} style={{fontSize: '12.5pt'}}>
            - الحصة {String(l.numero).padStart(2, '0')}: عملية تموين المؤسسة بـ {l.nom}.
          </li>
        ))}
      </ul>
      <div style={{fontWeight: 700}} className="mt-2">
        المــــداولات:
      </div>
      <p>
        بعد إلقاء الكلمة الترحيبية من طرف السيد مدير المؤسسة و تذكيره بموضوع الجلسة، قدم للسادة أعضاء المجلس نماذج من
        دفاتر الشروط لكل مادة على حدى، وبعد القراءة المتأنية لمحتوى دفتر الشروط والاتفاق على المواد التي سوف تكون محل طلب
        العروض، تمت المصادقة الجماعية على نماذج الدفاتر بعد مناقشة بعض الجزئيات.
      </p>
      <p>
        ر فعت الجلسـة في يومه و على الساعة: <span className="doc-fill" style={{minWidth: '16mm'}}>&nbsp;</span>
      </p>
      <FreeAt />
      <div className="text-center mt-10" style={{fontWeight: 700}}>
        رئيس المؤسسة
      </div>
    </Page>
  );
}

/* طبق الأصل ورقة «دراسة الطعون» */
export function ConseilAppelDoc() {
  const {state} = useStore();
  const s = state.settings;
  const {president, membres} = state.committee;
  return (
    <Page>
      <DocHeader />
      <div style={{textAlign: 'left', fontSize: '11pt'}}>السنة الدراسية: {s.annee - 1} / {s.annee}</div>
      <div className="doc-title">محضر مجلس التسيير و التوجيه</div>
      <p>
        تأسيسا على الطعن المقدم من طرف السيد: ........................... والذي يعترض من خلاله على نتائج استشارة تموين
        مطعم المؤسسة بـ: .................. والتي كان محلها {s.institution} يوم: ................ والتي أفرزت عن فوز
        السيد: .................. بالمنح المؤقت للإتفاقية.
      </p>
      <p>
        وفي يوم <span className="doc-fill" style={{minWidth: '28mm'}}>&nbsp;</span> وعلى الساعة:{' '}
        <span className="doc-fill" style={{minWidth: '18mm'}}>&nbsp;</span> إلتأم مجلس التسيير والتوجيه برئاسة السيد:
        <b>{' ' + president + ' '}</b> لدراسة الطعن المذكور أعلاه.
      </p>
      <div style={{fontWeight: 700}} className="mt-2">
        أعضاء المجلس:
      </div>
      <table className="table-doc mt-2">
        <thead>
          <tr>
            <th style={{width: '45%'}}>اللقب و الاســـــــم</th>
            <th style={{width: '35%'}}>الوظيفة</th>
            <th>الحضور والغياب</th>
          </tr>
        </thead>
        <tbody>
          {[president, ...membres].map((n, i) => (
            <tr key={i}>
              <td>{n}</td>
              <td>...</td>
              <td>حاضر</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{fontWeight: 700}} className="mt-3">
        جـــــدول الأعمــــــال:
      </div>
      <p>* دراسة الطعن المقدم من طرف السيد: .................................... متعهدا مقدم لعرض تموين المؤسسة بـ:
        ..........................</p>
      <div style={{fontWeight: 700}} className="mt-2">
        المــــداولات:
      </div>
      <p>
        بعد إلقاء الكلمة الترحيبية من طرف السيد مدير المؤسسة و تذكيره بموضوع الجلسة، قرأ محتوى رسالة الطعن محل الدراسة،
        مذكرا المجلس بالأجل القانوني لتقديم الطعون وأن السيد: ......................................... كان قد قدم الطعن في
        الآجال المنصوص عليها قانونا ويثبت ذلك ختم البريد الوارد.
      </p>
      <p>
        يعترض المتعهد: .................................. على
        .................................................................................................. وبعد
        الإطلاع والتدقيق في الوثائق المقدمة من العارضين تبين للمجلس وجاهة سبب اعتراض المعني.
      </p>
      <p>
        وعليه فإن منح الاتفاقية تؤول إليه بقوة القانون وتطبيقا لبنود دفتر الشروط المصادق عليه بتاريخ:
        ..............................
      </p>
      <p>
        ر فعت الجلسـة في يومه و على الساعة:{' '}
        <span className="doc-fill" style={{minWidth: '20mm'}}>&nbsp;</span>
      </p>
      <FreeAt />
      <div className="text-center mt-10" style={{fontWeight: 700}}>
        رئيس المؤسسة
      </div>
    </Page>
  );
}

/* وثيقة خطوات تنفيذ الاستشارة (من ورقة «خطوات الاتفاقية») */
export function EtapesDoc() {
  const steps = [
    {t: 'إعداد دفتر الشروط لكل حصة أو مادة على حدى.', s: ['تحديد المواد محل الاستشارة.', 'سحب الوثائق المكونة لدفتر الشروط (العرض التقني والمالي).']},
    {t: 'دعوة مجلس التربية والتسيير للانعقاد.', s: ['إرسال دعوات لأعضاء المجلس مع تحديد جدول الأعمال.']},
    {t: 'عقد مجلس للتربية والتسيير للمصادقة على دفتر الشروط.', s: ['تحرير محضر بذلك.']},
    {t: 'الإعلان عن طلب العروض.', s: ['طباعة الإعلان وتعليقه في الأماكن التي يمكن بها الوصول إلى أكبر عدد ممكن من الراغبين في المشاركة.']},
    {t: 'تسليم دفاتر الشروط للمتعهدين وتسجيل ذلك في دفتر خاص. (وجوب إحضار الختم عند سحب دفتر الشروط)', s: []},
    {t: 'دعوة مجلس التربية والتسيير للانعقاد.', s: ['إرسال دعوات لأعضاء المجلس مع تحديد جدول الأعمال.']},
    {t: 'عقد مجلس للتربية والتسيير لدراسة العروض المقدمة والمنح المؤقت للاتفاقيات.', s: ['تحرير محضر بذلك.']},
    {t: 'الإعلان عن المتعهدين الفائزين.', s: ['إعلان يعلق على مستوى المؤسسة ليسمح للجميع بالاطلاع على ما أسفرت عنه عملية الاستشارة خصوصا المشاركين']},
    {t: 'استقبال الطعون خلال الفترة القانونية لذلك.', s: []},
    {t: 'دعوة مجلس التربية والتسيير للانعقاد.', s: ['إرسال دعوات لأعضاء المجلس مع تحديد جدول الأعمال.']},
    {t: 'عقد مجلس للتربية والتسيير لدراسة الطعون المقدمة والفصل فيها.', s: ['تحرير محضر بذلك.']},
    {t: 'المنح النهائي للاتفاقيات بعد انقضاء آجال الطعن.', s: []},
    {t: 'توقيع العقود مع المتعهدين الفائزين.', s: []},
    {t: 'عند إعلان عدم جدوى الاستشارة يحرر محضر بذلك وتعاد نفس الخطوات السابقة.', s: []},
    {t: 'عند إعلان عدم جدوى الاستشارة للمرة الثانية يحرر محضر بذلك ويتم تمديد التموين السابق إن وجد أو تمنح الاتفاقية بالتراضي.', s: []},
  ];
  return (
    <Page>
      <DocHeader />
      <div className="doc-title">خطوات تنفيذ الاستشارة</div>
      <ol style={{paddingRight: '2pt'}} className="mt-2">
        {steps.map((st, i) => (
          <li key={i} className="mt-2" style={{fontSize: '12.5pt'}}>
            <table style={{width: '100%', borderCollapse: 'collapse' as const}}>
              <tbody>
                <tr>
                  <td style={{width: '6%', border: '1px solid #000', textAlign: 'center', fontWeight: 700, padding: '2pt 4pt'}}>
                    {i + 1}
                  </td>
                  <td style={{border: '1px solid #000', padding: '3pt 6pt', textAlign: 'right'}}>{st.t}</td>
                </tr>
                {st.s.map((sub, j) => (
                  <tr key={j}>
                    <td style={{width: '6%', border: '1px solid #000'}} />
                    <td style={{border: '1px solid #000', padding: '2pt 6pt', textAlign: 'right', fontSize: '12pt'}}>- {sub}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </li>
        ))}
      </ol>
    </Page>
  );
}

/* طبق الأصل ورقة «إعلان عن المنح النهائي» */
export function AnnonceFinaleDoc() {
  const {state} = useStore();
  const s = state.settings;
  const winners = state.lots
    .map((lot) => {
      const ranked = rankLot(lot, state.bidders, state.offers);
      const w = ranked.find((r) => r.rank === 1);
      return {lot, bidder: w?.bidder, total: w?.totals};
    })
    .filter((x) => x.bidder);
  return (
    <Page>
      <DocHeader />
      <div className="doc-title">إعـــلان عـن المنــح النهائي</div>
      <ul style={{listStyle: 'none', paddingRight: '6pt'}} className="space-y-2">
        <li style={{textAlign: 'justify'}}>
          * تطبيقا لأحكام المرسوم الرئاسي رقم 15/247 المؤرخ في 16/09/2015 المتضمن تنظيم الصفقات العمومية وتفويضات المرفق
          العام.
        </li>
        <li style={{textAlign: 'justify'}}>* تطبيقا لأحكام القانون 23/12 المحدد للقواعد العامة المتعلقة بالصفقات العمومية.</li>
      </ul>
      <p style={{textAlign: 'justify'}}>
        يعلن السيد مدير <b>{s.institution}</b> إلى كافة المتعهدين المشاركين في الاستشارة رقم:{' '}
        {s.numeroAnnonce > 0 ? String(s.numeroAnnonce).padStart(2, '0') : '.........'} المتعلقة عملية تموين مطعم
        المؤسسة خلال سنة: <b>{s.annee}</b> بالحصص التالية:
      </p>
      <ul style={{listStyle: 'none', paddingRight: '14pt'}} className="mb-2">
        {state.lots.map((l) => (
          <li key={l.id} style={{fontSize: '12.5pt'}}>
            - الحصة {String(l.numero).padStart(2, '0')}: {l.nom}
          </li>
        ))}
      </ul>
      <p>أنه بعد انتهاء آجال الطعون ودراسة كافة الطعون المقدمة تم المنح النهائي للاستشارة حسب الجدول التالي:</p>
      <table className="table-doc">
        <thead>
          <tr>
            <th style={{width: '32%'}}>عنوان العملية</th>
            <th style={{width: '38%'}}>المتعهد الفائز</th>
            <th>مبلغ العرض</th>
          </tr>
        </thead>
        <tbody>
          {winners.map(({lot, bidder, total}) => (
            <tr key={lot.id}>
              <td>{lot.nom}</td>
              <td style={{fontWeight: 700}}>{bidder?.nom}</td>
              <td>{total ? fmt(total.max) : ''}</td>
            </tr>
          ))}
          {winners.length === 0 && (
            <tr>
              <td colSpan={3}>لم يتم تحديد فائزين بعد — يرجى تسجيل العروض وإتمام التقييم.</td>
            </tr>
          )}
        </tbody>
      </table>
      <p style={{textAlign: 'justify', marginTop: '10pt'}}>
        * المتعهدين الذين رست عليهم الاستشارة ملزمون بالحضور إلى المؤسسة من أجل إتمام الإجراءات والتوقيع على الاتفاقية.
      </p>
      <FreeAt />
      <div className="text-center mt-8" style={{fontWeight: 700}}>
        مدير المؤسسة
      </div>
    </Page>
  );
}

/* مستخرج محضر مجلس التربية والتسيير — جلسة تقييم العروض والمنح المؤقت */
export function ConseilExtractDoc() {
  const {state} = useStore();
  const s = state.settings;
  const {president, membres} = state.committee;
  return (
    <>
      <Page>
        <DocHeader />
        <div style={{textAlign: 'left', fontSize: '11pt'}}>السنة الدراسية: {s.annee - 1} / {s.annee}</div>
        <div className="doc-title">مستخرج محضر مجلس التربية والتسيير</div>
        <p>
          تأسيسا على الإعلان رقم: <b>{s.numeroAnnonce > 0 ? `${String(s.numeroAnnonce).padStart(2, '0')}/${s.annee}` : '......../....../../....'}</b>{' '}
          المتعلق بطلب عروض لتموين مطعم المؤسسة بـ:
        </p>
        <ul style={{listStyle: 'none', paddingRight: '14pt'}} className="mb-2">
          {state.lots.map((l) => (
            <li key={l.id} style={{fontSize: '12.5pt'}}>
              - الحصة {String(l.numero).padStart(2, '0')}: عملية تموين المؤسسة بـ {l.nom},
            </li>
          ))}
        </ul>
        <p>
          وفي يوم{' '}
          {s.dateSessionConseil ? (
            <b>{new Date(s.dateSessionConseil).toLocaleDateString('fr-DZ')}</b>
          ) : (
            <span className="doc-fill" style={{minWidth: '22mm'}}>&nbsp;</span>
          )}{' '}
          وعلى الساعة: <span className="doc-fill" style={{minWidth: '14mm'}}>&nbsp;</span>، اجتمع أعضاء مجلس التربية
          والتوجيه برئاسة السيد: <b>{president}</b> باعتباره آمرا بالصرف، لتقييم عروض المتعهدين واختيار ممونين لمطعم
          المؤسسة بالمواد المذكورة أعلاه.
        </p>
        <div style={{fontWeight: 700}} className="mt-2">
          الأعضاء الحاضرون:
        </div>
        <table className="table-doc mt-2">
          <thead>
            <tr>
              <th style={{width: '40%'}}>اللقب و الاســـــــم</th>
              <th style={{width: '28%'}}>الوظيفة</th>
              <th style={{width: '16%'}}>الحضور والغياب</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            {[president, ...membres].map((n, i) => (
              <tr key={i}>
                <td>{n}</td>
                <td>...</td>
                <td>حاضر</td>
                <td> </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{fontWeight: 700}} className="mt-3">
          جـــــدول الأعمــــــال:
        </div>
        <ul style={{paddingRight: '14pt', fontSize: '12.5pt'}}>
          <li>- فتح وتقييم عروض المتعهدين بتموين مطعم المؤسسة.</li>
          <li>- اختيار الممونين للمواد محل الاستشارة.</li>
        </ul>
        <div style={{fontWeight: 700}} className="mt-2">
          المــــداولات:
        </div>
        <p>
          بعد إلقاء الكلمة الترحيبية من طرف السيد مدير المؤسسة و تذكيره بموضوع الجلسة، ذكر عدد العروض المقدمة لكل حصة على
          حدى. شرع أعضاء المجلس في فتح أظرفة المشاركين في عملية التموين، وتم تسجيل العروض المالية:
        </p>
      </Page>
      <Page>
        <DocHeader />
        {state.lots.map((l) => (
          <TableOfLot key={l.id} lot={l} />
        ))}
        <p style={{textAlign: 'justify', marginTop: '10pt'}}>
          وبعد الانتهاء من عملية فتح الأظرفة وتقييم العروض التقنية وتسجيل العروض المالية المقدمة تبين ما يلي:
        </p>
        <p>
          - أسنــــاد تموين مطعم المؤسسة للسنة المالية: <b>{s.annee}</b> إلى المتعهدين المبينين في الجدول أدناه:
        </p>
        <table className="table-doc">
          <thead>
            <tr>
              <th style={{width: '8%'}}>الرقم</th>
              <th style={{width: '32%'}}>العملية</th>
              <th style={{width: '30%'}}>المتعهد الفائز</th>
              <th>المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {state.lots.map((l, i) => {
              const ranked = rankLot(l, state.bidders, state.offers);
              const w = ranked.find((r) => r.rank === 1);
              return (
                <tr key={l.id}>
                  <td>{i + 1}</td>
                  <td>عملية تموين المؤسسة بـ {l.nom}</td>
                  <td style={{fontWeight: 700}}>{w?.bidder.nom ?? ''}</td>
                  <td>{w ? fmt(w.totals.max) : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{marginTop: '10pt'}}>تمت المصادقة على النتائج من طرف أعضاء المجلس دون أي تحفظات.</p>
        <p>
          ر فعت الجلسـة في يومه و على الساعة: <span className="doc-fill" style={{minWidth: '16mm'}}>&nbsp;</span>
        </p>
        <FreeAt />
        <div className="text-center mt-8" style={{fontWeight: 700}}>
          رئيس المؤسسة
        </div>
      </Page>
    </>
  );
}

/* جدول العروض المالية للحصة داخل مستخرج المحضر */
function TableOfLot({lot}: {lot: Lot}) {
  const {state} = useStore();
  const present = state.bidders.filter((b) =>
    state.offers.some((o) => o.bidderId === b.id && o.lotId === lot.id),
  );
  return (
    <>
      <p style={{fontSize: '12.5pt'}}>
        - عملية تموين المؤسسة بـ <b>{lot.nom}</b> (الحصة {String(lot.numero).padStart(2, '0')}):
      </p>
      <table className="table-doc mb-3">
        <thead>
          <tr>
            <th style={{width: '10%'}}>الرقم</th>
            <th style={{width: '45%'}}>المتعهد</th>
            <th style={{width: '30%'}}>العرض المالي (بالأرقام)</th>
            <th>الملف التقني</th>
          </tr>
        </thead>
        <tbody>
          {present.map((b, i) => {
            const o = state.offers.find((x) => x.bidderId === b.id && x.lotId === lot.id);
            const t = offerTotals(lot, o);
            return (
              <tr key={b.id}>
                <td>{i + 1}</td>
                <td style={{textAlign: 'right'}}>{b.nom}</td>
                <td>{fmt(t.max)}</td>
                <td>كامل</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

/* طبق الأصل ورقة «الاعذارات» — إعذار الممون */
export function AzharDoc({lotId}: {lotId: string}) {
  const {state} = useStore();
  const s = state.settings;
  const lot = state.lots.find((l) => l.id === lotId) ?? state.lots[0];
  return (
    <Page>
      <DocHeader />
      <div className="mt-2" style={{fontSize: '13pt'}}>
        <p>
          مدير المؤسسة إلى <span className="doc-fill" style={{minWidth: '55mm'}}>&nbsp;</span>
        </p>
        <p>السيد: ................ ممون المؤسسة بـ: {lot?.nom}</p>
      </div>
      <div className="doc-title">الإعــذار</div>
      <p style={{fontSize: '12.5pt', whiteSpace: 'pre-line'}}>
        {'طبقا لأحكام المرسوم الرئاسي رقم 23-12، مؤرخ في: 18 محرم عام 1445 الموافق 5 غشت سنة 2023.\nطبقا لأحكام المرسوم الرئاسي رقم 15-247، مؤرخ في: 06 ذو الحجة عام 1436 الموافق 16 سبتمبر سنة 2015.'}
      </p>
      <p style={{textAlign: 'justify', marginTop: '6pt'}}>
        واعتمادا على الاتفاقية المبرمة معكم المتعلقة بتموين المؤسسة بـ: <b>{lot?.nom}</b> للسنة المالية: <b>{s.annee}</b>{' '}
        الموقعة بتاريخ: <span className="doc-fill" style={{minWidth: '28mm'}}>&nbsp;</span>
      </p>
      <p style={{textAlign: 'justify'}}>
        وبناء على التقارير المقدمة من المصلحة المكلفة بتسيير المخزونات، تابعنا فحوى التقارير ميدانيا واتضح أنكم تخلون ببعض
        بنود الاتفاقية.
      </p>
      <p style={{textAlign: 'justify'}}>
        ولهذه الأسباب ومن أجلها أوجه إليكم هذا الإعذار الأول لتدارك هذا الخلل المسجل والتزامكم بمحتوى الاتفاقية المبرمة مع
        المؤسسة. وإذا تكرر منكم هذا فإن المؤسسة ستقدم على فسخ الاتفاقية من طرف واحد.
      </p>
      <FreeAt />
      <div className="text-center mt-10" style={{fontWeight: 700}}>
        رئيس المؤسسة
      </div>
    </Page>
  );
}

/* طبق الأصل ورقة «ملف الممون» */
export function FichePrestataireDoc({lotId, bidderId}: {lotId: string; bidderId: string}) {
  const {state} = useStore();
  const s = state.settings;
  const lot = state.lots.find((l) => l.id === lotId) ?? state.lots[0];
  const b = state.bidders.find((x) => x.id === bidderId);
  const rows: [string, string | undefined][] = [
    ['الإسم واللقب', b?.gerant],
    ['رقم السجل التجاري أو بطاقة حرفي', b?.rc],
    ['نوع النشاط', b?.activite],
    ['رقم البطاقة الضريبية', b?.nif],
    ['الرقم الجبائي', b?.nis],
    ['رقم الحساب البنكي', b?.rib],
    ['المؤسسة البنكية', b?.banque],
    ['الوكالة البنكية', b?.agence],
  ];
  return (
    <Page>
      <DocHeader />
      <div style={{textAlign: 'left', fontSize: '11pt'}}>السنة المالية: {s.annee}</div>
      <div className="doc-title">
        ملــــف الممـــــون{lot ? <> — {lot.nom}</> : null}
      </div>
      <table className="table-doc mt-3">
        <tbody>
          {rows.map(([label, val]) => (
            <tr key={label}>
              <th style={{width: '55%'}}>{label}</th>
              <td>{val || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}

/* طبق الأصل ورقة «التفاوض على الاسعار» — محضر التفاوض ثم محضر المراجعة */
export function NegotiationDoc({lotId, bidderId}: {lotId: string; bidderId: string}) {
  const {state} = useStore();
  const s = state.settings;
  const lot = state.lots.find((l) => l.id === lotId) ?? state.lots[0];
  const b = state.bidders.find((x) => x.id === bidderId);
  const dotted = '..........................';
  return (
    <>
      <Page>
        <DocHeader />
        <div style={{textAlign: 'left', fontSize: '11pt'}}>ثانوية / متوسطة: {s.institution}</div>
        <div className="doc-title">محضر التفاوض حول أسعار المواد و الكميات الجديدة غير المدرجة في العقد</div>
        <p>
          بناء على الطلب المقدم من السيد (ة): <span className="doc-fill" style={{minWidth: '40mm'}}>{b?.nom || ''}</span>{' '}
          ممون المؤسسة بمادة: <span className="doc-fill" style={{minWidth: '35mm'}}>{lot?.nom}</span>
        </p>
        <p>
          وذلك إثر الاستشارة التي كان محلها: <span className="doc-fill" style={{minWidth: '35mm'}}>{s.institution}</span>{' '}
          بتاريخ: <span className="doc-fill" style={{minWidth: '22mm'}}>&nbsp;</span>
        </p>
        <p>
          واستنادا إلى المادة ....... من العقد المبرم بين الممون والمؤسســــة بتاريخ:{' '}
          <span className="doc-fill" style={{minWidth: '22mm'}}>&nbsp;</span>
        </p>
        <p>
          تمت عملية التفاوض أسعار بعض المواد الجديدة كما هو مبين في الجدول أدناه بتاريخ:{' '}
          <span className="doc-fill" style={{minWidth: '22mm'}}>&nbsp;</span>
        </p>
        <p>
          <b>ملاحظة:</b> تمت عملية التفاوض بين الآمر بالصرف والممون،
        </p>
        <div className="text-center mt-2 mb-2" style={{fontWeight: 700}}>
          جدول تفصيلي لعملية المراجعة
        </div>
        <table className="table-doc">
          <thead>
            <tr>
              <th style={{width: '8%'}}>الرقم</th>
              <th style={{width: '22%'}}>التعيين</th>
              <th style={{width: '8%'}}>الوحدة</th>
              <th style={{width: '9%'}}>الكميات الدنيا</th>
              <th style={{width: '9%'}}>الكميات القصوى</th>
              <th style={{width: '12%'}}>المبلغ المقترح من الممون</th>
              <th style={{width: '12%'}}>المبلغ المقترح من المصلحة المتعاقدة</th>
              <th>السعر المتفق عليه</th>
            </tr>
          </thead>
          <tbody>
            {(lot?.materiaux ?? []).map((m, i) => (
              <tr key={m.id}>
                <td>{i + 1}</td>
                <td style={{textAlign: 'right'}}>{m.designation}</td>
                <td>{m.unite}</td>
                <td>{fmt(m.qteMin)}</td>
                <td>{fmt(m.qteMax)}</td>
                <td> </td>
                <td> </td>
                <td> </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-14 text-sm">
          <div className="text-center min-w-[40%]">
            <div style={{fontWeight: 700}}>ختم وتوقيع الممون</div>
          </div>
          <div className="text-center min-w-[40%]">
            <div style={{fontWeight: 700}}>تأشيرة الآمر بالصرف</div>
          </div>
        </div>
      </Page>
      <Page>
        <DocHeader />
        <div style={{textAlign: 'left', fontSize: '11pt'}}>ثانوية / متوسطة: {s.institution}</div>
        <div className="doc-title">محضر مراجعة الأسعـــــــــار -2-</div>
        <p>
          بناء على الطلب المقدم من السيد (ة): <span className="doc-fill" style={{minWidth: '40mm'}}>{b?.nom || ''}</span>{' '}
          ممون المؤسسة بمادة: <span className="doc-fill" style={{minWidth: '35mm'}}>{lot?.nom}</span>
        </p>
        <p>
          وذلك إثر الاستشارة التي كان محلها: <span className="doc-fill" style={{minWidth: '35mm'}}>{s.institution}</span>{' '}
          بتاريخ: <span className="doc-fill" style={{minWidth: '22mm'}}>&nbsp;</span>
        </p>
        <p>
          واستنادا إلى المادة 15 من العقد المبرم بين الممون والمؤسســــة بتاريخ:{' '}
          <span className="doc-fill" style={{minWidth: '22mm'}}>&nbsp;</span>
        </p>
        <p>
          تمت عملية مراجعة أسعار بعض المواد كما هو مبين في الجدول أدناه بتاريخ:{' '}
          <span className="doc-fill" style={{minWidth: '22mm'}}>&nbsp;</span>
        </p>
        <p>
          <b>ملاحظة:</b> تمت عملية المراجعة بين الآمر بالصرف والممون للمرة الثانية،
        </p>
        <div className="text-center mt-2 mb-2" style={{fontWeight: 700}}>
          جدول تفصيلي لعملية المراجعة
        </div>
        <table className="table-doc">
          <thead>
            <tr>
              <th style={{width: '8%'}}>الرقم</th>
              <th style={{width: '26%'}}>التعيين</th>
              <th style={{width: '8%'}}>الوحدة</th>
              <th style={{width: '13%'}}>سعر المراجعة 1</th>
              <th style={{width: '13%'}}>عرض الممون</th>
              <th style={{width: '13%'}}>اقتراح المؤسسة</th>
              <th style={{width: '11%'}}>المتفق عليه</th>
              <th>السعر المتفق عليه بالأحرف</th>
            </tr>
          </thead>
          <tbody>
            {(lot?.materiaux ?? []).map((m, i) => (
              <tr key={m.id}>
                <td>{i + 1}</td>
                <td style={{textAlign: 'right'}}>{m.designation}</td>
                <td>{m.unite}</td>
                <td> </td>
                <td> </td>
                <td> </td>
                <td> </td>
                <td> </td>
              </tr>
            ))}
            <tr style={{fontWeight: 700}}>
              <td colSpan={7}>مجموع السعر الوحدوي:</td>
              <td>{dotted}</td>
            </tr>
          </tbody>
        </table>
        <p style={{marginTop: '8pt', fontSize: '12.5pt'}}>
          حدد مجموع السعر الوحدوي بمبلغ قدره: <span className="doc-fill" style={{minWidth: '70mm'}}>&nbsp;</span>
        </p>
        <div className="text-center mt-10 text-sm">
          بــ: {s.commune} في: ...............
        </div>
        <div className="flex justify-between mt-12 text-sm">
          <div className="text-center min-w-[40%]">
            <div style={{fontWeight: 700}}>ختم وتوقيع الممون</div>
            <div className="doc-dotline mt-8" />
          </div>
          <div className="text-center min-w-[40%]">
            <div style={{fontWeight: 700}}>تأشيرة مدير المؤسسة</div>
            <div className="doc-dotline mt-8" />
          </div>
        </div>
      </Page>
    </>
  );
}

/* طبق الأصل ورقة « ملف الترشح 01 » : غلاف + وصف الاستشارة */
export function DossierCandidatureDoc() {
  const {state} = useStore();
  const s = state.settings;
  return (
    <>
      <Page>
        <div className="text-center">
          <div style={{fontWeight: 700}}>الجمهوريــة الجزائريـــة الديمقراطيـــة الشعبيـــــة</div>
          <div>وزارة التربية الوطنية</div>
          <div>مديرية التربية لولاية {s.wilaya}</div>
          <div style={{fontWeight: 700}}>{s.institution}</div>
        </div>
        <div className="text-center" style={{marginTop: '70pt', fontWeight: 700, fontSize: '20pt'}}>
          دفتــر الشــروط
        </div>
        <div className="text-center" style={{marginTop: '60pt', fontWeight: 700, fontSize: '26pt'}}>
          ملف الترشح
        </div>
        <div className="text-center" style={{marginTop: '80pt', fontSize: '12.5pt'}}>
          الملف التقني والمالي — {s.annee}
        </div>
      </Page>
      <Page>
        <DocHeader />
        <p>البرنامج: ميزانية المؤسسة لسنة {s.annee}</p>
        <p>
          موضوع الاستشارة: تمويـــن مطعـم <b>{s.institution}</b> بـ:
        </p>
        <ul style={{listStyle: 'none', paddingRight: '14pt'}} className="mb-3">
          {state.lots.map((l) => (
            <li key={l.id} style={{fontSize: '12.5pt'}}>
              الحصة {String(l.numero).padStart(2, '0')}: {l.nom}
            </li>
          ))}
        </ul>
        <p>
          الاستشارة: طبقا لأحكام القانون رقم 23-12 المؤرخ في 18 محرم عام 1445 الموافق 5 غشت سنة 2023 يحدد القواعد العامة
          المتعلقة بالصفقات العمومية، والمرسوم الرئاسي رقم 15/247 المؤرخ في 16 سبتمبر 2015 المتضمن تنظيم الصفقات العمومية
          وتفويضات المرفق العام.
        </p>
        <p className="mt-6">
          الهــاتف / فاكس: <span className="doc-fill" style={{minWidth: '45mm'}}>&nbsp;</span>
        </p>
      </Page>
    </>
  );
}
