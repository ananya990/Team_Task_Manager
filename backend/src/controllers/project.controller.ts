// src/controllers/project.controller.ts
import { Response } from 'express';
import { Project } from '../models/index';
import { Activity } from '../models/index';
import { User } from '../models/User';
import { sendSuccess, sendError } from "../utils/helpers";
import { parsePagination, buildPaginationMeta } from "../utils/pagination";
import { AuthenticatedRequest } from '../types';

export async function getProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { page, limit } = parsePagination(req.query as Record<string, unknown>);
  const { status, search } = req.query as Record<string, string>;
  const userId = req.user!.id;
  const isAdmin = req.user!.role === 'admin';

  const filter: Record<string, unknown> = isAdmin
    ? {}
    : { $or: [{ owner: userId }, { members: userId }] };

  if (status) filter.status = status;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Project.countDocuments(filter),
  ]);

  sendSuccess(res, { projects, pagination: buildPaginationMeta(total, { page, limit }) });
}

export async function createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { title, description, status, members } = req.body;
  const ownerId = req.user!.id;

  const project = await Project.create({
    title,
    description,
    status,
    owner: ownerId,
    members: [...new Set([ownerId, ...(members || [])])],
  });

  await Activity.create({
    type: 'project_created',
    user: ownerId,
    project: project._id,
    message: `Created project "${title}"`,
  });

  const populated = await project.populate([
    { path: 'owner', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' },
  ]);

  sendSuccess(res, { project: populated }, 'Project created', 201);
}

export async function getProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email avatar role')
    .populate('members', 'name email avatar role');

  if (!project) {
    sendError(res, 'Project not found', 404);
    return;
  }

  const userId = req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  const isMember =
    project.owner._id.toString() === userId ||
    project.members.some((m) => m._id.toString() === userId);

  if (!isAdmin && !isMember) {
    sendError(res, 'Access denied', 403);
    return;
  }

  sendSuccess(res, { project });
}

export async function updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  const project = await Project.findById(req.params.id);
  if (!project) {
    sendError(res, 'Project not found', 404);
    return;
  }

  const isOwner = project.owner.toString() === req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  if (!isOwner && !isAdmin) {
    sendError(res, 'Only project owner or admin can update', 403);
    return;
  }

  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('owner', 'name email avatar')
    .populate('members', 'name email avatar');

  await Activity.create({
    type: 'project_updated',
    user: req.user!.id,
    project: project._id,
    message: `Updated project "${project.title}"`,
  });

  sendSuccess(res, { project: updated }, 'Project updated');
}

export async function deleteProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  const project = await Project.findById(req.params.id);
  if (!project) {
    sendError(res, 'Project not found', 404);
    return;
  }

  const isOwner = project.owner.toString() === req.user!.id;
  const isAdmin = req.user!.role === 'admin';
  if (!isOwner && !isAdmin) {
    sendError(res, 'Only project owner or admin can delete', 403);
    return;
  }

  await project.deleteOne();
  sendSuccess(res, null, 'Project deleted');
}

export async function addMember(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { userId } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) { sendError(res, 'Project not found', 404); return; }

  const user = await User.findById(userId);
  if (!user) { sendError(res, 'User not found', 404); return; }

  if (project.members.map(String).includes(userId)) {
    sendError(res, 'User is already a member', 409);
    return;
  }

  project.members.push(user._id);
  await project.save();

  await Activity.create({
    type: 'member_added',
    user: req.user!.id,
    project: project._id,
    message: `Added ${user.name} to project`,
  });

  const populated = await project.populate([
    { path: 'owner', select: 'name email avatar' },
    { path: 'members', select: 'name email avatar' },
  ]);

  sendSuccess(res, { project: populated }, 'Member added');
}

export async function removeMember(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id: projectId, userId } = req.params;
  const project = await Project.findById(projectId);
  if (!project) { sendError(res, 'Project not found', 404); return; }

  project.members = project.members.filter((m) => m.toString() !== userId) as any;
  await project.save();

  sendSuccess(res, null, 'Member removed');
}