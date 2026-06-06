import { Request, Response } from 'express';
import * as svc from './rfqs.service';

export async function list(req: Request, res: Response) {
  try {
    const rfqs = await svc.listRfqs(req.user!.userId, req.user!.role);
    res.json({ success: true, rfqs });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function get(req: Request, res: Response) {
  try {
    const rfq = await svc.getRfq(req.params.id);
    res.json({ success: true, rfq });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const rfq = await svc.createRfq(req.body, req.user!.userId);
    res.status(201).json({ success: true, rfq });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const rfq = await svc.updateRfq(req.params.id, req.body);
    res.json({ success: true, rfq });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function publish(req: Request, res: Response) {
  try {
    const rfq = await svc.publishRfq(req.params.id, req.user!.userId);
    res.json({ success: true, rfq });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
