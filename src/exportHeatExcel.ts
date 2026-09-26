/** تصدير بيانات استشارة التدفئة إلى Excel */
import * as XLSX from 'xlsx';
import type {HeatState} from './types';
import {rankHeat} from './heatStore';

export function exportHeatExcel(state: HeatState, filename: string) {
  const wb = XLSX.utils.book_new();
  const s = state.settings;

  const dash: (string | number)[][] = [
    ['رقم الاستشارة', s.numeroConsultation],
    ['السنة', s.annee],
    ['الولاية', s.wilaya],
    ['البلدية', s.commune],
    ['المؤسسة', s.institution],
    ['المدير', s.directeur],
    ['عنوان العملية', s.projet],
    ['ميدان التأهيل', s.domaine],
    ['الدرجة', s.degre],
    ['النشاط', s.activite],
    [],
    ['تاريخ الإعلان', s.dateAnnonce],
    ['تاريخ إيداع العروض', s.dateDepot],
    ['ساعة الإيداع', s.heureDepot],
    ['ساعة فتح الأظرفة', s.heureOuverture],
    ['مدة تحضير العروض (أيام)', s.delaiPreparation],
    ['مدة الإنجاز (أيام)', s.delaiRealisation],
    ['صلاحية العروض (أيام)', s.delaiValidite],
    ['حقوق المشاركة (دج)', s.fraisParticipation],
    ['TVA %', s.tva],
    [],
    ['اللجنة'],
    ['رئيس اللجنة', state.committee.president],
    ...state.committee.membres.map((m, i) => [`العضو ${i + 1}`, m]),
  ];
  const wsD = XLSX.utils.aoa_to_sheet(dash);
  wsD['!cols'] = [{wch: 28}, {wch: 50}];
  XLSX.utils.book_append_sheet(wb, wsD, 'المدخل');

  // الأشغال + العروض
  const entrepreneurs = state.entrepreneurs;
  const rows: (string | number)[][] = [
    ['N°', 'Désignation des ouvrages', 'Uté', 'Qté', 'Prix référence HT (دج)', ...entrepreneurs.map((e) => e.nom || '(بدون اسم)')],
  ];
  state.ouvrages.forEach((o, i) => {
    const row: (string | number)[] = [i + 1, o.designation, o.unite, o.qte, o.prixRef];
    for (const e of entrepreneurs) {
      const off = state.offers.find((x) => x.entrepreneurId === e.id);
      row.push(off?.prix[o.id] ?? '');
    }
    rows.push(row);
  });
  rows.push([]);
  rows.push(['تقييم العروض (علامة دنيا 20/40)']);
  rows.push(['المقاولة', 'بشرية/15', 'مادية/20', 'آجال/5', 'تقني/40', 'H.T', 'T.T.C', 'المدة (يوم)', 'الترتيب']);
  for (const {entrepreneur, tech, totals, rank} of rankHeat(state)) {
    rows.push([
      entrepreneur.nom,
      tech.humaines,
      tech.materielles,
      tech.delai,
      tech.total,
      totals.complete ? totals.ht : '',
      totals.complete ? totals.ttc : '',
      entrepreneur.delaiPropose,
      rank ?? '',
    ]);
  }
  const wsO = XLSX.utils.aoa_to_sheet(rows);
  wsO['!cols'] = [{wch: 5}, {wch: 70}, {wch: 6}, {wch: 6}, {wch: 18}, ...entrepreneurs.map(() => ({wch: 16}))];
  XLSX.utils.book_append_sheet(wb, wsO, 'الأشغال والعروض');

  const eRows: (string | number)[][] = [
    ['تسمية المقاولة', 'الشكل القانوني', 'RC', 'NIF', 'NIS', 'الممثل', 'الهاتف', 'العنوان', 'البنك', 'الوكالة', 'RIB', 'متخصصون', 'عمال', 'شاحنة', 'تلحيم', 'ثني', 'حفر', 'بناء', 'المدة المقترحة'],
    ...entrepreneurs.map((e) => [
      e.nom, e.formeJuridique, e.rc, e.nif, e.nis, e.gerant, e.tel, e.adresse, e.banque, e.agence, e.rib,
      e.nbSpecialises, e.nbOuvriers, e.camion ? 'نعم' : 'لا', e.soudure ? 'نعم' : 'لا',
      e.cintrage ? 'نعم' : 'لا', e.forage ? 'نعم' : 'لا', e.construction ? 'نعم' : 'لا', e.delaiPropose,
    ]),
  ];
  const wsE = XLSX.utils.aoa_to_sheet(eRows);
  wsE['!cols'] = eRows[0].map(() => ({wch: 15}));
  XLSX.utils.book_append_sheet(wb, wsE, 'المقاولات');

  if (state.articles?.length) {
    const aRows: (string | number)[][] = [['القسم', 'المادة', 'النص']];
    const names: Record<string, string> = {inst: 'التعليمات', ccap: 'العقد', cpc: 'التعليمات الخاصة'};
    const LIMIT = 32000; // حد خلية Excel هو 32767 حرفاً
    for (const a of state.articles) {
      if (a.corps.length <= LIMIT) {
        aRows.push([names[a.section] ?? a.section, a.titre, a.corps]);
      } else {
        const parts = Math.ceil(a.corps.length / LIMIT);
        for (let i = 0; i < parts; i++) {
          aRows.push([
            names[a.section] ?? a.section,
            parts > 1 ? `${a.titre} (تابع ${i + 1}/${parts})` : a.titre,
            a.corps.slice(i * LIMIT, (i + 1) * LIMIT),
          ]);
        }
      }
    }
    const wsA = XLSX.utils.aoa_to_sheet(aRows);
    wsA['!cols'] = [{wch: 16}, {wch: 45}, {wch: 110}];
    XLSX.utils.book_append_sheet(wb, wsA, 'دفتر الشروط');
  }

  XLSX.writeFile(wb, filename);
}
