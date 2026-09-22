import {useHeat} from '../heatStore';
import {useStore} from '../store';

/** واجهة الدخول: اختيار الاستشارة */
export function Home({onEnter}: {onEnter: (m: 'cantine' | 'chauffage') => void}) {
  const {state: cantine} = useStore();
  const {state: heat} = useHeat();

  const Card = ({
    mode,
    icon,
    title,
    subtitle,
    infos,
    color,
  }: {
    mode: 'cantine' | 'chauffage';
    icon: string;
    title: string;
    subtitle: string;
    infos: string[];
    color: string;
  }) => (
    <button
      onClick={() => onEnter(mode)}
      className="text-right bg-white rounded-2xl shadow-md border border-slate-200 p-6 hover:shadow-xl hover:border-teal-600 transition-all group"
    >
      <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-3xl mb-4`}>{icon}</div>
      <h2 className="text-xl font-extrabold text-slate-800 group-hover:text-teal-800">{title}</h2>
      <p className="text-sm text-slate-500 mt-1 mb-4">{subtitle}</p>
      <ul className="space-y-1.5 text-sm text-slate-600">
        {infos.map((x) => (
          <li key={x} className="flex items-start gap-2">
            <span className="text-teal-600 mt-0.5">✓</span>
            <span>{x}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5 text-teal-700 font-bold text-sm group-hover:translate-x-[-4px] transition-transform">
        الدخول إلى الوحدة ←
      </div>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-10">
        <div className="text-4xl font-extrabold text-teal-800 mb-2">برنامج الاستشارات</div>
        <p className="text-slate-500">
          {cantine.settings.institution} — مديرية التربية لولاية {cantine.settings.wilaya}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Card
          mode="cantine"
          icon="🍽"
          title="استشارة تموين المطعم"
          subtitle={`السنة المالية ${cantine.settings.annee} — إعلان رقم ${cantine.settings.numeroAnnonce}/${cantine.settings.annee}`}
          color="bg-teal-50"
          infos={[
            `${cantine.lots.length} حصص: ${cantine.lots.map((l) => l.nom).join('، ')}`,
            'دفتر شروط تقني ومالي + عقود تموين',
            'مقارنة العروض وإعلان النتائج',
            'الوثائق جاهزة للطباعة وWord وExcel',
          ]}
        />
        <Card
          mode="chauffage"
          icon="🔥"
          title="استشارة التدفئة المركزية"
          subtitle={`استشارة رقم ${heat.settings.numeroConsultation} — ${heat.settings.projet}`}
          color="bg-orange-50"
          infos={[
            `${heat.ouvrages.length} بنود أشغال (مراجل، مضخات، صمامات...)`,
            `دفتر الشروط الكامل (${heat.articles.length} مادة قابلة للتعديل)`,
            'تنقيط تقني (40 نقطة) + ترتيب مالي',
            'جداول الأسعار، DQE، المذكرة التقنية، أمر انطلاق الأشغال',
          ]}
        />
      </div>

      <p className="text-xs text-slate-400 mt-10">
        البيانات تُحفظ تلقائياً في هذا المتصفح — لكل استشارة وحدة مستقلة بملفاتها.
      </p>
    </div>
  );
}
