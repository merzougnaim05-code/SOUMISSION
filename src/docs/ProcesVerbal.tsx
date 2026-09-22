import {useStore} from '../store';
import {FreeAt, Page} from './primitives';

/** محضر اجتماع لجنة فتح الأظرفة وتقييم العروض — جلسة فتح الأظرفة */
export function ProcesVerbalDoc() {
  const {state} = useStore();
  const s = state.settings;
  const {president, membres} = state.committee;
  const Line = ({label}: {label: string}) => (
    <li>
      السيد: {label || '..............................'}{' '}
      <span className="doc-fill" style={{minWidth: '30mm'}}>
        &nbsp;
      </span>
    </li>
  );

  return (
    <Page>
      <div className="text-center leading-snug mb-4">
        <div style={{fontWeight: 700}}>الجمهورية الجزائرية الديمقراطية الشعبية</div>
        <div>وزارة التربية الوطنية</div>
        <div>مديرية التربية لولاية: {s.wilaya}</div>
        <div style={{fontWeight: 700}}>{s.institution}</div>
      </div>

      <div className="doc-title">محضر اجتماع لجنة فتح الأظرفة وتقييم العروض</div>
      <div className="text-center mb-4" style={{fontWeight: 700}}>
        جلسة فتح الأظرفة
      </div>

      <p style={{textAlign: 'justify'}}>
        في اليوم ................ من شهر ................ عام ................ وعلى الساعة
        ......................... اجتمعت لجنة فتح الأظرفة وتقييم العروض وبحضور الأعضاء الآتية أسماؤهم:
      </p>

      <div style={{fontWeight: 700}} className="mt-3">
        الأعـضاء الحاضـرون:
      </div>
      <ul style={{listStyle: 'none', paddingRight: '10pt', fontSize: '12.5pt'}} className="space-y-1">
        <Line label={president} />
        {membres.map((mm, i) => (
          <Line key={i} label={mm} />
        ))}
      </ul>

      <div style={{fontWeight: 700}} className="mt-3">
        الأعـضاء الغائبـون:
      </div>
      <ul style={{listStyle: 'none', paddingRight: '10pt', fontSize: '12.5pt'}} className="space-y-1">
        <Line label="" />
        <Line label="" />
      </ul>

      <div style={{fontWeight: 700}} className="mt-3">
        جـــدول الأعمــــــال:
      </div>
      <p className="mt-1">
        فتح الأظرفة الخاصة بالاستشارة رقم {s.numeroAnnonce} بتاريخ{' '}
        {s.dateAnnonce ? new Date(s.dateAnnonce).toLocaleDateString('fr-DZ') : '....................'}{' '}
        المتعلقة بتموين مطعم <b>{s.institution}</b> خلال سنة {s.annee} بـ:
      </p>
      <ul style={{paddingRight: '14pt', fontSize: '12.5pt'}}>
        {state.lots.map((l) => (
          <li key={l.id}>
            - الحصة رقم {String(l.numero).padStart(2, '0')}: {l.nom}.
          </li>
        ))}
      </ul>

      <p className="mt-3" style={{textAlign: 'justify'}}>
        بعد الكلمة الترحيبية للسيد رئيس اللجنة بالأعضاء الحاضرين، تم الشروع في دراسة ما ورد في جدول الأعمال:
      </p>
      <ul style={{listStyle: 'none', paddingRight: '10pt', fontSize: '12.5pt'}} className="space-y-1">
        <li>
          - بناءً على المرسوم الرئاسي رقم 15/247 المؤرخ في 16/09/2015 المتضمن تنظيم الصفقات العمومية
          وتفويضات المرفق العام.
        </li>
        <li>
          - بناءً على القانون رقم 23/12 المؤرخ في 05/08/2023 المتضمن القواعد العامة للصفقات العمومية.
        </li>
        <li>- بناءً على إعلان الاستشارة رقم {s.numeroAnnonce} بتاريخ أعلاه.</li>
        <li>- نظراً لانقضاء آجال تحضير العروض المحددة بـ {s.delaiJours} يوم.</li>
        <li>
          - وبعد اطلاع أعضاء اللجنة على السجل الخاص بإيداع العروض حسب ساعة وتاريخ استلامها، حيث تم تسجيل{' '}
          ...... عروض.
        </li>
      </ul>

      <p className="mt-3" style={{textAlign: 'justify', fontWeight: 700}}>
        شرعت اللجنة في عملية فتح الأظرفة حسب الحصص وتم تسجيل ما يلي:
      </p>
      {state.lots.map((l) => {
        const count = state.bidders.filter((b) =>
          state.offers.some((o) => o.bidderId === b.id && o.lotId === l.id),
        ).length;
        return (
          <p key={l.id} style={{fontSize: '12.5pt'}}>
            - الحصة رقم {String(l.numero).padStart(2, '0')} ({l.nom}): عدد العروض المقدمة: {count}.
          </p>
        );
      })}
      <p className="mt-2" style={{textAlign: 'justify', fontSize: '12.5pt'}}>
        وتمت عملية فتح الأظرفة في جو من الشفافية التامة وبحضور ممثلي المتعهدين، وبعد ذلك تابعت اللجنة أعمالها
        لتقييم العروض المقدمة حسب الحصص، وتم عرض النتائج على المصلحة المتعاقدة.
      </p>

      <FreeAt />
      <div className="text-center mt-8" style={{fontWeight: 700}}>
        مدير المؤسسة
      </div>
    </Page>
  );
}
