import type {ReactNode} from 'react';
import {withDots, docParagraphAlign} from '../primitives';
import {useHeat} from '../../heatStore';

export function HeatHeader() {
  const {state} = useHeat();
  const s = state.settings;
  return (
    <div className="text-center mb-4 leading-snug">
      <RepublicEmblem size="14mm" />
      <div style={{fontWeight: 700}}>الجمهورية الجزائرية الديمقراطية الشعبية</div>
      <div>وزارة التربية الوطنية</div>
      <div>مديرية التربية لولاية {s.wilaya}</div>
      <div style={{fontWeight: 700}}>{s.institutionShort}</div>
    </div>
  );
}

/** شعار الجمهورية الجزائرية ووزارة التربية — رسمة مبسطة (هلال ونجمة وسنبلتا قمح) */
export function RepublicEmblem({size = '14mm'}: {size?: string}) {
  const ink = '#1a1a1a';
  return (
    <svg viewBox="0 0 140 120" width={size} style={{display: 'block', margin: '0 auto 2pt'}} aria-hidden>
      <ellipse cx="70" cy="60" rx="40" ry="42" fill="none" stroke={ink} strokeWidth="2.5" />
      {/* الهلال */}
      <path d="M86 36a27 27 0 1 0 0 48 22 22 0 1 1 0-48z" fill={ink} />
      {/* النجمة */}
      <path d="M92 58l3 6.3 6.9 1-5 4.8 1.2 6.9-6.1-3.4-6.1 3.4 1.2-6.9-5-4.8 6.9-1z" fill={ink} />
      {/* سنابل القمح */}
      <path d="M30 94C19 78 18 52 30 34" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <path d="M110 94c11-16 12-42 0-60" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <g fill={ink}>
        <ellipse cx="24.5" cy="70" rx="3.2" ry="6.5" transform="rotate(18 24.5 70)" />
        <ellipse cx="24" cy="56" rx="3" ry="6.2" transform="rotate(28 24 56)" />
        <ellipse cx="26" cy="42" rx="2.9" ry="6" transform="rotate(44 26 42)" />
        <ellipse cx="32" cy="31" rx="2.8" ry="5.6" transform="rotate(62 32 31)" />
        <ellipse cx="115.5" cy="70" rx="3.2" ry="6.5" transform="rotate(-18 115.5 70)" />
        <ellipse cx="116" cy="56" rx="3" ry="6.2" transform="rotate(-28 116 56)" />
        <ellipse cx="114" cy="42" rx="2.9" ry="6" transform="rotate(-44 114 42)" />
        <ellipse cx="108" cy="31" rx="2.8" ry="5.6" transform="rotate(-62 108 31)" />
      </g>
      {/* اليد في أعلى الشعار */}
      <path
        d="M70 16c-2.2 0-3.6 1.6-3.6 3.8v6.4l-4.6-6.6c-1.2-1.8-3.6-2.2-5.2-1-1.6 1.2-1.9 3.4-.7 5.2l7.8 11.6h12.6l7.8-11.6c1.2-1.8.9-4-.7-5.2-1.6-1.2-4-.8-5.2 1l-4.6 6.6v-6.4c0-2.2-1.4-3.8-3.6-3.8z"
        fill={ink}
      />
    </svg>
  );
}

export function HPage({id, children}: {id?: string; children: ReactNode}) {
  return <div className="doc-page" id={id}>{children}</div>;
}

export function HSign({right, left}: {right: string; left?: string}) {
  // توقيع مفرد: في منتصف الصفحة
  if (!left) {
    return (
      <div className="text-center mt-10 text-sm">
        <div style={{fontWeight: 700}}>{right}</div>
        <div className="doc-dotline mt-8" style={{width: '55%', margin: '1.2em auto 0'}} />
      </div>
    );
  }
  return (
    <div className="flex justify-between mt-10 text-sm">
      <div className="text-center min-w-[40%]">
        <div style={{fontWeight: 700}}>{right}</div>
        <div className="doc-dotline mt-8" />
      </div>
      <div className="text-center min-w-[40%]">
        <div style={{fontWeight: 700}}>{left}</div>
        <div className="doc-dotline mt-8" />
      </div>
    </div>
  );
}

export function HArticle({titre, corps}: {titre: string; corps: string}) {
  return (
    <div className="doc-art">
      <div style={{fontWeight: 700}}>{titre}</div>
      {corps
        .split(/\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((p, i) => (
          <p
            key={i}
            style={{whiteSpace: 'pre-line', textAlign: docParagraphAlign(p), fontSize: '11.5pt'}}
          >
            {withDots(p)}
          </p>
        ))}
    </div>
  );
}
