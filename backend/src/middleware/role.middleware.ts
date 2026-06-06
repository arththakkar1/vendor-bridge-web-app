import { SystemRole } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

export function authorize(allowedRoles: SystemRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role as SystemRole;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${role}' cannot perform this action.`,
      });
    }
    next();
  };
}
