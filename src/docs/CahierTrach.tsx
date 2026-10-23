import {useStore} from '../store';
import {intToArabicWords} from '../tafqit';
import {DocHeader, Page} from './primitives';
import {CandidatureDoc} from './Candidature';

/*
 * دفتر الشروط — الجزء الأول: ملف الترشح
 * غلاف + لائحة محتويات ملف الترشح + نموذج التصريح بالترشح (كامل)
 */

/** لائحة الوثائق الواجب تقديمها في ملف الترشح */
const TRACH_DOCS = [
  'طلب الترشح موجه إلى صاحب الصلاحية (مدير المؤسسة).',
  'التصريح بالترشح (النموذج المرفق في هذا الدفتر).',
  'التصريح بالنزاهة طبقاً للمواد 63 و64 من القانون 23-12.',
  'نسخة من السجل التجاري أو مستخرج حديث عنه.',
  'التصريح الجبائي (الطائد الجبائي) للسنة الجارية.',
  'لائحة المراجع: الصفقات المنجزة خلال السنوات الأخيرة مع ما يثبتها (استشهادات).',
  'القدرات الفنية والتقنية: الموارد البشرية والمعدات والتجهيزات.',
  'بطاقة التعريف الوطنية ممضية ومصدقة من ممضي التصريح بالترشح.',
];

export function CahierTrachDoc() {
  const {state} = useStore();
  const s = state.settings;

  return (
    <>
      {/* الغلاف */}
      <Page>
        <DocHeader />
        <div className="text-center" style={{marginTop: '60pt', fontWeight: 700, fontSize: '26pt'}}>
          دفتــر الشــروط
        </div>
        <div className="text-center" style={{marginTop: '18pt', fontWeight: 700, fontSize: '18pt'}}>
          ملف الترشح (الملف الإداري)
        </div>
        <div className="text-center mt-3" style={{fontSize: '12pt', fontWeight: 700}}>
          الجزء الأول من ثلاثة
        </div>
        <div className="text-center mt-10" style={{fontSize: '14pt'}}>
          البرنامج: ميزانية المؤسسة لسنة {s.annee}
        </div>
        <div className="text-center mt-2" style={{fontSize: '13pt'}}>
          مدة المشروع:{' '}
          <b>
            {s.dureeJours} يوماً — {intToArabicWords(s.dureeJours)}
          </b>
        </div>
        <div className="mt-6" style={{fontSize: '13.5pt'}}>
          <div style={{fontWeight: 700}}>
            موضوع الاستشارة: تمويـــن مطعـم {s.institution} بـ:
          </div>
          <ol className="mt-2" style={{paddingRight: '20pt'}}>
            {state.lots.map((l) => (
              <li key={l.id}>
                الحصة {String(l.numero).padStart(2, '0')}: {l.nom}.
              </li>
            ))}
          </ol>
        </div>
        <div className="text-center mt-12" style={{fontWeight: 700, fontSize: '16pt'}}>
          الاستشارة
        </div>
        <p className="mt-4" style={{textAlign: 'justify', fontSize: '12pt'}}>
          طبقاً لأحكام القانون رقم 23-12 المؤرخ في 18 محرم عام 1445 الموافق 5 غشت سنة 2023 يحدد القواعد
          العامة المتعلقة بالصفقات العمومية والمرسوم الرئاسي رقم 15/247 المؤرخ في 16 سبتمبر 2015 المتضمن
          تنظيم الصفقات العمومية وتفويضات المرفق العام.
        </p>
        <div className="text-left text-xs" style={{marginTop: '40pt'}}>
          الهاتف / فاكس: ..........................
        </div>
      </Page>

      {/* لائحة محتويات ملف الترشح */}
      <Page>
        <div className="doc-title">لائحة محتويات ملف الترشح</div>
        <p style={{fontSize: '12.5pt', textAlign: 'justify'}}>
          يقدم كل عارض ملف ترشح يضم الوثائق المذكورة أدناه، ويودع في الظرفة المخصصة للترشح في آجال قبول
          العروض، وأي ملف غير كامل يجري استبعاده.
        </p>
        <ol className="mt-4 space-y-3" style={{fontSize: '12.5pt', paddingRight: '22pt'}}>
          {TRACH_DOCS.map((t, i) => (
            <li key={i} style={{textAlign: 'justify'}}>
              {t}
            </li>
          ))}
        </ol>
        <div className="mt-8" style={{fontSize: '12.5pt'}}>
          <p>
            تاريخ الإعلان عن الاستشارة: <b>{s.dateAnnonce || '..............................'}</b>
          </p>
          <p className="mt-1">
            آخر أجل لإيداع العروض:{' '}
            <b>{s.dateDepot || '..............................'}</b> في الساعة{' '}
            <b>{s.heureDepot}</b>.
          </p>
          <p className="mt-1">
            تاريخ فتح الأظرفة: <b>{s.dateOuverture || '..............................'}</b> في الساعة{' '}
            <b>{s.heureOuverture}</b>.
          </p>
        </div>
        <div className="mt-10 text-sm">
          حرر بـ: .............................. في: ..............................
        </div>
      </Page>

      {/* نموذج التصريح بالترشح — كامل الصفحات */}
      <CandidatureDoc />

      {/* خانة التصريح بالنزاهة — يُستكمل من وثيقة «التصريح بالنزاهة» بحسب العارض */}
      <Page>
        <div className="doc-title">التصريح بالنزاهة</div>
        <p style={{fontSize: '12.5pt', textAlign: 'justify'}} className="mt-2">
          يتقدم كلا عارض الاتفاقية المؤقتة أو النهائية، بصفته شخصاً ذا صفة قانونية، بتصريح بالنزاهة وفق
          النموذج المقدر من الإدارة، سواء تقدم منفرداً أو على شكل مجموعة أو اتحاد اقتصادي.
        </p>
        <p style={{fontSize: '12.5pt', textAlign: 'justify'}} className="mt-3">
          يثبت هذا التصريح، تحت طائلة الاستبعاد من الإكتراء، عدم استفادة العارض من أي منع للتعاقد مع
          الإدارة وفقاً للمواد 63 و64 من القانون 23-12 المشار إليه أعلاه.
        </p>
        <div className="mt-10 text-sm">
          حرر بـ: .............................. في: ..............................
        </div>
        <div className="text-center mt-10" style={{fontWeight: 700}}>
          الممضي على التصريح بالنزاهة
        </div>
        <div className="text-center text-xs">(إسم وصفة الموقع وختم العارض)</div>
      </Page>
    </>
  );
}
