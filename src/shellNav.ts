/** تنقل بين تبويبات جهة الأشغال من أي مكان (مثلاً: زر تعديل خاص بكل وثيقة) */
export type HeatTab = 'dash' | 'ouvrages' | 'entrepreneurs' | 'offers' | 'eval' | 'texts' | 'docs';

export function gotoHeatTab(tab: HeatTab, anchor?: string) {
  window.dispatchEvent(new CustomEvent('heat-goto', {detail: {tab, anchor}}));
}
