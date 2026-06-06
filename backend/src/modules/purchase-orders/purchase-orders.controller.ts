import { Request, Response } from 'express';
import { db } from '../../config/database';

export async function list(req: Request, res: Response) {
  try {
    const where: any = {};
    if (req.user!.role === 'VENDOR') {
      const user = await db.user.findUnique({ where: { id: req.user!.userId } });
      const vendor = await db.vendor.findUnique({ where: { email: user!.email } });
      if (vendor) where.vendorId = vendor.id;
    }
    const pos = await db.purchaseOrder.findMany({ where, include: { vendor: true, quotation: true } });
    res.json({ success: true, purchaseOrders: pos });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function get(req: Request, res: Response) {
  try {
    const po = await db.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: { vendor: true, quotation: { include: { rfq: true } } },
    });
    if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    res.json({ success: true, purchaseOrder: po });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function downloadPdf(req: Request, res: Response) {
  try {
    const po = await db.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: { vendor: true, quotation: { include: { rfq: true } } },
    });
    if (!po) return res.status(404).json({ success: false, message: 'Purchase order not found.' });

    // Use pdf.service.ts (see Section 15 for full pdfkit implementation)
    const { generatePoPdf } = await import('../../services/pdf.service');
    const pdfBuffer = await generatePoPdf(po as any);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${po.poNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
