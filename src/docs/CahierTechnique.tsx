import {useStore} from '../store';
import {type ArticleItem} from '../types';
import {Article, DocHeader, Page} from './primitives';

const SECTION_ORDER: ArticleItem['section'][] = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
const SECTION_TITLES: Record<string, string> = {
  أ: 'أ. تعليمة للعارضين',
  ب: 'ب. ملف الاستشارة',
  ج: 'ج. تحضير وإعداد العروض',
  د: 'د. إيداع العروض',
  'هـ': 'هـ. فتح الأظرفة وتقييم العروض',
  و: 'و. منح الاتفاقية',
};

function ArticleItemView({a}: {a: ArticleItem}) {
  return <Article titre={a.titre} corps={a.corps.split(/\n{2,}/)} />;
}

/** دفتر الشروط — العرض التقني: غلاف + فهرس + التصريح بالاكتتاب + التعليمات العامة */
export function CahierTechniqueDoc() {
  const {state} = useStore();
  const s = state.settings;
  const articles = state.articles ?? [];
  const bySection = (sec: ArticleItem['section']) => articles.filter((a) => a.section === sec);

  return (
    <>
      {/* الغلاف */}
      <Page>
        <DocHeader />
        <div className="text-center" style={{marginTop: '60pt', fontWeight: 700, fontSize: '26pt'}}>
          دفتــر الشــروط
        </div>
        <div className="text-center" style={{marginTop: '18pt', fontWeight: 700, fontSize: '18pt'}}>
          العرض التقني
        </div>
        <div className="text-center mt-10" style={{fontSize: '14pt'}}>
          البرنامج: ميزانية المؤسسة لسنة {s.annee}
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

      {/* الفهرس */}
      <Page>
        <div className="doc-title">الفهــــرس</div>
        {SECTION_ORDER.map((sec) => {
          const arts = bySection(sec);
          if (arts.length === 0) return null;
          return (
            <div key={sec} className="mb-3 mt-2">
              <div style={{fontWeight: 700}}>{SECTION_TITLES[sec]}</div>
              {arts.map((a) => (
                <div key={a.id} className="pr-6 text-sm">
                  {a.titre}
                </div>
              ))}
            </div>
          );
        })}
      </Page>

      {/* التصريح بالاكتتاب */}
      <Page>
        <div className="text-center leading-snug">
          <div style={{fontWeight: 700}}>الجمهورية الجزائرية الديمقراطية الشعبية</div>
        </div>
        <div className="doc-title mt-2">التصريح بالاكتتاب</div>
        <div style={{fontSize: '12.5pt'}} className="space-y-2">
          <p>
            1/ تحديد المصلحة المتعاقدة: <b>{s.institution}</b>
          </p>
          <p>
            2/ اسم ولقب الممضي على الصفقة العمومية: <b>{s.directeur}</b> مدير {s.institution}
          </p>
          <p>3/ تقديم المتعهد وتعيين رئيس التجمع، في حالة التجمع:</p>
          <p>تعيين المتعهد (إعادة كتابة تسمية الشركة كما هو مبين في التصريح بالترشح):</p>
          <p>متعهد واحد:</p>
          <p>
            تسمية الشركة:{' '}
            <span className="doc-fill" style={{minWidth: '90mm'}}>
              &nbsp;
            </span>
          </p>
          <p>
            الولاية أو الولايات التي تتم فيها تنفيذ الخدمات موضوع الاتفاقية:{' '}
            <span className="doc-fill" style={{minWidth: '60mm'}}>
              &nbsp;
            </span>
          </p>
          <p>يقدم هذا التصريح بالاكتتاب في إطار صفقة عمومية محصصة: لا / نعم</p>
          <p>
            في حالة الإيجاب، أذكر أرقام الحصص وكذا تسمياتها:{' '}
            <span className="doc-fill" style={{minWidth: '70mm'}}>
              &nbsp;
            </span>
          </p>
          <p>4/ موضوع التصريح بالاكتتاب: تموين مطعم {s.institution} — السنة المالية {s.annee}</p>
          <p>5/ التزام المتعهد:</p>
          <p style={{textAlign: 'justify'}}>
            بعد الاطلاع على الوثائق المكونة للصفقة المنصوص عليها في دفتر الشروط وطبقاً لشروطها وأحكامها،
            الممضي يلتزم بناءً على عرضه ولحسابه، تسليم اللوازم المطلوبة أو تنفيذ الخدمات المطلوبة وبالأسعار
            المذكورة في رسالة العرض طيلة السنة المالية {s.annee}.
          </p>
          <p>
            تسمية الشركة:{' '}
            <span className="doc-fill" style={{minWidth: '90mm'}}>
              &nbsp;
            </span>{' '}
            — عنوان الشركة:{' '}
            <span className="doc-fill" style={{minWidth: '60mm'}}>
              &nbsp;
            </span>
          </p>
          <p>6/ إمضاء العرض من طرف المتعهد:</p>
          <p style={{textAlign: 'justify'}}>
            أؤكد، تحت طائلة فسخ الصفقة بقوة القانون أو وضعها تحت التسيير المباشر للإدارة على حساب الشركة، أن
            المؤسسة المذكورة لا تنطبق عليها الممنوعات المنصوص عليها في التشريع والتنظيم المعمول بهما. أشهد أن
            المعلومات المذكورة أعلاه صحيحة تحت طائلة التعرض لتطبيق العقوبات المنصوص عليها في المادة 216 من
            الأمر 66-156 المؤرخ في 8 يونيو سنة 1966 والمتضمن قانون العقوبات، المعدل والمتمم.
          </p>
          <div className="grid grid-cols-3 gap-2 text-sm mt-4 text-center">
            <div>
              اسم ولقب وصفة الممضي
              <div className="doc-dotline mt-6" />
            </div>
            <div>
              مكان وتاريخ الإمضاء
              <div className="doc-dotline mt-6" />
            </div>
            <div>
              الإمضاء
              <div className="doc-dotline mt-6" />
            </div>
          </div>
        </div>
      </Page>

      {/* التعليمات العامة للمتعهدین — المواد القابلة للتعديل */}
      <Page>
        <div className="doc-title">التعليمات العامة للمتعهدین (العرض التقني)</div>
        <div style={{fontSize: '12.5pt'}}>
          {SECTION_ORDER.map((sec) => {
            const arts = bySection(sec);
            if (arts.length === 0) return null;
            return (
              <div key={sec}>
                <div style={{fontWeight: 700}}>{SECTION_TITLES[sec]}</div>
                {arts.map((a) => (
                  <ArticleItemView key={a.id} a={a} />
                ))}
              </div>
            );
          })}
          <div className="mt-8 text-center" style={{fontWeight: 700, fontSize: '14pt'}}>
            قُرِئ وقُبِل
          </div>
          <div className="text-sm mt-2">
            حرر بـ: .............................. في: ..............................
          </div>
          <div className="text-center mt-6" style={{fontWeight: 700}}>
            المتعهـــــد
          </div>
          <div className="text-center text-xs">(إسم وصفة الموقع وختم المتعهد)</div>
        </div>
      </Page>
    </>
  );
}
