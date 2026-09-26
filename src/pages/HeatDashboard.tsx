import {useHeat} from '../heatStore';
import {Field, Grid, Section} from '../ui';

export function HeatDashboard() {
  const {state, setSettings, setCommittee, resetAll} = useHeat();
  const s = state.settings;

  return (
    <div>
      <Section
        title="معلومات العملية"
        actions={
          <button
            className="text-xs text-rose-600 underline"
            onClick={() => confirm('استعادة البيانات الافتراضية لاستشارة التدفئة وحذف كل التعديلات؟') && resetAll()}
          >
            استعادة البيانات الافتراضية
          </button>
        }
      >
        <Grid>
          <Field label="رقم الاستشارة">
            <input className="app-input" value={s.numeroConsultation} onChange={(e) => setSettings({numeroConsultation: e.target.value})} />
          </Field>
          <Field label="السنة">
            <input type="number" className="app-input" value={s.annee} onChange={(e) => setSettings({annee: Number(e.target.value)})} />
          </Field>
          <Field label="المؤسسة (الاسم الكامل)" wide>
            <input className="app-input" value={s.institution} onChange={(e) => setSettings({institution: e.target.value})} />
          </Field>
          <Field label="المؤسسة (الاسم المختصر)" wide>
            <input className="app-input" value={s.institutionShort} onChange={(e) => setSettings({institutionShort: e.target.value})} />
          </Field>
          <Field label="مدير المؤسسة">
            <input className="app-input" value={s.directeur} onChange={(e) => setSettings({directeur: e.target.value})} />
          </Field>
          <Field label="الولاية">
            <input className="app-input" value={s.wilaya} onChange={(e) => setSettings({wilaya: e.target.value})} />
          </Field>
          <Field label="البلدية">
            <input className="app-input" value={s.commune} onChange={(e) => setSettings({commune: e.target.value})} />
          </Field>
          <Field label="عنوان العملية (المشروع)" wide>
            <input className="app-input" value={s.projet} onChange={(e) => setSettings({projet: e.target.value})} />
          </Field>
          <Field label="ميدان التأهيل">
            <input className="app-input" value={s.domaine} onChange={(e) => setSettings({domaine: e.target.value})} />
          </Field>
          <Field label="الدرجة">
            <input className="app-input" value={s.degre} onChange={(e) => setSettings({degre: e.target.value})} />
          </Field>
          <Field label="النشاط">
            <input className="app-input" value={s.activite} onChange={(e) => setSettings({activite: e.target.value})} />
          </Field>
        </Grid>
      </Section>

      <Section title="المواعيد والآجال">
        <Grid cols={3}>
          <Field label="تاريخ الإعلان">
            <input type="date" className="app-input" value={s.dateAnnonce} onChange={(e) => setSettings({dateAnnonce: e.target.value})} />
          </Field>
          <Field label="تاريخ إيداع العروض">
            <input type="date" className="app-input" value={s.dateDepot} onChange={(e) => setSettings({dateDepot: e.target.value})} />
          </Field>
          <Field label="ساعة الإيداع">
            <input type="time" className="app-input" value={s.heureDepot} onChange={(e) => setSettings({heureDepot: e.target.value})} />
          </Field>
          <Field label="ساعة فتح الأظرفة">
            <input type="time" className="app-input" value={s.heureOuverture} onChange={(e) => setSettings({heureOuverture: e.target.value})} />
          </Field>
          <Field label="مدة تحضير العروض (أيام)">
            <input type="number" className="app-input" value={s.delaiPreparation} onChange={(e) => setSettings({delaiPreparation: Number(e.target.value)})} />
          </Field>
          <Field label="مدة الإنجاز (أيام)">
            <input type="number" className="app-input" value={s.delaiRealisation} onChange={(e) => setSettings({delaiRealisation: Number(e.target.value)})} />
          </Field>
          <Field label="صلاحية العروض (أيام)">
            <input type="number" className="app-input" value={s.delaiValidite} onChange={(e) => setSettings({delaiValidite: Number(e.target.value)})} />
          </Field>
          <Field label="حقوق المشاركة (دج)">
            <input type="number" className="app-input" value={s.fraisParticipation} onChange={(e) => setSettings({fraisParticipation: Number(e.target.value)})} />
          </Field>
          <Field label="نسبة TVA (%)">
            <input type="number" className="app-input" value={s.tva} onChange={(e) => setSettings({tva: Number(e.target.value)})} />
          </Field>
        </Grid>
      </Section>

      <Section title="لجنة فتح الأظرفة وتقييم العروض">
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
              <input
                className="app-input"
                value={mm}
                onChange={(e) => {
                  const membres = [...state.committee.membres];
                  membres[i] = e.target.value;
                  setCommittee({...state.committee, membres});
                }}
              />
            </Field>
          ))}
        </div>
      </Section>
    </div>
  );
}
