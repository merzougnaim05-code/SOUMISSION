import type {ReactNode} from 'react';
import {useStore} from '../store';

/** رأس وثيقة رسمية (الجمهورية... وزارة... مديرية...) */
export function DocHeader() {
  const {state} = useStore();
  const s = state.settings;
  return (
    <div className="text-center mb-4 leading-snug">
      <div style={{fontWeight: 700}}>الجمهورية الجزائرية الديمقراطية الشعبية</div>
      <div>وزارة التربية الوطنية</div>
      <div>مديرية التربية لولاية {s.wilaya}</div>
      <div style={{fontWeight: 700}}>{s.institution}</div>
    </div>
  );
}

/** صفحة A4 */
export function Page({children}: {children: ReactNode}) {
  return <div className="doc-page">{children}</div>;
}

/** سطر توقيع ختامي */
export function SignRow({right, left}: {right: string; left?: string}) {
  return (
    <div className="flex justify-between mt-10 text-sm">
      <div className="text-center min-w-[40%]">
        <div style={{fontWeight: 700}}>{right}</div>
        <div className="doc-dotline mt-8" />
      </div>
      {left ? (
        <div className="text-center min-w-[40%]">
          <div style={{fontWeight: 700}}>{left}</div>
          <div className="doc-dotline mt-8" />
        </div>
      ) : (
        <div className="min-w-[40%]" />
      )}
    </div>
  );
}

/** ترويسة أسفل الوثيقة: حرر بـ ... في ... */
export function FreeAt() {
  const {state} = useStore();
  return (
    <div className="mt-8 text-sm">
      حرر بـ: <span style={{fontWeight: 700}}>{state.settings.commune}</span> في: ..............................
    </div>
  );
}

/** حقل مكتوب بخط منقط */
export function Dot({width = '40mm'}: {width?: string}) {
  return <span className="doc-fill" style={{minWidth: width}}>&nbsp;</span>;
}

/** يحدد إن كانت الفقرة تحوي سلاسل نقاط (.....) — فهذه الفقرات يجب ألا تُشدَّ (justify)
 *  لأن عدد المسافات فيها قليل جداً فيصبح الشد فجوات ضخمة؛ تكفي محاذاة يمين */
export function hasDotRuns(text: string): boolean {
  return /\.{3,}/.test(text ?? '');
}
export function withDots(text: string): ReactNode {
  // نكسر داخل: (1) سلاسل النقاط  (2) المراجع اللاتينية الطويلة NFA 33-102 / 15-247
  // لأن كتلها غير القابلة للانكسار تخلق أسطراً يتيمة يمدد justify مسافاتها بشدة
  const parts = (text ?? '').split(/(\.{3,}|[A-Za-z][A-Za-z0-9/# .-]{8,})/g);
  if (parts.length === 1) return text;
  return parts.map((p, i) =>
    /^(\.{3,}|[A-Za-z][A-Za-z0-9/# .-]{8,})$/.test(p) ? (
      <span key={i} className="doc-dots">
        {p}
      </span>
    ) : (
      p
    ),
  );
}

/** مادة نصية في دفتر الشروط */
export function Article({titre, corps}: {titre: string; corps: string[]}) {
  // كل سطر في فقرة مستقلة: السطور القصيرة داخل نفس الفقرة كانت تُمدَّد
  // بعرض الصفحة بسبب justify فتظهر كلمات متباعدة — الفصل يمنع ذلك
  const lines = corps
    .flatMap((c) => (c ?? '').split(/\n/))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return (
    <div className="doc-art">
      <div style={{fontWeight: 700}}>{titre}</div>
      {lines.map((p, i) => (
        <p
          key={i}
          style={{whiteSpace: 'pre-line', textAlign: hasDotRuns(p) ? 'right' : 'justify', fontSize: '12.5pt'}}
        >
          {withDots(p)}
        </p>
      ))}
    </div>
  );
}
