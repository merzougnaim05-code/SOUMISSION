import {useStore} from '../store';
import {FreeAt, Page, SignRow} from './primitives';

/** دعوة أعضاء مجلس التربية والتسيير */
export function InvitationDoc() {
  const {state} = useStore();
  const s = state.settings;
  const {president, membres} = state.committee;

  return (
    <Page>
      <div className="text-center leading-snug mb-4">
        <div style={{fontWeight: 700}}>الجمهورية الجزائرية الديمقراطية الشعبية</div>
        <div>وزارة التربية الوطنية</div>
        <div>مديرية التربية لولاية: {s.wilaya}</div>
        <div style={{fontWeight: 700}}>{s.institution}</div>
      </div>

      <div className="doc-title">دعــوة لانعقاد مجلس التربية والتسيير</div>

      <p style={{textAlign: 'justify', fontSize: '13pt'}}>
        إلى السيد:{' '}
        <span className="doc-fill" style={{minWidth: '60mm'}}>
          &nbsp;
        </span>
      </p>

      <p className="mt-4" style={{textAlign: 'justify'}}>
        تشهد إدارة <b>{s.institution}</b> بأنكم مدعوون للمشاركة في اجتماع مجلس التربية والتسيير المزمع
        انعقاده يوم{' '}
        {s.dateSessionConseil ? (
          <b>{new Date(s.dateSessionConseil).toLocaleDateString('fr-DZ')}</b>
        ) : (
          '....................'
        )}{' '}
        على الساعة .................... بمقر المؤسسة، لمناقشة جدول الأعمال الآتي:
      </p>

      <ol style={{paddingRight: '18pt'}} className="mt-3 text-sm space-y-1">
        <li>1- المصادقة على دفتر الشروط المتعلق باستشارة تموين مطعم المؤسسة للسنة المالية {s.annee}.</li>
        <li>2- دراسة العروض المقدمة والمنح المؤقت للاتفاقيات.</li>
        <li>3- دراسة الطعون المقدمة (إن وجدت).</li>
        <li>4- مختلف.</li>
      </ol>

      <p className="mt-4" style={{textAlign: 'justify'}}>
        وعليه، يرجى منكم التفضل بالحضور في الموعد المحدد. وفي حالة التعذر، يرجى إشعارنا بذلك مع تحديد
        الإعذار.
      </p>

      <div className="mt-6 text-sm" style={{fontWeight: 700}}>
        الأعضاء المدعوون:
      </div>
      <ul style={{listStyle: 'none', paddingRight: '10pt', fontSize: '12.5pt'}} className="space-y-1">
        <li>
          * السيد: {president || '..............................'} — رئيس المجلس.
        </li>
        {membres.map((mm, i) => (
          <li key={i}>* السيد: {mm || '..............................'} — عضواً.</li>
        ))}
      </ul>

      <FreeAt />
      <SignRow right="مدير المؤسسة" />
    </Page>
  );
}
