import {useStore} from '../store';
import {defaultArticles} from '../data/texts';
import {Btn, Section} from '../ui';

const SECTION_NAMES: Record<string, string> = {
  أ: 'أ) تعليمة للعارضين',
  ب: 'ب) ملف الاستشارة',
  ج: 'ج) تحضير وإعداد العروض',
  د: 'د) إيداع العروض',
  'هـ': 'هـ) فتح الأظرفة وتقييم العروض',
  و: 'و) منح الاتفاقية',
};

/** تعديل نصوص التعليمات العامة لدفتر الشروط — تنعكس فوراً على الوثائق المطبوعة */
export function TextsPage() {
  const {state, setArticles} = useStore();
  const articles = state.articles;

  const update = (id: string, patch: Partial<(typeof articles)[number]>) =>
    setArticles(articles.map((a) => (a.id === id ? {...a, ...patch} : a)));

  const move = (id: string, dir: -1 | 1) => {
    const i = articles.findIndex((a) => a.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= articles.length) return;
    const copy = [...articles];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setArticles(copy);
  };

  const remove = (id: string) => {
    if (confirm('حذف هذه المادة نهائياً من دفتر الشروط؟')) setArticles(articles.filter((a) => a.id !== id));
  };

  const add = () => {
    const id = `art${Date.now()}`;
    setArticles([
      ...articles,
      {id, section: 'و', titre: 'المادة جديدة: ......................', corps: 'نص المادة...'},
    ]);
  };

  const bySection = articles.reduce<Record<string, typeof articles>>((acc, a) => {
    (acc[a.section] = acc[a.section] || []).push(a);
    return acc;
  }, {});

  return (
    <Section
      title="تعديل دفاتر الشروط (التعليمات العامة — العرض التقني)"
      actions={
        <div className="flex gap-2">
          <Btn small variant="ghost" onClick={add}>
            + مادة جديدة
          </Btn>
          <Btn
            small
            variant="danger"
            onClick={() => confirm('استعادة النصوص الأصلية الافتراضية؟ ستُفقد كل تعديلاتك على المواد.') && setArticles(defaultArticles())}
          >
            استعادة النص الأصلي
          </Btn>
        </div>
      }
    >
      <p className="text-xs text-slate-500 mb-4">
        كل تعديل هنا ينعكس فوراً على وثيقة «دفتر الشروط — العرض التقني» وعلى تصدير Word. الأسطر الفارغة تفصل
        بين الفقرات.
      </p>

      {Object.entries(bySection).map(([sec, arts]) => (
        <div key={sec} className="mb-6">
          <h3 className="font-bold text-teal-800 mb-2 border-b border-teal-100 pb-1">
            {SECTION_NAMES[sec] ?? sec}
          </h3>
          <div className="space-y-4">
            {arts.map((a) => (
              <div key={a.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    className="app-input font-bold"
                    value={a.titre}
                    onChange={(e) => update(a.id, {titre: e.target.value})}
                  />
                  <select
                    className="app-input max-w-[130px]"
                    value={a.section}
                    onChange={(e) => update(a.id, {section: e.target.value as typeof a.section})}
                    title="القسم"
                  >
                    {Object.keys(SECTION_NAMES).map((k) => (
                      <option key={k} value={k}>
                        {SECTION_NAMES[k]}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  className="app-input leading-7"
                  rows={Math.min(14, Math.max(3, a.corps.split('\n').length + 1))}
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
