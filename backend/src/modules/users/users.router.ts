import { Router } from 'express';
import { getUsersHandler } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';

const router = Router();

// Only ADMIN can view/manage users
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', getUsersHandler);

export default router;
