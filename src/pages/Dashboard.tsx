import {useStore} from '../store';
import {Field, Grid, Section} from '../ui';

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
        <Grid cols={2}>
          <DateInput k="contractFrom" label="من" />
          <DateInput k="contractTo" label="إلى" />
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
    </div>
  );
}
