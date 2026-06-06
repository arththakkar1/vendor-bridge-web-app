import { z } from 'zod';

export const createRfqSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().optional(),
  category: z.string().min(2).max(50),
  deadline: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  status: z.enum(['Draft', 'Published']).default('Draft'),
  // Line items — at least one product/service required when publishing
  items: z.array(z.object({
    description: z.string().min(1).max(255),
    quantity: z.number().positive(),
    unit: z.string().default('units'),
  })).optional(),
  // Comma-separated attachment paths / storage keys (upload handled separately via multipart endpoint)
  attachments: z.string().optional(),
  invitedVendorIds: z.array(z.string().uuid()).optional(),
});
