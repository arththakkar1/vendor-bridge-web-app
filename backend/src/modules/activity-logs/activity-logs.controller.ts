import { Request, Response } from 'express';
import { db } from '../../config/database';

export async function list(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.actionType) where.actionType = req.query.actionType;
    if (req.query.userId) where.userId = req.query.userId;

    const [logs, total] = await Promise.all([
      db.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      db.activityLog.count({ where }),
    ]);

    res.json({
      success: true,
      logs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
