import { db } from '../../config/database';
import { generateRfqNumber } from '../../utils/generateNumber';
import { logAction } from '../../services/audit.service';

export async function listRfqs(userId: string, role: string) {
  if (role === 'VENDOR') {
    // Find vendor record linked to this user (by matching user email)
    const user = await db.user.findUnique({ where: { id: userId } });
    const vendor = await db.vendor.findUnique({ where: { email: user!.email } });
    if (!vendor) return [];
    const rfqVendors = await db.rfqVendor.findMany({
      where: { vendorId: vendor.id },
      include: { rfq: true },
    });
    return rfqVendors.map((rv) => rv.rfq);
  }
  return db.rfq.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getRfq(id: string) {
  const rfq = await db.rfq.findUnique({
    where: { id },
    include: {
      rfqVendors: { include: { vendor: true } },
      items: true,
    },
  });
  if (!rfq) throw new Error('RFQ not found.');
  return rfq;
}

export async function createRfq(data: any, userId: string) {
  const rfqNumber = await generateRfqNumber();
  const { invitedVendorIds, items, attachments, ...rfqData } = data;

  const rfq = await db.rfq.create({
    data: {
      ...rfqData,
      rfqNumber,
      createdBy: userId,
      deadline: new Date(rfqData.deadline),
      attachments: attachments ?? null,
      rfqVendors: invitedVendorIds?.length
        ? { create: invitedVendorIds.map((vid: string) => ({ vendorId: vid })) }
        : undefined,
      items: items?.length
        ? { create: items.map((i: any) => ({ description: i.description, quantity: i.quantity, unit: i.unit ?? 'units' })) }
        : undefined,
    },
    include: { items: true, rfqVendors: true },
  });

  await logAction('RFQ_CREATED', `RFQ ${rfqNumber} created.`, userId);
  if (rfq.status === 'Published') {
    await logAction('RFQ_PUBLISHED', `RFQ ${rfqNumber} published.`, userId);
  }

  return rfq;
}

export async function publishRfq(id: string, userId: string) {
  const rfq = await db.rfq.update({ where: { id }, data: { status: 'Published' } });
  await logAction('RFQ_PUBLISHED', `RFQ ${rfq.rfqNumber} published.`, userId);
  return rfq;
}

export async function updateRfq(id: string, data: any) {
  return db.rfq.update({ where: { id }, data });
}
