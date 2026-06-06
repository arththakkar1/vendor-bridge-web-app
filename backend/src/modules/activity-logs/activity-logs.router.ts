import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { list } from './activity-logs.controller';

const router = Router();
router.use(authenticate);
router.get('/', authorize(['ADMIN', 'OFFICER']), list);

export default router;
