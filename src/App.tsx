import {useState} from 'react';
import {StoreProvider, useStore} from './store';
import {HeatProvider, useHeat} from './heatStore';
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
    <div className="min-h-screen">
      <header className="no-print bg-teal-800 text-white shadow">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
          <button onClick={onHome} className="text-teal-200 hover:text-white text-sm" title="العودة للرئيسية">
            ⌂ الرئيسية
          </button>
          <div>
            <h1 className="text-lg font-extrabold">استشارة تموين المطعم 🍽</h1>
            <p className="text-xs text-teal-200">
              {s.institution} — السنة المالية {s.annee}
            </p>
          </div>
          <div className="flex-1" />
          <nav className="flex flex-wrap gap-1">
            {CANTINE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  tab === t.key ? 'bg-white text-teal-800' : 'text-teal-100 hover:bg-teal-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-4 py-5">
        {tab === 'dash' && <DashboardPage />}
        {tab === 'lots' && <LotsPage />}
        {tab === 'bidders' && <BiddersPage />}
        {tab === 'offers' && <OffersPage />}
        {tab === 'eval' && <EvaluationPage />}
        {tab === 'texts' && <TextsPage />}
        {tab === 'docs' && <DocumentsPage />}
      </main>
      <footer className="no-print max-w-[1400px] mx-auto px-4 pb-6 text-xs text-slate-400">
        يتم حفظ البيانات تلقائياً في هذا المتصفح.
      </footer>
    </div>
  );
}

function HeatShell({onHome}: {onHome: () => void}) {
  const [tab, setTab] = useState<Tab>('dash');
  const {state} = useHeat();
  const s = state.settings;

  return (
    <div className="min-h-screen">
      <header className="no-print bg-orange-800 text-white shadow">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
          <button onClick={onHome} className="text-orange-200 hover:text-white text-sm" title="العودة للرئيسية">
            ⌂ الرئيسية
          </button>
          <div>
            <h1 className="text-lg font-extrabold">استشارة التدفئة المركزية 🔥</h1>
            <p className="text-xs text-orange-200">
              استشارة رقم {s.numeroConsultation} — {s.projet} — {s.institutionShort}
            </p>
          </div>
          <div className="flex-1" />
          <nav className="flex flex-wrap gap-1">
            {HEAT_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                  tab === t.key ? 'bg-white text-orange-800' : 'text-orange-100 hover:bg-orange-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-4 py-5">
        {tab === 'dash' && <HeatDashboard />}
        {tab === 'ouvrages' && <HeatOuvragesPage />}
        {tab === 'entrepreneurs' && <HeatEntrepreneursPage />}
        {tab === 'offers' && <HeatOffersPage />}
        {tab === 'eval' && <HeatEvaluationPage />}
        {tab === 'texts' && <HeatTextsPage />}
        {tab === 'docs' && <HeatDocumentsPage />}
      </main>
      <footer className="no-print max-w-[1400px] mx-auto px-4 pb-6 text-xs text-slate-400">
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

export default function App() {
  return (
    <StoreProvider>
      <HeatProvider>
        <Router />
      </HeatProvider>
    </StoreProvider>
  );
}
