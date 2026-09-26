import {useStore} from '../store';
import {DocHeader, FreeAt, Page} from './primitives';

export function AnnonceDoc() {
  const {state} = useStore();
  const s = state.settings;
  return (
    <Page>
      <DocHeader />

      <div className="doc-title" style={{marginTop: '14pt'}}>
        إعلان عن استشــــارة رقم: {s.numeroAnnonce} / {s.annee}
      </div>

      <p>
        يعلن السيد مدير <b>{s.institution}</b> عن تنظيم استشارة متضمنة الحصص الآتية:
      </p>

      <table className="table-doc mt-3">
        <thead>
          <tr>
            <th style={{width: '12%'}}>الحصة</th>
            <th>الموضوع</th>
          </tr>
        </thead>
        <tbody>
          {state.lots.map((l) => (
            <tr key={l.id}>
              <td>الحصة {String(l.numero).padStart(2, '0')}</td>
              <td>عملية تموين المؤسسة بـ: {l.nom}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4" style={{textAlign: 'justify'}}>
        فعلى التجار الراغبين في المشاركة، التقدم إلى المؤسسة لسحب دفتر الشروط، حيث يتكون ملف الاستشارة من
        الوثائق التنظيمية السارية المفعول ويجب أن تشتمل التعهدات على ملف الترشح وعرض تقني وعرض مالي مفصل
        كالآتي:
      </p>

      <div className="mt-3" style={{fontWeight: 700}}>
        ملف الترشح في ظرف يتضمن ما يأتي: (تكتب العبارة على الغلاف الخارجي للعملية ويؤشر)
      </div>
      <ol style={{paddingRight: '18pt', fontSize: '12.5pt'}}>
        <li>تصريح بالترشح.</li>
        <li>التصريح بالنزاهة حسب النموذج المرفق (ممضي ومختوم).</li>
        <li>السجل التجاري في الاختصاص حسب دفتر الشروط.</li>
        <li>الرقم الجبائي (نسخة مصادق عليها).</li>
        <li>شهادة أداء المستحقات CASNOS - CNAS (نسخة مصادق عليها).</li>
        <li>كشف الضرائب أقل من ثلاثة أشهر مصفى (نسخة أصلية أو نسخة مصادق عليها).</li>
        <li>شهادة السوابق العدلية (نسخة أصلية أو نسخة مصادق عليها).</li>
        <li>نسخة من بطاقة التعريف الوطنية.</li>
        <li>صك بنكي مشطب.</li>
        <li>نسخ عن البطاقات الرمادية للعربات المستعملة في النشاط.</li>
        <li>شهادات التعامل مع المؤسسات سابقاً (إن وجدت).</li>
      </ol>

      <div className="mt-3" style={{fontWeight: 700}}>
        عرض تقني في ظرف يتضمن ما يأتي: (تكتب العبارة على الغلاف الخارجي للعملية ويؤشر)
      </div>
      <ol style={{paddingRight: '18pt', fontSize: '12.5pt'}}>
        <li>التصريح بالاكتتاب حسب النموذج المرفق (ممضي ومختوم).</li>
        <li>التعليمات العامة للمتعهدین حسب النموذج المرفق (ممضي ومختوم).</li>
      </ol>

      <div className="mt-3" style={{fontWeight: 700}}>
        عرض مالي في ظرف يتضمن ما يأتي: (تكتب العبارة على الغلاف الخارجي للعملية ويؤشر)
      </div>
      <ol style={{paddingRight: '18pt', fontSize: '12.5pt'}}>
        <li>رسالة التعهد حسب النموذج المرفق (ممضي ومختوم).</li>
        <li>جدول الأسعار الوحدوية (ممضي ومختوم).</li>
      </ol>

      <p className="mt-4" style={{textAlign: 'justify'}}>
        تودع العروض لدى أمانة مدير المؤسسة في ظرف مبهم لا يحمل إلا العبارة التالية موجهة إلى السيد مدير{' '}
        <b>{s.institution}</b>، في آخر أجل لإيداع العروض الموافق لـ:{' '}
        <b>{s.dateDepot ? new Date(s.dateDepot).toLocaleDateString('fr-DZ') : '....../......'}</b> قبل الساعة
        الحادية عشرة صباحاً، ويحمل الظرف الخارجي العبارة التالية:
      </p>
      <p className="text-center" style={{fontWeight: 700, fontSize: '14pt'}}>
        « استشارة لا يفتح »
      </p>
      <p className="mt-2" style={{textAlign: 'justify'}}>
        عملية تموين المؤسسة بـ:{' '}
        <b>{state.lots.map((l) => l.nom).join(' و')}</b> — السنة المالية: <b>{s.annee}</b>
      </p>
      <p className="mt-2" style={{textAlign: 'justify'}}>
        يتم فتح العروض المقدمة بمقر المؤسسة في آخر يوم الموافق لتاريخ آخر يوم إيداع العروض على الساعة
        الحادية عشرة صباحاً (11:00)، ويعتبر هذا الإعلان بمثابة دعوة للمتعهدین لحضور عملية فتح الأظرفة.
      </p>

      <FreeAt />
      <div className="text-center mt-8" style={{fontWeight: 700}}>
        مدير المؤسسة
      </div>
    </Page>
  );
}
