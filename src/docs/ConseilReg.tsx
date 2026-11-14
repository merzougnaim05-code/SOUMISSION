import {useStore} from '../store';
import {DocHeader, Page, SignRow} from './primitives';

/** جدول أعضاء مجلس التربية والتوجيه — منقول بأمانة عن ورقة «أعضاء المجلس»
 *  في الملف الأصلي: الصفات الثابتة لأعضاء المجلس مع خانتي الحضور والغياب،
 *  وتُملأ الأسماء من تشكيلة اللجنة المسجلة (أو نقاط إن كانت فارغة). */
const ROLES = [
  'مدير المؤسسة — رئيس المجلس',
  'مسير مالي',
  'ممثل الأساتذة',
  'ممثل الأساتذة',
  'ممثل مشرفي التربية',
  'ممثل العمال المهنيين',
  'رئيس جمعية أولياء التلاميذ',
  'مستشار التربية',
  'ممثل العمال الإداريين',
  'مستشار التوجيه والإرشاد المدرسي',
];

export function ConseilRegDoc() {
  const {state} = useStore();
  const s = state.settings;
  // الرئيس أولاً ثم الأعضاء بالترتيب — البقية حقول منقّطة
  const names = [state.committee.president?.trim() || s.directeur?.trim() || '', ...state.committee.membres.map((m) => m?.trim() || '')]
    .filter((x, i) => x || i === 0)
    .slice(0, ROLES.length);

  return (
    <Page>
      <DocHeader />
      <div className="doc-title">أعضاء مجلس التربية والتوجيه</div>
      <p style={{textAlign: 'justify', fontSize: '12pt'}}>
        تشكيلة مجلس التربية والتوجيه للمؤسسة — السنة المالية <b>{s.annee}</b>:
      </p>
      <table className="table-doc" style={{fontSize: '11pt'}}>
        <thead>
          <tr>
            <th style={{width: '8%'}}>الرقم</th>
            <th style={{width: '34%'}}>اللقب والاسم</th>
            <th style={{width: '34%'}}>الصفة</th>
            <th>الحضور والغياب</th>
          </tr>
        </thead>
        <tbody>
          {ROLES.map((role, i) => (
            <tr key={role + i}>
              <td>{i + 1}</td>
              <td style={{textAlign: 'right', fontWeight: i === 0 ? 700 : 400}}>
                {names[i] || '..........................'}
              </td>
              <td>{role}</td>
              <td>حاضر ☐ &nbsp;&nbsp; غائب ☐</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{fontSize: '11pt', marginTop: '8pt', display: 'flex', gap: '24pt'}}>
        <span>عدد الحاضرين: ..........</span>
        <span>عدد الغائبين: ..........</span>
      </div>
      <SignRow right="الإمضاء" left="مدير المؤسسة" />
    </Page>
  );
}
