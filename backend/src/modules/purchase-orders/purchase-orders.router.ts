import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import * as ctrl from './purchase-orders.controller';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
// Stream PO as PDF — Content-Type: application/pdf
router.get('/:id/pdf', ctrl.downloadPdf);

export default router;
