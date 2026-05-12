import { Router } from 'express';

import {
  getStats,
  getActivity,
} from '../controllers/dashboard.controller';

import { authenticate } from '../middlewares/index';

const dashRouter = Router();

dashRouter.use(authenticate as any);

dashRouter.get('/stats', getStats as any);
dashRouter.get('/activity', getActivity as any);

export default dashRouter;