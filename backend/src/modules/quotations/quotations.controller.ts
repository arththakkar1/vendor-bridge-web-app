import { Request, Response } from 'express';
import * as svc from './quotations.service';

export async function list(req: Request, res: Response) {
  try {
    const quotations = await svc.listQuotations(req.user!.userId, req.user!.role);
    res.json({ success: true, quotations });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function compare(req: Request, res: Response) {
  try {
    const result = await svc.getComparisonMatrix(req.params.rfqId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
}

export async function submit(req: Request, res: Response) {
  try {
    const quotation = await svc.submitQuotation(req.body, req.user!.userId);
    res.status(201).json({ success: true, quotation });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function select(req: Request, res: Response) {
  try {
    const result = await svc.selectQuotation(req.body.quotationId, req.user!.userId);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const quotation = await svc.updateQuotation(req.params.id, req.body, req.user!.userId);
    res.json({ success: true, quotation });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
