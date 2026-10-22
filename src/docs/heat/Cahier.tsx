import {Fragment} from 'react';
import {useHeat} from '../../heatStore';
import {HeatHeader, HPage, HSign, RepublicEmblem} from './primitives';
import {CorpsLines, splitCorps} from './corps';
import type {HeatArticle} from '../../types';

type CahierSection = 'inst' | 'ccap' | 'cpc';

/** دفتر الشروط — المواد القابلة للتعديل (تعليمات للعارضين + عقد + دفتر التعليمات الخاصة) */
const SECTION_TITLES: Record<string, string> = {
  inst: 'أولاً: التعليمات الموجهة للعارضين',
  ccap: 'ثانياً: العقد (الشروط الإدارية العامة)',
  cpc: 'ثالثاً: دفتر التعليمات الخاصة',
};

/** نهاية كتلة توقيع: «(قرئ وقبل) ... حرر ب ... المتعهد» */
const SIGN_END = /^(المتعهد|المتعههد|المتهعد|إمضاء ممثل المصلحة المتعاقدة)/;

/** آخر سطر جسد المادة (أو آخر مقطع منها) — للكشف عن نهايات كتل التوقيع */
function corpsTail(a: HeatArticle): string {
  const ch = splitCorps(a.corps ?? '');
  const t = ch.length > 1 ? ch[ch.length - 1] : (a.corps ?? '');
  const lines = t.split('\n').map((x) => x.trim()).filter(Boolean);
  return lines.length ? lines[lines.length - 1].replace(/ـ/g, '') : '';
}

/** إعادة ترقيم عنوان مادة: «المادة N...» → رقم متتالٍ */
function renum(titre: string, n: number | undefined): string {
  if (!n) return titre;
  const m = titre.match(/^\s*المادة\s*\d*\s*:*\s*([\s\S]*)$/);
  if (!m) return titre;
  return `المادة ${String(n).padStart(2, '0')}: ${m[1].trim()}`;
}

export function HeatCahier({only, coverTitle}: {only?: CahierSection[]; coverTitle?: string}) {
  const {state} = useHeat();
  const s = state.settings;
  const arts = state.articles ?? [];
  const sections: CahierSection[] = only ?? ['inst', 'ccap', 'cpc'];
  const standalone = (sec: CahierSection) => !!only && only.length === 1 && only[0] === sec;
  const full = !only;

  // ترقيم متتالٍ للمواد عبر كل أقسام الدفتر (يبدأ من 01 لكل كتاب مستقل)
  const numbers = new Map<string, number>();
  let anum = 0;
  sections.forEach((sec) => {
    arts
      .filter((a) => a.section === sec && (!full || (a.corps ?? '').trim() !== ''))
      .forEach((a) => numbers.set(a.id, ++anum));
  });

  return (
    <>
      {/* الغلاف */}
      <HPage>
        <HeatHeader />
        <div className="text-center" style={{marginTop: '40pt', fontWeight: 700, fontSize: '26pt'}}>
          {coverTitle ?? 'دفتر الشروط'}
        </div>
        <div className="text-center" style={{marginTop: '14pt', fontWeight: 700, fontSize: '16pt'}}>
          أشغال التدفئة المركزية ولواحقها
        </div>
        <div className="text-center mt-10" style={{fontSize: '13pt'}}>
          استشارة رقم: {s.numeroConsultation}
        </div>
        <div className="text-center mt-6" style={{fontSize: '13pt'}}>
          المؤسسة: {s.institution}
        </div>
        <div className="text-center mt-10" style={{fontSize: '12.5pt'}}>
          شروط التأهيل: ميدان {s.domaine} — درجة {s.degre} — نشاط {s.activite}
        </div>
      </HPage>

      {sections.map((sec) => {
        // في دفتر الشروط الكامل: حذف المواد الفارغة (بدون محتوى)
        const list = arts.filter((a) => a.section === sec && (!full || (a.corps ?? '').trim() !== ''));
        if (list.length === 0) return null;
        const hasChunks = (a: HeatArticle) => splitCorps(a.corps ?? '').length > 1;

        // تقسيم القسم إلى مجموعات صفحات: مادة تنتهي بتوقيع «قرئ وقبل/المتعهد»
        // → ما يليها يبدأ في صفحة موالية
        const groups: HeatArticle[][] = [];
        let cur: HeatArticle[] = [];
        list.forEach((a) => {
          cur.push(a);
          if (SIGN_END.test(corpsTail(a))) {
            groups.push(cur);
            cur = [];
          }
        });
        if (cur.length) groups.push(cur);

        const Art = ({a}: {a: HeatArticle}) => (
          <div key={a.id} id={a.id} className="doc-art">
            <div style={{fontWeight: 700}}>{renum(a.titre, numbers.get(a.id))}</div>
            <CorpsLines text={a.corps ?? ''} s={s} />
          </div>
        );

        // كتلة التوثيق الختامية (قرئ وقبل / حرر ب / المتعهد) — دائماً في صفحة مستقلة نهاية القسم
        const instSign = sec === 'inst' && (
          <>
            <div className="mt-8 text-center" style={{fontWeight: 700, fontSize: '14pt'}}>
              (قُرِئ وقُبِل) مكتوبة بخط اليد
            </div>
            <div className="text-center text-sm mt-2">حرر بـ .................. في .....................</div>
            <HSign right="المتعهد" />
          </>
        );
        const standaloneSign = standalone(sec) && (sec === 'ccap' || sec === 'cpc') && (
          <>
            <div className="text-center text-sm mt-10">حرر بـ .................. في .....................</div>
            {sec === 'ccap' ? (
              <HSign right="صاحب المشروع" left="المقاولة المتعاملة" />
            ) : (
              <HSign right="صاحب المشروع" />
            )}
          </>
        );
        const signBlock = (
          <>
            {instSign}
            {standaloneSign}
          </>
        );
        // صفحة التوثيق لا تُستكمل إلا عند وجود كتلة توثيق فعلياً لهذا القسم
        const hasSign = sec === 'inst' || (standalone(sec) && (sec === 'ccap' || sec === 'cpc'));

        return (
          <Fragment key={sec}>
            {groups.map((g, gi) => {
              const flow = g.filter((a) => !hasChunks(a));
              if (gi === 0 && flow.length === 0) return null;
              return (
                <HPage key={`${sec}-g${gi}`} id={`sec-${sec}-${gi}`}>
                  {gi === 0 && (
                    <>
                      <div className="doc-title" style={{fontSize: '15pt'}}>
                        {SECTION_TITLES[sec]}
                      </div>
                      {sec === 'inst' && (
                        <p style={{textAlign: 'justify', fontSize: '12pt'}}>
                          لمشروع: {s.projet} — {s.institutionShort}
                        </p>
                      )}
                    </>
                  )}
                  {flow.map((a) => (
                    <Art key={a.id} a={a} />
                  ))}
                </HPage>
              );
            })}
            {/* صفحات مقطوعة: بداية المواد + غلاف الجمهورية — صفحات مستقلة */}
            {list.map((a) =>
              hasChunks(a)
                ? splitCorps(a.corps ?? '').map((c, ci) => (
                    <HPage key={`${a.id}#${ci}`} id={`c-${sec}-${ci}`}>
                      <div className="doc-art">
                        {ci === 0 && <div style={{fontWeight: 700}}>{renum(a.titre, numbers.get(a.id))}</div>}
                        <CorpsLines text={c} s={s} />
                      </div>
                    </HPage>
                  ))
                : null,
            )}
            {/* صفحة التوثيق الختامية: قرئ وقبل / حرر ب / المتعهد — في منتصف الصفحة */}
            {hasSign && <HPage id={`sec-${sec}-sign`}>{signBlock}</HPage>}
          </Fragment>
        );
      })}
    </>
  );
}
