import { z } from 'zod';

export const createQuotationSchema = z.object({
  rfqId: z.string().uuid(),
  amount: z.number().positive(),
  deliveryTime: z.number().int().positive(),
  remarks: z.string().optional(),
});

// Vendors can edit a quotation while it is still in 'Submitted' status
export const updateQuotationSchema = z.object({
  amount: z.number().positive().optional(),
  deliveryTime: z.number().int().positive().optional(),
  remarks: z.string().optional(),
});

export const selectQuotationSchema = z.object({
  quotationId: z.string().uuid(),
});
