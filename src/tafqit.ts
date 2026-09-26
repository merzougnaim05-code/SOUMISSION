/** تفقيط: تحويل الأعداد إلى حروف عربية (دينار جزائري) */

const ONES = [
  '',
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
];

const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const HUNDREDS = [
  '',
  'مائة',
  'مائتان',
  'ثلاثمائة',
  'أربعمائة',
  'خمسمائة',
  'ستمائة',
  'سبعمائة',
  'ثمانمائة',
  'تسعمائة',
];

function below1000(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const r = n % 100;
  if (h > 0) parts.push(HUNDREDS[h]);
  if (r > 0) {
    if (r < 20) parts.push(ONES[r]);
    else {
      const u = r % 10;
      const t = Math.floor(r / 10);
      parts.push(u > 0 ? `${ONES[u]} و${TENS[t]}` : TENS[t]);
    }
  }
  return parts.join(' و');
}

function group(n: number, one: string, two: string, plural: string): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 3 && n <= 10) return `${below1000(n)} ${plural}`;
  return `${below1000(n)} ${one}`;
}

/** تحويل عدد صحيح إلى حروف */
export function intToArabicWords(n: number): string {
  n = Math.floor(Math.abs(n));
  if (n === 0) return 'صفر';
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const units = n % 1000;
  const parts: string[] = [];
  if (millions > 0) parts.push(group(millions, 'مليون', 'مليونان', 'ملايين'));
  if (thousands > 0) parts.push(group(thousands, 'ألف', 'ألفان', 'آلاف'));
  if (units > 0) parts.push(below1000(units));
  return parts.join(' و');
}

/** تفقيط مبلغ بالدينار الجزائري (وما يقابلها من سنتيمات) */
export function tafqitDZD(amount: number): string {
  const dinars = Math.floor(amount);
  const centimes = Math.round((amount - dinars) * 100);
  const d = `${intToArabicWords(dinars)} دينار جزائري`;
  if (centimes > 0) return `${d} و${intToArabicWords(centimes)} سنتيم`;
  return d;
}
