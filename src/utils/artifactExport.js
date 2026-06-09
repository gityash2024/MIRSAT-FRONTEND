import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Client-side, on-the-fly export of an agent "report" artifact to PDF / Excel / CSV / Word,
 * plus markdown copy. The artifact shape (from the backend get_analytics_report tool) is:
 *   { kind:'report', reportType, title, generatedAt, summary, columns:[{key,label}], rows:[...],
 *     metrics:[{label,value}], markdown, filtersApplied }
 * No files are stored server-side — everything is generated in the browser at click time.
 */

const safeName = (title) => String(title || 'report')
  .replace(/[^a-z0-9]+/gi, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase() || 'report';

const fileBase = (artifact) => `${safeName(artifact?.title)}-${new Date().toISOString().slice(0, 10)}`;
const columnsOf = (artifact) => (Array.isArray(artifact?.columns) ? artifact.columns : []);
const rowsOf = (artifact) => (Array.isArray(artifact?.rows) ? artifact.rows : []);
const cellText = (value) => (value === undefined || value === null ? '' : String(value));

export const artifactToMarkdown = (artifact) => {
  if (artifact?.markdown) return artifact.markdown;
  const cols = columnsOf(artifact);
  const rows = rowsOf(artifact);
  const lines = [`### ${artifact?.title || 'Report'}`, ''];
  if (artifact?.summary) lines.push(artifact.summary, '');
  (artifact?.metrics || []).forEach((m) => lines.push(`- **${m.label}:** ${m.value}`));
  if (artifact?.metrics?.length) lines.push('');
  if (cols.length && rows.length) {
    lines.push(`| ${cols.map((c) => c.label).join(' | ')} |`);
    lines.push(`| ${cols.map(() => '---').join(' | ')} |`);
    rows.forEach((r) => lines.push(`| ${cols.map((c) => cellText(r[c.key]).replace(/\|/g, '\\|')).join(' | ')} |`));
  }
  return lines.join('\n');
};

export const copyArtifactMarkdown = async (artifact) => {
  const markdown = artifactToMarkdown(artifact);
  try {
    await navigator.clipboard.writeText(markdown);
  } catch (_error) {
    const fallback = document.createElement('textarea');
    fallback.value = markdown;
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand('copy');
    fallback.remove();
  }
  return markdown;
};

export const exportArtifactCsv = (artifact) => {
  const cols = columnsOf(artifact);
  const grid = [cols.map((c) => c.label), ...rowsOf(artifact).map((r) => cols.map((c) => r[c.key]))];
  const csv = grid
    .map((line) => line
      .map((value) => {
        const text = cellText(value);
        return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
      })
      .join(','))
    .join('\r\n');
  // UTF-8 BOM keeps Arabic/Excel happy.
  saveAs(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' }), `${fileBase(artifact)}.csv`);
};

export const exportArtifactExcel = (artifact) => {
  const cols = columnsOf(artifact);
  const aoa = [cols.map((c) => c.label), ...rowsOf(artifact).map((r) => cols.map((c) => (r[c.key] ?? '')))];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(aoa), 'Report');
  if (artifact?.metrics?.length) {
    const summary = [['Metric', 'Value'], ...artifact.metrics.map((m) => [m.label, m.value])];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summary), 'Summary');
  }
  const out = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${fileBase(artifact)}.xlsx`);
};

export const exportArtifactPdf = (artifact) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const marginX = 40;
  let y = 50;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(26, 58, 95);
  doc.text(String(artifact?.title || 'Report'), marginX, y);
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 100, 110);
  if (artifact?.summary) {
    const wrapped = doc.splitTextToSize(String(artifact.summary), 515);
    doc.text(wrapped, marginX, y);
    y += wrapped.length * 13 + 4;
  }
  doc.text(`Generated: ${new Date(artifact?.generatedAt || Date.now()).toLocaleString()}`, marginX, y);
  y += 6;
  if (artifact?.metrics?.length) {
    autoTable(doc, {
      startY: y + 10,
      head: [['Metric', 'Value']],
      body: artifact.metrics.map((m) => [m.label, cellText(m.value)]),
      theme: 'grid',
      headStyles: { fillColor: [26, 58, 95] },
      styles: { fontSize: 9 },
      margin: { left: marginX, right: marginX },
    });
    y = doc.lastAutoTable.finalY;
  }
  const cols = columnsOf(artifact);
  if (cols.length && rowsOf(artifact).length) {
    autoTable(doc, {
      startY: y + 16,
      head: [cols.map((c) => c.label)],
      body: rowsOf(artifact).map((r) => cols.map((c) => cellText(r[c.key]))),
      theme: 'striped',
      headStyles: { fillColor: [44, 151, 153] },
      styles: { fontSize: 9 },
      margin: { left: marginX, right: marginX },
    });
  }
  doc.save(`${fileBase(artifact)}.pdf`);
};

export const exportArtifactDocx = async (artifact) => {
  const docx = await import('docx');
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } = docx;
  const cols = columnsOf(artifact);
  const rows = rowsOf(artifact);

  const children = [
    new Paragraph({ text: String(artifact?.title || 'Report'), heading: HeadingLevel.HEADING_1 }),
  ];
  if (artifact?.summary) children.push(new Paragraph({ children: [new TextRun({ text: String(artifact.summary), italics: true })] }));
  children.push(new Paragraph({ children: [new TextRun({ text: `Generated: ${new Date(artifact?.generatedAt || Date.now()).toLocaleString()}`, size: 18, color: '667085' })] }));

  (artifact?.metrics || []).forEach((m) => {
    children.push(new Paragraph({ children: [new TextRun({ text: `${m.label}: `, bold: true }), new TextRun({ text: cellText(m.value) })] }));
  });

  if (cols.length && rows.length) {
    const headerRow = new TableRow({
      children: cols.map((c) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: c.label, bold: true })] })] })),
    });
    const bodyRows = rows.map((r) => new TableRow({
      children: cols.map((c) => new TableCell({ children: [new Paragraph(cellText(r[c.key]))] })),
    }));
    children.push(new Paragraph({ text: '' }));
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...bodyRows] }));
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fileBase(artifact)}.docx`);
};

export const exportArtifact = (artifact, format) => {
  switch (format) {
    case 'pdf': return exportArtifactPdf(artifact);
    case 'excel': return exportArtifactExcel(artifact);
    case 'csv': return exportArtifactCsv(artifact);
    case 'docx': return exportArtifactDocx(artifact);
    default: return undefined;
  }
};
