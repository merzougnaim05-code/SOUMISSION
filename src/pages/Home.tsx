import {useHeat} from '../heatStore';
import {useStore} from '../store';

/** بوابة الدخول — بنفس أسلوب بوابة موقع invantaire (الدمغة الرسمية + إطار الإحصاء + زرا الوحدتين) */
export function Home({onEnter}: {onEnter: (m: 'cantine' | 'chauffage') => void}) {
  const {state: cantine} = useStore();
  const {state: heat} = useHeat();
  const wilaya = cantine.settings.wilaya || '—';
  const institution = cantine.settings.institution || '—';
  const lots = cantine.lots.length;
  const ouvrages = heat.ouvrages.length;
  const articles = heat.articles.length;
  const total = lots + ouvrages;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-stone-50 to-emerald-50 text-slate-800 flex flex-col justify-between">
      {/* الشريط الجمهوري العلوي */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-md border-b-4 border-amber-500 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3 text-xs md:text-sm font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>برنامج الاستشارات العمومية — إعداد دفاتر الشروط وإدارة العروض</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-emerald-100">
            <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
            <span>•</span>
            <span>وزارة التربية الوطنية</span>
          </div>
        </div>
      </div>

      {/* البطاقة الرئيسية للبوابة */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-10 w-full">
        <div className="max-w-6xl w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-200/80 p-6 md:p-12 relative">
          {/* زخارف خلفية خفيفة */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
          </div>

          {/* الدمغة الرسمية والترويسة */}
          <div className="border-b border-emerald-100 pb-6 mb-8 text-center relative">
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-amber-500/80 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 flex flex-col items-center justify-center shadow-lg text-white p-2">
                  <div className="w-16 h-16 rounded-full border border-amber-300/40 flex items-center justify-center bg-emerald-950/40 text-4xl">
                    ⚖️
                  </div>
                </div>
                <div className="absolute -bottom-2 bg-amber-500 text-slate-950 text-[11px] font-black px-3 py-0.5 rounded-full shadow-md border border-amber-200">
                  وثائق رسمية معتمدة
                </div>
              </div>

              <h2 className="text-sm md:text-base font-bold text-slate-700 tracking-wide mb-1">
                الجمهورية الجزائرية الديمقراطية الشعبية
              </h2>
              <h3 className="text-xs md:text-sm font-semibold text-emerald-800 mb-2">وزارة التربية الوطنية</h3>

              <div className="flex items-center justify-center gap-3 text-xs md:text-sm text-slate-600 font-medium flex-wrap">
                <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  مديرية التربية لولاية: <b className="text-slate-900">{wilaya}</b>
                </span>
                <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  المؤسسة: <b className="text-emerald-800">{institution}</b>
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mt-4 tracking-tight">برنامج الاستشارات</h1>
              <p className="text-sm md:text-lg text-slate-500 max-w-2xl mt-2 leading-relaxed">
                النظام الرقمي لإدارة استشارات تموين المطعم المدرسي والأشغال — دفاتر الشروط، مقارنة العروض، التقييم، والوثائق الجاهزة للطباعة
              </p>
            </div>
          </div>

          {/* إطار الإحصاء العام */}
          <div className="mb-8">
            <div className="relative rounded-2xl p-1 bg-gradient-to-r from-amber-500 via-emerald-600 to-amber-500 shadow-xl">
              <div className="bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-900 rounded-[14px] p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute top-2 right-2 text-amber-400/30 text-xs font-mono select-none">❖ ❖ ❖</div>
                <div className="absolute bottom-2 left-2 text-amber-400/30 text-xs font-mono select-none">❖ ❖ ❖</div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5 text-center md:text-right">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 text-4xl">
                      📋
                    </div>
                    <div>
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                          إحصاء الاستشارات الجارية
                        </span>
                      </div>
                      <div className="text-3xl md:text-5xl font-black text-white mt-1 tracking-tight">
                        {total.toLocaleString('ar-DZ')}
                        <span className="text-lg md:text-2xl font-bold text-amber-400 mr-2">حصة وبند أشغال</span>
                      </div>
                      <p className="text-xs md:text-sm text-emerald-200/80 mt-1">
                        إجمالي حصص التموين وبنود الأشغال المقيدة في وحدتي البرنامج
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 w-full md:w-auto border-t md:border-t-0 md:border-r border-emerald-800/80 pt-4 md:pt-0 md:pr-6">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-emerald-300 mb-1">
                        <span>🍽 الحصص</span>
                      </div>
                      <div className="text-lg md:text-xl font-bold text-white">{lots.toLocaleString('ar-DZ')}</div>
                      <div className="text-[10px] text-slate-400">حصة تموين</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-emerald-300 mb-1">
                        <span>🔥 الأشغال</span>
                      </div>
                      <div className="text-lg md:text-xl font-bold text-white">{ouvrages.toLocaleString('ar-DZ')}</div>
                      <div className="text-[10px] text-slate-400">بند أشغال</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1 text-xs text-emerald-300 mb-1">
                        <span>📜 المواد</span>
                      </div>
                      <div className="text-lg md:text-xl font-bold text-amber-300">{articles.toLocaleString('ar-DZ')}</div>
                      <div className="text-[10px] text-slate-400">مادة بدفتر الشروط</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between flex-wrap text-[11px] text-slate-300 gap-2">
                  <span className="text-amber-300">وفق دفاتر الشروط النموذجية للمنشآت التربوية</span>
                  <span className="text-emerald-400">السنة المالية: {cantine.settings.annee}</span>
                </div>
              </div>
            </div>
          </div>

          {/* زرا الوحدتين الكبيران */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => onEnter('cantine')}
              className="group min-h-[180px] md:min-h-[220px] bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 text-white rounded-3xl shadow-xl shadow-emerald-700/30 p-8 flex flex-col items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer border-2 border-emerald-500/50"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/15 border border-white/25 flex items-center justify-center shadow-inner text-5xl">
                🍽
              </div>
              <span className="text-2xl md:text-3xl font-black">استشارة تموين المطعم</span>
              <span className="text-sm md:text-base text-emerald-100 font-medium">
                {lots.toLocaleString('ar-DZ')} حصص • السنة المالية {cantine.settings.annee} — دفتر الشروط والعروض والتقييم
              </span>
              <span className="mt-1 flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full text-sm font-bold">
                الدخول إلى الوحدة ←
              </span>
            </button>

            <button
              type="button"
              onClick={() => onEnter('chauffage')}
              className="group min-h-[180px] md:min-h-[220px] bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 hover:from-amber-500 hover:to-orange-700 text-slate-950 rounded-3xl shadow-xl shadow-amber-500/30 p-8 flex flex-col items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer border-2 border-amber-300/70"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-950/10 border border-slate-950/15 flex items-center justify-center shadow-inner text-5xl">
                🔥
              </div>
              <span className="text-2xl md:text-3xl font-black">استشارة الأشغال</span>
              <span className="text-sm md:text-base text-slate-800 font-medium">
                استشارة رقم {heat.settings.numeroConsultation} • {ouvrages.toLocaleString('ar-DZ')} بند أشغال و{articles.toLocaleString('ar-DZ')} مادة
              </span>
              <span className="mt-1 flex items-center gap-2 bg-slate-950/10 px-4 py-1.5 rounded-full text-sm font-bold">
                الدخول إلى الوحدة ←
              </span>
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center mt-6">
            البيانات تُحفظ تلقائياً في هذا المتصفح — لكل استشارة وحدة مستقلة بملفاتها.
          </p>
        </div>
      </div>

      {/* التذييل */}
      <footer className="text-center text-xs text-slate-500 py-4 px-4 bg-white/80 border-t border-slate-200">
        برنامج الاستشارات — تطبيق ويب يعمل محلياً داخل المتصفح مع حفظ تلقائي للبيانات
      </footer>
    </div>
  );
}
