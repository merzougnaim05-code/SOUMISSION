import type {CSSProperties, ReactNode} from 'react';
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
  // «حرر بـ ..... في .....» (توقيع رسالة التعهد/العقد): المكان = المؤسسة (أو البلدية)، والتاريخ من مدخل تاريخ العقد
  const place = inst || comm;
  const dContrat = s.dateContrat?.trim();
  if (place || dContrat) {
    x = x
      .split('\n')
      .map((ln) => {
        if (!/حرر\s*ب/.test(ln)) return ln;
        if (place) ln = ln.replace(/حرر\s*ب(?:ـ+)?\s*:?\s*[.\u2026]{4,}/, `حرر ب ${place} `);
        if (dContrat) ln = ln.replace(/في\s*:?\s*[.\u2026]{4,}/, `في: ${fmtDate(dContrat)}`);
        return ln;
      })
      .join('\n');
  }
  // إعادة «ثانوية ............ سابقا» كما هي
  x = x.replace(new RegExp(SABA, 'g'), 'ثانوية .............. سابقا');
  return x;
}

/** خط التدفق: أسطر البادئات المطلوب رؤوس أقسام (الفصول) وغلاف «الجمهورية» */
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
  const base: CSSProperties = {textAlign: 'center'};
  if (n === 'رسالة التعهد') return {...base, fontSize: '20pt', fontWeight: 700, marginTop: '30pt'};
  if (/^دفتر الشروط/.test(n)) return {...base, fontSize: '24pt', fontWeight: 700, marginTop: '30pt'};
  if (n === 'العرض المالي') return {...base, fontSize: '16pt', fontWeight: 700, marginTop: '18pt'};
  if (n.startsWith('الجمهورية')) return {...base, fontWeight: 700};
  if (/^(مديرية التربية|ثانوية)/.test(n)) return {...base, fontWeight: 600};
  if (n.startsWith('عنوان العملية')) return {...base, fontWeight: 700, marginTop: '14pt'};
  return {...base, marginTop: '4pt'};
}

/** عرض سطور جسد مادة: ملء المدخلات + العناوين بالخط العريض */
export function CorpsLines({text, s}: {text: string; s: HeatSettings}) {
  const lines = fillHeat(text, s)
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
  const out: ReactNode[] = [];
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const n = normLine(raw);

    // غلاف «الجمهورية الجزائرية ...» — وسط الصفحة
    if (n.startsWith('الجمهورية')) {
      const group: string[] = [];
      while (i < lines.length) {
        const gn = normLine(lines[i]);
        if (group.length > 0 && !isCoverLine(gn)) break;
        group.push(lines[i]);
        i += 1;
      }
      out.push(
        <div key={k++} style={{textAlign: 'center'}}>
          {group.map((g, gi) => (
            <p key={gi} style={coverStyle(normLine(g))}>
              {withDots(g)}
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
        <p key={k++} style={{fontWeight: 700, textAlign: 'center', fontSize: '12.5pt', marginTop: '10pt'}}>
          {withDots(raw)}
        </p>,
      );
      i += 1;
      continue;
    }

    if (n === 'دفتر البنود الإدارية العامة') {
      out.push(
        <p key={k++} style={{fontWeight: 700, textAlign: 'center', fontSize: '13.5pt', marginBottom: '6pt'}}>
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
        <p key={k++} style={{fontWeight: 600, textAlign: 'center', marginTop: '10pt'}}>
          {withDots(raw)}
        </p>,
      );
      i += 1;
      continue;
    }

    if (n === 'المتعهد' || n === 'المتعههد' || n === 'المتهعد') {
      out.push(
        <p key={k++} style={{fontWeight: 700, marginTop: '8pt'}}>
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
        {withDots(raw)}
      </p>,
    );
    i += 1;
  }
  return <>{out}</>;
}
