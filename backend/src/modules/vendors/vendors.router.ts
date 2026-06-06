import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createVendorSchema, updateStatusSchema, updateRatingSchema } from './vendors.schema';
import * as ctrl from './vendors.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorize(['ADMIN', 'OFFICER', 'MANAGER']), ctrl.list);
router.get('/:id', authorize(['ADMIN', 'OFFICER', 'MANAGER']), ctrl.get);
router.post('/', authorize(['ADMIN', 'OFFICER']), validate(createVendorSchema), ctrl.create);
router.patch('/:id', authorize(['ADMIN', 'OFFICER']), ctrl.update);
router.patch('/:id/status', authorize(['ADMIN', 'OFFICER']), validate(updateStatusSchema), ctrl.updateStatus);
router.patch('/:id/rating', authorize(['ADMIN', 'OFFICER']), validate(updateRatingSchema), ctrl.updateRating);

export default router;
