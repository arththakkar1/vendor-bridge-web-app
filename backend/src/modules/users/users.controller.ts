import { Request, Response } from 'express';
import { db } from '../../config/database';

export async function getUsersHandler(req: Request, res: Response) {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: { select: { roleName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const mappedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role.roleName,
      status: 'Active',
      lastActive: u.createdAt
    }));

    res.json({ success: true, data: mappedUsers });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
}
