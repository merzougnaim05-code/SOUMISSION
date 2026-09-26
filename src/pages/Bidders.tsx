import {useState} from 'react';
import type {Bidder} from '../types';
import {useStore} from '../store';
import {Btn, Field, Grid, Section} from '../ui';

export function BiddersPage() {
  const {state, setBidders, setOffers} = useStore();
  const [selected, setSelected] = useState<string | null>(state.bidders[0]?.id ?? null);

  const addBidder = () => {
    const b: Bidder = {
      id: `b${Date.now()}`,
      nom: '',
      formeJuridique: 'شخص طبيعي',
      rc: '',
      activite: '',
      nif: '',
      nis: '',
      rib: '',
      banque: '',
      agence: '',
      adresse: '',
      gerant: '',
    };
    setBidders([...state.bidders, b]);
    setSelected(b.id);
  };

  const updateBidder = (id: string, patch: Partial<Bidder>) =>
    setBidders(state.bidders.map((b) => (b.id === id ? {...b, ...patch} : b)));

  const removeBidder = (id: string) => {
    setBidders(state.bidders.filter((b) => b.id !== id));
    setOffers(state.offers.filter((o) => o.bidderId !== id));
    if (selected === id) setSelected(null);
  };

  const bidder = state.bidders.find((b) => b.id === selected);

  return (
    <div>
      <Section
        title="المتعهدون المشاركون في الاستشارة"
        actions={<Btn onClick={addBidder}>+ إضافة متعهد</Btn>}
      >
        {state.bidders.length === 0 && <p className="text-sm text-slate-500">لا يوجد متعهدون بعد.</p>}
        <div className="flex flex-wrap gap-2">
          {state.bidders.map((b, i) => (
            <div
              key={b.id}
              className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer ${
                selected === b.id ? 'border-teal-700 bg-teal-50' : 'border-slate-200 bg-white'
              }`}
              onClick={() => setSelected(b.id)}
            >
              <span className="text-xs text-slate-400">{i + 1}</span>
              <span className="font-semibold text-sm">{b.nom || '(بدون اسم)'}</span>
              <button
                className="text-rose-400 hover:text-rose-600 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`حذف المتعهد "${b.nom}" وكل عروضه؟`)) removeBidder(b.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </Section>

      {bidder && (
        <Section title={`معلومات المتعهد: ${bidder.nom || '(بدون اسم)'}`}>
          <Grid>
            <Field label="الاسم واللقب / تسمية الشركة">
              <input className="app-input" value={bidder.nom} onChange={(e) => updateBidder(bidder.id, {nom: e.target.value})} />
            </Field>
            <Field label="الشكل القانوني">
              <input
                className="app-input"
                value={bidder.formeJuridique}
                onChange={(e) => updateBidder(bidder.id, {formeJuridique: e.target.value})}
              />
            </Field>
            <Field label="رقم السجل التجاري">
              <input className="app-input" value={bidder.rc} onChange={(e) => updateBidder(bidder.id, {rc: e.target.value})} />
            </Field>
            <Field label="النشاط">
              <input
                className="app-input"
                value={bidder.activite}
                onChange={(e) => updateBidder(bidder.id, {activite: e.target.value})}
              />
            </Field>
            <Field label="الرقم الجبائي (NIF)">
              <input className="app-input" value={bidder.nif} onChange={(e) => updateBidder(bidder.id, {nif: e.target.value})} />
            </Field>
            <Field label="رقم البطاقة الجبائية (NIS)">
              <input className="app-input" value={bidder.nis} onChange={(e) => updateBidder(bidder.id, {nis: e.target.value})} />
            </Field>
            <Field label="المسير / الممثل القانوني">
              <input
                className="app-input"
                value={bidder.gerant}
                onChange={(e) => updateBidder(bidder.id, {gerant: e.target.value})}
              />
            </Field>
            <Field label="العنوان">
              <input
                className="app-input"
                value={bidder.adresse}
                onChange={(e) => updateBidder(bidder.id, {adresse: e.target.value})}
              />
            </Field>
            <Field label="رقم الحساب البنكي (RIB)">
              <input className="app-input" value={bidder.rib} onChange={(e) => updateBidder(bidder.id, {rib: e.target.value})} />
            </Field>
            <Field label="البنك">
              <input
                className="app-input"
                value={bidder.banque}
                onChange={(e) => updateBidder(bidder.id, {banque: e.target.value})}
              />
            </Field>
            <Field label="الوكالة">
              <input
                className="app-input"
                value={bidder.agence}
                onChange={(e) => updateBidder(bidder.id, {agence: e.target.value})}
              />
            </Field>
          </Grid>
        </Section>
      )}
    </div>
  );
}
