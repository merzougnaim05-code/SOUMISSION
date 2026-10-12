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
        <p key={i} style={{whiteSpace: 'pre-line', textAlign: 'justify', fontSize: '12.5pt'}}>
          {p}
        </p>
      ))}
    </div>
  );
}
