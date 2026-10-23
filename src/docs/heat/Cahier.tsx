import {useLayoutEffect, useRef, useState, useEffect} from 'react';
import {useHeat} from '../../heatStore';
import {usePrint} from '../../printSettings';
import {HeatHeader, HPage, HSign} from './primitives';
import {FlowSlot, type FlowUnit} from '../flow';
import {CorpsLines, splitCorps} from './corps';
import type {HeatArticle} from '../../types';

type CahierSection = 'inst' | 'ccap' | 'cpc';

/** دفتر الشروط — المواد القابلة للتعديل (تعليمات للعارضين + عقد + دفتر التعليمات الخاصة) */
const SECTION_TITLES: Record<string, string> = {
  inst: 'أولاً: التعليمات الموجهة للعارضين',
  ccap: 'ثانياً: العقد (الشروط الإدارية العامة)',
  cpc: 'ثالثاً: دفتر التعليمات الخاصة',
};

/** نهاية كتلة توقيع: «(قرئ وقبل) ... حرر ب ... المتعهد/المعهد/إمضاء ممثل المصلحة المتعاقدة» */
const SIGN_END =
  /^(المتعهد|المتعههد|المتهعد|المعهد|المعههد|إمضاء ممثل المصلحة المتعاقدة|إمضاء ممثل المعهد)/;

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
  const m = titre.match(/^\s*المادة\s*\d*\s*:*\\s*([\s\S]*)$/);
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
  const {settings: printSettings} = usePrint();

  // ترقيم متتالٍ للمواد عبر كل أقسام الدفتر (يبدأ من 01 لكل كتاب مستقل)
  const numbers = new Map<string, number>();
  let anum = 0;
  sections.forEach((sec) => {
    arts
      .filter((a) => a.section === sec && (!full || (a.corps ?? '').trim() !== ''))
      .forEach((a) => numbers.set(a.id, ++anum));
  });

  // إعادة القياس بعد تحميل الخطوط (الأرتفاع يتغير)
  const [, setFontTick] = useState(0);
  useEffect(() => {
    try {
      (document as Document & {fonts?: {ready: Promise<unknown>}}).fonts?.ready.then(() => setFontTick((v) => v + 1));
    } catch {
      /* تجاهل */
    }
  }, []);

  // بناء وحدات التدفق — بنفس ترتيب العرض القديم: عنوان القسم + صفحات المواد التدفقية
  // (مجمّعة حسب كتل التوقيع) ثم صفحات المواد المقطوعة ثم كتلة التوثيق الختامية
  const units: FlowUnit[] = [];
  sections.forEach((sec) => {
    const list = arts.filter((a) => a.section === sec && (!full || (a.corps ?? '').trim() !== ''));
    if (list.length === 0) return;
    const hasChunks = (a: HeatArticle) => splitCorps(a.corps ?? '').length > 1;

    // مجموعات المواد التدفقية: مادة تنتهي بتوقيع «قرئ وقبل/المتعهد» → ما بعدها صفحة موالية
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

    // عنوان القسم (فقط عند وجود مواد تدفقية — كما في السابق)
    if (groups[0]?.some((a) => !hasChunks(a))) {
      units.push({
        key: `t-${sec}`,
        brkAfter: false,
        node: (
          <div id={`sec-${sec}-0`}>
            <div className="doc-title" style={{fontSize: '15pt'}}>
              {SECTION_TITLES[sec]}
            </div>
            {sec === 'inst' && (
              <p style={{textAlign: 'justify', fontSize: '12pt'}}>
                لمشروع: {s.projet} — {s.institutionShort}
              </p>
            )}
          </div>
        ),
      });
    }
    // المواد التدفقية — بترتيب المجموعات
    groups.forEach((g) =>
      g
        .filter((a) => !hasChunks(a))
        .forEach((a) =>
          units.push({
            key: a.id,
            brkAfter: SIGN_END.test(corpsTail(a)),
            node: (
              <div id={a.id} className="doc-art">
                <div style={{fontWeight: 700}}>{renum(a.titre, numbers.get(a.id))}</div>
                <CorpsLines text={a.corps ?? ''} s={s} />
              </div>
            ),
          }),
        ),
    );
    // صفحات المواد المقطوعة (كما في السابق: بعد كل المواد التدفقية)
    // المقطع الذي يبدأ بغلاف «الجمهورية...» أو بداية «الفصل الأول» يفتح صفحة موالية —
    // نغلق صفحة الوحدة السابقة إذن
    const firstLine = (t: string) =>
      (t
        .split('\n')
        .map((x) => x.trim())
        .find(Boolean) ?? '')
        .replace(/[\u064B-\u0652\u0640]/g, '');
    const OPENS_PAGE =
      /^الجمهوري|^الفصل|^رسالة التعهد|^رسالـة التعهد|^(دفتر الشروط|عنوان العملية|أشغال التدفئة|اشغال التدفئة)/;
    list
      .filter((a) => hasChunks(a))
      .forEach((a) => {
        const cs = splitCorps(a.corps ?? '');
        cs.forEach((c, ci) => {
          if (ci > 0 && OPENS_PAGE.test(firstLine(c))) {
            const prev = units[units.length - 1];
            if (prev) prev.brkAfter = true;
          }
          units.push({
            key: `${a.id}#${ci}`,
            brkAfter: SIGN_END.test(corpsTail(a)) && ci === cs.length - 1,
            node: (
              <div id={`c-${sec}-${ci}`} className="doc-art">
                {ci === 0 && <div style={{fontWeight: 700}}>{renum(a.titre, numbers.get(a.id))}</div>}
                <CorpsLines text={c} s={s} />
              </div>
            ),
          });
        });
      });
    // كتلة التوثيق الختامية: قرئ وقبل / حرر ب / المتعهد — تُغلق صفحتها دائماً
    // وما بعدها (عنوان القسم الموالي / غلاف الجمهورية) يبدأ في صفحة موالية
    const hasSign = sec === 'inst' || (standalone(sec) && (sec === 'ccap' || sec === 'cpc'));
    if (hasSign) {
      units.push({
        key: `sign-${sec}`,
        brkAfter: true,
        node: (
          <div id={`sec-${sec}-sign`}>
            {sec === 'inst' && (
              <div className="mt-8 text-center" style={{fontWeight: 700, fontSize: '14pt'}}>
                (قُرِئ وقُبِل) مكتوبة بخط اليد
              </div>
            )}
            <div className="text-center text-sm mt-2" style={sec === 'inst' ? undefined : {marginTop: '2.5rem'}}>
              حرر بـ .................. في .....................
            </div>
            {sec === 'ccap' ? (
              <HSign right="صاحب المشروع" left="المقاولة المتعاملة" />
            ) : (
              <HSign right={sec === 'inst' ? 'المتعهد' : 'صاحب المشروع'} />
            )}
          </div>
        ),
      });
    }
  });

  /** مفتاح إعادة القياس: الإعدادات/المواد/الخط — لتفادي إعادة البناء مع كل تفاعل واجهة */
  const depKey = JSON.stringify([
    s,
    arts.length,
    only,
    coverTitle,
    printSettings,
    units.map((u) => u.key),
  ]);

  /** ترقيم كل صفحات الدفتر: «X / N» أسفل الصفحة — مراقب DOM يلتقط إعادة بناء FlowSlot
   *  لصفحات التدفق فوراً (الترقيم المتزامن عبر setTimeout — rAF لا يعمل في معاينة OpenCode) */
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let tid = 0;
    const renumber = () => {
      clearTimeout(tid);
      tid = window.setTimeout(() => {
        root.querySelectorAll('.pg-num').forEach((n) => n.remove());
        const all = Array.from(root.querySelectorAll('.doc-page'));
        const total = all.length;
        all.forEach((pg, ix) => {
          const num = document.createElement('div');
          num.className = 'pg-num';
          num.style.cssText =
            'position:absolute;bottom:4mm;left:0;right:0;text-align:center;font-size:10.5pt;line-height:1.2;color:#222;direction:ltr;';
          num.textContent = `${ix + 1} / ${total}`;
          pg.appendChild(num);
        });
      }, 0) as unknown as number;
    };
    const observer = new MutationObserver((muts) => {
      const relevant = muts.some((m) =>
        [...m.addedNodes, ...m.removedNodes].some(
          (n) => n instanceof Element && !n.classList.contains('pg-num'),
        ),
      );
      if (relevant) renumber();
    });
    observer.observe(root, {childList: true, subtree: true});
    renumber();
    return () => {
      observer.disconnect();
      clearTimeout(tid);
    };
  }, []);

  return (
    <div ref={rootRef} style={{position: 'relative'}} className="heat-cahier-root">
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

      <FlowSlot key={depKey} units={units} />
    </div>
  );
}
