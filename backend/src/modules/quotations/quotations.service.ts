import { db } from '../../config/database';
import { generateQuotationNumber } from '../../utils/generateNumber';
import { logAction } from '../../services/audit.service';

export async function listQuotations(userId: string, role: string) {
  if (role === 'VENDOR') {
    const user = await db.user.findUnique({ where: { id: userId } });
    const vendor = await db.vendor.findUnique({ where: { email: user!.email } });
    if (!vendor) return [];
    return db.quotation.findMany({ where: { vendorId: vendor.id }, include: { rfq: true, vendor: true } });
  }
  return db.quotation.findMany({ include: { rfq: true, vendor: true } });
}

export async function getComparisonMatrix(rfqId: string) {
  const rfq = await db.rfq.findUnique({ where: { id: rfqId } });
  if (!rfq) throw new Error('RFQ not found.');

  const quotations = await db.quotation.findMany({
    where: { rfqId },
    include: { vendor: true },
    orderBy: { amount: 'asc' },
  });

  const minAmount = quotations.length > 0 ? quotations[0].amount : null;

  return {
    rfq,
    quotations: quotations.map((q) => ({
      ...q,
      companyName: q.vendor.companyName,
      vendorRating: Number(q.vendor.rating),
      amount: Number(q.amount),
      isLowestPrice: minAmount !== null && q.amount.equals(minAmount),
    })),
  };
}

export async function submitQuotation(data: any, userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });
  const vendor = await db.vendor.findUnique({ where: { email: user!.email } });
  if (!vendor) throw new Error('No vendor profile linked to this account.');

  const quotationNumber = await generateQuotationNumber();
  const quotation = await db.quotation.create({
    data: {
      quotationNumber,
      rfqId: data.rfqId,
      vendorId: vendor.id,
      amount: data.amount,
      deliveryTime: data.deliveryTime,
      remarks: data.remarks,
    },
  });
  await logAction('QUOTATION_SUBMITTED', `Quotation ${quotationNumber} submitted.`, userId);
  return quotation;
}

export async function updateQuotation(quotationId: string, data: any, userId: string) {
  const quotation = await db.quotation.findUnique({ where: { id: quotationId } });
  if (!quotation) throw new Error('Quotation not found.');
  if (quotation.status !== 'Submitted') {
    throw new Error('Only quotations in Submitted status can be edited.');
  }
  // Verify ownership — vendor can only edit their own quotation
  const user = await db.user.findUnique({ where: { id: userId } });
  const vendor = await db.vendor.findUnique({ where: { email: user!.email } });
  if (!vendor || quotation.vendorId !== vendor.id) {
    throw new Error('You can only edit your own quotations.');
  }
  const updated = await db.quotation.update({ where: { id: quotationId }, data });
  await logAction('QUOTATION_UPDATED', `Quotation ${quotation.quotationNumber} updated by vendor.`, userId);
  return updated;
}

export async function selectQuotation(quotationId: string, approverId: string) {
  const quotation = await db.quotation.findUnique({ where: { id: quotationId } });
  if (!quotation) throw new Error('Quotation not found.');

  await db.quotation.update({ where: { id: quotationId }, data: { status: 'Under_Review' } });

  const approval = await db.approval.create({
    data: { quotationId, approverId, status: 'Pending' },
  });

  await logAction('QUOTATION_SELECTED', `Quotation ${quotationId} nominated for approval.`, approverId);
  return { approvalId: approval.id };
}
