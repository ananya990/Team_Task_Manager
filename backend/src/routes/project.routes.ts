import { Router } from 'express';

import {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/project.controller';

import {
  authenticate,
  validate,
} from '../middlewares/index';

import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from '../validators/index';

const projectRouter = Router();

projectRouter.use(authenticate as any);

projectRouter.get('/', getProjects as any);

projectRouter.post(
  '/',
  validate(createProjectSchema),
  createProject as any
);

projectRouter.get('/:id', getProject as any);

projectRouter.put(
  '/:id',
  validate(updateProjectSchema),
  updateProject as any
);

projectRouter.delete('/:id', deleteProject as any);

projectRouter.post(
  '/:id/members',
  validate(addMemberSchema),
  addMember as any
);

projectRouter.delete(
  '/:id/members/:userId',
  removeMember as any
);

export default projectRouter;