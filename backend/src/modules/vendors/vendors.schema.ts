import { z } from 'zod';

export const createVendorSchema = z.object({
  companyName: z.string().min(2).max(150),
  contactName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  gstNumber: z.string().min(15).max(15),
  category: z.string().min(2).max(50),
  address: z.string().min(5),
});

export const updateStatusSchema = z.object({
  status: z.enum(['Active', 'Pending', 'Blocked']),
});

export const updateRatingSchema = z.object({
  rating: z.number().min(0).max(5),
});
