import { z } from 'zod';

export const actionSchema = z.object({
  action: z.enum(['Approved', 'Rejected']),
  remarks: z.string().min(1),
});
