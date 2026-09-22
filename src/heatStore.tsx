import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import type {Committee, Entrepreneur, HeatArticle, HeatOffer, HeatSettings, HeatState, Ouvrage} from './types';
import {defaultHeatState} from './data/heatSeed';

const KEY = 'estichara-heat-v2';

interface HeatCtx {
  state: HeatState;
  setSettings: (s: Partial<HeatSettings>) => void;
  setOuvrages: (o: Ouvrage[]) => void;
  setEntrepreneurs: (e: Entrepreneur[]) => void;
  setOffers: (o: HeatOffer[]) => void;
  setCommittee: (c: Committee) => void;
  setArticles: (a: HeatArticle[]) => void;
  resetAll: () => void;
}

const Ctx = createContext<HeatCtx | null>(null);

function load(): HeatState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<HeatState>;
      if (parsed && parsed.settings && parsed.ouvrages) return {...defaultHeatState(), ...parsed};
    }
  } catch {
    /* تجاهل */
  }
  return defaultHeatState();
}

export function HeatProvider({children}: {children: ReactNode}) {
  const [state, setState] = useState<HeatState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* تجاهل */
    }
  }, [state]);

  const value = useMemo<HeatCtx>(
    () => ({
      state,
      setSettings: (s) => setState((st) => ({...st, settings: {...st.settings, ...s}})),
      setOuvrages: (ouvrages) => setState((st) => ({...st, ouvrages})),
      setEntrepreneurs: (entrepreneurs) => setState((st) => ({...st, entrepreneurs})),
      setOffers: (offers) => setState((st) => ({...st, offers})),
      setCommittee: (committee) => setState((st) => ({...st, committee})),
      setArticles: (articles) => setState((st) => ({...st, articles})),
      resetAll: () => setState(defaultHeatState()),
    }),
    [state],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHeat(): HeatCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useHeat must be used within HeatProvider');
  return v;
}

/* ============ حسابات التقييم (حسب منهجية دفتر الشروط) ============ */

export interface TechScore {
  humaines: number; // /15
  materielles: number; // /20
  delai: number; // /5
  total: number; // /40
  qualified: boolean; // ≥ 20
}

export function techScore(e: Entrepreneur, minDelai: number): TechScore {
  const humaines = Math.min(5, e.nbSpecialises > 0 ? 5 : 0) + Math.min(10, e.nbOuvriers * 2);
  const materielles =
    (e.camion ? 13 : 0) + (e.soudure ? 4 : 0) + (e.cintrage ? 1 : 0) + (e.forage ? 1 : 0) + (e.construction ? 1 : 0);
  const delaiOk = e.delaiPropose > 0 && e.delaiPropose <= 30;
  const delai = delaiOk && minDelai > 0 ? Math.round((5 * minDelai) / e.delaiPropose) : 0;
  const total = humaines + materielles + delai;
  return {humaines, materielles, delai, total, qualified: total >= 20};
}

export function minDelai(entrepreneurs: Entrepreneur[]): number {
  const ds = entrepreneurs.map((e) => e.delaiPropose).filter((d) => d > 0 && d <= 30);
  return ds.length ? Math.min(...ds) : 0;
}

/** مجموع عرض مالي: {HT, TVA, TTC} */
export function heatTotals(
  ouvrages: Ouvrage[],
  offer: HeatOffer | undefined,
  tva: number,
): {ht: number; tvaAmount: number; ttc: number; complete: boolean} {
  if (!offer) return {ht: 0, tvaAmount: 0, ttc: 0, complete: false};
  let ht = 0;
  let complete = ouvrages.length > 0;
  for (const o of ouvrages) {
    const p = offer.prix[o.id];
    if (p === undefined || p === null || isNaN(p) || p <= 0) complete = false;
    else ht += p * o.qte;
  }
  const tvaAmount = Math.round(ht * (tva / 100));
  return {ht, tvaAmount, ttc: ht + tvaAmount, complete};
}

/** ترتيب العروض: المؤهلون تقنياً ثم الأقل ثمناً (TTC) */
export function rankHeat(state: HeatState) {
  const minD = minDelai(state.entrepreneurs);
  const rows = state.entrepreneurs.map((e) => {
    const offer = state.offers.find((o) => o.entrepreneurId === e.id);
    const totals = heatTotals(state.ouvrages, offer, state.settings.tva);
    const tech = techScore(e, minD);
    return {entrepreneur: e, totals, tech, rank: null as number | null};
  });
  const eligible = rows
    .filter((r) => r.tech.qualified && r.totals.complete)
    .sort((a, b) => a.totals.ttc - b.totals.ttc || a.entrepreneur.delaiPropose - b.entrepreneur.delaiPropose || b.tech.total - a.tech.total);
  eligible.forEach((r, i) => (r.rank = i + 1));
  return rows;
}
