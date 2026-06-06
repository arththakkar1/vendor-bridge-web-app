import { db } from '../config/database';

export async function generatePoNumber(): Promise<string> {
  const count = await db.purchaseOrder.count();
  const year = new Date().getFullYear();
  return `PO-${year}-${String(count + 1).padStart(4, '0')}`;
}

export async function generateInvoiceNumber(): Promise<string> {
  const count = await db.invoice.count();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
}

export async function generateRfqNumber(): Promise<string> {
  const count = await db.rfq.count();
  const year = new Date().getFullYear();
  return `RFQ-${year}-${String(count + 1).padStart(4, '0')}`;
}

export async function generateQuotationNumber(): Promise<string> {
  const count = await db.quotation.count();
  const year = new Date().getFullYear();
  return `QT-${year}-${String(count + 1).padStart(4, '0')}`;
}

export async function generateVendorCode(): Promise<string> {
  const count = await db.vendor.count();
  return `VND-${String(count + 1).padStart(3, '0')}`;
}
