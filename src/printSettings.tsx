import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';

/** إعدادات الطباعة — تُطبق على المعاينة والطباعة معاً ليتطابق ما تراه مع الورقة */
export interface PrintSettings {
  font: string;
  fontSizePt: number;
  lineHeight: number;
  padVmm: number;
  padHmm: number;
  tableFontPt: number;
  titlePt: number;
}

const KEY = 'print-settings-v1';

export const PRINT_FONTS: {value: string; label: string}[] = [
  {value: '"Amiri", "Traditional Arabic", "Times New Roman", serif', label: 'أميري (رسمي)'},
  {value: '"Traditional Arabic", "Amiri", "Times New Roman", serif', label: 'Traditional Arabic'},
  {value: '"Cairo", "Segoe UI", Tahoma, sans-serif', label: 'القاهرة (واضح)'},
  {value: '"Times New Roman", "Amiri", serif', label: 'Times New Roman'},
];

const DEFAULTS: PrintSettings = {
  font: PRINT_FONTS[0].value,
  fontSizePt: 13.5,
  lineHeight: 1.65,
  padVmm: 14,
  padHmm: 15,
  tableFontPt: 11.5,
  titlePt: 17,
};

interface Ctx {
  settings: PrintSettings;
  set: (p: Partial<PrintSettings>) => void;
  reset: () => void;
  /** تُمرر كـ style على حاوية المعاينة فتورّثها كل صفحات الوثيقة */
  vars: CSSProperties;
}

const PrintCtx = createContext<Ctx | null>(null);

function load(): PrintSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return {...DEFAULTS, ...(JSON.parse(raw) as Partial<PrintSettings>)};
  } catch {
    /* تجاهل */
  }
  return DEFAULTS;
}

export function PrintProvider({children}: {children: ReactNode}) {
  const [settings, setSettings] = useState<PrintSettings>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(settings));
    } catch {
      /* تجاهل */
    }
  }, [settings]);

  const value = useMemo<Ctx>(() => {
    const vars = {
      '--doc-font': settings.font,
      '--doc-font-size': `${settings.fontSizePt}pt`,
      '--doc-line': String(settings.lineHeight),
      '--doc-pad-v': `${settings.padVmm}mm`,
      '--doc-pad-h': `${settings.padHmm}mm`,
      '--doc-table-font': `${settings.tableFontPt}pt`,
      '--doc-title-size': `${settings.titlePt}pt`,
    } as CSSProperties;
    return {
      settings,
      set: (p) => setSettings((s) => ({...s, ...p})),
      reset: () => setSettings(DEFAULTS),
      vars,
    };
  }, [settings]);

  return <PrintCtx.Provider value={value}>{children}</PrintCtx.Provider>;
}

export function usePrint(): Ctx {
  const v = useContext(PrintCtx);
  if (!v) throw new Error('usePrint must be used within PrintProvider');
  return v;
}

function Row({label, children}: {label: string; children: ReactNode}) {
  return (
    <label className="block">
      <span className="app-label">{label}</span>
      {children}
    </label>
  );
}

/** لوحة ضبط أبعاد وخط الوثائق — تُحفظ تلقائياً في المتصفح */
export function PrintSettingsPanel() {
  const {settings: s, set, reset} = usePrint();
  return (
    <details className="no-print w-full bg-slate-50 border border-slate-200 rounded-lg p-3">
      <summary className="cursor-pointer text-sm font-bold text-slate-700">
        ⚙ ضبط أبعاد الوثيقة والكتابة (ينعكس على المعاينة والطباعة)
      </summary>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
        <Row label="الخط">
          <select className="app-input" value={s.font} onChange={(e) => set({font: e.target.value})}>
            {PRINT_FONTS.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </Row>
        <Row label={`حجم النص: ${s.fontSizePt}pt`}>
          <input
            type="range"
            min={10}
            max={16}
            step={0.5}
            value={s.fontSizePt}
            onChange={(e) => set({fontSizePt: Number(e.target.value)})}
            className="w-full"
          />
        </Row>
        <Row label={`تباعد الأسطر: ${s.lineHeight}`}>
          <input
            type="range"
            min={1.3}
            max={2.1}
            step={0.05}
            value={s.lineHeight}
            onChange={(e) => set({lineHeight: Number(e.target.value)})}
            className="w-full"
          />
        </Row>
        <Row label={`الهامش عمودي: ${s.padVmm}mm`}>
          <input
            type="range"
            min={5}
            max={25}
            step={1}
            value={s.padVmm}
            onChange={(e) => set({padVmm: Number(e.target.value)})}
            className="w-full"
          />
        </Row>
        <Row label={`الهامش أفقي: ${s.padHmm}mm`}>
          <input
            type="range"
            min={5}
            max={25}
            step={1}
            value={s.padHmm}
            onChange={(e) => set({padHmm: Number(e.target.value)})}
            className="w-full"
          />
        </Row>
        <Row label={`حجم الجداول: ${s.tableFontPt}pt`}>
          <input
            type="range"
            min={9}
            max={14}
            step={0.5}
            value={s.tableFontPt}
            onChange={(e) => set({tableFontPt: Number(e.target.value)})}
            className="w-full"
          />
        </Row>
        <Row label={`حجم العناوين: ${s.titlePt}pt`}>
          <input
            type="range"
            min={13}
            max={22}
            step={0.5}
            value={s.titlePt}
            onChange={(e) => set({titlePt: Number(e.target.value)})}
            className="w-full"
          />
        </Row>
      </div>
      <button onClick={reset} className="mt-3 text-xs text-slate-500 underline">
        استعادة أبعاد A4 الافتراضية
      </button>
    </details>
  );
}
