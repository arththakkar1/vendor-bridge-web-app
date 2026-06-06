import { db } from '../../config/database';
import { generateVendorCode } from '../../utils/generateNumber';
import { logAction } from '../../services/audit.service';

export async function listVendors(query: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  category?: string;
}) {
  const { page, limit, search, status, category } = query;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { gstNumber: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (status) where.status = status;
  if (category) where.category = category;

  const [vendors, total] = await Promise.all([
    db.vendor.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    db.vendor.count({ where }),
  ]);

  return { vendors, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function getVendor(id: string) {
  const vendor = await db.vendor.findUnique({ where: { id } });
  if (!vendor) throw new Error('Vendor not found.');
  return vendor;
}

export async function createVendor(data: any, actorId: string) {
  const vendorCode = await generateVendorCode();
  const vendor = await db.vendor.create({ data: { ...data, vendorCode } });
  await logAction('VENDOR_CREATED', `Vendor ${vendor.companyName} (${vendorCode}) created.`, actorId);
  return vendor;
}

export async function updateVendor(id: string, data: any) {
  return db.vendor.update({ where: { id }, data });
}

export async function updateVendorStatus(id: string, status: string, actorId: string) {
  const vendor = await db.vendor.update({
    where: { id },
    data: { status: status as any },
  });
  await logAction('VENDOR_STATUS_CHANGED', `Vendor ${id} status set to ${status}.`, actorId);
  return vendor;
}

export async function updateVendorRating(id: string, rating: number, actorId: string) {
  const vendor = await db.vendor.update({
    where: { id },
    data: { rating },
  });
  await logAction('VENDOR_RATING_UPDATED', `Vendor ${id} rating updated to ${rating}.`, actorId);
  return vendor;
}
