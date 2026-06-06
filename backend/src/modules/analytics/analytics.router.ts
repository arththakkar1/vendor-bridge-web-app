import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import * as ctrl from './analytics.controller';

const router = Router();
router.use(authenticate);
router.use(authorize(['ADMIN', 'OFFICER', 'MANAGER']));

router.get('/dashboard', ctrl.dashboard);
router.get('/spending', ctrl.spending);
router.get('/vendor-performance', ctrl.vendorPerformance);
router.get('/export/vendor-performance', ctrl.exportVendorPerformanceCsv);
router.get('/export/procurement', ctrl.exportProcurementCsv);

export default router;
