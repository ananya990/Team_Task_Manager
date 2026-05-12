import { Response } from 'express';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { Activity } from '../models/Activity';
import { sendSuccess, sendError } from '../utils/helpers';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { AuthenticatedRequest } from '../types';

/**
 * Safely convert a dueDate value coming from the request body into either
 * a valid Date object or null.  Rejects strings that produce NaN.
 */
function parseDueDate(raw: unknown): Date | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;

  // YYYY-MM-DD  →  treat as local noon to avoid timezone flipping the day
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-').map(Number);
    const d = new Date(year, month - 1, day, 12, 0, 0);
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(raw as string);
  return isNaN(d.getTime()) ? null : d;
}

export async function getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { page, limit } = parsePagination(req.query as Record<string, unknown>);
  const { status, priority, project, assignedTo, search } = req.query as Record<string, string>;
  const userId = req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  const filter: Record<string, unknown> = {};

  if (!isAdmin) {
    const userProjects = await Project.find({ $or: [{ owner: userId }, { members: userId }] }).select('_id');
    filter.project = { $in: userProjects.map((p) => p._id) };
  }
  if (project) filter.project = project;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'title status')
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Task.countDocuments(filter),
  ]);
  sendSuccess(res, { tasks, pagination: buildPaginationMeta(total, { page, limit }) });
}

export async function createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { title, description, status, priority, dueDate, assignedTo, project, tags } = req.body;
  const userId = req.user!.id;

  const proj = await Project.findById(project);
  if (!proj) { sendError(res, 'Project not found', 404); return; }

  const isAdmin = req.user!.role === 'admin';
  const isMember = proj.owner.toString() === userId || proj.members.map(String).includes(userId);
  if (!isAdmin && !isMember) { sendError(res, 'Access denied', 403); return; }

  // Safely parse dueDate — never let an invalid string reach Mongoose
  const parsedDueDate = parseDueDate(dueDate);

  const task = await Task.create({
    title,
    description: description || undefined,
    status: status || 'todo',
    priority: priority || 'medium',
    dueDate: parsedDueDate,                         // Date | null — always safe
    assignedTo: assignedTo || null,
    project,
    createdBy: userId,
    tags: Array.isArray(tags) ? tags : [],
  });

  await Activity.create({
    type: 'task_created',
    user: userId,
    project,
    task: task._id,
    message: `Created task "${title}"`,
  });

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
    { path: 'project', select: 'title status' },
  ]);
  sendSuccess(res, { task: populated }, 'Task created', 201);
}

export async function getTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'title status owner members');
  if (!task) { sendError(res, 'Task not found', 404); return; }
  sendSuccess(res, { task });
}

export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const task = await Task.findById(req.params.id);
  if (!task) { sendError(res, 'Task not found', 404); return; }

  const userId = req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  const isCreator = task.createdBy.toString() === userId;
  const isAssignee = task.assignedTo?.toString() === userId;
  if (!isAdmin && !isCreator && !isAssignee) { sendError(res, 'Access denied', 403); return; }

  // Build update object, parsing dueDate safely
  const updateData: Record<string, unknown> = { ...req.body };
  if ('dueDate' in req.body) {
    updateData.dueDate = parseDueDate(req.body.dueDate);
  }
  if ('assignedTo' in req.body) {
    updateData.assignedTo = req.body.assignedTo || null;
  }

  const prevStatus = task.status;
  const updated = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'title status');

  const type =
    updateData.status === 'completed' && prevStatus !== 'completed'
      ? 'task_completed'
      : 'task_updated';

  await Activity.create({
    type,
    user: userId,
    project: task.project,
    task: task._id,
    message: `Updated task "${task.title}"`,
  });

  sendSuccess(res, { task: updated }, 'Task updated');
}

export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const task = await Task.findById(req.params.id);
  if (!task) { sendError(res, 'Task not found', 404); return; }

  const isAdmin = req.user!.role === 'admin';
  const isCreator = task.createdBy.toString() === req.user!.id;
  if (!isAdmin && !isCreator) { sendError(res, 'Forbidden', 403); return; }

  await task.deleteOne();
  sendSuccess(res, null, 'Task deleted');
}