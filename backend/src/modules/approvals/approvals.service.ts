import { db } from '../../config/database';
import { logAction } from '../../services/audit.service';
import { generatePoNumber, generateInvoiceNumber } from '../../utils/generateNumber';

export async function listApprovals(role: string) {
  const where = role === 'MANAGER' || role === 'ADMIN' ? { status: 'Pending' as const } : {};
  return db.approval.findMany({
    where,
    include: {
      quotation: { include: { rfq: true, vendor: true } },
      approver: true,
      history: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export async function getApproval(id: string) {
  const approval = await db.approval.findUnique({
    where: { id },
    include: {
      quotation: { include: { rfq: true, vendor: true } },
      approver: true,
      history: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!approval) throw new Error('Approval not found.');
  return approval;
}

export async function getApprovalTimeline(approvalId: string) {
  return db.approvalHistory.findMany({
    where: { approvalId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function processApproval(
  approvalId: string,
  approverId: string,
  action: 'Approved' | 'Rejected',
  remarks: string,
) {
  if (action === 'Rejected') {
    return db.$transaction(async (tx) => {
      const approval = await tx.approval.update({
        where: { id: approvalId },
        data: { status: 'Rejected', remarks },
      });
      // Record timeline entry
      await tx.approvalHistory.create({
        data: {
          approvalId,
          actorId: approverId,
          fromStatus: 'Pending',
          toStatus: 'Rejected',
          remarks,
        },
      });
      await tx.activityLog.create({
        data: {
          userId: approverId,
          actionType: 'APPROVAL_REJECTED',
          details: `Approval ${approvalId} rejected. Remarks: ${remarks}`,
        },
      });
      return { status: 'Rejected', approval };
    });
  }

  // ── APPROVED: Atomic PO + Invoice creation ────────────────────────────────
  return db.$transaction(async (tx) => {
    // 1. Fetch approval with full context
    const approval = await tx.approval.findUniqueOrThrow({
      where: { id: approvalId },
      include: { quotation: { include: { rfq: true, vendor: true } } },
    });

    if (approval.status !== 'Pending') {
      throw new Error('This approval has already been actioned.');
    }

    // 2. Approve the approval record
    await tx.approval.update({
      where: { id: approvalId },
      data: { status: 'Approved', remarks, approverId },
    });

    // 3. Accept the selected quotation
    await tx.quotation.update({
      where: { id: approval.quotationId },
      data: { status: 'Accepted' },
    });

    // 4. Reject all competing quotations for this RFQ
    await tx.quotation.updateMany({
      where: { rfqId: approval.quotation.rfqId, id: { not: approval.quotationId } },
      data: { status: 'Rejected' },
    });

    // 5. Close the RFQ
    await tx.rfq.update({
      where: { id: approval.quotation.rfqId },
      data: { status: 'Closed' },
    });

    // 6 + 7. Generate PO
    const poCount = await tx.purchaseOrder.count();
    const year = new Date().getFullYear();
    const poNumber = `PO-${year}-${String(poCount + 1).padStart(4, '0')}`;

    const purchaseOrder = await tx.purchaseOrder.create({
      data: {
        poNumber,
        quotationId: approval.quotationId,
        vendorId: approval.quotation.vendorId,
        totalAmount: approval.quotation.amount,
        status: 'Issued',
      },
    });

    // 8 + 9. Calculate GST 18% and generate Invoice
    const subtotal = Number(approval.quotation.amount);
    const taxAmount = subtotal * 0.18;
    const grandTotal = subtotal + taxAmount;

    const invoiceCount = await tx.invoice.count();
    const invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        poId: purchaseOrder.id,
        taxAmount,
        totalAmount: grandTotal,
        status: 'Generated',
      },
    });

    // 10. Immutable audit log + approval history
    await tx.approvalHistory.create({
      data: {
        approvalId,
        actorId: approverId,
        fromStatus: 'Pending',
        toStatus: 'Approved',
        remarks,
      },
    });
    await tx.activityLog.create({
      data: {
        userId: approverId,
        actionType: 'PO_GENERATED',
        details: `Approval granted. ${poNumber} and ${invoiceNumber} auto-generated from quotation ${approval.quotation.quotationNumber}.`,
      },
    });

    return {
      status: 'Approved',
      generated: {
        purchaseOrder: { id: purchaseOrder.id, poNumber },
        invoice: { id: invoice.id, invoiceNumber },
      },
    };
  });
}
