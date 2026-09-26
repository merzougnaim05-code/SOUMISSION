import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import type {AppState, ArticleItem, Bidder, Committee, Lot, Offer, Settings} from './types';
import {defaultState} from './data/seed';
import {defaultArticles} from './data/texts';

const KEY = 'estichara-state-v2';

interface StoreCtx {
  state: AppState;
  setSettings: (s: Partial<Settings>) => void;
  setLots: (lots: Lot[]) => void;
  setBidders: (b: Bidder[]) => void;
  setOffers: (o: Offer[]) => void;
  setCommittee: (c: Committee) => void;
  setArticles: (a: ArticleItem[]) => void;
  resetAll: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      if (parsed && parsed.lots && parsed.settings) {
        return {...defaultState(), ...parsed, articles: parsed.articles ?? defaultArticles()};
      }
    }
  } catch {
    /* تجاهل */
  }
  return defaultState();
}

export function StoreProvider({children}: {children: ReactNode}) {
  const [state, setState] = useState<AppState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* تجاهل */
    }
  }, [state]);

  const value = useMemo<StoreCtx>(
    () => ({
      state,
      setSettings: (s) => setState((st) => ({...st, settings: {...st.settings, ...s}})),
      setLots: (lots) => setState((st) => ({...st, lots})),
      setBidders: (bidders) => setState((st) => ({...st, bidders})),
      setOffers: (offers) => setState((st) => ({...st, offers})),
      setCommittee: (committee) => setState((st) => ({...st, committee})),
      setArticles: (articles) => setState((st) => ({...st, articles})),
      resetAll: () => setState(defaultState()),
    }),
    [state],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used within StoreProvider');
  return v;
}

/* ============ دوال مساعدة للعمليات الحسابية ============ */

export function fmt(n: number): string {
  return new Intl.NumberFormat('fr-DZ', {maximumFractionDigits: 2}).format(n || 0);
}

export function fmtDate(iso: string): string {
  if (!iso) return '....../......';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '....../......';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** مجموع عرض متعهد على حصة: {أدنى، أقصى} */
export function offerTotals(
  lot: Lot,
  offer: Offer | undefined,
): {min: number; max: number; complete: boolean} {
  if (!offer) return {min: 0, max: 0, complete: false};
  let min = 0;
  let max = 0;
  let complete = lot.materiaux.length > 0;
  for (const mat of lot.materiaux) {
    const p = offer.prix[mat.id];
    if (p === undefined || p === null || isNaN(p) || p <= 0) complete = false;
    else {
      min += p * mat.qteMin;
      max += p * mat.qteMax;
    }
  }
  return {min, max, complete};
}

/** ترتيب العروض على حصة معينة (العرض الأقل ثمناً أولاً حسب المبلغ الأقصى) */
export function rankLot(
  lot: Lot,
  bidders: Bidder[],
  offers: Offer[],
): {bidder: Bidder; totals: {min: number; max: number; complete: boolean}; rank: number | null}[] {
  const rows = bidders.map((bidder) => {
    const offer = offers.find((o) => o.bidderId === bidder.id && o.lotId === lot.id);
    return {bidder, totals: offerTotals(lot, offer), rank: null as number | null};
  });
  const sorted = [...rows].filter((r) => r.totals.complete).sort((a, b) => a.totals.max - b.totals.max);
  sorted.forEach((r, i) => (r.rank = i + 1));
  return rows;
}
