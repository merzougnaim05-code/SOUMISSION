import {useHeat} from '../heatStore';
import {defaultHeatArticles} from '../data/heatArticles';
import {Btn, Section} from '../ui';

const SECTION_NAMES: Record<string, string> = {
  inst: 'أولاً: التعليمات الموجهة للعارضين',
  ccap: 'ثانياً: العقد (الشروط الإدارية)',
  cpc: 'ثالثاً: دفتر التعليمات الخاصة',
};

/** تعديل مواد دفتر شروط التدفئة (86 مادة مستخرجة من الملف الأصلي) */
export function HeatTextsPage() {
  const {state, setArticles} = useHeat();
  const articles = state.articles;

  const update = (id: string, patch: Partial<(typeof articles)[number]>) =>
    setArticles(articles.map((a) => (a.id === id ? {...a, ...patch} : a)));
  const remove = (id: string) => {
    if (confirm('حذف هذه المادة؟')) setArticles(articles.filter((a) => a.id !== id));
  };
  const move = (id: string, dir: -1 | 1) => {
    const i = articles.findIndex((a) => a.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= articles.length) return;
    const copy = [...articles];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setArticles(copy);
  };

  const bySection = (sec: 'inst' | 'ccap' | 'cpc') => articles.filter((a) => a.section === sec);

  return (
    <Section
      title="تعديل دفتر شروط التدفئة المركزية"
      actions={
        <Btn
          small
          variant="danger"
          onClick={() => confirm('استعادة النصوص الأصلية من ملف Word؟ ستُفقد تعديلاتك.') && setArticles(defaultHeatArticles())}
        >
          استعادة النص الأصلي
        </Btn>
      }
    >
      <p className="text-xs text-slate-500 mb-4">
        المواد مستخرجة من ملف «دفاتر الشروط لأشغال التدفئة المركزية.doc» — كل تعديل ينعكس فوراً على الوثيقة
        المطبوعة وتصدير Word.
      </p>
      {(['inst', 'ccap', 'cpc'] as const).map((sec) => (
        <div key={sec} className="mb-6">
          <h3 className="font-bold text-teal-800 mb-2 border-b border-teal-100 pb-1">{SECTION_NAMES[sec]}</h3>
          <div className="space-y-3">
            {bySection(sec).map((a) => (
              <div key={a.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                <input
                  className="app-input font-bold mb-2"
                  value={a.titre}
                  onChange={(e) => update(a.id, {titre: e.target.value})}
                />
                <textarea
                  className="app-input leading-7"
                  rows={Math.min(10, Math.max(2, a.corps.split('\n').length + 1))}
                  value={a.corps}
                  onChange={(e) => update(a.id, {corps: e.target.value})}
                  style={{textAlign: 'justify'}}
                />
                <div className="flex gap-1 mt-2">
                  <Btn small variant="ghost" onClick={() => move(a.id, -1)}>
                    ↑ ↑
                  </Btn>
                  <Btn small variant="ghost" onClick={() => move(a.id, 1)}>
                    ↓ ↓
                  </Btn>
                  <div className="flex-1" />
                  <Btn small variant="danger" onClick={() => remove(a.id)}>
                    حذف
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Section>
  );
}
