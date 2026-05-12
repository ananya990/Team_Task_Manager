// src/types/index.ts
import { Request } from 'express';
import { Document, Types } from 'mongoose';

export type UserRole = 'admin' | 'member';
export type ProjectStatus = 'active' | 'completed' | 'archived';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ActivityType =
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_assigned'
  | 'project_created'
  | 'project_updated'
  | 'member_added'
  | 'member_removed'
  | 'comment_added';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IProject extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: ProjectStatus;
  owner: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  assignedTo?: Types.ObjectId;
  project: Types.ObjectId;
  createdBy: Types.ObjectId;
  tags: string[];
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttachment {
  filename: string;
  url: string;
  size: number;
  uploadedAt: Date;
}

export interface IActivity extends Document {
  _id: Types.ObjectId;
  type: ActivityType;
  user: Types.ObjectId;
  project?: Types.ObjectId;
  task?: Types.ObjectId;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface IRefreshToken extends Document {
  token: string;
  user: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}