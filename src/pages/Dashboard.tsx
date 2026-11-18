import {useStore} from '../store';
import {Field, Grid, Section} from '../ui';
import {BackupCard} from '../components/BackupCard';

export function DashboardPage() {
  const {state, setSettings, setCommittee, resetAll} = useStore();
  const s = state.settings;
  const iso = (v: string) => v || '';
  const DateInput = ({k, label}: {k: keyof typeof s; label: string}) => (
    <Field label={label}>
      <input
        type="date"
        className="app-input"
        value={iso(s[k] as string)}
        onChange={(e) => setSettings({[k]: e.target.value} as never)}
      />
    </Field>
  );

  return (
    <div>
      <Section
        title="معلومات المؤسسة"
        actions={
          <button className="text-xs text-rose-600 underline" onClick={() => confirm('استعادة البيانات الافتراضية وحذف كل التعديلات؟') && resetAll()}>
            استعادة البيانات الافتراضية
          </button>
        }
      >
        <Grid>
          <Field label="الولاية">
            <input className="app-input" value={s.wilaya} onChange={(e) => setSettings({wilaya: e.target.value})} />
          </Field>
          <Field label="البلدية">
            <input className="app-input" value={s.commune} onChange={(e) => setSettings({commune: e.target.value})} />
          </Field>
          <Field label="المؤسسة">
            <input
              className="app-input"
              value={s.institution}
              onChange={(e) => setSettings({institution: e.target.value})}
            />
          </Field>
          <Field label="اسم ولقب مدير المؤسسة">
            <input
              className="app-input"
              value={s.directeur}
              onChange={(e) => setSettings({directeur: e.target.value})}
            />
          </Field>
          <Field label="الآمر بالصرف">
            <input
              className="app-input"
              value={s.ordonnateur}
              onChange={(e) => setSettings({ordonnateur: e.target.value})}
            />
          </Field>
          <Field label="السنة المالية">
            <input
              type="number"
              className="app-input"
              value={s.annee}
              onChange={(e) => setSettings({annee: Number(e.target.value)})}
            />
          </Field>
        </Grid>
      </Section>

      <Section title="مواعيد الاستشارة">
        <Grid cols={3}>
          <Field label="رقم الإعلان عن الاستشارة">
            <input
              type="number"
              className="app-input"
              value={s.numeroAnnonce}
              onChange={(e) => setSettings({numeroAnnonce: Number(e.target.value)})}
            />
          </Field>
          <Field label="رقم الإعذار الأخير الموجه للممون">
            <input
              type="number"
              className="app-input"
              value={s.azharNum}
              onChange={(e) => setSettings({azharNum: Number(e.target.value) || 1})}
            />
          </Field>
          <DateInput k="dateAnnonce" label="تاريخ الإعلان عن الاستشارة" />
          <DateInput k="dateDepot" label="آخر أجل لإيداع العروض" />
          <Field label="ساعة الإيداع">
            <input
              type="time"
              className="app-input"
              value={s.heureDepot}
              onChange={(e) => setSettings({heureDepot: e.target.value})}
            />
          </Field>
          <DateInput k="dateOuverture" label="تاريخ فتح الأظرفة" />
          <Field label="ساعة فتح الأظرفة">
            <input
              type="time"
              className="app-input"
              value={s.heureOuverture}
              onChange={(e) => setSettings({heureOuverture: e.target.value})}
            />
          </Field>
          <Field label="آجل تحضير العروض (أيام)">
            <input
              type="number"
              className="app-input"
              value={s.delaiJours}
              onChange={(e) => setSettings({delaiJours: Number(e.target.value)})}
            />
          </Field>
          <DateInput k="dateSessionConseil" label="تاريخ جلسة مجلس التربية والتسيير" />
        </Grid>
      </Section>

      <Section title="فترة العقد">
        <Grid cols={3}>
          <DateInput k="contractFrom" label="من" />
          <DateInput k="contractTo" label="إلى" />
          <Field label="عدد أيام المشروع">
            <input
              type="number"
              className="app-input"
              value={s.dureeJours}
              onChange={(e) => setSettings({dureeJours: Number(e.target.value)})}
            />
          </Field>
        </Grid>
      </Section>

      <Section
        title="لجنة فتح الأظرفة وتقييم العروض"
        actions={
          <button
            type="button"
            className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-teal-700 hover:bg-teal-800 text-white inline-flex items-center gap-1.5 transition"
            onClick={() =>
              setCommittee({...state.committee, membres: [...state.committee.membres, '']})
            }
          >
            ➕ إضافة عضو
          </button>
        }
      >
        <Grid cols={2}>
          <Field label="رئيس اللجنة">
            <input
              className="app-input"
              value={state.committee.president}
              onChange={(e) => setCommittee({...state.committee, president: e.target.value})}
            />
          </Field>
        </Grid>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {state.committee.membres.map((mm, i) => (
            <Field key={i} label={`العضو ${i + 1}`}>
              <div className="flex items-center gap-2">
                <input
                  className="app-input flex-1"
                  value={mm}
                  onChange={(e) => {
                    const membres = [...state.committee.membres];
                    membres[i] = e.target.value;
                    setCommittee({...state.committee, membres});
                  }}
                />
                <button
                  type="button"
                  title="حذف العضو"
                  className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition shrink-0"
                  onClick={() => {
                    if (!confirm(`حذف العضو ${i + 1}؟`)) return;
                    setCommittee({
                      ...state.committee,
                      membres: state.committee.membres.filter((_, j) => j !== i),
                    });
                  }}
                >
                  ✕ حذف
                </button>
              </div>
            </Field>
          ))}
          {state.committee.membres.length === 0 && (
            <div className="text-sm text-slate-400">لا يوجد أعضاء حالياً — استعمل زر «إضافة عضو».</div>
          )}
        </div>
      </Section>
      <SignaturesSection />
      <BackupCard />
    </div>
  );
}

/** رفع صورتي توقيع المدير والختم الرسمي — تُدرجان آلياً في خانات «مدير المؤسسة» */
function SignaturesSection() {
  const {state, setSettings} = useStore();
  const sig = state.settings.signDirector;
  const stamp = state.settings.stampImg;

  const readImage = (file: File, apply: (data: string) => void) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      // تصغير الصورة حفاظاً على مساحة التخزين
      const maxW = 420;
      const maxH = 280;
      const scale = Math.min(1, maxW / img.width, maxH / img.height);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      apply(canvas.toDataURL('image/png'));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const picker = (apply: (data: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) readImage(f, apply);
    };
    input.click();
  };

  return (
    <Section title="التوقيع والختم — يُدرجان آلياً في الوثائق">
      <Grid cols={2}>
        <Field label="توقيع مدير المؤسسة">
          <div className="flex items-center gap-3">
            {sig ? (
              <>
                <img src={sig} alt="التوقيع" className="h-14 border border-slate-200 rounded bg-white" />
                <button className="text-xs text-rose-600 underline" onClick={() => setSettings({signDirector: ''})}>
                  حذف
                </button>
              </>
            ) : (
              <button
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-sm font-semibold hover:bg-slate-50"
                onClick={() => picker((d) => setSettings({signDirector: d}))}
              >
                🖼 رفع صورة التوقيع
              </button>
            )}
          </div>
        </Field>
        <Field label="الختم الرسمي">
          <div className="flex items-center gap-3">
            {stamp ? (
              <>
                <img src={stamp} alt="الختم" className="h-14 border border-slate-200 rounded bg-white" />
                <button className="text-xs text-rose-600 underline" onClick={() => setSettings({stampImg: ''})}>
                  حذف
                </button>
              </>
            ) : (
              <button
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-sm font-semibold hover:bg-slate-50"
                onClick={() => picker((d) => setSettings({stampImg: d}))}
              >
                🖼 رفع صورة الختم
              </button>
            )}
          </div>
        </Field>
      </Grid>
      <p className="text-xs text-slate-400">
        ارفع كل صورة مرة واحدة (يُفضَّل بخلفية شفافة PNG) — تظهر تلقائياً في نهاية الإعلانات والمحاضر ووثائق المنح
        تحت خانة «مدير المؤسسة».
      </p>
    </Section>
  );
}
