import { Request, Response } from 'express';
import * as svc from './vendors.service';

export async function list(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await svc.listVendors({
      page, limit,
      search: req.query.search as string,
      status: req.query.status as string,
      category: req.query.category as string,
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function get(req: Request, res: Response) {
  try {
    const vendor = await svc.getVendor(req.params.id);
    res.json({ success: true, vendor });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
}

export async function create(req: Request, res: Response) {
  try {
    const vendor = await svc.createVendor(req.body, req.user!.userId);
    res.status(201).json({ success: true, vendor });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const vendor = await svc.updateVendor(req.params.id, req.body);
    res.json({ success: true, vendor });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function updateStatus(req: Request, res: Response) {
  try {
    const vendor = await svc.updateVendorStatus(req.params.id, req.body.status, req.user!.userId);
    res.json({ success: true, vendor });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function updateRating(req: Request, res: Response) {
  try {
    const vendor = await svc.updateVendorRating(req.params.id, req.body.rating, req.user!.userId);
    res.json({ success: true, vendor });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
}
