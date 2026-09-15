// @ts-ignore
import html2pdf from 'html2pdf.js';

export interface PdfExportOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
}

export const generatePdfFromElement = async (
  element: HTMLElement, 
  filename: string = 'document.pdf'
): Promise<void> => {
  const sanitizedFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  const opt = {
    margin: [8, 10, 8, 10], // mm
    filename: sanitizedFilename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      logging: false,
      scrollY: 0
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break',
      avoid: '.keep-together'
    }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('Error generating PDF via html2pdf, falling back to window.print', error);
    window.print();
  }
};

export const triggerNativePrint = (): void => {
  window.print();
};

