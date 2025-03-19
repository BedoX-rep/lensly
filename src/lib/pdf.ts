
import html2pdf from 'html2pdf.js';

interface PDFOptions {
  margin?: number;
  filename: string;
  image?: { type: string; quality: number };
  html2canvas?: { scale: number; logging: boolean };
  jsPDF?: { unit: string; format: string; orientation: string };
}

export const generatePDF = async (htmlElement: HTMLElement, filename: string) => {
  const options: PDFOptions = {
    margin: 1,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, logging: false },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(options).from(htmlElement).save();
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    return false;
  }
};
