import { db } from '../config/database';

export async function logAction(
  actionType: string,
  details: string,
  userId?: string,
): Promise<void> {
  await db.activityLog.create({
    data: {
      userId: userId ?? null,
      actionType,
      details,
    },
  });
}
