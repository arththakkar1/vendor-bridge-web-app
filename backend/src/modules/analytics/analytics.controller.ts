import { Request, Response } from 'express';
import { db } from '../../config/database';

export async function dashboard(_req: Request, res: Response) {
  try {
    const [totalVendors, activeRfqs, pendingApprovals, totalPurchaseOrders, totalInvoices] =
      await Promise.all([
        db.vendor.count(),
        db.rfq.count({ where: { status: 'Published' } }),
        db.approval.count({ where: { status: 'Pending' } }),
        db.purchaseOrder.count(),
        db.invoice.count(),
      ]);

    const overdueInvoices = await db.invoice.count({ where: { status: { in: ['Generated', 'Sent'] } } });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthlySpendResult = await db.invoice.aggregate({
      where: { createdAt: { gte: monthStart }, status: 'Paid' },
      _sum: { totalAmount: true },
    });

    // Recent purchase orders and invoices for dashboard quick-view
    const [recentPurchaseOrders, recentInvoices, recentRfqs] = await Promise.all([
      db.purchaseOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { vendor: { select: { companyName: true } } },
      }),
      db.invoice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { purchaseOrder: { include: { vendor: { select: { companyName: true } } } } },
      }),
      db.rfq.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, rfqNumber: true, title: true, status: true, deadline: true },
      }),
    ]);

    res.json({
      success: true,
      kpis: {
        totalVendors,
        activeRfqs,
        pendingApprovals,
        totalPurchaseOrders,
        totalInvoices,
        overdueInvoices,
        monthlySpend: String(monthlySpendResult._sum.totalAmount ?? '0.00'),
      },
      recentPurchaseOrders,
      recentInvoices,
      recentRfqs,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function spending(_req: Request, res: Response) {
  try {
    // Aggregate last 6 months
    const results = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);

      const agg = await db.invoice.aggregate({
        where: { createdAt: { gte: start, lt: end } },
        _sum: { totalAmount: true },
      });

      // Also count RFQs and POs created in this month for trend data
      const [rfqCount, poCount] = await Promise.all([
        db.rfq.count({ where: { createdAt: { gte: start, lt: end } } }),
        db.purchaseOrder.count({ where: { createdAt: { gte: start, lt: end } } }),
      ]);

      results.push({
        month: `${year}-${String(month).padStart(2, '0')}`,
        total: String(agg._sum.totalAmount ?? '0.00'),
        rfqCount,
        poCount,
      });
    }
    res.json({ success: true, spending: results });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Vendor performance: total POs, total spend, avg delivery time per vendor
export async function vendorPerformance(_req: Request, res: Response) {
  try {
    const vendors = await db.vendor.findMany({
      include: {
        purchaseOrders: {
          include: { invoices: true },
        },
        quotations: {
          select: { deliveryTime: true },
        },
      },
    });

    const report = vendors.map((v) => {
      const totalPos = v.purchaseOrders.length;
      const totalSpend = v.purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount), 0);
      const avgDelivery = v.quotations.length
        ? v.quotations.reduce((s, q) => s + q.deliveryTime, 0) / v.quotations.length
        : null;
      return {
        vendorId: v.id,
        vendorCode: v.vendorCode,
        companyName: v.companyName,
        category: v.category,
        rating: Number(v.rating),
        totalPurchaseOrders: totalPos,
        totalSpend: totalSpend.toFixed(2),
        avgDeliveryTimeDays: avgDelivery !== null ? Math.round(avgDelivery) : null,
      };
    });

    res.json({ success: true, vendors: report });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// CSV export of vendor performance report
export async function exportVendorPerformanceCsv(_req: Request, res: Response) {
  try {
    const vendors = await db.vendor.findMany({
      include: {
        purchaseOrders: true,
        quotations: { select: { deliveryTime: true } },
      },
    });

    const rows = [
      ['Vendor Code', 'Company Name', 'Category', 'Rating', 'Total POs', 'Total Spend (INR)', 'Avg Delivery (days)'],
      ...vendors.map((v) => {
        const totalPos = v.purchaseOrders.length;
        const totalSpend = v.purchaseOrders.reduce((s, po) => s + Number(po.totalAmount), 0);
        const avgDelivery = v.quotations.length
          ? Math.round(v.quotations.reduce((s, q) => s + q.deliveryTime, 0) / v.quotations.length)
          : '';
        return [v.vendorCode, v.companyName, v.category, String(v.rating), String(totalPos), totalSpend.toFixed(2), String(avgDelivery)];
      }),
    ];

    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="vendor-performance.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// CSV export of procurement statistics (all POs + invoices)
export async function exportProcurementCsv(_req: Request, res: Response) {
  try {
    const pos = await db.purchaseOrder.findMany({
      include: { vendor: true, invoices: true, quotation: { include: { rfq: true } } },
    });

    const rows = [
      ['PO Number', 'Vendor', 'RFQ', 'PO Amount (INR)', 'Invoice Number', 'Invoice Total (INR)', 'Invoice Status', 'Created At'],
      ...pos.map((po) => {
        const inv = po.invoices[0];
        return [
          po.poNumber,
          po.vendor.companyName,
          po.quotation.rfq.rfqNumber,
          Number(po.totalAmount).toFixed(2),
          inv?.invoiceNumber ?? '',
          inv ? Number(inv.totalAmount).toFixed(2) : '',
          inv?.status ?? '',
          new Date(po.createdAt).toLocaleDateString(),
        ];
      }),
    ];

    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="procurement-report.csv"');
    res.send(csv);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
