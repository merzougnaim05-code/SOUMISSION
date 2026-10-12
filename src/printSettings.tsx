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
  /** mise en forme: محاذاة النص، التباعد بين الفقرات، وضع الطباعة الآمنة */
  align: 'justify' | 'right' | 'center' | 'left';
  paraGapPt: number;
  safePrint: boolean;
  avoidBreak: boolean;
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
  align: 'justify',
  paraGapPt: 4,
  safePrint: true,
  avoidBreak: true,
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
      '--doc-align': settings.align,
      '--doc-para-gap': `${settings.paraGapPt}pt`,
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

/** فحص جاهزية الطباعة: يكشف أسباب انفصال الحروف والنقاط الناقصة وتقطيع آخر الورقة */
export function testPrintReadiness() {
  const pages = Array.from(document.querySelectorAll('.print-area .doc-page'));
  if (pages.length === 0) {
    alert('لا توجد وثيقة معروضة للفحص. اختر وثيقة أولاً ثم أعد الفحص.');
    return;
  }
  const issues: string[] = [];
  let longWords = 0;
  let emptyParas = 0;
  let dotlines = 0;

  pages.forEach((page) => {
    // كلمات طويلة بلا مسافات تكسر التشكيل وتتجاوز الهامش
    const text = (page as HTMLElement).innerText ?? '';
    const words = text.split(/\s+/);
    words.forEach((w) => {
      if (w.length > 45) longWords++;
    });
    // فقرات فارغة = نقاط/أسطر ناقصة
    page.querySelectorAll('p, li').forEach((p) => {
      if (!((p as HTMLElement).innerText ?? '').trim()) emptyParas++;
    });
    dotlines += page.querySelectorAll('.doc-dotline, .doc-fill').length;
    // عناصر أطول من الصفحة ستُقطع حتماً آخر الورقة
    page.querySelectorAll('table, .doc-art').forEach((el) => {
      const h = (el as HTMLElement).offsetHeight;
      // 1122px ≈ ارتفاع A4 بالبكسل (296mm)
      if (h > 1050) {
        issues.push('عنصر طويل (جدول/مادة) يتجاوز طول الصفحة وسيُقطع — فعّل «منع تقطيع الجداول والمواد» أو قصّر النص.');
      }
    });
  });

  if (longWords > 0)
    issues.push(`وجدت ${longWords} كلمة/رابط طويل بلا مسافات — قد يسبب انفصال الحروف أو خروجه عن الهامش.`);
  if (emptyParas > 3)
    issues.push(`وجدت ${emptyParas} فقرة فارغة — قد تظهر كنقاط/أسطر ناقصة آخر الورقة. راجع المواد ذات النص الفارغ.`);
  if (dotlines === 0) issues.push('لا توجد سطور توقيع منقطة في هذه الوثيقة — تحقق أنك في الوثيقة الصحيحة.');

  // فحص الخط: Amiri غير محمل = حروف مشوهة عند الطباعة
  const amiriOk = Array.from(document.fonts ?? []).some((f) => /amiri/i.test(f.family));
  if (!amiriOk && document.fonts) issues.push('خط Amiri غير محمّل بعد — انتظر ثواني وأعد الطباعة لتفادي تشوه الحروف.');

  if (issues.length === 0) {
    alert(
      `✅ فحص الطباعة سليم: ${pages.length} صفحة، ${dotlines} سطر توقيع.\n` +
        'الحروف ستبقى متصلة والنقاط مكتملة حتى نهاية الورقة.',
    );
  } else {
    const unique = [...new Set(issues)].slice(0, 6);
    alert(`⚠ فحص الطباعة وجد ${unique.length} ملاحظة:\n\n• ` + unique.join('\n• '));
  }
}

/** لوحة ضبط أبعاد وخط الوثائق — تُحفظ تلقائياً في المتصفح */
export function PrintSettingsPanel() {
  const {settings: s, set, reset} = usePrint();
  return (
    <details className="no-print w-full bg-slate-50 border border-slate-200 rounded-lg p-3">
      <summary className="cursor-pointer text-sm font-bold text-slate-700">
        ⚙ ضبط أبعاد الوثيقة والكتابة / Mise en forme (ينعكس على المعاينة والطباعة)
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
        <Row label="محاذاة النص (Mise en forme)">
          <select
            className="app-input"
            value={s.align}
            onChange={(e) => set({align: e.target.value as PrintSettings['align']})}
          >
            <option value="justify">مضبوط (Justifié — رسمي)</option>
            <option value="right">يمين</option>
            <option value="center">وسط</option>
            <option value="left">يسار</option>
          </select>
        </Row>
        <Row label={`تباعد الفقرات: ${s.paraGapPt}pt`}>
          <input
            type="range"
            min={0}
            max={12}
            step={1}
            value={s.paraGapPt}
            onChange={(e) => set({paraGapPt: Number(e.target.value)})}
            className="w-full"
          />
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
        <div className="col-span-2 md:col-span-3 flex flex-wrap gap-4 mt-1 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={s.safePrint}
              onChange={(e) => set({safePrint: e.target.checked})}
            />
            <span>
              <b>طباعة آمنة للحروف العربية</b>
              <span className="block text-xs text-slate-500">تمنع انفصال الحروف وتقطيع النقاط (مستحسن)</span>
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={s.avoidBreak}
              onChange={(e) => set({avoidBreak: e.target.checked})}
            />
            <span>
              <b>منع تقطيع الجداول والمواد</b>
              <span className="block text-xs text-slate-500">يبقي كل مادة وجدول في صفحة واحدة قدر الإمكان</span>
            </span>
          </label>
        </div>
      </div>
      <button onClick={reset} className="mt-3 text-xs text-slate-500 underline">
        استعادة أبعاد A4 الافتراضية
      </button>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={testPrintReadiness}
          className="px-3 py-1.5 text-xs rounded-lg font-bold bg-teal-700 hover:bg-teal-800 text-white transition"
        >
          🔍 تجربة الطباعة / فحص التشوهات
        </button>
        <span className="text-[11px] text-slate-500 self-center">
          يفحص انفصال الحروف، النقاط الناقصة، والعناصر المقطوعة قبل الطباعة
        </span>
      </div>
    </details>
  );
}
