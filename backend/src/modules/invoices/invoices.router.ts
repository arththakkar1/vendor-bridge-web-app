import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import * as ctrl from './invoices.controller';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
// Stream invoice as PDF (download / print) — Content-Type: application/pdf
router.get('/:id/pdf', ctrl.downloadPdf);
router.patch('/:id/pay', authorize(['ADMIN', 'OFFICER']), ctrl.markPaid);
// Send invoice PDF to vendor email (MVP requirement)
router.post('/:id/email', authorize(['ADMIN', 'OFFICER']), ctrl.emailInvoice);

export default router;
