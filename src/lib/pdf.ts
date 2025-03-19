
import html2pdf from 'html2pdf.js';

export const generatePDF = async (element: HTMLElement, filename: string) => {
  const options = {
    margin: 1,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, logging: false },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  return html2pdf().set(options).from(element).save();
};
