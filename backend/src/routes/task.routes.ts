import { Router } from 'express';

import {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';

import {
  authenticate,
  validate,
} from '../middlewares/index';

import {
  createTaskSchema,
  updateTaskSchema,
} from '../validators/index';

const taskRouter = Router();

taskRouter.use(authenticate as any);

taskRouter.get('/', getTasks as any);

taskRouter.post(
  '/',
  validate(createTaskSchema),
  createTask as any
);

taskRouter.get('/:id', getTask as any);

taskRouter.put(
  '/:id',
  validate(updateTaskSchema),
  updateTask as any
);

taskRouter.delete('/:id', deleteTask as any);

export default taskRouter;