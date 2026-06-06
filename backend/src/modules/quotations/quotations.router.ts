import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createQuotationSchema, updateQuotationSchema, selectQuotationSchema } from './quotations.schema';
import * as ctrl from './quotations.controller';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.get('/compare/:rfqId', authorize(['ADMIN', 'OFFICER']), ctrl.compare);
router.post('/', authorize(['VENDOR']), validate(createQuotationSchema), ctrl.submit);
router.patch('/:id', authorize(['VENDOR']), validate(updateQuotationSchema), ctrl.update);
router.post('/select', authorize(['ADMIN', 'OFFICER']), validate(selectQuotationSchema), ctrl.select);

export default router;
