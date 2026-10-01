import {useRef, useState} from 'react';
import {useHeat} from '../../heatStore';
import {Btn} from '../../ui';
import {usePrint, PrintSettingsPanel} from '../../printSettings';
import {gotoHeatTab, type HeatTab} from '../../shellNav';
import {exportWord} from '../../exportWord';
import {exportHeatExcel} from '../../exportHeatExcel';
import {HeatAnnonce as Annonce} from '../../docs/heat/Annonce';
import {HeatCahier as Cahier} from '../../docs/heat/Cahier';
import {HeatDQE, HeatPrix} from '../../docs/heat/Prix';
import {HeatMemo, HeatOrdre} from '../../docs/heat/Memo';
import {HeatComparaison, HeatResultats} from '../../docs/heat/Eval';

type DocKey =
  | 'annonce'
  | 'cahier'
  | 'cahierInst'
  | 'contrat'
  | 'cps'
  | 'prix'
  | 'dqe'
  | 'memo'
  | 'ordre'
  | 'comparaison'
  | 'resultats';

const DOCS: {
  key: DocKey;
  label: string;
  desc: string;
  needsEntrepreneur?: boolean;
  editTab: HeatTab;
  editAnchor?: string;
  editLabel: string;
}[] = [
  {key: 'annonce', label: 'إعلان عن الاستشارة', desc: 'الإعلان الرسمي مع محتويات الملف الثلاثي', editTab: 'dash', editLabel: 'تعديل المعطيات'},
  {key: 'cahier', label: 'دفتر الشروط الكامل', desc: 'تعليمات العارضين + العقد + التعليمات الخاصة (مواد قابلة للتعديل)', editTab: 'texts', editLabel: 'تعديل النصوص'},
  {key: 'cahierInst', label: 'دفتر الشروط — التعليمات', desc: 'التعليمات الموجهة للعارضين في كتاب مستقل', editTab: 'texts', editAnchor: 'heat-sec-inst', editLabel: 'تعديل التعليمات'},
  {key: 'contrat', label: 'العقد (الشروط الإدارية)', desc: 'كتاب العقد مستقلاً مع توقيع الطرفين', editTab: 'texts', editAnchor: 'heat-sec-ccap', editLabel: 'تعديل العقد'},
  {key: 'cps', label: 'دفتر التعليمات الخاصة', desc: 'الشروط التقنية الخاصة في كتاب مستقل', editTab: 'texts', editAnchor: 'heat-sec-cpc', editLabel: 'تعديل الدفتر'},
  {key: 'prix', label: 'جدول الأسعار الوحدوية', desc: 'مع الأسعار بالحروف تلقائياً', needsEntrepreneur: true, editTab: 'ouvrages', editLabel: 'تعديل البنود'},
  {key: 'dqe', label: 'التفصيل الكمي والتقديري', desc: 'DQE مع H.T / TVA / T.T.C والتقريب', needsEntrepreneur: true, editTab: 'ouvrages', editLabel: 'تعديل البنود'},
  {key: 'memo', label: 'المذكرة التقنية التبريرية', desc: 'نموذج الوسائل المادية والبشرية', editTab: 'entrepreneurs', editLabel: 'تعديل المقاولات'},
  {key: 'ordre', label: 'أمر بداية الأشغال + التبليغ', desc: 'للمقاولة الفائزة', editTab: 'entrepreneurs', editLabel: 'تعديل المقاولات'},
  {key: 'comparaison', label: 'جدول مقارنة وتقييم العروض', desc: 'تقني (40 نقطة) + مالي + الترتيب', editTab: 'offers', editLabel: 'تعديل العروض'},
  {key: 'resultats', label: 'إعلان النتائج', desc: 'المقاولة الفائزة بمبلغها تفقيطاً', editTab: 'offers', editLabel: 'تعديل العروض'},
];

export function HeatDocumentsPage() {
  const {state} = useHeat();
  const {vars} = usePrint();
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
      case 'cahierInst':
        return <Cahier only={['inst']} coverTitle="دفتر الشروط" />;
      case 'contrat':
        return <Cahier only={['ccap']} coverTitle="العقد" />;
      case 'cps':
        return <Cahier only={['cpc']} coverTitle="دفتر التعليمات الخاصة" />;
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
      annonce: `إعلان استشارة الأشغال ${s.numeroConsultation}`,
      cahier: 'دفتر شروط أشغال التدفئة المركزية',
      cahierInst: 'دفتر الشروط — التعليمات الموجهة للعارضين',
      contrat: 'العقد — الشروط الإدارية',
      cps: 'دفتر التعليمات الخاصة',
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
        <h2 className="font-bold text-slate-800 mb-3 px-1">وثائق استشارة الأشغال للطباعة</h2>
        <div className="space-y-1 max-h-[70vh] overflow-y-auto">
          {DOCS.map((d) => (
            <div
              key={d.key}
              className={`w-full rounded-lg px-3 py-2 transition ${
                docKey === d.key ? 'bg-teal-700 text-white' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <button onClick={() => setDocKey(d.key)} className="w-full text-right">
                <div className="text-sm font-semibold">{d.label}</div>
                <div className={`text-[11px] ${docKey === d.key ? 'text-teal-100' : 'text-slate-400'}`}>{d.desc}</div>
              </button>
              <button
                onClick={() => gotoHeatTab(d.editTab, d.editAnchor)}
                className={`mt-1 text-xs font-semibold underline underline-offset-2 ${
                  docKey === d.key ? 'text-teal-100 hover:text-white' : 'text-teal-700 hover:text-teal-900'
                }`}
              >
                ✏ {d.editLabel}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="no-print flex flex-wrap items-center gap-3 bg-white rounded-xl shadow-sm border border-slate-200 p-3 mb-4">
          <Btn onClick={() => window.print()}>🖨 طباعة / حفظ PDF</Btn>
          <Btn variant="ghost" onClick={() => exportWord(printRef.current, `${docFileName()}.doc`)}>
            ⬇ تحميل Word
          </Btn>
          <Btn variant="ghost" onClick={() => exportHeatExcel(state, `استشارة الأشغال ${state.settings.annee}.xlsx`)}>
            ⬇ تحميل Excel (كل البيانات)
          </Btn>
          <span className="text-sm text-slate-500">{meta.label}</span>
          <Btn small variant="ghost" onClick={() => gotoHeatTab(meta.editTab, meta.editAnchor)}>
            ✏ {meta.editLabel}
          </Btn>
          <span className="text-xs text-slate-400">
            لتعديل نصوص العقد ودفتر الشروط: تبويب «دفتر الشروط» أعلاه
          </span>
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
        <PrintSettingsPanel />
        <div ref={printRef} className="print-area doc-scroll rounded-xl" style={vars}>
          {renderDoc()}
        </div>
      </div>
    </div>
  );
}
