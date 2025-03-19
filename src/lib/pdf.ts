
import html2pdf from 'html2pdf.js';
import { ReceiptDetails } from '@/types';

const generateReceiptHTML = (receipt: ReceiptDetails) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt #${receipt.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .details { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .prescription { margin: 20px 0; }
          .summary { margin-top: 20px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Receipt #${receipt.id}</h2>
        </div>
        <div class="details">
          <p><strong>Client:</strong> ${receipt.clientName}</p>
          <p><strong>Date:</strong> ${receipt.date}</p>
          <p><strong>Phone:</strong> ${receipt.phone}</p>
        </div>
        <div class="prescription">
          <h3>Prescription</h3>
          <table>
            <tr>
              <th></th>
              <th>SPH</th>
              <th>CYL</th>
              <th>AXE</th>
            </tr>
            <tr>
              <td><strong>Right Eye</strong></td>
              <td>${receipt.prescription.rightEye.sph}</td>
              <td>${receipt.prescription.rightEye.cyl}</td>
              <td>${receipt.prescription.rightEye.axe}</td>
            </tr>
            <tr>
              <td><strong>Left Eye</strong></td>
              <td>${receipt.prescription.leftEye.sph}</td>
              <td>${receipt.prescription.leftEye.cyl}</td>
              <td>${receipt.prescription.leftEye.axe}</td>
            </tr>
          </table>
        </div>
        <div>
          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${receipt.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="summary">
          <p><strong>Subtotal:</strong> $${receipt.subtotal.toFixed(2)}</p>
          <p><strong>Tax:</strong> $${receipt.tax.toFixed(2)}</p>
          <p><strong>Discount:</strong> $${receipt.discount.toFixed(2)}</p>
          <p><strong>Total:</strong> $${receipt.total.toFixed(2)}</p>
          <p><strong>Advance Payment:</strong> $${receipt.advancePayment.toFixed(2)}</p>
          <p><strong>Balance:</strong> $${receipt.balance.toFixed(2)}</p>
        </div>
      </body>
    </html>
  `;
};

export const downloadReceipt = async (receipt: ReceiptDetails) => {
  const htmlContent = generateReceiptHTML(receipt);
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  
  const options = {
    margin: 1,
    filename: `receipt-${receipt.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(options).from(element).save();
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export const printReceipt = (receipt: ReceiptDetails) => {
  const htmlContent = generateReceiptHTML(receipt);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.onafterprint = () => printWindow.close();
  }, 250);
  
  return true;
};
