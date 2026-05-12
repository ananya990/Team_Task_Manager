import { Router } from 'express';

import {
  getUsers,
  getUserById,
  updateProfile,
} from '../controllers/dashboard.controller';

import {
  authenticate,
  authorize,
  validate,
} from '../middlewares/index';

import {
  updateProfileSchema,
} from '../validators/index';

const userRouter = Router();

userRouter.use(authenticate as any);

userRouter.get(
  '/',
  authorize('admin') as any,
  getUsers as any
);

userRouter.get('/:id', getUserById as any);

userRouter.put(
  '/profile',
  validate(updateProfileSchema),
  updateProfile as any
);

export default userRouter;