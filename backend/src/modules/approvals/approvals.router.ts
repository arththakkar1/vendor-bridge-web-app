import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { actionSchema } from './approvals.schema';
import * as ctrl from './approvals.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorize(['ADMIN', 'MANAGER']), ctrl.list);
router.get('/:id', authorize(['ADMIN', 'MANAGER', 'OFFICER']), ctrl.get);
router.get('/:id/timeline', authorize(['ADMIN', 'MANAGER', 'OFFICER']), ctrl.timeline);
router.post('/:id/action', authorize(['ADMIN', 'MANAGER']), validate(actionSchema), ctrl.action);

export default router;
