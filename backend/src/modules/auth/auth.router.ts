import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema';
import * as ctrl from './auth.controller';

const router = Router();

router.post('/register', validate(registerSchema), ctrl.registerHandler);
router.post('/login', validate(loginSchema), ctrl.loginHandler);
router.post('/logout', authenticate, ctrl.logoutHandler);
router.get('/me', authenticate, ctrl.meHandler);
router.post('/forgot-password', validate(forgotPasswordSchema), ctrl.forgotPasswordHandler);
router.post('/reset-password', validate(resetPasswordSchema), ctrl.resetPasswordHandler);

export default router;
