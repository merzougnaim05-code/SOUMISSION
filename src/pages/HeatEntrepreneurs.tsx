import {useState} from 'react';
import {useHeat} from '../heatStore';
import {newEntrepreneur} from '../data/heatSeed';
import type {Entrepreneur} from '../types';
import {Btn, Field, Grid, NumInput, Section} from '../ui';

/** المقاولات المتنافسة + معطيات التنقيط التقني */
export function HeatEntrepreneursPage() {
  const {state, setEntrepreneurs} = useHeat();
  const [selected, setSelected] = useState<string | null>(state.entrepreneurs[0]?.id ?? null);

  const add = () => {
    const e = newEntrepreneur(`e${Date.now()}`);
    setEntrepreneurs([...state.entrepreneurs, e]);
    setSelected(e.id);
  };
  const upd = (id: string, patch: Partial<Entrepreneur>) =>
    setEntrepreneurs(state.entrepreneurs.map((e) => (e.id === id ? {...e, ...patch} : e)));
  const remove = (id: string) => {
    setEntrepreneurs(state.entrepreneurs.filter((e) => e.id !== id));
    if (selected === id) setSelected(null);
  };

  const e = state.entrepreneurs.find((x) => x.id === selected);
  const Check = ({k, label, pts}: {k: keyof Entrepreneur; label: string; pts: string}) => (
    <label className="flex items-center gap-2 text-sm border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-50">
      <input
        type="checkbox"
        checked={Boolean(e?.[k])}
        onChange={(ev) => e && upd(e.id, {[k]: ev.target.checked} as Partial<Entrepreneur>)}
      />
      <span className="font-semibold">{label}</span>
      <span className="text-xs text-slate-400">({pts})</span>
    </label>
  );

  return (
    <div>
      <Section title="المقاولات المتنافسة" actions={<Btn onClick={add}>+ إضافة مقاولة</Btn>}>
        {state.entrepreneurs.length === 0 && <p className="text-sm text-slate-500">لا توجد مقاولات بعد.</p>}
        <div className="flex flex-wrap gap-2">
          {state.entrepreneurs.map((x, i) => (
            <div
              key={x.id}
              onClick={() => setSelected(x.id)}
              className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer ${
                selected === x.id ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white'
              }`}
            >
              <span className="text-xs text-slate-400">{i + 1}</span>
              <span className="font-semibold text-sm">{x.nom || '(بدون اسم)'}</span>
              <button
                className="text-rose-400 hover:text-rose-600 text-sm"
                onClick={(ev) => {
                  ev.stopPropagation();
                  if (confirm(`حذف مقاولة "${x.nom}" وعرضها؟`)) remove(x.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </Section>

      {e && (
        <>
          <Section title={`معلومات المقاولة: ${e.nom || '(بدون اسم)'}`}>
            <Grid>
              <Field label="تسمية المقاولة">
                <input className="app-input" value={e.nom} onChange={(ev) => upd(e.id, {nom: ev.target.value})} />
              </Field>
              <Field label="الشكل القانوني">
                <input className="app-input" value={e.formeJuridique} onChange={(ev) => upd(e.id, {formeJuridique: ev.target.value})} />
              </Field>
              <Field label="رقم السجل التجاري">
                <input className="app-input" value={e.rc} onChange={(ev) => upd(e.id, {rc: ev.target.value})} />
              </Field>
              <Field label="الرقم الجبائي (NIF)">
                <input className="app-input" value={e.nif} onChange={(ev) => upd(e.id, {nif: ev.target.value})} />
              </Field>
              <Field label="الرقم الإحصائي (NIS)">
                <input className="app-input" value={e.nis} onChange={(ev) => upd(e.id, {nis: ev.target.value})} />
              </Field>
              <Field label="الممثل القانوني">
                <input className="app-input" value={e.gerant} onChange={(ev) => upd(e.id, {gerant: ev.target.value})} />
              </Field>
              <Field label="الهاتف">
                <input className="app-input" value={e.tel} onChange={(ev) => upd(e.id, {tel: ev.target.value})} />
              </Field>
              <Field label="العنوان">
                <input className="app-input" value={e.adresse} onChange={(ev) => upd(e.id, {adresse: ev.target.value})} />
              </Field>
              <Field label="البنك">
                <input className="app-input" value={e.banque} onChange={(ev) => upd(e.id, {banque: ev.target.value})} />
              </Field>
              <Field label="الوكالة">
                <input className="app-input" value={e.agence} onChange={(ev) => upd(e.id, {agence: ev.target.value})} />
              </Field>
              <Field label="RIB">
                <input className="app-input" value={e.rib} onChange={(ev) => upd(e.id, {rib: ev.target.value})} />
              </Field>
            </Grid>
          </Section>

          <Section title="التنقيط التقني (حسب دفتر الشروط)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="عدد العمال المتخصصين في التدفئة المركزية (05 نقاط لواحد)">
                <NumInput value={e.nbSpecialises} onChange={(v) => upd(e.id, {nbSpecialises: v})} />
              </Field>
              <Field label="عدد عمال الورشة (نقطتان لكل عامل — حد 10)">
                <NumInput value={e.nbOuvriers} onChange={(v) => upd(e.id, {nbOuvriers: v})} />
              </Field>
              <Field label="المدة المقترحة للإنجاز (يوم — حد 30)">
                <NumInput value={e.delaiPropose} onChange={(v) => upd(e.id, {delaiPropose: v})} />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              <Check k="camion" label="شاحنة" pts="13 نقطة" />
              <Check k="soudure" label="آلات التلحيم والغاز" pts="04 نقاط" />
              <Check k="cintrage" label="معدات ثني الأنابيب" pts="01 نقطة" />
              <Check k="forage" label="آلات الحفر" pts="01 نقطة" />
              <Check k="construction" label="معدات البناء" pts="01 نقطة" />
            </div>
            <p className="text-xs text-slate-500 mt-3">
              العلامة الدنيا للتأهل للمرحلة المالية: 20 نقطة من 40 (بشرية 15 + مادية 20 + آجال 5).
            </p>
          </Section>
        </>
      )}
    </div>
  );
}
