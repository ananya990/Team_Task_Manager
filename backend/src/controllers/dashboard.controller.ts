// src/controllers/dashboard.controller.ts
import { Response } from 'express';
import { Task } from '../models/index';
import { Project } from '../models/index';
import { Activity } from '../models/index';
import { sendSuccess } from '../utils/helpers';
import { AuthenticatedRequest } from '../types';

export async function getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const isAdmin = req.user!.role === 'admin';

  const projectFilter = isAdmin
    ? {}
    : { $or: [{ owner: userId }, { members: userId }] };

  const userProjects = await Project.find(projectFilter).select('_id');
  const projectIds = userProjects.map((p) => p._id);

  const taskFilter = isAdmin ? {} : { project: { $in: projectIds } };
  const assignedFilter = { assignedTo: userId };

  const now = new Date();

  const [
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    overdueTasks,
    assignedTasks,
    tasksByStatus,
    tasksByPriority,
    upcomingDeadlines,
  ] = await Promise.all([
    Project.countDocuments(projectFilter),
    Project.countDocuments({ ...projectFilter, status: 'active' }),
    Task.countDocuments(taskFilter),
    Task.countDocuments({ ...taskFilter, status: 'completed' }),
    Task.countDocuments({ ...taskFilter, dueDate: { $lt: now }, status: { $ne: 'completed' } }),
    Task.countDocuments(assignedFilter),
    Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    Task.find({
      ...taskFilter,
      dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      status: { $ne: 'completed' },
    })
      .populate('assignedTo', 'name avatar')
      .populate('project', 'title')
      .sort({ dueDate: 1 })
      .limit(5),
  ]);

  sendSuccess(res, {
    stats: {
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      assignedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    },
    charts: {
      tasksByStatus,
      tasksByPriority,
    },
    upcomingDeadlines,
  });
}

export async function getActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  const limit = Math.min(50, parseInt(String(req.query.limit || '20'), 10));

  const filter = isAdmin ? {} : { user: userId };

  const activities = await Activity.find(filter)
    .populate('user', 'name email avatar')
    .populate('project', 'title')
    .populate('task', 'title')
    .sort({ createdAt: -1 })
    .limit(limit);

  sendSuccess(res, { activities });
}

// src/controllers/user.controller.ts
import { User } from '../models/User';

export async function getUsers(_req: AuthenticatedRequest, res: Response): Promise<void> {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  sendSuccess(res, { users });
}

export async function getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    import('../utils/helpers').then(({ sendError }) => sendError(res, 'User not found', 404));
    return;
  }
  sendSuccess(res, { user });
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { sendError } = await import('../utils/helpers');
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { name, avatar },
    { new: true }
  ).select('-password');

  if (!user) { sendError(res, 'User not found', 404); return; }
  sendSuccess(res, { user }, 'Profile updated');
}