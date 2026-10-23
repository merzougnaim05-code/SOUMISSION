import {useLayoutEffect, useRef, useState} from 'react';
import {rankLot, useStore} from '../store';
import {Btn} from '../ui';
import {usePrint, PrintSettingsPanel, printWithAutoFix} from '../printSettings';
import {exportWord} from '../exportWord';
import {exportExcel} from '../exportExcel';
import {importConsultationFile} from '../importExcel';
import {AnnonceDoc} from '../docs/Annonce';
import {
  AnnonceFinaleDoc,
  AzharDoc,
  CoefficientDoc,
  ConseilAppelDoc,
  ConseilCahierDoc,
  ConseilExtractDoc,
  DossierCandidatureDoc,
  EtapesDoc,
  FichePrestataireDoc,
  IqrarDoc,
  NegotiationDoc,
  NyzahaDoc,
} from '../docs/annexes';
import {BesoinsDoc} from '../docs/Besoins';
import {CandidatureDoc} from '../docs/Candidature';
import {CahierTrachDoc} from '../docs/CahierTrach';
import {CahierTechniqueDoc} from '../docs/CahierTechnique';
import {CahierFinancierDoc} from '../docs/CahierFinancier';
import {ComiteDoc} from '../docs/Comite';
import {ProcesVerbalDoc} from '../docs/ProcesVerbal';
import {ComparaisonDoc} from '../docs/Comparaison';
import {ResultatsDoc} from '../docs/Resultats';
import {ContratDoc} from '../docs/Contrat';
import {InvitationDoc} from '../docs/Invitation';

type DocKey =
  | 'annonce'
  | 'besoins'
  | 'candidature'
  | 'trach'
  | 'technique'
  | 'financier'
  | 'comite'
  | 'pv'
  | 'comparaison'
  | 'resultats'
  | 'contrat'
  | 'invitation'
  | 'nyzaha'
  | 'iqrar'
  | 'coef'
  | 'pv-cahier'
  | 'pv-eval'
  | 'pv-eaux'
  | 'annonce-finale'
  | 'azhar'
  | 'fiche-moun'
  | 'negoce'
  | 'etapes'
  | 'dossier';

const DOCS: {key: DocKey; label: string; desc: string; needsLot?: boolean; needsBidder?: boolean}[] = [
  {key: 'annonce', label: 'إعلان عن الاستشارة', desc: 'الإعلان الرسمي مع محتويات ملف الترشح والعرض التقني والمالي'},
  {key: 'besoins', label: 'كشف التقديرات الإدارية للاحتياجات', desc: 'كل حصة في صفحة مستقلة مع المجاميع'},
  {key: 'candidature', label: 'التصريح بالترشح', desc: 'النموذج القانوني الكامل (3 صفحات)'},
  {key: 'trach', label: 'دفتر الشروط — الجزء 1: ملف الترشح', desc: 'غلاف + لائحة محتويات ملف الترشح + التصريح بالترشح + التصريح بالنزاهة'},
  {key: 'technique', label: 'دفتر الشروط — الجزء 2: الملف التقني', desc: 'غلاف + فهرس + التصريح بالاكتتاب + التعليمات العامة (المواد 01 إلى 19)'},
  {key: 'financier', label: 'دفتر الشروط — الجزء 3: الملف المالي', desc: 'غلاف + رسالة التعهد + كشف الأسعار + الكشف الكمي والتقديري بثلاث نسب ضريبة (0% / 9% / 19%)', needsBidder: true},
  {key: 'invitation', label: 'دعوة مجلس التربية والتسيير', desc: 'دعوة أعضاء المجلس لانعقاد الجلسة'},
  {key: 'comite', label: 'مقرر تعيين لجنة فتح الأظرفة وتقييم العروض', desc: 'مقرر المدير بتشكيل اللجنة'},
  {key: 'pv', label: 'محضر جلسة فتح الأظرفة', desc: 'محضر اجتماع اللجنة مع عدد العروض لكل حصة'},
  {key: 'comparaison', label: 'جدول مقارنة العروض', desc: 'مقارنة وتقييم العروض المالية لكل حصة مع الترتيب', needsLot: true},
  {key: 'resultats', label: 'إعلان نتائج الاستشارة', desc: 'جدول الفائزين بالمنح المؤقت للاتفاقية'},
  {key: 'contrat', label: 'عقد تموين', desc: 'العقد الكامل مع مبلغ الاتفاقية تفقيطاً', needsLot: true, needsBidder: true},
  {key: 'nyzaha', label: 'التصريح بالنزاهة', desc: 'صيغة القانون 23-12 / من وثائق ملف الترشح', needsBidder: true},
  {key: 'iqrar', label: 'إقرار التعهد بالأسعار', desc: 'إقرار المطابقة + جدول أسعار الاتفاقية لكل حصة', needsLot: true, needsBidder: true},
  {key: 'coef', label: 'جدول الأسعار بالمعامل', desc: 'جدول معامل الأسعار لكل حصة (يُملأ يدوياً)', needsLot: true},
  {key: 'pv-cahier', label: 'محضر المصادقة على دفاتر الشروط', desc: 'جلسة مجلس التوجيه والتسيير للمصادقة'},
  {key: 'pv-eval', label: 'مستخرج محضر مجلس التربية والتسيير', desc: 'جلسة تقييم العروض والمنح المؤقت مع الجداول'},
  {key: 'pv-eaux', label: 'محضر دراسة الطعون', desc: 'جلسة المجلس للفصل في طعن متعهد'},
  {key: 'annonce-finale', label: 'إعلان عن المنح النهائي', desc: 'بعد انتهاء آجال الطعون — جدول المنح النهائي'},
  {key: 'azhar', label: 'إعذار الممون', desc: 'في حال الإخلال ببنود الاتفاقية', needsLot: true},
  {key: 'fiche-moun', label: 'ملف الممون', desc: 'بطاقة معطيات الممون (سجل تجاري، جباية، بنك)', needsLot: true, needsBidder: true},
  {key: 'negoce', label: 'محضر التفاوض / مراجعة الأسعار', desc: 'محضران أسعار المواد والكميات الجديدة', needsLot: true, needsBidder: true},
  {key: 'etapes', label: 'خطوات تنفيذ الاستشارة', desc: 'جدول خطوات الإجراءات الإدارية'},
  {key: 'dossier', label: 'ملف الترشح — الغلاف', desc: 'غلاف دفتر الشروط وصفحة وصف الاستشارة'},
];

export function DocumentsPage() {
  const {state, setSettings, setLots, setBidders, setOffers} = useStore();
  const {vars, settings: printSettings, set: setPrint} = usePrint();
  const [docKey, setDocKey] = useState<DocKey>('annonce');
  const [lotId, setLotId] = useState(state.lots[0].id);
  const [bidderId, setBidderId] = useState(state.bidders[0]?.id ?? '');
  const printRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  /** استيراد بيانات من ملف Excel وإدماجها في الحالة الحالية */
  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const res = await importConsultationFile(f);
      const summary: string[] = [];

      // الحصص والمواد: الدمج بحسب رقم الحصة مع الحفاظ على المعرفات الحالية
      let mergedLots = state.lots;
      if (res.lots.length > 0) {
        mergedLots = state.lots.map((l) => {
          const nl = res.lots.find((x) => x.numero === l.numero);
          if (!nl) return l;
          return {
            ...l,
            nom: nl.nom || l.nom,
            materiaux: nl.materiaux.length > 0 ? nl.materiaux : l.materiaux,
          };
        });
        for (const nl of res.lots) {
          if (!mergedLots.some((l) => l.numero === nl.numero)) mergedLots.push(nl);
        }
        setLots(mergedLots);
        summary.push(`• ${res.lots.length} حصص مع موادّها`);
      }

      // المتعهدين: إضافة الجدد فقط (بدون تكرار)
      let bidders = [...state.bidders];
      if (res.bidders.length > 0) {
        const known = new Set(state.bidders.map((b) => `${b.nom}|${b.rc}`));
        const add = res.bidders.filter((b) => !known.has(`${b.nom}|${b.rc}`));
        if (add.length > 0) {
          bidders = [...bidders, ...add];
          setBidders(bidders);
          summary.push(`• ${add.length} متعهدين`);
        }
      }

      // العروض (الأسعار الوحدوية)
      if (res.offers.length > 0) {
        const offers = [...state.offers];
        let added = 0;
        for (const ref of res.offers) {
          const lot = mergedLots.find((l) => l.numero === ref.lotNumero);
          const b = bidders.find((x) => x.nom === res.bidders[ref.bidderIndex]?.nom);
          if (!lot || !b) continue;
          const prix: Record<string, number> = {};
          lot.materiaux.forEach((mm, i) => {
            const p = ref.prixRows[i];
            if (p > 0) prix[mm.id] = p;
          });
          if (Object.keys(prix).length === 0) continue;
          const idx = offers.findIndex((o) => o.bidderId === b.id && o.lotId === lot.id);
          if (idx >= 0) offers[idx] = {...offers[idx], prix: {...offers[idx].prix, ...prix}};
          else offers.push({bidderId: b.id, lotId: lot.id, prix});
          added += 1;
        }
        if (added > 0) {
          setOffers(offers);
          summary.push(`• ${added} عرضاً بالأسعار`);
        }
      }

      // المعطيات العامة
      if (Object.keys(res.settings).length > 0) {
        setSettings(res.settings);
        summary.push('• المعطيات العامة للمؤسسة');
      }

      window.alert(
        `تم الاستيراد من «${f.name}» بنجاح:\n` +
          (summary.join('\n') || 'لا توجد بيانات جديدة') +
          (res.notes.length ? `\n\nملاحظات:\n- ${res.notes.join('\n- ')}` : ''),
      );
    } catch (err) {
      window.alert('فشل الاستيراد: ' + (err instanceof Error ? err.message : String(err)));
    }
    e.target.value = '';
  };

  const meta = DOCS.find((d) => d.key === docKey)!;

  /** ترقيم كل صفحات الوثيقة المعروضة: «X / N» أسفل الصفحة — يبني صفحات التدفق الديناميكية (FlowSlot)
   *  وتُعاد التسمية آلياً كلما تغيّرت الصفحات عبر مراقب DOM */ 
  useLayoutEffect(() => {
    const root = printRef.current;
    if (!root) return;
    let tid = 0;
    /** الترقيم متزامن (بدون rAF): يمرّ فور بناء صفحات التدفق، ولا يعتمد على ظهور التاب */
    const renumber = () => {
      clearTimeout(tid);
      root.querySelectorAll('.pg-num').forEach((n) => n.remove());
      const all = Array.from(root.querySelectorAll('.doc-page'));
      const total = all.length;
      all.forEach((pg, ix) => {
        const num = document.createElement('div');
        num.className = 'pg-num';
        num.style.cssText =
          'position:absolute;bottom:4mm;left:0;right:0;text-align:center;font-size:10.5pt;line-height:1.2;color:#222;direction:ltr;';
        num.textContent = `${ix + 1} / ${total}`;
        pg.appendChild(num);
      });
    };
    const observer = new MutationObserver((muts) => {
      // تجاهل التغييرات التي سببها الترقيم نفسه (إضافة/حذف .pg-num)
      const relevant = muts.some((m) =>
        [...m.addedNodes, ...m.removedNodes].some(
          (n) => n instanceof Element && !n.classList.contains('pg-num'),
        ),
      );
      if (relevant) {
        clearTimeout(tid);
        // microtask قصيرة: كي تكتمل كتلة التعديلات الحالية قبل إعادة الترقيم
        tid = window.setTimeout(renumber, 0) as unknown as number;
      }
    });
    observer.observe(root, {childList: true, subtree: true});
    renumber();
    return () => {
      observer.disconnect();
      clearTimeout(tid);
      root.querySelectorAll('.pg-num').forEach((n) => n.remove());
    };
  }, [docKey]);

  const winnerOfLot = (l: string) => {
    const lot = state.lots.find((x) => x.id === l);
    if (!lot) return '';
    const ranked = rankLot(lot, state.bidders, state.offers);
    return ranked.find((r) => r.rank === 1)?.bidder.id ?? '';
  };

  const renderDoc = () => {
    switch (docKey) {
      case 'annonce':
        return <AnnonceDoc />;
      case 'besoins':
        return <BesoinsDoc />;
      case 'candidature':
        return <CandidatureDoc />;
      case 'trach':
        return <CahierTrachDoc />;
      case 'technique':
        return <CahierTechniqueDoc />;
      case 'financier':
        return <CahierFinancierDoc bidderId={bidderId} />;
      case 'invitation':
        return <InvitationDoc />;
      case 'comite':
        return <ComiteDoc />;
      case 'pv':
        return <ProcesVerbalDoc />;
      case 'comparaison':
        return <ComparaisonDoc lotId={lotId} />;
      case 'resultats':
        return <ResultatsDoc />;
      case 'contrat':
        return <ContratDoc bidderId={bidderId || winnerOfLot(lotId)} lotId={lotId} />;
      case 'nyzaha':
        return <NyzahaDoc bidderId={bidderId} />;
      case 'iqrar':
        return <IqrarDoc lotId={lotId} bidderId={bidderId || winnerOfLot(lotId)} />;
      case 'coef':
        return <CoefficientDoc lotId={lotId} />;
      case 'pv-cahier':
        return <ConseilCahierDoc />;
      case 'pv-eval':
        return <ConseilExtractDoc />;
      case 'pv-eaux':
        return <ConseilAppelDoc />;
      case 'annonce-finale':
        return <AnnonceFinaleDoc />;
      case 'azhar':
        return <AzharDoc lotId={lotId} />;
      case 'fiche-moun':
        return <FichePrestataireDoc lotId={lotId} bidderId={bidderId} />;
      case 'negoce':
        return <NegotiationDoc lotId={lotId} bidderId={bidderId} />;
      case 'etapes':
        return <EtapesDoc />;
      case 'dossier':
        return <DossierCandidatureDoc />;
    }
  };

  return (
    <div className="flex gap-4 items-start">
      {/* قائمة الوثائق */}
      <div className="no-print w-72 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-3 sticky top-4">
        <h2 className="font-bold text-slate-800 mb-3 px-1">وثائق الاستشارة للطباعة</h2>
        <div className="space-y-1 max-h-[70vh] overflow-y-auto">
          {DOCS.map((d) => (
            <button
              key={d.key}
              onClick={() => setDocKey(d.key)}
              className={`w-full text-right rounded-lg px-3 py-2 transition ${
                docKey === d.key ? 'bg-teal-700 text-white' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="text-sm font-semibold">{d.label}</div>
              <div className={`text-[11px] ${docKey === d.key ? 'text-teal-100' : 'text-slate-400'}`}>{d.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* منطقة المعاينة والطباعة */}
      <div className="flex-1 min-w-0">
        <div className="no-print flex flex-wrap items-center gap-3 bg-white rounded-xl shadow-sm border border-slate-200 p-3 mb-4">
          <Btn onClick={() => printWithAutoFix(setPrint)}>🖨 طباعة آمنة / حفظ PDF</Btn>
          <Btn variant="ghost" onClick={() => exportWord(printRef.current, `${fileName(state, docKey, lotId, bidderId)}.doc`)}>
            ⬇ تحميل Word
          </Btn>
          <Btn variant="ghost" onClick={() => exportExcel(state, `الاستشارة ${state.settings.annee}.xlsx`)}>
            ⬇ تحميل Excel (كل البيانات)
          </Btn>
          <Btn variant="ghost" onClick={() => importRef.current?.click()}>
            📥 استيراد بيانات من Excel
          </Btn>
          <input
            ref={importRef}
            type="file"
            accept=".xlsx,.xlsb,.xls"
            className="hidden"
            onChange={(e) => void onImportFile(e)}
          />
          <span className="text-sm text-slate-500">{meta.label}</span>
          <span className="text-xs text-slate-400">
            لتعديل نصوص دفتر الشروط: تبويب «دفاتر الشروط» أعلاه
          </span>
          <div className="flex-1" />
          {meta.needsLot && (
            <select className="app-input max-w-[260px]" value={lotId} onChange={(e) => setLotId(e.target.value)}>
              {state.lots.map((l) => (
                <option key={l.id} value={l.id}>
                  الحصة {String(l.numero).padStart(2, '0')}: {l.nom}
                </option>
              ))}
            </select>
          )}
          {meta.needsBidder && (
            <select className="app-input max-w-[260px]" value={bidderId} onChange={(e) => setBidderId(e.target.value)}>
              {state.bidders.length === 0 && <option value="">(لا يوجد متعهدين)</option>}
              {state.bidders.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nom || '(بدون اسم)'}
                </option>
              ))}
            </select>
          )}
        </div>
        <PrintSettingsPanel />
        <div
          ref={printRef}
          className={`print-area doc-scroll rounded-xl ${printSettings.safePrint ? 'safe-print' : ''} ${printSettings.avoidBreak ? 'avoid-break' : ''}`}
          style={vars}
        >
          {renderDoc()}
        </div>
      </div>
    </div>
  );
}

/** اسم ملف التنزيل بحسب الوثيقة المختارة */
function fileName(
  state: ReturnType<typeof useStore>['state'],
  docKey: DocKey,
  lotId: string,
  bidderId: string,
): string {
  const s = state.settings;
  const lot = state.lots.find((l) => l.id === lotId);
  const bidder = state.bidders.find((b) => b.id === bidderId);
  const names: Record<DocKey, string> = {
    annonce: `إعلان الاستشارة رقم ${s.numeroAnnonce} ${s.annee}`,
    besoins: `كشف الاحتياجات - ${lot?.nom ?? ''} ${s.annee}`,
    candidature: 'التصريح بالترشح',
    trach: 'دفتر الشروط - ملف الترشح',
    technique: 'دفتر الشروط - الملف التقني',
    financier: `الملف المالي - ${bidder?.nom ?? ''}`,
    invitation: 'دعوة مجلس التربية والتسيير',
    comite: 'مقرر تعيين لجنة فتح الأظرفة',
    pv: 'محضر جلسة فتح الأظرفة',
    comparaison: `مقارنة العروض - ${lot?.nom ?? ''}`,
    resultats: 'إعلان نتائج الاستشارة',
    contrat: `عقد تموين - ${lot?.nom ?? ''} - ${bidder?.nom ?? ''}`,
    nyzaha: 'التصريح بالنزاهة',
    iqrar: `إقرار الأسعار - ${lot?.nom ?? ''} - ${bidder?.nom ?? ''}`,
    coef: `جدول الأسعار بالمعامل - ${lot?.nom ?? ''}`,
    'pv-cahier': 'محضر المصادقة على دفاتر الشروط',
    'pv-eval': 'مستخرج محضر مجلس التربية والتسيير',
    'pv-eaux': 'محضر دراسة الطعون',
    'annonce-finale': 'إعلان عن المنح النهائي',
    azhar: 'إعذار الممون',
    'fiche-moun': `ملف الممون - ${bidder?.nom ?? ''}`,
    negoce: `محضر التفاوض - ${lot?.nom ?? ''}`,
    etapes: 'خطوات تنفيذ الاستشارة',
    dossier: 'ملف الترشح - الغلاف',
  };
  return names[docKey];
}
