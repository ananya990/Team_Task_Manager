import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { TaskPriority, TaskStatus, ProjectStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return format(d, 'MMM d, yyyy · h:mm a');
}

export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Returns null when date is absent or invalid — callers must handle the null.
 *
 * Timezone fix: YYYY-MM-DD strings from <input type="date"> are parsed as
 * LOCAL noon (not UTC midnight) so the displayed day never shifts backward.
 */
export function formatDueDate(
  date: string | Date | null | undefined
): { text: string; isOverdue: boolean; isUrgent: boolean } | null {
  if (!date) return null;

  let d: Date;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    // "2025-06-15"  →  local noon to avoid UTC-offset day-shift
    const [year, month, day] = date.split('-').map(Number);
    d = new Date(year, month - 1, day, 12, 0, 0);
  } else {
    d = new Date(date as string);
  }

  if (isNaN(d.getTime())) return null;

  const overdue = isPast(d) && !isToday(d);
  const urgent  = isToday(d) || isTomorrow(d);

  let text = format(d, 'MMM d');
  if (isToday(d))       text = 'Today';
  else if (isTomorrow(d)) text = 'Tomorrow';
  else if (overdue)     text = `Overdue · ${format(d, 'MMM d')}`;

  return { text, isOverdue: overdue, isUrgent: urgent };
}

export function getPriorityConfig(priority: TaskPriority) {
  const configs = {
    low:    { label: 'Low',    className: 'priority-low',    dot: 'bg-emerald-500' },
    medium: { label: 'Medium', className: 'priority-medium', dot: 'bg-amber-500'   },
    high:   { label: 'High',   className: 'priority-high',   dot: 'bg-orange-500'  },
    urgent: { label: 'Urgent', className: 'priority-urgent', dot: 'bg-rose-500'    },
  };
  return configs[priority] ?? configs.medium;
}

export function getStatusConfig(status: TaskStatus) {
  const configs = {
    todo:        { label: 'To Do',       className: 'status-todo',        color: '#94a3b8' },
    in_progress: { label: 'In Progress', className: 'status-in_progress', color: '#6172f3' },
    review:      { label: 'Review',      className: 'status-review',      color: '#f59e0b' },
    completed:   { label: 'Completed',   className: 'status-completed',   color: '#10b981' },
  };
  return configs[status] ?? configs.todo;
}

export function getProjectStatusConfig(status: ProjectStatus) {
  const configs = {
    active:    { label: 'Active',    className: 'status-in_progress' },
    completed: { label: 'Completed', className: 'status-completed'   },
    archived:  { label: 'Archived',  className: 'status-todo'        },
  };
  return configs[status] ?? configs.active;
}

export function getInitials(name: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length = 50): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

// ─── Validation schemas (frontend) ───────────────────────────────────────────
import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  role: z.enum(['admin', 'member']).optional().default('member'),
});

export const projectSchema = z.object({
  title:       z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  status:      z.enum(['active', 'completed', 'archived']).default('active'),
  members:     z.array(z.string()).optional().default([]),
});

export const profileSchema = z.object({
  name:   z.string().min(2, 'Name must be at least 2 characters').max(100),
  avatar: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type LoginInput    = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProjectInput  = z.infer<typeof projectSchema>;
export type ProfileInput  = z.infer<typeof profileSchema>;