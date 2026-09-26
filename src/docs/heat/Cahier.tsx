import {useHeat} from '../../heatStore';
import {HeatHeader, HPage, HSign} from './primitives';

/** دفتر الشروط — المواد القابلة للتعديل (تعليمات للعارضين + عقد + دفتر التعليمات الخاصة) */
const SECTION_TITLES: Record<string, string> = {
  inst: 'أولاً: التعليمات الموجهة للعارضين',
  ccap: 'ثانياً: العقد (الشروط الإدارية العامة)',
  cpc: 'ثالثاً: دفتر التعليمات الخاصة',
};

export function HeatCahier() {
  const {state} = useHeat();
  const s = state.settings;
  const arts = state.articles ?? [];
  const sections: ('inst' | 'ccap' | 'cpc')[] = ['inst', 'ccap', 'cpc'];

  return (
    <>
      {/* الغلاف */}
      <HPage>
        <HeatHeader />
        <div className="text-center" style={{marginTop: '60pt', fontWeight: 700, fontSize: '26pt'}}>
          دفتر الشروط
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
        const list = arts.filter((a) => a.section === sec);
        if (list.length === 0) return null;
        return (
          <HPage key={sec}>
            <div className="doc-title" style={{fontSize: '15pt'}}>
              {SECTION_TITLES[sec]}
            </div>
            {sec === 'inst' && (
              <p style={{textAlign: 'justify', fontSize: '12pt'}}>
                لمشروع: {s.projet} — {s.institutionShort}
              </p>
            )}
            {list.map((a) => (
              <div key={a.id} className="doc-art">
                <div style={{fontWeight: 700}}>{a.titre}</div>
                {a.corps
                  .split(/\n+/)
                  .filter((p) => p.trim())
                  .map((p, i) => (
                    <p
                      key={i}
                      style={{whiteSpace: 'pre-line', textAlign: 'justify', fontSize: '11.5pt', lineHeight: 1.55}}
                    >
                      {p}
                    </p>
                  ))}
              </div>
            ))}
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
          </HPage>
        );
      })}
    </>
  );
}
