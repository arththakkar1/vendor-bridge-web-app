import { Request, Response } from 'express';
import * as svc from './approvals.service';

export async function list(req: Request, res: Response) {
  try {
    const approvals = await svc.listApprovals(req.user!.role);
    res.json({ success: true, approvals });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function get(req: Request, res: Response) {
  try {
    const approval = await svc.getApproval(req.params.id);
    res.json({ success: true, approval });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
}

export async function action(req: Request, res: Response) {
  try {
    const result = await svc.processApproval(
      req.params.id,
      req.user!.userId,
      req.body.action,
      req.body.remarks,
    );
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function timeline(req: Request, res: Response) {
  try {
    const history = await svc.getApprovalTimeline(req.params.id);
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
