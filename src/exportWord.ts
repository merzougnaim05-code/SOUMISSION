/** تصدير وثيقة Word: نحوّل صفحات A4 المعروضة إلى blob ‎.doc‎ متوافق مع Microsoft Word */

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineCssToStyles(css: string): string {
  // تحويلات مبسطة تهم الوثائق: direction, font-weight, text-align, font-size, white-space
  const out: string[] = [];
  const dir = css.match(/direction:\s*[^;]+/);
  if (dir) out.push(dir[0]);
  if (/font-weight:\s*(700|bold)/.test(css)) out.push('font-weight: bold');
  const ta = css.match(/text-align:\s*[^;]+/);
  if (ta) out.push(ta[0]);
  const fs = css.match(/font-size:\s*[^;]+/);
  if (fs) out.push(fs[0]);
  return out.join('; ');
}

/** تحويل عنصر DOM (صفحة أو جدول) إلى HTML بسمات style مباشرة بدون classes */
function domToWordHtml(el: Element, inherited: {align?: string; bold?: boolean} = {}): string {
  let html = '';
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = (node.textContent ?? '').replace(/\s+/g, ' ');
      if (t.trim()) html += esc(t);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const ch = node as HTMLElement;
    if (ch.classList.contains('no-print')) return;

    const tag = ch.tagName.toLowerCase();
    const css = ch.getAttribute('style') ?? '';
    const styles = inlineCssToStyles(css);
    const align = /text-align:\s*(center|right|left|justify)/.test(styles)
      ? (styles.match(/text-align:\s*(center|right|left|justify)/) as RegExpMatchArray)[1]
      : inherited.align;
    const bold = /font-weight:\s*(700|bold)/.test(styles) || inherited.bold;

    const openTag = (name: string, extra = '') =>
      `<${name} ${extra} style="${bold ? 'font-weight: bold; ' : ''}${align ? `text-align: ${align}; ` : ''}${extra ? '' : ''}"`.replace(
        ' style=" "',
        '',
      ) + '>';

    switch (tag) {
      case 'br':
        html += '<br/>';
        return;
      case 'b':
      case 'strong':
        html += `<b style="${styles}">${domToWordHtml(ch, {align, bold: true})}</b>`;
        return;
      case 'p':
        html += `<p style="margin: 4pt 0; ${styles}">${domToWordHtml(ch, {align, bold})}</p>`;
        return;
      case 'ol':
        html += `<ol style="margin: 4pt 0 4pt 0; direction: rtl;">${domToWordHtml(ch, {align, bold})}</ol>`;
        return;
      case 'ul':
        html += `<ul style="margin: 4pt 0 4pt 0; direction: rtl;">${domToWordHtml(ch, {align, bold})}</ul>`;
        return;
      case 'li':
        html += `<li style="${styles}">${domToWordHtml(ch, {align, bold})}</li>`;
        return;
      case 'table': {
        html += `<table border="1" cellspacing="0" cellpadding="4" style="border-collapse: collapse; width: 100%; direction: rtl; font-size: 11pt;">`;
        html += domToWordHtml(ch, {align: 'center', bold: inherited.bold});
        html += '</table>';
        return;
      }
      case 'thead':
      case 'tbody':
      case 'tfoot':
        html += domToWordHtml(ch, {align: inherited.align ?? 'center', bold: inherited.bold});
        return;
      case 'tr':
        html += `<tr>${domToWordHtml(ch, {align: inherited.align ?? 'center', bold: inherited.bold})}</tr>`;
        return;
      case 'th':
        html += `<th style="border: 1px solid #000; font-weight: bold; text-align: center; background: #e8eef0; padding: 3pt;">${domToWordHtml(ch, {align: 'center', bold: true})}</th>`;
        return;
      case 'td': {
        const span = ch.getAttribute('colspan');
        const rowSpan = ch.getAttribute('rowspan');
        const attrs = `${span ? ` colspan="${span}"` : ''}${rowSpan ? ` rowspan="${rowSpan}"` : ''}`;
        const tdStyle = /text-align/.test(styles) ? styles : `text-align: center; ${styles}`;
        html += `<td${attrs} style="border: 1px solid #000; padding: 3pt; ${tdStyle}">${domToWordHtml(ch, {align, bold})}</td>`;
        return;
      }
      case 'div':
      case 'span':
      case 'section': {
        const block = tag !== 'span' ? 'div' : 'span';
        html += `<${block} style="${styles}">${domToWordHtml(ch, {align, bold})}</${block}>`;
        return;
      }
      case 'button':
        return; // أزرار التفاعل لا تُصدَّر
      default:
        html += domToWordHtml(ch, {align, bold});
    }
  });
  return html;
}

/** بناء ملف Word من عناصر .doc-page المعروضة وتنزيله */
export function exportWord(root: HTMLElement | null, filename: string) {
  if (!root) return;
  const pages = Array.from(root.querySelectorAll<HTMLElement>('.doc-page'));
  if (pages.length === 0) return;

  const body = pages
    .map((p, i) => {
      const content = domToWordHtml(p);
      const br = i < pages.length - 1 ? '<br clear="all" style="mso-special-character:line-break; page-break-before:always">' : '';
      return content + br;
    })
    .join('\n');

  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" dir="rtl">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
@page { size: 21cm 29.7cm; margin: 1.5cm; }
body { font-family: "Simplified Arabic", "Traditional Arabic", "Arial", serif; font-size: 12.5pt; line-height: 1.6; direction: rtl; }
table { direction: rtl; }
</style>
</head>
<body dir="rtl">${body}</body>
</html>`;

  const blob = new Blob(['\ufeff', html], {type: 'application/msword'});
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
