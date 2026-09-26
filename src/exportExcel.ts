/** تصدير بيانات الاستشارة إلى ملف Excel متعدد الأوراق */
import * as XLSX from 'xlsx';
import type {AppState} from './types';
import {offerTotals, rankLot} from './store';

export function exportExcel(state: AppState, filename: string) {
  const wb = XLSX.utils.book_new();
  const s = state.settings;

  // ورقة المدخل
  const dash: (string | number)[][] = [
    ['السنة المالية', s.annee],
    ['الولاية', s.wilaya],
    ['البلدية', s.commune],
    ['المؤسسة', s.institution],
    ['مدير المؤسسة', s.directeur],
    ['الآمر بالصرف', s.ordonnateur],
    [],
    ['رقم الإعلان', s.numeroAnnonce],
    ['تاريخ الإعلان عن الاستشارة', s.dateAnnonce],
    ['آخر أجل لإيداع العروض', s.dateDepot],
    ['ساعة الإيداع', s.heureDepot],
    ['تاريخ فتح الأظرفة', s.dateOuverture],
    ['ساعة فتح الأظرفة', s.heureOuverture],
    ['آجل تحضير العروض (أيام)', s.delaiJours],
    ['فترة العقد — من', s.contractFrom],
    ['فترة العقد — إلى', s.contractTo],
    [],
    ['لجنة فتح الأظرفة وتقييم العروض'],
    ['رئيس اللجنة', state.committee.president],
    ...state.committee.membres.map((mm, i) => [`العضو ${i + 1}`, mm]),
  ];
  const wsDash = XLSX.utils.aoa_to_sheet(dash);
  wsDash['!cols'] = [{wch: 30}, {wch: 40}];
  XLSX.utils.book_append_sheet(wb, wsDash, 'المدخل');

  // ورقة لكل حصة: المواد + عروض المتعهدين + التقييم
  for (const lot of state.lots) {
    const header = ['الرقم', 'تعيين المادة', 'الوحدة', 'الكمية الدنيا', 'الكمية القصوى', 'السعر المرجعي (دج)'];
    const biddersOnLot = state.bidders.filter((b) =>
      state.offers.some((o) => o.bidderId === b.id && o.lotId === lot.id),
    );
    const rows: (string | number)[][] = [header];
    lot.materiaux.forEach((mm, i) => {
      const row: (string | number)[] = [i + 1, mm.designation, mm.unite, mm.qteMin, mm.qteMax, mm.prixRef];
      for (const b of biddersOnLot) {
        const offer = state.offers.find((o) => o.bidderId === b.id && o.lotId === lot.id);
        row.push(offer?.prix[mm.id] ?? '');
      }
      rows.push(row);
    });

    // صفوف المجاميع والتقييم
    rows.push([]);
    const ranked = rankLot(lot, state.bidders, state.offers);
    rows.push(['تقييم العروض', 'المتعهد', 'المبلغ الأدنى (دج)', 'المبلغ الأقصى (دج)', 'الترتيب']);
    for (const {bidder, totals, rank} of ranked) {
      rows.push(['', bidder.nom, totals.complete ? totals.min : '', totals.complete ? totals.max : '', rank ?? '']);
    }
    const winner = ranked.find((r) => r.rank === 1);
    if (winner) rows.push(['الفائز بالمنح المؤقت', winner.bidder.nom]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{wch: 6}, {wch: 38}, {wch: 9}, {wch: 12}, {wch: 12}, {wch: 16}, ...biddersOnLot.map(() => ({wch: 14}))];
    XLSX.utils.book_append_sheet(wb, ws, `الحصة ${String(lot.numero).padStart(2, '0')} - ${lot.nom}`.slice(0, 31));
  }

  // ورقة المتعهدين
  const bRows: (string | number)[][] = [
    [
      'الرقم',
      'الاسم / تسمية الشركة',
      'الشكل القانوني',
      'رقم السجل التجاري',
      'النشاط',
      'NIF',
      'NIS',
      'RIB',
      'البنك',
      'الوكالة',
      'العنوان',
      'المسير',
    ],
  ];
  state.bidders.forEach((b, i) => {
    bRows.push([
      i + 1,
      b.nom,
      b.formeJuridique,
      b.rc,
      b.activite,
      b.nif,
      b.nis,
      b.rib,
      b.banque,
      b.agence,
      b.adresse,
      b.gerant,
    ]);
  });
  const wsB = XLSX.utils.aoa_to_sheet(bRows);
  wsB['!cols'] = bRows[0].map(() => ({wch: 18}));
  XLSX.utils.book_append_sheet(wb, wsB, 'المتعهدون');

  // ورقة دفتر الشروط (المواد القابلة للتعديل)
  if (state.articles?.length) {
    const aRows: (string | number)[][] = [['القسم', 'المادة', 'النص']];
    for (const a of state.articles) aRows.push([a.section, a.titre, a.corps]);
    const wsA = XLSX.utils.aoa_to_sheet(aRows);
    wsA['!cols'] = [{wch: 6}, {wch: 40}, {wch: 110}];
    XLSX.utils.book_append_sheet(wb, wsA, 'دفتر الشروط');
  }

  XLSX.writeFile(wb, filename);
}
