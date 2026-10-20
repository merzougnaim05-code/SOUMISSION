import {fmt, useStore} from '../store';
import {tafqitDZD} from '../tafqit';
import {DocHeader, Page, SignRow} from './primitives';

/** دفتر الشروط — العرض المالي: غلاف + رسالة التعهد + جداول الأسعار الوحدوية + الكشف الكمي والتقديري */
export function CahierFinancierDoc({bidderId}: {bidderId: string}) {
  const {state} = useStore();
  const s = state.settings;
  const bidder = state.bidders.find((b) => b.id === bidderId);

  return (
    <>
      {/* الغلاف */}
      <Page>
        <DocHeader />
        <div className="text-center" style={{marginTop: '60pt', fontWeight: 700, fontSize: '26pt'}}>
          دفتــر الشــروط
        </div>
        <div className="text-center" style={{marginTop: '18pt', fontWeight: 700, fontSize: '18pt'}}>
          العرض المالي
        </div>
        <div className="text-center mt-10" style={{fontSize: '14pt'}}>
          البرنامج: ميزانية المؤسسة لسنة {s.annee}
        </div>
        <div className="mt-6" style={{fontSize: '13.5pt'}}>
          <div style={{fontWeight: 700}}>
            موضوع الاستشارة: تمويـــن مطعـم {s.institution} بـ:
          </div>
          <ol className="mt-2" style={{paddingRight: '20pt'}}>
            {state.lots.map((l) => (
              <li key={l.id}>
                الحصة {String(l.numero).padStart(2, '0')}: {l.nom}.
              </li>
            ))}
          </ol>
        </div>
        <div className="text-center mt-12" style={{fontWeight: 700, fontSize: '16pt'}}>
          الاستشارة
        </div>
        <p className="mt-4" style={{textAlign: 'justify', fontSize: '12pt'}}>
          طبقاً لأحكام القانون رقم 23-12 المؤرخ في 18 محرم عام 1445 الموافق 5 غشت سنة 2023 يحدد القواعد
          العامة المتعلقة بالصفقات العمومية والمرسوم الرئاسي رقم 15/247 المؤرخ في 16 سبتمبر 2015 المتضمن
          تنظيم الصفقات العمومية وتفويضات المرفق العام.
        </p>
        {bidder && (
          <div className="mt-8 text-center" style={{fontSize: '14pt'}}>
            العارض: <b>{bidder.nom}</b>
          </div>
        )}
        <div className="text-left text-xs" style={{marginTop: '40pt'}}>
          الهاتف / فاكس: ..........................
        </div>
      </Page>

      {/* رسالة التعهد */}
      <Page>
        <div className="text-center leading-snug mb-3">
          <div style={{fontWeight: 700}}>الجمهوريــة الجزائريــة الديمقـراطيـة الشعبيــة</div>
          <div>وزارة التربية الوطنية</div>
          <div>مديرية التربية لولاية {s.wilaya}</div>
          <div style={{fontWeight: 700}}>{s.institution}</div>
        </div>
        <div className="doc-title">رســــــــــالة التعهد</div>
        <div style={{fontSize: '11.5pt', textAlign: 'justify'}} className="space-y-1">
          <p>طبقاً لأحكام المرسوم الرئاسي رقم 23-12، مؤرخ في: 18 محرم عام 1445 الموافق 5 غشت سنة 2023.</p>
          <p>
            طبقاً لأحكام المرسوم الرئاسي رقم 15-247، مؤرخ في: 06 ذو الحجة عام 1436 الموافق 16 سبتمبر سنة
            2015.
          </p>
          <p>
            طبقاً لأحكام المادة 51 من المرسوم الرئاسي رقم 10-236 المؤرخة في 28 شوال عام 1431 الموافق 7 أكتوبر
            سنة 2010 المعدل والمتمم بالمرسوم الرئاسي رقم 12-23 مؤرخ في 18 يناير 2012 المتضمن تنظيم الصفقات
            العمومية، وتطبيقاً للقرار مؤرخ في 23 ربيع الثاني عام 1432 الموافق 28 مارس سنة 2011 يحدد نماذج
            رسالة العرض والتصريح بالاكتتاب والتصريح بالنزاهة.
          </p>
        </div>
        <div className="mt-4 space-y-2" style={{fontSize: '12.5pt'}}>
          <div>أنا الموقع (ة) أسفله:</div>
          <div>
            اللقب والاسم:{' '}
            <span className="doc-fill" style={{minWidth: '80mm'}}>
              {bidder?.gerant || ''}
            </span>
          </div>
          <div>
            المهنة:{' '}
            <span className="doc-fill" style={{minWidth: '80mm'}}>
              {bidder?.activite || ''}
            </span>
          </div>
          <div>
            الساكن بـ:{' '}
            <span className="doc-fill" style={{minWidth: '80mm'}}>
              {bidder?.adresse || ''}
            </span>
          </div>
          <div>
            المتصرف باسم ولحساب:{' '}
            <span className="doc-fill" style={{minWidth: '70mm'}}>
              {bidder?.nom || ''}
            </span>{' '}
            المقيد بالسجل التجاري رقم:{' '}
            <span className="doc-fill" style={{minWidth: '40mm'}}>
              {bidder?.rc || ''}
            </span>
          </div>
          <p style={{textAlign: 'justify'}}>
            بعد الاطلاع على وثائق مشروع الصفقة، وبعد تقدير نوع الخدمات الواجب القيام بها ومدى صعوبتها من وجهة
            نظري وتحت مسؤوليتي: أسلم جدولاً بالأسعار وبياناً تقديرياً مفصلاً طبقاً للإطارين الواردين في ملف
            مشروع الصفقة، موقعين باسمي، ألتزم وأتعهد تجاه <b>{s.institution}</b> بتنفيذ الخدمات طبقاً لشروط
            دفتر التعليمات الخاصة طيلة السنة المالية <b>{s.annee}</b>.
          </p>
          <p style={{textAlign: 'justify'}}>
            أؤكد، تحت طائلة فسخ الصفقة بقوة القانون أو وضعها تحت التسيير المباشر للإدارة على حساب الشركة، بأن
            الشركة المذكورة لا تنطبق عليها الممنوعات المنصوص عليها في التشريع والتنظيم المعمول بهما. أشهد بأن
            المعلومات المذكورة أعلاه صحيحة تحت طائلة التعرض لتطبيق العقوبات المنصوص عليها في المادة 216 من
            الأمر رقم 66-156 المؤرخ في 8 يونيو سنة 1966 والمتضمن قانون العقوبات، المعدل والمتمم.
          </p>
        </div>
        <div className="mt-6 text-sm">
          حرر بـ: .............................. في: ..............................
        </div>
        <div className="text-center mt-8" style={{fontWeight: 700}}>
          المتعهـــــد
        </div>
        <div className="text-center text-xs">(إسم وصفة الموقع وختم المتعهد)</div>
      </Page>

      {/* جداول الأسعار الوحدوية لكل حصة */}
      {state.lots.map((lot) => {
        const offer = state.offers.find((o) => o.bidderId === bidderId && o.lotId === lot.id);
        return (
          <Page key={lot.id}>
            <DocHeader />
            <div className="doc-title">كشف الأسعار الوحدوية</div>
            <div className="text-center mb-2" style={{fontWeight: 700}}>
              الحصة {String(lot.numero).padStart(2, '0')}: {lot.nom} للسنة المالية {s.annee}
            </div>
            <table className="table-doc">
              <thead>
                <tr>
                  <th style={{width: '6%'}}>الرقم</th>
                  <th style={{width: '44%'}}>تعيين المواد</th>
                  <th style={{width: '7%'}}>الوحدة</th>
                  <th style={{width: '13%'}}>السعر الوحدوي بكامل الرسوم (دج)</th>
                  <th style={{width: '30%'}}>السعر الوحدوي بكامل الرسوم بالحروف</th>
                </tr>
              </thead>
              <tbody>
                {lot.materiaux.map((mm, i) => {
                  const p = offer?.prix[mm.id];
                  return (
                    <tr key={mm.id}>
                      <td>{i + 1}</td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontSize: '11pt',
                          paddingTop: '3pt',
                          paddingBottom: '3pt',
                          lineHeight: 1.35,
                        }}
                      >
                        {mm.designation}
                      </td>
                      <td>{mm.unite}</td>
                      <td style={{fontWeight: 700}}>{p ? fmt(p) : ''}</td>
                      <td style={{fontSize: '9.5pt'}}>{p ? tafqitDZD(p) : ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-4 text-sm">
              حرر بـ: <b>{s.commune}</b> في: ..............................
            </div>
            <SignRow right="المتعامل المتعاقد — الختم والإمضاء" />
          </Page>
        );
      })}

      {/* شريط تنقّل سريع بين حصص الكشف الكمي (لا يُطبع) */}
      <div
        className="no-print mb-3 flex flex-wrap items-center gap-2 rounded-lg bg-slate-100 p-2 text-sm"
        style={{direction: 'rtl'}}
      >
        <span style={{fontWeight: 700}}>الكشف الكمي والتقديري — صفحة لكل حصة، الانتقال إلى:</span>
        {state.lots.map((l) => (
          <button
            key={'nav-' + l.id}
            type="button"
            className="rounded border border-slate-300 bg-white px-2 py-1 hover:bg-slate-50"
            onClick={() =>
              document.getElementById('dcr-' + l.id)?.scrollIntoView({behavior: 'smooth', block: 'start'})
            }
          >
            الحصة {String(l.numero).padStart(2, '0')}
          </button>
        ))}
      </div>

      {/* الكشف الكمي والتقديري — صفحة مستقلة لكل حصة */}
      {state.lots.map((lot) => {
        const offer = state.offers.find((o) => o.bidderId === bidderId && o.lotId === lot.id);
        const dcrMin = lot.materiaux.reduce((a, mm) => a + (offer?.prix[mm.id] || 0) * mm.qteMin, 0);
        const dcrMax = lot.materiaux.reduce((a, mm) => a + (offer?.prix[mm.id] || 0) * mm.qteMax, 0);
        const empty = lot.materiaux.every((mm) => !offer?.prix[mm.id]);

        return (
          <Page key={'dcr-' + lot.id} id={'dcr-' + lot.id}>
            <DocHeader />
            <div className="doc-title">الكشف الكمي والتقديري</div>
            <div className="text-center mb-2" style={{fontWeight: 700, fontSize: '12pt'}}>
              الحصة {String(lot.numero).padStart(2, '0')}: {lot.nom} للسنة المالية {s.annee}
            </div>
            <table className="table-doc" style={{fontSize: '10.5pt'}}>
              <thead>
                <tr>
                  <th rowSpan={2} style={{width: '6%'}}>
                    الرقم
                  </th>
                  <th rowSpan={2} style={{width: '40%'}}>
                    تعيين المواد
                  </th>
                  <th rowSpan={2} style={{width: '6%'}}>
                    الوحدة
                  </th>
                  <th colSpan={2}>الكمية</th>
                  <th rowSpan={2} style={{width: '11%'}}>
                    السعر الوحدوي خارج الرسوم (دج)
                  </th>
                  <th colSpan={2}>المبلغ خارج الرسوم (دج)</th>
                </tr>
                <tr>
                  <th style={{width: '8%'}}>الدنيا</th>
                  <th style={{width: '8%'}}>القصوى</th>
                  <th style={{width: '10.5%'}}>الأدنى</th>
                  <th style={{width: '10.5%'}}>الأقصى</th>
                </tr>
              </thead>
              <tbody>
                {lot.materiaux.map((mm, i) => {
                  const p = offer?.prix[mm.id] || 0;
                  return (
                    <tr key={mm.id}>
                      <td>{i + 1}</td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontSize: '11pt',
                          paddingTop: '3pt',
                          paddingBottom: '3pt',
                          lineHeight: 1.35,
                        }}
                      >
                        {mm.designation}
                      </td>
                      <td>{mm.unite}</td>
                      <td>{fmt(mm.qteMin)}</td>
                      <td>{fmt(mm.qteMax)}</td>
                      <td>{p ? fmt(p) : ''}</td>
                      <td>{p ? fmt(p * mm.qteMin) : ''}</td>
                      <td>{p ? fmt(p * mm.qteMax) : ''}</td>
                    </tr>
                  );
                })}
                <tr style={{fontWeight: 700, background: '#eef2f4'}}>
                  <td colSpan={6}>المجموع</td>
                  <td>{empty ? '' : fmt(dcrMin)}</td>
                  <td>{empty ? '' : fmt(dcrMax)}</td>
                </tr>
                <tr>
                  <td colSpan={8} style={{textAlign: 'right', fontSize: '10.5pt'}}>
                    المبلغ الإجمالي الأدنى بالحروف: {dcrMin > 0 ? tafqitDZD(dcrMin) : ''}
                  </td>
                </tr>
                <tr>
                  <td colSpan={8} style={{textAlign: 'right', fontSize: '10.5pt'}}>
                    المبلغ الإجمالي الأقصى بالحروف: {dcrMax > 0 ? tafqitDZD(dcrMax) : ''}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 text-sm">
              حرر بـ: <b>{s.commune}</b> في: .............................. / .............................. /{' '}
              {s.annee}
            </div>
            <SignRow right="المتعامل المتعاقد — الختم والإمضاء" />
          </Page>
        );
      })}
    </>
  );
}
