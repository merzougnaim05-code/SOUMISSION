import type {CSSProperties, ReactNode} from 'react';
import {Fragment} from 'react';
import type {HeatSettings} from '../../types';
import {docParagraphAlign, withDots} from '../primitives';

/** إزالة التطويل وتوحيد الألف للمقارنة بين الأسطر */
export function normLine(s: string): string {
  return (s ?? '')
    .replace(/ـ/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/\s+/g, ' ')
    .trim();
}

function fmtDate(iso: string): string {
  if (!iso) return '';
  const m = iso.split('-');
  return m.length === 3 ? `${m[2]}/${m[1]}/${m[0]}` : iso;
}

const D = '[.\u2026]{4,}';

/** ملء الحقول المعروفة من مدخلات الاستشارة داخل نصوص المواد
 *  (اسم المدير، المؤسسة، البلدية، الولاية، التواريخ) */
const SABA = '\uE0A1'; // واقٍ مؤقت لحالات «ثانوية ..... سابقا» (الا سم القديم يبقى منقوطاً)
export function fillHeat(t: string, s: HeatSettings): string {
  let x = t ?? '';
  const inst = s.institution?.trim();
  const comm = s.commune?.trim();
  const dir = s.directeur?.trim();
  const wil = s.wilaya?.trim();
  // إبعاد «ثانوية .................... سابقا» عن الاستبدال
  x = x.replace(new RegExp(`ثانوية\\s*${D}\\s*سابق`, 'g'), SABA);
  if (inst) {
    // المؤسسة المكتوبة في المدخلات تحمل عادة كلمة «ثانوية» — فنستبدال النقاط فقط دون مضاعفة
    const th = inst.match(/^ثانوية/) ? inst : `ثانوية ${inst}`;
    x = x.replace(new RegExp(`ثانوية\\s*${D}`, 'g'), th);
    x = x.replace(new RegExp(`مدير(?:ة)?\\s*[إأا]?\\s*ثانوية\\s*${D}`, 'g'), `مدير ${th}`);
  }
  if (comm) x = x.replace(new RegExp(`بلدية\\s*${D}`, 'g'), `بلدية ${comm}`);
  if (dir) x = x.replace(new RegExp(`السيد\\s*:\\s*${D}`, 'g'), `السيد: ${dir}`);
  if (wil) {
    x = x.replace(/مديرية التربية لولاية\s+\S+/g, `مديرية التربية لولاية ${wil}`);
    x = x.replace(new RegExp(`ولاية\\s*${D}`, 'g'), `ولاية ${wil}`);
  }
  if (s.dateAnnonce) {
    x = x.replace(new RegExp(`ابتداء من\\s*:\\s*${D}`, 'g'), `ابتداء من: ${fmtDate(s.dateAnnonce)}`);
  }
  // «تاريخ إمضاء العقد: .....» — من حقل تاريخ إمضاء العقد
  const dContrat = s.dateContrat?.trim();
  if (dContrat) {
    x = x.replace(/تاريخ إمضاء العقد\s*:?\s*[.\u2026]{4,}/g, `تاريخ إمضاء العقد: ${fmtDate(dContrat)}`);
  }
  // «حرر بـ ..... في .....» (توقيع رسالة التعهد/العقد): يبقى المكان منقّطاً (كتابة يدوية)
  // والتاريخ يُلأى من حقل تاريخ العقد
  if (dContrat) {
    x = x
      .split('\n')
      .map((ln) => {
        if (!/حرر\s*ب/.test(ln)) return ln;
        return ln.replace(/في\s*:?\s*[.\u2026]{4,}/, `في: ${fmtDate(dContrat)}`);
      })
      .join('\n');
  }
  // إعادة «ثانوية ............ سابقا» كما هي
  x = x.replace(new RegExp(SABA, 'g'), 'ثانوية .............. سابقا');
  return x;
}

/** خط التدفق: أسطر البادئات المطلوب رؤوس أقسام (الفصول) وغلاف «الجمهورية»
 *  وكذلك نهاية كتلة التوقيع «(قرئ وقبل) ... حرر ب ... المتعهد» — ما يليها في صفحة موالية */
export function splitCorps(corps: string): string[] {
  if (!corps) return [];
  const lines = corps
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
  const points = new Set<number>();
  let j = 0;
  lines.forEach((ln, i) => {
    const n = normLine(ln);
    if (n.startsWith('الفصل') && /(الاول|الثاني)/.test(n)) {
      // «الفصل الأول: مصدر المواد» — بداية المواد تبدأ في أول سطر الصفحة الموالية
      if (n.includes('الاول')) points.add(i);
    } else if (n.startsWith('الجمهورية')) {
      j += 1;
      if (j <= 2) points.add(i);
    } else if (n === 'المتعهد' || n === 'المتهعد' || n === 'المتعههد' || n === 'المعهد' || n === 'المعههد') {
      // نهاية كتلة التوقيع — أي كتابة بعدها تنتقل إلى الصفحة الموالية
      const prev = lines.slice(Math.max(0, i - 6), i).map(normLine).join(' ');
      if (prev.includes('قرئ وقب') && i + 1 < lines.length) points.add(i + 1);
    }
  });
  if (!points.size) return [];
  const ps = [...points].sort((a, b) => a - b);
  const chunks: string[] = [];
  let prev = 0;
  for (const p of ps) {
    if (p > prev) chunks.push(lines.slice(prev, p).join('\n'));
    prev = p;
  }
  chunks.push(lines.slice(prev).join('\n'));
  return chunks.filter((c) => c.trim().length > 0);
}

/** أسطر غلاف «الجمهورية الجزائرية» — تُصيَّر وسط الصفحة
 *  ملاحظة: الاختبار يجري على normLine (الألف المقمة استُبدلت بلا همزة) */
function isCoverLine(n: string): boolean {
  return /^(الجمهورية|مديرية التربية|ثانوية|رسالة التعهد|دفتر الشروط|عنوان العملية|اشغال التدفئة|أشغال التدفئة|العرض المالي|تسمية المؤسسة|رقم الهاتف|البريد الالكتروني|\()/.test(n);
}

function coverStyle(n: string): CSSProperties {
  const base: CSSProperties = {textAlign: 'center', textAlignLast: 'center'};
  if (n === 'رسالة التعهد') return {...base, fontSize: '20pt', fontWeight: 700, marginTop: '30pt'};
  if (/^دفتر الشروط/.test(n)) return {...base, fontSize: '24pt', fontWeight: 700, marginTop: '30pt'};
  if (n === 'العرض المالي') return {...base, fontSize: '16pt', fontWeight: 700, marginTop: '18pt'};
  if (n.startsWith('الجمهورية')) return {...base, fontWeight: 700};
  if (/^(مديرية التربية|ثانوية)/.test(n)) return {...base, fontWeight: 600};
  if (n.startsWith('عنوان العملية')) return {...base, fontWeight: 700, marginTop: '14pt'};
  return {...base, marginTop: '4pt'};
}

/** سطر منقّط فقط (كتابة يدوية): تمديد النقاط على كامل عرض الصفحة
 *  (يمكن للسطر أن يحوي موضعاً منقّطاً أو اثنين — تُوزَّع سواتها على كامل العرض) */
function DotsRow({raw}: {raw: string}) {
  const runs = raw.split(/\s+/).filter((x) => /^[.\u2026]{3,}$/.test(x));
  if (runs.length === 0) return null;
  return (
    <div style={{display: 'flex', gap: runs.length > 1 ? '5%' : 0, margin: '2pt 0'}}>
      {runs.map((_, ix) => (
        <div
          key={ix}
          style={{
            width: runs.length > 1 ? '47.5%' : '100%',
            borderBottom: '2px dotted #333',
            height: '1em',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

/** هل يحوي السطر سلسلة نقاط ناقصة (يمكن تمديدها حتى نهاية السطر)؟ */
function hasDotRun(raw: string): boolean {
  return /[.\u2026]{4,}/.test(raw ?? '') && (raw ?? '').replace(/[.\u2026]+/g, '').trim().length > 0;
}

/** سطر نص + نقاط ناقصة: النقاط تتمدد كخط منقّط حتى نهاية السطر (منطقة كتابة يدوية)
 *  (لا يُطبَّق إلا على الأسطر القصيرة حتى يبقى النص في سطر واحد) */
function MixedDots({raw}: {raw: string}) {
  const parts = (raw ?? '').split(/([.\u2026]{4,})/g);
  const items: ReactNode[] = [];
  parts.forEach((p, ix) => {
    if (!p) return;
    if (/^[.\u2026]{4,}$/.test(p)) {
      items.push(
        <span
          key={ix}
          style={{
            flex: '1 1 14pt',
            minWidth: '14pt',
            borderBottom: '2px dotted #333',
            height: '0.9em',
            margin: '0 2pt',
          }}
        />,
      );
    } else {
      items.push(<span key={ix}>{p}</span>);
    }
  });
  return <span style={{display: 'flex', alignItems: 'flex-end'}}>{items}</span>;
}

/** عرض سطور جسد مادة: ملء المدخلات + العناوين بالخط العريض */
export function CorpsLines({text, s}: {text: string; s: HeatSettings}) {
  const lines = fillHeat(text, s)
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
  // أسطر قصيرة تحوي نقاطاً ناقصة: تتمدد النقاط حتى نهاية السطر/الصفحة
  const stretch = (r: string) => hasDotRun(r) && r.replace(/[.\u2026]+/g, '').trim().length <= 90;
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const n = normLine(raw);

    // سطر منقّط فقط — تمديده على كامل عرض الصفحة
    if (/^[.\u2026\s]*$/.test(n) && (n.match(/[.\u2026]/g) ?? []).length >= 4) {
      out.push(<DotsRow key={k++} raw={raw} />);
      i += 1;
      continue;
    }

    // غلاف «الجمهورية الجزائرية ...» — وسط الصفحة
    if (n.startsWith('الجمهورية')) {
      const g: string[] = [];
      while (i < lines.length) {
        const gn = normLine(lines[i]);
        if (g.length > 0 && !isCoverLine(gn)) break;
        g.push(lines[i]);
        i += 1;
      }
      out.push(
        <div key={k++} style={{textAlign: 'center'}}>
          {g.map((gl, gi) => (
            <p key={gi} style={coverStyle(normLine(gl))}>
              {hasDotRun(gl) ? <MixedDots raw={gl} /> : withDots(gl)}
            </p>
          ))}
        </div>,
      );
      continue;
    }

    // عنوان مادة داخل النص: «المادة 0X/ X.X : ...» — عريض ومساوٍ لباقي المواد
    if (/^المادة\s?\d/.test(n) && n.includes(':') && n.length < 130) {
      const disp = raw.replace(/ـ/g, '').replace(/المادة(?=\d)/g, 'المادة ');
      out.push(
        <p key={k++} style={{fontWeight: 700, marginTop: '8pt'}}>
          {withDots(disp)}
        </p>,
      );
      i += 1;
      continue;
    }

    // «الفصل الأول/الثاني: ...» — عنوان فصل مركز
    if (n.startsWith('الفصل') && /(الاول|الثاني)/.test(n)) {
      out.push(
        <p
          key={k++}
          style={{
            fontWeight: 700,
            textAlign: 'center',
            textAlignLast: 'center',
            fontSize: '12.5pt',
            marginTop: '10pt',
          }}
        >
          {withDots(raw)}
        </p>,
      );
      i += 1;
      continue;
    }

    if (n === 'دفتر البنود الإدارية العامة') {
      out.push(
        <p
          key={k++}
          style={{
            fontWeight: 700,
            textAlign: 'center',
            textAlignLast: 'center',
            fontSize: '13.5pt',
            marginBottom: '6pt',
          }}
        >
          {withDots(raw)}
        </p>,
      );
      i += 1;
      continue;
    }

    if (n.startsWith('ملاحظات هامة') || n.startsWith('ملاحظات مهمة')) {
      out.push(
        <p key={k++} style={{fontWeight: 700, marginTop: '10pt'}}>
          {withDots(raw)}
        </p>,
      );
      i += 1;
      continue;
    }

    if (n.startsWith('قرئ وقب') || n.startsWith('قرئ وقبـ')) {
      out.push(
        <p
          key={k++}
          style={{fontWeight: 600, textAlign: 'center', textAlignLast: 'center', marginTop: '10pt'}}
        >
          {withDots(raw)}
        </p>,
      );
      i += 1;
      continue;
    }

    // «حرر ب ... في ...» وتوقيعات إمضاء: في منتصف الصفحة (النقاط تتمدد لعرض الصفحة)
    if (n.startsWith('حرر ب') || n.startsWith('إمضاء')) {
      out.push(
        <p
          key={k++}
          style={{
            textAlign: 'center',
            textAlignLast: 'center',
            marginTop: '8pt',
            whiteSpace: 'pre-line',
            fontWeight: 600,
          }}
        >
          {stretch(raw) ? <MixedDots raw={raw} /> : withDots(raw)}
        </p>,
      );
      i += 1;
      continue;
    }

    if (n === 'المتعهد' || n === 'المتعههد' || n === 'المتهعد') {
      out.push(
        <p
          key={k++}
          style={{
            fontWeight: 700,
            textAlign: 'center',
            textAlignLast: 'center',
            fontSize: '13pt',
            marginTop: '12pt',
          }}
        >
          {withDots(raw)}
        </p>,
      );
      i += 1;
      continue;
    }

    out.push(
      <p
        key={k++}
        style={{
          whiteSpace: 'pre-line',
          textAlign: docParagraphAlign(raw),
          fontSize: '11.5pt',
          lineHeight: 1.55,
        }}
      >
        {stretch(raw) ? <MixedDots raw={raw} /> : withDots(raw)}
      </p>,
    );
    i += 1;
  }
  return <>{out}</>;
}
