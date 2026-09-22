import {useRef, useState} from 'react';
import {useHeat} from '../../heatStore';
import {Btn} from '../../ui';
import {exportWord} from '../../exportWord';
import {exportHeatExcel} from '../../exportHeatExcel';
import {HeatAnnonce as Annonce} from '../../docs/heat/Annonce';
import {HeatCahier as Cahier} from '../../docs/heat/Cahier';
import {HeatDQE, HeatPrix} from '../../docs/heat/Prix';
import {HeatMemo, HeatOrdre} from '../../docs/heat/Memo';
import {HeatComparaison, HeatResultats} from '../../docs/heat/Eval';

type DocKey = 'annonce' | 'cahier' | 'prix' | 'dqe' | 'memo' | 'ordre' | 'comparaison' | 'resultats';

const DOCS: {key: DocKey; label: string; desc: string; needsEntrepreneur?: boolean}[] = [
  {key: 'annonce', label: 'إعلان عن الاستشارة', desc: 'الإعلان الرسمي مع محتويات الملف الثلاثي'},
  {key: 'cahier', label: 'دفتر الشروط الكامل', desc: 'تعليمات العارضين + العقد + التعليمات الخاصة (مواد قابلة للتعديل)'},
  {key: 'prix', label: 'جدول الأسعار الوحدوية', desc: 'مع الأسعار بالحروف تلقائياً', needsEntrepreneur: true},
  {key: 'dqe', label: 'التفصيل الكمي والتقديري', desc: 'DQE مع H.T / TVA / T.T.C والتقريب', needsEntrepreneur: true},
  {key: 'memo', label: 'المذكرة التقنية التبريرية', desc: 'نموذج الوسائل المادية والبشرية'},
  {key: 'ordre', label: 'أمر بداية الأشغال + التبليغ', desc: 'للمقاولة الفائزة'},
  {key: 'comparaison', label: 'جدول مقارنة وتقييم العروض', desc: 'تقني (40 نقطة) + مالي + الترتيب'},
  {key: 'resultats', label: 'إعلان النتائج', desc: 'المقاولة الفائزة بمبلغها تفقيطاً'},
];

export function HeatDocumentsPage() {
  const {state} = useHeat();
  const [docKey, setDocKey] = useState<DocKey>('annonce');
  const [entrepreneurId, setEntrepreneurId] = useState(state.entrepreneurs[0]?.id ?? '');
  const printRef = useRef<HTMLDivElement>(null);

  const meta = DOCS.find((d) => d.key === docKey)!;

  const renderDoc = () => {
    switch (docKey) {
      case 'annonce':
        return <Annonce />;
      case 'cahier':
        return <Cahier />;
      case 'prix':
        return <HeatPrix entrepreneurId={entrepreneurId} />;
      case 'dqe':
        return <HeatDQE entrepreneurId={entrepreneurId} />;
      case 'memo':
        return <HeatMemo />;
      case 'ordre':
        return <HeatOrdre />;
      case 'comparaison':
        return <HeatComparaison />;
      case 'resultats':
        return <HeatResultats />;
    }
  };

  const docFileName = () => {
    const s = state.settings;
    const e = state.entrepreneurs.find((x) => x.id === entrepreneurId);
    const names: Record<DocKey, string> = {
      annonce: `إعلان استشارة التدفئة ${s.numeroConsultation}`,
      cahier: 'دفتر شروط أشغال التدفئة المركزية',
      prix: `جدول الأسعار الوحدوية - ${e?.nom ?? ''}`,
      dqe: `التفصيل الكمي والتقديري - ${e?.nom ?? ''}`,
      memo: 'المذكرة التقنية التبريرية',
      ordre: 'أمر بداية الأشغال',
      comparaison: 'مقارنة العروض',
      resultats: 'إعلان النتائج',
    };
    return names[docKey];
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="no-print w-72 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-3 sticky top-4">
        <h2 className="font-bold text-slate-800 mb-3 px-1">وثائق استشارة التدفئة للطباعة</h2>
        <div className="space-y-1 max-h-[70vh] overflow-y-auto">
          {DOCS.map((d) => (
            <button
              key={d.key}
              onClick={() => setDocKey(d.key)}
              className={`w-full text-right rounded-lg px-3 py-2 transition ${
                docKey === d.key ? 'bg-teal-700 text-white' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="text-sm font-semibold">{d.label}</div>
              <div className={`text-[11px] ${docKey === d.key ? 'text-teal-100' : 'text-slate-400'}`}>{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="no-print flex flex-wrap items-center gap-3 bg-white rounded-xl shadow-sm border border-slate-200 p-3 mb-4">
          <Btn onClick={() => window.print()}>🖨 طباعة / حفظ PDF</Btn>
          <Btn variant="ghost" onClick={() => exportWord(printRef.current, `${docFileName()}.doc`)}>
            ⬇ تحميل Word
          </Btn>
          <Btn variant="ghost" onClick={() => exportHeatExcel(state, `استشارة التدفئة ${state.settings.annee}.xlsx`)}>
            ⬇ تحميل Excel (كل البيانات)
          </Btn>
          <span className="text-sm text-slate-500">{meta.label}</span>
          <div className="flex-1" />
          {meta.needsEntrepreneur && (
            <select
              className="app-input max-w-[260px]"
              value={entrepreneurId}
              onChange={(e) => setEntrepreneurId(e.target.value)}
            >
              {state.entrepreneurs.length === 0 && <option value="">(لا توجد مقاولات)</option>}
              {state.entrepreneurs.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nom || '(بدون اسم)'}
                </option>
              ))}
            </select>
          )}
        </div>
        <div ref={printRef} className="print-area doc-scroll rounded-xl">
          {renderDoc()}
        </div>
      </div>
    </div>
  );
}
