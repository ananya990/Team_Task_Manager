import { Router } from 'express';

import {
  register,
  login,
  logout,
  refresh,
  me,
} from '../controllers/auth.controller';

import {
  validate,
  authenticate,
} from '../middlewares/index';

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validators/index';

const router = Router();

router.post('/register', validate(registerSchema), register as any);
router.post('/login', validate(loginSchema), login as any);
router.post('/logout', logout as any);
router.post('/refresh', validate(refreshTokenSchema), refresh as any);
router.get('/me', authenticate as any, me as any);

export default router;