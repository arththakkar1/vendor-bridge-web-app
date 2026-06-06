import PDFDocument from 'pdfkit';

export function generateInvoicePdf(invoice: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const po = invoice.purchaseOrder;
    const vendor = po.vendor;
    const subtotal = Number(invoice.totalAmount) - Number(invoice.taxAmount);
    const cgst = Number(invoice.taxAmount) / 2;
    const sgst = Number(invoice.taxAmount) / 2;

    doc.fontSize(20).text('VendorBridge', { align: 'center' });
    doc.fontSize(14).text('TAX INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Invoice No: ${invoice.invoiceNumber}`);
    doc.text(`PO No: ${po.poNumber}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Vendor: ${vendor.companyName}`);
    doc.text(`GST No: ${vendor.gstNumber}`);
    doc.text(`Contact: ${vendor.contactName} | ${vendor.email}`);
    doc.moveDown();
    doc.text(`Subtotal:   ₹${subtotal.toFixed(2)}`);
    doc.text(`CGST (9%):  ₹${cgst.toFixed(2)}`);
    doc.text(`SGST (9%):  ₹${sgst.toFixed(2)}`);
    doc.fontSize(12).text(`Grand Total: ₹${Number(invoice.totalAmount).toFixed(2)}`, { underline: true });
    doc.moveDown();
    doc.fontSize(10).text(`Status: ${invoice.status}`);

    doc.end();
  });
}

export function generatePoPdf(po: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const vendor = po.vendor;
    const rfq = po.quotation?.rfq;

    doc.fontSize(20).text('VendorBridge', { align: 'center' });
    doc.fontSize(14).text('PURCHASE ORDER', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`PO No: ${po.poNumber}`);
    doc.text(`Date: ${new Date(po.createdAt).toLocaleDateString()}`);
    doc.text(`Status: ${po.status}`);
    doc.moveDown();
    doc.text(`Vendor: ${vendor.companyName}`);
    doc.text(`GST No: ${vendor.gstNumber}`);
    if (rfq) doc.text(`RFQ: ${rfq.rfqNumber} — ${rfq.title}`);
    doc.moveDown();
    doc.fontSize(12).text(`Total Amount: ₹${Number(po.totalAmount).toFixed(2)}`, { underline: true });

    doc.end();
  });
}
