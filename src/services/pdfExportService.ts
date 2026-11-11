import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { toJpeg } from 'html-to-image';
import { CompanyAnalysis } from '../types';

export const exportAnalysisToPdf = async (
  elementId: string,
  data: CompanyAnalysis,
  onProgress?: (status: string) => void
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Analysis report container not found');
  }

  onProgress?.('Preparing high-resolution snapshot...');

  let imgData: string;
  let canvasWidth: number;
  let canvasHeight: number;

  try {
    // Primary engine: html2canvas-pro with full oklch, lab, lch, and modern CSS color support
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#0f172a', // Matching dashboard slate-900 background
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      ignoreElements: (el) => {
        // Ignore interactive buttons, watchlist triggers, or export buttons in the PDF
        return el.getAttribute('data-pdf-ignore') === 'true';
      },
    });

    imgData = canvas.toDataURL('image/jpeg', 0.95);
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
  } catch (canvasErr) {
    console.warn('html2canvas-pro capture encountered an error, falling back to html-to-image:', canvasErr);
    onProgress?.('Rendering fallback snapshot...');

    imgData = await toJpeg(element, {
      quality: 0.95,
      backgroundColor: '#0f172a',
      pixelRatio: 2,
      filter: (node) => {
        if (node instanceof HTMLElement && node.getAttribute('data-pdf-ignore') === 'true') {
          return false;
        }
        return true;
      },
    });

    // Determine dimensions from temporary image
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imgData;
    });

    canvasWidth = img.naturalWidth || element.scrollWidth * 2;
    canvasHeight = img.naturalHeight || element.scrollHeight * 2;
  }

  onProgress?.('Generating PDF document...');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;

  let heightLeft = imgHeight;
  let position = 0;

  // Add first page
  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // Add subsequent pages if the content spans across multiple pages
  let pageNumber = 1;
  while (heightLeft > 0) {
    position = -(pageNumber * pdfHeight);
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
    pageNumber++;
  }

  // Footer metadata on each page
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184); // Slate 400
    pdf.text(
      `${data.name} (${data.symbol}) — Quantitative Research Report · Generated ${new Date().toLocaleDateString('en-GB')}`,
      10,
      pdfHeight - 6
    );
    pdf.text(`Page ${i} of ${totalPages}`, pdfWidth - 25, pdfHeight - 6);
  }

  const cleanSymbol = data.symbol.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${cleanSymbol}_Analysis_Report_${dateStr}.pdf`;

  pdf.save(filename);
};
