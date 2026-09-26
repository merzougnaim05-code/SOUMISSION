import {useHeat} from '../../heatStore';
import {HeatHeader, HPage, HSign} from './primitives';

const Dot = ({w = '55mm'}: {w?: string}) => (
  <span className="doc-fill" style={{minWidth: w}}>
    &nbsp;
  </span>
);

/** المذكرة التقنية التبريرية — نموذج المقاولة */
export function HeatMemo() {
  const {state} = useHeat();
  const s = state.settings;
  const e = state.entrepreneurs[0];

  return (
    <>
      <HPage>
        <HeatHeader />
        <div className="doc-title">مذكـــرة تقنيـــة تبريريـــة</div>

        <div style={{fontSize: '12pt'}} className="space-y-2">
          <div>
            تسمية الشركة أو المؤسسة: <span className="doc-fill" style={{minWidth: '70mm'}}>{e?.nom || ''}</span>
          </div>
          <div>
            الشكل القانوني للشركة أو المؤسسة:{' '}
            <span className="doc-fill" style={{minWidth: '60mm'}}>{e?.formeJuridique || ''}</span>
          </div>
          <div>عنوان العملية: {s.projet}.</div>
          <div>
            رقم الهاتف الجوال: <Dot w="40mm" />
          </div>
          <div>
            رقم الهاتف الثابت (الأرضي): <Dot w="40mm" />
          </div>
          <div>
            رقم الفاكس للمقاولة: <Dot w="40mm" />
          </div>
          <div>
            عنوان مكتب المقاولة: <Dot w="60mm" />
          </div>
          <div>
            البريد الإلكتروني: <Dot w="50mm" />
          </div>
          <div>
            معلومات أخرى: <Dot w="50mm" />
          </div>
          <div>
            عنوان المحل التجاري: <Dot w="60mm" />
          </div>
          <div>
            رقم السجل التجاري: <Dot w="35mm" /> المؤرخ في <Dot w="30mm" />
          </div>
          <div>
            رقم التعريف الجبائي: <Dot w="35mm" /> رقم التعريف الإحصائي: <Dot w="35mm" />
          </div>
          <div>
            اسم ولقب ممثل المؤسسة: <Dot w="45mm" /> تاريخ ومكان الازدياد: <Dot w="35mm" />
          </div>
          <div>
            شهادة انتماء وأداء مستحقات لصندوق الضمان الاجتماعي لغير الأجراء رقم: <Dot w="30mm" /> بتاريخ:{' '}
            <Dot w="25mm" />
          </div>
          <div>
            الجنسية: <Dot w="45mm" />
          </div>
        </div>

        <div className="mt-4" style={{fontWeight: 700}}>
          الوسائل المادية:
        </div>
        <p style={{fontSize: '11.5pt', textAlign: 'justify'}}>
          - القائمة الاسمية للعتاد المسخر لإنجاز المشروع لضمان التواجد الفعلي والأسمى للعتاد المصرح به بصفة دائمة
          على مستوى الإنجاز.
          <br />- المحضر المستخرج لسجل الجرد ممضي من طرف محضر قضائي أو محافظ حسابات رقم: <Dot w="25mm" /> بتاريخ:{' '}
          <Dot w="25mm" />
        </p>

        <table className="table-doc mt-2" style={{fontSize: '11pt'}}>
          <thead>
            <tr>
              <th>الرقم</th>
              <th>الوسائل</th>
              <th>نوعها</th>
              <th>الرقم التسلسلي</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({length: 13}).map((_, i) => (
              <tr key={i}>
                <td>{String(i + 1).padStart(2, '0')}</td>
                <td style={{height: '22pt'}}></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </HPage>

      <HPage>
        <div className="mt-2" style={{fontWeight: 700}}>
          الإمكانيات المادية (الحصائل المالية لثلاث سنوات الأخيرة):
        </div>
        <div style={{fontSize: '12pt'}} className="space-y-1 mt-2">
          <div>
            - الحوصلة الجبائية للمؤسسة لسنة .............. : .......................... دج
          </div>
          <div>
            - الحوصلة الجبائية للمؤسسة لسنة .............. : .......................... دج
          </div>
          <div>
            - الحوصلة الجبائية للمؤسسة لسنة .............. : .......................... دج
          </div>
        </div>

        <div className="mt-4" style={{fontWeight: 700}}>
          الإمكانيات البشرية:
        </div>
        <p style={{fontSize: '11.5pt', textAlign: 'justify'}}>
          - شهادة أداء المستحقات للصندوق الوطني للتأمينات الاجتماعية للعمال الأجراء رقم: ....................
          الصادر بتاريخ: .................... تاريخ انتهاء الصلاحية: ....................
          <br />- شهادة أداء المستحقات للصندوق الوطني للعطل المدفوعة الأجر والبطالة الناجمة عن سوء الأحوال
          الجوية لقطاعات البناء والأشغال العمومية والري رقم: .................... الصادر بتاريخ: ....................
          تاريخ انتهاء الصلاحية: ....................
        </p>

        <table className="table-doc mt-2" style={{fontSize: '11pt'}}>
          <thead>
            <tr>
              <th>الرقم</th>
              <th>الاسم واللقب</th>
              <th>تاريخ ومكان الازدياد</th>
              <th>الشهادة</th>
              <th>تاريخ الدخول</th>
              <th>الوظيفة</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({length: 12}).map((_, i) => (
              <tr key={i}>
                <td>{String(i + 1).padStart(2, '0')}</td>
                {Array.from({length: 5}).map((__, j) => (
                  <td key={j} style={{height: '20pt'}}></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 text-sm">
          حرر بـ: .................. في: .....................
        </div>
        <HSign right="المتعهد — الإمضاء والختم" />
      </HPage>
    </>
  );
}

/** أمر ببداية الأشغال + وصل التبليغ */
export function HeatOrdre() {
  const {state} = useHeat();
  const s = state.settings;
  const winner = state.entrepreneurs.find((e) => {
    // أول مقاولة مؤهلة مرتبة رقم 1 إن وجدت
    return true;
  });
  const w = state.entrepreneurs[0];

  return (
    <HPage>
      <HeatHeader />
      <div style={{fontSize: '12pt'}}>
        <div>
          المؤسسة: {s.institutionShort}
        </div>
        <div>
          عنوان العملية: {s.projet}
        </div>
        <div>
          الاستشارة: رقم {s.numeroConsultation}
        </div>
      </div>

      <div className="doc-title mt-4">أمر ببداية الأشغال رقم {s.numeroConsultation}</div>

      <p style={{fontSize: '12.5pt'}}>
        السيد: ............................................................... مدير مؤسسة{' '}
        ...............................................................
      </p>
      <p style={{textAlign: 'justify', fontSize: '12.5pt'}}>
        الحائز على الاستشارة رقم {s.numeroConsultation} المتعلقة بإنجاز {s.projet} بـ{s.institutionShort}
        {w?.nom ? ` — المقاولة: ${w.nom}` : ''}.
      </p>
      <p style={{textAlign: 'justify', fontSize: '12.5pt'}}>
        بناءً على الاستشارة المذكورة أعلاه، وعلى محضر المنح، وبعد استكمال جميع الإجراءات الإدارية والتنظيمية
        المعمول بها، فإنكم مدعوون للشروع في إنجاز الأشغال موضوع الاستشارة.
      </p>
      <p style={{fontSize: '12.5pt'}}>
        تحدد بداية الأشغال ابتداءً من: ....../....../{s.annee}
      </p>
      <p style={{fontSize: '12.5pt'}}>
        وتحدد مدة الإنجاز بثلاثين ({s.delaiRealisation}) يوماً ابتداءً من تاريخ التبليغ الرسمي بهذا الأمر.
      </p>
      <p style={{textAlign: 'justify', fontSize: '12.5pt'}}>
        ولا يعتبر هذا الأمر ببداية الأشغال ساري المفعول إلا بعد تبليغه رسمياً للمتعامل المتعاقد.
      </p>

      <div className="mt-6 text-sm">حرر بـ{s.commune} في: ....../....../{s.annee}</div>
      <HSign right="المديــــــــــر" />

      <div className="mt-10" style={{fontWeight: 700}}>
        تبليغ
      </div>
      <p style={{fontSize: '12pt'}}>
        في يوم: ....../....../{s.annee}
      </p>
      <p style={{textAlign: 'justify', fontSize: '12pt'}}>
        أنا الممضي أسفله ............................................................... أصرح بأنني استلمت
        نسخة طبق الأصل من أمر بداية الأشغال رقم {s.numeroConsultation} المتعلقة بـ{s.projet} بـ
        {s.institutionShort}.
      </p>
      <div className="mt-4 text-sm">
        حرر بـ: ..................... في: ....../....../{s.annee}
      </div>
      <HSign right="الإمضاء والختم" />
    </HPage>
  );
}
