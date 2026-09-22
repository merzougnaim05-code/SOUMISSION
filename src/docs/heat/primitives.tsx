import type {ReactNode} from 'react';
import {useHeat} from '../../heatStore';

export function HeatHeader() {
  const {state} = useHeat();
  const s = state.settings;
  return (
    <div className="text-center mb-4 leading-snug">
      <div style={{fontWeight: 700}}>الجمهورية الجزائرية الديمقراطية الشعبية</div>
      <div>وزارة التربية الوطنية</div>
      <div>مديرية التربية لولاية {s.wilaya}</div>
      <div style={{fontWeight: 700}}>{s.institutionShort}</div>
    </div>
  );
}

export function HPage({children}: {children: ReactNode}) {
  return <div className="doc-page">{children}</div>;
}

export function HSign({right, left}: {right: string; left?: string}) {
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

export function HArticle({titre, corps}: {titre: string; corps: string}) {
  return (
    <div className="doc-art">
      <div style={{fontWeight: 700}}>{titre}</div>
      {corps.split(/\n+/).map((p, i) =>
        p.trim() ? (
          <p key={i} style={{whiteSpace: 'pre-line', textAlign: 'justify', fontSize: '11.5pt'}}>
            {p}
          </p>
        ) : null,
      )}
    </div>
  );
}
