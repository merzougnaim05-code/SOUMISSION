import {useEffect, useState} from 'react';
import {StoreProvider, useStore} from './store';
import {HeatProvider, useHeat} from './heatStore';
import {Flag} from './components/Flag';
import {Home} from './pages/Home';
import {DashboardPage} from './pages/Dashboard';
import {LotsPage} from './pages/Lots';
import {BiddersPage} from './pages/Bidders';
import {OffersPage, EvaluationPage} from './pages/Offers';
import {TextsPage} from './pages/Texts';
import {DocumentsPage} from './pages/Documents';
import {HeatDashboard} from './pages/HeatDashboard';
import {HeatOuvragesPage} from './pages/HeatOuvrages';
import {HeatEntrepreneursPage} from './pages/HeatEntrepreneurs';
import {HeatEvaluationPage, HeatOffersPage} from './pages/HeatOffers';
import {HeatTextsPage} from './pages/HeatTexts';
import {HeatDocumentsPage} from './pages/heat/Documents';

type Mode = 'home' | 'cantine' | 'chauffage';
type Tab = string;

const CANTINE_TABS: {key: Tab; label: string}[] = [
  {key: 'dash', label: 'المدخل'},
  {key: 'lots', label: 'الحصص والمواد'},
  {key: 'bidders', label: 'المتعهدون'},
  {key: 'offers', label: 'العروض'},
  {key: 'eval', label: 'التقييم'},
  {key: 'texts', label: 'دفاتر الشروط'},
  {key: 'docs', label: 'الوثائق للطباعة'},
];

const HEAT_TABS: {key: Tab; label: string}[] = [
  {key: 'dash', label: 'المدخل'},
  {key: 'ouvrages', label: 'بنود الأشغال'},
  {key: 'entrepreneurs', label: 'المقاولات'},
  {key: 'offers', label: 'العروض'},
  {key: 'eval', label: 'التقييم'},
  {key: 'texts', label: 'دفتر الشروط'},
  {key: 'docs', label: 'الوثائق للطباعة'},
];

function CantineShell({onHome}: {onHome: () => void}) {
  const [tab, setTab] = useState<Tab>('dash');
  const {state} = useStore();
  const s = state.settings;

  return (
    <div className="min-h-screen bg-slate-200/70 flex flex-col">
      <header className="no-print sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white border-b-4 border-amber-500 shadow-xl backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Flag />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight whitespace-nowrap">
                  استشارة تموين المطعم 🍽
                </span>
                <span className="bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {state.lots.length} حصص
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-200/80 truncate max-w-[280px] sm:max-w-none">
                {s.institution} — السنة المالية {s.annee}
              </div>
            </div>
          </div>
          <div className="flex-1" />
          <nav className="flex flex-wrap gap-1.5">
            {CANTINE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition ${
                  tab === t.key ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-emerald-100 hover:bg-emerald-800/80'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <button
            onClick={onHome}
            className="flex items-center gap-1 bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-400/40 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0"
            title="العودة إلى بوابة البرنامج"
          >
            ⌂ البوابة
          </button>
        </div>
      </header>
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-5">
        {tab === 'dash' && <DashboardPage />}
        {tab === 'lots' && <LotsPage />}
        {tab === 'bidders' && <BiddersPage />}
        {tab === 'offers' && <OffersPage />}
        {tab === 'eval' && <EvaluationPage />}
        {tab === 'texts' && <TextsPage />}
        {tab === 'docs' && <DocumentsPage />}
      </main>
      <footer className="no-print bg-slate-900 text-slate-400 text-xs py-4 px-4 text-center border-t border-slate-800">
        يتم حفظ البيانات تلقائياً في هذا المتصفح.
      </footer>
    </div>
  );
}

function HeatShell({onHome}: {onHome: () => void}) {
  const [tab, setTab] = useState<Tab>('dash');
  const {state} = useHeat();
  const s = state.settings;

  // استقبال طلبات التنقل من أزرار التعديل الخاصة بكل وثيقة
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as {tab: Tab; anchor?: string};
      setTab(d.tab);
      setTimeout(() => {
        if (d.anchor) document.getElementById(d.anchor)?.scrollIntoView({behavior: 'smooth', block: 'start'});
        else window.scrollTo({top: 0});
      }, 80);
    };
    window.addEventListener('heat-goto', handler);
    return () => window.removeEventListener('heat-goto', handler);
  }, []);

  return (
    <div className="min-h-screen bg-slate-200/70 flex flex-col">
      <header className="no-print sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white border-b-4 border-amber-500 shadow-xl backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Flag />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight whitespace-nowrap">
                  استشارة الأشغال 🔥
                </span>
                <span className="bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {state.ouvrages.length} بنود
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-200/80 truncate max-w-[280px] sm:max-w-none">
                استشارة رقم {s.numeroConsultation} — {s.projet} — {s.institutionShort}
              </div>
            </div>
          </div>
          <div className="flex-1" />
          <nav className="flex flex-wrap gap-1.5">
            {HEAT_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-xl text-sm font-bold transition ${
                  tab === t.key ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-emerald-100 hover:bg-emerald-800/80'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <button
            onClick={onHome}
            className="flex items-center gap-1 bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-400/40 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0"
            title="العودة إلى بوابة البرنامج"
          >
            ⌂ البوابة
          </button>
        </div>
      </header>
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-5">
        {tab === 'dash' && <HeatDashboard />}
        {tab === 'ouvrages' && <HeatOuvragesPage />}
        {tab === 'entrepreneurs' && <HeatEntrepreneursPage />}
        {tab === 'offers' && <HeatOffersPage />}
        {tab === 'eval' && <HeatEvaluationPage />}
        {tab === 'texts' && <HeatTextsPage />}
        {tab === 'docs' && <HeatDocumentsPage />}
      </main>
      <footer className="no-print bg-slate-900 text-slate-400 text-xs py-4 px-4 text-center border-t border-slate-800">
        يتم حفظ البيانات تلقائياً في هذا المتصفح.
      </footer>
    </div>
  );
}

function Router() {
  const [mode, setMode] = useState<Mode>('home');
  if (mode === 'cantine') return <CantineShell onHome={() => setMode('home')} />;
  if (mode === 'chauffage') return <HeatShell onHome={() => setMode('home')} />;
  return <Home onEnter={setMode} />;
}

import {PrintProvider} from './printSettings';

export default function App() {
  return (
    <StoreProvider>
      <HeatProvider>
        <PrintProvider>
          <Router />
        </PrintProvider>
      </HeatProvider>
    </StoreProvider>
  );
}
