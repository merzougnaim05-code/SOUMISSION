import {useLayoutEffect, useRef, type ReactNode} from 'react';

/** وحدة محتوى تُفتَّص إلى صفحات A4 بقياس ارتفاعها الحقيقي */
export type FlowUnit = {key: string; node: ReactNode; brkAfter?: boolean};

/** ذرّة محتوى: سطر/عنصر نهائي مع سلسلة أغلفته (من الخارج إلى الداخل) */
type Atom = {chain: Element[]; leaf: Element};

/** يقيم محتوى «مخفياً» ثم يوزّعه على صفحات A4 حقيقية (بحجم الورقة)
 *  — بفواصل واضحة في العرض وبترقيم وتقسيم سليم عند الطباعة.
 *  التقسيم ذرّي: يُفكَّك المحتوى إلى أصغر عناصر (أسطر/فقرات) وتُعاد أغلفتها في كل صفحة،
 *  فلا تبقى أي صفحة أطول من ورقة A4. الوحدات التي تنتهي بكتلة توقيع (brkAfter) تُغلق صفحتها. */
export function FlowSlot({units}: {units: FlowUnit[]}) {
  const hiddenRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const hidden = hiddenRef.current;
    if (!slot || !hidden) return;
    slot.textContent = '';

    const mkPage = () => {
      const d = document.createElement('div');
      d.className = 'doc-page';
      slot.appendChild(d);
      return d;
    };

    // المساحة المتاحة داخل هوامش صفحة A4 (نأخذ A4 كمرجع إن كانت الورقة فارغة/بلا أدنى ارتفاع)
    const A4 = (297 * 96) / 25.4;
    let budget = 0;
    {
      const p = mkPage();
      const cs = getComputedStyle(p);
      const ph = p.clientHeight > 300 ? p.clientHeight : A4;
      budget = ph - parseFloat(cs.paddingTop || '0') - parseFloat(cs.paddingBottom || '0') - 12;
      p.remove();
    }

    /** العناصر الكتلية فقط — الفقرات والأسطر المختلطة تُعامَل كوحدة لا تُفكَّك */
    const BLOCK = new Set([
      'DIV',
      'P',
      'TABLE',
      'THEAD',
      'TBODY',
      'TFOOT',
      'TR',
      'UL',
      'OL',
      'LI',
      'H1',
      'H2',
      'H3',
      'H4',
      'H5',
      'H6',
      'BLOCKQUOTE',
      'SECTION',
      'ARTICLE',
      'HEADER',
      'FOOTER',
      'CENTER',
      'HR',
    ]);

    /** تفكيك عنصر إلى ذرّاته (الأوراق) مع سلسلة أغلفة كل ورقة */
    const atomize = (el: Element, chain: Element[], out: Atom[]) => {
      const kids = Array.from(el.children);
      const allBlock = kids.length > 0 && kids.every((k) => BLOCK.has(k.tagName));
      if (!allBlock) {
        // لا أبناء أو أبناء غير كتليين (spans/أسطر منقّطة) → وحدة واحدة محفوظة التنسيق
        out.push({chain, leaf: el});
        return;
      }
      const next = [...chain, el];
      kids.forEach((k) => atomize(k, next, out));
    };

    /** إعادة بناء ذرّة: أغلفتها فارغة (نفس الأنماط/الفئات) ثم الورقة داخلها */
    const buildAtom = (a: Atom): Element => {
      if (a.chain.length === 0) return a.leaf.cloneNode(true) as Element;
      const make = (i: number): Element => {
        const c = a.chain[i].cloneNode(true) as Element;
        c.textContent = '';
        c.appendChild(i === a.chain.length - 1 ? (a.leaf.cloneNode(true) as Element) : make(i + 1));
        return c;
      };
      return make(0);
    };

    /** قياس مجموعة ذرّات في ورقة مؤقتة (بدون أدنى ارتفاع للورقة) */
    const measure = (atoms: Atom[]) => {
      const d = mkPage();
      d.style.minHeight = '0';
      atoms.forEach((a) => d.appendChild(buildAtom(a)));
      const cs = getComputedStyle(d);
      const h = d.scrollHeight - parseFloat(cs.paddingTop || '0') - parseFloat(cs.paddingBottom || '0');
      d.remove();
      return h;
    };

    const nodes = Array.from(hidden.children);
    const pages: Atom[][] = [];
    let cur: Atom[] = [];
    const flush = () => {
      if (cur.length) {
        pages.push(cur);
        cur = [];
      }
    };

    nodes.forEach((unit, ui) => {
      const atoms: Atom[] = [];
      atomize(unit, [], atoms);
      atoms.forEach((a) => {
        if (cur.length && measure([...cur, a]) > budget) flush();
        cur.push(a);
        // حماية: ذرّة وحيدة أطول من صفحة كاملة (نادر: فقرة ضخمة لا تُقسم)
        if (cur.length === 1 && measure(cur) > budget) flush();
      });
      // مادة تنتهي بكتلة توقيع → الصفحة تُغلق هنا وما بعدها في صفحة جديدة
      if (units[ui]?.brkAfter) flush();
    });
    flush();

    pages.forEach((atoms) => {
      const d = mkPage();
      atoms.forEach((a) => d.appendChild(buildAtom(a)));
    });
  }, [units]);

  return (
    <>
      {/* نسخة قياس مخفية (بحجم صفري) — منها تُقاس الأرتفاع الحقيقي لكل وحدة */}
      <div
        ref={hiddenRef}
        className="no-print"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '210mm',
          height: 0,
          overflow: 'hidden',
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        {units.map((u, ix) => (
          <div key={u.key || ix}>{u.node}</div>
        ))}
      </div>
      {/* صفحات الدفتر المبنية بالقياس الحقيقي */}
      <div ref={slotRef} className="flow-slot" />
    </>
  );
}
