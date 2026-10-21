import {Fragment} from 'react';
import {useHeat} from '../../heatStore';
import {HeatHeader, HPage, HSign} from './primitives';
import {CorpsLines, splitCorps} from './corps';
import type {HeatArticle} from '../../types';

type CahierSection = 'inst' | 'ccap' | 'cpc';

/** دفتر الشروط — المواد القابلة للتعديل (تعليمات للعارضين + عقد + دفتر التعليمات الخاصة) */
const SECTION_TITLES: Record<string, string> = {
  inst: 'أولاً: التعليمات الموجهة للعارضين',
  ccap: 'ثانياً: العقد (الشروط الإدارية العامة)',
  cpc: 'ثالثاً: دفتر التعليمات الخاصة',
};

export function HeatCahier({only, coverTitle}: {only?: CahierSection[]; coverTitle?: string}) {
  const {state} = useHeat();
  const s = state.settings;
  const arts = state.articles ?? [];
  const sections: CahierSection[] = only ?? ['inst', 'ccap', 'cpc'];
  const standalone = (sec: CahierSection) => !!only && only.length === 1 && only[0] === sec;

  return (
    <>
      {/* الغلاف */}
      <HPage>
        <HeatHeader />
        <div className="text-center" style={{marginTop: '60pt', fontWeight: 700, fontSize: '26pt'}}>
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
        const full = !only;
        const list = arts.filter((a) => a.section === sec && (!full || (a.corps ?? '').trim() !== ''));
        if (list.length === 0) return null;
        const hasChunks = (a: HeatArticle) => splitCorps(a.corps ?? '').length > 1;
        return (
          <Fragment key={sec}>
            <HPage>
              <div className="doc-title" style={{fontSize: '15pt'}}>
                {SECTION_TITLES[sec]}
              </div>
              {sec === 'inst' && (
                <p style={{textAlign: 'justify', fontSize: '12pt'}}>
                  لمشروع: {s.projet} — {s.institutionShort}
                </p>
              )}
              {list.map((a) => {
                if (hasChunks(a)) return null;
                return (
                  <div key={a.id} id={a.id} className="doc-art">
                    <div style={{fontWeight: 700}}>{a.titre}</div>
                    <CorpsLines text={a.corps ?? ''} s={s} />
                  </div>
                );
              })}
              {sec === 'inst' && (
                <>
                  <div className="mt-8 text-center" style={{fontWeight: 700, fontSize: '14pt'}}>
                    (قُرِئ وقُبِل) مكتوبة بخط اليد
                  </div>
                  <div className="text-sm mt-2">
                    حرر بـ .................. في .....................
                  </div>
                  <HSign right="المتعهد" />
                </>
              )}
              {standalone(sec) && (sec === 'ccap' || sec === 'cpc') && (
                <>
                  <div className="text-sm mt-10">
                    حرر بـ .................. في .....................
                  </div>
                  {sec === 'ccap' ? (
                    <HSign right="صاحب المشروع" left="المقاولة المتعاملة" />
                  ) : (
                    <HSign right="صاحب المشروع" />
                  )}
                </>
              )}
            </HPage>
            {/* صفحات مقطوعة: بداية المواد + غلاف الجمهورية — صفحات مستقلة */}
            {list.map((a) =>
              hasChunks(a)
                ? splitCorps(a.corps ?? '').map((c, ci) => (
                    <HPage key={`${a.id}#${ci}`} id={`c-${sec}-${ci}`}>
                      <div className="doc-art">
                        {ci === 0 && <div style={{fontWeight: 700}}>{a.titre}</div>}
                        <CorpsLines text={c} s={s} />
                      </div>
                    </HPage>
                  ))
                : null,
            )}
          </Fragment>
        );
      })}
    </>
  );
}
