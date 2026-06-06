import { Request, Response } from 'express';
import { db } from '../../config/database';
import { logAction } from '../../services/audit.service';

export async function list(req: Request, res: Response) {
  try {
    const invoices = await db.invoice.findMany({ include: { purchaseOrder: { include: { vendor: true } } } });
    res.json({ success: true, invoices });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function get(req: Request, res: Response) {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: req.params.id },
      include: { purchaseOrder: { include: { vendor: true, quotation: true } } },
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const subtotal = Number(invoice.totalAmount) - Number(invoice.taxAmount);
    const cgst = Number(invoice.taxAmount) / 2;
    const sgst = Number(invoice.taxAmount) / 2;

    res.json({
      success: true,
      invoice: {
        ...invoice,
        breakdown: {
          subtotal: subtotal.toFixed(2),
          cgst: cgst.toFixed(2),
          sgst: sgst.toFixed(2),
          taxAmount: Number(invoice.taxAmount).toFixed(2),
          grandTotal: Number(invoice.totalAmount).toFixed(2),
        },
      },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function markPaid(req: Request, res: Response) {
  try {
    const invoice = await db.invoice.update({
      where: { id: req.params.id },
      data: { status: 'Paid' },
    });
    await logAction('INVOICE_PAID', `Invoice ${invoice.invoiceNumber} marked as paid.`, req.user!.userId);
    res.json({ success: true, invoice });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function downloadPdf(req: Request, res: Response) {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: req.params.id },
      include: { purchaseOrder: { include: { vendor: true, quotation: { include: { rfq: true } } } } },
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const { generateInvoicePdf } = await import('../../services/pdf.service');
    const pdfBuffer = await generateInvoicePdf(invoice as any);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function emailInvoice(req: Request, res: Response) {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: req.params.id },
      include: { purchaseOrder: { include: { vendor: true, quotation: { include: { rfq: true } } } } },
    });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const { generateInvoicePdf } = await import('../../services/pdf.service');
    const { sendInvoiceEmail } = await import('../../services/email.service');
    const pdfBuffer = await generateInvoicePdf(invoice as any);

    await sendInvoiceEmail({
      to: invoice.purchaseOrder.vendor.email,
      invoiceNumber: invoice.invoiceNumber,
      pdfBuffer,
    });

    await db.invoice.update({ where: { id: req.params.id }, data: { status: 'Sent' } });
    await logAction('INVOICE_EMAILED', `Invoice ${invoice.invoiceNumber} emailed to ${invoice.purchaseOrder.vendor.email}.`, req.user!.userId);

    res.json({ success: true, message: 'Invoice emailed to vendor.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
