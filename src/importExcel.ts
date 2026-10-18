/** استيراد بيانات الاستشارة من ملف Excel.
 * يدعم صيغتين:
 *  1) ملف التطبيق المصدَّر (تحميل Excel) — استرجاع كامل العروض والمتعهدين.
 *  2) ملف الإستشارة الأصلي «الإستشـارة 2025.xlsb» أو نحوه (المواد، معلومات المتعهدين، عقد التموين).
 */
import * as XLSX from 'xlsx';
import type {Bidder, Lot, Settings} from './types';

export interface ImportedOfferRef {
  lotNumero: number;
  /** موقع المتعهد داخل قائمة المتعهدين المستوردة */
  bidderIndex: number;
  /** سعر وحدوي لكل مادة بترتيبها في حصتها */
  prixRows: number[];
}

export interface ImportResult {
  settings: Partial<Settings>;
  lots: Lot[];
  bidders: Bidder[];
  offers: ImportedOfferRef[];
  notes: string[];
}

type Row = unknown[];

const S = (v: unknown): string => String(v ?? '').trim();
const N = (v: unknown): number => {
  if (typeof v === 'number') return v;
  const x = parseFloat(String(v ?? '').replace(/[^\d.,-]/g, '').replace(',', '.'));
  return isNaN(x) ? 0 : x;
};
/** فارغ أو رقم نظري «0» كما هو عادة قوالب ملفات الإكسل */
const emptyish = (v: unknown): boolean =>
  v === null || v === undefined || S(v) === '' || S(v) === '0' || S(v) === '-';

function aoa(wb: XLSX.WorkBook, patterns: string[]): Row[] | null {
  const norm = (s: string) => s.replace(/\s+/g, '');
  const name =
    wb.SheetNames.find((sn) => patterns.some((p) => norm(sn) === norm(p))) ??
    wb.SheetNames.find((sn) => patterns.some((p) => norm(sn).includes(norm(p))));
  if (!name) return null;
  return XLSX.utils.sheet_to_json(wb.Sheets[name], {header: 1, defval: ''}) as Row[];
}

/** تحويل رقم مسلسل Excel (نظام 1900) إلى ISO yyyy-mm-dd */
function serialToISO(n: number): string | null {
  if (!n || n < 30000 || n > 80000) return null; // خارج مجال التواريخ المعقولة
  const d = new Date(Math.round((n - 25569) * 86400000));
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function leftoverId(lotNumero: number, i: number): string {
  return `im${lotNumero}-${i + 1}`;
}

function mk(id: string, designation: string, unite: string, qteMin: number, qteMax: number, prixRef: number) {
  return {id, designation, unite, qteMin, qteMax, prixRef};
}

/* ==================== الصيغة (1): ملف التطبيق المصدَّر ==================== */

function tryImportAppFormat(wb: XLSX.WorkBook, res: ImportResult): boolean {
  const dashName = wb.SheetNames.find((n) => n.replace(/\s+/g, '') === 'المدخل');
  const dashRaw = dashName ? aoa(wb, [dashName]) : null;
  if (!dashRaw) return false;
  // صيغة التطبيق: الوسم في العمود الأول والقيمة في العمود الثاني
  const pairs = new Map<string, string>();
  for (const r of dashRaw) {
    const k = S(r[0]);
    const v = r[1] === null || r[1] === undefined ? '' : String(r[1]).trim();
    if (k && v) pairs.set(k, v);
  }
  // ملف التطبيق يحمل وسم «الولاية» في العمود الأول — ملف الأصل لا
  if (!pairs.has('الولاية')) return false;

  const s: Partial<Settings> = {};
  if (pairs.has('السنة المالية')) s.annee = N(pairs.get('السنة المالية')) || undefined;
  if (pairs.has('الولاية')) s.wilaya = pairs.get('الولاية');
  if (pairs.has('البلدية')) s.commune = pairs.get('البلدية');
  if (pairs.has('المؤسسة')) s.institution = pairs.get('المؤسسة');
  if (pairs.has('مدير المؤسسة')) s.directeur = pairs.get('مدير المؤسسة');
  if (pairs.has('الآمر بالصرف')) s.ordonnateur = pairs.get('الآمر بالصرف');
  if (pairs.has('فترة العقد — من')) s.contractFrom = pairs.get('فترة العقد — من');
  if (pairs.has('فترة العقد — إلى')) s.contractTo = pairs.get('فترة العقد — إلى');

  // المتعهدين
  const bRaw = aoa(wb, ['المتعهدون']);
  const bidders: Bidder[] = [];
  if (bRaw) {
    for (let i = 1; i < bRaw.length; i++) {
      const r = bRaw[i];
      const nom = S(r[1]);
      if (!nom || S(r[0]) === 'الاسم / تسمية الشركة') continue;
      bidders.push({
        id: `bim${i}`,
        nom,
        formeJuridique: S(r[2]),
        rc: S(r[3]),
        activite: S(r[4]),
        nif: S(r[5]),
        nis: S(r[6]),
        rib: S(r[7]),
        banque: S(r[8]),
        agence: S(r[9]),
        adresse: S(r[10]),
        gerant: S(r[11]),
      });
    }
  }

  // أوراق الحصص: المواد + أعمدة أسعار المتعهدين (تسمية «عرض الاسم» في الرأس)
  const lotSheets = wb.SheetNames.filter((n) => /الحصة\s*\d/.test(n));
  const lotNumeroOf = (n: string) => N((n.match(/الحصة\s*(\d)/) ?? ['', '0'])[1]);
  const lots: Lot[] = [];
  const offers: ImportedOfferRef[] = [];
  for (const sheet of lotSheets) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheet], {header: 1, defval: ''}) as Row[];
    const numero = lotNumeroOf(sheet);
    const materiaux = [];

    // رؤوس أعمدة الأسعار: «عرض اسم المتعهد»
    const header = rows[0] ?? [];
    const bidderOrder: number[] = [];
    for (let c = 6; c < header.length; c++) {
      const label = S(header[c]);
      if (!/^عرض/.test(label)) continue;
      const nom = label.replace(/^عرض\s*/, '').trim();
      const idx = bidders.findIndex((b) => b.nom === nom);
      if (idx >= 0) bidderOrder.push(idx);
    }

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const designation = S(r[1]);
      if (!designation || /تقييم العروض|الفائز/.test(designation)) continue;
      materiaux.push(
        mk(
          leftoverId(numero, materiaux.length),
          designation,
          S(r[2]),
          N(r[3]),
          N(r[4]),
          N(r[5]),
        ),
      );
    }
    if (materiaux.length > 0)
      lots.push({
        id: `lim${numero}`,
        numero,
        nom: sheet.replace(/^الحصة\s*\d+\s*-\s*/, '').trim(),
        materiaux,
      });

    // أسعار كل متعهد بترتيب أعمدة «عرض ...»
    if (bidderOrder.length > 0) {
      for (let bi = 0; bi < bidderOrder.length; bi++) {
        const col = 6 + bi;
        const prixRows: number[] = [];
        let any = false;
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          const d = S(r[1]);
          if (!d) continue;
          if (/تقييم العروض/.test(d)) break;
          if (/الفائز/.test(d)) continue;
          const p = N(r[col]);
          prixRows.push(p);
          if (p > 0) any = true;
        }
        if (any)
          offers.push({
            lotNumero: numero,
            bidderIndex: bidderOrder[bi],
            prixRows,
          });
      }
    }
  }
  res.settings = s;
  res.bidders = bidders;
  res.lots = lots;
  res.offers = offers;
  res.notes.push('تم استيراد ملف التطبيق مع العروض والمتعهدين.');
  return true;
}

/* ==================== الصيغة (2): ملف الإستشارة الأصلي ==================== */

function importOriginFormat(wb: XLSX.WorkBook, res: ImportResult): void {
  const notes = res.notes;
  const s: Partial<Settings> = {};

  // معطيات المؤسسة من أوراق «عقد التموين ...» — بحث موضعي مرن (الدمج يحرّك الأعمدة)
  const instCandidates: string[] = [];
  let directeur = '';
  const contrat = wb.SheetNames.filter((n) => n.includes('عقد التموين'));
  for (const cn of contrat) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[cn], {header: 1, defval: ''}) as Row[];
    if (!s.wilaya) {
      for (const r of rows) {
        for (const c of r as Row) {
          const t = S(c);
          const w = t.match(/مديرية التربية لولاية\s*(.+)/)?.[1]?.trim();
          if (w) {
            s.wilaya = w;
            break;
          }
        }
      }
    }
    for (const r of rows) {
      for (const c of r as Row) {
        const raw = S(c);
        if (!/^(ثانوية|ثانويه|متوسطة|مدرسة|إبتدائية|ابتدائية|مدرسية)/.test(raw)) continue;
        // «بـ: الخضر والفواكه» الاحتياجية → نقصّها في اتجاه الخلايا المدموجة
        const v = raw.replace(/\s*بـ:?\s*$/, '').trim();
        if (v) instCandidates.push(v);
      }
    }
    // اسم مدير المؤسسة: أول قيمة غير فارغة ممتدة يمين وسم «مدير المؤسسة السيد»
    if (!directeur) {
      for (const r of rows) {
        const idx = r.findIndex((c) => /مدير المؤسسة/.test(S(c)));
        if (idx < 0) continue;
        for (let c = idx + 1; c < r.length; c++) {
          if (!emptyish(r[c])) {
            directeur = S(r[c]);
            break;
          }
        }
      }
    }
  }
  if (instCandidates.length > 0) s.institution = instCandidates.sort((a, b) => b.length - a.length)[0];
  if (directeur) s.directeur = directeur;
  if (contrat.length > 0) notes.push(`استُخرجت معطيات المؤسسة من أوراق «${contrat[0]}»…`);

  // المدخل: المؤسسة/البلدية/السنة المالية/التواريخ (مسلسلات Excel)
  const dash = aoa(wb, ['المدخل']);
  if (dash) {
    const near = (pred: (c: string) => boolean): string => {
      for (const r of dash as Row[]) {
        const i = r.findIndex((c) => pred(S(c)));
        if (i >= 0) {
          for (let c = i + 1; c <= i + 3; c++) if (!emptyish(r[c])) return S(r[c]);
        }
      }
      return '';
    };
    s.commune = near((t) => /البلدية/.test(t)) || s.commune;
    s.institution = s.institution || near((t) => /المؤسسة\s*:/.test(t));
    const dashAnnee = near((t) => /السنة المالية/.test(t));
    if (dashAnnee) s.annee = N(dashAnnee) || s.annee;

    const yearNow = s.annee ?? new Date().getFullYear();
    const inSeason = (n: number): string | null => {
      const iso = serialToISO(n);
      if (!iso) return null;
      return Math.abs(new Date(iso).getFullYear() - yearNow) <= 1 ? iso : null;
    };
    const da = inSeason(N(near((t) => /تاريخ الإعلان/.test(t))));
    const dd = inSeason(N(near((t) => /آخر أجل|أجل لايداع/.test(t))));
    if (da) s.dateAnnonce = da;
    if (dd) s.dateDepot = dd;
    notes.push('التواريخ في الملف قد تكون قديمة — يمكن تعديلها من تبويب «المعطيات».');
  }

  // المواد والحصص من ورقة «المواد»
  const matsSheet = aoa(wb, ['المواد']);
  if (matsSheet) {
    const lotsMap = new Map<number, Lot>();
    for (let r = 0; r < matsSheet.length; r++) {
      const row = matsSheet[r];
      for (let c = 0; c < row.length; c++) {
        const mm = S(row[c]).match(/الحصة\s*0?(\d)/);
        if (!mm) continue;
        const numero = N(mm[1]) || 1;
        // اسم الحصة: أول خلية غير فارغة على يمين الوسم
        let nom = '';
        for (let k = c + 1; k < row.length; k++) {
          if (!emptyish(row[k])) {
            nom = S(row[k]);
            break;
          }
        }
        // صف الرؤوس: «التعيين» على السطر الموالي — في نطاق القسم نفسه
        const headerRow = matsSheet[r + 1] ?? [];
        let dCol = -1;
        for (let k = Math.max(0, c - 1); k < headerRow.length; k++) {
          if (/التعي[-ـ]*(ين|ون)/.test(S(headerRow[k]))) {
            dCol = k;
            break;
          }
        }
        if (dCol < 0) continue;
        const materiaux = [];
        for (let rr = r + 2; rr < matsSheet.length; rr++) {
          const descr = S((matsSheet[rr] as Row)[dCol]);
          if (!descr || /الحصة/.test(descr)) break;
          const q = matsSheet[rr] as Row;
          materiaux.push(
            mk(
              leftoverId(numero, materiaux.length),
              descr,
              S(q[dCol + 1]),
              N(q[dCol + 2]),
              N(q[dCol + 3]),
              N(q[dCol + 4]),
            ),
          );
        }
        if (materiaux.length > 0 || nom) {
          lotsMap.set(numero, {id: `lim${numero}`, numero, nom: nom || `الحصة ${numero}`, materiaux});
        }
      }
    }
    res.lots = [...lotsMap.values()].sort((a, b) => a.numero - b.numero);
    if (res.lots.length > 0) notes.push(`استُوردت ${res.lots.length} حصص مع موادّها من ورقة «المواد».`);
  }

  // المتعهدين من ورقة «معلومات عن المتعهدين»
  const bRows = aoa(wb, ['معلومات عن المتعهدين']) ?? [];
  for (const r of bRows) {
    if (r.length < 2) continue;
    const mat = S(r[1]);
    const nom = S(r[2]);
    if (!nom || !mat || /السجل|الممون$|الرقم|المادة/.test(mat)) continue;
    if (/:$|نبض|عقد|فترة/.test(nom)) continue;
    const bidder: Bidder = {
      id: `bim${res.bidders.length + 1}`,
      nom,
      formeJuridique: '',
      rc: S(r[3]),
      activite: S(r[4]),
      nis: S(r[5]),
      nif: S(r[6]),
      rib: S(r[7]),
      banque: S(r[8]),
      agence: S(r[9]),
      adresse: '',
      gerant: '',
    };
    res.bidders.push(bidder);
    notes.push(`تم إضافة المتعهد: ${nom} (${mat}).`);
  }

  // فترة العقد وجلسة الاستشارة من ورقة المعلومات (أيام مسلسلة) — موضع مرن بسبب دمج الخلايا
  if (bRows.length > 0) {
    const firstNumRight = (r: Row, from: number): number | null => {
      for (let c = from; c < r.length; c++) {
        const v = r[c];
        if (typeof v === 'number' && v > 40000 && v < 60000) return v;
      }
      return null;
    };
    const pickAfter = (labelRe: RegExp): number | null => {
      for (const r of bRows) {
        const i = (r as Row).findIndex((c) => labelRe.test(S(c)));
        if (i >= 0) {
          const n = firstNumRight(r as Row, i + 1);
          if (n !== null) return n;
        }
      }
      return null;
    };
    const yearNow = s.annee ?? new Date().getFullYear();
    const inSeason = (serial: number | null): string | null => {
      if (serial === null) return null;
      const iso = serialToISO(serial);
      if (!iso) return null;
      // نتجنّب تواريخ متعارضة مع السنة المالية (ملف قديم يعود لسنة أخرى)
      return Math.abs(new Date(iso).getFullYear() - yearNow) <= 1 ? iso : null;
    };
    const from = inSeason(pickAfter(/^من\s?:/));
    const to = inSeason(pickAfter(/^الى\s?:/));
    const sessionISO = inSeason(pickAfter(/انعقدت جلسة/));
    if (from) s.contractFrom = from;
    if (to) s.contractTo = to;
    if (sessionISO) s.dateSessionConseil = sessionISO;
    if (!from && !to && !sessionISO) {
      notes.push('فترة العقد وجلسة الاستشارة في الملف تشير إلى سنة أخرى خلافاً للسنة المالية — أُهملت لتجنب نشر بيانات خاطئة؛ عدّلها من تبويب «المعطيات».');
    }
  }

  res.settings = s;
}

/* ==================== نقطة الدخول ==================== */

export async function importConsultationFile(file: File): Promise<ImportResult> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, {type: 'array'});
  const res: ImportResult = {settings: {}, lots: [], bidders: [], offers: [], notes: []};

  if (!tryImportAppFormat(wb, res)) {
    importOriginFormat(wb, res);
    if (res.lots.length === 0 && Object.keys(res.settings).length === 0 && res.bidders.length === 0) {
      throw new Error('لم يُتم التعرف على صيغة الملف. جرّب ملف «الإستشـارة 2025.xlsb» أو ملف التطبيق المصدَّر.');
    }
  }
  return res;
}
